import { html, PolymerElement } from 'https://unpkg.com/@polymer/polymer@3.4.1/polymer-element.js';

export default class NumericEditor extends PolymerElement {
    static get template() {
        return html`
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
        this.$.input.focus();
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

    finishedEditingPressed(event) {
        const KEY_ENTER = 13;
        const KEY_TAB = 9;
        const KEY_ESC = 27;

        const charCode = this.getCharCodeFromEvent(event);
        return charCode === KEY_ENTER || charCode === KEY_TAB || charCode === KEY_ESC;
    }

    onKeyDown(event) {
        if (!this.finishedEditingPressed(event) && !this.isKeyPressedNumeric(event)) {
            if (event.preventDefault) event.preventDefault();
        }
    }

    getCharCodeFromEvent(event) {
        event = event || window.event;
        return typeof event.which == 'undefined' ? event.keyCode : event.which;
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
