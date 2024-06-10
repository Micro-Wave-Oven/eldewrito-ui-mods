const DIALOG_TEMPLATES = {
    // Used in:
    // - Unused debug dialog
    test: {
        title: `Lorem ipsum`,
        body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.',
        options: [
            { label: 'Option A', value: 'option_a', default: true },
            { label: 'Option B', value: 'option_b' },
            { label: 'Option C', value: 'option_c' },
            { label: 'Option D', value: 'option_d' }
        ],
        buttonkey: [
            { label: 'Ok', action: 'select', type: 'a_button' },
            { label: 'Cancel', action: 'close', value: 'cancel', type: 'b_button' }
        ]
    },
    // Used in:
    // - ScreenLayer.cpp: ShowAlert
    alert_template: {
        title: `placeholder`,
        body: 'placeholder',
        icon: "warning",
        buttonkey: [
            { label: 'Ok', action: 'close', value: 'ok', type: 'a_button' }//Do not change value unless changed in WebDialog HandleDialogShowRequest
        ]
    },
    // Used in:
    // - ServerConnectStateHandler_Connect.cpp: OnEnter()
    attempting_join: {
        title: `JOINING GAME`,
        body: 'Attempting to join the selected game...',
        disableLinks: true,
		autoDismissable: true,
        dialogHeight: 26.388,
        buttonkey: [
            { label: 'Close', action: 'close', value: 'close', type: 'b_button' }
        ]
    },
    // Used in:
    // - Ui.cpp: _show_service_record_hook
    // - Chat Screen
    confirm_link: {
        title: `Warning`,
        body: 'Are you sure you want to open this?',
        disableLinks: true,
        dialogHeight: 33.333,
        icon: "warning",
        buttonkey: [
            { label: 'Yes', action: 'close', value: 'yes', type: 'a_button' },
            { label: 'No', action: 'close', value: 'no', type: 'b_button' }
        ]
    },
    // Used in:
    // - UI.cpp: _handle_list_item_chosen_hook
    // - UI.cpp: OnUiInputUpdated
    exit: {
        title: `EXIT?`,
        body: 'Are you sure you want to exit the game?',
        dialogHeight: 33.333,
        options: [
            { label: 'Exit', value: 'exit' },
            { label: 'Cancel', value: 'cancel', default: true  },
        ],
        buttonkey: [
            { label: 'Select', action: 'select', type: 'a_button', mouse: false},
            { label: 'Cancel', action: 'close', value: 'cancel', type: 'b_button' }
        ]
    },
    // Used in:
    // - VirtualKeyboard.cpp: WebVirtualKeyboardHandler
    edit_variant_name: {
        type: 'input',
        title: `Edit`,
        body: 'placeholder',
        maxLength: 15,
        numRows: 1,
        dialogHeight: 31.944,
        buttonkey: [
            { label: 'Save', action: 'submit', type: 'a_button' },
            { label: 'Cancel', action: 'close', value: 'cancel', type: 'b_button' }
        ]
    },
    // Used in:
    // - VirtualKeyboard.cpp: WebVirtualKeyboardHandler
    edit_variant_description: {
        type: 'input',
        title: `Edit`,
        body: 'placeholder',
        maxLength: 127,
        numRows: 4,
        dialogHeight: 37.5,
        buttonkey: [
            { label: 'Save', action: 'submit', type: 'a_button' },
            { label: 'Cancel', action: 'close', value: 'cancel', type: 'b_button' }
        ]
    },
    // Used in:
    // - Settings Screen
    unapplied_settings: {
        title: `ALERT`,
        body: 'You have unapplied settings. Close anyway?',
        dialogHeight: 33.333,
        icon: "warning",
        options: [
            { label: 'Yes', value: 'ok' },
            { label: 'No', value: 'no', default: true  },
        ],
        buttonkey: [
            { label: 'Select', action: 'select', type: 'a_button', mouse: false},
            { label: 'Cancel', action: 'close', value: 'cancel', type: 'b_button' }
        ]
    },
    // Used in:
    // - Settings Screen
    weapon_offsets_not_supported: {
        title: `ALERT`,
        body: 'Weapon offsets are not supported for this weapon.',
        dialogHeight: 26.388,
        icon: "warning",
        buttonkey: [
            { label: 'Ok', action: 'close', value: 'ok', type: 'a_button' }
        ]
    },
    // Used in:
    // - Settings Screen
    weapon_offsets_in_game_warning: {
        title: `ALERT`,
        body: 'Weapon offsets can only be edited in-game.',
        dialogHeight: 26.388,
        icon: "warning",
        buttonkey: [
            { label: 'Ok', action: 'close', value: 'ok', type: 'a_button' }
        ]
    },
    // Used in:
    // - Settings Screen
    strain_system: {
        title: `ALERT`,
        body: 'Increasing this setting may strain lower end systems and could cause graphical issues on more intensive modded maps.',
        dialogHeight: 26.388,
        icon: "warning",
        buttonkey: [
            { label: 'Ok', action: 'close', value: 'ok', type: 'a_button' }
        ]
    },
    // Used in:
    // - Settings Screen
    requires_restart: {
        title: `ALERT`,
        body: 'This change requires a restart to take effect.',
        dialogHeight: 26.388,
        icon: "warning",
        buttonkey: [
            { label: 'Ok', action: 'close', value: 'ok', type: 'a_button' }
        ]
    },
    // Used in:
    // - Settings Screen
	confirm_reset: {
        title: `WARNING`,
        body: 'Are you sure you want to reset all settings? Bindings will not be affected.',
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
    },
    // Used in:
    // - Settings Screen
    confirm_reset_bindings: {
        title: `WARNING`,
        body: 'Are you sure you want to reset all bindings? Other settings will not be affected.',
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
    },
    // Used in:
    // - Settings Screen
    coop_sprint: {
        title: `ALERT`,
        body: 'Sprint will not be enabled during co-op.',
        dialogHeight: 26.388,
        icon: "warning",
        buttonkey: [
            { label: 'Ok', action: 'close', value: 'ok', type: 'a_button' }
        ]
    },
    // Used in:
    // - Customization Screen
	confirm_reset_customization: {
        title: `WARNING`,
        body: 'Are you sure you want to reset the customization on this page?',
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
    },
    // Used in:
    // - Weapon Offset Editor Screen
    new_weapon_offset: {
        type: 'input',
        title: `Weapon Offset Config`,
        body: 'Enter the new config name below.',
        regex: /^[a-zA-Z0-9\-_]+$/,
        regexFailMessage: 'Name must only contain letters, numbers, underscores and dashes',
        maxLength: 32,
        numRows: 1,
        dialogHeight: 31.944,
        buttonkey: [
            { label: 'Confirm', action: 'submit', type: 'a_button' },
            { label: 'Cancel', action: 'close', value: 'cancel', type: 'b_button' }
        ]
    },
    // Used in:
    // - Weapon Offset Editor Screen
	weapon_offset_exists: {
        title: `Warning`,
        body: 'That offset already exists.',
        dialogHeight: 26.388,
        icon: "warning",
        buttonkey: [
            { label: 'Ok', action: 'close', value: 'ok', type: 'a_button' }
        ]
    },
    // Used in:
    // - Weapon Offset Editor Screen
	weapon_offset_delete: {
        title: `Warning`,
        body: 'Are you sure you want to delete this config?',
        icon: "warning",
        dialogHeight: 33.333,
        options: [
            { label: 'Yes', value: 'yes' },
            { label: 'no', value: 'no', default: true  },
        ],
        buttonkey: [
            { label: 'Select', action: 'select', type: 'a_button', mouse: false},
            { label: 'Cancel', action: 'close', value: 'cancel', type: 'b_button' }
        ]
    },
    // Used in:
    // - Weapon Offset Editor Screen
	weapon_offset_delete_error: {
        title: `Error`,
        body: 'There was an error while deleting the weapon offset config',
        dialogHeight: 26.388,
        icon: "warning",
        buttonkey: [
            { label: 'Ok', action: 'close', value: 'ok', type: 'a_button' }
        ]
    },
    // Used in:
    // - Weapon Offset Editor Screen
	confirm_save_weapon_offset: {
        title: `WARNING`,
        body: 'Are you sure you want to save the weapon offsets?',
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
    },
    // Used in:
    // - Weapon Offset Editor Screen
	confirm_reset_weapon_offset: {
        title: `WARNING`,
        body: 'Are you sure you want to reset this weapon offset?',
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
    },
    // Used in:
    // - Mod Browser Screen
    mod_options: {
        title: `OPTIONS`,
        body: 'Select an option:',
        dialogHeight: 33.333,
        options: [
            { label: 'Set as Lobby Default', value: 'default', default: true  },
			{ label: 'Delete Mod', value: 'delete'}
        ],
        buttonkey: [
            { label: 'Select', action: 'select', type: 'a_button' },
            { label: 'Close', action: 'close', value: 'cancel', type: 'b_button' }
        ]
    },
    // Used in:
    // - Mod Browser Screen
	confirm_mod_delete: {
        title: `WARNING`,
        body: 'Are you sure you want to delete this mod?',
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
    },
    // Used in:
    // - Server Browser screen
    server_password: {
        type: 'input',
        title: `Private Server`,
        body: 'Please enter password.', 
        inputType: 'password',
        dialogHeight: 31.944,
        buttonkey: [
            { label: 'Confirm', action: 'submit', type: 'a_button' },
            { label: 'Cancel', action: 'close', value: '', type: 'b_button' }
        ]
    },
    // Used in:
    // - ServerConnect.cpp
    server_connect_error_retry: {
        title: `Failed to connect`,
        body: 'placeholder',
        icon: 'warning',
        dialogHeight: 33.333,
        buttonkey: [
            { label: 'Retry', action: 'close', value: 'retry', type: 'a_button'},
            { label: 'Cancel', action: 'close', value: 'cancel', type: 'b_button' }
        ]
    },
    // Used in:
    // - ServerConnect.cpp
    server_connect_error: {
        title: `Failed to connect`,
        body: 'placeholder',
        icon: 'warning',
        dialogHeight: 33.333,
        buttonkey: [
            { label: 'Close', action: 'close', value: 'cancel', type: 'b_button' }
        ]
    },
    // Used in:
    // - Customization screen
    edit_player_name: {
        type: 'input',
        title: `Player name`,
        body: 'Enter a new player name.', 
        dialogHeight: 31.944,
        buttonkey: [
            { label: 'Confirm', action: 'submit', type: 'a_button' },
            { label: 'Cancel', action: 'close', value: '', type: 'b_button' }
        ],
        regexFailMessage: 'Name must only contain numbers, letters, spaces and underscores',
        maxLength: 15,
        regex: /^[a-zA-Z0-9 _-]+$/,
        buttonkey: [
            { label: 'Ok', action: 'submit', type: 'a_button' },
            { label: 'Cancel', action: 'close', value: '-1', type: 'b_button' }
        ]
    },
    // Used in:
    // - Customization screen
    edit_service_tag: {
        type: 'input',
        title: `Service Tag`,
        body: 'Enter a new service tag.', 
        dialogHeight: 31.944,
        buttonkey: [
            { label: 'Confirm', action: 'submit', type: 'a_button' },
            { label: 'Cancel', action: 'close', value: '', type: 'b_button' }
        ],
        regexFailMessage: 'Tag must be 3-4 characters long and can only contain numbers and letters',
        maxLength: 4,
        minLength: 3,
        forceUpperCase: true,
        regex: /^[a-zA-Z0-9]+$/,
        buttonkey: [
            { label: 'Ok', action: 'submit', type: 'a_button' },
            { label: 'Cancel', action: 'close', value: '-1', type: 'b_button' }
        ]
    },
    update_available: {
        title: `UPDATE_AVAILABLE`,
        body: 'An update for ElDewrito is available!',
        dialogHeight: 33.333,
        buttonkey: [
            { label: 'Update', action: 'select', type: 'a_button' },
            { label: 'Close', action: 'close', value: 'cancel', type: 'b_button' }
        ]
    },
    missing_launcher: {
        title: `UPDATE FAILED`,
        body: 'launcher.exe not found. Please download launcher.exe to your game directory and run it to update',
        icon: "warning",
        dialogHeight: 33.333,
        buttonkey: [
            { label: 'Close', action: 'close', value: 'cancel', type: 'b_button' }
        ]
    }
};

Vue.directive('autofocus', {
    inserted(el) {
        setTimeout(() => el.focus(), 25);
        
    }
});

Vue.component('dew-input-dialog', {
    template: /*html*/`
                <div id="dialog" class="show" :class="{ shake: shakeAnimating }" :style="dialogStyle()">
                    <div class="dialog-header">
                        <div class="dialog-title slide-right">{{ title.toUpperCase() }}</div>
                    </div>
                    <div class="dialog-body" :style="dialogBodyStlye()">
                        <div class="dialog-content slide-left">
                            <img v-if="icon != ''" class="dialog-icon" v-bind:src="'dew://assets/dialog/' + icon + '.png'">
                            <div class="dialog-message-input" :class="{ 'dialog-icon-offset': icon !== '' }">
                                <div v-html="body"></div>
                            </div>
                            <div class="dialog_input_container" :style="dialogInputSize()">
                                <div>
                                    <textarea id="inputBox" v-if="numRows > 1" class="dialog_input" v-autofocus v-model="value" v-on:input="handleInput" :maxlength="maxLength" :rows="numRows" @keydown="onKeyboardEvent"></textarea>
                                    <input id="inputBox" v-else class="dialog_input" :type="inputType" v-autofocus v-model="value" v-on:input="handleInput" :maxlength="maxLength" @keydown="onKeyboardEvent" ></input>
                                    <div v-if="numRows > 1" id="charCount" class="charCountTextarea">{{getCharCount()}}</div>
                                    <div v-else id="charCount" class="charCountInput">{{getCharCount()}}</div>
                                </div>
                                <div v-if="errorMessage && errorMessage.length > 0" class="dialog_input_error">{{errorMessage}}</div>
                            </div>
                        </div>
                    </div>
                    <div class="dialog-footer">
                        <div class="button-key slide-right">
                            <span class="button" :data-btn="button.type" v-for="button in buttonkey">
                                <span v-if="button.mouse !== undefined ? button.mouse : true" class="button-label" @click="onButtonPress(button)">{{button.label}}</span>
                                <span v-else>{{button.label}}</span>
                            </span>
                        </div>
                    </div>
                </div>
            `,
    props: ['type', 'title', 'body', 'buttonkey', 'inputType', 'maxLength', 'numRows', 'initialValue', 'allowReturn', 'regex', 'regexFailMessage', 'minLength', 'forceUpperCase', 'dialogHeight', 'icon'],
    data() {
        return {
            hiliteOption: null,
            selectedOption: null,
            value: '',
            errorMessage: '',
            shakeAnimating: false
        };
    },
    methods: {
        dialogStyle() {
            if (this.dialogHeight > 0) {
                return {
                    'height': this.dialogHeight + 'vh',
                    'top': (27.638 + (44.444 - this.dialogHeight) / 2) + 'vh'
                };
            } else {
                {}; // Return an empty object if dialogHeight is 0
            }
        },
        dialogInputSize() {
            if(this.dialogHeight > 0) {
                return {
                    //'height': (this.dialogHeight*0.5) + 'px',
                    'align-items': 'stretch',
                    'justify-content': 'start'
                };
            } else {
                {}; // Return an empty object if dialogHeight is 0
            }
        },
        dialogBodyStlye() {
            if (this.dialogHeight > 0) {
                return {
                    'height': (37.083 - (44.444 - this.dialogHeight)) + 'vh',
                };
            } else {
                {}; // Return an empty object if dialogHeight is 0
            }  
        },
        onButtonPress(button) {
            // if there's no action assigned to this button, just return
            if (!button || !button.action)
                return;

            // perform the action
            if (button.action === 'close') {
                this.close(button.value);
            }
            else if (button.action === 'submit') {
                this.submit();
            }

            // play the sound
            switch (button.type) {
                case 'a_button':
                    this.playSound('a_button');
                    break;
                case 'b_button':
                    this.playSound('b_button');
                    break;
            }
        },
        onKeyboardEvent(evt) {
            if (evt.type === 'keydown') {
                switch (evt.key) {
                    case 'Enter':
                        if (!this.allowReturn)
                            this.onButtonPress(this.buttonkey.find(b => b.type === 'a_button'));
                        break;
                    case 'Escape':
                        this.onButtonPress(this.buttonkey.find(b => b.type === 'b_button'));
                        break;
                }
            }
        },
        onInputAction(evt) {
            // map the input action to a button
            switch (evt.action) {
                case dew.input.Actions.A:
                    let input = document.getElementById("inputBox");
                    if(document.activeElement === input && evt.inputType === "keyboard")
                        break;
                    
                    this.onButtonPress(this.buttonkey.find(b => b.type === 'a_button'));
                    break;
                case dew.input.Actions.B:
                    this.onButtonPress(this.buttonkey.find(b => b.type === 'b_button'));
                    break;
            }
        },
        onMouseClick(evt) {
            if(evt.button === 2){
                this.onButtonPress(this.buttonkey.find(b => b.type === 'b_button'));
            }
        },
        submit() {
           if ((this.regex && !this.value.match(this.regex)) ||  this.value.length < this.minLength) {
                this.errorMessage = this.regexFailMessage || 'Invalid input';
                this.playSound('error');
                this.shakeAnimate();
            } else {
                let val = this.value.replace(/\s+$/, '');//strip trailing spaces
                this.close(val);
            }
           
        },
        handleInput(){
            if(this.forceUpperCase){
                this.value = this.value.toUpperCase();
            }
                        
            // Replace newline characters with an empty string
            this.value = this.value.replace(/(\r\n|\n|\r)/gm, '');
        },
        close(result) {
            this.$emit('close', result);
        },
        playSound: throttle(dew.playSound, 100),
        shakeAnimate() {
            this.shakeAnimating = true;
            setTimeout(_ => this.shakeAnimating = false, 100);
        },
        getCharCount(){
            let charCountText = "0/0";
            
            if(this.maxLength == undefined){
                charCountText = "";
                return;
            }
            
            charCountText = this.value.length + "/" + this.maxLength;
            
            let charCount = document.getElementById("charCount");
            
            if(charCount){
                if(this.value.length < this.minLength)
                    charCount.classList.toggle('countError', true);
                else
                    charCount.classList.toggle('countError', false);
            }
            
            return charCountText;
        }
    },
    created() {
        dew.input.on('action', this.onInputAction);
        window.addEventListener('mousedown', this.onMouseClick);

        if (this.initialValue) {
            this.value = this.initialValue;
        }
    },
    destroyed() {
        dew.input.removeListener('action', this.onInputAction);
        window.removeEventListener('mousedown', this.onMouseClick);
    }
});

Vue.component('dew-dialog', {
    template: /*html*/`
                <div id="dialog" class="show" :style="dialogStyles()">
                    <div class="dialog-header">
                        <div class="dialog-title slide-right">{{ title.toUpperCase() }}</div>
                    </div>
                    <div class="dialog-body" :style="dialogBodyStlye()">
                        <div class="dialog-content slide-left">
                            <img v-if="icon != ''" class="dialog-icon" v-bind:src="'dew://assets/dialog/' + icon + '.png'">
                            <div class="dialog-message" :class="{ 'dialog-icon-offset': icon !== '' }">
                                <div v-html="body"></div>
                            </div>
                            <div>
                                <ul class="dialog-list" v-if="options && options.length > 0">
                                    <li
                                    v-for="option in options"
                                    :key="option.value" class="dialog_option"
                                    :class="{hilite:hiliteOption===option.value, selected:selectedOption===option.value}"
                                    @click="onOptionMouseInteraction($event, option.value)"
                                    @mouseenter="onOptionMouseInteraction($event, option.value)">{{option.label}}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="dialog-footer">
                        <div class="button-key slide-right">
                            <span class="button" :data-btn="button.type" v-for="button in buttonkey">
                                <span v-if="button.mouse !== undefined ? button.mouse : true" class="button-label" @click="onButtonPress(button)">{{button.label}}</span>
                                <span v-else>{{button.label}}</span>
                            </span>
                        </div>
                    </div>
                </div>
            `,
    props: ['type', 'title', 'body', 'options', 'buttonkey', 'dialogHeight', 'icon'],
    data() {
        return {
            hiliteOption: null,
            selectedOption: null
        };
    },
    methods: {
        dialogStyles() {
            if (this.dialogHeight > 0) {
                return {
                    'height': this.dialogHeight + 'vh',
                    'top': (27.638 + (44.444 - this.dialogHeight) / 2) + 'vh'
                };
            } else {
                {}; // Return an empty object if dialogHeight is 0
            }
        },
        dialogBodyStlye() {
            if (this.dialogHeight > 0) {
                return {
                    'height': (37.083 - (44.444 - this.dialogHeight)) + 'vh',
                };
            } else {
                {}; // Return an empty object if dialogHeight is 0
            }  
        },
        onButtonPress(button) {
            // if there's no action assigned to this button, just return
            if (!button || !button.action)
                return;

            // perform the action
            if (button.action === 'select') {
                this.selectOption(this.hiliteOption);
            }
            else if (button.action === 'close') {
                this.close(button.value);
            }

            // play the sound
            switch (button.type) {
                case 'a_button':
                    this.playSound('a_button');
                    break;
                case 'b_button':
                    this.playSound('b_button');
                    break;
            }
        },
        onOptionMouseInteraction(e, option) {
            switch (e.type) {
                case 'mouseenter':
                    if (!this.selectedOption) {
                        // only play a sound if this option wasn't highlighted before
                        if (this.hiliteOption !== option) {
                            //this.playSound('vertical_navigation');
                        }
                        this.hiliteOption = option;
                    }
                    break;
                case 'click':
                    this.selectOption(option);
                    dew.playSound('a_button'); // avoid the throttle from this.playSound
                    break;
            }
        },
        onInputAction(evt) {
            // map the input action to a button
            switch (evt.action) {
                case dew.input.Actions.A:
                    this.onButtonPress(this.buttonkey.find(b => b.type === 'a_button'));
                    break;
                case dew.input.Actions.B:
                    this.onButtonPress(this.buttonkey.find(b => b.type === 'b_button'));
                    break;
            }
        },
        onInputScroll(type, axis, direction) {
            if (axis === 0 && this.options.length > 0) { //up/down
                this.playSound('vertical_navigation');
                this.navigateOptions(direction);
            }   
        },
        onMouseClick(evt) {
            if(evt.button === 2){
                this.onButtonPress(this.buttonkey.find(b => b.type === 'b_button'));
            }
        },
        navigateOptions(dir) {
            let currentIndex = this.options.findIndex(e => e.value === this.hiliteOption);

            if ((dir > 0 && currentIndex === this.options.length - 1) || (dir < 0 && currentIndex === 0))
                return;

            // for hilite wrap
            currentIndex += dir;
            if (currentIndex < 0)
                currentIndex += this.options.length;

            this.hiliteOption = this.options[currentIndex % this.options.length].value;
        },
        selectOption(option) {
            this.selectedOption = option;
            this.close(option);
        },
        close(result) {
            this.$emit('close', result);
        },
        playSound: throttle(dew.playSound, 100)
    },
    created() {
        dew.input.on('action', this.onInputAction);
        dew.input.on('scroll', this.onInputScroll);
        window.addEventListener('mousedown', this.onMouseClick);

        for (let option of this.options) {
            if (option.default) {
                this.hiliteOption = option.value;
                return;
            }
        }
        this.hiliteOption = null;
    },
    destroyed() {
        window.removeEventListener('mousedown', this.onMouseClick);
        dew.input.removeListener('action', this.onInputAction);
        dew.input.removeListener('scroll', this.onInputScroll);
    }
});

let App = new Vue({
    el: '#app',
    template: `
        <div class="dialog_container">
            <transition name="backdrop">
                <template  v-if="currentDialog">
                    <div class="backdrop" />
                </template>
            </transition>
            <transition name="fade" tag="div" mode="out-in">
                <template v-if="currentDialog">

                
                <dew-dialog v-if="currentDialog.type === 'none'"
                            :type="currentDialog.type"
                            :key="currentDialog.id"
                            :options="currentDialog.options"
                            :buttonkey="currentDialog.buttonkey" 
                            :title="currentDialog.title"
                            :body="currentDialog.body"
                            :dialogHeight="currentDialog.dialogHeight"
                            :icon="currentDialog.icon"
                            @close="onDialogClose" />

                <dew-input-dialog v-else-if="currentDialog.type === 'input'"
                            :type="currentDialog.type"
                            :key="currentDialog.id"
                            :buttonkey="currentDialog.buttonkey" 
                            :title="currentDialog.title"
                            :body="currentDialog.body"
                            :inputType="currentDialog.inputType"
                            :maxLength="currentDialog.maxLength"
                            :minLength="currentDialog.minLength"
                            :forceUpperCase="currentDialog.forceUpperCase"
                            :numRows="currentDialog.numRows"
                            :initialValue="currentDialog.initialValue"
                            :allowReturn="currentDialog.allowReturn"
                            :regex="currentDialog.regex"
                            :regexFailMessage="currentDialog.regexFailMessage"
                            :dialogHeight="currentDialog.dialogHeight"
                            :icon="currentDialog.icon"
                            @close="onDialogClose" />

                </template>
               
            </transition>
        </div>
    `,
    data() {
        return {
            currentDialog: null,
            nextId: 0
        };
    },
    methods: {
        onDialogClose(result) {
            let dialog = this.currentDialog;
            this.popDialog();
            dialog.onClose(result);
        },
        onDialogCloseRequest(evt){
            if(this.currentDialog && evt.data === this.currentDialog.templateName) {
                App.closeAndPopDialog();
            }
        },
        onDialogRequest(evt) {
            
            // AutoConnect Modifs
            if (sessionStorage.getItem("autoconnect") != undefined && sessionStorage.getItem("autoconnect")) {
                sessionStorage.setItem("autoconnect", false);
                if (evt.data.template != undefined && evt.data.template.indexOf("server_connect_error_retry") > -1) {
                    dew.notify("browser-autoconnect");
                    return;
                }
            }
            
            
            let self = this;
            let data = evt.data;

            let template = data.template;
            if (isString(template)){
                template = DIALOG_TEMPLATES[template];
            }

            if (data.native) {  
                if(typeof template === 'undefined') {
                    dew.callMethod('submitDialogResult', { id: evt.data.nativeId, result: '' });
                    return;
                }
                return this.onNativeDialogRequest(evt);
            }

            if(typeof template === 'undefined') {
                return;
            }        

            let dialog = Object.assign({
                templateName: data.template,
                type: 'none',
                options: [],
                buttonkey: [],
				fullScreenBlur: true,
                inputType: 'text',
                minLength: 0,
                forceUpperCase: false,
                dialogHeight: 0,
                icon: "",
            }, template, {
                id: data.id,
                    onClose(result) {
                    result = result || '';
                    dew.notifyDialogResult(data.id, data.screen, result);
                    // if we don't have any more dialogs to show hide the screen
                    // leave a delay for the animation to finish
                    setTimeout(() => {
                        if (!self.currentDialog)
                            dew.hide();
                    }, 400);
                }
            }, data.data || {});
			
            let disableLinks = dialog.disableLinks !== undefined ? dialog.disableLinks : false;

            dialog.body = escapeHtml(dialog.body)
                .replace(/\bhttps?:\/\/[^ |]+/ig, (!disableLinks ? aWrap : spanWrapLink))
                .split('|r|n').join('<br />');
			
            if(self.currentDialog && self.currentDialog.autoDismissable) {
                const id = self.currentDialog.id;
                setTimeout(() => {
                    if(self.currentDialog?.id === id) {
                        App.closeAndPopDialog();
                    }
                }, 700);
            }
			
            this.pushDialog(dialog);
            dew.show();
        },
        onNativeDialogRequest(evt) {
            dew.dialog(evt.data.template, evt.data.data || {})
                .then(result => {
                    // submit the result dailog to to the backend
                    dew.callMethod('submitDialogResult', { id: evt.data.nativeId, result: result });
                });
        },
        pushDialog(dialog) {
            if (this.currentDialog) {
                // add the dialog to the tail of the list
                let tail = this.currentDialog;
                while (tail.next) { tail = tail.next; }
                tail.next = dialog;
            }
            else {
                 // set the dialog as the head of the list
                this.currentDialog = dialog;

				if(this.currentDialog.fullScreenBlur){
					dew.GameBlur("dialog", true)
				}
            }
        },
        popDialog() {
            const dialog = document.querySelector('#dialog');
            dialog.classList.toggle('show', false);
            dialog.classList.toggle('hide', true);
            
            var diag = this;
            if(!diag.currentDialog.next) {
                if(diag.currentDialog.fullScreenBlur){
                    dew.GameBlur("dialog", false);
                }
            }
    
            diag.currentDialog = diag.currentDialog.next;
        },
        closeAndPopDialog(result) {
            this.onDialogClose(result);
        }
    },
    created() {
        dew.on("dialog", this.onDialogRequest);
        dew.on("dialogClose", this.onDialogCloseRequest);
    }
});

function isString(x) {
    return Object.prototype.toString.call(x) === "[object String]";
}

function aWrap(link) {
    link = unescapeHtml(link);
    if (/\b[^-A-Za-z0-9+&@#/%?=~_|!:,.;\(\)]+/ig.test(link))
        return '';
    var e = document.createElement('a');
    e.setAttribute('href', link);
    e.setAttribute('target', '_blank');
    e.setAttribute('style', 'color:dodgerblue;overflow-wrap: break-word;');
    e.textContent = link;
    return e.outerHTML;
};

function spanWrapLink(link) {
    link = unescapeHtml(link);
    if (/\b[^-A-Za-z0-9+&@#/%?=~_|!:,.;\(\)]+/ig.test(link))
        return '';
    var e = document.createElement('spanWrap');
    e.setAttribute('style', 'color:dodgerblue;overflow-wrap: break-word;');
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

function debounce(func, ms) {
    let timeout = -1;
    return function () {
        const args = arguments;
        const context = this;

        if (timeout)
            clearTimeout(timeout);

        timeout = setTimeout(() => func.apply(context, args), ms);
    };
}

function throttle(func, ms) {
    let inThrottle;
    return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, ms);
        }
    };
}

function visitUrl(url) {
    dew.dialog("confirm_link",{
        body: "This link goes to " + url + " Are you sure you want to open this?",
    }).then(result => {
        if (result === 'yes') {
            this.setTimeout(() => window.open(url, '_blank'), 450);    
        }
    });
}

window.addEventListener('click', function (e) {
    if (e.srcElement.nodeName === 'A') {
        e.preventDefault();
        dew.playSound('a_button');
        App.closeAndPopDialog();   
        this.setTimeout(() => visitUrl(e.srcElement.href), 650);     
        return false;
    }
});
