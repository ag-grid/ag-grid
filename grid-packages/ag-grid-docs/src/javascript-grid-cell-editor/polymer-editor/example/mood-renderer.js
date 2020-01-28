import {html, PolymerElement} from "../node_modules/@polymer/polymer/polymer-element.js";

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
        this.imgForMood = this.mood === 'Happy' ? '/images/smiley.png' : '/images/smiley-sad.png';
    };

    static get properties() {
        return {
            imgForMood: String
        };
    }
}

customElements.define('mood-renderer', MoodRenderer);
