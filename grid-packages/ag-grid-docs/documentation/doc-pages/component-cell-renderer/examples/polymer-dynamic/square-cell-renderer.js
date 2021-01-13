import { html, PolymerElement } from 'https://unpkg.com/@polymer/polymer@3.4.1/polymer-element.js';

export default class SquareCellRenderer extends PolymerElement {
    static get template() {
        return html`
            <span>{{valueSquared}}</span>
        `;
    }

    agInit(params) {
        this.params = params;
        this.value = params.value;
    }

    static get properties() {
        return {
            value: Number,
            valueSquared: {
                type: Number,
                computed: 'squareValue(value)'
            }
        };
    }

    squareValue(value) {
        return value * value;
    }
}

customElements.define('square-cell-renderer', SquareCellRenderer);
