import { html, PolymerElement } from 'https://unpkg.com/@polymer/polymer@3.4.1/polymer-element.js';

export default class MoodRenderer extends PolymerElement {
    static get template() {
        return html`
            <img width="20px" src="[[imgForMood]]" />
        `;
    }

    agInit(params) {
        this.params = params;
        this.setMood(params);
    }

    refresh(params) {
        this.params = params;
        this.setMood(params);
    }

    setMood(params) {
        this.mood = params.value;
        this.imgForMood = this.mood === 'Happy' ?
            'https://www.ag-grid.com/example-assets/smileys/happy.png' :
            'https://www.ag-grid.com/example-assets/smileys/sad.png';
    };

    static get properties() {
        return {
            imgForMood: String
        };
    }
}

customElements.define('mood-renderer', MoodRenderer);
