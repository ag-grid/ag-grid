"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgAbstractField = void 0;
const agAbstractLabel_1 = require("./agAbstractLabel");
const dom_1 = require("../utils/dom");
const eventKeys_1 = require("../eventKeys");
const aria_1 = require("../utils/aria");
class AgAbstractField extends agAbstractLabel_1.AgAbstractLabel {
    constructor(config, template, className) {
        super(config, template);
        this.className = className;
    }
    postConstruct() {
        super.postConstruct();
        if (this.className) {
            this.addCssClass(this.className);
        }
        this.refreshAriaLabelledBy();
    }
    refreshAriaLabelledBy() {
        const ariaEl = this.getAriaElement();
        const labelId = this.getLabelId();
        if ((0, aria_1.getAriaLabel)(ariaEl) !== null) {
            (0, aria_1.setAriaLabelledBy)(ariaEl, '');
        }
        else {
            (0, aria_1.setAriaLabelledBy)(ariaEl, labelId !== null && labelId !== void 0 ? labelId : '');
        }
    }
    setAriaLabel(label) {
        (0, aria_1.setAriaLabel)(this.getAriaElement(), label);
        this.refreshAriaLabelledBy();
        return this;
    }
    onValueChange(callbackFn) {
        this.addManagedListener(this, eventKeys_1.Events.EVENT_FIELD_VALUE_CHANGED, () => callbackFn(this.getValue()));
        return this;
    }
    getWidth() {
        return this.getGui().clientWidth;
    }
    setWidth(width) {
        (0, dom_1.setFixedWidth)(this.getGui(), width);
        return this;
    }
    getPreviousValue() {
        return this.previousValue;
    }
    getValue() {
        return this.value;
    }
    setValue(value, silent) {
        if (this.value === value) {
            return this;
        }
        this.previousValue = this.value;
        this.value = value;
        if (!silent) {
            this.dispatchEvent({ type: eventKeys_1.Events.EVENT_FIELD_VALUE_CHANGED });
        }
        return this;
    }
}
exports.AgAbstractField = AgAbstractField;
