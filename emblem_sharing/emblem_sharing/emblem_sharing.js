dew.on("signal-ready", function (info) {
    startConnection(info.data);
});

var serverCon;

async function OnMessage(msg) {
    try {
        if (msg.data === "bad password") {
            console.error("[emblem_sharing.js] bad password");
            return;
        }
        
        if (msg.data === "try again later") {
            setTimeout(async function () {
                const resp = await dew.command("Server.WebsocketInfo");
                if (resp != "No session available") {
                    var info = JSON.parse(resp);
                    serverCon.send(info.password);
                }
            }, 5000);
            return;
        }

        var data = JSON.parse(msg.data);
        
        //console.log("[emblem_sharing.js] data:");
        //console.log(data);
        
        if (data.auth) {
            serverCon.send(JSON.stringify({
                "broadcast": "emblem-presence",
                "emblem": getOwnEmblemData()
            }));
        }
        
        if (data.broadcast) {
            
            if (data.emblem !== undefined && data.emblem !== null) {
                parseEmblem(data.emblem, data.uid);
            }
            
            serverCon.send(JSON.stringify({
                "sendTo": data.uid,
                "emblem": getOwnEmblemData()
            }));
        }
        
        if (data.sendTo && data.emblem) {
            if (data.emblem !== undefined && data.emblem !== null) {
                parseEmblem(data.emblem, data.uid);
            }
        }
        
        if (data.leave) {
            dew.notify("clear-player-emblem", {uid: data.leave});
        }
        
    
    } catch(err) {
        console.error('[emblem_sharing.js] Failed to handle message from signal server', err);
    }
}

function getOwnEmblemData() {
    if (localStorage.getItem("emblem") !== null) {
        try {
            var emblem_data = JSON.parse(localStorage.getItem("emblem"));
            return emblem_data;
            
        } catch (err) {
            console.error("[emblem_sharing.js]", err);
            return null;
        }
        
    } else {
        console.error("[emblem_sharing.js] No custom emblem setup");        
        return null;
    }
}

function parseEmblem(emblem_data, uid) {
    
    var data = new Uint8ClampedArray(emblem_data);
    
    if (data.length != 64 * 64 * 4) {
        console.error("[emblem_sharing.js] Received emblem invalid size:", data.length);
        return;
    }
    
    try {
    
        var tmp_canvas = document.createElement('canvas');
        tmp_canvas.width = 64;
        tmp_canvas.height = 64;
        var tmp_ctx = tmp_canvas.getContext('2d');
        
        var offset = 0;            
        for(var y = 0; y < tmp_canvas.height; y++) {
            for(var x = 0; x < tmp_canvas.width; x++) {
                tmp_ctx.fillStyle = "rgba(" + data[offset] + ", " + data[offset + 1] + ", " + data[offset + 2] + ", " + data[offset + 3] / 255.0 + ")";
                tmp_ctx.fillRect(x, y, 1, 1);
                offset += 4;
            }
        }
    } catch (err) {
        console.error("[emblem_sharing.js] Error recreating emblem using canvas:", err);
    }
    
    dew.notify("emblem-data", { uid: uid, data: tmp_canvas.toDataURL('image/png') });
}


var mutex = false;
async function startConnection(info) {
    if(mutex){
        return;
    }
    mutex = true;
    
    if(serverCon) {
        clearConnection();
    }

    if (info.password == "") {
        return;
    }    

    serverCon = new WebSocket("ws://" + info.server, "emblem-sharing");
    serverCon.onmessage = OnMessage;
    serverCon.onclose = function (reason) {
        console.log("[emblem_sharing.js] disconnected from signal server: " + reason.reason);
        clearConnection();
        if(!reason.wasClean) {
            setTimeout(retry, 3000);
        }
    }
    serverCon.onopen = function () {
        setTimeout(function () {
            serverCon.send(info.password);
            console.log("[emblem_sharing.js] sent password");
        }, 500);
    }

    dew.command("VOIP.Update", {}); //trigger initial voip variable
    mutex = false;
}

async function retry() {
    const resp = await dew.command("Server.WebsocketInfo");
    if (resp != "No session available") {
        var info = JSON.parse(resp);
        await startConnection(info);
    }
}

function clearConnection() {
    try {
        if(serverCon){
            serverCon.close();
            serverCon = undefined;
        }
    } catch (err) {
        console.error("[emblem_sharing.js]", err);
    }
}