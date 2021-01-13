import { html, PolymerElement } from 'https://unpkg.com/@polymer/polymer@3.4.1/polymer-element.js';

export default class ChildCellRenderer extends PolymerElement {
    static get template() {
        return html`
            <span><button style="height: 20px" on-click="invokeParentMethod">Invoke Parent</button></span>
        `;
    }

    agInit(params) {
        this.params = params;
    }

    invokeParentMethod() {
        this.params.context.componentParent.methodFromParent(`Row: ${this.params.node.rowIndex}, Col: ${this.params.colDef.headerName}`);
    }
}

customElements.define('child-cell-renderer', ChildCellRenderer);
