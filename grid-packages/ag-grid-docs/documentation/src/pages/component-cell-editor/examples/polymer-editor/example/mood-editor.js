import {html, PolymerElement} from "../node_modules/@polymer/polymer/polymer-element.js";

export default class MoodEditor extends PolymerElement {
    static get template() {
        return html`
        <style>
            .mood {
                border-radius: 15px;
                border: 1px solid grey;
                background: #e6e6e6;
                padding: 15px;
                text-align: center;
                display: inline-block;
                outline: none;
                z-index: 1000;
            }

            .default {
                padding-left: 10px;
                padding-right: 10px;
                border: 1px solid transparent;
                padding: 4px;
            }

            .selected {
                padding-left: 10px;
                padding-right: 10px;
                border: 1px solid lightgreen;
                padding: 4px;
            }

            :host {
                display: block;
            }
        </style>
        <div id="container" class="mood" tabindex="0" on-keydown="onKeyDown">
            <img src="/images/smiley.png" on-click="onHappy" class$="{{classForHappy}}">
            <img src="/images/smiley-sad.png" on-click="onSad" class$="{{classForSad}}">
        </div>
        `;
    }

    agInit(params) {
        this.params = params;
        this.setHappy(params.value === "Happy");
    }

    ready() {
        super.ready();
        this.$.container.focus()
    }

    isPopup() {
        return true;
    }

    getValue() {
        return this.happy ? "Happy" : "Sad";
    }

    onHappy() {
        this.setHappy(true);
        this.params.api.stopEditing();
    }

    onSad() {
        this.setHappy(false);
        this.params.api.stopEditing();
    }

    setHappy(happy) {
        this.happy = happy;
    }

    toggleMood() {
        this.setHappy(!this.happy);
    }

    onKeyDown(event) {
        let key = event.which || event.keyCode;
        if (key === 37 ||  // left
            key === 39) {  // right
            this.toggleMood();
            event.stopPropagation();
        }
    }


    static get properties() {
        return {
            happy: Boolean,
            classForHappy: {
                type: String,
                computed: 'getClassForHappy(happy)'
            },
            classForSad: {
                type: String,
                computed: 'getClassForSad(happy)'
            }
        };
    }

    getClassForHappy(happy) {
        if (happy) {
            return 'selected'
        }
        return 'default'
    }

    getClassForSad(happy) {
        if (!happy) {
            return 'selected'
        }
        return 'default'
    }
}

customElements.define('mood-editor', MoodEditor);
