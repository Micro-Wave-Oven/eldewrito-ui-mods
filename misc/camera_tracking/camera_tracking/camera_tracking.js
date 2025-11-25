const CAMERA_MODE = {
    NONE: "none",
    LINEAR: "linear",
    BICUBIC: "bicubic",
    SMOOTH_BICUBIC: "smooth_bicubic",
    AKIMA: "akima",
    SMOOTH_AKIMA: "smooth_akima",
    PCH: "piecewisecubic",
    SMOOTH_PCH: "smooth_piecewisecubic",
    STEP: "step",
    DIRECTOR: "director",
};
var currentMode = CAMERA_MODE.NONE;

var positions = [];

var currentStep = 0;
var cameraIntervalMs = 5;
var cameraInterval = undefined;
var startTime = 0;

var animationPaused = false;
var animationPausedButNeedsUpdate = false;
var pauseStartTime = 0;
var loopCamera = false;

var currentPosition = 0;

var amountForward = 1000; //seconds

var dataWindowOpen = false;
var previewingPos = false;

const EPSILON = Number.EPSILON;

var last_camera_options = [];

// Load JQuery UI
$.ajax({
    url: "https://code.jquery.com/ui/1.14.1/jquery-ui.min.js",
    dataType: "script"
});


dew.on('show', async function (event) {
});


dew.on('hide', function () {
});


dew.on("camera-action", function (ev) {
    parseAction(ev.data.action);
});


function parseAction(input) {
    
    let data = input.substring(1).trim().replace(/  +/g, ' ').split(" ");
    let action = data.shift();
    
    console.log("action", action);
    console.log("data", data);
    
    switch (action) {
        
        case "?":
        case "h":
        case "help":
            showHelp();
            break;
        
        
        case "stop":
            camera_end();
            break;
            
            
        case "replay":
            if (last_camera_options.length == 0) {
                dew.notify("chat", { message: "No previous track available", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
                dew.hide();
                return;
            }
            parseCamera(last_camera_options);
            break;
        
        
        case "edit":
            dew.show();
            editWindow();
            break;
        
        
        case "import":
        case "export":
            dew.show();
            dataWindow();
            break;
        
        
        case "list":
            dew.notify("chat", { message: "Positions: ", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
            dew.hide();
            positions.forEach((item, index) => {
                dew.notify("chat", { message: index + " - [" + item.map(function(v, i) { return (i <= 4) ? v.toFixed(3) : v; }) + "]", sender: "Camera", chatType: "DEBUG", color: "#FF9000" })
            });
            break;
        
        
        case "add":
            dew.command('Camera.Position', {}).then(function(response) {
                var tempPos = response.replace(/X|Y|Z|H|V|L|,|:/g, '').trim().replace(/  +/g, ' ').split(" ").map(Number);
                if (data.length == 1) { tempPos.push(data[0]); }
                positions.push(tempPos);
                dew.hide();
                dew.notify("chat", { message: "Added: [" + tempPos.map(function(v, i) { return (i <= 4) ? v.toFixed(3) : v; }) + "]", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
            });
            break;
        
        
        case "mv":
            movePoint(data);
            break;
        
        
        case "del":
            delPoint(data);
            break;
        
        
        case "clear":
            positions = [];
            dew.notify("chat", { message: "Positions cleared.", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
            dew.hide();
            break;
        
        
        case "interval":
            cameraIntervalMs = parseInt(data[0]);
            dew.hide();
            dew.notify("chat", { message: "Camera Interval: " + cameraIntervalMs, sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
            break;
        
        
        case "camera":
            parseCamera(data);
            break;
            
        default:
            dew.notify("chat", { message: "Unrecognised action: " + JSON.stringify({action: action, data: data}), sender: "Camera", chatType: "DEBUG", color: "#FF0000"});
            dew.hide();
            dew.show("chat");
    }
    
}


function parseCamera(curr_command) {
    
    if (curr_command.length == 0) {
        
        dew.hide();
        
        dew.notify("chat", { message: "Camera Help:", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
        
        dew.notify("chat", { message: "- To pause the animation, press P", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
        dew.notify("chat", { message: "- To cancel the animation, press Escape", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
        dew.notify("chat", { message: "- To go forward/backward, use the left/right arrows", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
        dew.notify("chat", { message: "- Default mode is bicubic", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
        
        dew.notify("chat", { message: "- /camera 10", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
        
        dew.notify("chat", { message: "- /camera <b/bi/bicubic> 10", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
        dew.notify("chat", { message: "- /camera <sb/sbi/smooth_bicubic> 10", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
        
        dew.notify("chat", { message: "- /camera <a/ak/aki/akima> 10", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
        dew.notify("chat", { message: "- /camera <sa/sak/saki/smooth_akima> 10", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
        
        dew.notify("chat", { message: "- /camera <p/pc/pch/piecewisecubic> 10", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
        dew.notify("chat", { message: "- /camera <sp/spc/spch/smooth_piecewisecubic> 10", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
        
        dew.notify("chat", { message: "- /camera <l/lerp/linear> 10", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
        dew.notify("chat", { message: "- /camera <l/lerp/linear> dur 4 4 2", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
        
        dew.notify("chat", { message: "- /camera <p/pause> <10 | dur 1 ...>", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
        
        dew.notify("chat", { message: "- /camera <d/dir/director>", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });

        return;
    }
    
    if (positions.length < 2) {
        dew.hide();
        dew.notify("chat", { message: "You need at least two points. Do \"/help\" for more info. Once you have two points, do \"/camera\" for more info.", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
        return;
    }
    
    dew.hide("chat");
    
    last_camera_options = JSON.parse(JSON.stringify(curr_command));
    
    var is_smooth_camera = false;
    var interp_creator_function = undefined;
    
    // Parse camera mode
    switch (curr_command[0]) {
        
        case "b":
        case "bi":
        case "bicubic":
            currentMode = CAMERA_MODE.BICUBIC;
            interp_creator_function = createCubicSplineInterpolator;
            curr_command.shift();
            break;
        
        case "sb":
        case "sbi":
        case "smooth_bicubic":
            currentMode = CAMERA_MODE.SMOOTH_BICUBIC;
            interp_creator_function = createCubicSplineInterpolator;
            is_smooth_camera = true;
            curr_command.shift();
            break;
        
        case "a":
        case "ak":
        case "aki":
        case "akima":
            currentMode = CAMERA_MODE.AKIMA;
            interp_creator_function = createAkimaSplineInterpolator;
            curr_command.shift();
            break;
        
        case "sa":
        case "sak":
        case "saki":
        case "smooth_akima":
            currentMode = CAMERA_MODE.SMOOTH_AKIMA;
            interp_creator_function = createAkimaSplineInterpolator;
            is_smooth_camera = true;
            curr_command.shift();
            break;
        
        case "p":
        case "pc":
        case "pch":
        case "piecewisecubic":
            currentMode = CAMERA_MODE.PCH;
            interp_creator_function = createPiecewiseCubicHermiteInterpolator;
            curr_command.shift();
            break;
        
        case "sp":
        case "spc":
        case "spch":
        case "smooth_piecewisecubic":
            currentMode = CAMERA_MODE.SMOOTH_PCH;
            interp_creator_function = createPiecewiseCubicHermiteInterpolator;
            is_smooth_camera = true;
            curr_command.shift();
            break;
            
        case "l":
        case "lerp":
        case "linear":
            currentMode = CAMERA_MODE.LINEAR;
            curr_command.shift();
            break;
            
        case "p":
        case "pause":
            currentMode = CAMERA_MODE.STEP;
            curr_command.shift();
            break;
            
        case "d":
        case "dir":
        case "director":
            currentMode = CAMERA_MODE.DIRECTOR;
            curr_command.shift();
            break;
        
        default:
            currentMode = CAMERA_MODE.BICUBIC;
            dew.notify("chat", { message: "Unrecognised mode, using bicubic as default.", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
    }
    
    
    dew.show();
    
    // Parse duration(s)
    var durations = [];
    var customDurationsEnabled = (positions.length > 2) && (curr_command[0] == "dur");
    
    if (currentMode != CAMERA_MODE.DIRECTOR && !customDurationsEnabled && (isNaN(curr_command[0]) || !isFinite(curr_command[0])) ) {
        dew.notify("chat", { message: "Duration needs to be a number", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
        camera_end();
        return;
    }
    
    if (customDurationsEnabled) {
        durations = curr_command.splice(1).map(Number);
        
    } else {
        let per_track_dur = parseFloat(curr_command[0]) / (positions.length - 1);
        for (let i = 0; i < (positions.length - 1); i++) {
            durations.push(per_track_dur);
        }
    }
    
    if (durations.length == 0 || durations.length != (positions.length - 1)) {
        dew.notify("chat", { message: "Incorrect number of durations, you have " + (positions.length - 1) + " tracks and " + durations.length + " durations.", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
        camera_end();
        return;
    }
    
    
    loopCamera = curr_command[curr_command.length - 1] == "l" || curr_command[curr_command.length - 1] == "loop";
    
    
    dew.command("Camera.Mode static");
    
    
    // Clear up existing running animation just in case
    clearInterval(cameraInterval);
    cameraInterval = undefined;
    animationPaused = false;
    pauseStartTime = 0;
    
    
    let vals = 0;
    
    
    switch (currentMode) {
        
        case CAMERA_MODE.BICUBIC:
        case CAMERA_MODE.SMOOTH_BICUBIC:
        case CAMERA_MODE.AKIMA:
        case CAMERA_MODE.SMOOTH_AKIMA:
        case CAMERA_MODE.PCH:
        case CAMERA_MODE.SMOOTH_PCH:
            vals = prep_values_interpolator(durations);
            
            if (is_smooth_camera) {
                durations = normalise_durations(durations, vals);
            }
            
            interpolator_camera(interp_creator_function, vals.durations, vals.xPosVals, vals.yPosVals, vals.zPosVals, vals.hPosVals, vals.vPosVals);
            break;
            
        case CAMERA_MODE.LINEAR:
            lerp_camera(durations);
            break;
        
        case CAMERA_MODE.STEP:
            step_camera(durations);
            break;
        
        case CAMERA_MODE.DIRECTOR:
            director_camera(durations);
            break;
        
        default:
            dew.notify("chat", { message: "Undefined mode somehow.", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
            camera_end();
            break;
    }
    
    return;
}

function editWindow() {
    
    if (dataWindowOpen) { return; }
    
    // Create the popup
    $("<div/>")
        .attr('id', 'camera_popup_id')
        .css({
            // General Appearance
            "background": "#142850",
            "border-radius": "4px",
            "padding": "12px",
            "overflow-y": "auto",
            
            // Centered Div
            "position": "absolute",
            "width": "900px",
            "height": "700px",
            "top": "50%",
            "left": "50%",
            "margin": "-350px 0 0 -350px",
            
            // Grid Aspect
            "display": "grid",
            "grid-template-columns": "1fr",
            "grid-template-rows": "24px auto 24px",
            "grid-template-areas": '"Title" "Positions" "Exit"',
            "grid-column-gap": "0px",
            "grid-row-gap": "4px",
        })
        .append([
            // Popup Title
            $('<div/>')
                .text("Points Edit (Drag and Drop to rearrange)")
                .css({
                    "color": "white",
                    "text-align": "center",
                    "grid-area": "Title",
                    "text-decoration": "underline"
                }),
            
            // Positions List
            $('<div/>')
                .addClass("sortableList")
                .css({
                    "grid-area": "Positions",
                    "text-align": "center",
                }),
            
            // Close Button
            $('<button/>')
                .attr('id', 'popup_close_button2')
                .html("Close")
                .css({"grid-area": "Exit"})
                .click(function() {
                    dataWindowOpen = false;
                    document.getElementById("camera_popup_id").outerHTML = "";
                    dew.hide();
                })
        ])
        .appendTo("body");
    
    // Add the points
    $.each(positions, function(i, value) {
        $("<div/>")
            .css({
                "text-align": "center",
                "color": "white",
                "padding-top": "4px",
                "border": "1px solid white",
                "border-radius": "4px",
                "margin-top": "2px",
            })
            .append([
                // Value
                $("<div/>")
                    .addClass("positionText")
                    .css({"display": "inline-block"})
                    .html("X: " + value[0] + " Y: " + value[1] + " Z: " + value[2] + " H: " + value[3] + " V: " + value[4] + ((value.length > 5) ? " Comment: " + value[5]: "")),
                
                // Preview Button
                $("<button/>")
                    .css({
                        "display": "inline-block",
                        "margin-left": "8px",
                    })
                    .html("P")
                    .click(function() {
                        dew.notify("chat", { message: "Previewing position: [" + value + "]", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
                        dew.notify("chat", { message: "Press Escape to leave", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
                        
                        dew.command("Camera.Mode static");
                        dew.command("Camera.Position " + value[0] + " " + value[1] + " " + value[2] + " " + value[3] + " " + value[4]);
                        
                        previewingPos = true;
                        document.getElementById("camera_popup_id").style.visibility = "hidden"; 
                    }),
                
                // Rename Button
                $("<button/>")
                    .css({
                        "display": "inline-block",
                        "margin-left": "8px",
                    })
                    .html("R")
                    .click(function() {
                        var id_to_rename = $(this).parent().index();
                        let new_text = prompt("Enter the new name/comment for this position: " + positions[id_to_rename]);
                        if (new_text != null && new_text != "") {
                            if (positions[id_to_rename].length == 5) {
                                positions[id_to_rename].push(new_text);
                            } else {
                                positions[id_to_rename][5] = new_text;
                            }
                            $(this).parent()
                                .find("div.positionText")
                                .html("X: " + positions[id_to_rename][0] + " Y: " + positions[id_to_rename][1] + " Z: " + positions[id_to_rename][2] + " H: " + positions[id_to_rename][3] + " V: " + positions[id_to_rename][4] + ((positions[id_to_rename].length > 5) ? " Comment: " + positions[id_to_rename][5]: ""));
                        }
                    }),
                
                // Delete Button
                $("<button/>")
                    .addClass("positionDelete")
                    .css({
                        "display": "inline-block",
                        "margin-left": "8px",
                    })
                    .html("X")
            ])
            .appendTo(".sortableList");
    });
    
    
    // Make it Drag and Drop rearrageable
    $('.sortableList').sortable({
        start: function(e, ui) {
            $(this).attr('data-old-index', ui.item.index());
        },
        update: function(e, ui) {
            var newIndex = ui.item.index();
            var oldIndex = $(this).attr('data-old-index');
            $(this).removeAttr('data-old-index');
            
            var tmp_element = positions[oldIndex];
            positions.splice(oldIndex, 1);
            positions.splice(newIndex, 0, tmp_element);
        }
    });
    
    // Delete point click event
    $(".positionDelete").click(function(){
        var id_to_delete = $(this).parent().index()
        
        if (confirm("Would you like to delete the following point ?: " + JSON.stringify(positions[id_to_delete])) == true) {
            let removed = positions.splice(id_to_delete, 1)[0];
            dew.notify("chat", { message: "Removed: [" + removed.map(function(v, i) { return (i <= 4) ? v.toFixed(3) : v; }) + "]", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
        }
        
        $(this).parent().remove();
    });
    
    
    dataWindowOpen = true;
}

function dataWindow() {
    
    if (dataWindowOpen) { return; }                    
    
    var data = JSON.stringify({ positions: positions }, null, 4);
    
    
    $("<div/>")
        .attr('id', 'camera_popup_id')
        .css({
            // General Appearance
            "background": "#142850",
            "border-radius": "4px",
            "padding": "12px",
            
            // Centered Div
            "position": "absolute",
            "width": "700px",
            "height": "700px",
            "top": "50%",
            "left": "50%",
            "margin": "-350px 0 0 -350px",
            
            // Grid Aspect
            "display": "grid",
            "grid-template-columns": "1fr 1fr",
            "grid-template-rows": "24px auto 24px",
            "grid-template-areas": '"Title Title" "TextArea TextArea" "Exit Save"',
            "grid-column-gap": "0px",
            "grid-row-gap": "4px",
        })
        .append([
            $('<div/>')
                .text("Import/Export: Copy/Paste/CTRL + (A/Z)/Keyboard only")
                .css({
                    "color": "white",
                    "text-align": "center",
                    "grid-area": "Title",
                    "text-decoration": "underline"
                }),
                
            $('<textarea/>')
                .attr('id', 'camera_popup_textarea_id')
                .val(data)
                .css({"grid-area": "TextArea"}),
                
            $('<button/>')
                .html("Import and Close")
                .css({"grid-area": "Save"})
                .click(function() {
                    try {
                        var parsedData = JSON.parse(document.getElementById("camera_popup_textarea_id").value);
                        if (Object.hasOwn(parsedData, 'positions')) {
                            positions = parsedData.positions;
                        }
                        // Support for old exports
                        if (Object.hasOwn(parsedData, 'start')) {
                            positions = [];
                            positions.push(parsedData.start);
                            if (Object.hasOwn(parsedData, 'midPoints')) {
                                positions = positions.concat(parsedData.midPoints);
                            }
                            if (Object.hasOwn(parsedData, 'end')) {
                                positions.push(parsedData.end);
                            }
                        }
                        dew.notify("chat", { message: "Import successful", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
                    } catch (e) {
                        dew.notify("chat", { message: "Error parsing data: " + e.toString(), sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
                    }
                    dataWindowOpen = false;
                    document.getElementById("camera_popup_id").outerHTML = "";
                    dew.hide();
                }),
                
            $('<button/>')
                .attr('id', 'popup_close_button2')
                .html("Close without importing")
                .css({"grid-area": "Exit"})
                .click(function() {
                    dataWindowOpen = false;
                    document.getElementById("camera_popup_id").outerHTML = "";
                    dew.hide();
                })
        ])
        .appendTo("body");
    
    dataWindowOpen = true;
}

function showHelp() {
    dew.hide();
    dew.notify("chat", { message: "Camera Tracking Help:", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
    dew.notify("chat", { message: "- Add point: /add <OPTIONAL NAME>", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
    dew.notify("chat", { message: "- List points: /list", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
    dew.notify("chat", { message: "- Move point: /mv <from> <to>", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
    dew.notify("chat", { message: "- Delete point: /del <index>", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
    dew.notify("chat", { message: "- Clear points: /clear", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
    dew.notify("chat", { message: "- To Rearrange/Preview points, do \"/edit\" to bring up the menu", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
    dew.notify("chat", { message: "- For camera/player help, do /camera", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
    dew.notify("chat", { message: "- For replay the last track, do /replay", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
    dew.notify("chat", { message: "- To export/import the current points, do \"/import\" or \"/export\" ", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
}

function movePoint(data) {
    
    dew.hide();
    if (data.length != 2) {
        dew.notify("chat", { message: "Missing positions, usage: /mv <from> <to>", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
    
    } else {
        var from = parseInt(data[0]);
        var to = parseInt(data[1]);
    
        var tmp_val = positions[from];
        positions.splice(from, 1);
        positions.splice(to, 0, tmp_val);
        
        dew.notify("chat", { message: "Moved:", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
        positions.forEach((item, index) => dew.notify("chat", { message: index + " - [" + item + "]", sender: "Camera", chatType: "DEBUG", color: "#FF9000" }));
    }
}

function delPoint(data) {
    
    dew.hide();
    if (data.length == 0) {
        dew.notify("chat", { message: "You need to enter the index of the position you want to delete, for example: /del 2", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
        
    } else {
        
        var id_to_delete = parseInt(data[0]);
        if (id_to_delete >= positions.length) {
            dew.notify("chat", { message: "Incorrect id, do \"/list\" to find the correct id", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
        
        } else {
            let removed = positions.splice(id_to_delete, 1)[0];
            dew.notify("chat", { message: "Removed: [" + removed.map(function(v, i) { return (i <= 4) ? v.toFixed(3) : v; }) + "]", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
        }
    }
}




// Window Binds
$(document).ready(function() {
    $(document).keyup(function (e) {
        if (e.keyCode === 27) { // Escape Key
            
            // Cancels the current camera animation
            if (cameraInterval != undefined) {
                camera_end();
                dew.notify("chat", { message: "Animation cancelled", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
                return;
            }
            
            // Closes data window
            if (dataWindowOpen && !previewingPos) {
                document.getElementById("popup_close_button2").click();
                e.preventDefault();
                return;
            }
            
            // Cancels previewing a position
            if (previewingPos) {
                previewingPos = false;
                document.getElementById("camera_popup_id").style.visibility = "visible";
                dew.command("Camera.Mode default");
            }
        }
    });
    
    
    $("html").on("keyup", function(e){
        
        // Director camera: switches between the first 10 positions using the number keys
        if(currentMode == CAMERA_MODE.DIRECTOR) {
            
            if (e.keyCode <= 57 && e.keyCode >= 48) { // Keys 0-9
                currentPosition = (e.keyCode - 48);
                
                // Shift the position so that 1 thru 9 and 0 on they keyboard equals 0 - 9 in value
                if (currentPosition == 0) {
                    currentPosition = 10;
                }
                currentPosition -= 1;
                
                if (currentPosition < positions.length) {
                    dew.command("Camera.Position " + positions[currentPosition][0] + " " + positions[currentPosition][1] + " " + positions[currentPosition][2] + " " + positions[currentPosition][3] + " " + positions[currentPosition][4]);
                }
            }
        }
    
        // Go forward and backward
        if (currentMode != CAMERA_MODE.NONE && (e.keyCode == 37 || e.keyCode == 39)) { // Backward/Forward camera progress, left/right arrow keys
        
            if (animationPaused) { animationPausedButNeedsUpdate = true; }
        
            if (currentMode != CAMERA_MODE.DIRECTOR) {
                startTime += (e.keyCode == 37 ? amountForward : -(amountForward));
            }
            
            if (currentMode == CAMERA_MODE.DIRECTOR) {
                currentPosition += ( e.keyCode == 37 ? -1 : 1);
                if (currentPosition >= 0 && currentPosition < positions.length) {
                    dew.command("Camera.Position " + positions[currentPosition][0] + " " + positions[currentPosition][1] + " " + positions[currentPosition][2] + " " + positions[currentPosition][3] + " " + positions[currentPosition][4]);
                } else {
                    currentPosition += ( e.keyCode == 37 ? 1 : -1);
                }
            }
        }
        
        // Pauses the current animation
        if(currentMode != CAMERA_MODE.NONE && e.keyCode == 80 && cameraInterval != undefined){ // P
        
            animationPaused = !animationPaused;
            
            if (animationPaused) {
                pauseStartTime = performance.now();
            } else {
                startTime += (performance.now() - pauseStartTime);
            }
            
            e.preventDefault();
        }
    });
    
});




// Normalises the durations for some cameras
function normalise_durations(durations, vals) {
    
    let duration = durations.reduce((partialSum, a) => partialSum + a, 0);
    
    let per_track_distance = [];
    let total_distance = 0;
    for (let i = 0; i < (vals.xPosVals.length - 1); i++) {
        let curr_distance = Math.sqrt(Math.pow((vals.xPosVals[i + 1] - vals.xPosVals[i]), 2) + Math.pow((vals.yPosVals[i + 1] - vals.yPosVals[i]), 2) + Math.pow((vals.zPosVals[i + 1] - vals.zPosVals[i]), 2));
        per_track_distance.push(curr_distance);
        total_distance += curr_distance;
    }
    
    let per_track_duration = [];
    for (let i = 0; i < per_track_distance.length; i++) {
        let curr_duration = (per_track_distance[i] / total_distance) * duration;
        per_track_duration.push(curr_duration);
    }
    
    // Durations will be the x axis values for each point in time
    per_track_duration = per_track_duration.map(x => x * 1000);
    per_track_duration.unshift(0);
    per_track_duration = per_track_duration.map((elem, index) => per_track_duration.slice(0, index + 1).reduce((a, b) => a + b));
    
    return per_track_duration;
}


// Clears camera variables
function camera_end() {
    currentMode = CAMERA_MODE.NONE;
    clearInterval(cameraInterval);
    cameraInterval = undefined;
    loopCamera = false;
    setTimeout(function() {
        dew.command("Camera.Mode default");
        dew.hide();
    }, 500);
}


// Fixes positions values before being sent to the camera animation
function prep_values_interpolator(durations) {
    
    var timeValue = durations.reduce((a, b) => a + b, 0);
    var timeInMs = timeValue * 1000;
    var nbTracks = positions.length - 1;
    
    var steps = parseInt(timeInMs / cameraIntervalMs);
    steps = steps + (nbTracks - (steps % nbTracks)) - nbTracks;

    // Durations will be the x axis values for each point in time
    durations = durations.map(x => x * 1000);
    durations.unshift(0);
    durations = durations.map((elem, index) => durations.slice(0, index + 1).reduce((a, b) => a + b));
    
    var xPosVals = [];
    var yPosVals = [];
    var zPosVals = [];
    var hPosVals = [];
    var vPosVals = [];
    
    for (let i = 0; i < positions.length; i++) {
        xPosVals.push(positions[i][0]);
        yPosVals.push(positions[i][1]);
        zPosVals.push(positions[i][2]);
        hPosVals.push(positions[i][3]);
        vPosVals.push(positions[i][4]);
    }

    if (positions.length == 2) {
        
        if (currentMode == CAMERA_MODE.BICUBIC || currentMode == CAMERA_MODE.SMOOTH_BICUBIC) {
            
            durations.splice(1, 0, (durations[1] - durations[0]) / 2 + durations[0])
            xPosVals.splice(1, 0, (positions[1][0] - positions[0][0]) / 2 + positions[0][0]);
            yPosVals.splice(1, 0, (positions[1][1] - positions[0][1]) / 2 + positions[0][1]);
            zPosVals.splice(1, 0, (positions[1][2] - positions[0][2]) / 2 + positions[0][2]);
            vPosVals.splice(1, 0, (positions[1][4] - positions[0][4]) / 2 + positions[0][4]);
            
            // Fix rotation wrap issue
            if (Math.abs(hPosVals[1] - hPosVals[0]) > Math.PI) {
                if (hPosVals[0] > hPosVals[1]) {
                    hPosVals[1] += (2 * Math.PI);
                } else {
                    hPosVals[0] += (2 * Math.PI);
                }
            }
            
            hPosVals.splice(1, 0, (hPosVals[1] - hPosVals[0]) / 2 + hPosVals[0]);
        }
        
        if (currentMode == CAMERA_MODE.AKIMA || currentMode == CAMERA_MODE.SMOOTH_AKIMA) {
            dew.notify("chat", { message: "Akima camera needs at least 5 points to work.", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
            camera_end();
            return;
        }
    }
    
    
    // Fix rotation wrap issue
    for (let i = 1; i < hPosVals.length; i++) {
        
        if ((hPosVals[i - 1] - hPosVals[i]) > Math.PI) {
            let diff = Math.abs(hPosVals[i - 1] - hPosVals[i]);
            let amnt = parseInt(diff / (2 * Math.PI)) + 1;
            
            hPosVals[i] += amnt * 2 * Math.PI;
            
            // This is so jank
            if (Math.abs(hPosVals[i - 1] - hPosVals[i]) > Math.PI) {
                hPosVals[i] -= 2 * Math.PI;
            }
        }
        
        if ((hPosVals[i] - hPosVals[i - 1]) > Math.PI) {
            let diff = Math.abs(hPosVals[i - 1] - hPosVals[i]);
            let amnt = parseInt(diff / (2 * Math.PI)) + 1;
            
            hPosVals[i] -= amnt * 2 * Math.PI;
            
            // This is so jank
            if (Math.abs(hPosVals[i - 1] - hPosVals[i]) > Math.PI) {
                hPosVals[i] += 2 * Math.PI;
            }
        }
    }
    
    return {
        durations: durations,
        xPosVals: xPosVals,
        yPosVals: yPosVals,
        zPosVals: zPosVals,
        hPosVals: hPosVals,
        vPosVals: vPosVals,
    }
}




// Different camera functions

function interpolator_camera(interpolator_creator_function, durations, xPosVals, yPosVals, zPosVals, hPosVals, vPosVals) {
    
    // Create interpolators
    var xValInterpolator = interpolator_creator_function(durations, xPosVals);
    var yValInterpolator = interpolator_creator_function(durations, yPosVals);
    var zValInterpolator = interpolator_creator_function(durations, zPosVals);
    var hValInterpolator = interpolator_creator_function(durations, hPosVals);
    var vValInterpolator = interpolator_creator_function(durations, vPosVals);
    
    setTimeout(function() {
    
        startTime = performance.now();
    
        cameraInterval = setInterval(function() {
            
            if (animationPaused) {
                
                // If the animation is paused but the camera needs an update (pressing forward/backwards keys), update once
                if (animationPausedButNeedsUpdate) {
                    animationPausedButNeedsUpdate = false;
                    startTime += (performance.now() - pauseStartTime);
                    pauseStartTime = performance.now();
                } else {
                    return;
                }
            }
            
            // Compute camera position values
            let currTime = performance.now() - startTime;                        
            let posX = xValInterpolator(currTime);
            let posY = yValInterpolator(currTime);
            let posZ = zValInterpolator(currTime);
            let posH = hValInterpolator(currTime);
            let posV = vValInterpolator(currTime);
            
            dew.command("Camera.Position " + posX + " " + posY + " " + posZ + " " + posH + " " + posV);
            
            if (performance.now() >= (startTime + durations[durations.length - 1])) {
                if (!loopCamera) {
                    camera_end();
                } else {
                    startTime = performance.now();
                }
            }
            
        }, cameraIntervalMs);
        
    }, 1000);
    
    return;
}


function director_camera() {
    
    // For escape Key
    cameraInterval = 1;
    
    // Warn if there's more than 10 Positions
    if (positions.length > 10) {
        dew.notify("chat", { message: "You have more than 10 positions, only the first 10 will be accessible by the number keys. Use \"/edit\" to rearrange.", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
    }
    
    dew.command("Camera.Position " + positions[currentPosition][0] + " " + positions[currentPosition][1] + " " + positions[currentPosition][2] + " " + positions[currentPosition][3] + " " + positions[currentPosition][4]);
}

function lerp_camera(durations) {
    
    var timeValue = durations.reduce((a, b) => a + b, 0);
    var timeInMs = timeValue * 1000;
    var nbTracks = positions.length - 1;
    
    // TODO: Shouldn't need to use steps at all, just time values, might improve
    var steps = parseInt(timeInMs / cameraIntervalMs);
    steps = steps + (nbTracks - (steps % nbTracks)) - nbTracks;

    durations = durations.map(x => x * 1000);
    
    var trackSizes = durations.map(x => x / cameraIntervalMs);
    trackSizes = trackSizes.map((elem, index) => trackSizes.slice(0, index + 1).reduce((a, b) => a + b));
    
    
    currentStep = 0;
    
    var prevTrack = 0;
    var tempPosA = positions[0];
    var tempPosB = positions[1];
    
    // Fix potential rotation wrap issue
    if (Math.abs(tempPosA[3] - tempPosB[3]) > Math.PI) {
        if (tempPosA[3] > tempPosB[3]) {
            tempPosB[3] += (2 * Math.PI);
        } else {
            tempPosA[3] += (2 * Math.PI);
        }
    }
    
    setTimeout(function() {
    
        startTime = performance.now();
        
        cameraInterval = setInterval(function() {
            
            if (animationPaused) {
                
                // If the animation is paused but the camera needs an update (pressing forward/backwards keys), update once
                if (animationPausedButNeedsUpdate) {
                    animationPausedButNeedsUpdate = false;
                    startTime += (performance.now() - pauseStartTime);
                    pauseStartTime = performance.now();
                } else {
                    return;
                }
            }
            
            var currTrack = trackSizes.findIndex((v, i) => currentStep <= v);
            if (currTrack == -1) {
                console.log("currTrack == -1");
            }
            
            // Changed track, update start and end positions of track
            if (currTrack != prevTrack) {
                
                prevTrack = currTrack;
                
                startTime = performance.now();
                
                
                tempPosA = positions[currTrack];
                tempPosB = positions[currTrack + 1];
    
                // Fix potential rotation wrap issue
                if (Math.abs(tempPosA[3] - tempPosB[3]) > Math.PI) {
                    if (tempPosA[3] > tempPosB[3]) {
                        tempPosB[3] += (2 * Math.PI);
                    } else {
                        tempPosA[3] += (2 * Math.PI);
                    }
                }
                
                // TODO: Skip step since it's not the first track and you don't want to repeat a move.
                // Though tbf it's only a ~5ms stop but might as well
            }
            
            var progress = (performance.now() - startTime) / durations[currTrack];
            
            var posX = progress * (tempPosB[0] - tempPosA[0]) + tempPosA[0];
            var posY = progress * (tempPosB[1] - tempPosA[1]) + tempPosA[1];
            var posZ = progress * (tempPosB[2] - tempPosA[2]) + tempPosA[2];
            var posH = progress * (tempPosB[3] - tempPosA[3]) + tempPosA[3];
            var posV = progress * (tempPosB[4] - tempPosA[4]) + tempPosA[4];
            
            dew.command("Camera.Position " + posX + " " + posY + " " + posZ + " " + posH + " " + posV);
            
            currentStep++;
            
            if (currentStep >= steps) {
                if (!loopCamera) {
                    camera_end();
                } else {
                    startTime = performance.now();
                }
            }
            
        }, cameraIntervalMs);
        
    }, 1000);
    
    return;
}

function step_camera(durations) {
    
    durations = durations.map(n => n * 1000 * durations.length);
    
    if (!loopCamera || (loopCamera && JSON.stringify(positions[0]) != JSON.stringify(positions[positions.length - 1]))) {
        durations.push(durations[0]);
    }
    
    cameraInterval = true;
    
    function camera_step(currPos) {
        
        if (loopCamera) {
            currPos %= (durations.length);
        }
        
        setTimeout(() => {
            dew.command("Camera.Position " + positions[currPos][0] + " " + positions[currPos][1] + " " + positions[currPos][2] + " " + positions[currPos][3] + " " + positions[currPos][4]);
            
            if (!loopCamera && cameraInterval && currPos < (durations.length - 1)) {
                camera_step(currPos + ((!animationPaused) ? 1 : 0));
            } else if (loopCamera && cameraInterval && currPos < durations.length) {
                camera_step(currPos + ((!animationPaused) ? 1 : 0));
            } else {
                camera_end();
            }
        }, durations[currPos]);
    }
    
    camera_step(0);
    return;
}




// Auxiliary functions needed for cubic/akima cameras
// Source: https://github.com/chdh/commons-math-interpolation
function binarySearch(a, key) {
    let low = 0;
    let high = a.length - 1;
    while (low <= high) {
        const mid = (low + high) >>> 1;
        const midVal = a[mid];
        if (midVal < key) {
            low = mid + 1;
        } else if (midVal > key) {
            high = mid - 1;
        } else if (midVal == key) {
            return mid;
        } else {
            console.log("Invalid number encountered in binary search.");
        }
    }
    return -(low + 1);
}

function evaluatePoly(c, x) {
    const n = c.length;
    if (n == 0) {
        return 0;
    }
    let v = c[n - 1];
    for (let i = n - 2; i >= 0; i--) {
        v = x * v + c[i];
    }
    return v;
}

function evaluatePolySegment(xVals, segmentCoeffs, x) {
    let i = binarySearch(xVals, x);
    if (i < 0) {
        i = -i - 2;
    }
    i = Math.max(0, Math.min(i, segmentCoeffs.length - 1));
    return evaluatePoly(segmentCoeffs[i], x - xVals[i]);
}

function trimPoly(c) {
    let n = c.length;
    while (n > 1 && c[n - 1] == 0) {
        n--;
    }
    return (n == c.length) ? c : c.subarray(0, n);
}

function computeCubicPolyCoefficients(xVals, yVals) {
    if (xVals.length != yVals.length) {
        console.log("Dimension mismatch.");
    }
    if (xVals.length < 3) {
        console.log("Number of points is too small.");
    }
    const n = xVals.length - 1;
    
    const h = new Float64Array(n);
    for (let i = 0; i < n; i++) {
        h[i] = xVals[i + 1] - xVals[i];
    }
    
    const mu = new Float64Array(n);
    const z = new Float64Array(n + 1);
    mu[0] = 0;
    z[0] = 0;
    for (let i = 1; i < n; i++) {
        const g = 2 * (xVals[i + 1] - xVals[i - 1]) - h[i - 1] * mu[i - 1];
        mu[i] = h[i] / g;
        z[i] = (3 * (yVals[i + 1] * h[i - 1] - yVals[i] * (xVals[i + 1] - xVals[i - 1]) + yVals[i - 1] * h[i]) / (h[i - 1] * h[i]) - h[i - 1] * z[i - 1]) / g;
    }
    
    // cubic spline coefficients. b is linear, c quadratic, d is cubic
    const b = new Float64Array(n);
    const c = new Float64Array(n + 1);
    const d = new Float64Array(n);
    
    z[n] = 0;
    c[n] = 0;
    
    for (let i = n - 1; i >= 0; i--) {
        const dx = h[i];
        const dy = yVals[i + 1] - yVals[i];
        c[i] = z[i] - mu[i] * c[i + 1];
        b[i] = dy / dx - dx * (c[i + 1] + 2 * c[i]) / 3;
        d[i] = (c[i + 1] - c[i]) / (3 * dx);
    }
    
    const segmentCoeffs = new Array(n);
    for (let i = 0; i < n; i++) {
        const coeffs = new Float64Array(4);
        coeffs[0] = yVals[i];
        coeffs[1] = b[i];
        coeffs[2] = c[i];
        coeffs[3] = d[i];
        segmentCoeffs[i] = trimPoly(coeffs);
    }
    return segmentCoeffs;
}

function createCubicSplineInterpolator(xVals, yVals) {
    const segmentCoeffs = computeCubicPolyCoefficients(xVals, yVals);
    const xValsCopy = Float64Array.from(xVals);
    return (x) => evaluatePolySegment(xValsCopy, segmentCoeffs, x);
}

function createAkimaSplineInterpolator(xVals, yVals) {
    const segmentCoeffs = computeAkimaPolyCoefficients(xVals, yVals);
    const xValsCopy = Float64Array.from(xVals);
    return (x) => evaluatePolySegment(xValsCopy, segmentCoeffs, x);
}

function computeAkimaPolyCoefficients(xVals, yVals) {
    
    if (xVals.length < 5) {
       console.log("Number of points is too small.");
    }
    
    const n = xVals.length - 1;
    
    const differences = new Float64Array(n);
    const weights = new Float64Array(n);
    
    for (let i = 0; i < n; i++) {
        differences[i] = (yVals[i + 1] - yVals[i]) / (xVals[i + 1] - xVals[i]);
    }
    
    for (let i = 1; i < n; i++) {
        weights[i] = Math.abs(differences[i] - differences[i - 1]);
    }
    
    // Prepare Hermite interpolation scheme.
    const firstDerivatives = new Float64Array(n + 1);
    
    for (let i = 2; i < n - 1; i++) {
        const wP = weights[i + 1];
        const wM = weights[i - 1];
        if (Math.abs(wP) < EPSILON && Math.abs(wM) < EPSILON) {
           const xv  = xVals[i];
           const xvP = xVals[i + 1];
           const xvM = xVals[i - 1];
           firstDerivatives[i] = (((xvP - xv) * differences[i - 1]) + ((xv - xvM) * differences[i])) / (xvP - xvM);
        } else {
           firstDerivatives[i] = ((wP * differences[i - 1]) + (wM * differences[i])) / (wP + wM);
        }
    }
    
    firstDerivatives[0]     = differentiateThreePoint(xVals, yVals, 0, 0, 1, 2);
    firstDerivatives[1]     = differentiateThreePoint(xVals, yVals, 1, 0, 1, 2);
    firstDerivatives[n - 1] = differentiateThreePoint(xVals, yVals, n - 1, n - 2, n - 1, n);
    firstDerivatives[n]     = differentiateThreePoint(xVals, yVals, n    , n - 2, n - 1, n);
    
    return computeHermitePolyCoefficients(xVals, yVals, firstDerivatives);
}

function differentiateThreePoint(xVals, yVals, indexOfDifferentiation, indexOfFirstSample, indexOfSecondsample, indexOfThirdSample) {

    const x0 = yVals[indexOfFirstSample];
    const x1 = yVals[indexOfSecondsample];
    const x2 = yVals[indexOfThirdSample];

    const t  = xVals[indexOfDifferentiation] - xVals[indexOfFirstSample];
    const t1 = xVals[indexOfSecondsample]    - xVals[indexOfFirstSample];
    const t2 = xVals[indexOfThirdSample]     - xVals[indexOfFirstSample];

    const a = (x2 - x0 - (t2 / t1 * (x1 - x0))) / (t2 * t2 - t1 * t2);
    const b = (x1 - x0 - a * t1 * t1) / t1;

    return (2 * a * t) + b;
}

function computeHermitePolyCoefficients(xVals, yVals, firstDerivatives) {
    
   const n = xVals.length - 1;

   const segmentCoeffs = new Array(n);
   for (let i = 0; i < n; i++) {
      const w = xVals[i + 1] - xVals[i];
      const w2 = w * w;

      const yv  = yVals[i];
      const yvP = yVals[i + 1];

      const fd  = firstDerivatives[i];
      const fdP = firstDerivatives[i + 1];

      const coeffs = new Float64Array(4);
      coeffs[0] = yv;
      coeffs[1] = firstDerivatives[i];
      coeffs[2] = (3 * (yvP - yv) / w - 2 * fd - fdP) / w;
      coeffs[3] = (2 * (yv - yvP) / w + fd + fdP) / w2;
      segmentCoeffs[i] = trimPoly(coeffs);
   }
   return segmentCoeffs;
}




// Auxiliary functions needed for Piecewise Cubic Hermite camera
// Source: https://github.com/doug-a-brunner/slatec-pchip

function dpchst(arg1, arg2) {
    if (arg1 === 0 || arg2 === 0) {
        return 0;
    }
    if (arg1 > 0) {
        return arg2 > 0 ? 1 : -1;
    }
    return arg2 > 0 ? -1 : 1;
}

function dpchim(x, y) {
    if (x.length !== y.length) {
        console.log("input array lengths must match");
    }
    const n = x.length;
    if (n < 2) {
        console.log('number of data points less than two');
    }
    for (let i = 1; i < n; ++i) {
        if (x[i] <= x[i - 1]) {
            console.log('x-array not strictly increasing');
        }
    }
    if (n === 2) {
        const deriv = (y[1] - y[0]) / (x[1] - x[0]);
        return [deriv, deriv];
    }
    const d = new Array(n);
    let h1 = x[1] - x[0];
    let del1 = (y[1] - y[0]) / h1;
    let h2 = x[2] - x[1];
    let del2 = (y[2] - y[1]) / h2;

    // set d[0] via non-centered three-point formula, adjusted to be shape-preserving
    let hsum = h1 + h2;
    let w1 = (h1 + hsum) / hsum;
    let w2 = -h1 / hsum;
    d[0] = w1 * del1 + w2 * del2;
    if (dpchst(d[0], del1) < 0) {
        d[0] = 0;
    }
    else if (dpchst(del1, del2) < 0) {
        // need do this check only if monotonicity switches
        const dmax = 3 * del1;
        if (Math.abs(d[0]) > Math.abs(dmax)) {
            d[0] = dmax;
        }
    }

    // loop through interior points
    for (let i = 1; i < n - 1; ++i) {
        if (i > 1) {
            h1 = h2;
            h2 = x[i + 1] - x[i];
            hsum = h1 + h2;
            del1 = del2;
            del2 = (y[i + 1] - y[i]) / h2;
        }
        d[i] = 0;
        if (dpchst(del1, del2) > 0) {
            // use Brodlie modification of Butland formula
            const hsumt3 = hsum * 3;
            w1 = (hsum + h1) / hsumt3;
            w2 = (hsum + h2) / hsumt3;
            const dmax = Math.max(Math.abs(del1), Math.abs(del2));
            const dmin = Math.min(Math.abs(del1), Math.abs(del2));
            const drat1 = del1 / dmax;
            const drat2 = del2 / dmax;
            d[i] = dmin / (w1 * drat1 + w2 * drat2);
        }
        else {
            d[i] = 0; // set d[i] = 0 unless data are strictly monotonic
        }
    }

    // set d[n - 1] via non-centered three-point formula, adjusted to be shape-preserving
    w1 = -h2 / hsum;
    w2 = (h2 + hsum) / hsum;
    d[n - 1] = w1 * del1 + w2 * del2;
    if (dpchst(d[n - 1], del2) < 0) {
        d[n - 1] = 0;
    }
    else if (dpchst(del1, del2) < 0) {
        // need do this check only if monotonicity switches
        const dmax = 3 * del2;
        if (Math.abs(d[n - 1]) > Math.abs(dmax)) {
            d[n - 1] = dmax;
        }
    }

    return d;
}

function lowerBound(arr, value) {
    if (arr.length === 0) {
        return 0;
    }
    let low = 0;
    let high = arr.length;

    while (low < high) {
        const mid = Math.floor((low + high) / 2);
        if (arr[mid] < value) {
            low = mid + 1;
        }
        else {
            high = mid;
        }
    }
    return high;
}

function piecewiseCubic(x, y, m, xI) {
    const yI = new Array(xI.length);
    for (let i = 0; i < x.length - 1; ++i) {
        const dX = x[i + 1] - x[i];
        const dY = y[i + 1] - y[i];
        const c = (dY / dX - m[i]) / dX;
        const d = (m[i] + m[i + 1] - (2 * dY) / dX) / (dX * dX);

        const leftIndex = lowerBound(xI, x[i]);
        let rightIndex = lowerBound(xI, x[i + 1]);
        if (i === x.length - 2 && xI[rightIndex] === x[i + 1]) {
            ++rightIndex;
        }
        const xISubset = xI.slice(leftIndex, rightIndex);
        const yISubset = xISubset.map((v) => y[i] + (v - x[i]) * (m[i] + (v - x[i]) * (c + d * (v - x[i + 1]))));
        for (let j = 0; j < yISubset.length; ++j) {
            yI[j + leftIndex] = yISubset[j];
        }
    }
    return yI;
}

function createPiecewiseCubicHermiteInterpolator(xVals, yVals) {
    const derivates = dpchim(xVals, yVals)
    const xValsCopy = Float64Array.from(xVals);
    const yValsCopy = Float64Array.from(yVals);
    return (x) => piecewiseCubic(xValsCopy, yValsCopy, derivates, [x])[0];
}