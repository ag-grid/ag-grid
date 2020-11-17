import { html, PolymerElement } from 'https://unpkg.com/@polymer/polymer@3.4.1/polymer-element.js';

export default class CurrencyCellRenderer extends PolymerElement {
    static get template() {
        return html`
            <span>{{currency}}{{formattedValue}}</span>
        `;
    }

    agInit(params) {
        this.params = params;

        this.currency = this.params.currency;
        this.value = this.params.value;
    }

    static get properties() {
        return {
            currency: String,
            value: Number,
            formattedValue: {
                type: Number,
                computed: 'format(value)'
            }
        };
    }

    format(value) {
        return value ? value.toFixed(2) : value;
    }
}

customElements.define('currency-cell-renderer', CurrencyCellRenderer);
