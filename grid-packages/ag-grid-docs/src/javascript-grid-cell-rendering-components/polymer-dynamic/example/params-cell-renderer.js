import {html, PolymerElement} from "../node_modules/@polymer/polymer/polymer-element.js";

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
