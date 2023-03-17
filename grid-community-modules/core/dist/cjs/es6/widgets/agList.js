/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgList = void 0;
const agAbstractField_1 = require("./agAbstractField");
const component_1 = require("./component");
const context_1 = require("../context/context");
const string_1 = require("../utils/string");
const keyCode_1 = require("../constants/keyCode");
const aria_1 = require("../utils/aria");
class AgList extends component_1.Component {
    constructor(cssIdentifier = 'default') {
        super(/* html */ `<div class="ag-list ag-${cssIdentifier}-list" role="listbox"></div>`);
        this.cssIdentifier = cssIdentifier;
        this.options = [];
        this.itemEls = [];
    }
    init() {
        this.addManagedListener(this.getGui(), 'keydown', this.handleKeyDown.bind(this));
    }
    handleKeyDown(e) {
        const key = e.key;
        switch (key) {
            case keyCode_1.KeyCode.ENTER:
                if (!this.highlightedEl) {
                    this.setValue(this.getValue());
                }
                else {
                    const pos = this.itemEls.indexOf(this.highlightedEl);
                    this.setValueByIndex(pos);
                }
                break;
            case keyCode_1.KeyCode.DOWN:
            case keyCode_1.KeyCode.UP:
                const isDown = key === keyCode_1.KeyCode.DOWN;
                let itemToHighlight;
                e.preventDefault();
                if (!this.highlightedEl) {
                    itemToHighlight = this.itemEls[isDown ? 0 : this.itemEls.length - 1];
                }
                else {
                    const currentIdx = this.itemEls.indexOf(this.highlightedEl);
                    let nextPos = currentIdx + (isDown ? 1 : -1);
                    nextPos = Math.min(Math.max(nextPos, 0), this.itemEls.length - 1);
                    itemToHighlight = this.itemEls[nextPos];
                }
                this.highlightItem(itemToHighlight);
                break;
        }
    }
    addOptions(listOptions) {
        listOptions.forEach(listOption => this.addOption(listOption));
        return this;
    }
    addOption(listOption) {
        const { value, text } = listOption;
        const sanitisedText = string_1.escapeString(text || value);
        this.options.push({ value, text: sanitisedText });
        this.renderOption(value, sanitisedText);
        this.updateIndices();
        return this;
    }
    updateIndices() {
        const options = this.getGui().querySelectorAll('.ag-list-item');
        options.forEach((option, idx) => {
            aria_1.setAriaPosInSet(option, idx + 1);
            aria_1.setAriaSetSize(option, options.length);
        });
    }
    renderOption(value, text) {
        const itemEl = document.createElement('div');
        aria_1.setAriaRole(itemEl, 'option');
        itemEl.classList.add('ag-list-item', `ag-${this.cssIdentifier}-list-item`);
        itemEl.innerHTML = `<span>${text}</span>`;
        itemEl.tabIndex = -1;
        this.itemEls.push(itemEl);
        this.addManagedListener(itemEl, 'mouseover', () => this.highlightItem(itemEl));
        this.addManagedListener(itemEl, 'mouseleave', () => this.clearHighlighted());
        this.addManagedListener(itemEl, 'click', () => this.setValue(value));
        this.getGui().appendChild(itemEl);
    }
    setValue(value, silent) {
        if (this.value === value) {
            this.fireItemSelected();
            return this;
        }
        if (value == null) {
            this.reset();
            return this;
        }
        const idx = this.options.findIndex(option => option.value === value);
        if (idx !== -1) {
            const option = this.options[idx];
            this.value = option.value;
            this.displayValue = option.text != null ? option.text : option.value;
            this.highlightItem(this.itemEls[idx]);
            if (!silent) {
                this.fireChangeEvent();
            }
        }
        return this;
    }
    setValueByIndex(idx) {
        return this.setValue(this.options[idx].value);
    }
    getValue() {
        return this.value;
    }
    getDisplayValue() {
        return this.displayValue;
    }
    refreshHighlighted() {
        this.clearHighlighted();
        const idx = this.options.findIndex(option => option.value === this.value);
        if (idx !== -1) {
            this.highlightItem(this.itemEls[idx]);
        }
    }
    reset() {
        this.value = null;
        this.displayValue = null;
        this.clearHighlighted();
        this.fireChangeEvent();
    }
    highlightItem(el) {
        if (!el.offsetParent) {
            return;
        }
        this.clearHighlighted();
        this.highlightedEl = el;
        this.highlightedEl.classList.add(AgList.ACTIVE_CLASS);
        aria_1.setAriaSelected(this.highlightedEl, true);
        this.highlightedEl.focus();
    }
    clearHighlighted() {
        if (!this.highlightedEl || !this.highlightedEl.offsetParent) {
            return;
        }
        this.highlightedEl.classList.remove(AgList.ACTIVE_CLASS);
        aria_1.setAriaSelected(this.highlightedEl, false);
        this.highlightedEl = null;
    }
    fireChangeEvent() {
        this.dispatchEvent({ type: agAbstractField_1.AgAbstractField.EVENT_CHANGED });
        this.fireItemSelected();
    }
    fireItemSelected() {
        this.dispatchEvent({ type: AgList.EVENT_ITEM_SELECTED });
    }
}
AgList.EVENT_ITEM_SELECTED = 'selectedItem';
AgList.ACTIVE_CLASS = 'ag-active-item';
__decorate([
    context_1.PostConstruct
], AgList.prototype, "init", null);
exports.AgList = AgList;
