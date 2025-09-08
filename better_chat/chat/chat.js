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



// Player Join&Leave Modifs
var prevPlayers = [];

setInterval(() => {
    
    dew.getSessionInfo().then(function(session_info) {
        
        if (session_info.established) {
            
            dew.command('Server.ListPlayersJSON', {}).then(function(response) {
                
                var currPlayers = JSON.parse(response).map(x => x.name).filter(x => x.trim() != "");
                
                if (prevPlayers.length != 0) {
                    prevPlayers
                        .filter(x => x.trim() != "")
                        .filter(x => !currPlayers.includes(x))
                        .forEach(x => dew.notify("chat", { message: x + " left.", sender: "Activity", chatType: "DEBUG", color: "#7B00FF" }));
                        
                    currPlayers
                        .filter(x => x.trim() != "")
                        .filter(x => !prevPlayers.includes(x))
                        .forEach(x => dew.notify("chat", { message: x + " joined.", sender: "Activity", chatType: "DEBUG", color: "#7B00FF" }));
                }
                
                prevPlayers = currPlayers;
            });
        }
    });
    
}, 1000);


// Chat History Modifs
var saved_chats = [];
var saved_chatbox_value = "";
var saved_chat_curr_index = -1;


$(document).ready(function(){
    $(document).keyup(function (e) {
        if (e.keyCode === 27) {
            chatboxHide();
            
            // Chat History Modifs
            saved_chatbox_value = "";
            saved_chat_curr_index = -1;
        }
        if (e.keyCode == 44) {
            dew.command('Game.TakeScreenshot');  
        }
    });
    $(document).keydown(function(e){
        if (e.keyCode === 13){ //Enter
            
            
            // Chat History Modifs
            saved_chats.unshift($("#chatBox").val());
            saved_chatbox_value = "";
            saved_chat_curr_index = -1;
            if (saved_chats.length > 25) { // Truncate saved_chats if needed
                saved_chats = saved_chats.slice(0, 25);
            }
            
            
            dew.sendChat($("#chatBox").val(), isTeamChat);
            chatboxHide();
        }else{
            if (e.keyCode !== 17 && e.keyCode !== 67) {
                $("#chatBox").focus();
            }
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
        //$("#chatBox").focus();
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
        
        
        
        // Chat History Modifs
        if (e.keyCode == 38) { // Up Key
            if (saved_chats.length != 0 && saved_chat_curr_index < (saved_chats.length - 1)) {
                if (saved_chat_curr_index == -1) {
                    saved_chatbox_value = $("#chatBox").val();
                }
                saved_chat_curr_index++;
                $("#chatBox").val(saved_chats[saved_chat_curr_index]);
            }
        }
        if (e.keyCode == 40) { // Down Key
            if (saved_chat_curr_index >= -1) {
                if (saved_chat_curr_index > -1) {
                    saved_chat_curr_index--;
                }
                if (saved_chat_curr_index == -1) {
                    $("#chatBox").val(saved_chatbox_value);
                } else {
                    $("#chatBox").val(saved_chats[saved_chat_curr_index]);
                }
            }
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
	if(e.data.chatType == "SERVER" || e.data.chatType == "DEBUG")
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