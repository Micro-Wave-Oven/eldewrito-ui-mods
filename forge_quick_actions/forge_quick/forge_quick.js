// Change this value to the bind you chose to open this screen, so you can use the same key to close it.
let bindKey = "4";

// If true, when you release the key, trigger the highlighted action.
// If "false", do nothing when you release the key.
let enableMouseUpChooseAction = false;

// Style
const backgroundColor = "#37270AF0";
const highlightColor  = "#6A4C2EF0";
const borderColor     = "#FFD5A3F0";
const textColor       = "#FFD5A3";

// Actions
let items = [
    {
        name: "Select Everything",
        action: function() {
            dew.command("Forge.SelectEverything");
            //dew.notify("chat", { message: "Message here", sender: "Forge Actions", chatType: "DEBUG", color: "#005AF7" });
        }
    },
    {
        name: "Deselect All",
        action: function() {
            dew.command("Forge.DeselectAll");
        }
    },
    {
        name: "Invert Selection",
        action: function() {
            dew.command("Forge.InvertSelection");
        }
    },
    {
        name: "Magnet Auto Gen",
        action: function() {
            dew.command("Forge.MagnetAutogen").then((enabled) => {
                dew.command("Forge.MagnetAutogen " + (enabled == "1" ? "0" : "1"));
                dew.notify("chat", { message: "MagnetAutogen " + (enabled == "1" ? "Disabled" : "Enabled"), sender: "Forge Actions", chatType: "DEBUG", color: "#005AF7" });
            })
        }
    },
    {
        name: "Reset Run Time",
        action: function() {
            dew.command("Forge.ResetRunTime");
        }
    },
    {
        name: "Set Prematch Camera",
        action: function() {
            dew.command("Forge.SetPrematchCamera");
        }
    },
    {
        name: "Canvas",
        action: function() {
            dew.command("Forge.Canvas");
        }
    },
    {
        name: "Undo",
        action: function() {
            dew.command("Forge.Undo");
        }
    },
    {
        name: "Redo",
        action: function() {
            dew.command("Forge.Redo");
        }
    },
    { 
        name: "Show/Hide Invisibles",
        action: function() { 
            dew.command("Forge.ShowInvisibles").then(function(enabled) {
                dew.command("Forge.ShowInvisibles " + (enabled == "1" ? "0" : "1"));
                dew.notify("chat", { message: "Invisibles " + (enabled == "1" ? "hidden" : "shown"), sender: "Forge Actions", chatType: "DEBUG", color: "#005AF7" });
            });
        } 
    },
    { 
        name: "Toggle 0.001  Speed",
        action: function() {
            let currValue = localStorage.getItem("sForgeMonitorSpeed");
            
            if (currValue) {
                dew.command("Forge.MonitorSpeed " + currValue);
                localStorage.removeItem("sForgeMonitorSpeed");
                
            } else {
                dew.command("Forge.MonitorSpeed").then(function(currentValue) {
                    localStorage.setItem("sForgeMonitorSpeed", currentValue);
                    dew.command("Forge.MonitorSpeed 0");
                });
            }
        }
    },
];


let container = document.getElementById('widget-container');
let grid = document.getElementById('grid');
var currentPosition = [0, 0];

let initalKeyboardKey = false;
let hasGP = false;


function createGrid(items, heightSize, widthSize) {
    
    const itemCount = items.length;
    const { rows, cols } = calculateRowsAndColumns(itemCount);
    
    const gridContainer = document.createElement('div');
    gridContainer.style.display = 'grid';
    gridContainer.style.gridTemplateRows = `repeat(${rows}, ${heightSize}px)`;
    gridContainer.style.gridTemplateColumns = `repeat(${cols}, ${widthSize}px)`;
    gridContainer.style.placeItems = 'center';

    const borderSize = 1;
    const totalBorderSize = borderSize
    const cellWidthWithBorder = widthSize - totalBorderSize + (borderSize * 2);
    const cellHeightWithBorder = heightSize - totalBorderSize + (borderSize * 2);

    let itemIndex = 0;
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if(itemIndex >= itemCount)
                break
            
            const item = items[itemIndex]
            let title = "";

            let hasName = false;
            if(item !== undefined && item.name !== "") {
                hasName = true;
            }
            
            const cell = document.createElement('div');
            cell.style.setProperty('--border-width', borderSize + 'px');
            cell.style.width = `${cellWidthWithBorder}px`;
            cell.style.height = `${cellHeightWithBorder}px`;
            cell.style.paddingLeft = "2px";
            cell.style.paddingRight = "2px";
            cell.dataset.index = itemIndex;
            cell.dataset.position = `${i}-${j}`;
            cell.className = 'cell';
            
            if (Object.hasOwn(item, 'icon')) {
                const image = document.createElement('img');
                image.className = "icon";
                image.style.width = `${cellWidthWithBorder-(hasName ? 20 : 10)}px`;
                image.style.height = `${cellHeightWithBorder-(hasName ? 20 : 10)}px`;
                image.src = '';
                cell.appendChild(image);
            }
            
            if(hasName){
                const name = document.createElement('span');
                name.className = "name";
                name.innerText = items[itemIndex].name;
                cell.appendChild(name);
            }
            gridContainer.appendChild(cell);
            itemIndex++;
        }
    }

    return gridContainer;
}


function selectAction(index) {
    
    var itemElements = grid.querySelectorAll('.cell');
    for (let i = 0; i < itemElements.length; i++) {
        if (itemElements[i].classList.contains('selected'))
            itemElements[i].classList.remove('selected');
    }
    
    if (items != undefined && index < items.length && Object.hasOwn(items[index], 'action')) {
        items[index].action();
    }
    
    dew.hide();
}
	
dew.on('show', async function (event) {
    
	currentPosition = [0,0];
    
	dew.command("Settings.gamepad").then(function(response) {
		hasGP = (response == 1);
	});
	
	initalKeyboardKey = true;
	
    // TODO: Make icons for the actions ?
    /*
	const actionsIcons = await fetchEmoteIcons(items);
	for(var i = 0; i < actionsIcons.length; i++) {
        items[i].icon = actionsIcons[i];
	}
    */
    
    drawSelector();
    
	if (hasGP) {
		const currItems = document.querySelectorAll(`[data-position="0-0"]`);
		if(currItems.length > 0){
			currItems[0].classList.add('selected');
		}
	}
        
	// update the styling
	container.style.setProperty('--background-color', backgroundColor);
	container.style.setProperty('--highlight-color', highlightColor);
	container.style.setProperty('--border-color', borderColor);
	container.style.setProperty('--text-color', textColor);
});

function fetchEmoteIcons(emotes) {
	return Promise.all(emotes.map(emoteItem => {
		try {
			return dew.getAssetUrl("assets/emotes/"+emoteItem.iconName, { pak:"game", fileTypes:['jpg','png']});
		}
		catch(err) {
			return "";
		}
	}));
}

function drawSelector() {
    
    grid.style.display = "flex";
        
    const new_grid = createGrid(items, 60, 120);
    /*
    let iconElements = new_grid.querySelectorAll('.icon');
	for(let i = 0; i < items.length; i++) {
        iconElements[i].setAttribute("src", items[i].icon);
    }
    */
    grid.innerHTML = new_grid.outerHTML;
    grid.classList.add("scale-up");
    
    $('.cell').off('click').on('click', function(e){
        selectAction(e.target.dataset.index);
    });
    
    $('.cell .name').off('click').on('click', function(e){
        console.log(e);
        selectAction(e.target.parentElement.dataset.index);
    });
    
    $('#container').off('mousedown').on('mousedown', function(e){
        if (e.button == 2) {
            dew.hide();
            return false;
        }
    });
}

function calculateRowsAndColumns(itemCount) {
    const maxColumns = 5;
    const cols = Math.min(itemCount, maxColumns);
    const rows = Math.ceil(itemCount / cols);
    return { rows, cols };
}

dew.on('hide', function () {
    grid.style.display = "none";
});

dew.on('controllerinput', function (e) {
    
	if (!hasGP) {
		return;
    }

    if (e.data.B === 1) {
        dew.hide();
        
    } else if (e.data.A === 1) {
        let selectedElement = document.querySelector('.cell.selected');
        if (selectedElement) {
            let index = selectedElement.getAttribute('data-index');
            selectAction(index);
        }
    }
});

dew.input.on('scroll', handleVirtualScroll);
dew.input.on('right_scroll', handleVirtualScroll);

function handleVirtualScroll(type, axis, value) {

    const itemCount = items.length;
    const { rows, cols } = calculateRowsAndColumns(itemCount);

    let tmpPosition = currentPosition.slice();
    
    if(axis === 0)
        tmpPosition[1] = currentPosition[1] + value;

    if(axis === 1)
        tmpPosition[0] = currentPosition[0] + value;
    
    let pos = `${tmpPosition[1]}-${tmpPosition[0]}`;
    
    const actionItems = document.querySelectorAll(`[data-position="${pos}"]`);
    
    if(actionItems.length > 0){
        let actionItem = actionItems[0];
    
        currentPosition = tmpPosition;
        
        // unselect everything
        var itemElements = grid.querySelectorAll('.cell');
        for (let i = 0; i < itemElements.length; i++) {
            if (itemElements[i].classList.contains('selected'))
                itemElements[i].classList.remove('selected');
        }
        
        if (actionItem)
            actionItem.classList.add('selected');
    }
}

window.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        dew.hide();
    }
});

window.addEventListener("mousemove", e => {
	const baseScreen = document.getElementsByClassName('page_content')[0];
	const screenRect = baseScreen.getBoundingClientRect();
	const screenCenterX = screenRect.left + screenRect.width / 2;
	const screenCenterY = screenRect.top + screenRect.height / 2;
	const deltaX = (e.clientX - screenCenterX);
	const deltaY = -(e.clientY - screenCenterY);
	const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
	let radius = Math.min(screenRect.width, screenRect.height) * 0.084;
    
    var itemElements = grid.querySelectorAll('.cell');
    for (let i = 0; i < itemElements.length; i++) {
	    if (itemElements[i].classList.contains('selected')) {
            itemElements[i].classList.remove('selected');
        }
    }
    
    let target = e.target;
    
    if (target.classList.contains('cell')) {
        target.classList.add('selected');
    }
    
    if (target.classList.contains('name')) {
        target.parentElement.classList.add('selected');
    }
});

document.addEventListener('keyup', e => {
	if (isKeyboardBind(e.key)) {
        
        if (initalKeyboardKey) {
            initalKeyboardKey = false;
            
            if (enableMouseUpChooseAction) {
                let selectedElement = document.querySelector('.cell.selected');
                if (selectedElement) {
                    let index = selectedElement.getAttribute('data-index');
                    selectAction(index);
                }
            }
            
        } else {
            dew.hide();
        }
	}
});

document.addEventListener('keydown', e => {
	if (isKeyboardBind(e.key) && !initalKeyboardKey) {
		dew.hide();
    }
});

function isKeyboardBind(bind){
	if (bind == bindKey) {
		return true;
	}
	return false;
}