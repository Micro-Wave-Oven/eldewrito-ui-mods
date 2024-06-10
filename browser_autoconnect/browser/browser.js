const playlists = ['all','social','ranked','customs','private','forge'];

let pingQueue = [];
let pingCounter = 0;
let model = {
    currentSortKey: 'numPlayers',
    currentSortDir: 'desc',
    currentServerList: [],
    currentFilter: '',
    currentPlaylist: 'social',
    playerCount: 0,
    serverCount: 0
};

let masterServers = [];
let officialServerAPI = "";
let serverBlacklistAPI = "";
let statusEndpoint = "";
let serverBlacklist = [];
let officialServers = {};
let refreshVersion = 0;
let inflightRequests = [];
let refreshing = false;
let visible = false;
let serverPingInterval = null;
let quickJoinIgnore = {};
let allMastersSeen = false;
let usedBrowserCamera = false;
let pins = {};
var hasGP = false;
let updateNeeded = false;

let serverListWidget = dew.makeListWidget(document.querySelector('#server-list-wrap'), {
    itemSelector: 'tr',
    hoverClass: 'selected',
    hoverSelection: true,
    wrapAround: true,
    ignoreRightClick: true
});
serverListWidget.focus();


// AutoConnect Modifs
const delayRetrySeconds = 2;
const maxRetries = 150;
var cancelTimeout = undefined;
var lastServer = undefined;
var lastCurrentTry = undefined;
var lastServerPassword = undefined;
sessionStorage.setItem("autoconnect", false);

dew.on("browser-autoconnect", function (ev) {
    autoConnect(lastServer, lastCurrentTry + 10, lastServerPassword);
});


document.getElementById('cancel').addEventListener('click', function() {
    dew.playSound("x_button");
    cancelQueue();
});

function cancelQueue() {
    document.getElementById("cancel").disabled = true;
    document.getElementById("retries").textContent = "";
    if (cancelTimeout !== undefined) {
        clearTimeout(cancelTimeout);
        cancelTimeout = undefined;
    }
}

function autoConnect(server, currentTry, serverPassword) {
    
    document.getElementById("retries").textContent = `${currentTry}/${maxRetries}`;
    
    // Cancels the queue
    if (currentTry > maxRetries) {
        dew.playSound("error");
        cancelQueue();
        return;
    }
    
    fetch(`http://${server}`)
    .then(response => response.json())
    .then(data => {
        
        if (data.numPlayers < data.maxPlayers) {
            
            cancelQueue();
            
            sessionStorage.setItem("autoconnect", true);
            lastServer = server;
            lastCurrentTry = currentTry;
            lastServerPassword = serverPassword;
            
            dew.playSound("alt_timer_sound");
            setTimeout(() => { dew.playSound("alt_timer_sound"); }, 150);
            
            if (serverPassword != undefined) {
                dew.command(`Server.connect ${server} ${serverPassword}`);
            } else {
                dew.command(`Server.connect ${server}`);
            }
            
        } else {
            
            if (document.getElementById("cancel").disabled == true) {
                return;
            }
            cancelTimeout = setTimeout( 
                function() { autoConnect(server, currentTry + 1, serverPassword) }, 
                delayRetrySeconds * 1000
            );
        }
    })
    .catch(error => {
        if (document.getElementById("cancel").disabled == true) {
            return;
        }
        cancelTimeout = setTimeout( 
            function() { autoConnect(server, currentTry + 1, serverPassword) }, 
            delayRetrySeconds * 1000
        );
    });
}

serverListWidget.on('select', function(e) {
    
    let server = e.element.dataset.ip;
    if(!server)
        return;

    e.preventSound();
    
    document.getElementById("cancel").disabled = false;
    if (cancelTimeout !== undefined) {
        clearTimeout(cancelTimeout);
        cancelTimeout = undefined;
    }
    
    if (e.element.dataset.type == "private") {
        dew.dialog('server_password').then(password => {
            if(password.length > 0) {
                autoConnect(server, 1, password);
                dew.playSound("a_button");
            }
        });
    } else {
        autoConnect(server, 1, undefined);
    }
    
    
    // AutoConnect Modifs
    /*
    if(e.element.dataset.type == "private") {
        promptPassword(server);
    } else {
        dew.command(`Server.connect ${server}`);
        dew.playSound("a_button");
    }
    */
});

// End AutoConnect Modifs


function promptPassword(server) {
    dew.dialog('server_password').then(password => {
        if(password.length > 0) {
            dew.command(`Server.connect ${server} "${password}"`);
            dew.playSound("a_button");
        }
    });
}

window.addEventListener("keydown", function(e) {
    // bit of a hack
    if(document.activeElement.nodeName == 'INPUT')
        return;

    if([32, 37, 38, 39, 40, 33, 34].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
}, false);

$( document ).ready(function() {
	dew.command("server.getendpoint serverBlacklist").then(resp => {
		serverBlacklistAPI = resp;
	});
	
	dew.command("server.getendpoint officialServers").then(resp => {
		officialServerAPI = resp;
	});
	
	dew.command("server.getendpoint masterServers").then(resp => {
		masterServers = JSON.parse(resp);
	});	
});

dew.on('show', async function() {
    visible = true;
    usedBrowserCamera = false;
   
    Promise.all([dew.getVersion(),dew.getVersionCompat()])
        .then(function ([version, versionCompat]) {
            model.gameVersion = SemanticVersion.parse(version);
            model.gameVersionCompat = SemanticVersion.parse(versionCompat);
            refresh();
            selectPlaylist(playlists[0]);
 
            document.querySelector('#current_version').textContent = `Version: ${version}`;

            fetchNotice();
        });
    
    dew.command('Game.HideH3UI 1');
    dew.command('Settings.Gamepad').then((result) => {
        result = parseInt(result);
		document.body.setAttribute('data-gamepad-enabled', true);
    });
	dew.command('Server.LobbyType').then((result) => {
		if(result == -1){
			dew.command('Game.ScenarioScript server_browser_cam');
			usedBrowserCamera = true;
		}
	});
	initGamepad();
	
	window.addEventListener('mousedown', handleMouseDown);
});

dew.on('hide', function() {
	window.removeEventListener('mousedown', handleMouseDown);
	
    visible = false;
    cancelRefresh();
    dew.command('Game.HideH3UI 0');
	dew.command('Server.LobbyType').then((result) => {
		if(result == -1)
			dew.command('Game.ScenarioScript leave_server_browser');
	});
	usedBrowserCamera = false;
});

function handleMouseDown(e) {
	if(e.button === 2){
		handleUserCloseBrowser();
	}
}

dew.on("serverconnect", function (event) {
    if(event.data.connecting == false)
        dew.closeDialog("attempting_join");

    if(visible){
        if(event.data.success){
            if(usedBrowserCamera){
                dew.command('Game.ScenarioScript leave_server_browser');
            }
            closeBrowser();
        }
    }
});

function navigatePlaylists(dir) {
    let currentIndex = playlists.indexOf(model.currentPlaylist);
    if(currentIndex === -1)
        return;

    currentIndex += dir;
    if(currentIndex >= playlists.length)
        currentIndex = playlists.length-1;
    else if(currentIndex < 0)
        currentIndex = 0;

    selectPlaylist(playlists[currentIndex]);
    dew.playSound("horizontal_navigation");
}

dew.ui.on('action', function({inputType, action}) {
    if(document.activeElement && document.activeElement.nodeName === 'INPUT')
        return;
    switch(action) {
        case dew.ui.Actions.X:
        if(inputType !== 'keyboard') {
            handleUserRefresh();
        }         
        break;
        case dew.ui.Actions.B:
            closeBrowser();
            dew.playSound('b_button');
        break;
        case dew.ui.Actions.Y:
            quickJoin();
        break;
        case dew.ui.Actions.LeftBumper:
            navigatePlaylists(-1);
            break;
        case dew.ui.Actions.RightBumper:
            navigatePlaylists(1);     
			break;
		case dew.ui.Actions.Select:
			handleUserOpenLanBrowser();
			break;
    }  
});

function initGamepad(){
    dew.command('Settings.Gamepad', {}).then(function(result){
        if(result == 1){
            hasGP = true;
        }else{
            hasGP = false;
        }
    });
	setButtons();
}

function setButtons(){
    $('#joinBtn img').attr('src','dew://assets/buttons/360_A.png');
    $('#refreshBtn img').attr('src','dew://assets/buttons/360_X.png');
    $('#quickjoinBtn img').attr('src','dew://assets/buttons/360_Y.png');
    $('#closeBtn img').attr('src','dew://assets/buttons/360_B.png');
    $('#lanBtn img').attr('src','dew://assets/buttons/360_Back.png');
}

function handleUserRefresh() {
    dew.playSound("x_button");
    if(refreshing) {
        cancelRefresh();
    } else {
        refresh();
    }
}

function closeBrowser() {
	// AutoConnect Modifs
	cancelQueue();

    dew.hide();
}

function handleUserCloseBrowser() {
    dew.playSound('b_button');
    closeBrowser();
}

function handleUserOpenLanBrowser() {
	dew.playSound('a_button');
	dew.command("Game.ShowLocalServersUI");
	closeBrowser();
}

function cancelRefresh() {
    pingCounter = 0;
    pingQueue = [];
    while(inflightRequests.length) {
        let request = inflightRequests.pop();
        request.abort();
    }    
    onRefreshEnded();
}

let mutex_lock = false;

async function refresh() {
    if(mutex_lock) return;
    mutex_lock = true;
	
    cancelRefresh();
    
    refreshVersion++;
    model.currentServerList = [];
    model.playerCount = 0;
    model.serverCount = 0;
    serverBlacklist = [];
    officialServers = {};
    quickJoinIgnore = {};
  
    onRefreshStarted();
	
    try {
        await fetchWithTimeout(serverBlacklistAPI)
            .then((resp) => resp.json())
            .then(resp => {
                for(let server of resp.list){
                    serverBlacklist.push(server);
                }
            });
		
        await fetchWithTimeout(officialServerAPI)
            .then((resp) => resp.json())
            .then(resp => {
                for(let server of resp) {
                    officialServers[server.address] = server
                }
            });
    } catch (e) {
        console.error(e);
    }
	
    if(!serverPingInterval && refreshing)
        serverPingInterval = setInterval(serverPingProc, 25);
	
    render();

    allMastersSeen = false;
    fetchMasters()
		 .catch(console.error)
		 .then(_ => { allMastersSeen = true; });
		 
    mutex_lock = false;
}

function fetchMasters() {
	let visited = {};

	function addServer(server) {
	    if(visited[server]) return;
	    visited[server] = true;
	    pingCounter++;
	    pingQueue.push( { server: server, refreshVersion: refreshVersion } );
	}

    let tasks = [];
		
    // fetch from masters
    for (let master of masterServers) {
        tasks.push(fetch(master)
            .then(response => response.json())
            .then(data => data.result.servers.forEach(addServer))
            );
    }
	
    return Promise.all(tasks.map(reflect));
}

function onRefreshStarted() {
    var refreshButton = document.getElementById('refresh');
    var refreshLegendLink = document.getElementById('refreshLegendLink');
    refreshButton.classList.add('refreshing');
    refreshLegendLink.textContent = 'Stop';
    refreshing = true;
}


function onRefreshEnded() {
    var refreshButton = document.getElementById('refresh');
    var refreshLegendLink = document.getElementById('refreshLegendLink');
    refreshButton.classList.remove('refreshing');
    refreshLegendLink.textContent = 'Refresh';
    refreshing = false;
    clearInterval(serverPingInterval);
    serverPingInterval = null;
}

function serverPingProc() {
	if(allMastersSeen && pingCounter <= 0) {
       onRefreshEnded();
       return;
   	}

    var serverInfo = pingQueue.pop();
    ping(serverInfo).then((info) => {
        if(refreshVersion === serverInfo.refreshVersion) {
            addServer(info);
        }
    })
    .catch(_=>{})
    .then(_ => { pingCounter--; });
}

function ping(info) {
    return new Promise((resolve, rejeect) => {
        var xhr = new XMLHttpRequest();
        xhr.open('GET',`http://${info.server}/`, true);
        xhr.timeout = 4500;

        let startTime = -1;
    
        xhr.ontimeout = rejeect;
        xhr.onerror = rejeect;
        xhr.onload = function() {
            let data = JSON.parse(xhr.response);
            let endTime = Date.now();
            let ping = Math.round((endTime - startTime) * .45);
            let officialStatus = officialServers[info.server];

            if(serverBlacklist.indexOf(info.server.split(":")[0]) > -1 || serverBlacklist.some(sa => sa.includes(":") && info.server.includes(sa)))
				return;
			
            if((data.numPlayers < 0 || data.numPlayers > 16) ||
                (data.players && data.players.length !== data.numPlayers)) {
                rejeect();
            }
			
			// Hide servers Modifs
            if ( data.name.includes("G-Money") || data.name.includes("Halo Playground") ) {
                return;
            }
			
            if(data.name)
                data.name = data.name.replace(/\bhttp[^ ]+/ig, '');

            resolve({
                type: data.passworded ? 'private' : (officialStatus ? (officialStatus.ranked ? 'ranked' : 'social') : ''),
                ping: ping,
                IP: info.server,
                hostPlayer: data.hostPlayer,
                map: data.map,
                variant: data.variant,
                variantType: data.variantType,
                name: data.name,
                numPlayers: data.numPlayers,
                maxPlayers: data.maxPlayers,
                pinned: !!pins[info.server],
                version: parseVersion(data.eldewritoVersion)
            });
        }
       

        startTime = Date.now();
        inflightRequests.push(xhr);
        xhr.send();
    });
    
}

function ServerRow(server, connectCallback) {

    return React.createElement(
        'tr',
        { key: server.IP, 'data-ip': server.IP,  'data-type': server.type, className: server.pinned ? 'pinned' : ''},
        React.createElement(
            'td',
            null,
            sanitize(server.name)
        ),
        React.createElement(
            'td',
            null,
            sanitize(server.hostPlayer)
        ),
        React.createElement(
            'td',
            null,
            server.ping
        ),
        React.createElement(
            'td',
            null,
            sanitize(server.map)
        ),
        React.createElement(
            'td',
            null,
            sanitize(server.variantType)
        ),
        React.createElement(
            'td',
            null,
            sanitize(server.variant)
        ),
        React.createElement(
            'td',
            null,
            `${server.numPlayers}/${server.maxPlayers}`
        ),
        React.createElement(
            'td',
            null,
            sanitize(`${server.version}`)
        )
    );
}

function ServerList(model, connectCallback) {
    return React.createElement(
        'table',
        {className: 'server-list'},
        React.createElement(
            'thead',
            null,
            React.createElement(
                'tr',
                null,
                React.createElement(
                    'th',
                    { onMouseDown: () => model.sort('name'), className: model.currentSortKey == 'name' ? `sort-${model.currentSortDir}` : '' },
                    'NAME'
                ),
                React.createElement(
                    'th',
                    { onMouseDown: () => model.sort('hostPlayer'), className: model.currentSortKey == 'hostPlayer' ? `sort-${model.currentSortDir}` : '' },
                    'HOST'
                ),
                React.createElement(
                    'th',
                    { onMouseDown: () => model.sort('ping'), className: model.currentSortKey == 'ping' ? `sort-${model.currentSortDir}` : '' } ,
                    'PING'
                ),
                React.createElement(
                    'th',
                    { onMouseDown: () => model.sort('map'), className: model.currentSortKey == 'map' ? `sort-${model.currentSortDir}` : '' } ,
                    'MAP'
                ),
                React.createElement(
                    'th',
                    { onMouseDown: () => model.sort('variantType'), className: model.currentSortKey == 'variantType' ? `sort-${model.currentSortDir}` : '' } ,
                    'GAMETYPE'
                ),
                React.createElement(
                    'th',
                    { onMouseDown: () => model.sort('variant'), className: model.currentSortKey == 'variant' ? `sort-${model.currentSortDir}` : '' } ,
                    'VARIANT'
                ),
                React.createElement(
                    'th',
                    { onMouseDown: () => model.sort('numPlayers'), className: model.currentSortKey == 'numPlayers' ? `sort-${model.currentSortDir}` : '' } ,
                    'Players'
                ),
                React.createElement(
                    'th',
                    { onMouseDown: () => model.sort('version'), className: model.currentSortKey == 'version' ? `sort-${model.currentSortDir}` : '' } ,
                    'VERSION'
                )
            )
        ),
        React.createElement(
            'tbody',
            null,
            model.serverList.map((server) => ServerRow(server, model.connect))
        )
    );
}


let listFilterTextbox = document.getElementById('server-list-filter');
listFilterTextbox.addEventListener('input', function(e) {
    onSearch(e.target.value);
});
listFilterTextbox.addEventListener('focus', function() {
    serverListWidget.blur();
});
listFilterTextbox.addEventListener('blur', function() {
    serverListWidget.focus();
})

document.getElementById('refresh').addEventListener('click', function() {
    dew.playSound("x_button");
    if(!refreshing)
        refresh();
    else
        cancelRefresh();
});



function addServer(server) {
    if(!isVersionCompatible(server.version)) {
    	return;
    }
    model.serverCount++;
    model.playerCount += server.numPlayers;
    model.currentServerList.push(server);
    sortme(model.currentSortKey);
}
var serverComparators = {
    
    asc: function (a, b) {
        let key = model.currentSortKey;
        let aval = a[key];
        let bval = b[key];
        if (aval < bval) return -1;
        if (aval > bval) return 1;

        aval = a.IP;
        bval = b.IP
        if (aval < bval) return 1;
        if (aval > bval) return -1;
        return 0;
    },
    desc: function (a, b) {
        let key = model.currentSortKey;
        let aval = a[key];
        let bval = b[key];
        if (aval < bval) return 1;
        if (aval > bval) return -1;

        aval = a.IP;
        bval = b.IP
        if (aval < bval) return 1;
        if (aval > bval) return -1;
        return 0;
    }
};

function sortme() {
    model.currentServerList.sort(serverComparators[model.currentSortDir]);

    let top = [];
    let rest = [];
    for(let i = 0; i < model.currentServerList.length; i++) {
        let server = model.currentServerList[i];

        if(server.pinned) {
            top.push(server); 
        } else {
            rest.push(server);
        }
    }

    model.currentServerList = top.concat(rest);

    render();
}

function onSort(key) {
    if (model.currentSortKey == key) {
        model.currentSortDir = model.currentSortDir == 'asc' ? 'desc' : 'asc';
    } else {
        model.currentSortDir = 'asc';
    }
    model.currentSortKey = key;
    sortme();
}


function onSearch(query) {
    model.currentFilter = query.toLowerCase();
    sortme();
    render();
}


let playlistFilters = {
    all: function(server) {
        return server.type !== 'private';
    },
    social: function(server) {
        return server.type === 'social';
    },
    ranked: function(server) {
        return server.type === 'ranked';
    },
    customs: function(server) {
        return server.type !== 'ranked' && server.type !== 'social' && server.type !== 'private';
    },
    private: function(server) {
        return server.type === 'private';
    },
    forge: function(server) {
        return server.type !== 'ranked' && server.type !== 'social' && server.type !== 'private' && server.variantType === 'forge';
    }
}

function render() {
    let list = getServerView();
    ReactDOM.render(
        React.createElement(ServerList, { serverList: list, sort: onSort, search: onSearch, currentSortKey: model.currentSortKey, currentSortDir: model.currentSortDir }, null),
        document.getElementById('server-list-wrap')
    );
    serverListWidget.refresh();
    document.getElementById('population').textContent = `${model.playerCount} Players / ${model.serverCount} Servers`;
}

function sanitize(str) {
    if (!str) return 'Blam!'; // Handle empty input

    // Create a new element and set its textContent to the input string
    const div = document.createElement('div');
    div.textContent = str;

    // Truncate content if it exceeds 80 characters
    let sanitizedString = div.textContent;
    if (sanitizedString.length > 80) {
        sanitizedString = sanitizedString.substr(0, 80) + '...';
    }

    return sanitizedString;
}

var playlistOptions = document.querySelectorAll('#playlistTabs li>a');
playlistOptions.forEach(function(playlistLink) {
	playlistLink.addEventListener('mousedown', function(e) {
		e.preventDefault();
		let hash = playlistLink.hash;
		if(hash.length < 2 || window.location.hash === hash)
			return;
		
		selectPlaylist(hash.substr(1));
		dew.playSound("horizontal_navigation");
		e.preventDefault();
		e.stopPropagation();
		return false;
	});
});

function selectPlaylist(playlist) {
    let tabs = document.querySelectorAll('#playlistTabs li>a');
    let tabLinkElements = {};
    for(let tab of tabs)
    {
        let href = tab.getAttribute('href');
        if(!href || href.length < 2)
            continue;

        tabLinkElements[href.substr(1)] = tab;
    }

    let currentTab = tabLinkElements[model.currentPlaylist];
    if(currentTab)
        currentTab.classList.remove('active');

    currentTab = tabLinkElements[playlist];
    currentTab.classList.add('active');
    model.currentPlaylist = playlist;
    render();
}

function getServerView() {
    if (!model.currentServerList.length)
        return [];
    playlistFilter = playlistFilters[model.currentPlaylist];
    return model.currentServerList.filter(a => playlistFilter(a)
        && (a.name + a.map + a.variant + a.variantType).toLowerCase().indexOf(model.currentFilter) != -1);
}

function quickJoin() {
    let list = getServerView()
    .filter(a => a.numPlayers < 16 && !quickJoinIgnore[a.IP])
    list.sort((a, b) => a.ping - b.ping);

    let maxScore = -1;
    let chosenServer = null;
    for(let server of list) {
        let score = 1.0 - (server.ping / 3000.0) * 2.0 + server.numPlayers;
        if(score > maxScore) {
            maxScore = score;
            chosenServer = server;
        }
    }

    if(!chosenServer)
        return;
      
    quickJoinIgnore[chosenServer.IP] = true;
    dew.command(`Server.connect ${chosenServer.IP}`);
    dew.playSound("a_button");
}


function parseVersion(str) { 
    var version = str.match(/^(\d+\.\d+\.\d+)/)[1];
	return version;
}

function reflect(p) {
	return p.then(v => ({v, success: true }),  e => ({e, success: false }));
}

function fetchWithTimeout(url, timeout = 2000) {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => {
		controller.abort();
		// Reject the promise explicitly when timed out
		return Promise.reject(new Error('Request timed out'));
	}, timeout);

	return fetch(url, { signal: controller.signal })
		.then(response => {
			// pass the response data
			return response;
		})
	.catch(error => {
		// Handle errors, excluding the timeout
		if (error.name !== 'AbortError') {
			console.error('Error:', error.message);
		}
		// Continue to propagate the error for non-timeout issues
		throw error;
	})
	.finally(() => clearTimeout(timeoutId));
}

async function fetchNotice() {    
    try {    
        const noticeEndpoint = (await dew.command("server.getendpoint browserNotice")) + "?t="+Date.now();
        // fetch the status
        const response = await fetch(noticeEndpoint).then(resp => resp.json());  
        // check if there is an update
        const latestVersion = SemanticVersion.parse(response.version);

        if(latestVersion.compare(model.gameVersion) > 0) {
            if(!updateNeeded) {
                updateNeeded = true;
                showUpdateDialog(response);
            }
        }
        // display the notice if there is one
        const noticeEl = document.querySelector('#notice');
        if(response.notice) {
            noticeEl.textContent = response.notice.message;
            noticeEl.dataset.type = response.notice.type ?? 'info';
        } else {
            noticeEl.textContent = '';
        }

    } catch(err) {
        console.error('Failed to get status', err);
    }
}

async function showUpdateDialog(info) {
    const result = await dew.dialog('update_available');
    if(result == '') {
        try {
            await dew.command('update');
        }
        catch(err) {
            if(info.updateUrl) {
                this.setTimeout(() => window.open(info.updateUrl, '_blank'), 450);
            }
            await dew.dialog('missing_launcher');
        }
    }
}

function isVersionCompatible(version) {
    try {
        v = SemanticVersion.parse(version);
        return v.compare(model.gameVersionCompat) >= 0 && v.compare(model.gameVersion) <= 0;
    }
    catch(err) {
        console.error('failed check version compatability', err);
        return false;
    }
}
