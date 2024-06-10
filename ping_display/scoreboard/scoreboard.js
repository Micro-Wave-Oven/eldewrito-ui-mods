var ingameVoteWidget = null;
var cachedPlayersInfo = null;
var repGP;
var hasGP = false;
var itemNumber = 0;
var axisThreshold = .5;
var stickTicks = { left: 0, right: 0, up: 0, down: 0 };
var medalSelection = 0;
var cardOpacity = 0.9;
var lastHeldUpdated = 0;
var playerVolumes = {};
var isVisible = false;
var localPlayer = "";
var breakdownPlayer = "";
var cachedPlayerList = [];
var disconnectedPlayers = [];
var showDisconnectedPlayers = false;
var initalKeyboardKey = false;
var initialShowTimout = false;

// ----------- constants

var settingsArray = { 'Settings.Gamepad': '0'};

const GAME_ENGINE_TYPE_NONE = 0,
    GAME_ENGINE_TYPE_CTF = 1,
    GAME_ENGINE_TYPE_SLAYER = 2,
    GAME_ENGINE_TYPE_ODDBALL = 3,
    GAME_ENGINE_TYPE_KOTH = 4,
    GAME_ENGINE_TYPE_SANDBOX = 5,
    GAME_ENGINE_TYPE_VIP = 6,
    GAME_ENGINE_TYPE_JUGGERNAUT = 7,
    GAME_ENGINE_TYPE_TERRITORIES = 8,
    GAME_ENGINE_TYPE_ASSAULT = 9,
    GAME_ENGINE_TYPE_INFECTION = 10,
    GAME_ENGINE_TYPE_COUNT = 11

const TEAM_DEFINITIONS = [
    { name: 'Red Team', color: '#620B0B' },
    { name: 'Blue Team', color: '#0B2362' },
    { name: 'Green Team', color: '#1F3602' },
    { name: 'Orange Team', color: '#BC4D00' },
    { name: 'Purple Team', color: '#1D1052' },
    { name: 'Gold Team', color: '#A77708' },
    { name: 'Brown Team', color: '#1C0D02' },
    { name: 'Pink Team', color: '#FF4D8A' }
];

var weaponDetails = [
    {name:'Generic Melee', 'string':'generic_melee'},
    {name:'Covenant Carbine', 'string':'carbine'},
    {name:'Guardians', 'string':'guardians_unknown'},
    {name:'Guardians', 'string':'guardians'},
    {name:'Falling Damage', 'string':'falling_damage'},
    {name:'Generic Collision', 'string':'generic_collision'},
    {name:'Armor Lock Crush', 'string':'armor_lock_crush'},
    {name:'Generic Explosion', 'string':'generic_explosion'},
    {name:'Magnum', 'string':'magnum'},
    {name:'Plasma Pistol', 'string':'plasma_pistol'},
    {name:'Needler', 'string':'needler'},
    {name:'Mauler', 'string':'mauler'},
    {name:'SMG', 'string':'smg'},
    {name:'Plasma Rifle', 'string':'plasma_rifle'},
    {name:'Battle Rifle', 'string':'battle_rifle'},
    {name:'Shotgun', 'string':'shotgun'},
    {name:'Sniper Rifle', 'string':'sniper_rifle'},
    {name:'Beam Rifle', 'string':'beam_rifle'},
    {name:'Assault Rifle', 'string':'assault_rifle'},
    {name:'Spiker', 'string':'spiker'},
    {name:'Fuel Rod Cannon', 'string':'fuel_rod_cannon'},
    {name:'Missile Pod', 'string':'missile_pod'},
    {name:'Rocket Launcher', 'string':'rocket_launcher'},
    {name:'Spartan Laser', 'string':'spartan_laser'},
    {name:'Brute Shot', 'string':'brute_shot'},
    {name:'Flamethrower', 'string':'flamethrower'},
    {name:'Sentinel Gun', 'string':'sentinel_gun'},
    {name:'Energy Sword', 'string':'energy_sword'},
    {name:'Gravity Hammer', 'string':'gravity_hammer'},
    {name:'Frag Grenade', 'string':'frag_grenade'},
    {name:'Plasma Grenade', 'string':'plasma_grenade'},
    {name:'Spike Grenade', 'string':'spike_grenade'},
    {name:'Firebomb Grenade', 'string':'firebomb_grenade'},
    {name:'Flag', 'string':'flag'},
    {name:'Bomb', 'string':'bomb'},
    {name:'Bomb Explosion', 'string':'bomb_explosion'},
    {name:'Ball', 'string':'ball'},
    {name:'Machinegun Turret', 'string':'machinegun_turret'},
    {name:'Plasma Cannon', 'string':'plasma_cannon'},
    {name:'Plasma Mortar', 'string':'plasma_mortar'},
    {name:'Plasma Turret', 'string':'plasma_turret'},
    {name:'Shade Turret', 'string':'shade_turret'},
    {name:'Banshee', 'string':'banshee'},
    {name:'Ghost', 'string':'ghost'},
    {name:'Mongoose', 'string':'mongoose'},
    {name:'Scorpion', 'string':'scorpion'},
    {name:'Scorpion Gunner', 'string':'scorpion_gunner'},
    {name:'Spectre', 'string':'spectre'},
    {name:'Spectre Gunner', 'string':'spectre_gunner'},
    {name:'Warthog', 'string':'warthog'},
    {name:'Warthog Gunner', 'string':'warthog_gunner'},
    {name:'Warthog Gauss Turret', 'string':'warthog_gauss_turret'},
    {name:'Wraith', 'string':'wraith'},
    {name:'Wraith Gunner', 'string':'wraith_gunner'},
    {name:'Tank', 'string':'tank'},
    {name:'Chopper', 'string':'chopper'},
    {name:'Hornet', 'string':'hornet'},
    {name:'Mantis', 'string':'mantis'},
    {name:'Prowler', 'string':'prowler'},
    {name:'Sentinel Beam', 'string':'sentinel_beam'},
    {name:'Sentinel RPG', 'string':'sentinel_rpg'},
    {name:'Teleporter', 'string':'teleporter'},
    {name:'Tripmine', 'string':'tripmine'},
    {name:'DMR', 'string':'dmr'}
];

var medalDetails = [
    {name:'Unknown1', 'string':'Unknown1', 'desc':'Last Man Standing?'},
    {name:'Unknown4', 'string':'Unknown4', 'desc':'Flag Kill?'},
    {name:'Perfection!', 'string':'perfection', 'desc':'Win a Slayer game without dying with at least 15 kills.'},
    {name:'Extermination!', 'string':'extermination', 'desc':'Wipe out an enemy team with at least an overkill.'},
    {name:'Killing Spree!', 'string':'killing_spree', 'desc':'Kill 5 opponents in a row without dying.'},
    {name:'Killing Frenzy!', 'string':'killing_frenzy', 'desc':'Kill 10 opponents in a row without dying.'},
    {name:'Running Riot!', 'string':'running_riot', 'desc':'Kill 15 opponents in a row without dying.'},
    {name:'Rampage!', 'string':'rampage', 'desc':'Kill 20 opponents in a row without dying.'},
    {name:'Untouchable!', 'string':'untouchable', 'desc':'Kill 25 opponents in a row without dying.'},
    {name:'Invincible!', 'string':'invincible', 'desc':'Kill 30 opponents in a row without dying.'},
    {name:'Shotgun Spree!', 'string':'shotgun_spree', 'desc':'Kill 5 opponents in a row with the shotgun without dying.'},
    {name:'Sword Spree!', 'string':'sword_spree', 'desc':'Kill 5 opponents in a row with the Energy Sword without dying.'},
    {name:'Sniper Spree!', 'string':'sniper_spree', 'desc':'Kill 5 opponents in a row with a sniper weapon without dying.'},
    {name:'Splatter Spree!', 'string':'splatter_spree', 'desc':'Splatter 5 opponents in a row using a vehicle without dying.'},
    {name:'Open Season!', 'string':'open_season', 'desc':'Kill 10 opponents in a row with the shotgun without dying.'},
    {name:'Slice n Dice!', 'string':'slice_n_dice', 'desc':'Kill 10 opponents in a row with the Energy Sword without dying.'},
    {name:'Sharpshooter!', 'string':'sharpshooter', 'desc':'Kill 10 opponents in a row with a sniper weapon without dying.'},
    {name:'Vehicular Manslaughter!', 'string':'vehicular_manslaughter', 'desc':'Splatter 10 opponents in a row using a vehicle without dying.'},
    {name:'Double Kill!', 'string':'double_kill', 'desc':'Kill 2 opponents within 4 seconds of each other.'},
    {name:'Triple Kill!', 'string':'triple_kill', 'desc':'Kill 3 opponents within 4 seconds of each other.'},
    {name:'Overkill!', 'string':'overkill', 'desc':'Kill 4 opponents within 4 seconds of each other.'},
    {name:'Killtacular!', 'string':'killtacular', 'desc':'Kill 5 opponents within 4 seconds of each other.'},
    {name:'Killtrocity!', 'string':'killtrocity', 'desc':'Kill 6 opponents within 4 seconds of each other.'},
    {name:'Killimanjaro!', 'string':'killimanjaro', 'desc':'Kill 7 opponents within 4 seconds of each other.'},
    {name:'Killtastrophe!', 'string':'killtastrophe', 'desc':'Kill 8 opponents within 4 seconds of each other.'},
    {name:'Killpocalypse!', 'string':'killpocalypse', 'desc':'Kill 9 opponents within 4 seconds of each other.'},
    {name:'Killionaire!', 'string':'killionaire', 'desc':'Kill 10 opponents within 4 seconds of each other.'},
    {name:'Beat Down!', 'string':'beat_down', 'desc':'Hit and kill an opponent with a melee attack.'},
    {name:'Assassin!', 'string':'assassin', 'desc':'Hit and kill an opponent with a melee attack from behind.'},
    {name:'Sniper Kill!', 'string':'sniper_kill', 'desc':'Kill an opponent with a Sniper Rifle or the Beam Rifle.'},
    {name:'Grenade Stick!', 'string':'grenade_stick', 'desc':'Kill an opponent by sticking them with a sticky or brute grenade.'},
    {name:'Laser Kill!', 'string':'laser_kill', 'desc':'Kill an opponent by using the Spartan Laser.'},
    {name:'Oddball Kill!', 'string':'oddball_kill', 'desc':'Get a melee kill when holding the oddball.'},
    {name:'Flag Kill!', 'string':'flag_kill', 'desc':'Get a melee kill with the flag.'},
    {name:'Splatter!', 'string':'splatter', 'desc':'Hit and kill an opponent with your vehicle.'},
    {name:'Incineration!', 'string':'incineration', 'desc':'Kill an opponent with a flame-based weapon.'},
    {name:'Killjoy!', 'string':'killjoy', 'desc':'End an opponents killing spree.'},
    {name:'Death from the Grave!', 'string':'from_the_grave', 'desc':'Kill an opponent after you have died.'},
    {name:'Highjacker!', 'string':'hijacker', 'desc':'Board a land-based vehicle by forcibly removing the opponent in it.'},
    {name:'Bulltrue!', 'string':'bulltrue', 'desc':'Kill an opponent that is in the act of a sword lunge.'},
    {name:'Wheelman!', 'string':'wheelman', 'desc':'Be the driver of a vehicle when a passenger kills an opponent.'},
    {name:'Skyjacker!', 'string':'skyjacker', 'desc':'Board an aircraft by forcibly removing the opponent in it.'},
    {name:'Killed Flag Carrier!', 'string':'flag_carrier_kill', 'desc':'Kill the opponent flag carrier in CTF.'},
    {name:'Flag Score!', 'string':'flag_captured', 'desc':'Score the flag in CTF.'},
    {name:'Killed Juggernaut!', 'string':'juggernaut_kill', 'desc':'Kill the Juggernaut in a Juggernaut game.'},
    {name:'Killed VIP!', 'string':'vip_kill', 'desc':'Kill an opponents VIP in a VIP game.'},
    {name:'Killed Bomb Carrier!', 'string':'bomb_carrier_kill', 'desc':'Kill an opponent bomb carrier in Assault.'},
    {name:'Bomb Planted!', 'string':'bomb_planted', 'desc':'Plant the bomb in Assault.'},
    {name:'Last Man Standing!', 'string':'last_man_standing', 'desc':'Be the last human in an infection game.'},
    {name:'Hail to the King!', 'string':'hail_to_the_king', 'desc':'Kill 5 opponents in a row from inside the hill before it moves.'},
    {name:'Infection Spree! ', 'string':'infection_spree', 'desc':'Kill 5 humans in a row as the zombie without dying.'},
    {name:'Zombie Killing Spree!', 'string':'zombie_killing_spree', 'desc':'Kill 5 zombies in a row as the human without dying.'},
    {name:'Juggernaut Spree!', 'string':'juggernaut_spree', 'desc':'Kill 5 opponents in a row as the Juggernaut without dying.'},
    {name:'Mmmm Brains!', 'string':'mmm_brains', 'desc':'Kill 10 humans in a row as the zombie without dying.'},
    {name:'Hells Janitor!', 'string':'hells_janitor', 'desc':'Kill 10 zombies in a row as the human without dying.'},
    {name:'Unstoppable!', 'string':'unstoppable', 'desc':'Kill 10 opponents in a row as the Juggernaut without dying.'},
    {name:'Steaktacular!', 'string':'steaktacular', 'desc':'Luke owes you a steak dinner.'},
    {name:'Linktacular!', 'string':'linktacular', 'desc':'Play in a matchmade game comprised of all Bungie.net users.'},
    {name:'Killed Vehicle!', 'string':'vehicle_kill', 'desc':'Destroy an enemy vehicle.'},
    {name:'Headshot!', 'string':'headshot', 'desc':'Kill an enemy with a headshot.'}
];


// ----------- reactive state

let appState = {
    valid: false,
    gameId: -1,
    rows: [],
	playerRows: [],
    hasTeams: false,
    expanded: false,
    multiround: false,
	roundCount: 0,
	currentRound: 0,
	roundOver: false,
	maxPlayers: 0,
	playerCount: 0,
    gameFinished: false,
    gameTied: false,
    gameType: 0,
	lobbyType: 0,
    isHost: false,
    playerContextMenuLeft: 0,
    playerContextMenuTop: 0,
    playerContextMenuShown: false,
    selectedPlayer: null,
    selectedPlayerVolume: 0,
    selectedPlayerMuted: false,
    playerVolumes: {},
};

// ----------- non-reactive state

let session = null;
let scores = null;

// ----------- vue components

Vue.component('player-row', {
    template: '#player-row-template',
    props: ['data'],
    data() { return appState },
	methods: {
		clickPlayer(e){
			if(e.disconnected)
				return;
			
			if($('#playerBreakdown').is(":visible") && breakdownPlayer == e.name)//prevent opening after the same screen has already been opened
				return;
			
			playerBreakdown(e.name);
			dew.playSound("a_button");
		},
		escapeName(name){
			return name.split(' ').join('\\ ');
		},
		toggleMuteSelectedPlayer(e) {
			dew.getSessionInfo().then(((result) => {
				if (result.playerInfo.Uid === e.uid) {
                    dew.playSound('error');
                    return;
                }
			
				let id = e.name + "|" + e.uid;
				let vol = "0";
				
				if(this.playerVolumes[id] == "0")
					vol = "100"
				
				dew.show("voip", {
					volume: {
						uid: id,
						vol: vol / 100.0
					}
				});
				this.playerVolumes[id] = vol;
				let currentVol = playerVolumes[e.name].currentVoice;
				if(currentVol < -100)
					currentVol = -100;
				
				dew.callMethod("playerVoipLevelChanged", {
					"name": e.name,
					"peerLevel": vol / 100.0,
					"currentVolume": currentVol
				});
			}));
		},
		hasSpoken(e){
			var playerVoip = playerVolumes[e.name];
			if(playerVoip && playerVoip.hasSpoken)
				return true;
			return false;
		},
		disconnected(e){
			if(e.disconnected)
				return true;
			return false
		}
		/*isInVoip(name){
			var playerVoip = playerVolumes[name];
			console.log("VOIP", playerVoip);
			if (playerVoip)
				return true;
			return false;
		}*/
	},
    computed: {
        color() {
            return appState.hasTeams ? TEAM_DEFINITIONS[this.data.teamIndex].color : this.data.color;
        },
        place() {
            if(!this.data || this.data.place === undefined || this.data.place < 0)
                return '';
            if(appState.hasTeams)
                return '';
            return (this.data.place+1);
        },
        isSelected() {
            return appState.selectedPlayer && appState.selectedPlayer.id == this.data.id;
        }
    }
});

Vue.component('team-row', {
    template: '#team-row-template',
    props: ['data'],
    data() { return appState },
    computed: {
        playerNameColumnSpan() {
            let span = 3;
            if (appState.expanded) {
                switch (appState.gameType) {
                    case GAME_ENGINE_TYPE_KOTH: span += 4; break;
                    case GAME_ENGINE_TYPE_ODDBALL: span += 2; break;
                    case GAME_ENGINE_TYPE_CTF: span += 2; break;
                    default: span += 4; break;
                }
            }
            return span;

        },
        place() {
            if(!this.data || this.data.place === undefined || this.data.place < 0)
                return '';
            if(!appState.hasTeams) 
                return '';
            return (this.data.place+1);
        }
    }
});


const App = new Vue({
    el: '#app',
    data() { return appState; },
    computed: {
        winnerName() {
            let name = this.rows[0].name;
            if(!name)
                return '';
                      return name
        },
        playerNameColumnSpan() {
            return 3;
        }
    },
    methods: {
        openPlayerContextMenu(e, player) {
			if(player.disconnected){
				dew.playSound('error');
                return;
			}
			dew.getSessionInfo().then(((result) => {
				if (result.playerInfo.Uid === player.uid) {
                    dew.playSound('error');
                    return;
                }
			
				let containerRect = e.target.getBoundingClientRect();
				let scaleX = e.target.clientWidth / (containerRect.right - containerRect.left),
					scaleY = e.target.clientHeight / (containerRect.bottom - containerRect.top);

				this.selectedPlayer = player;
				this.playerContextMenuLeft = e.pageX * scaleX;
				this.playerContextMenuTop = e.pageY * scaleY;
				this.playerContextMenuShown = true;

				let voipID = player.name + '|' + player.uid;
				if (this.playerVolumes[voipID])
					this.selectedPlayerVolume = this.playerVolumes[voipID];
				else
					this.selectedPlayerVolume = 100;
                
				this.selectedPlayerMuted = (this.selectedPlayerVolume == 0);
			}));
        },
        closePlayerContextMenu() {
            this.selectedPlayer = null;
            this.playerContextMenuShown = false;
        },
        banSelectedPlayer() {
            let player = this.selectedPlayer;
			dew.getSessionInfo().then(((result) => {
				if (result.playerInfo.Uid === player.uid) {
                    dew.playSound('error');
                    return;
                }
				dew.command("Server.KickBanUid " + player.uid);
			}));
        },
        kickSelectedPlayer() {
            let player = this.selectedPlayer;
			dew.getSessionInfo().then(((result) => {
				if (result.playerInfo.Uid === player.uid) {
                    dew.playSound('error');
                    return;
                }
				
				if (this.isHost) {
					dew.command("Server.KickUid " + player.uid);
				} else {
					dew.sendChat('!kickindex ' + player.playerIndex, false);
				}
			}));
        },
        reportSelectedPlayer() {
            let player = this.selectedPlayer;
            dew.getSessionInfo().then(((result) => {
                let playerIndex = player.playerIndex;
                let playerUid = player.uid;
                let playerName = player.name;

                if (result.playerInfo.Uid === playerUid) {
                    dew.playSound('error');
                    return;
                }

                dew.show('report', { playerIndex: playerIndex, playerName: playerName });
            }));
        },
        muteSelectedPlayer() {
            let player = this.selectedPlayer;
            this.setPlayerVolume(player.name, player.uid, (this.selectedPlayerMuted ? 100 : 0))
        },
        setPlayerVolume(name, uid, level) {
            let id = name + "|" + uid;
            dew.show("voip", {
                volume: {
                    uid: id,
                    vol: level / 100.0
                }
            });
            this.playerVolumes[id] = level;
			let currentVol = playerVolumes[name].currentVoice;
			if(currentVol < -100)
				currentVol = -100;
            
            this.selectedPlayerMuted = (level == 0)
            this.selectedPlayerVolume = level;
			
            dew.callMethod("playerVoipLevelChanged", {
                "name": name,
                "peerLevel": level / 100.0,
                "currentVolume": currentVol
            });
        },
        updateSelectedPlayerVolume() {
            let player = this.selectedPlayer;
            this.setPlayerVolume(player.name, player.uid, this.selectedPlayerVolume);
        }
    }
});

// ----------- dew event handlers

dew.on("variable_update", function(e){
    for(i = 0; i < e.data.length; i++){
        if(e.data[i].name in settingsArray){
            settingsArray[e.data[i].name] = e.data[i].value;
        }
    }
});

dew.on('scoreboard_update', function (e) {
    handleUpdate(e.data);
});

dew.on('scoreboard_reset', function (e) {
    // prevent the scoreboard showing stale data
    appState.valid = false;
    appState.selectedPlayer = null;
    appState.rows = [];
	appState.playerRows = [];
    appState.playerContextMenuShown = false;
	
	cachedPlayerList = [];
	disconnectedPlayers = [];
});

dew.on('scoreboard_hide', function (e) {
	hideScoreboard();
});

dew.on('voting_update', function (e) {
	dew.notify("voting_prior_stats", [appState.valid]);
});

$(document).ready(function(){
	$('#closeButton').off('click').on('click', function(e){
		hideScoreboard();
	});
	$('#modInfoButton').off('click').on('click', function(e){
		dew.show("mod_info");
		hideScoreboard();
	});

	ingameVoteWidget = dew.ingameVoting.makeWidget(document.getElementById('chatVoteWidget'));
	loadSettings(0);
});

dew.on('show', function (e) {
	if(isVisible)
		return;
	
	initialShowTimout = false;
	setTimeout(() => {
		initialShowTimout = true;
	}, 400);
	initalKeyboardKey = true;

	isVisible = true;
	
	dew.command("Player.name").then(function(result){
		localPlayer = result;
	});
	dew.command("Server.ShowDisconnectedPlayersClient").then(function(result){
		showDisconnectedPlayers = (result == "1" ? true : false);
	});
	
	dew.hide('ingame_voting');
	dew.captureInput(e.data.locked);
	if(e.data.update !== undefined)
		handleUpdate(e.data.update, e.data.animate);
	
	if(appState.lobbyType == 0 || appState.lobbyType == 5)
		appState.expanded = false;
	else
		appState.expanded = e.data.locked;
	
	if(!appState.valid){
	    dew.hide("scoreboard");
		return;
	}

	if(e.data.pregame)
	    $("#gameStarting").show();
	else
	    $("#gameStarting").hide();
	
	$("body").hide().fadeIn(100);
	if(e.data.locked){
		$('#closeButton').show();
		if(session && session.modName != "")
			$('#modInfoButton').show();
        ingameVoteWidget.focus();
		
		if(settingsArray['Settings.Gamepad'] == 1){
                onControllerConnect();
                hasGP = true;
                if(!repGP){
                    repGP = window.setInterval(checkGamepad,1000/60);
                }
            }else{
                onControllerDisconnect();
                hasGP = false;
                if(repGP){
                    window.clearInterval(repGP);
                    repGP = null;
                }
            }

	}else{
        ingameVoteWidget.blur();
		 $('#closeButton').hide();
		 $('#modInfoButton').hide();
	}
    
	ingameVoteWidget.render();
	
	dew.command("Server.NameClient", { internal: true }).then(function (name){
        $("#serverName").text(name);
    });

	dew.getMapVariantInfo().then(function (info) {
        $("#mapName").text(info.name);
    });

	if(session != null && session.modName != ""){
		document.querySelector("#modName").innerText = session.modName + " v" + session.modVersion;
		$('#serverName').addClass("serverNameOffset")
		$("#mapName").addClass("mapNameOffset");
	}else{
		document.querySelector("#modName").innerText = "";
		$('#serverName').removeClass("serverNameOffset");
		$("#mapName").removeClass("mapNameOffset");
	}

	if(hasGP && appState.expanded){
		updateSelection(itemNumber);
	}else
	if(hasGP && !appState.expanded){
		for(let i = 0; i < $('.clickable').length; i++) {
			$('.clickable').eq(i).css("box-shadow", "");
		}
	}
	
	if(e.data.animate){
		AnimatePlayerList();
	}else
	{
		$('#playerList').children().each(function(i, obj) {
			$(this).css("animation-delay","");
			$(this).removeClass("hiddenRow");
			$(this).removeClass("hiddenDisconnectedRow");
		});
	}

	
	window.addEventListener('mousedown', handleMouseDown);
});

async function AnimatePlayerList(){
	setTimeout(() => {
		let maxWait = 0;
		$('#playerList').children().each(function(i, obj) {
			$(this).removeClass("hidden");

			$(this).css("animation-delay", (0.04 * i) + "s");
			maxWait = 0.04 * i;
			
			if($(this).hasClass('disconnected')){
				$(this).addClass("hiddenDisconnectedRow");
			}else{
				$(this).addClass("hiddenRow");
			}
		});
		setTimeout(() => {
			for( let player of appState.rows){
				player.startHidden = false;
			}
		}, (maxWait+0.50)*1000);
	}, 150);
}

dew.on('hide', function(e) {
	initalKeyboardKey = false;
	initialShowTimout = false;
	isVisible = false;
	dew.show('ingame_voting');
    dew.captureInput(false);
    appState.selectedPlayer = null;
    appState.playerContextMenuShown = false;
    appState.expanded = false;
    closePlayerBreakdown(false);
	
	window.removeEventListener('mousedown', handleMouseDown);
});

function handleMouseDown(e) {
	if(e.button === 2){
		if($('#playerBreakdown').is(":visible")){
			closePlayerBreakdown(true);
		}
	}
}

function closePlayerBreakdown(sound) {
	breakdownPlayer = "";
	$('#playerBreakdown').hide();
	if(sound)
		dew.playSound("b_button");
}

dew.on('controllerinput', function(e) {
	if(hasGP){
		if(e.data.A == 1){
            if(!$('#playerBreakdown').is(":visible")){
				$('.clickable').eq(itemNumber).click();
            }
        }
        if(e.data.B == 1){
            if($('#playerBreakdown').is(":visible")){
                closePlayerBreakdown(true);
            } else {
                hideScoreboard(); 
            }
        }
        if (e.data.X == 1) {
            dew.show("mod_info");
			hideScoreboard();
        }
        if(e.data.Y == 1 && appState.expanded) {
            ingameVoteWidget.vote();
        }
        if(e.data.Up == 1) {
            upNav();
        }
        if(e.data.Down == 1){
            downNav();
        }
        if(e.data.Left == 1){
            leftNav();
        }
        if(e.data.Right == 1){
            rightNav();
        }
        if(e.data.LeftBumper == 1){
            if($('#playerBreakdown').is(":visible")){
                $('#previousPlayer').click();
            }
        }
        if(e.data.RightBumper == 1){
            if($('#playerBreakdown').is(":visible")){
                $('#nextPlayer').click();
            }
        }
        if(e.data.Select == 1){
            hideScoreboard();
        }
        if(e.data.AxisLeftX > axisThreshold){
            stickTicks.right++;
        }else{
            stickTicks.right = 0;
        }
        if(e.data.AxisLeftX < -axisThreshold){
            stickTicks.left++;
        }else{
            stickTicks.left = 0;
        }
        if(e.data.AxisLeftY > axisThreshold){
            stickTicks.up++;
        }else{
            stickTicks.up = 0;
        }
        if(e.data.AxisLeftY < -axisThreshold){
            stickTicks.down++;
        }else{
            stickTicks.down = 0;
        }
	}
});

// ----------- DOM event handlers

document.addEventListener('keyup', (e) => {
	if(e.keyCode == 9 && initalKeyboardKey && initialShowTimout)
	{
		initalKeyboardKey = false;
		hideScoreboard();
	}
});

document.addEventListener('keydown', (e) => {
	if(e.keyCode == 9){
		e.preventDefault();
	}
	
    if ((e.keyCode == 9 && !initalKeyboardKey) || e.keyCode == 130) {
        hideScoreboard();
    }
    if (e.keyCode == 84 || e.keyCode == 89) {
        let teamChat = false;
        if (e.keyCode == 89) { teamChat = true };
        dew.show("chat", { 'captureInput': true, 'teamChat': teamChat });
    }
    if (e.keyCode == 192 || e.keyCode == 112 || e.keyCode == 223) {
        dew.show("console");
    }
    if (e.keyCode == 27) {
		if($('#playerBreakdown').is(":visible")){
			closePlayerBreakdown(true);
		} else {
			hideScoreboard();
		}

    }
});

// ----------- misc functions

function handleUpdate(update, animate = false) {
    if (update && update.session) session = update.session;
    if (update && update.scores) scores = update.scores;

    if (!session || !update.scores)
        return;

    // copy new state into our app state
	appState.gameId = session.gameId;
	appState.gameType = session.gameType;
	appState.lobbyType = session.lobbyType;
	appState.multiround = session.numRounds > 1;
	appState.roundCount = session.numRounds;
	appState.currentRound = session.currentRound;
	appState.hasTeams = session.hasTeams;
	appState.isHost = session.isHost;
	if((session.lobbyType == 0 || session.lobbyType == 5) && session.sessionMaxPlayers > 4)
		appState.maxPlayers = 4;
	else
	appState.maxPlayers = session.sessionMaxPlayers;
	appState.playerCount = session.players.length;
	appState.gameFinished = scores.gameFinished;
	appState.gameTied = scores.gameTied;
	appState.roundOver = scores.roundOver;
	
	cachedPlayersInfo = session.playersInfo;
	
    let newCachedPlayerList = [];
    let rows = [];
    let playerRows = [];
    // add the player rows
    let active_team_mask = 0;
    for (let x = 0; x < session.players.length; x++){//{}player of session.players) {
        
        player = session.players[x];
        let scores = update.scores.playerScores[x];
        let playersInfo = session.playersInfo[player.playerIndex];
		let playersPingInfo = session.playersPingInfo.players;

		let showPing = false;
		let ping = "";
		
		if(typeof playersPingInfo !== "undefined"){
			let playerPing = playersPingInfo[player.playerIndex].ping;
			showPing = true;
			
			if(playerPing >= 0 && playerPing < 50)
				ping = "dew://assets/scoreboard/ping5.png";
			if(playerPing >= 50 && playerPing < 100)
				ping = "dew://assets/scoreboard/ping4.png";
			if(playerPing >= 100 && playerPing < 150)
				ping = "dew://assets/scoreboard/ping3.png";
			if(playerPing >= 150 && playerPing < 200)
				ping = "dew://assets/scoreboard/ping2.png";
			if(playerPing >= 200 && playerPing < 250)
				ping = "dew://assets/scoreboard/ping1.png";
			if(playerPing >= 250)
				ping = "dew://assets/scoreboard/ping0.png";
			
			// Ping Modifs
			ping = playerPing;
		}
        
         // don't show players that don't have valid team
        if(player.teamIndex == -1 || player.playerIndex == -1)
            continue;

        active_team_mask |= (1 << player.teamIndex);
        rows.push({
            ...player,
            ...scores,
            type: 0,
            id: `p${player.playerIndex}`,
            emblem: (playersInfo && playersInfo.e) ? playersInfo.e : player.emblem,
            showPing: showPing,
            ping: ping,
            rank: playersInfo !== undefined ? (playersInfo.r !== undefined ? playersInfo.r : -1) : -1,
            isDead: (update.scores.deadPlayerMask & (1 << player.playerIndex)) != 0,
            hasObjective: (update.scores.objectivePlayerMask & (1 << player.playerIndex)) != 0,
            startHidden: animate ? true : false,
        });
		
		playerRows.push(rows[x]);
		
		var playerListItem = [player, scores, playersInfo];
		
		if(playerListItem[0].uid != "0000000000000000" && playerListItem[0].name.length > 0)
			newCachedPlayerList.push(playerListItem);
    }
	
    if(showDisconnectedPlayers){
        for(let cachedPlayer = 0; cachedPlayer < cachedPlayerList.length; cachedPlayer++){
            let playerItem = cachedPlayerList[cachedPlayer];
			
            let isInNewCache = false;
            for(let newCachedPlayer = 0; newCachedPlayer < newCachedPlayerList.length; newCachedPlayer++){
                let newPlayerItem = newCachedPlayerList[newCachedPlayer];
				
                if(playerItem[0].uid == newPlayerItem[0].uid && playerItem[0].name == newPlayerItem[0].name){
                    isInNewCache = true;
                    break;
                }
            }
			
            if(!isInNewCache){
                let isDisconnected = false;
                for(let dPlayer = 0; dPlayer < disconnectedPlayers.length; dPlayer++){
                    let dPlayerItem = disconnectedPlayers[dPlayer];
                    if(playerItem[0].uid == dPlayerItem[0].uid && playerItem[0].name == dPlayerItem[0].name){
                        isDisconnected = true;
                        break;
                    }
                }
				
                if(!isDisconnected){
                    disconnectedPlayers.push(playerItem);
                }
            }
        }
		
        for(let dPlayer = 0; dPlayer < disconnectedPlayers.length; dPlayer++){
            let dPlayerItem = disconnectedPlayers[dPlayer];

            let playerRejoined = false;
            for(let newCachedPlayer = 0; newCachedPlayer < newCachedPlayerList.length; newCachedPlayer++){
                let newPlayerItem = newCachedPlayerList[newCachedPlayer];
				
                if(dPlayerItem[0].uid == newPlayerItem[0].uid && dPlayerItem[0].name == newPlayerItem[0].name){
                    playerRejoined = true;
                    break;
                }
            }
            if(playerRejoined){
                disconnectedPlayers.splice(dPlayer, 1);//remove player from disconnected list if they rejoined
                continue;
            }

            let player = dPlayerItem[0];
            let scores = dPlayerItem[1];
            let playersInfo = dPlayerItem[2];
			
            if(rows.length >= appState.maxPlayers)
                continue;
			
            // don't show players that don't have valid team
            if(player.teamIndex == -1)
                continue;
			
            let playerId = "" + player.name +":"+player.uid;
            player.playerIndex = -1;
			
            active_team_mask |= (1 << player.teamIndex);
            rows.push({
                ...player,
                ...scores,
                type: 0,
                id: `d${playerId}`,
                emblem: (playersInfo && playersInfo.e) ? playersInfo.e : player.emblem,
                rank: playersInfo !== undefined ? (playersInfo.r !== undefined ? playersInfo.r : -1) : -1,
                isDead: false,
                hasObjective: false,
                disconnected: true,
                startHidden: animate ? true : false,
            });
			
            playerRows.push(rows[rows.length-1]);
        }
		
        cachedPlayerList = newCachedPlayerList;
    }
    // if it's a team game, add the team rows
    if (appState.hasTeams) {
        for (let i = 0; i < 8; i++) {
            if (!((active_team_mask >> i) & 1))
                continue;
            let scores = update.scores.teamScores[i];
			if(showDisconnectedPlayers && update.scores.teamScores[i] == null)
				scores = {place: 0, score: 0, total: 0};
			
            rows.push({
                ...scores,
                ...TEAM_DEFINITIONS[i],
                type: 1,
                id: `t${i}`,
                teamIndex: i,
                startHidden: animate ? true : false,
            });
        }
    }
	
    // sort the rows
    rows.sort(compareScoreboardRows);
	playerRows.sort(compareScoreboardRows);
    appState.rows = rows;
	appState.playerRows = playerRows;
    // mark the scoreboard as valid so it will be shown
    appState.valid = true;
}

function hideScoreboard() {
	$('#playerBreakdown').hide();
	$('body').fadeOut(100, () => {
		dew.callMethod('scoreboardHide', {});
	});
}

function compareScorbeoardTeams(a, b) {
    if (!session.hasTeams)
        return b - a;

    let scoreA = scores.teamScores[a];
    let scoreB = scores.teamScores[b];
	
    if(showDisconnectedPlayers){
        if(scoreA == null)
            scoreA = {place: 0, score: 0, total: 0};
		
        if(scoreB == null)
            scoreB = {place: 0, score: 0, total: 0};
    }
	
    if(!scoreB || !scoreA)
        return b-a;

    if (appState.gameFinished && appState.multiround)
        return scoreB.total - scoreA.total;
    else
        return scoreB.score - scoreA.score;
}

function compareScoreboardPlayers(a, b) {
    if(!scores.playerScores[b] || !scores.playerScores[a])
        return b-a;

    if (appState.gameFinished && appState.multiround)
        return scores.playerScores[b].total - scores.playerScores[a].total;
    else
        return scores.playerScores[b].score - scores.playerScores[a].score;
}

function compareScoreboardRows(a, b) {
    let has_teams = appState.hasTeams;
    let a_has_valid_teamIndex = false;
    let b_has_valid_teamIndex = false;
    let result = 0;

    if (has_teams) {
        if (a.teamIndex >= 0 && a.teamIndex < 8)
            a_has_valid_teamIndex = true;
    }
    if (has_teams) {
        if (b.teamIndex >= 0 && b.teamIndex < 8)
            b_has_valid_teamIndex = true;
    }

    if (a.type == 1) {
        if (b.type == 1) {
            if (a_has_valid_teamIndex && b_has_valid_teamIndex) {
                result = compareScorbeoardTeams(a.teamIndex, b.teamIndex, a.type);
                if (result)
                    return result;
            }
            return a.teamIndex - b.teamIndex;
        }
        if (!b.type) {
            if (a.teamIndex == b.teamIndex)
                return -1;

            if (a_has_valid_teamIndex && b_has_valid_teamIndex) {
                result = compareScorbeoardTeams(a.teamIndex, b.teamIndex, 1);
                if (result)
                    return result;
            }
            return a.teamIndex - b.teamIndex;
        }
    }

    if (!a.type && b.type == 1) {
        if (a.teamIndex == b.teamIndex)
            return 1;
        if (a_has_valid_teamIndex && b_has_valid_teamIndex) {
            result = compareScorbeoardTeams(a.teamIndex, b.teamIndex, 1);
            if (result)
                return result;
        }
        return a.teamIndex - b.teamIndex;
    }

    if (has_teams) {
        if (a.teamIndex != b.teamIndex) {
            if (a_has_valid_teamIndex && b_has_valid_teamIndex) {
                result = compareScorbeoardTeams(a.teamIndex, b.teamIndex, 1);
                if (result)
                    return result;
            }
            return a.teamIndex - b.teamIndex;
        }
    }

    if (a.playerIndex == -1) {
        if (b.playerIndex == -1)
            return b.playerIndex - a.playerIndex;
        if (b.playerIndex != -1)
            return 1;
    }
    else if (b.playerIndex == -1) {
        return -1;
    }
    
    return a.place - b.place;
} 

function getPlayerIndex(name){
	for(let x = 0; x < appState.playerRows.length; x++){
		let player = appState.playerRows[x];
		if(player.name == name){
			return x;//player.playerIndex;
		}
	}
}

function playerBreakdown(name){
    breakdownPlayer = name;
	let playerIndex = getPlayerIndex(name);
	let currentPlayer = appState.playerRows[playerIndex];//getPlayerByIndex(playerIndex);
	let color = hexToRgb(currentPlayer.color, cardOpacity);
    if(cachedPlayersInfo[currentPlayer.playerIndex]){
        emblemPath = cachedPlayersInfo[currentPlayer.playerIndex].e ? cachedPlayersInfo[currentPlayer.playerIndex].e : currentPlayer.emblem;
    }else{
        emblemPath = currentPlayer.emblem;
    }     
    
    if(playerIndex==0){
        $('#previousPlayer').prop("disabled",true);
    }else{
        $('#previousPlayer').prop("disabled",false);      
        $('#previousPlayer').off('click').on('click', function(){
            dew.playSound("horizontal_navigation");
            playerBreakdown(appState.playerRows[playerIndex-1].name); 
        });            
    }
    if(playerIndex==(appState.playerRows.length-1)){
        $('#nextPlayer').prop("disabled",true);
    }else{
        $('#nextPlayer').prop("disabled",false);   
        $('#nextPlayer').off('click').on('click', function(){ 
            dew.playSound("horizontal_navigation");
            playerBreakdown(appState.playerRows[playerIndex+1].name); 
        });            
    }

    dew.getStats(name).then(function (stats){
        $('#playerBreakdown').show();
        medalSelection = 0;
        $('#playerName').text(name);  
        $('#playerName').css({'background-color': color});  
        $('#playerName').prepend('<img class="emblem player-emblem" src="'+emblemPath+'">' +  (stats.playerrank != -1 ? '<img class="player-rank" src="dew://assets/ranks/'+stats.playerrank+'.png">' : ''));
        
        let weaponArray = $.map(stats.weapons, function(value, index){
            let tempArray = {'Weapon': index};
            for (let prop in value){
				tempArray[prop] = value[prop];
            }
            return tempArray;
        });
        
        let kills = 0;
        let deaths = 0;
        let suicides = 0;
        let headshots = 0;
        $.each( weaponArray, function( index, value ){
            kills += value.Kills;
            deaths += value.KilledBy;
            suicides += value.SuicidesWith;
            headshots += value.HeadshotsWith;
        });
        
        $('#playerKills').text("Kills: "+kills);  
        $('#playerDeaths').text("Deaths: "+deaths);
        $('#playerKDSpread').text("K/D Spread: "+(kills-deaths));
        $('#playerSuicides').text("Suicides: "+suicides);
    
        weaponArray.sort(function(b, a){
            return parseFloat(a.Kills) - parseFloat(b.Kills);
        });
        $('#toolOfDestruction tbody').empty();
        if(weaponArray[0].Kills!=0){
            $('#toolOfDestruction tbody').append(
                $('<tr>')
                .append($('<td>').text(weaponDetails[weaponDetails.findIndex(x => x.string == weaponArray[0].Weapon)].name))
                .append($('<td>').text("Kills: "+weaponArray[0].Kills))
            );
        }else{
            $('#toolOfDestruction tbody').append("<tr><td>None</td></tr>"); 
        } 
        
        $('#killedMost').hide();
        $('#killedMost tbody').empty();
        let playerKilledArray = stats.playerkilledplayer;
        if(playerKilledArray.length > 0){
            $('#killedMost').show();
            playerKilledArray.sort(function(b, a){
                return parseFloat(a.Kills) - parseFloat(b.Kills);
            }); 
            let enemyIndex = appState.playerRows.findIndex(x => x.name == playerKilledArray[0].PlayerName);
            let bgColor = "#C0C0C0";
            if(enemyIndex > -1){ bgColor = appState.playerRows[enemyIndex].color; };
            $('#killedMost tbody').append(
                $('<tr>', {
                    class: 'player', 
                    id: playerKilledArray[0].PlayerName,
                    css: {
                        backgroundColor: hexToRgb(bgColor, 0.9)
                    }
                }).click(function(){
                    playerBreakdown($(this).attr('id'));
                })
                .append($('<td>').text(playerKilledArray[0].PlayerName)) //name
                .append($('<td>').text(playerKilledArray[0].Kills)) //kills
            );
        }    		

        $('#killedMostBy').hide();          
        $('#killedMostBy tbody').empty();
        let killedByArray = stats.playerkilledby;	
        if(killedByArray.length > 0){		
            $('#killedMostBy').show(); 			
            killedByArray.sort(function(b, a){
                return parseFloat(a.Kills) - parseFloat(b.Kills);
            }); 
            let enemyIndex = appState.playerRows.findIndex(x => x.name == killedByArray[0].PlayerName);
            let bgColor = "#C0C0C0";
            if(enemyIndex > -1){ bgColor = appState.playerRows[enemyIndex].color; };
            $('#killedMostBy tbody').append(
                $('<tr>', {
                    class: 'player', 
                    id: killedByArray[0].PlayerName,
                    css: {
                        backgroundColor: hexToRgb(bgColor, 0.9)
                    }
                }).click(function(){
                    playerBreakdown($(this).attr('id'));
                })
                .append($('<td>').text(killedByArray[0].PlayerName)) //name
                .append($('<td>').text(killedByArray[0].Kills)) //kills
            );
        }

        let medalArray = $.map(stats.medals, function(value, index){
            return {'name':index, 'count':value};
        });
                
        medalArray.sort(function(b, a){
            return parseFloat(a.count) - parseFloat(b.count);
        }); 
        
        if(medalArray[0].count!=0){
			let bigMedalImage = $('#bigMedalImage');
			bigMedalImage.attr('data-pak', 'game');
			bigMedalImage.attr('data-url', "assets/medals/" + medalArray[0].name);
			pakAwareContext.invalidateElement(bigMedalImage[0]);
			
            $('.medalName').text(medalDetails[medalDetails.findIndex(x => x.string == medalArray[0].name)].name);
            $('.medalDesc').text(medalDetails[medalDetails.findIndex(x => x.string == medalArray[0].name)].desc);
        }else{
			let bigMedalImage = $('#bigMedalImage');
			bigMedalImage.removeAttr('data-pak');
			bigMedalImage.removeAttr('data-url');
			bigMedalImage.removeAttr('data-fallback');
			bigMedalImage.removeAttr('src');
			
			
            $('.medalName').text(null);
            $('.medalDesc').text(null);
        }
        $('#medalBox').empty();
        for(i=0;i<10;i++){
            if(medalArray[i].count!=0){
                $('#medalBox').append(
                    $('<div>', {
                        class: 'medal',
                        id: medalArray[i].name,
                        html: "<span class='medalCount'>x "+medalArray[i].count+"</span>",
                        'data-medal-name': medalDetails[medalDetails.findIndex(x => x.string == medalArray[i].name)].name,
                        'data-medal-desc': medalDetails[medalDetails.findIndex(x => x.string == medalArray[i].name)].desc,
						html: [
							$('<span>', {
								class: 'medalCount',
								html: 'x ' + medalArray[i].count
							}),
							$('<img>', {
								class: 'medalImage',
								'data-pak': 'game',
								'data-url': 'assets/medals/' + medalArray[i].name
							})
						]
                    }).mouseover(function(){
						let bigMedalImage = $('#bigMedalImage');
						bigMedalImage.attr('data-pak', 'game');
						bigMedalImage.attr('data-url', "assets/medals/" + $(this).attr('id'));
						pakAwareContext.invalidateElement(bigMedalImage[0]);
						
                        $('.medalName').text($(this).attr('data-medal-name'));
                        $('.medalDesc').text($(this).attr('data-medal-desc'));
                    })
                );
            }
        }
		
		$('.medalImage').each(function() {
			pakAwareContext.invalidateElement(this);
		});
		
        let fillerCount = 10 - $('#medalBox').children().length;
        for(i=0;i<fillerCount;i++){
            $('#medalBox').append('<div class="medal empty">');
        }
    })
}

function loadSettings(i){
	if (i != Object.keys(settingsArray).length) {
		dew.command(Object.keys(settingsArray)[i], {}).then(function(response) {
			settingsArray[Object.keys(settingsArray)[i]] = response;
			i++;
			loadSettings(i);
		});
	}
}

function hexToRgb(hex, opacity){
    let r = parseInt(hex.substr(1,2), 16);
    let g = parseInt(hex.substr(3,2), 16);
    let b = parseInt(hex.substr(5,2), 16);
    return 'rgba('+ r + "," + g + "," + b + "," + opacity+")";
}

function onControllerConnect(){
    $('#closeButton').css('padding-left', '0.8vw');
    $('#closeButton').css('width', '4%');
    $('#closeButton .button').attr('src','dew://assets/buttons/360_Back.png');
    $('#modInfoButton').css('padding-left', '0.95vw');
    $('#modInfoButton').css('right', '11.7%');
    $('#modInfoButton').css('width', '5%');
    $('#modInfoButton .button').attr('src','dew://assets/buttons/360_X.png');
    $('#previousPlayer .button').attr('src','dew://assets/buttons/360_LB.png');
    $('#nextPlayer .button').attr('src','dew://assets/buttons/360_RB.png');
    $('#windowClose .button').attr('src','dew://assets/buttons/360_B.png');
    $('.button').show();
}

function onControllerDisconnect(){
    $('#closeButton').css('padding-left', '0');
    $('#closeButton').css('width', '');
    $('#closeButton .button').hide();
    $('#modInfoButton').css('padding-left', '0');
    $('#modInfoButton').css('right', '11%');
    $('#modInfoButton').css('width', '6%');
    $('#modInfoButton .button').hide();   
    $('#previousPlayer .button').hide();
    $('#nextPlayer .button').hide();  
    $('#windowClose .button').hide();  
    if($('.clickable').length){
        for(let i = 0; i < $('.clickable').length; i++) {
            $('.clickable').eq(i).css("box-shadow", "");
        }
    }    
}

function upNav(){
    if($('#playerBreakdown').is(":visible")){
        if(medalSelection > 4){
            medalSelection-=5;
            updateSelection(medalSelection)
        }
    }else{
        if(itemNumber > 0){
            itemNumber--;
            updateSelection(itemNumber);
        }
    }
}

function downNav(){
    if($('#playerBreakdown').is(":visible")){
        if(medalSelection < 5){
            medalSelection+=5;
            updateSelection(medalSelection)
        }
    }else{
        if(itemNumber < $('.clickable').length-1){
            itemNumber++;
            updateSelection(itemNumber);
        }    
    }    
}

function leftNav(){
    if($('#playerBreakdown').is(":visible")){
         if(medalSelection % 5 != 0){
            medalSelection--;
            updateSelection(medalSelection);
        }
    }
}

function rightNav(){
    if($('#playerBreakdown').is(":visible")){
        if(medalSelection % 5 != 4){
            medalSelection++;
            updateSelection(medalSelection);
        }  
    }    
}

function checkGamepad(){
    let shouldUpdateHeld = false;
    if(Date.now() - lastHeldUpdated > 100) {
        shouldUpdateHeld = true;
        lastHeldUpdated = Date.now();
    }
    if(stickTicks.up == 1 || (shouldUpdateHeld && stickTicks.up > 25)){
        upNav();
    }
    if(stickTicks.down == 1 || (shouldUpdateHeld && stickTicks.down > 25)){
        downNav();
    }
    if(stickTicks.left == 1 || (shouldUpdateHeld && stickTicks.left > 25)){
        leftNav();
    }
    if(stickTicks.right == 1 || (shouldUpdateHeld && stickTicks.right > 25)){
        rightNav();
    }
}


function updateSelection(item){
     if($('#playerBreakdown').is(":visible")){
        $('.medal').css('background-color','rgba(0, 0, 0, 0.3)');
        $('.medal').eq(item).css('background-color','rgba(255, 255, 255, 0.3)');
        if(!$('.medal').eq(item).hasClass('empty')){
			let bigMedalImage = $('#bigMedalImage');
			bigMedalImage.attr('id','bigMedalImage');
			bigMedalImage.attr('data-pak', 'game');
			bigMedalImage.attr('data-url', "assets/medals/" + $('.medal').eq(item).attr('id'));
			bigMedalImage.attr('data-fallback','dew://assets/emblems/generic.png');
			pakAwareContext.invalidateElement(bigMedalImage[0]);
			
            $('.medalName').text($('.medal').eq(item).attr('data-medal-name'));
            $('.medalDesc').text($('.medal').eq(item).attr('data-medal-desc'));
        }
     }else{
        if($('.clickable').length){
            for(let i = 0; i < $('.clickable').length; i++) {
				$('.clickable').eq(i).css("box-shadow", "");
            }
			$('.clickable').eq(item).css("box-shadow", "inset 1px 1px 1px 22px rgba(255, 255, 255, 0.2)");
        }
     }
}

function adjustColor(color, amount){
    let colorhex = (color.split("#")[1]).match(/.{2}/g);
    for (let i = 0; i < 3; i++){
        let e = parseInt(colorhex[i], 16);
        e += amount;
        if(amount > 0){
            colorhex[i] = ((e > 255) ? 255 : e).toString(16);
        }else{
            colorhex[i] = ((e < 0) ? 0 : e).toString(16);           
        }
    }
    return "#" + colorhex[0] + colorhex[1] + colorhex[2];
}

function escapeElementID(user) {
    return user.split(' ').join('\\ ');
}

dew.on("voip-user-volume", function(e){
    const date = new Date();
    let playerVoip = playerVolumes[e.data.user];
    if (playerVoip) {
        playerVoip.currentVoice = e.data.volume;
		
		if(playerVoip.currentVoice > -60)
			playerVoip.hasSpoken = true;
				
		if((date.getTime() - playerVolumes[e.data.user].lastUpdate >= 1500) || (playerVolumes[e.data.user].lastUpdateVolume < e.data.volume)){		
			if(isVisible){
				let escapedName = escapeElementID(e.data.user); //make names with spaces safe for selector
				if (e.data.peerLevel == 0) {
					updateSpeaker(escapedName, 'dew://assets/emblems/speaker-mute.png');
				} else if (e.data.volume < -75) {
					updateSpeaker(escapedName, 'dew://assets/emblems/speaker-off.png');
				} else if (e.data.volume < -50) {
					updateSpeaker(escapedName, 'dew://assets/emblems/speaker-low.png');
				} else {
					updateSpeaker(escapedName, 'dew://assets/emblems/speaker-full.png');
				}
				
				playerVolumes[e.data.user].lastUpdate = date.getTime();
				playerVolumes[e.data.user].lastUpdateVolume = e.data.volume;
			}
		}
    }
    else {
        playerVolumes[e.data.user] = {};
        playerVolumes[e.data.user].volume = 100.0;
        playerVolumes[e.data.user].currentVoice = e.data.volume;
        playerVolumes[e.data.user].lastUpdate = date.getTime();
        playerVolumes[e.data.user].lastUpdateVolume = e.data.volume;
    }
});

dew.on("voip-self-volume", function (e) {
    const date = new Date();
    dew.getSessionInfo().then(function (info) {
        if (localPlayer != "" && info.established == true) {
            let playerVoip = playerVolumes[localPlayer];
            if (playerVoip) {
                playerVoip.currentVoice = e.data.volume;
				
				if(playerVoip.currentVoice > -60)
					playerVoip.hasSpoken = true;
				
				if((date.getTime() - playerVolumes[localPlayer].lastUpdate >= 1500) || (playerVolumes[localPlayer].lastUpdateVolume < e.data.volume)){		
					if(isVisible){
						let escapedName = escapeElementID(localPlayer); //make names with spaces safe for selector
						if (e.data.volume < -75) {
							updateSpeaker(escapedName, 'dew://assets/emblems/speaker-off.png');
						} else if (e.data.volume < -50) {
							updateSpeaker(escapedName, 'dew://assets/emblems/speaker-low.png');
						} else {
							updateSpeaker(escapedName, 'dew://assets/emblems/speaker-full.png');
						}
						playerVolumes[localPlayer].lastUpdate = date.getTime();
						playerVolumes[localPlayer].lastUpdateVolume = e.data.volume;
					}
				}
            } else {
                playerVolumes[localPlayer] = {};
                playerVolumes[localPlayer].volume = 100.0;
                playerVolumes[localPlayer].currentVoice = e.data.volume;
                playerVolumes[localPlayer].lastUpdate = date.getTime();
                playerVolumes[localPlayer].lastUpdateVolume = e.data.volume;
            }
        }
    });
});

function updateSpeaker(elementName, url){
	var speaker = $('#' + elementName).find('.speaker');
	var currentSrc = speaker.attr('src');
	
	if (currentSrc !== url) {
		speaker.attr('src', url);
	}
}

dew.on("voip-peers", function(e){
});

dew.on("voip-speaking", function(e){
});

dew.on("voip-user-leave", function(e){
	delete playerVolumes[e.data.user];
});

dew.on("mute-voip-player", function (response) {
	let id = response.data.name + "|" + response.data.uid;
	let level = "100";
			
	if(response.data.muted)
		level = "0";
	else
		level = "100";

	dew.show("voip", {
		volume: {
			uid: id,
			vol: level / 100.0
		}
	});
	appState.playerVolumes[id] = level;
	
	//volume at infinity check
	let currentVol = playerVolumes[response.data.name].currentVoice;
	if(currentVol < -100)
		currentVol = -100;
	
	dew.callMethod("playerVoipLevelChanged", {
		"name": response.data.name,
		"peerLevel": level / 100.0,
		"currentVolume": currentVol
	});
});

dew.on("script-show-scoreboard", function(e){
	if(!isVisible){
		let animate = false;
		if(e.data.animate)
			animate = true;
		
		dew.callMethod("showScoreboard", {
			"locked": true,
			"preGame": false,
			"animate": animate,
		});
	}
});
