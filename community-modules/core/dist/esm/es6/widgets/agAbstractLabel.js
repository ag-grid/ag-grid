/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component } from "./component";
import { PostConstruct } from "../context/context";
import { clearElement, setDisabled, setDisplayed, setElementWidth } from "../utils/dom";
import { setAriaRole } from "../utils/aria";
export class AgAbstractLabel extends Component {
    constructor(config, template) {
        super(template);
        this.labelSeparator = '';
        this.labelAlignment = 'left';
        this.disabled = false;
        this.label = '';
        this.config = config || {};
    }
    postConstruct() {
        this.addCssClass('ag-labeled');
        this.eLabel.classList.add('ag-label');
        const { labelSeparator, label, labelWidth, labelAlignment } = this.config;
        if (labelSeparator != null) {
            this.setLabelSeparator(labelSeparator);
        }
        if (label != null) {
            this.setLabel(label);
        }
        if (labelWidth != null) {
            this.setLabelWidth(labelWidth);
        }
        this.setLabelAlignment(labelAlignment || this.labelAlignment);
        this.refreshLabel();
    }
    refreshLabel() {
        clearElement(this.eLabel);
        if (typeof this.label === 'string') {
            this.eLabel.innerText = this.label + this.labelSeparator;
        }
        else if (this.label) {
            this.eLabel.appendChild(this.label);
        }
        if (this.label === '') {
            setDisplayed(this.eLabel, false);
            setAriaRole(this.eLabel, 'presentation');
        }
        else {
            setDisplayed(this.eLabel, true);
            setAriaRole(this.eLabel, null);
        }
    }
    setLabelSeparator(labelSeparator) {
        if (this.labelSeparator === labelSeparator) {
            return this;
        }
        this.labelSeparator = labelSeparator;
        if (this.label != null) {
            this.refreshLabel();
        }
        return this;
    }
    getLabelId() {
        this.eLabel.id = this.eLabel.id || `ag-${this.getCompId()}-label`;
        return this.eLabel.id;
    }
    getLabel() {
        return this.label;
    }
    setLabel(label) {
        if (this.label === label) {
            return this;
        }
        this.label = label;
        this.refreshLabel();
        return this;
    }
    setLabelAlignment(alignment) {
        const eGui = this.getGui();
        const eGuiClassList = eGui.classList;
        eGuiClassList.toggle('ag-label-align-left', alignment === 'left');
        eGuiClassList.toggle('ag-label-align-right', alignment === 'right');
        eGuiClassList.toggle('ag-label-align-top', alignment === 'top');
        return this;
    }
    setLabelEllipsis(hasEllipsis) {
        this.eLabel.classList.toggle('ag-label-ellipsis', hasEllipsis);
        return this;
    }
    setLabelWidth(width) {
        if (this.label == null) {
            return this;
        }
        setElementWidth(this.eLabel, width);
        return this;
    }
    setDisabled(disabled) {
        disabled = !!disabled;
        const element = this.getGui();
        setDisabled(element, disabled);
        element.classList.toggle('ag-disabled', disabled);
        this.disabled = disabled;
        return this;
    }
    isDisabled() {
        return !!this.disabled;
    }
}
__decorate([
    PostConstruct
], AgAbstractLabel.prototype, "postConstruct", null);
