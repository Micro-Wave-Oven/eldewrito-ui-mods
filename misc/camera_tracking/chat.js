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
var posA = undefined;
var posB = undefined;
var midPos = [];

var currentStep = 0;
var cameraIntervalMs = 5;
var cameraInterval = undefined;
var pauseStartTime = 0;

var animationPaused = false;
var pauseStartTime = 0;

var dataWindowOpen = false;

$(document).ready(function(){
    $(document).keyup(function (e) {
        if (e.keyCode === 27) {
            
            if (cameraInterval != undefined) {
                
                clearInterval(cameraInterval);
                cameraInterval = undefined;
                dew.command("Camera.Mode first");
                document.getElementById("chat").style.display = "block";
                
                chatboxHide();
                
                dew.notify("chat", { message: "Animation cancelled", sender: "Camera Tracking", chatType: "DEBUG", color: "#FF9000" });
                
                e.preventDefault();
                return;
            }
            
            if (dataWindowOpen) {
                
                document.getElementById("popup_close_button2").click();
                
                e.preventDefault();
                return;
            }
            
            chatboxHide();
        }
        
        $("html").on("keydown", function(e){ //Pause animation if playing
            if(e.keyCode == 80 && cameraInterval != undefined){ //ESC
            
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
        
        if (e.keyCode == 44) {
            dew.command('Game.TakeScreenshot');  
        }
    });
    
    $(document).keydown(function(e){
        if (e.keyCode === 13){ //Enter
        
            var chatBoxInput = $("#chatBox").val();
            
            if (cameraInterval != undefined) {
                return;
            }            
            
            
            // Auto Camera Tracking Commands
            
            var posIndex = Math.max(
                chatBoxInput.toLowerCase().indexOf("/posa"),
                chatBoxInput.toLowerCase().indexOf("/startpos")
            );
            if (posIndex >= 0) {                
                dew.command('Camera.Position', {}).then(function(response) {
                    posA = response.replace(/X|Y|Z|H|V|L|,|:/g, '').trim().replace(/  +/g, ' ').split(" ").map(Number);
                    dew.notify("chat", { message: "Start Position: " + JSON.stringify(posA), sender: "Camera Tracking", chatType: "DEBUG", color: "#FF9000" });
                });
            }
            
            var posIndex = Math.max(
                chatBoxInput.toLowerCase().indexOf("/posb"),
                chatBoxInput.toLowerCase().indexOf("/endpos")
            );
            if (posIndex >= 0) {
                dew.command('Camera.Position', {}).then(function(response) {
                    posB = response.replace(/X|Y|Z|H|V|L|,|:/g, '').trim().replace(/  +/g, ' ').split(" ").map(Number);
                    dew.notify("chat", { message: "End Position: " + JSON.stringify(posB), sender: "Camera Tracking", chatType: "DEBUG", color: "#FF9000" });
                });
            }
            
            
            var posIndex = chatBoxInput.toLowerCase().indexOf("/midpos");
            if (posIndex >= 0) {
                
                var curr_command = chatBoxInput.toLowerCase().substring(posIndex + 8).trim().replace(/  +/g, ' ').split(" ");
                
                // List points
                if (curr_command[0] == "l" || curr_command[0] == "ls" || curr_command[0] == "list") {
                    dew.notify("chat", { message: "Mid positions: ", sender: "Camera Tracking", chatType: "DEBUG", color: "#FF9000" });
                    midPos.forEach((item, index) => dew.notify("chat", { message: index + " - [" + item.map(function(v, i) { return (i <= 4) ? v.toFixed(3) : v; }) + "]", sender: "Camera Tracking", chatType: "DEBUG", color: "#FF9000" }));
                
                
                // Clear points
                } else if (curr_command[0] == "c" || curr_command[0] == "clear") {
                    midPos = [];
                    dew.notify("chat", { message: "Mid positions cleared.", sender: "Camera Tracking", chatType: "DEBUG", color: "#FF9000" });
                
                
                // Add point
                } else if (curr_command[0] == "a" || curr_command[0] == "add") {
                
                    dew.command('Camera.Position', {}).then(function(response) {
                        
                        tempPos = response.replace(/X|Y|Z|H|V|L|,|:/g, '').trim().replace(/  +/g, ' ').split(" ").map(Number);
                        
                        if (curr_command.length >= 2) {
                            tempPos.push(curr_command[1]);
                        }
                        
                        midPos.push(tempPos);
                        
                        dew.notify("chat", { message: "Added: [" + tempPos.map(function(v, i) { return (i <= 4) ? v.toFixed(3) : v; }) + "]", sender: "Camera Tracking", chatType: "DEBUG", color: "#FF9000" });
                    });
                
                
                // Delete Point
                } else if (curr_command[0] == "d" || curr_command[0] == "del" || curr_command[0] == "delete") {
                    
                    if (curr_command.length == 1) {
                        dew.notify("chat", { message: "You need to enter the index of the position you want to delete, for example: /midpos " + curr_command[0] + " 1", sender: "Camera Tracking", chatType: "DEBUG", color: "#FF9000" });
                    } else {
                        
                        var id_to_delete = parseInt(curr_command[1]);
                        if (id_to_delete >= midPos.length) {
                            dew.notify("chat", { message: "Incorrect id, do \"/midpos list\" to find the correct id", sender: "Camera Tracking", chatType: "DEBUG", color: "#FF9000" });
                        
                        } else {
                            let removed = midPos.splice(id_to_delete, 1)[0];
                            dew.notify("chat", { message: "Removed: [" + removed.map(function(v, i) { return (i <= 4) ? v.toFixed(3) : v; }) + "]", sender: "Camera Tracking", chatType: "DEBUG", color: "#FF9000" });
                        }
                    }
                
                
                // Move point
                } else if (curr_command[0] == "m" || curr_command[0] == "mv" || curr_command[0] == "move") {
                    
                    if (curr_command.length != 3) {
                        dew.notify("chat", { message: "Missing positions, usage: /midpos " + curr_command[0] + " <from> <to>", sender: "Camera Tracking", chatType: "DEBUG", color: "#FF9000" });
                    
                    } else {
                        var from = parseInt(curr_command[1]);
                        var to = parseInt(curr_command[2]);
                    
                        var tmp_val = midPos[from];
                        midPos.splice(from, 1);
                        midPos.splice(to, 0, tmp_val);
                        
                        dew.notify("chat", { message: "Moved:", sender: "Camera Tracking", chatType: "DEBUG", color: "#FF9000" });
                        midPos.forEach((item, index) => dew.notify("chat", { message: index + " - [" + item + "]", sender: "Camera Tracking", chatType: "DEBUG", color: "#FF9000" }));
                    }
                
                
                // Display help
                } else {
                    dew.notify("chat", { message: "Middle/Intermediary points help:", sender: "Camera Tracking", chatType: "DEBUG", color: "#FF9000" });
                    dew.notify("chat", { message: " Add point: /midpos a <OPTIONAL NAME>", sender: "Camera Tracking", chatType: "DEBUG", color: "#FF9000" });
                    dew.notify("chat", { message: " List points: /midpos l", sender: "Camera Tracking", chatType: "DEBUG", color: "#FF9000" });
                    dew.notify("chat", { message: " Move point: /midpos mv <from> <to>", sender: "Camera Tracking", chatType: "DEBUG", color: "#FF9000" });
                    dew.notify("chat", { message: " Delete point: /midpos del <index>", sender: "Camera Tracking", chatType: "DEBUG", color: "#FF9000" });
                    dew.notify("chat", { message: " Clear points: /midpos c", sender: "Camera Tracking", chatType: "DEBUG", color: "#FF9000" });
                }
                
                chatboxHide();
                return;
            }
            
            
            var intervalIndex = chatBoxInput.toLowerCase().indexOf("/interval");
            if (intervalIndex >= 0) {
                cameraIntervalMs = parseInt(chatBoxInput.substring(intervalIndex + 10));
                dew.notify("chat", { message: "Camera Interval: " + cameraIntervalMs, sender: "Camera Tracking", chatType: "DEBUG", color: "#FF9000" });
            }
            
            
            var helpIndex = Math.max(
                chatBoxInput.toLowerCase().indexOf("/help"),
                chatBoxInput.toLowerCase().indexOf("/h"),
                chatBoxInput.toLowerCase().indexOf("/?")
            );
            if (helpIndex >= 0) {
                dew.notify("chat", { message: "Camera Tracking Help:", sender: "Camera Tracking", chatType: "DEBUG", color: "#FF9000" });
                dew.notify("chat", { message: " To set the start point, do \"/startPos\"", sender: "Camera Tracking", chatType: "DEBUG", color: "#FF9000" });
                dew.notify("chat", { message: " To set the end point, do \"/endPos\"", sender: "Camera Tracking", chatType: "DEBUG", color: "#FF9000" });
                dew.notify("chat", { message: " To add/delete/list/edit intermediary points, do \"/midPos\" for the help", sender: "Camera Tracking", chatType: "DEBUG", color: "#FF9000" });
                dew.notify("chat", { message: " For camera/player help, do /camera", sender: "Camera Tracking", chatType: "DEBUG", color: "#FF9000" });
                dew.notify("chat", { message: " To export/import the current points, do \"/import\"", sender: "Camera Tracking", chatType: "DEBUG", color: "#FF9000" });
                
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
                    start: posA,
                    midPoints: midPos,
                    end: posB
                };
                data = JSON.stringify(data, null, 4);
                
                let popup = document.createElement("div");
                popup.id = "camera_popup_id";
                
                // General Appearance style
                popup.style.background = "#142850";
                popup.style.borderRadius = "4px";
                popup.style.padding = "12px";
                
                // Popup style
                popup.style.position = "absolute";
                popup.style.width = "700px";
                popup.style.height = "700px";
                popup.style.top = "50%";
                popup.style.left = "50%";
                popup.style.margin = "-350px 0 0 -350px";
                
                // Grid style
                popup.style.display = "grid";
                popup.style.gridTemplateColumns = "1fr 1fr";
                popup.style.gridTemplateRows = "24px auto 24px";
                popup.style.gridTemplateAreas = '"Title Title" "TextArea TextArea" "Exit Save"';
                popup.style.gridColumnGap = "0px";
                popup.style.gridRowGap = "4px";
                
                
                let popup_title = document.createElement("div");
                popup_title.innerText = "Import/Export: Copy/Paste/CTRL + (A/Z)/Keyboard only";
                popup_title.style.color = "white";
                popup_title.style.textAlign = "center";
                popup_title.style.gridArea = "Title";
                
                let popup_textarea = document.createElement("textarea");
                popup_textarea.id = "camera_popup_textarea_id";
                popup_textarea.value = data;
                popup_textarea.style.gridArea = "TextArea";
                
                let popup_close_button = document.createElement("button");
                popup_close_button.textContent = "Import and Close";
                popup_close_button.style.gridArea = "Save";
                popup_close_button.onclick = function(e) {
                    
                    try {
                        var parsedData = JSON.parse(document.getElementById("camera_popup_textarea_id").value);                        
                        if (Object.hasOwn(parsedData, 'start')) {
                            posA = parsedData.start;
                        }                        
                        if (Object.hasOwn(parsedData, 'midPoints')) {
                            midPos = parsedData.midPoints;
                        }                        
                        if (Object.hasOwn(parsedData, 'end')) {
                            posB = parsedData.end;
                        }
                    } catch (e) {
                        dew.notify("chat", { message: "Error parsing data: " + e.toString(), sender: "Camera Tracking", chatType: "DEBUG", color: "#FF9000" });
                    }
                    
                    dataWindowOpen = false;
                    document.getElementById("camera_popup_id").outerHTML = "";
                    chatboxHide();
                };
                
                let popup_close_button2 = document.createElement("button");
                popup_close_button2.id = "popup_close_button2";
                popup_close_button2.textContent = "Close without importing";
                popup_close_button2.style.gridArea = "Exit";
                popup_close_button2.onclick = function() {
                    dataWindowOpen = false;
                    document.getElementById("camera_popup_id").outerHTML = "";
                    chatboxHide();
                };
                
                
                popup.appendChild(popup_title);
                popup.appendChild(popup_textarea);
                popup.appendChild(popup_close_button);
                popup.appendChild(popup_close_button2);
                document.body.appendChild(popup);
                
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
                    dew.notify("chat", { message: "Camera Help:", sender: "Camera Tracking", chatType: "DEBUG", color: "#FF9000" });
                    
                    dew.notify("chat", { message: " To pause the animation, press P", sender: "Camera Tracking", chatType: "DEBUG", color: "#FF9000" });
                    dew.notify("chat", { message: " To cancel the animation, press Escape", sender: "Camera Tracking", chatType: "DEBUG", color: "#FF9000" });
                    dew.notify("chat", { message: " Default mode is bicubic", sender: "Camera Tracking", chatType: "DEBUG", color: "#FF9000" });
                    
                    dew.notify("chat", { message: " /camera 10", sender: "Camera Tracking", chatType: "DEBUG", color: "#FF9000" });
                    
                    dew.notify("chat", { message: " /camera <b/bi/bicubic> 10", sender: "Camera Tracking", chatType: "DEBUG", color: "#FF9000" });
                    
                    dew.notify("chat", { message: " /camera <l/lerp/linear> 10", sender: "Camera Tracking", chatType: "DEBUG", color: "#FF9000" });
                    dew.notify("chat", { message: " /camera <l/lerp/linear> dur 4 4 2", sender: "Camera Tracking", chatType: "DEBUG", color: "#FF9000" });
                    
                    dew.notify("chat", { message: " /camera <p/pause> <10 | dur 1 ...>", sender: "Camera Tracking", chatType: "DEBUG", color: "#FF9000" });
                    chatboxHide();
                    return;
                }
                
                if ( posA == undefined || posB == undefined ) {
                    dew.notify("chat", { message: "Missing either start or end position", sender: "Camera Tracking", chatType: "DEBUG", color: "#FF9000" });
                    chatboxHide();
                    return;
                }
                
                var mode = "bicubic"; //default mode
                switch (curr_command[0]) {
                    
                    case "b":
                    case "bi":
                    case "bicubic":
                        mode = "bicubic";
                        curr_command.shift();
                        break;
                        
                    case "l":
                    case "lerp":
                    case "linear":
                        mode = "linear";
                        curr_command.shift();
                        break;
                        
                    case "p":
                    case "pause":
                        mode = "pause";
                        curr_command.shift();
                        break;
                    
                    default:
                        mode = "bicubic";
                }
                
                
                var durations = [];
                var customDurationsEnabled = (midPos.length != 0) && (curr_command[0] == "dur");
                
                if (!customDurationsEnabled && (isNaN(curr_command[0]) || !isFinite(curr_command[0])) ) {
                    dew.notify("chat", { message: "Duration needs to be a number", sender: "Camera Tracking", chatType: "DEBUG", color: "#FF9000" });
                    chatboxHide();
                    return;
                }
                
                if (customDurationsEnabled) {
                    durations = curr_command.splice(1).map(Number);
                    
                } else {
                    let per_track_dur = parseFloat(curr_command[0]) / (1 + midPos.length);
                    for (let i = 0; i < (1 + midPos.length); i++) {
                        durations.push(per_track_dur);
                    }
                }
                
                if (durations.length == 0 || durations.length != (1 + midPos.length)) {
                    dew.notify("chat", { message: "Incorrect number of durations, you have " + (1 + midPos.length) + " tracks and " + durations.length + " durations.", sender: "Camera Tracking", chatType: "DEBUG", color: "#FF9000" });
                    chatboxHide();
                    return;
                }                
                
                document.getElementById("chat").style.display = "none";
                dew.command("Camera.Mode static");
                
                $("#chatBox").val('');
                
                animationPaused = false;
                pauseStartTime = 0;
                
                switch (mode) {
                    case "bicubic":
                        bicubic_camera(durations);
                        break;
                    
                    case "linear":
                        lerp_camera(durations);
                        break;
                    
                    case "pause":
                        step_camera(durations);
                        break;
                    
                    default:
                        dew.notify("chat", { message: "Undefined mode somehow.", sender: "Camera Tracking", chatType: "DEBUG", color: "#FF9000" });
                        chatboxHide();
                        break;
                }
                
                return;
            }
            
            function camera_end() {
                clearInterval(cameraInterval);
                cameraInterval = undefined;
                setTimeout(function() {
                    dew.command("Camera.Mode default");
                    document.getElementById("chat").style.display = "block";
                    //chatboxHide();
                }, 2000);
            }
            
            function lerp_camera(durations) {
                
                
                var timeValue = durations.reduce((a, b) => a + b, 0);
                var timeInMs = timeValue * 1000;
                var nbTracks = 1 + midPos.length;
                
                var steps = parseInt(timeInMs / cameraIntervalMs);
                steps = steps + (nbTracks - (steps % nbTracks)) - nbTracks;

                durations = durations.map(x => x * 1000);
                
                var trackSizes = durations.map(x => x / cameraIntervalMs);
                trackSizes = trackSizes.map((elem, index) => trackSizes.slice(0, index + 1).reduce((a, b) => a + b));
                
                
                
                currentStep = 0;
                
                var prevTrack = 0;
                var tempPosA = undefined;
                var tempPosB = undefined;
                        
                if (nbTracks == 1) {
                    tempPosA = posA;
                    tempPosB = posB;
                    
                } else {
                    tempPosA = posA;
                    tempPosB = midPos[0];
                }
                
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
                            
                            
                            if (currTrack == (nbTracks - 1)) { // Last track
                                tempPosA = midPos[currTrack - 1];
                                tempPosB = posB;
                            } else {
                                tempPosA = midPos[currTrack - 1]; // Not last track
                                tempPosB = midPos[currTrack];
                            }
                
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
                            camera_end();
                        }
                        
                    }, cameraIntervalMs);
                    
                }, 1000);
                
                return;
            }
            
            function bicubic_camera(durations) {
                
                
                var timeValue = durations.reduce((a, b) => a + b, 0);
                var timeInMs = timeValue * 1000;
                var nbTracks = 1 + midPos.length;
                
                var steps = parseInt(timeInMs / cameraIntervalMs);
                steps = steps + (nbTracks - (steps % nbTracks)) - nbTracks;

                // Durations will be the x axis values for each point in time
                durations = durations.map(x => x * 1000);
                durations.unshift(0);
                durations = durations.map((elem, index) => durations.slice(0, index + 1).reduce((a, b) => a + b));                
                
                
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
                
                
                let xPosVals = [posA[0]];
                let yPosVals = [posA[1]];
                let zPosVals = [posA[2]];
                let hPosVals = [posA[3]];
                let vPosVals = [posA[4]];
                
                for (let i = 0; i < midPos.length; i++) {
                    xPosVals.push(midPos[i][0]);
                    yPosVals.push(midPos[i][1]);
                    zPosVals.push(midPos[i][2]);
                    hPosVals.push(midPos[i][3]);
                    vPosVals.push(midPos[i][4]);
                }
                
                
                // TODO: Jank fix, Cubic Interpolator needs at least 3 values, if only 2, use linear
                if (midPos.length == 0) {
                    durations.splice(1, 0, (durations[1] - durations[0]) / 2 + durations[0])
                    xPosVals.push((posB[0] - posA[0]) / 2 + posA[0]);
                    yPosVals.push((posB[1] - posA[1]) / 2 + posA[1]);
                    zPosVals.push((posB[2] - posA[2]) / 2 + posA[2]);
                    
                    // Fix rotation wrap issue
                    if (Math.abs(posB[3] - posA[3]) < Math.PI) {
                        hPosVals.push((posB[3] - posA[3]) / 2 + posA[3]);
                    
                    } else {
                        if (posA[3] > posB[3]) {
                            posB[3] += (2 * Math.PI);
                        } else {
                            posA[3] += (2 * Math.PI);
                        }
                    }
                    
                    vPosVals.push((posB[4] - posA[4]) / 2 + posA[4]);
                }
                
                
                xPosVals.push(posB[0]);
                yPosVals.push(posB[1]);
                zPosVals.push(posB[2]);
                hPosVals.push(posB[3]);
                vPosVals.push(posB[4]);
                
                
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
                            camera_end();
                        }
                        
                    }, cameraIntervalMs);
                    
                }, 1000);
                
                return;
            }
            
            function step_camera(durations) {
                
                durations = durations.map(n => n * 1000 * durations.length);
                
                var positions = [posA];
                positions.push(...midPos);
                positions.push(posB);
                
                cameraInterval = true;
                
                function camera_step(currPos) {
                    
                    setTimeout(() => {
                        dew.command("Camera.Position " + positions[currPos][0] + " " + positions[currPos][1] + " " + positions[currPos][2] + " " + positions[currPos][3] + " " + positions[currPos][4]);
                        
                        if (cameraInterval && currPos < durations.length) {
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