var isTeamChat = false;
var hasTeams = false;
var stayOpen = false;
var hideTimer;
var hideDelay = 4500;
var fadeTime = 800;
var nameCardOpacity = 0.8;
var teamArray = [
    { name: 'red', color: '#852D2C'},
    { name: 'blue', color: '#2F5385'},
    { name: 'green', color: '#4E6513'},
    { name: 'orange', color: '#B27701'},
    { name: 'purple', color: '#4B377C'},
    { name: 'gold', color: '#A89127'},   
    { name: 'brown', color: '#49310F'}, 
    { name: 'pink', color: '#CC789C'}, 
    {name: 'white', color: '#D8D8D8'}, 
    {name: 'black', color: '#0B0B0B'}           
];
var playerName;
var playerTabIndex = -1;
var playersMatchList = [];
var settingsArray = { 'Game.HideChat': '0', 'Player.Name': '0', "Game.ChatMessageLimit": '50'};

var cachedPlayerJSON;



// Auto Camera Tracking
const CAMERA_MODE = {
    NONE: "none",
    LINEAR: "linear",
    BICUBIC: "bicubic",
    SMOOTH_BICUBIC: "smooth_bicubic",
    AKIMA: "akima",
    SMOOTH_AKIMA: "smooth_akima",
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
var pauseStartTime = 0;
var loopCamera = false;

var currentPosition = 0;

var dataWindowOpen = false;
var previewingPos = false;

const EPSILON = Number.EPSILON;

// Load JQuery UI

$.ajax({
    url: "https://code.jquery.com/ui/1.14.1/jquery-ui.min.js",
    dataType: "script"
});

$(document).ready(function(){
    $(document).keyup(function (e) {
        if (e.keyCode === 27) { // Escape Key
            
            if (cameraInterval != undefined) {
                
                clearInterval(cameraInterval);
                cameraInterval = undefined;
                dew.command("Camera.Mode first");
                document.getElementById("chat").style.display = "block";
                
                chatboxHide();
                
                dew.notify("chat", { message: "Animation cancelled", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
                
                e.preventDefault();
                return;
            }
            
            if (dataWindowOpen && !previewingPos) {
                
                document.getElementById("popup_close_button2").click();
                
                e.preventDefault();
                return;
            }
            
            if (!previewingPos) {
                chatboxHide();
            }
            
            if (previewingPos) {
                previewingPos = false;
                
                document.getElementById("camera_popup_id").style.visibility = "visible";
                
                dew.command("Camera.Mode first");
            }
        }
                
        if (e.keyCode == 44) {
            dew.command('Game.TakeScreenshot');  
        }
    });
    
    $("html").on("keydown", function(e){
    
        if(currentMode == CAMERA_MODE.DIRECTOR) {
            
            if (e.keyCode <= 57 && e.keyCode >= 48) {
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
        
        if(e.keyCode == 80 && cameraInterval != undefined){ //P
        
            animationPaused = !animationPaused;
            
            if (animationPaused) {
                pauseStartTime = performance.now();
            } else {
                startTime += (performance.now() - pauseStartTime);
            }
            
            /*
            if (!animationPaused) {
                dew.command("Game.PlayUiSound 13");
                setTimeout(() => {
                    dew.command("Game.PlayUiSound 13");
                }, 200);
            } else {
                dew.command("Game.PlayUiSound 14");
            }
            */
            
            e.preventDefault();
        }
    });
    
    $(document).keydown(function(e){
        if (e.keyCode === 13){ //Enter
        
            var chatBoxInput = $("#chatBox").val();
            
            if (cameraInterval != undefined) {
                return;
            }
            
            
            // Auto Camera Tracking Commands
            
            var posIndex = chatBoxInput.toLowerCase().indexOf("/add");
            if (posIndex >= 0) {                
                dew.command('Camera.Position', {}).then(function(response) {
                    
                    var tempPos = response.replace(/X|Y|Z|H|V|L|,|:/g, '').trim().replace(/  +/g, ' ').split(" ").map(Number);
                    
                    var comment = chatBoxInput.substring(posIndex + 5)
                    if (comment.length > 0) {
                        tempPos.push(comment);
                    }
                    
                    positions.push(tempPos);
                    
                    dew.notify("chat", { message: "Added: [" + tempPos.map(function(v, i) { return (i <= 4) ? v.toFixed(3) : v; }) + "]", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
                });
                
                chatboxHide();
                return;
            }
            
            
            var listIndex = chatBoxInput.toLowerCase().indexOf("/list");
            if (listIndex >= 0) {
                dew.notify("chat", { message: "Positions: ", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
                positions.forEach((item, index) => {
                    dew.notify("chat", { message: index + " - [" + item.map(function(v, i) { return (i <= 4) ? v.toFixed(3) : v; }) + "]", sender: "Camera", chatType: "DEBUG", color: "#FF9000" })
                });
                
                chatboxHide();
                return;
            }
            
            
            var clearIndex = chatBoxInput.toLowerCase().indexOf("/clear");
            if (clearIndex >= 0) {
                positions = [];
                dew.notify("chat", { message: "Positions cleared.", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
                
                chatboxHide();
                return;
            }
            
            
            var delIndex = chatBoxInput.toLowerCase().indexOf("/del");
            if (delIndex >= 0) {
                
                var curr_command = chatBoxInput.toLowerCase().substring(posIndex + 5);
                
                if (curr_command == "") {
                    dew.notify("chat", { message: "You need to enter the index of the position you want to delete, for example: /del 2", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
                } else {
                    
                    var id_to_delete = parseInt(curr_command);
                    if (id_to_delete >= positions.length) {
                        dew.notify("chat", { message: "Incorrect id, do \"/list\" to find the correct id", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
                    
                    } else {
                        let removed = positions.splice(id_to_delete, 1)[0];
                        dew.notify("chat", { message: "Removed: [" + removed.map(function(v, i) { return (i <= 4) ? v.toFixed(3) : v; }) + "]", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
                    }
                }
                
                chatboxHide();
                return;
            }
            
            
            var mvIndex = chatBoxInput.toLowerCase().indexOf("/mv");
            if (mvIndex >= 0) {
                
                var curr_command = chatBoxInput.toLowerCase().substring(posIndex + 4).trim().replace(/  +/g, ' ').split(" ");
                
                if (curr_command.length != 2) {
                    dew.notify("chat", { message: "Missing positions, usage: /mv <from> <to>", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
                
                } else {
                    var from = parseInt(curr_command[0]);
                    var to = parseInt(curr_command[1]);
                
                    var tmp_val = positions[from];
                    positions.splice(from, 1);
                    positions.splice(to, 0, tmp_val);
                    
                    dew.notify("chat", { message: "Moved:", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
                    positions.forEach((item, index) => dew.notify("chat", { message: index + " - [" + item + "]", sender: "Camera", chatType: "DEBUG", color: "#FF9000" }));
                }
                
                chatboxHide();
                return;
            }
            
            
            var dataIndex = chatBoxInput.toLowerCase().indexOf("/edit");
            if (dataIndex >= 0) {
                
                if (dataWindowOpen) {
                    $("#chatBox").val('');
                    $("#chatBox").hide();
                    $("#chatWindow").css("bottom", "0");
                    $("#chatWindow").addClass("hide-scrollbar");
                    return;
                }
                
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
                                chatboxHide();
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
                
                $("#chatBox").val('');
                $("#chatBox").hide();
                $("#chatWindow").css("bottom", "0");
                $("#chatWindow").addClass("hide-scrollbar");
                $("#camera_popup_textarea_id").focus()
                
                return;
            }
        
        
            var intervalIndex = chatBoxInput.toLowerCase().indexOf("/interval");
            if (intervalIndex >= 0) {
                cameraIntervalMs = parseInt(chatBoxInput.substring(intervalIndex + 10));
                dew.notify("chat", { message: "Camera Interval: " + cameraIntervalMs, sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
            }
            
            
            var helpIndex = Math.max(
                chatBoxInput.toLowerCase().indexOf("/help"),
                chatBoxInput.toLowerCase().indexOf("/h"),
                chatBoxInput.toLowerCase().indexOf("/?")
            );
            if (helpIndex >= 0) {
                dew.notify("chat", { message: "Camera Tracking Help:", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
                dew.notify("chat", { message: " Add point: /add <OPTIONAL NAME>", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
                dew.notify("chat", { message: " List points: /list", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
                dew.notify("chat", { message: " Move point: /mv <from> <to>", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
                dew.notify("chat", { message: " Delete point: /del <index>", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
                dew.notify("chat", { message: " Clear points: /clear", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
                dew.notify("chat", { message: " To Rearrange/Preview points, do \"/edit\" to bring up the menu", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
                dew.notify("chat", { message: " For camera/player help, do /camera", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
                dew.notify("chat", { message: " To export/import the current points, do \"/import\"", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
                
                chatboxHide();
                return;
            }
            
            
            var dataIndex = Math.max(
                chatBoxInput.toLowerCase().indexOf("/import"),
                chatBoxInput.toLowerCase().indexOf("/export")
            );
            if (dataIndex >= 0) {
                
                if (dataWindowOpen) {
                    $("#chatBox").val('');
                    $("#chatBox").hide();
                    $("#chatWindow").css("bottom", "0");
                    $("#chatWindow").addClass("hide-scrollbar");
                    return;
                }                    
                
                var data = {
                    positions: positions
                };
                data = JSON.stringify(data, null, 4);
                
                
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
                                chatboxHide();
                            }),
                            
                        $('<button/>')
                            .attr('id', 'popup_close_button2')
                            .html("Close without importing")
                            .css({"grid-area": "Exit"})
                            .click(function() {
                                dataWindowOpen = false;
                                document.getElementById("camera_popup_id").outerHTML = "";
                                chatboxHide();
                            })
                    ])
                    .appendTo("body");
                
                dataWindowOpen = true;
                
                $("#chatBox").val('');
                $("#chatBox").hide();
                $("#chatWindow").css("bottom", "0");
                $("#chatWindow").addClass("hide-scrollbar");
                $("#camera_popup_textarea_id").focus()
                
                return;
            }
            
            
            var cameraIndex = chatBoxInput.toLowerCase().indexOf("/camera");
            if (cameraIndex >= 0) {
                
                var curr_command = chatBoxInput.toLowerCase().substring(posIndex + 8).trim().replace(/  +/g, ' ').split(" ");
                
                if (curr_command.length == 0 || curr_command[0].length == 0) {
                    dew.notify("chat", { message: "Camera Help:", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
                    
                    dew.notify("chat", { message: " To pause the animation, press P", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
                    dew.notify("chat", { message: " To cancel the animation, press Escape", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
                    dew.notify("chat", { message: " Default mode is bicubic", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
                    
                    dew.notify("chat", { message: " /camera 10", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
                    
                    dew.notify("chat", { message: " /camera <b/bi/bicubic> 10", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
                    dew.notify("chat", { message: " /camera <sb/sbi/smooth_bicubic> 10", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
                    
                    dew.notify("chat", { message: " /camera <a/ak/aki/akima> 10", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
                    dew.notify("chat", { message: " /camera <sa/sak/saki/smooth_akima> 10", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
                    
                    dew.notify("chat", { message: " /camera <l/lerp/linear> 10", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
                    dew.notify("chat", { message: " /camera <l/lerp/linear> dur 4 4 2", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
                    
                    dew.notify("chat", { message: " /camera <p/pause> <10 | dur 1 ...>", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
                    
                    dew.notify("chat", { message: " /camera <d/dir/director>", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
                    chatboxHide();
                    return;
                }
                
                if ( positions.length < 2 ) {
                    dew.notify("chat", { message: "You need at list two points", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
                    chatboxHide();
                    return;
                }
                
                // Parse camera mode
                switch (curr_command[0]) {
                    
                    case "b":
                    case "bi":
                    case "bicubic":
                        currentMode = CAMERA_MODE.BICUBIC;
                        curr_command.shift();
                        break;
                    
                    case "sb":
                    case "sbi":
                    case "smooth_bicubic":
                        currentMode = CAMERA_MODE.SMOOTH_BICUBIC;
                        curr_command.shift();
                        break;
                    
                    case "a":
                    case "ak":
                    case "aki":
                    case "akima":
                        currentMode = CAMERA_MODE.AKIMA;
                        curr_command.shift();
                        break;
                    
                    case "sa":
                    case "sak":
                    case "saki":
                    case "smooth_akima":
                        currentMode = CAMERA_MODE.SMOOTH_AKIMA;
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
                        mode = "bicubic";
                }
                
                
                // Parse duration(s)
                var durations = [];
                var customDurationsEnabled = (positions.length > 2) && (curr_command[0] == "dur");
                
                if (currentMode != CAMERA_MODE.DIRECTOR && !customDurationsEnabled && (isNaN(curr_command[0]) || !isFinite(curr_command[0])) ) {
                    dew.notify("chat", { message: "Duration needs to be a number", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
                    chatboxHide();
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
                    chatboxHide();
                    return;
                }
                
                
                loopCamera = curr_command[curr_command.length - 1] == "l" || curr_command[curr_command.length - 1] == "loop";
                
                
                $("#chatBox").val('');
                document.getElementById("chat").style.display = "none";
                dew.command("Camera.Mode static");
                
                
                // Clear up existing running animation just in case
                clearInterval(cameraInterval);
                cameraInterval = undefined;
                animationPaused = false;
                pauseStartTime = 0;
                
                
                let vals = 0;
                
                
                switch (currentMode) {
                    case CAMERA_MODE.BICUBIC:
                        vals = prep_values_bicubic_akima(durations);
                        bicubic_camera(vals.durations, vals.xPosVals, vals.yPosVals, vals.zPosVals, vals.hPosVals, vals.vPosVals, loopCamera);
                        break;
                        
                    case CAMERA_MODE.SMOOTH_BICUBIC:
                        vals = prep_values_bicubic_akima(durations);
                        durations = normalise_durations(durations, vals);
                        bicubic_camera(durations, vals.xPosVals, vals.yPosVals, vals.zPosVals, vals.hPosVals, vals.vPosVals, loopCamera);
                        break;
                        
                    case CAMERA_MODE.AKIMA:
                        vals = prep_values_bicubic_akima(durations);
                        akima_camera(vals.durations, vals.xPosVals, vals.yPosVals, vals.zPosVals, vals.hPosVals, vals.vPosVals, loopCamera);
                        break;
                        
                    case CAMERA_MODE.SMOOTH_AKIMA:
                        vals = prep_values_bicubic_akima(durations);
                        durations = normalise_durations(durations, vals);
                        akima_camera(durations, vals.xPosVals, vals.yPosVals, vals.zPosVals, vals.hPosVals, vals.vPosVals, loopCamera);
                        break;
                        
                    case CAMERA_MODE.LINEAR:
                        lerp_camera(durations);
                        break;
                    
                    case CAMERA_MODE.STEP:
                        step_camera(durations, loopCamera);
                        break;
                    
                    case CAMERA_MODE.DIRECTOR:
                        director_camera(durations, loopCamera);
                        break;
                    
                    default:
                        dew.notify("chat", { message: "Undefined mode somehow.", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
                        chatboxHide();
                        break;
                }
                
                return;
            }
            
            
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
            
            function camera_end() {
                clearInterval(cameraInterval);
                cameraInterval = undefined;
                loopCamera = false;
                setTimeout(function() {
                    dew.command("Camera.Mode default");
                    document.getElementById("chat").style.display = "block";
                    //chatboxHide();
                }, 2000);
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
            
            
            // Fixes positions values before being sent to the camera animation
            function prep_values_bicubic_akima(durations) {
                
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

                
                // TODO: Jank fix, Cubic Interpolator needs at least 3 values, Akima needs 5 values, Use Linear is less
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
                    
                    if (currentMode == cameraMode.AKIMA || currentMode == CAMERA_MODE.SMOOTH_AKIMA) {
                        // TODO: Use bicubic to reach 5 points. If starting with only 2, use linear then bicubic.
                        dew.notify("chat", { message: "Needs 5 positions for akima (Start, End and 3 intermediary/mid positions). WIP to fix that.", sender: "Camera", chatType: "DEBUG", color: "#FF9000" });
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
            

            function bicubic_camera(durations, xPosVals, yPosVals, zPosVals, hPosVals, vPosVals, loopCamera) {
                
                // Create interpolators
                var xValInterpolator = createCubicSplineInterpolator(durations, xPosVals);
                var yValInterpolator = createCubicSplineInterpolator(durations, yPosVals);
                var zValInterpolator = createCubicSplineInterpolator(durations, zPosVals);
                var hValInterpolator = createCubicSplineInterpolator(durations, hPosVals);
                var vValInterpolator = createCubicSplineInterpolator(durations, vPosVals);
                
                setTimeout(function() {
                
                    startTime = performance.now();
                
                    cameraInterval = setInterval(function() {
                        
                        if (animationPaused) {
                            return;
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

            function akima_camera(durations, xPosVals, yPosVals, zPosVals, hPosVals, vPosVals, loopCamera) {
                
                // Create interpolators
                var xValInterpolator = createAkimaSplineInterpolator(durations, xPosVals);
                var yValInterpolator = createAkimaSplineInterpolator(durations, yPosVals);
                var zValInterpolator = createAkimaSplineInterpolator(durations, zPosVals);
                var hValInterpolator = createAkimaSplineInterpolator(durations, hPosVals);
                var vValInterpolator = createAkimaSplineInterpolator(durations, vPosVals);
                
                setTimeout(function() {
                
                    startTime = performance.now();
                
                    cameraInterval = setInterval(function() {
                        
                        if (animationPaused) {
                            return;
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
                            return;
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
            
            function step_camera(durations, loopCamera) {
                
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
            
            
            
            // Prevent local commands from being sent
            if (chatBoxInput[0] == "/" && chatBoxInput[1] != "m" && chatBoxInput[2] != "e") {
                chatboxHide();
                return;
            }
            
            
            dew.sendChat($("#chatBox").val(), isTeamChat);
            chatboxHide();
        }else{
            $("#chatBox").focus();
        }
    });
    
    $("#chatBox").keydown(function(e){
        if(e.keyCode === 33) {
            $("#chatWindow").scrollTop($("#chatWindow").scrollTop()-($('#chatWindow p').height() * 6));   
        }
        if(e.keyCode === 34) {
            $("#chatWindow").scrollTop($("#chatWindow").scrollTop()+($('#chatWindow p').height() * 6));        
        }
    });
    
    $("html").on("keydown", function(e){ //disable tabbing
        if(e.keyCode == 9){ //tab
            e.preventDefault();
        }
    });

    $("body").click(function(){
        $("#chatBox").focus();
    });
    
    $("#chatBox").keyup(function (e) {
        $("#chatBox").removeClass("mentions");
        var wordArray = $("#chatBox").val().split(' ');
        if (e.keyCode == 9) { //tab
            if( $("#chatBox").val().length == 0){ //Switch between Team Chat and Global Chat
                if(!isTeamChat && hasTeams){
                    isTeamChat = true;
                    $("#chatBox").attr("placeholder", "TEAM");
                }else
                {
                    isTeamChat = false;
                    $("#chatBox").attr("placeholder", "GLOBAL");
                }
            }else
            if (playerTabIndex == -1) {
                if (wordArray[wordArray.length - 1] != '' && wordArray[wordArray.length - 1].startsWith('@')) {
                    playersMatchList = [];
                    $.each(cachedPlayerJSON, function (index, obj) {
                        if (cachedPlayerJSON[index].name.toLowerCase().startsWith(wordArray[wordArray.length - 1].substring(1).toLowerCase())) {
                            playersMatchList.push(cachedPlayerJSON[index].name);
                        }
                    });
                    playerTabIndex = 0;
                    if(playersMatchList[playerTabIndex] != undefined){
                        wordArray.splice(wordArray.length - 1, 1);
                        wordArray.push('@' + playersMatchList[playerTabIndex]);
                        $("#chatBox").val(wordArray.join(' '));
                    }
                }
            } else {
                if(e.shiftKey){
                    if (playerTabIndex == 0)
                        playerTabIndex = playersMatchList.length - 1;
                    else
                        playerTabIndex--;
                }
                else{
                    playerTabIndex++;
                    if (playerTabIndex > playersMatchList.length - 1)
                        playerTabIndex = 0;
                }
                
                if(playersMatchList[playerTabIndex] != undefined){
                    wordArray.splice(wordArray.length - 1, 1);
                    wordArray.push('@' + playersMatchList[playerTabIndex]);
                    $("#chatBox").val(wordArray.join(' '));
                }
            }
        } else if(e.keyCode != 16) { //shift counts as an input so ignore if the player let go of shift
            playerTabIndex = -1;
        }
        
        if($("#chatBox").val().includes('@')){
            var mentions = false;
            $.each(cachedPlayerJSON, function (index, obj) {
                var cachedName = cachedPlayerJSON[index].name.toLowerCase();
                if(($("#chatBox").val()).toLowerCase().match("@"+cachedName))
                    mentions = true;
            });
            
            if(mentions)
                $("#chatBox").addClass("mentions");
        }
    });
    
    $("#chatWindow").on("click", "a", function(e) {
        e.preventDefault();
        
        dew.playSound("a_button");
        var item = this;
        dew.dialog("confirm_link",{
            body: "This link goes to " + this.href + " Are you sure you want to open this?"
        }).then(result => {
            if (result === 'yes') {
                window.open(item.href, '_blank');
            }
        });
    });
    
    loadSettings(0);
});

function loadSettings(i){
    if (i != Object.keys(settingsArray).length) {
        dew.command(Object.keys(settingsArray)[i], {}).then(function(response) {
            settingsArray[Object.keys(settingsArray)[i]] = response;
            i++;
            loadSettings(i);
        });
    }
}

dew.on("show", function(e){
    if(settingsArray['Game.HideChat'] == 0){
        playerName = new RegExp("@"+settingsArray['Player.Name'], "ig");
        if(e.data.hasOwnProperty('teamChat')){
            isTeamChat = e.data.teamChat;
        }
        dew.getSessionInfo().then(function(i){
            if(i.established){
                hasTeams = i.hasTeams;
                if(isTeamChat && !i.hasTeams){
                    isTeamChat = false;
                } 
                
                $("#chat").stop();
                $('body').removeClass();
                if(i.mapName != "mainmenu"){
                    $("body").addClass("inGame");
                }else{
                    $("body").addClass("inLobby");
                }
                if(isTeamChat && i.hasTeams){
                    $("#chatBox").attr("placeholder", "TEAM");
                }else{
                    $("#chatBox").attr("placeholder", "GLOBAL");
                }
                
                clearTimeout(hideTimer);
                $("#chat").fadeIn(fadeTime/3);
                
                if(!stayOpen){
                    dew.captureInput(e.data.captureInput);
                    if (e.data.captureInput) {
                        //if opened by the user opening chat themselves
                        stayOpen = true;
                        dew.callMethod("chatBoxOpened", {"opened": true});
                        $("#chatBox").show();
                        $("#chatBox").focus();
                        $("#chatWindow").css("bottom", "26px");//Shift chat up to show the input box.
                        $("#chatWindow").removeClass("hide-scrollbar");
                        dew.command('Server.ListPlayersJSON', {}).then(function (e) {
                            cachedPlayerJSON = JSON.parse(e);
                        });
                    }else{
                        // if opened by a chat message being recieved
                        $("#chatBox").hide();
                        $("#chatWindow").css("bottom", "0");
                        $("#chatWindow").addClass("hide-scrollbar");
                        fadeAway();
                    }
                }
                if($("#chatWindow p").length){
                    $("#chatWindow p").last()[0].scrollIntoView(false);
                }
            }
        });
    }
    window.addEventListener('mousedown', handleMouseDown);
});

dew.on("hide", function(e){
    dew.callMethod("chatBoxOpened", {"opened": false});
    window.removeEventListener('mousedown', handleMouseDown);
});

function handleMouseDown(e){
    if(e.button == 2){
        chatboxHide();
    }
}

dew.on("chat", function(e){
    if(playerName == undefined)
        playerName = new RegExp("@"+settingsArray['Player.Name'], "ig");
    
    if(e.data.hasOwnProperty('color')){
        var bgColor =  e.data.color;
        if (e.data.hasTeams){
            if(e.data.hasOwnProperty('teamIndex')){
                bgColor = teamArray[e.data.teamIndex].color;
            }
        }
        bgColor = hexToRgba(adjustColor(bgColor,20), nameCardOpacity);
    }
    var messageClass = 'nameCard';
    var chatClass = e.data.chatType;
    
    if(e.data.message.includes('@')){
        var mentions = false;
        $.each(cachedPlayerJSON, function (index, obj) {
            var cachedName = cachedPlayerJSON[index].name.toLowerCase();
            if((e.data.message).toLowerCase().match("@"+cachedName))
                mentions = true;
        });
        
        //if you are the sender of a mention then highlight your own message
        if(mentions && e.data.sender == settingsArray['Player.Name']){
            chatClass += ' mentions';
        }
    }
    
    if(playerName != undefined && (e.data.message).match(playerName)){
        chatClass += ' mention';                
    }
    
    if(e.data.message.startsWith('/me ')){
        messageClass += ' emote';
        chatClass += ' emote';
        e.data.message = e.data.message.substring(4, e.data.message.length);
    }

    var maxMessagelength = 128;
    if(e.data.chatType == "SERVER")
        maxMessagelength = 512;

    e.data.message =  e.data.message.substring(0, Math.min(maxMessagelength,  e.data.message.length));
    
    var messageHtml = escapeHtml(e.data.message).replace(/\bhttps?:\/\/[^ ]+/ig, aWrap);
    $("#chatWindow").append($('<span>', { 
        class: messageClass, 
        css: { backgroundColor: bgColor}, 
        text: e.data.sender 
    })
    .wrap($('<p>', { class: chatClass })).parent().append(messageHtml));
    
    let messageLimit = settingsArray['Game.ChatMessageLimit'];
    const chatWindow = document.getElementById("chatWindow");
    if (chatWindow.children.length > messageLimit) {
        let historySize = chatWindow.children.length;
        for (let i = 0; i < historySize - messageLimit; i++) {
            chatWindow.removeChild(chatWindow.children[0]);
        }
    }
    
    if(settingsArray['Game.HideChat'] == 0){
        dew.show();
    }
});

dew.on('controllerinput', function(e){       
    if(e.data.B == 1){
        chatboxHide();  
    }
});

dew.on("variable_update", function(e){
    for(i = 0; i < e.data.length; i++){
        if(e.data[i].name in settingsArray){
            settingsArray[e.data[i].name] = e.data[i].value;
        }
    }
});

function fadeAway(){
    clearTimeout(hideTimer);
    hideTimer = setTimeout(function(){
        $("#chat").fadeOut(fadeTime, function(){
            dew.hide();
        });
    }, hideDelay);
}

function chatboxHide(){
    dew.captureInput(false);
    dew.callMethod("chatBoxOpened", {"opened": false});
    fadeAway();
    stayOpen = false;
    $("#chatBox").val('');
    $("#chatBox").hide();
    $("#chatWindow").css("bottom", "0");
    $("#chatWindow").addClass("hide-scrollbar");
}

function hexToRgba(hex,opacity){
    var r = parseInt(hex.substr(1,2), 16);
    var g = parseInt(hex.substr(3,2), 16);
    var b = parseInt(hex.substr(5,2), 16);
    return 'rgba('+ r + "," + g + "," + b + "," + opacity+")";
}

function aWrap(link) {
    link = unescapeHtml(link);
   if(/\b[^-A-Za-z0-9+&@#/%?=~_|!:,.;\(\)]+/ig.test(link))
        return '';
    var e = document.createElement('a');
    e.setAttribute('href', link);
    e.setAttribute('target', '_blank');
    e.setAttribute('style', 'color:dodgerblue');
    e.textContent = link;
    return e.outerHTML;
};

function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

function unescapeHtml(str) {
    var e = document.createElement('div');
    e.innerHTML = str;
    return e.childNodes.str === 0 ? "" : e.childNodes[0].nodeValue;
}

function adjustColor(color, amount){
    var colorhex = (color.split("#")[1]).match(/.{2}/g);
    for (var i = 0; i < 3; i++){
        var e = parseInt(colorhex[i], 16);
        e += amount;
        if(amount > 0){
            colorhex[i] = ((e > 255) ? 255 : e).toString(16);
        }else{
            colorhex[i] = ((e < 0) ? 0 : e).toString(16);           
        }
    }
    return "#" + colorhex[0] + colorhex[1] + colorhex[2];
}