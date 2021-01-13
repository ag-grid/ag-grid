import { html, PolymerElement } from 'https://unpkg.com/@polymer/polymer@3.4.1/polymer-element.js';

export default class ParamsCellRenderer extends PolymerElement {
    static get template() {
        return html`
            <span>Field: {{params.colDef.field}}, Value: {{params.value}}</span>
        `;
    }

    agInit(params) {
        this.params = params;
    }
}

customElements.define('params-cell-renderer', ParamsCellRenderer);
