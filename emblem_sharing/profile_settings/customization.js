var activePage = "";
var itemNumber = -1;
var tabIndex = 0;
var hasGP = false;
var axisThreshold = .5;
var lastHeldUpdated = 0;
var lastEmblem = "";
var emblemToggle = 1;
var emblemNeedsToApply = false;
var resetCharacters = false;
var subCamera = false;
var subForm = "";
var UserCanRotate = false;
var firstRun = true;
var cachedEmblemEndpoint = "";
var bipedRotate = 0;
var nameplateBaseImage = new Image();
var nameplateBaseTrayImage = new Image();
var nameplateImage = new Image();
var showing = false;
var isVisible = false;
var lastMousePosition = { x: 0, y: 0 };

var h3ColorArray = [
    ['Steel','#282828'],
    ['Silver','#7C7C7C'],
    ['White','#C3C3C3'],
    ['Red','#620B0B'],
    ['Mauve','#BD2B2B'],
    ['Salmon','#E24444'],
    ['Orange','#BC4D00'],
    ['Coral','#F4791F'],
    ['Peach','#FFA362'],
    ['Gold','#A77708'],
    ['Yellow','#DD9A08'],
    ['Pale','#FFBC3B'],
    ['Sage','#1F3602'],
    ['Green','#546E26'],
    ['Olive','#B3E164'],
    ['Teal','#0A3B3F'],
    ['Aqua','#178C95'],
    ['Cyan','#54DDDB'],
    ['Blue','#0B2156'],
    ['Cobalt','#1D4BBC'],
    ['Sapphire','#5D85EB'],
    ['Violet','#1D1052'],
    ['Orchid','#5438CF'],
    ['Lavender','#A18CFF'],
    ['Crimson','#460014'],
    ['Rubine','#AF0E46'],
    ['Pink','#FF4D8A'],
    ['Brown','#1C0D02'],
    ['Tan','#774D31'],
    ['Khaki','#C69069']
];
var settingsToLoad = [
    //[element,dewCommand, IndexOnList]
    ['playerName', 'Player.Name', 0],
    ['serviceTag', 'Player.ServiceTag', 1],
    ['races', 'Player.PreferredCharacter', 6],	
    ['gender', 'Player.Gender', 7],
    ['colorsPrimary', 'Player.Customization.Color primary', 0],
    ['colorsSecondary', 'Player.Customization.Color secondary', 1],
    ['colorsTertiary', 'Player.Customization.Color tertiary', 2],
    ['colorsQuaternary', 'Player.Customization.Color quaternary', 3],
	['colorsQuinary', 'Player.Customization.Color quinary', 4]
];

var repName = "";
var characters = [];
var characterColors = [];
var regionList = [];

var colorList = [];
var defaultColorList = [];

var colorPicker;
var colorLocation;

var genderList = [
    //[name, value, description, imgFolderName]
    ['Male','male','State your gender. This will not be displayed to other players, but combat effects will be tailored to your gender.', 'gender'],
    ['Female','female','State your gender. This will not be displayed to other players, but combat effects will be tailored to your gender.', 'gender']    
];
var needSetEmblem = false;
var controlerSetEmblem = false;
var emblemList = [
	['colorsEmblemPrimary', ''],
	['colorsEmblemSecondary', ''],
	['colorsEmblemImage', ''],
];

var nameplateList = [
	['None', "0", "dew://assets/emblems/nameplate/0.png"],
	['Seventh Column', "1", "dew://assets/emblems/nameplate/1.png"],
	['Pro', "2", "dew://assets/emblems/nameplate/2.png"],
	['Bungie', "3", "dew://assets/emblems/nameplate/3.png"],
	['Mark of Shame', "4", "dew://assets/emblems/nameplate/4.png"],
	['Blue Team', "5", "dew://assets/emblems/nameplate/5.png"],
	['Red Team', "6","dew://assets/emblems/nameplate/6.png"],
	['Halo CE', "7","dew://assets/emblems/nameplate/7.png"],
	['Halo 2', "8", "dew://assets/emblems/nameplate/8.png"],
	['Halo 3', "9", "dew://assets/emblems/nameplate/9.png"],
	['ODST', "10", "dew://assets/emblems/nameplate/10.png"],
	['Reach', "11", "dew://assets/emblems/nameplate/11.png"],
	['Marathon', "12", "dew://assets/emblems/nameplate/12.png"],
	['Forerunner', "13", "dew://assets/emblems/nameplate/13.png"],
	['UNSC', "14", "dew://assets/emblems/nameplate/14.png"],
	['Covenant', "15", "dew://assets/emblems/nameplate/15.png"],
	['ONI', "16", "dew://assets/emblems/nameplate/16.png"],
	['Anvil', "17", "dew://assets/emblems/nameplate/17.png"],
	['Virgil', "18", "dew://assets/emblems/nameplate/18.png"],
	['Forge', "19", "dew://assets/emblems/nameplate/19.png"],
	['Legendary', "20", "dew://assets/emblems/nameplate/20.png"],
	['Eldewrito', "21", "dew://assets/emblems/nameplate/21.png"],
];

$(document).ready(function(){
    $(document).keyup(function (e) {
        if (e.keyCode == 44) {
            dew.command('Game.TakeScreenshot');
        }
    });
    $(document).keydown(function(e){
        if(e.keyCode == 192 || e.keyCode == 223){
            dew.show('console');
        }else if(e.keyCode == 81){//Q
            e.preventDefault();
        }
        else if(e.keyCode == 69){//E
            e.preventDefault();
        }
        else if(e.keyCode == 37) { // left
            e.preventDefault();
        }
        else if(e.keyCode == 39) { // right
            e.preventDefault();
        }
        else if(e.keyCode == 38) { // up
            e.preventDefault();
        }
        else if(e.keyCode == 40) { // down
            e.preventDefault();
        }
        else if(e.keyCode == 32) { // space
            e.preventDefault();
        }
    });
	
	var startedInColorPicker = false;
	document.addEventListener("mousedown", function(e) {
		if(e.button == 2)
			handleRightClick();
		
		startedInColorPicker = false;
		if($(".ed-color-picker:hover").length != 0){
			startedInColorPicker = true;
		}
	});
	document.addEventListener("mouseup", function() {
		if($(".ed-color-picker:hover").length != 0 || startedInColorPicker){//mouse is over color picker when mouseup
			if(needSetEmblem){
				UpdateEmblemDisplay(false);
				needSetEmblem = false;
			}
			startedInColorPicker = false;
		}
	});

	$("#toggleIconButton").hide();
	$("#randomEmblem").hide(); 
	$("#randomColors").hide();

	//always submit emblem onbootup incase emblem was changed before the game was started or the stats server was offline last time the player edited their emblem
	SetupEmblems(true, function(){
		setTimeout(function(){
			SubmitEmblemToStatsServer();
		},5000);
	});
	
	$("#reset").show();
	
	setRadioList('colorsEmblemPrimary', h3ColorArray, "color", false);
	setRadioList('colorsEmblemSecondary', h3ColorArray, "color", false);
	setRadioList('colorsEmblemImage', h3ColorArray, "color", false);
	setRadioList('colorsNameplate', h3ColorArray, "color", false);
	
    setRadioList('gender', genderList, "armor", false, "assets/armor/");
    setRadioList('colorsPrimary', h3ColorArray, "color", false);
    setRadioList('colorsSecondary', h3ColorArray, "color", false);
    setRadioList('colorsTertiary', h3ColorArray, "color", false);
    setRadioList('colorsQuaternary', h3ColorArray, "color", false);
	setRadioList('colorsQuinary', h3ColorArray, "color", false);
    $('.tabs li a').off('click').on('click', function(e){
        if($(this).parent().attr('id') == "page_1")
            $('#tab-gradient').hide();
        else
            $('#tab-gradient').show();
        
        
        $('.tabs li').removeClass('selected');
        $(this).parent().addClass('selected');
        window.location.href = $(this).attr('href');
        activePage = $(this).prop('hash');
        itemNumber = -1;
        $(e).ready(function(){
            updateSelection(itemNumber, false, true);
            tabIndex = $('.tabs li:visible a').index($("a[href='"+activePage+"']"));
        });
        if($(activePage + ' form:visible')){
            $.grep(settingsToLoad, function(result, index){
                if(result){
                    if(result[0] == $(activePage + ' form:visible').attr('id')){
                        $('.baseNav').removeClass('selectedElement');
                        itemNumber = result[2];
                        $(activePage+' .baseNav').eq(result[2]).addClass('selectedElement');
                    }
                }
            });
        }
		
        dew.playSound('horizontal_navigation');
    });
	
	$('.emblemColorForm input').off('click').on('change', function(e){
		$(this).parent().parent().parent().find('.chosenElement').removeClass('chosenElement');
		$(this).parent().parent().addClass('chosenElement');
		
		var index = 0;
		$.grep(emblemList, function(result){
			var colorIndex = 0;
			var found = false;
			if(result[0] == e.target.name){
				$.grep(h3ColorArray, function(result2){
					if(result2[1] == e.target.value){
						emblemList[index][1] = colorIndex;
						found = true;
						UpdateEmblemDisplay(false);
					}
					colorIndex+=1;
				});
				if(!found)
					emblemList[index][1] = e.target.value;
			}
			index += 1;
		});
		needSetEmblem = true;
	});
	
	$('.colorForm input:radio').on('change click', function(e){
		if(itemNumber != 0)
			dew.playSound('a_button');
    });
	
    $('.colorForm input').off('change').on('change', function(e){
		$(this).blur();
        $(this).parent().parent().parent().find('.chosenElement').removeClass('chosenElement');
        $(this).parent().parent().addClass('chosenElement');
        $.grep(settingsToLoad, function(result){
            if(result[0] == e.target.name){
                dew.command(result[1]+' '+e.target.value);
                //$(location.hash+' #infoBox #infoText').text(result[3]);
            };
            $(location.hash+' #infoBox #infoHeader').text(e.target.computedName);
        });
        $(location.hash+' #infoBox #infoText').text($(this).attr('desc'));
    });
    $('#colorsPrimaryText, #colorsSecondaryText,#colorsTertiaryText,#colorsQuaternaryText,#colorsQuinaryText').off('click').on('click', function(e){
        $('.colorForm').hide();
        colorPicker = dew.makeColorPicker(document.querySelector('#colorPicker'));
        colorLocation = $(this).prev()[0].name;
        var whichColor = $(this);
        if(typeof e.originalEvent !== "undefined")//check if click was via mouse and not directly called via .click()
            dew.playSound("a_button");
		
        $(this).prev()[0].checked = true;
        var currentVal = ColorUtil.hexToHsv($(this).val().split('#')[1]);
        activePage = location.hash+" #colorPicker";
        $('#colorPicker').show();
        $(location.hash+' #infoBox #infoHeader').text($(this).val());
        colorPicker.setColor(currentVal);
        colorPicker.on('select', function(color) {
            var currentSelection = ColorUtil.hsvToRgb(color.h, color.s, color.v);
            whichColor.val('#'+leftPad(ColorUtil.rgbToHex(currentSelection[0],currentSelection[1],currentSelection[2]),6,'0'));
            whichColor.trigger('change');
            $(location.hash+' #infoBox #infoHeader').text(whichColor.val());
        });
    });
    $('.colorForm').submit(function() {
        return false;
    });
		
	$('#colorsNameplate input').off('click').on('change click', function(e) {
		var nameplateColor = e.target.value;
		dew.command("Player.NameplateColor "+nameplateColor);
		
		UpdateNameplateDisplay();
	});
	
    $('#cancelButton').off('click').on('click', function(e){
        cancelButton();
    });
    setControlValues();
    dew.on('controllerinput', function(e){
        if(hasGP){
            if(activePage && (activePage.endsWith(' #colorPicker') || activePage.endsWith(' #emblemColorPicker'))){
				if((e.data.AxisLeftX > 0.8 || e.data.AxisLeftX < -0.8) || (e.data.AxisLeftY > 0.8 || e.data.AxisLeftY < -0.8)){
					controlerSetEmblem = true;
				}
				if((e.data.AxisRightX > 0.8 || e.data.AxisRightX < -0.8) || (e.data.AxisRightY > 0.8 || e.data.AxisRightY < -0.8)){
					controlerSetEmblem = true;
				}
				
				var withinLX = (e.data.AxisLeftX < axisThreshold && e.data.AxisLeftX > -axisThreshold);
				var withinLY = (e.data.AxisLeftY < axisThreshold && e.data.AxisLeftY > -axisThreshold);
				var withinRX = (e.data.AxisRightX < axisThreshold && e.data.AxisRightX > -axisThreshold);
				var withinRY = (e.data.AxisRightY < axisThreshold && e.data.AxisRightY > -axisThreshold);
				
				if(withinLX && withinLY && withinRX && withinRY && controlerSetEmblem){
					controlerSetEmblem = false;
					UpdateEmblemDisplay(false);
				}
				
                colorPicker.controllerInput(e.data);
            }else{
                if(e.data.AxisRightX != 0){
                    if(e.data.AxisRightX > axisThreshold){
                        rotateBiped('right');
                    }
                    if(e.data.AxisRightX < -axisThreshold){
                        rotateBiped('left');
                    };
                }
            }
        }
    });
    var clicking = false;
    var lastPos = {x: null, y: null};
    $('#playerWindow').mousedown(function (event) {
		if(event.button == 0){
			lastPos.x = event.clientX;
			lastPos.y = event.clientY;
			clicking = true;
		}
    });
    $(document).mouseup(function(){
        clicking = false;
    })
    $(window).mousemove(function(event){
        if(clicking && UserCanRotate){
            var xDiff = lastPos.x - event.clientX;
            lastPos.x = event.clientX;
            lastPos.y = event.clientY;
            bipedRotate += -xDiff * 0.6;
            dew.command(`Player.Armor.SetUiModelRotation ${normalize(bipedRotate)}`);
        }
    });
    $('.baseNav').mouseover(function(){
        activePage = location.hash;
    });
    $('.colorForm').mouseover(function(){
        activePage = location.hash+' #'+$(this).attr('id');
    });
	
	nameplateBaseImage.src = "dew://assets/emblems/nameplate/base.png";
	nameplateBaseTrayImage.src = "dew://assets/emblems/nameplate/base_tray.png";
	nameplateBaseTrayImage.onload = function() {
		changeImageColor("nameplateBaseTray", nameplateBaseTrayImage, "FFFFFF", 0, 0.55);
	}

    
    // Custom Emblem Modifications
    const max_width = 64;
    const max_height = 64;

    function fileRead(event) {
        var file = event.target.files[0];
        
        if (!file) { return; }
        
        const canvas = document.createElement("canvas");
        canvas.width = max_width;
        canvas.height = max_height;
        const ctx = canvas.getContext("2d", { alpha: true });
        
        var URL = window.webkitURL || window.URL;
        var url = URL.createObjectURL(file);
        var img = new Image();
        img.src = url;

        img.onload = function() {
            var width = img.width;
            var height = img.height;
            
            if (width >= height) {
                width = max_width;
                height = (max_height * img.height) / img.width;
            } else {
                width = (max_width * img.width) / img.height;
                height = max_height;
            }
            
            ctx.clearRect(0, 0, max_width, max_height);             

            if (width > height) {
                var y_offset = Math.trunc((max_height - height) / 2);
                ctx.drawImage(img, 0, y_offset, width, height);
            } 
            else if (height > width) {
                var x_offset = Math.trunc((max_width - width) / 2);
                ctx.drawImage(img, x_offset, 0, width, height);
            }
            else {
                ctx.drawImage(img, 0, 0, width, height);
            }
            
            var image_data = ctx.getImageData(0, 0, max_width, max_height);
            
            localStorage.setItem("emblem", JSON.stringify(Array.from(image_data.data)));
            localStorage.setItem("emblemURL", canvas.toDataURL('image/png'));
            
            dew.notify("reload-local-emblem", {});
            
            Array.from(document.getElementsByClassName("emblemPreviewBig"))[0].src = canvas.toDataURL('image/png');
            $("#customEmblemRemove").show();
        }
    }

    document.getElementById("emblem_filepicker").addEventListener("change", fileRead);
    
    $("#customEmblemRemove").off("click").on("click", function (e) {
        let reset_emblem_dialog_template = {
            title: `WARNING`,
            body: 'Remove your custom emblem ?',
            icon: "warning",
            dialogHeight: 33.333,
            options: [
                { label: 'Yes', value: 'yes' },
                { label: 'no', value: 'no', default: true  },
            ],
            buttonkey: [
                { label: 'Select', action: 'select', type: 'a_button', mouse: false},
                { label: 'Cancel', action: 'close', value: 'no', type: 'b_button' }
            ]
        };
        dew.dialog(reset_emblem_dialog_template).then(function(result){
            if(result == "yes"){
                localStorage.removeItem("emblem");
                localStorage.removeItem("emblemURL");
                UpdateEmblemDisplay(false);
                document.getElementById("emblem_filepicker").value = null;
                $("#customEmblemRemove").hide();
                dew.notify("clear-local-emblem", {});
            }
        });
    });
    
});

function handleRightClick(){
    if(activePage.includes(" ") || subForm.includes(" "))
        exitSubform();
    else
        cancelButton();
}

dew.input.on('scroll', handleVirtualScroll);
dew.input.on('action', handleAction);

function handleVirtualScroll(type, axis, value){
    if (axis === 0){
        let step = ((type === 2) ? 4 : 1) * value;
        if(step == -1)
            upNav();
        if(step == 1)
            downNav();
    }else if (axis === 1){
        let step = ((type === 2) ? 4 : 1) * value;
        if(step == -1)
            leftNav();
        if(step == 1)
            rightNav();
    }
    
    if(type === 2 && !activePage.startsWith('#page3 #colors') && !activePage.startsWith('#page2 #colors')){
        if(value == -1){ // left trigger
            if(itemNumber > 0){
                itemNumber = 0;
                updateSelection(itemNumber, true, true);
            }
        }else
        if(value == 1){ // right trigger
            if(itemNumber < $(activePage + ' label:visible').length-1){
                itemNumber = $(activePage + ' label:visible').length-1;
                updateSelection(itemNumber, true, true);
            }
        }
    }
}

function handleAction(e) {
    switch(e.action){
        case dew.input.Actions.A:
            selectElement();
            break
        case dew.input.Actions.B:
            if(activePage.includes(" ") || subForm.includes(" ")){
                exitSubform();
            }else{
                cancelButton();
            }
            break;
        case dew.input.Actions.X:
            if(activePage.startsWith('#page3')){
                toggleIcon();
            }
            break;
        case dew.input.Actions.Y:
            if(activePage.startsWith('#page1')){
                randomArmor();
            }else if(activePage.startsWith('#page2')){
                randomColors();
            }else if(activePage.startsWith('#page3')){
                randomEmblem();
            }
            break;
        case dew.input.Actions.Select:
            reset();
            break;
        case dew.input.Actions.Start:
            openModBrowser();
            break;
        case dew.input.Actions.LeftBumper:
            prevPage();
            break
        case dew.input.Actions.RightBumper:
            nextPage();
            break;
    }
}

function setControllerButtons(){
    $('#reset img').attr('src','dew://assets/buttons/360_back.png');
    $('#randomArmor img').attr('src','dew://assets/buttons/360_Y.png');
    $('#randomColors img').attr('src','dew://assets/buttons/360_Y.png');
    $('#modBrowser img').attr('src','dew://assets/buttons/360_Start.png');
    $('#cancelButton img').attr('src','dew://assets/buttons/360_B.png');
    $('#toggleIconButton img').attr('src','dew://assets/buttons/360_X.png');
    $('#randomEmblem img').attr('src','dew://assets/buttons/360_Y.png');
    $('#dismissButton img').attr('src','dew://assets/buttons/360_B.png');
    $('#namePrompt img').attr('src','dew://assets/buttons/360_Y.png');
    $('#okButton img').attr('src','dew://assets/buttons/360_A.png');
    $('.tabs img').eq(0).attr('src','dew://assets/buttons/360_LB.png');
    $('.tabs img').eq(1).attr('src','dew://assets/buttons/360_RB.png');
}

function resetArmorListenerEvents(){	
	$('.baseNav').off('click').on('click', function(e){
		if(!$(this).hasClass("inputButton")){
			$('.clickedElement').removeClass('clickedElement');
			$(this).addClass('clickedElement');
		}
	});
	$('.buttonContainer').off('mouseleave').on('mouseleave', function(e){
		$('.baseNav').removeClass('selectedElement');
	});
	$('.armorForm input').off('change').on('change', function(e){
		dew.playSound('a_button');
		$(this).parent().parent().parent().find('.selectedElement').removeClass('selectedElement');
		$(this).parent().parent().addClass('selectedElement');
		$(this).parent().parent().parent().find('.chosenElement').removeClass('chosenElement');
		$(this).parent().parent().addClass('chosenElement');
		$.grep(settingsToLoad, function(result){
			if(result[0] == e.target.name){
				if(result[1] == "Player.PreferredCharacter"){
					dew.command('Player.PreferredCharacter', {}).then(function(response){
						if(response != e.target.value)
						dew.command('Player.Armor.ReturnCustomizationBiped', {}).then(function(){
							dew.command(result[1]+' '+e.target.value, {}).then(function() {
								dew.command('Game.ScenarioScript character_changed');
								setRepresentation();
								adjustBiped();
							});
						});
					});
				}else
				dew.command(result[1]+' '+e.target.value);
				$(location.hash+' #infoBox #infoText').text(result[3]);
			};
			$(location.hash+' #infoBox #infoHeader').text(e.target.computedName);
		});
		$(location.hash+' #infoBox #infoText').text($(this).attr('desc'));
		SetArmorPrefs();
	});
	
	$('.armorForm').submit(function() {
        return false;
    });
		
	$('.baseNav').off('mouseover').on('mouseover', function(e){
        activePage = location.hash;
    });
	
	$('.armorForm').off('mouseover').on('mouseover', function(e){
		activePage = location.hash+' #'+$(this).attr('id');
	});
	
	$(document).on('mousemove', function(event) {
		lastMousePosition = { x: event.screenX, y: event.screenY };
	});
    
	$('span').has('.setting').off('mouseover').on('mouseover', function(e){
		//prevent mouse setting off scroll events if it hasnt moved since the last event
		var currentMousePosition = { x: e.screenX, y: e.screenY };
		if (currentMousePosition.x === lastMousePosition.x && currentMousePosition.y === lastMousePosition.y){
			return;
		}

		itemNumber = $(activePage+' span').has('.setting').index($(this));
		updateSelection(itemNumber, false, false);
	});
	
	$('span').has('.setting').off('mouseout').on('mouseout', function(e){
		if(!hasGP){
			$(this).removeClass('selectedElement');
		}
	}); 
}

function setRepresentation(){
	dew.command('Player.Armor.ListCustomizationPermutation', {}).then(function(json){	
		var obj = JSON.parse(json);	
		
		repName = obj.name;

		regionList = [];
		characterColors = [];
		colorList = [];
		defaultColorList = [];
		
		if(typeof obj.colors !== 'undefined'){
			if(obj.colors.primaryDefault)
				defaultColorList.push(["colorsPrimary", obj.colors.primaryDefault]);
			if(obj.colors.secondaryDefault)
				defaultColorList.push(["colorsSecondary", obj.colors.secondaryDefault]);
			if(obj.colors.tertiaryDefault)
				defaultColorList.push(["colorsTertiary", obj.colors.tertiaryDefault]);
			if(obj.colors.quaternaryDefault)
				defaultColorList.push(["colorsQuaternary", obj.colors.quaternaryDefault]);
			if(obj.colors.quinaryDefault)
				defaultColorList.push(["colorsQuinary", obj.colors.quinaryDefault]);
		}
		
		document.querySelectorAll(".dynamicItem").forEach(e => e.parentNode.removeChild(e));

		if(obj.colors && obj.colors.primary){
			var entryItem = ['colorsPrimary', obj.colors.primary, obj.colors.primaryDesc, "primary"];
			characterColors.push(entryItem);
			
			var elem = document.getElementById("primaryButton");
			elem.innerText = obj.colors.primary;
			elem.parentElement.style.display = "block";
			elem.parentElement.classList.add("setting")
		}else{
			var elem = document.getElementById("primaryButton");
			elem.parentElement.style.display = "none";
			elem.parentElement.classList.remove("setting");
		}
		
		if(obj.colors && obj.colors.secondary){
			var entryItem = ['colorsSecondary', obj.colors.secondary, obj.colors.secondaryDesc, "secondary"];
			characterColors.push(entryItem);
			
			var elem = document.getElementById("secondaryButton");
			elem.innerText = obj.colors.secondary;
			elem.parentElement.style.display = "block";
			elem.parentElement.classList.add("setting")
		}else{
			var elem = document.getElementById("secondaryButton");
			elem.parentElement.style.display = "none";
			elem.parentElement.classList.remove("setting");
		}
		
		if(obj.colors && obj.colors.tertiary){
			var entryItem = ['colorsTertiary', obj.colors.tertiary, obj.colors.tertiaryDesc, "tertiary"];
			characterColors.push(entryItem);
			
			var elem = document.getElementById("tertiaryButton");
			elem.innerText = obj.colors.tertiary;
			elem.parentElement.style.display = "block";
			elem.parentElement.classList.add("setting")
		}else{
			var elem = document.getElementById("tertiaryButton");
			elem.parentElement.style.display = "none";
			elem.parentElement.classList.remove("setting");
		}
		
		if(obj.colors && obj.colors.quaternary){
			var entryItem = ['colorsQuaternary', obj.colors.quaternary, obj.colors.quaternaryDesc, "quaternary"];
			characterColors.push(entryItem);
			
			var elem = document.getElementById("quaternaryButton");
			elem.innerText = obj.colors.quaternary;
			elem.parentElement.style.display = "block";
			elem.parentElement.classList.add("setting")
		}else{
			var elem = document.getElementById("quaternaryButton");
			elem.parentElement.style.display = "none";
			elem.parentElement.classList.remove("setting");
		}
		
		if(obj.colors && obj.colors.quinary){
			var entryItem = ['colorsQuinary', obj.colors.quinary, obj.colors.quinaryDesc, "quinary"];
			characterColors.push(entryItem);
			
			var elem = document.getElementById("quinaryButton");
			elem.innerText = obj.colors.quinary;
			elem.parentElement.style.display = "block";
			elem.parentElement.classList.add("setting")
		}else{
			var elem = document.getElementById("quinaryButton");
			elem.parentElement.style.display = "none";
			elem.parentElement.classList.remove("setting");
		}
		
		if($('#page2 form:visible')){
			$('#page2 .selectedElement').removeClass('selectedElement');
			colorPicker = null;
			colorLocation = null;
			$('#page2 form').hide();
			$('#page2 #infoBox').hide();
		}
		
		if(resetCharacters){
			characters = [];
			for(var i = 0; i <  obj.characters.length; i++){
				var character = obj.characters[i];
				var entry = [character.name, character.type, character.description, 'races'];
				characters.push(entry);
			}
		}
		
		var buttonContainer = document.querySelectorAll("#page1 #buttonContainer")[0];		
		var sideListContainer = document.getElementById("armorSideList");		
		
		if(obj.regions)
			for(var r = 0; r < obj.regions.length; r++){
				var region = obj.regions[r];
				
				var span = document.createElement("span");
				var div = document.createElement("div");
				var label = document.createElement("label");

				div.setAttribute('class', 'setting baseNav button-list dynamicItem');
				div.setAttribute('onclick', "armorShow('armor" + r + "', $(this), '"+region.type+"');");
				label.innerText = region.name;

				div.appendChild(label);
				span.appendChild(div);
				buttonContainer.appendChild(span);
				
				var permutations = [];
				for(var p = 0; p < region.permutations.length; p++){
					var entry = region.permutations[p];
					var entryItem = [entry.name, entry.permutation, entry.desc,  region.type];
					permutations.push(entryItem);	
				}
				var regionEntry = ['armor'+r, permutations, region.type];
				regionList.push(regionEntry);

				var formItem = document.createElement("form");

				formItem.setAttribute('class', 'armorForm hide tile-button tile-large dynamicItem');
				formItem.setAttribute('id', "armor"+r);
				sideListContainer.appendChild(formItem);
			}
		
		//Append gender to bottom of list
		var span = document.createElement("span");
		var div = document.createElement("div");
		var label = document.createElement("label");
		div.setAttribute('class', 'setting baseNav button-list dynamicItem');
		div.setAttribute('onclick', "armorShow('gender', $(this), 'gender');");
		label.innerText = "Gender";
		div.appendChild(label);
		span.appendChild(div);
		buttonContainer.appendChild(span);
		
		//Move Gender and Race sidelists to end of the element
		sideListContainer.appendChild(document.getElementById('gender'));
		sideListContainer.appendChild(document.getElementById('races'));
		
		if(resetCharacters){
			setRadioList('races', characters, "armor", true, "assets/armor");
			resetCharacters = false;
		}
		
		for(var rlist = 0; rlist < regionList.length; rlist++){
				setRadioList("armor" + rlist, regionList[rlist][1], "armor", true, "assets/armor/"+repName);
		}		
		
		resetArmorListenerEvents();
		
		if(resetCharacters)
			resetCharacters = false;
		
		setControlValues();
		
		dew.command('Player.PreferredCharacter', {}).then(function(response){
			setDivValue("races", response);
		});
	});
}

dew.on('show', function(event){
	isVisible = true;
	showing = true;
	resetCharacters = true;
	setRepresentation();
			
	$('#background').hide();
	$('#settingsWindow').hide();
	$('#background_left').hide();
	$('#blueHeader, #blueFooter, #blackLayer, #background_left_header, #background_left_footer').hide();
	$('.armorForm, .colorForm, .emblemForm, .emblemColorForm').hide();
	$('#tab-gradient').hide();
	$('#infoHeader, #infoText').text('');
	$('.infoBox').hide();
	dew.getSessionInfo().then(function(i){
		if(i.mapName == "mainmenu"){
			$('#blackLayer').fadeIn(170, function() {
				dew.command('Game.ScenarioScript settings_cam').then(function(){
					dew.command('Player.Armor.Update').then(function(){
                        adjustBiped().then(function(){
                            $('#settingsWindow').show();
                            initActive();
                            initGamepad();
                            UpdateEmblemDisplay(true);
                            
                            $('#background, #background_left').show();
                            $('#blueHeader, #blueFooter, #background_left_header, #background_left_footer').show();
                            showing = false;
                            
                            setTimeout(function() {
                                dew.command('Game.DisableScreenEffect 0 1')
                                dew.command('game.hideh3ui 1');
                                $('#blackLayer').fadeOut(170);
                            }, 100);
                        });
					});
				});
			})
		}else{
			dew.hide();
			showing = false;
		}
	});
});

function initGamepad(){
    dew.command('Settings.Gamepad', {}).then(function(result){
        if(result == 1){
            hasGP = true;
            onControllerConnect();
            setControllerButtons();
            $('button img,.tabs img').show();
        }else{
            onControllerDisconnect();
            hasGP = false;
            $('button img,.tabs img').hide();
        }
    });
}

dew.on('hide', function(e){
	$('.clickedElement').removeClass('clickedElement');
    dew.command('Game.HideH3UI 0');
	isVisible = false;
});

function rotateBiped(direction){
    var rotateAmount = 2;
    if(direction == "right"){
        bipedRotate+=rotateAmount;
    }else{
        bipedRotate-=rotateAmount;
    }
    dew.command('Player.Armor.SetUiModelRotation '+bipedRotate);
}

function initActive(){
    tabIndex = 0;
    $('.selected').removeClass('selected');
    $('.tabs li:visible').eq(0).addClass('selected');
    location.hash = $('.selected a')[0].hash;
    activePage = window.location.hash;
}

function setControlValues(){
    dew.getCommands().then(function (commands){
        for(i = 0; i < commands.length; i++){
            var setValue = commands[i].value;
            $.grep(settingsToLoad, function(result){
				//TODO make sure this reads the right variable from dew prefs
                if(result[1] == commands[i].name){
                    if($('#'+result[0]).is('form')){
                        $('#'+result[0]+' :radio[value=""]').attr('checked',true);
                        $('#'+result[0]+' :radio[value="'+setValue+'"]').attr('checked',true);
						$('#'+result[0]+' :radio[value="'+setValue+'"]').parent().parent().parent().find('.chosenElement').removeClass('chosenElement');
                        if($('#'+result[0]+' :radio[value="'+setValue+'"]').length){
                            $('#'+result[0]+' :radio[value="'+setValue+'"]').parent().parent().addClass('chosenElement');
                        }else{
                            $('#'+result[0]+' :radio[value="base"]').parent().parent().addClass('chosenElement');
							$('#'+result[0]+' :radio[value="base"]').attr('checked', true);
                        }
                        $('#'+result[0]+'Text').val(setValue);
                    }else{
                        if($('#'+result[0]).hasClass('tinySetting')){
                            setValue = parseFloat(setValue);
                        }
                        $('#'+result[0]).val(setValue);
                    }
                    $('#'+result[0]).val(setValue);
                    if($('#'+result[0]).hasClass('hasTiny')){
                        $('#'+result[0]+'Text').val(setValue);
                    }
                };
            });
        }
    })
	GetArmorPrefs();
	GetColorPrefs();
	$("#toggleButton").hide();
}

function waitUntilShowFinished() {
  return new Promise(resolve => {
	setTimeout(function(){
        resolve();
    }, 400);
    const interval = setInterval(() => {
      if (isVisible == true && showing == false) {
        clearInterval(interval);
        resolve();
      }
    }, 1);
  });
}

async function cancelButton(){
	if(!isVisible || showing)//Wait until dew.Show has finished setting things up before tryign to hide the screen
		await waitUntilShowFinished()
	
    itemNumber = 0;
    effectReset(false);
	subCamera = false;
	page1();
	if(emblemNeedsToApply){
		SaveEmblem();
		SubmitEmblemToStatsServer();
	}
	dew.command('writeconfig');
}

exiting = false;
function effectReset(quick){
    // Prevent escape spamming
    if(exiting)
        return;
    exiting = true;

	if(!quick)
		dew.playSound('back_button');
    
	dew.getSessionInfo().then(function(i){
        if(i.mapName == "mainmenu"){
            $('#blackLayer').fadeIn((quick ? 0 : 170), function(){
				$('#background, #background_left').hide();
				if(!quick){
					dew.command('Game.ScenarioScript leave_settings');
					dew.command('Player.Armor.ReturnCustomizationBiped');
				}
                
				$('#settingsWindow').hide();
				$('#blueHeader, #background_left_header').hide();
				$('#blueFooter, #background_left_footer').hide();
				
				setTimeout(function() {
                    dew.command('Game.DisableScreenEffect 0 0');
                    dew.command('game.hideh3ui 0');
                    
					$('#blackLayer').fadeOut((quick ? 0 : 170), function(){
						dew.hide();
						exiting = false;
					});
				},170);
            })
        }else{
            dew.hide();
            exiting = false;
        }
    })
}

var resetDelayed = false;
function reset(){
	dew.dialog('confirm_reset_customization').then(function(result){
		if(result == "yes"){
			if(activePage.startsWith("#page1")){
				for(let i = 0; i < regionList.length; i++)
					setDivValue(regionList[i][0], "base", true);
				SetArmorPrefs();
			}else
			if(activePage.startsWith("#page2")){
				for(let i = 0; i < colorList.length; i++)
				{
					let divElement = colorList[i][0];

					if(defaultColorList.length != 0)
					{
						for(x = 0; x < defaultColorList.length; x++){
							if(defaultColorList[x][0] == divElement){
								color = defaultColorList[x][1];
								dew.command(colorList[i][1]+' '+color);
								break;
							}
						}
					}
					else
						color = "#000000";
					
					setDivValue(divElement, color, false);
				}
			}else
			if(activePage.startsWith("#page3")){
				if(!resetDelayed){
					var emblemArray = ['emblemIcon','emblemBackgroundImage',];
					for(var i = 0; i < emblemArray.length; i++) {
						var $options = $('#'+emblemArray[i]).find('input');
						$options.eq(0).parent().parent().parent().find('.chosenElement').removeClass('chosenElement');
						$options.eq(0).parent().parent().addClass('chosenElement');
						$options.eq(0).prop('checked', true);
						itemNumber = 0;
						updateSelection(itemNumber,false,true, '#page3 #' + emblemArray[i]);
					}
					var colorArray = ['colorsEmblemPrimary','colorsEmblemSecondary','colorsEmblemImage'];
					for(var i = 0; i < colorArray.length; i++) {
					   var defaultColor = '#C3C3C3'
						emblemList[i][1] = defaultColor.substring(1);
						$('#'+colorArray[i]+'Text').val(defaultColor);
						$('#'+colorArray[i]).val(defaultColor);
						$('#'+colorArray[i]+' input').parent().parent().parent().find('.chosenElement').removeClass('chosenElement');
						$('#'+colorArray[i]+' input').eq(0).prop('checked', true);
						$('#'+colorArray[i]+' input').eq(0).parent().parent().addClass('chosenElement');
					}
					
					//reset nameplate color
					var defaultColor = '#546e26';
					$('#colorsNameplateText').val(defaultColor);
					$('#colorsNameplate').val(defaultColor);
					$('#colorsNameplate input').parent().parent().parent().find('.chosenElement').removeClass('chosenElement');
					$('#colorsNameplate input').eq(0).prop('checked', true);
					$('#colorsNameplate input').eq(0).parent().parent().addClass('chosenElement');
					dew.command("Player.NameplateColor "+defaultColor);
					
					emblemToggle = 1;
					emblemNeedsToApply = true;
					UpdateEmblemDisplay(false);			
					resetDelayed = true;
					
					setTimeout(function (){
						resetDelayed = false;
					}, 200);
				}
			}
		}
	});
	
	dew.playSound("a_button");
}

function randomArmor(){
    for(var i = 0; i < regionList.length; i++) {
        var $options = $('#'+regionList[i][0]).find('input'),
            random = ~~(Math.random() * $options.length);
 		$options.eq(random).parent().parent().parent().find('.chosenElement').removeClass('chosenElement');
 		$options.eq(random).parent().parent().addClass('chosenElement');
 		$options.eq(random).prop('checked', true);
		$options.eq(random).click();
		itemNumber = random;
		updateSelection(itemNumber,false,true, '#page1 #' + regionList[i][0]);
    }
	SetArmorPrefs();
	dew.playSound("a_button");
}

function randomEmblem(){
	var emblemArray = ['emblemIcon','emblemBackgroundImage',];
	for(var i = 0; i < emblemArray.length; i++) {
		var $options = $('#'+emblemArray[i]).find('input'),
			random = ~~(Math.random() * $options.length);
		$options.eq(random).parent().parent().parent().find('.chosenElement').removeClass('chosenElement');
		$options.eq(random).parent().parent().addClass('chosenElement');
		$options.eq(random).prop('checked', true);
		itemNumber = random;
		updateSelection(itemNumber,false,true, '#page3 #' + emblemArray[i]);
	}
	var colorArray = ['colorsEmblemPrimary','colorsEmblemSecondary','colorsEmblemImage', 'colorsNameplate'];
	for(var i = 0; i < colorArray.length; i++) {
	   var randomColor = '#'+leftPad(Math.floor(Math.random()*16777215).toString(16).toUpperCase(),6,'0');
	    
		if(colorArray[i] != 'colorsNameplate')
			emblemList[i][1] = randomColor.substring(1);
		$('#'+colorArray[i]+'Text').val(randomColor);
		$('#'+colorArray[i]).val(randomColor);
		$('#'+colorArray[i]+' input').parent().parent().parent().find('.chosenElement').removeClass('chosenElement');
		$('#'+colorArray[i]+' input').eq(0).prop('checked', true);
		$('#'+colorArray[i]+' input').eq(0).parent().parent().addClass('chosenElement');
		if(colorLocation != null && colorLocation == colorArray[i]){
			var currentVal = ColorUtil.hexToHsv(randomColor.split('#')[1]);
			if(colorPicker != null)
				colorPicker.setColor(currentVal);
		}
		
		if(colorArray[i] == 'colorsNameplate')
			dew.command("Player.NameplateColor "+randomColor);
	}
	emblemNeedsToApply = true;
	UpdateEmblemDisplay(false);
	dew.playSound("a_button");
}

function randomColors(){
    var colorArray = ['colorsPrimary','colorsSecondary','colorsTertiary','colorsQuaternary','colorsQuinary'];
    for(var i = 0; i < colorArray.length; i++) {
        var randomColor = '#'+leftPad(Math.floor(Math.random()*16777215).toString(16).toUpperCase(),6,'0');
        $('#'+colorArray[i]+'Text').val(randomColor);
        $('#'+colorArray[i]).val(randomColor);
		$('#'+colorArray[i]+' input').parent().parent().parent().find('.chosenElement').removeClass('chosenElement');
        $('#'+colorArray[i]+' input').eq(0).prop('checked', true);
		$('#'+colorArray[i]+' input').eq(0).parent().parent().addClass('chosenElement');
		if(colorLocation != null && colorLocation == colorArray[i]){
			var currentVal = ColorUtil.hexToHsv(randomColor.split('#')[1]);
			if(colorPicker != null)
				colorPicker.setColor(currentVal);
		}
	
        $.grep(settingsToLoad, function(result){
            if(result[0] == colorArray[i]){
                dew.command(result[1] + ' ' + randomColor);
            };
        });
    }
	dew.playSound("a_button");
}

function openModBrowser(){
    dew.playSound("a_button"); 
    dew.command('game.showscreen mod_browse');
}

function updateSelection(item, sound, move, direct){
	var elem = (direct ? direct : activePage);

    if(item > -1){
		//duplicate line is a fix for a selectedElement occasionally staying active when another entry has been selected in a specific way.
        $(elem).find('.selectedElement').removeClass('selectedElement');
		
        $(elem + ' label:visible').eq(item).parent().addClass('selectedElement');
        if($(elem+' .selectedElement').length && move){
            $(elem+' .selectedElement')[0].scrollIntoView({behavior: "smooth", block: "center", inline: "center"});
        }
        if(sound){
            dew.playSound('vertical_navigation');
        }
    }
}

function prevPage(){
    $('.selectedElement').removeClass('selectedElement');
    if(tabIndex > 0){
        $('.tabs li:visible a').eq(tabIndex-1).click();
    }
}

function nextPage(){
    $('.selectedElement').removeClass('selectedElement');
    var tabLength = $('.tabs li').length-1;
    if(tabIndex < tabLength){
        $('.tabs li:visible a').eq(tabIndex+1).click();
    }
}

function upNav(){
    if(activePage.startsWith('#page2 #color') || activePage.startsWith('#page3 #color')){
		if(!activePage.includes("colorPicker")){
			if(itemNumber > 3){
				itemNumber-=3;
				updateSelection(itemNumber, true, true);
			}else if(itemNumber > 0){
				itemNumber = 0;
				updateSelection(itemNumber, true, true);
			}
		}
    }else{
        if(itemNumber > 0){
            itemNumber--;
            updateSelection(itemNumber, true, true);
        }else
        {
            if(itemNumber < $(activePage + ' label:visible').length-1){
                itemNumber = $(activePage + ' label:visible').length-1;
                updateSelection(itemNumber, true, true);
            }
        }
    }
}

function downNav(){
    if(activePage.startsWith('#page2 #color') || activePage.startsWith('#page3 #color')){
        if(itemNumber < $(activePage + ' label:visible').length-3 && !activePage.includes("colorPicker")){
            if(itemNumber == 0){
                itemNumber+=1;
            }else{
                itemNumber+=3;
            }
            updateSelection(itemNumber, true, true);
        }
    }else{
		//Page entry lists
        if((activePage.split(' ').length < 2 && itemNumber < $(activePage + ' #ButtonContainer label:visible').length-1 && activePage == '#page2') || 
		((activePage.split(' ').length < 2 && itemNumber < $(activePage + ' label:visible').length-1 && activePage == '#page3')) || 
		(activePage.split(' ').length < 2 && itemNumber < $(activePage + ' label:visible').length-1 && activePage == '#page1') || 
		(activePage.split(' ').length > 1 && itemNumber < $(activePage + ' label:visible').length-1)){
            itemNumber++;
            updateSelection(itemNumber, true, true);
        }else{
            itemNumber = 0;
            updateSelection(itemNumber, true, true);
        }
    }
}

function onControllerConnect(){
    updateSelection(itemNumber, false, true);
    $('button img, .tabs img').show();
}

function onControllerDisconnect(){
    $('.selectedElement').removeClass('selectedElement');
    $('button img, .tabs img').hide();
}

function inputBox(type){
	dew.playSound('a_button');
    if(type == 'playerName'){
    dew.command('Player.Name', {}).then(function(response) {
        dew.dialog("edit_player_name",{
            initialValue: response
        }).then(result => {
            if (result !== '-1') {
                dew.command('Player.Name \"' + result + "\"");
                dew.notify("settings-update", [['Player.Name',result]]);
                
                //Submit to Stats server with emblem
                SetupEmblems(false, function(){
                    SubmitEmblemToStatsServer();
                });
            }
        });
    });
        
        
    }else if(type == 'serviceTag'){
        dew.command('Player.ServiceTag', {}).then(function(response) {
            dew.dialog("edit_service_tag",{
                initialValue: response
            }).then(result => {
                if (result !== '-1') {
                    dew.command('Player.ServiceTag '+ result.toUpperCase());
                    dew.notify("settings-update", [['Player.ServiceTag',result.toUpperCase()]]);
                    
                    //Submit to Stats server with emblem
                    SetupEmblems(false, function(){
                        SubmitEmblemToStatsServer();
                    });
                }
            });
        });
    }
}

function enterSubCamera(region){
	dew.command('Player.Armor.SetRegionCamera ' + region, {}).then(function(json) {
		var result = JSON.parse(json);
		var prevStatus = subCamera;
		
		if(result.success == "true")
			subCamera = true;
		else
			subCamera = false;
		
		if(!subCamera && prevStatus)//if the camera was previously set but failed now then exit
			exitSubCamera();
		
		//update new rotation value
		if(typeof result.rotation !== 'undefined')
			bipedRotate = parseFloat(result.rotation);
	});
}

function leftNav(){
    if(((activePage.startsWith('#page2 #color') || activePage.startsWith('#page3 #color'))&& itemNumber % 3 != 1) && !activePage.includes("colorPicker")){
         itemNumber--;
         updateSelection(itemNumber, true, true);
    }
}

function rightNav(){
    if((activePage.startsWith('#page2 #color') || activePage.startsWith('#page3 #color')) && !activePage.includes("colorPicker")){
        if(itemNumber % 3 != 0){
            itemNumber++;
            updateSelection(itemNumber, true, true);
        }
    }
}

function selectElement(){
    if(activePage == location.hash){
        $(activePage+' .selectedElement').click();
    }else if($(activePage + ' form:visible')){
        $(activePage+' .selectedElement').find('input').click();
    }
}

function exitSubform(quiet){	
	var page = activePage;
	
	if(subForm != "")
		page = subForm;
	
    if($(page + ' form:visible') && page != location.hash){
        $(page+' .selectedElement').removeClass('selectedElement');
		$('.clickedElement').removeClass('clickedElement');
		activePage = location.hash;
		if(subForm)
			page = subForm.substr(0, subForm.indexOf(" "));
		else
			page = activePage;
		
        itemNumber = $(page+' span').has('.setting').index($('span:has(.selectedElement)'));
        colorPicker = null;
        colorLocation = null;
        if(!quiet)
			dew.playSound('b_button');
        $(page + ' form[style=\'display: block;\']').hide();
        $(page + ' form[style=\'display: inline;\']').hide();
        $(page + ' form[style=\'display: grid;\']').hide();
        $(page + ' #infoBox').hide();
    }
	
	if(subCamera && location.hash != "#page3")
		exitSubCamera();
	
	subForm = "";
}

function exitSubCamera(){
	subCamera = false;
	dew.command('Player.Armor.SetRegionCamera exit');
	adjustBiped(true);
}

async function adjustBiped(smoothRotation){
	return new Promise(resolve => {
		var camera_script = (smoothRotation ? "exit_subcamera" : "")
		dew.command('Player.Armor.SetCustomizationUI ' + camera_script).then(function(json){
			if(json.startsWith("ERROR")){
				console.error("Customization failed to load with error: " + json);
				resolve();
			}else
			{
				var obj = JSON.parse(json);	
				bipedRotate = parseFloat(obj.rotation);
				UserCanRotate = obj.rotatable;
				resolve();
			}
		});
	});
}

function changeImageColor(canvasId, image, hexColor, amt = 1, opacity = 1, desats = 0) {
	const canvas = document.getElementById(canvasId);
	const context = canvas.getContext("2d");
  
    canvas.width = image.width;
    canvas.height = image.height;
    
    context.drawImage(image, 0, 0, image.width, image.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    
	// Convert hex color to RGB values
    const r = parseInt(hexColor.substring(1,3), 16) / 255;
    const g = parseInt(hexColor.substring(3,5), 16) / 255;
    const b = parseInt(hexColor.substring(5,7), 16) / 255;
	
	const data = new Uint8ClampedArray(imageData.data);
	for (let i = 0; i < data.length; i += 4) {
		data[i] *= r * amt;
		data[i + 1] *= g * amt;
		data[i + 2] *= b * amt;
		data[i + 3] *= opacity;
		
		if(desats != 0){
			var desat = reduceSaturation(data[i], data[i+1],data[i+2], desats)
			data[i] = desat[0];
			data[i+1] = desat[1];
			data[i+2] = desat[2];
		}
	}
    
    const newImageData = new ImageData(data, imageData.width, imageData.height);
	context.putImageData(newImageData, 0, 0);
}

function reduceSaturation(r, g, b, percentage) {
  // Convert RGB to HSL
  let hsl = rgbToHsl(r, g, b);

  // Reduce the saturation by the given percentage
  hsl[1] *= (1 - percentage / 100);

  // Convert HSL back to RGB
  let rgb = hslToRgb(hsl[0], hsl[1], hsl[2]);

  return rgb;
}

function rgbToHsl(r, g, b) {
  r /= 255, g /= 255, b /= 255;

  let max = Math.max(r, g, b);
  let min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max == min) {
    h = s = 0;
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [h, s, l];
}

function hslToRgb(h, s, l) {
  let r, g, b;

  if (s == 0) {
    r = g = b = l;
  } else {
    let hue2rgb = function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }

    let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    let p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function SetupEmblems(initializeEmblemSettings, onFinish){	
	$.getJSON('emblem_list.json', function(data) {
		dew.command('Player.Emblem').then(function(player_emblem){
			if(player_emblem == "")//Shouldnt happen but just in case
				player_emblem = "?1=0&2=0&3=0&fi=0&bi=0&fl=1";
			
			var embList = data;
										
			if(firstRun){
				setRadioList('emblemIcon',embList.emblemList, "emblem", false);
				setRadioList('emblemBackgroundImage', embList.backgroundEmblems, "emblem", false);
				setRadioList('nameplateImage', nameplateList, "emblem", false);
				firstRun = false;
			}
			
			$('#emblemIcon input, #emblemBackgroundImage input, #colorsEmblemPrimary input, #colorsEmblemSecondary input, #colorsEmblemImage input, #colorsEmblemBackground input').off('click').on('change click', function(e) {
				emblemNeedsToApply = true;
			});
			
			$('#nameplateImage input').off('change click').on('change click', function(e) {
				var nameplate = parseInt($('#nameplateImage input:checked').val());
				dew.command('Player.Nameplate ' + nameplate);
				
				
				dew.command("Player.NameplateColor").then(function(hexColor){
					nameplateImage.src = "dew://assets/emblems/nameplate/" + nameplate + ".png";
					nameplateImage.onload = function() {
						changeImageColor("nameplatePreview", nameplateImage, hexColor, 0.8, 0.45);
						changeImageColor("nameplateBase", nameplateBaseImage, hexColor, 1.8, 1.3, 10);
					}
				});					
			});
			
			$('.emblemColorForm input').off('click').on('click', function(e){
				$(this).parent().parent().parent().find('.chosenElement').removeClass('chosenElement');
				$(this).parent().parent().addClass('chosenElement');
				if(itemNumber != 0)
					dew.playSound('a_button');
			});
			
			$('.emblemForm input').off('click').on('click', function(e){
				$(this).parent().parent().parent().find('.selectedElement').removeClass('selectedElement');
				$(this).parent().parent().addClass('selectedElement');	
				$(this).parent().parent().parent().find('.chosenElement').removeClass('chosenElement');
				$(this).parent().parent().addClass('chosenElement');			
				dew.playSound('a_button');									
				UpdateEmblemDisplay(false);
			});
			
			$('#colorsEmblemPrimaryText, #colorsEmblemSecondaryText, #colorsEmblemImageText, #colorsNameplateText').off('click').on('click', function(e){
				$('.emblemColorForm').hide();
				colorPicker = dew.makeColorPicker(document.querySelector('#emblemColorPicker'));
				colorLocation = $(this).prev()[0].name;
				var whichColor = $(this);
				if(typeof e.originalEvent !== "undefined")//check if click was via mouse and not directly called via .click()
					dew.playSound("a_button");
				
				$(this).prev()[0].checked = true;
				var currentVal = ColorUtil.hexToHsv($(this).val().split('#')[1]);
				activePage = location.hash+" #emblemColorPicker";
				$('#emblemColorPicker').show();
				colorPicker.setColor(currentVal);
				colorPicker.on('select', function(color) {
					var currentSelection = ColorUtil.hsvToRgb(color.h, color.s, color.v);
					whichColor.val('#'+leftPad(ColorUtil.rgbToHex(currentSelection[0],currentSelection[1],currentSelection[2]),6,'0'));
					whichColor.trigger('change');
				});
			});
						
			$('.emblemForm, .emblemColorForm').submit(function() {
				return false;
			});
			
			$('.emblemForm, .emblemColorForm').unbind("mouseover");
			$('span').has('.setting').unbind("mouseover");
			$('span').has('.setting').unbind("mouseout");
			
			$('.emblemForm, .emblemColorForm').mouseover(function(){
				activePage = location.hash+' #'+$(this).attr('id');
			});
			$('span').has('.setting').mouseover(function(e){
				//prevent mouse setting off scroll events if it hasnt moved since the last event
				var currentMousePosition = { x: e.screenX, y: e.screenY };
				if (currentMousePosition.x === lastMousePosition.x && currentMousePosition.y === lastMousePosition.y){
					return;
				}
                
				itemNumber = $(activePage+' span').has('.setting').index($(this));
				updateSelection(itemNumber, false, false);
			});
			
			$('span').has('.setting').mouseout(function(){
				if(!hasGP){
					$(this).removeClass('selectedElement');
				}
			}); 
			
			if(initializeEmblemSettings){
				
				emblemList[0][1] = "";
				emblemList[1][1] = "";
				emblemList[2][1] = "";
				
				setItemValues('emblemIcon', embList.emblemList[findIndexForArray(parseInt(getQueryVariable(player_emblem,'fi')),embList.emblemList)][1]);
				setItemValues('emblemBackgroundImage', embList.backgroundEmblems[findIndexForArray(parseInt(getQueryVariable(player_emblem,'bi')),embList.backgroundEmblems)][1]);
				dew.command('Player.Nameplate').then(function(nameplate_index){
					setItemValues('nameplateImage', nameplateList[findIndexForArray(parseInt(nameplate_index), nameplateList)][1]);
				});
				
				var three = getQueryVariable(player_emblem, '3');
				if(three.length == 6){
					emblemList[0][1] = three;
					$('#colorsEmblemPrimary').val('#'+three);
					$('#colorsEmblemPrimary :radio[value=""]').attr('checked', true);
					$('#colorsEmblemPrimary :radio[value=""]').parent().parent().addClass('chosenElement');
					$('#colorsEmblemPrimaryText').val('#'+three);
				}else
					setItemValues('colorsEmblemPrimary', h3ColorArray[parseInt(getQueryVariable(player_emblem,'3'))][1]);
				
				var two = getQueryVariable(player_emblem, '2');
				if(two.length == 6){
					emblemList[1][1] = two;
					$('#colorsEmblemSecondary').val('#'+two);
					$('#colorsEmblemSecondary :radio[value=""]').attr('checked', true);
					$('#colorsEmblemSecondary :radio[value=""]').parent().parent().addClass('chosenElement');
					$('#colorsEmblemSecondaryText').val('#'+two);
				}else
					setItemValues('colorsEmblemSecondary', h3ColorArray[parseInt(getQueryVariable(player_emblem,'2'))][1]);
				
				var one = getQueryVariable(player_emblem, '1');
				if(one.length == 6){
					emblemList[2][1] = one;
					$('#colorsEmblemImage').val('#'+one);
					$('#colorsEmblemImage :radio[value=""]').attr('checked', true);
					$('#colorsEmblemImage :radio[value=""]').parent().parent().addClass('chosenElement');
					$('#colorsEmblemImageText').val('#'+one);
				}else
					setItemValues('colorsEmblemImage', h3ColorArray[parseInt(getQueryVariable(player_emblem,'1'))][1]);
				
				emblemToggle = parseInt(getQueryVariable(player_emblem,'fl'));
			}
			
			if(typeof onFinish === "function")
				onFinish();
		});
	});
}

function setRadioList(ElementID, ArrayVar, radioType, shouldReset, path){
    var sel = document.getElementById(ElementID);
	
	if(shouldReset){
		while(sel.firstChild){
			sel.removeChild(sel.firstChild);
		}
	}
	
    for(var i = 0; i < ArrayVar.length; i++){
        let span = document.createElement("span");
        let label = document.createElement("label");
        let radio = document.createElement("input");
        radio.setAttribute('type', 'radio');
        radio.setAttribute('name', ElementID);
        radio.setAttribute('class', 'setting');
        if(ArrayVar[i][2]){
            radio.setAttribute('desc', ArrayVar[i][2]);
        }
        radio.value = ArrayVar[i][1];
        label.appendChild(radio);
        label.appendChild(document.createTextNode(ArrayVar[i][0]));
        span.appendChild(label);
        if(radioType == "armor"){
			const imgElementID = ElementID + "_" + ArrayVar[i][1];
			const PermutationPath = path +'/'+ArrayVar[i][3]+'/'+ArrayVar[i][1];
            let img = document.createElement("img");
			img.setAttribute('id', imgElementID);
			
			dew.getAssetUrl(PermutationPath, { pak:"mainmenu", fileTypes:['jpg','png']}).then(url => {
				//let imageURL = "dew://assets/armor/races/masterchief.png";
				if(url != "")
					$('#'+imgElementID).attr("src", url);
				
			});    
			
            span.appendChild(img);
        }
		if(radioType == "emblem"){
            let img = document.createElement("img");
            img.setAttribute('src', ArrayVar[i][2]);
			img.onerror = function() {
				this.src = "dew://assets/emblems/generic.png";
			}
            span.appendChild(img);
        }

        sel.appendChild(span);
    }
}

function armorShow(showMe, element, region){
    activePage = '#page1 #'+showMe;
	if(subForm == activePage)
		return;
	
    $('.baseNav').removeClass('selectedElement');
    $(activePage+' .selectedElement').removeClass('selectedElement');
    element.addClass('selectedElement');
    $('.armorForm').hide();
    $('#'+showMe).show();
    itemNumber = $('#'+showMe+' span').index($('#'+showMe+' input:checked').parent().parent());
    updateSelection(itemNumber, false, true);
    $(location.hash+' #infoBox #infoHeader').text($('#'+showMe+' input:checked').parent()[0].innerText);
    $(location.hash+' #infoBox #infoText').text($('#'+showMe+' input:checked').attr('desc'));
    $(location.hash+' #infoBox').show();
	dew.playSound('a_button');
	
	if(subForm != activePage && region) //if not already in subCamera for the selected region
		enterSubCamera(region);
	else if(!region && subCamera)
		exitSubCamera();

	subForm = activePage;
}

function colorShow(showMe, element, color){
    activePage = '#page2 #'+showMe;
	if(subForm == activePage)
		return;
	
    $('.baseNav').removeClass('selectedElement');
    $(activePage+' .selectedElement').removeClass('selectedElement');
    element.addClass('selectedElement');
    $('.colorForm').hide();
    $('#'+showMe).css('display', 'grid');
    itemNumber = $('#'+showMe+' span').index($('#'+showMe+' input:checked').parent().parent());
    updateSelection(itemNumber, false, true);
    $.grep(characterColors, function(result, index){
        if(result){
            if(result[0] == showMe){
                $(location.hash+' #infoBox #infoText').text(result[2]);
            }
        }
    });
    $(location.hash+' #infoBox #infoHeader').text($('#'+showMe+' input:checked').parent()[0].innerText);
    $(location.hash+' #infoBox').show();
	dew.playSound('a_button');
	
	if(subForm != activePage && color) //if not already in subCamera for the selected color
		enterSubCamera(color);
	else if(!color && subCamera)
		exitSubCamera();
	
	subForm = activePage;
}

function emblemShowList(showMe, element, colorGrid){
    activePage = '#page3 #'+showMe;
	if(subForm == activePage)
		return;
	
    $('.baseNav').removeClass('selectedElement');
    $(activePage+' .selectedElement').removeClass('selectedElement');
    element.addClass('selectedElement');
	$('.emblemColorForm').hide();
    $('.emblemForm').hide();
	if(colorGrid){
		$('#'+showMe).css('display', 'grid')
		$('#emblemImages').hide();
	}else{
		$('#'+showMe).show();
		$('#emblemImages').show();
	}
    itemNumber = $('#'+showMe+' span').index($('#'+showMe+' input:checked').parent().parent());
	dew.playSound('a_button');
	
	updateSelection(itemNumber, false, true);
	
	subForm = activePage;
}

function UpdateEmblemDisplay(isLastEmblem){
	var primary = $('#colorsEmblemPrimary span').index($('#colorsEmblemPrimary .chosenElement'))-1;
	var secondary = $('#colorsEmblemSecondary span').index($('#colorsEmblemSecondary .chosenElement'))-1;
	var imageb = $('#colorsEmblemImage span').index($('#colorsEmblemImage .chosenElement'))-1;
	var icon = $('#emblemIcon .chosenElement input').val();
	var backgroundimg = $('#emblemBackgroundImage .chosenElement input').val();
	var toggle = emblemToggle;

	if(emblemList[0][1].length > 0){
		primary =  emblemList[0][1].replace(/#/g, '');
	}
	if(emblemList[1][1].length > 0){
		secondary =  emblemList[1][1].replace(/#/g, '');
	}
	if(emblemList[2][1].length > 0){
		imageb =  emblemList[2][1].replace(/#/g, '');
	}
	
	var emblemurl =  
	"?1=" + (imageb < 0 ? 0 : imageb) + 
	"&2=" + (secondary < 0 ? 0 : secondary) + 
	"&3=" + (primary < 0 ? 0 : primary) + 
	"&fi=" + (icon == undefined ? 0 : icon) + 
	"&bi=" + (backgroundimg < 0 ? 0 : backgroundimg) + 
	"&fl=" + (toggle < 0 ? 0 : toggle);

	if(isLastEmblem){
		lastEmblem = emblemurl;
	}
	if(lastEmblem == emblemurl){
		emblemNeedsToApply = false;
	}
	
	if(cachedEmblemEndpoint == ""){
		dew.getEndpoint("emblemgenerator").then(function(endpointUrl){
			cachedEmblemEndpoint = endpointUrl;
			document.getElementsByName("emblemPreview").forEach(function(element, idx) {
				element.onerror = function(){
					this.onerror = null;
					this.src = "dew://assets/emblems/generic.png";
				}
				element.src = endpointUrl + emblemurl;
			});
		});
	}else{
		document.getElementsByName("emblemPreview").forEach(function(element, idx) {
				element.onerror = function(){
					this.onerror = null;
					this.src = "dew://assets/emblems/generic.png";
				}
				element.src = cachedEmblemEndpoint + emblemurl;
		});
		
	}
	dew.command("Player.Emblem " + emblemurl);
	
	UpdateNameplateDisplay();
}

function UpdateNameplateDisplay(){
	dew.command("Player.name").then(function(name){
		$("#playerNamePlateName").text(name);
	});
	dew.command("Player.NameplateColor").then(function(hexColor){
		var lighter = lighten(hexColor);
		let colorIndex = -1;
		let index = 0;
		$.grep(h3ColorArray, function(result){
			if(result[1] == hexColor){
				colorIndex = index;
			}
			index+=1;
		});
		
		let color = hexColor.split('#')[1];
		if(colorIndex != -1)
			color = colorIndex;
		
		if(color.length == 6){
			$('#colorsNameplate').val('#'+color);
			$('#colorsNameplate :radio[value=""]').attr('checked', true);
			$('#colorsNameplate :radio[value=""]').parent().parent().addClass('chosenElement');
			$('#colorsNameplateText').val('#'+color);
		}else
			setItemValues('colorsNameplate', h3ColorArray[color][1]);

		dew.command('Player.Nameplate').then(function(nameplate){
			nameplateImage.src = "dew://assets/emblems/nameplate/" + nameplate + ".png";
			nameplateImage.onload = function() {
				changeImageColor("nameplatePreview", nameplateImage, hexColor, 0.8, 0.45);
				changeImageColor("nameplateBase", nameplateBaseImage, hexColor, 1.8, 1.3, 10);
			}
		});
					
	});
}

function SubmitEmblemToStatsServer(){
	emblemNeedsToApply = false;
	var primary = $('#colorsEmblemPrimary span').index($('#colorsEmblemPrimary .chosenElement'))-1;
	var secondary = $('#colorsEmblemSecondary span').index($('#colorsEmblemSecondary .chosenElement'))-1;
	var imageb = $('#colorsEmblemImage span').index($('#colorsEmblemImage .chosenElement'))-1;
	var icon = $('#emblemIcon .chosenElement input').val();
	var backgroundimg = $('#emblemBackgroundImage .chosenElement input').val();
	var toggle = emblemToggle;
	
	if(emblemList[0][1].length > 0){
		primary =  emblemList[0][1].replace(/#/g, '');
	}
	if(emblemList[1][1].length > 0){
		secondary =  emblemList[1][1].replace(/#/g, '');
	}
	if(emblemList[2][1].length > 0){
		imageb =  emblemList[2][1].replace(/#/g, '');
	}
	
	var jsonObj = new Object();
	
	dew.getEndpoint("changeemblem").then(function(endpointUrl){
		dew.command("Player.Name").then(function (name){
			jsonObj.playerName = name;
			dew.command("Player.ServiceTag").then(function (srvtag){
				jsonObj.serviceTag = srvtag;
				dew.command("Player.PrintUID").then(function (uid) {
					jsonObj.uid = uid.substr(14);
						dew.command("Player.PubKey").then(function (pubkey){
							jsonObj.publicKey = pubkey;
							dew.command("Player.EncryptGMTTimestamp").then(function (encryptedVal) {
								jsonObj.encryptedTimestamp = encryptedVal;
								
								var emblemObj = new Object();
								emblemObj.one = (imageb < 0 ? 0 : imageb);
								emblemObj.two = (secondary < 0 ? 0 : secondary);
								emblemObj.three = (primary < 0 ? 0 : primary);
								emblemObj.fi = (icon == undefined ? 0 : icon);
								emblemObj.bi = (backgroundimg < 0 ? 0 : backgroundimg);
								emblemObj.fl = (toggle < 0 ? 0 : toggle);
								
								jsonObj.emblem = emblemObj;
								
								$.ajax({
								contentType: 'application/json',
								data: JSON.stringify(jsonObj),
								success: function(data){
									//console.log("Emblem Submitted");
								},
								error: function(data){
									console.log("Emblem Submit Failed");
								},
								type: 'POST',
								url: endpointUrl
							});			
						});
					});
				});
			});
		});
	});
}

function SaveEmblem() {
	var primary = $('#colorsEmblemPrimary span').index($('#colorsEmblemPrimary .chosenElement'))-1;
	var secondary = $('#colorsEmblemSecondary span').index($('#colorsEmblemSecondary .chosenElement'))-1;
	var imageb = $('#colorsEmblemImage span').index($('#colorsEmblemImage .chosenElement'))-1;
	var icon = $('#emblemIcon .chosenElement input').val();
	var backgroundimg = $('#emblemBackgroundImage .chosenElement input').val();
	var toggle = emblemToggle;
	
	if(emblemList[0][1].length > 0){
		primary =  emblemList[0][1].replace(/#/g, '');
	}
	if(emblemList[1][1].length > 0){
		secondary =  emblemList[1][1].replace(/#/g, '');
	}
	if(emblemList[2][1].length > 0){
		imageb =  emblemList[2][1].replace(/#/g, '');
	}
	
	var emblemurl =  
	"?1=" + (imageb < 0 ? 0 : imageb) + 
	"&2=" + (secondary < 0 ? 0 : secondary) + 
	"&3=" + (primary < 0 ? 0 : primary) + 
	"&fi=" + (icon == undefined ? 0 : icon) + 
	"&bi=" + (backgroundimg < 0 ? 0 : backgroundimg) + 
	"&fl=" + (toggle < 0 ? 0 : toggle);
	
	dew.command("Player.Emblem \"" + emblemurl + "\"");
}

function SetArmorPrefs(){
    for(var i = 0; i < regionList.length; i++) {
		var divElement = regionList[i][0];
		var region = regionList[i][2];
		var value = $("#" + divElement).find('.chosenElement input').first().val();
		
		if(value != undefined)
			dew.command("Player.Customization.Armor " + region + " " + value);
	}
	
	dew.command("Game.ScenarioScript character_updated");//if the modder wants to do something when the armor is updated
}

async function GetArmorPrefs(){
	var permutations = await Promise.all(regionList.map(region => dew.command(`Player.Customization.Armor ${region[2]}`)));
	for(let i = 0; i < regionList.length; i++)
	{
		let divElement = regionList[i][0];
		let permutation = permutations[i];

		if(permutation == "Failed to get character" || permutation == ""){
			permutation = "base";
		}
		setDivValue(divElement, permutation, true);
	}
}

async function GetColorPrefs(){
	if(colorList.length == 0){
		for (let i = 0; i < settingsToLoad.length; i++){
			if(settingsToLoad[i][0].startsWith("colors"))
				colorList.push(settingsToLoad[i]);
		}
	}
	
	var colors = await Promise.all(colorList.map(colorType => dew.command(`${colorType[1]}`)));
	for(let i = 0; i < colorList.length; i++)
	{
		let divElement = colorList[i][0];
		let color = colors[i];

		if(color == "Failed to get character" || color == ""){
			if(defaultColorList.length != 0)
			{
				for(x = 0; x < defaultColorList.length; x++){
					if(defaultColorList[x][0] == divElement){
						color = defaultColorList[x][1];
						dew.command(colorList[i][1]+' '+color);
						break;
					}
				}
			}
			else
				color = "#000000";
		}
		setDivValue(divElement, color, false);
	}
}

function setDivValue(formID, value, isArmor){
	if($('#'+formID).is('form')){
		$('#'+formID+' :radio[value=""]').attr('checked',true);
		$('#'+formID+' :radio[value="'+value+'"]').attr('checked',true);
		if(isArmor)
			$('#'+formID+' :radio[value="'+value+'"]').parent().parent().parent().find('.chosenElement').removeClass('chosenElement');
		else
			$('#'+formID+' #customColor').parent().find('.chosenElement').removeClass('chosenElement');
		
		if($('#'+formID+' :radio[value="'+value+'"]').length){
			$('#'+formID+' :radio[value="'+value+'"]').parent().parent().addClass('chosenElement');
		}else{
			if(isArmor){
				$('#'+formID+' :radio[value="base"]').parent().parent().addClass('chosenElement');
				$('#'+formID+' :radio[value="base"]').attr('checked', true);
			}else{
				$('#'+formID+' #customColor').addClass('chosenElement');
			}
		}
		$('#'+formID+'Text').val(value);
	}else{
		if($('#'+formID).hasClass('tinySetting')){
			value = parseFloat(value);
		}
		$('#'+formID).val(value);
	}
}
   

function toggleIcon(){
	emblemToggle = 1 - emblemToggle;
	emblemNeedsToApply = true;
	UpdateEmblemDisplay(false);
	dew.playSound("a_button");
}

function page3(){
	if(subForm.includes(" "))
		exitSubform(true);
	else if (subCamera)
		exitSubCamera();
	
	$("#randomArmor").hide();
	$("#randomColors").hide();
	$("#randomEmblem").show();
	$("#toggleIconButton").show();
	$("#reset").show();
	if(emblemNeedsToApply){
		SaveEmblem();
		SubmitEmblemToStatsServer();
	}
	SetupEmblems(false);
	UpdateEmblemDisplay(true);
	
	UpdateNameplateDisplay();
	
	enterSubCamera("emblem");
    
    
    // Custom Emblem Modifications
    if (localStorage.getItem("emblemURL")) {
        Array.from(document.getElementsByClassName("emblemPreviewBig"))[0].src = localStorage.getItem("emblemURL");
        $("#customEmblemRemove").show();
    }
    
}
function page2(){
	if(subForm.includes(" "))
		exitSubform(true);
	else if (subCamera)
		exitSubCamera();
	
	$("#toggleIconButton").hide();
	$("#randomArmor").hide();
	$("#randomColors").show();
	$("#randomEmblem").hide();
	$("#reset").show();
	if(emblemNeedsToApply){
		SaveEmblem();
		SubmitEmblemToStatsServer();
	}
    
    // Custom Emblem Modifications
    $("#customEmblemRemove").hide();
}
function page1(){
	if(subForm.includes(" "))
		exitSubform(true);
	else if (subCamera)
		exitSubCamera();
	
	$("#toggleIconButton").hide();
	$("#randomArmor").show();
	$("#randomColors").hide();
	$("#randomEmblem").hide();
	$("#reset").show();
	if(emblemNeedsToApply){
		SaveEmblem();
		SubmitEmblemToStatsServer();
	}
    
    // Custom Emblem Modifications
    $("#customEmblemRemove").hide();
}

dew.on('serverconnect', function(e){
    if(!isVisible)
        return;
	
    itemNumber = 0;
    effectReset(true);
	page1();
	if(emblemNeedsToApply){
		SaveEmblem();
		SubmitEmblemToStatsServer();
	}
	dew.command('writeconfig');
});

function imageExists(image_url){
    var http = new XMLHttpRequest();
    http.open('HEAD', image_url, false);
    http.send();
    return http.status != 404;
}

function normalize(a){
	// reduce the angle  
	a = fmod(a, 360);
	// force it to be the positive remainder, so that 0 <= angle < 360  
	a = fmod(a + 360, 360);
	// force into the minimum absolute value residue class, so that -180 < angle <= 180  
	if (a > 180)
		a -= 360;

	return a;
}

function fmod(a, n) {
	return a - Math.floor(a / n) * n;
}

const lighten = (hex, amt = 55) => {
    hex = hex.replace(`#`, ``);
    if (hex.length === 6) {
        const dec = parseInt(hex, 16);
        let r = (dec >> 16) + amt;
        r > 255 && (r = 255);
        r < 0 && (r = 0);
        let g = (dec & 0x0000ff) + amt;
        g > 255 && (g = 255);
        g < 0 && (g = 0);
        let b = ((dec >> 8) & 0x00ff) + amt;
        b > 255 && (b = 255);
        b < 0 && (b = 0);
        return `#${(g | (b << 8) | (r << 16)).toString(16)}`;
    } else {
        return hex;
    }
};

function setItemValues(item, value){
	$('#'+item+' :radio[value="'+value+'"]').parent().parent().parent().find('.chosenElement').removeClass('chosenElement');
	$('#'+item+' :radio[value="'+value+'"]').parent().parent().parent().find('.selectedElement').removeClass('selectedElement');	
	$('#'+item+' :radio[value=""]').attr('checked',true);
	$('#'+item+' :radio[value="'+value+'"]').attr('checked',true);
	if( $('#'+item+' :radio[value="'+value+'"]').length){
		$('#'+item+' :radio[value="'+value+'"]').parent().parent().addClass('chosenElement');
	}else{
		$('#'+item+' :radio[value=""]').parent().parent().addClass('chosenElement');
	}
	$('#'+item+'Text').val(value);

}

function findIndexForArray(emblem, array){
	for(var x = 0; x < array.length; x++){
		var value = array[x][1];
		if(value == emblem){
			return x;
		}
	}
	return 0;
}

function getQueryVariable(url, variable) {
    var vars = url.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0].replace(/[^\w\s]/gi, '')) == variable) {
            return pair[1];
        }
    }
}

function leftPad(val, size, ch) {
    var result = String(val);
    if(!ch) {
        ch = " ";
    }
    while (result.length < size) {
        result = ch + result;
    }
    return result;
}

dew.on('mod_changed', function(e){
    if(e.data.kind == "mainmenu" && isVisible == true){
		if(emblemNeedsToApply){
			SaveEmblem();
			SubmitEmblemToStatsServer();
		}
		dew.command('writeconfig');
		dew.hide();
	}
});