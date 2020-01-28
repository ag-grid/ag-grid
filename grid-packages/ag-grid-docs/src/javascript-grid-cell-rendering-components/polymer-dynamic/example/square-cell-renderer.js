import {html, PolymerElement} from "../node_modules/@polymer/polymer/polymer-element.js";

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
