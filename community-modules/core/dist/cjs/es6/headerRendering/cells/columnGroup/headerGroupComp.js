/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
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
const context_1 = require("../../../context/context");
const providedColumnGroup_1 = require("../../../entities/providedColumnGroup");
const dom_1 = require("../../../utils/dom");
const event_1 = require("../../../utils/event");
const function_1 = require("../../../utils/function");
const generic_1 = require("../../../utils/generic");
const icon_1 = require("../../../utils/icon");
const string_1 = require("../../../utils/string");
const component_1 = require("../../../widgets/component");
const componentAnnotations_1 = require("../../../widgets/componentAnnotations");
const touchListener_1 = require("../../../widgets/touchListener");
class HeaderGroupComp extends component_1.Component {
    constructor() {
        super(HeaderGroupComp.TEMPLATE);
    }
    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    destroy() {
        super.destroy();
    }
    init(params) {
        this.params = params;
        this.checkWarnings();
        this.setupLabel();
        this.addGroupExpandIcon();
        this.setupExpandIcons();
    }
    checkWarnings() {
        const paramsAny = this.params;
        if (paramsAny.template) {
            const message = `AG Grid: A template was provided for Header Group Comp - templates are only supported for Header Comps (not groups)`;
            function_1.doOnce(() => console.warn(message), 'HeaderGroupComp.templateNotSupported');
        }
    }
    setupExpandIcons() {
        this.addInIcon("columnGroupOpened", "agOpened");
        this.addInIcon("columnGroupClosed", "agClosed");
        const expandAction = (event) => {
            if (event_1.isStopPropagationForAgGrid(event)) {
                return;
            }
            const newExpandedValue = !this.params.columnGroup.isExpanded();
            this.columnModel.setColumnGroupOpened(this.params.columnGroup.getProvidedColumnGroup(), newExpandedValue, "uiColumnExpanded");
        };
        this.addTouchAndClickListeners(this.eCloseIcon, expandAction);
        this.addTouchAndClickListeners(this.eOpenIcon, expandAction);
        const stopPropagationAction = (event) => {
            event_1.stopPropagationForAgGrid(event);
        };
        // adding stopPropagation to the double click for the icons prevents double click action happening
        // when the icons are clicked. if the icons are double clicked, then the groups should open and
        // then close again straight away. if we also listened to double click, then the group would open,
        // close, then open, which is not what we want. double click should only action if the user double
        // clicks outside of the icons.
        this.addManagedListener(this.eCloseIcon, "dblclick", stopPropagationAction);
        this.addManagedListener(this.eOpenIcon, "dblclick", stopPropagationAction);
        this.addManagedListener(this.getGui(), "dblclick", expandAction);
        this.updateIconVisibility();
        const providedColumnGroup = this.params.columnGroup.getProvidedColumnGroup();
        this.addManagedListener(providedColumnGroup, providedColumnGroup_1.ProvidedColumnGroup.EVENT_EXPANDED_CHANGED, this.updateIconVisibility.bind(this));
        this.addManagedListener(providedColumnGroup, providedColumnGroup_1.ProvidedColumnGroup.EVENT_EXPANDABLE_CHANGED, this.updateIconVisibility.bind(this));
    }
    addTouchAndClickListeners(eElement, action) {
        const touchListener = new touchListener_1.TouchListener(eElement, true);
        this.addManagedListener(touchListener, touchListener_1.TouchListener.EVENT_TAP, action);
        this.addDestroyFunc(() => touchListener.destroy());
        this.addManagedListener(eElement, "click", action);
    }
    updateIconVisibility() {
        const columnGroup = this.params.columnGroup;
        if (columnGroup.isExpandable()) {
            const expanded = this.params.columnGroup.isExpanded();
            dom_1.setDisplayed(this.eOpenIcon, expanded);
            dom_1.setDisplayed(this.eCloseIcon, !expanded);
        }
        else {
            dom_1.setDisplayed(this.eOpenIcon, false);
            dom_1.setDisplayed(this.eCloseIcon, false);
        }
    }
    addInIcon(iconName, refName) {
        const eIcon = icon_1.createIconNoSpan(iconName, this.gridOptionsWrapper, null);
        if (eIcon) {
            this.getRefElement(refName).appendChild(eIcon);
        }
    }
    addGroupExpandIcon() {
        if (!this.params.columnGroup.isExpandable()) {
            dom_1.setDisplayed(this.eOpenIcon, false);
            dom_1.setDisplayed(this.eCloseIcon, false);
            return;
        }
    }
    setupLabel() {
        // no renderer, default text render
        const displayName = this.params.displayName;
        if (generic_1.exists(displayName)) {
            const displayNameSanitised = string_1.escapeString(displayName);
            this.getRefElement('agLabel').innerHTML = displayNameSanitised;
        }
    }
}
HeaderGroupComp.TEMPLATE = `<div class="ag-header-group-cell-label" ref="agContainer" role="presentation">
            <span ref="agLabel" class="ag-header-group-text" role="presentation"></span>
            <span ref="agOpened" class="ag-header-icon ag-header-expand-icon ag-header-expand-icon-expanded"></span>
            <span ref="agClosed" class="ag-header-icon ag-header-expand-icon ag-header-expand-icon-collapsed"></span>
        </div>`;
__decorate([
    context_1.Autowired("columnModel")
], HeaderGroupComp.prototype, "columnModel", void 0);
__decorate([
    componentAnnotations_1.RefSelector("agOpened")
], HeaderGroupComp.prototype, "eOpenIcon", void 0);
__decorate([
    componentAnnotations_1.RefSelector("agClosed")
], HeaderGroupComp.prototype, "eCloseIcon", void 0);
exports.HeaderGroupComp = HeaderGroupComp;
