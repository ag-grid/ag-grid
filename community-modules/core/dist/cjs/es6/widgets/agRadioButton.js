/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.1.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const agCheckbox_1 = require("./agCheckbox");
const eventKeys_1 = require("../eventKeys");
class AgRadioButton extends agCheckbox_1.AgCheckbox {
    constructor(config) {
        super(config, 'ag-radio-button', 'radio');
    }
    isSelected() {
        return this.eInput.checked;
    }
    toggle() {
        if (this.eInput.disabled) {
            return;
        }
        // do not allow an active radio button to be deselected
        if (!this.isSelected()) {
            this.setValue(true);
        }
    }
    addInputListeners() {
        super.addInputListeners();
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_CHECKBOX_CHANGED, this.onChange.bind(this));
    }
    /**
     * This ensures that if another radio button in the same named group is selected, we deselect this radio button.
     * By default the browser does this for you, but we are managing classes ourselves in order to ensure input
     * elements are styled correctly in IE11, and the DOM 'changed' event is only fired when a button is selected,
     * not deselected, so we need to use our own event.
     */
    onChange(event) {
        if (event.selected &&
            event.name &&
            this.eInput.name &&
            this.eInput.name === event.name &&
            event.id &&
            this.eInput.id !== event.id) {
            this.setValue(false, true);
        }
    }
}
exports.AgRadioButton = AgRadioButton;
