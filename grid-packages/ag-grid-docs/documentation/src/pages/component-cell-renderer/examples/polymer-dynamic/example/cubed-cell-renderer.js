import {html, PolymerElement} from "../node_modules/@polymer/polymer/polymer-element.js";

export default class CubeCellRenderer extends PolymerElement {
    static get template() {
        return html`
            <span>{{valueCubed}}</span>
        `;
    }

    agInit(params) {
        this.params = params;
        this.value = params.value;
    }

    // called when the cell is refreshed (ie when its value changed, for example by editing)
    refresh(params)  {
        this.params = params;
        this.value = params.value;
    }

    static get properties() {
        return {
            value: Number,
            valueCubed: {
                type: Number,
                computed: 'cubeValue(value)'
            }
        };
    }

    cubeValue(value) {
        return value * value * value;
    }
}

customElements.define('cube-cell-renderer', CubeCellRenderer);
