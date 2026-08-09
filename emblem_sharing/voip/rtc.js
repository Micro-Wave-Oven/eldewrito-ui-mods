var peers = {};
var localStream = null;
var serverCon;
var hasMic = false;
var peerConnectionConfig;

var speaking = [];
var Microphone, EchoCancellation, AGC, NoiseSupress, PushToTalk;
var defaultIncomingVolume = 1.0;
var OutgoingVolume = 1.0;

var audioCtx = new AudioContext();
const globalGainNode = audioCtx.createGain();
globalGainNode.gain.value = defaultIncomingVolume;
globalGainNode.connect(audioCtx.destination);

var localCtx = new AudioContext();
var localGainNode = localCtx.createGain();

var isListeningToMicrophone = false;
var localTestStream = null;
const listenAudio = new Audio();

var maximumBitrate = 32000;

console.log = () => {};

async function OnMessage(msg) {
    try {
        if (msg.data === "bad password") {
            console.log("bad password");
            return;
        } else if (msg.data === "try again later") {
            setTimeout(async function () {
                const resp = await dew.command("server.websocketinfo");
                if (resp != "No session available") {
                    var info = JSON.parse(resp);
                    serverCon.send(info.password);
                }
            }, 5000);
            return;
        }

        var data = JSON.parse(msg.data);
        
        if(data.auth) {
            console.log('Received auth from the server. my uid:', data);
            myUid = data.uid;
            peerConnectionConfig = { 
                iceServers: data.iceServers 
            };
            // let the other peers know we are ready
            serverCon.send(JSON.stringify({
                "broadcast": "garbage"
            }));
            console.log('Sent broadcast');
        } else if (data.broadcast) {
            console.log("Received broadcast from peer ", data.uid);
            await createPeer(data);
        } else if (data.sendTo) { //message direct to us
            await createPeer(data);

            if (data.sdp) {  
                const peer = peers[data.uid];
                console.log(`Received ${data.sdp.type} from ${peer.uid}`);
                
                // perform perfect-negotiation
                const offerCollision = data.sdp.type === "offer"  && (peer.makingOffer || peer.connection.signalingState !== "stable");
                if(offerCollision) {
                    console.warn('Offer collision detected with peer ', peer.uid);
                }
                peer.ignoreOffer = peer.uid < myUid && offerCollision;
                if(peer.ignoreOffer) {
                    console.warn('Ignoring offer');
                    return;
                }

                //whether we are getting an answer or offer, set remote peer description
                await peer.connection.setRemoteDescription(new RTCSessionDescription(data.sdp));

                if(data.sdp.type === 'offer') {   
                    await peer.connection.setLocalDescription();
                    console.log(`Sending ${peer.connection.localDescription.type} to ${data.uid}`);
                    serverCon.send(JSON.stringify({
                        'sdp': peer.connection.localDescription,
                        'sendTo': data.uid
                    }));
                }
            }
            else if (data.ice) {
                const peer = peers[data.uid];
                if(!peer) {
                    return; // we don't know this peer
                }

                console.log(`Ice candidates received from ${peer.uid}`);

                try {
                    peer.connection.addIceCandidate(new RTCIceCandidate(data.ice));
                } catch (err) {
                    if (!peer.ignoreOffer) {
                        console.error(err);
                    }
                }
            }
        }
        else if (data.leave) { //leave has the uid of leaving peer
            console.log("Asked to remove peer ", data.leave);
            removePeer(data.leave);
        }
    } catch(err) {
        console.error('Failed to handle message from signal server', err);
    }
}

async function createPeer(data) {
    if (peers[data.uid]) {
        return;
    }

    const connection = new RTCPeerConnection(peerConnectionConfig);
    const channel = connection.createDataChannel("voip", { negotiated: true, ordered: true, id: 0 });

    const peer = peers[data.uid] = {
         //peer information
        uid: data.uid,
        user: data.uid.split("|")[0],
         //speaking
        speakingVolume: -Infinity,
        lastSpoke: 0,
          //stream and processing
        gainNode: null,
        audioObj: null,
        // rtc
        ignoreOffer: false,
        connection
    };

    console.log(`Peer created: ${peer.uid}`);

    channel.onmessage = (event) => {
        const message = JSON.parse(event.data);
        // {
        //     request,
        //     data
        // }

        //for now we only handle requested bitrate
        if(message.request === 'bitrate'){
            var newBitrate = message.data;
            if(typeof newBitrate === 'number'){
                if(newBitrate > maximumBitrate) //limit to our maximum
                    newBitrate = maximumBitrate;

                const senders = connection.getSenders();
                senders.forEach((sender)=>{ //apparently the first track may not be the audio track so check all of them
                    if(sender.track.kind === 'audio'){
                        const params = sender.getParameters();
                        if(!params.encodings){
                            params.encodings = [{}];
                        }
                        params.encodings[0].maxBitrate = newBitrate;
                        sender.setParameters(params);
                    }
                });
            }
        }
        
        
        // Custom Emblem Modifications
        if (message.request === "emblem_request") {
            console.log("Received emblem request");
            if (localStorage.getItem("emblem") !== null) {
                console.log("Sending emblem");
                var emblem_data = JSON.parse(localStorage.getItem("emblem"));
                channel.send(JSON.stringify({
                    request: "emblem",
                    data: emblem_data
                }));
            }
        }
        if (message.request === "emblem") {
            
            var data = new Uint8ClampedArray(message.data);
            
            if (data.length != 64 * 64 * 4) {
                console.log("Received emblem invalid size");
                console.log(data.length);
                return;
            }
            
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
            
            dew.notify("emblem-data", { uid: peer.uid, data: tmp_canvas.toDataURL('image/png') });
        }
    }
    
    
    // Custom Emblem Modifications
    channel.onopen = (e) => {
        setTimeout(() => {
            channel.send(JSON.stringify({
                request: "emblem_request",
                data: {}
            }));
        }, 500);
    };
     
    connection.ontrack = (event) => {
        console.log('Got stream from ' + peer.uid);
    
        const username = peer.user;  
        const stream = event.streams[0];
    
        if(!peer.audioObj) {
            peer.audioObj = new Audio();   
            peer.gainNode = audioCtx.createGain();
            peer.gainNode.gain.value = defaultIncomingVolume;
            peer.gainNode.connect(globalGainNode);
            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(peer.gainNode);
            peer.sourceContext = source;
        }
        peer.audioObj.muted = true;
        peer.audioObj.srcObject = stream;
        peer.audioObj.play();
        
      
        peer.speech = window.hark(stream, {
            "threshold": "-80",
            "interval": "100"
        });
        peer.speech.on("speaking", function () {
            speak(username, peer);
        });
        peer.speech.on("stopped_speaking", function () {
            stopSpeak(username, peer);
        });
        peer.speech.on("volume_change", function (volume) {
            peer.speakingVolume = volume;
            var speaker = {
                user: username,
                volume: volume,
                peerLevel: peer.gainNode.gain.value
            };
            peer.lastSpoke = (new Date).getTime();
    
            dew.notify("voip-user-volume", speaker);
        });

        //some jank
        //retry asking to set bitrate
        var tries = 0;
        const retry = setInterval(() => {
            if(tries > 4){
                clearInterval(retry);
                return;
            }

            if(channel.readyState !== 'open'){
                tries++;
            }
            else{
                channel.send(JSON.stringify({
                    request: "bitrate",
                    data: maximumBitrate
                }));
                clearInterval(retry);
            }
        }, 1000);
        
    };

    connection.onicecandidate = (event) => {
        if (event.candidate != null) {
            console.log('Sending ice candidates to ' + peer.uid);
            serverCon.send(JSON.stringify({
                'ice': event.candidate,
                'sendTo': peer.uid
            }));
        }
    };

    connection.oniceconnectionstatechange = (event) => {
        console.log('ice connecton state changed', peer.uid, peer.connection.iceConnectionState);  
        if(peer.iceConnectionState === 'failed') {
            peer.restartIce();
        }
    };

    // connection.onicecandidateerror = (event) => {
    //     console.error(`${event.errorText}. URL: ${event.url}`, event);
    // };

    connection.onconnectionstatechange = (event) => {
        console.log('connection state changed', peer.uid, connection.connectionState);
        
        if(connection.connectionstate === 'failed') {
            setTimeout(() => {
                if(connection?.connectionState === 'failed') {
                    connection.restartIce();
                }
            }, 3000);
        }
    };

    connection.onclose = (event) => {
        removePeer(peer.uid);
    };

    connection.onnegotiationneeded = async () => {
        try {
            console.log('Starting negotiation with peer ', peer.uid);
            peer.makingOffer = true;
            peer.ignoreOffer = false;
            await peer.connection.setLocalDescription();     
            serverCon.send(JSON.stringify({
                'sdp': peer.connection.localDescription,
                'sendTo': peer.uid
            }));
            console.log("Sent offer to peer ", peer.uid);
        } catch(err) {
            console.error(err);
        } finally {
            peer.makingOffer = false;
        }
    };

    if (localStream) {
        peer.sender = connection.addTrack(localStream.getTracks()[0], localStream);
    } else {
    }
}

function removePeer(uid) {
    if(!peers[uid]) {
        return;
    }

    console.log(`Removing peer ${uid}`);

    try {
        peers[uid].connection.close();
    } catch (err) {
        console.error(err);
    }

    delete peers[uid];
    dew.notify("voip-user-leave", { "user": uid });
    stopSpeak(uid.split("|")[0]);
}

function clearConnection() {
    dew.callMethod("voipConnected", { "value": false });

    try {
        if(serverCon){
            serverCon.close();
            serverCon = undefined;
        }
    } catch (err) {
        console.error(err);
    }
    
    for(const id in peers) {
        removePeer(id);
    }
}


async function getDeviceConstraints() {
    const constraints = {
        video: false,
        audio: {
            echoCancellation: EchoCancellation,
            autoGainControl: AGC,
            noiseSuppression: NoiseSupress
        }
    };

    if(Microphone != "" && Microphone != "default") {
        const dev = await navigator.mediaDevices.enumerateDevices();
        console.log(dev, Microphone);
        constraints.audio.deviceId = dev.find(d => d.label === Microphone)?.deviceId ?? undefined;
    }

    return constraints;
}

async function initLocalStream() {
    if(Microphone === undefined){
        await dew.command('VoIP.update', {})
    }

    //reset and clear existing streams
    closeStream(localStream);
    closeStream(localTestStream);
    localStream = null;
    localTestStream = null;
    localCtx.close();
    localCtx.destination.disconnect();
    localGainNode.disconnect();
    localCtx = new AudioContext();

    const constraints = await getDeviceConstraints();
    let stream;
    try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        hasMic = true;
    } catch(err) {
        const dummyDestination = audioCtx.createMediaStreamDestination();
        stream = dummyDestination.stream;
    }

    stream.getTracks()[0].onended = async () => {
        console.error('local stream track ended unexpected');
    };
    
    //create local gain node so that the output volume can be controlled
    let sourceNode = localCtx.createMediaStreamSource(stream);
    localGainNode = localCtx.createGain();
    sourceNode.connect(localGainNode);
    let streamDestination = localCtx.createMediaStreamDestination();
    localGainNode.connect(streamDestination);
    
    localGainNode.gain.value = OutgoingVolume;
    
    localStream = streamDestination.stream
    localTestStream = streamDestination.stream.clone();

    var speechEvents = hark(localStream, {
        "threshold": "-80",
        "interval": "100"
    });
    speechEvents.on('speaking', function () {
        if (serverCon != undefined) {
            dew.callMethod("voipSpeaking", {
                "value": true
            });
        }
    });
    speechEvents.on('stopped_speaking', function () {
        if (serverCon != undefined) {
            dew.callMethod("voipSpeaking", {
                "value": false
            });
        }
    });

    speechEvents.on("volume_change", function (volume) {
        var selfVolume = {
            volume: volume
        }

        dew.notify("voip-self-volume", selfVolume);
    });
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

    if (info.password == "") //not-connected
        return;

    try {
        await initLocalStream();
    } catch(err) {
        console.err('Failed to init local stream', err);
        return;
    }

    serverCon = new WebSocket("ws://" + info.server, "dew-voip");
    serverCon.onmessage = OnMessage;
    serverCon.onclose = function (reason) {
        console.log("disconnected from signal server: " + reason.reason);
        clearConnection();
        if(!reason.wasClean) {
            setTimeout(retry, 3000);
        }
    }
    serverCon.onopen = function () {
        setTimeout(function () {
            serverCon.send(info.password);
            console.log("sent password");
            dew.callMethod("voipConnected", {
                "value": true
            });
        }, 500);
    }

    dew.command("voip.update", {}); //trigger initial voip variable
    mutex = false;
}

function setVolume(uid, volume) {
    try {
        console.log('setVolume', uid, volume);
        if(peers[uid]) {
            peers[uid].gainNode.gain.value = volume;
        }
    } catch(err) {
        console.error('Failed to set peer volume', uid);
    }
}

async function retry() {
    const resp = await dew.command("server.websocketinfo");
    if (resp != "No session available") {
        var info = JSON.parse(resp);
        await startConnection(info);
    }
}

function PTT(toggle) {
    if(!isListeningToMicrophone)
        localStream.getAudioTracks()[0].enabled = toggle.talk;
}

function peerLastSpeak(peer) {
    if ((new Date).getTime() - peer.lastSpoke > 2000)
        stopSpeak(peer.user, peer);
}


function removeElement(element) {
    element && element.parentNode && element.parentNode.removeChild(element);
}

function addToSpeakingPlayersList(user) {
    //push everyone down
    if ($("#speaking > p").length > 0) {
        $("#speaking > p").each(function () {
            y = $(this).height() * ($(this).index() + 1);
            $(this).css({
                'transform': 'translate(' + 0 + 'px, ' + y + 'px)',
                'transition': 'all 300ms ease'
            });
        });
    }

    $("<p id=\"" + user + "\">" + user + "</p>").prependTo("#speaking").css({
        'transform': 'translate(0px, -100px)', //offscreen
        'transition': 'all 300ms ease'
    });

    setTimeout(function () { //drag in from offscreen
        $("#" + escapeElementID(user)).css({
            'transform': 'translate(0px, 0px)',
            'transition': 'all 300ms ease'
        });
    }, 25);
}

function escapeElementID(user) {
    return user.split(' ').join('\\ ');
}

function removeFromSpeakingPlayersList(user) {
    var thisUser = $("#" + escapeElementID(user));
    var index = thisUser.index();
    if ($("#speaking > p").length > 0) {
        $("#speaking > p").each(function () {
            if ($(this).index() < index)
                return; //this user does not need to move
            else if ($(this).index() > index) {
                y = $(this).height() * $(this).index() - $(this).height();
                $(this).css({
                    'transform': 'translate(' + 0 + 'px, ' + y + 'px)',
                    'transition': 'all 300ms ease'
                });
            } else {
                y = $(this).height() * ($(this).index() + 1) - $(this).height();
                thisUser.css({
                    'transform': 'translate(-200px, ' + y + 'px)', //offscreen
                    'transition': 'all 300ms ease'
                });
                setTimeout(function () {
                    thisUser.remove();
                }, 300);
            }
        });
    }
}

function populateSpeakingPlayersList() {
    speaking.forEach(function (element) {
        addToSpeakingPlayersList(element);
    });
}

function destroySpeakingPlayersList() {
    //Destroy names
    if ($("#speaking > p").length > 0) {
        $("#speaking > p").each(function () {
            $(this).remove();
        });
    }
}

//true if last time somebody talked/stopped talking it was shown on the HUD.
var previouslyDisplayedSpeakersOnHUD = false; //Mainmenu is overlay, so defaults to false.

function speak(user, peer) {
    var speaker = {
        user: user,
        volume: peer.speakingVolume,
        isSpeaking: true
    }
    dew.notify("voip-speaking", speaker);

    if (peer.gainNode.gain.value == 0) //prevent name from showing if they are muted
        return;

    dew.getSessionInfo().then(function (info) {
        dew.callMethod("isMapLoading", {}).then(function (mapLoadingRes) {
            dew.command('VoIP.SpeakingPlayerOnHUD').then(function (hudToggleRes) {

                dew.callMethod("playerSpeaking", {
                    "name": user,
                    "value": true
                });

                if ($.inArray(user, speaking) == -1) {

                    speaking.push(user);

                    //If the player is on the mainmenu, or doesn't want the speaking player to appear on the HUD, use the Overlay.
                    if (info.mapName == "mainmenu" || JSON.parse(mapLoadingRes).loading || hudToggleRes == 0) {
                        if (previouslyDisplayedSpeakersOnHUD)
                            populateSpeakingPlayersList();
                        else
                            addToSpeakingPlayersList(user);

                        previouslyDisplayedSpeakersOnHUD = false;
                    } else {
                        if (!previouslyDisplayedSpeakersOnHUD)
                            destroySpeakingPlayersList();
                        previouslyDisplayedSpeakersOnHUD = true;
                    }
                }
            });
        });
    });
};

function stopSpeak(user, peer) {
    var speaker = {
        user: user,
        volume: peer?.speakingVolume ?? 0,
        isSpeaking: false
    }

    dew.notify("voip-speaking", speaker);

    dew.getSessionInfo().then(function (info) {
        dew.callMethod("isMapLoading", {}).then(function (mapLoadingRes) {
            dew.command('VoIP.SpeakingPlayerOnHUD').then(function (hudToggleRes) {
                dew.callMethod("playerSpeaking", {
                    "name": user,
                    "value": false
                });

                var index = $.inArray(user, speaking);
                if (index != -1)
                    speaking.splice(index, 1);

                //If the player is on the mainmenu, or doesn't want the speaking player to appear on the HUD, use the Overlay.
                if (info.mapName == "mainmenu" || JSON.parse(mapLoadingRes).loading || hudToggleRes == 0) {
                    if (previouslyDisplayedSpeakersOnHUD)
                        populateSpeakingPlayersList();
                    else
                        removeFromSpeakingPlayersList(user);

                    previouslyDisplayedSpeakersOnHUD = false;
                } else {
                    if (!previouslyDisplayedSpeakersOnHUD)
                        destroySpeakingPlayersList();

                    previouslyDisplayedSpeakersOnHUD = true;
                }
            });
        });
    });
}

async function updateSettings(settings) {
    try {
        if (localStream && !isListeningToMicrophone) {
            if (settings.PTT_Enabled == 1) {
                localStream.getAudioTracks()[0].enabled = false;
            } else {
                localStream.getAudioTracks()[0].enabled = true;
            }
        }
    } catch (e) { }

    PushToTalk = settings.PTT_Enabled;
    Microphone = settings.MicrophoneID;
    EchoCancellation = settings.EchoCancellation;
    AGC = settings.AGC;
    NoiseSupress = settings.NoiseSupress;
    defaultIncomingVolume = settings.IncomingVolume;
    OutgoingVolume = settings.OutgoingVolume;
    maximumBitrate = settings.MaximumBitrate;
    
    console.log('settings updated', settings);

    globalGainNode.gain.value = defaultIncomingVolume;
    localGainNode.gain.value = OutgoingVolume;
    
    if(isListeningToMicrophone)
        await SetListenToAudioDevice(true);
    
    if (settings.Enabled == 0) {
        clearConnection();
    } else {
        if (serverCon == undefined) {
            const resp = await dew.command("server.websocketinfo", {});
            if (resp != "No session available") {
                var info = JSON.parse(resp);
                if(info.password != "not-connected")
                    await startConnection(info);
            }
        }
    }
}


$(document).ready(function () {
    console.log("Waiting for signal server");
    dew.on("signal-ready", function (info) {
        console.log("signal ready");
        startConnection(info.data);
    });

    dew.on("voip-ptt", function (state) {
        PTT(state.data);
    });

    dew.on("voip-settings", function (response) {
        updateSettings(response.data);
    });
    
    dew.on("voip-toggle-test-audio", function (response) {
        SetListenToAudioDevice(response.data.listen);
    });

    dew.on("show", function (args) {
        if (args.data.volume) {
            setVolume(args.data.volume.uid, args.data.volume.vol);
        }
    });
    dew.command("voip.update", {}).then(function () { }); //triggers update of settings
    dew.show();

    const stats = createStats(document.querySelector('#stats'));

    dew.command('VoIP.Stats').then((value) => {
        stats.toggle(value == 1);
    });

    dew.on('variable_update', (event) => {
        for(const { name, value } of event.data) {
            switch(name) {
                case 'VoIP.Stats':
                    stats.toggle(value === 1);
                    break;
            }
        }
    });
    
    dew.on('voip-reload', function (response) {
        // bit heavy handed, but only thing that works consistently
        location.reload(); 
    });
    
    dew.command("VoIP.ListenToMicrophone").then((value) => {
        if(value == 1)
            SetListenToAudioDevice(true);
    });
});

function closeStream(stream) {
    try {
        stream.getTracks().forEach(track => {
            track.stop()
        });
    } catch (e){};
    try {
        stream.getTracks().forEach(track => {
            stream.removeTrack(track);
        });
    } catch (e){};
}

navigator.mediaDevices.addEventListener('devicechange', async function(event) {
    // bit heavy handed, but only thing that works consistently
    location.reload(); 
});


async function SetListenToAudioDevice(enabled){
    isListeningToMicrophone = enabled;
    if(enabled){
        if(localTestStream == null){
            await initLocalStream();
        }
        localStream.getAudioTracks()[0].enabled = false; // disable main stream when listening so others dont hear you
        localTestStream.getAudioTracks()[0].enabled = true;
        listenAudio.srcObject = localTestStream;
        listenAudio.play();
    }else{
        if(localTestStream != null){
            localTestStream.getAudioTracks()[0].enabled = false;
            if(!PushToTalk)
                localStream.getAudioTracks()[0].enabled = true; // disable main stream when listening so others dont hear you
            listenAudio.srcObject = null;
        }
    }
}
