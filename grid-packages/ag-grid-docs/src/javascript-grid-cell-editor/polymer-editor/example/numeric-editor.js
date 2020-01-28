import {html, PolymerElement} from "../node_modules/@polymer/polymer/polymer-element.js";

export default class NumericEditor extends PolymerElement {
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
        <input id="input" on-keydown="onKeyDown" value="{{value::input}}">
        `;
    }

    agInit(params) {
        this.params = params;
        this.value = this.params.value;

        // only start edit if key pressed is a number, not a letter
        this.cancelBeforeStart = params.charPress && ('1234567890'.indexOf(params.charPress) < 0);
    }

    ready() {
        super.ready();
        this.$.input.focus()
    }

    getValue() {
        return this.value;
    }

    isCancelBeforeStart() {
        return this.cancelBeforeStart;
    }

    // will reject the number if it greater than 1,000,000
    // not very practical, but demonstrates the method.
    isCancelAfterEnd() {
        return this.value > 1000000;
    };

    onKeyDown(event) {
        if (!this.isKeyPressedNumeric(event)) {
            if (event.preventDefault) event.preventDefault();
        }
    }

    getCharCodeFromEvent(event) {
        event = event || window.event;
        return (typeof event.which == "undefined") ? event.keyCode : event.which;
    }

    isCharNumeric(charStr) {
        return !!/\d/.test(charStr);
    }

    isKeyPressedNumeric(event) {
        var charCode = this.getCharCodeFromEvent(event);
        var charStr = String.fromCharCode(charCode);
        return this.isCharNumeric(charStr);
    }

    static get properties() {
        return {
            value: Number
        };
    }
}

customElements.define('numeric-editor', NumericEditor);
