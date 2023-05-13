/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.3.5
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired } from "../../../context/context";
import { ProvidedColumnGroup } from "../../../entities/providedColumnGroup";
import { setDisplayed } from "../../../utils/dom";
import { isStopPropagationForAgGrid, stopPropagationForAgGrid } from "../../../utils/event";
import { doOnce } from "../../../utils/function";
import { exists } from "../../../utils/generic";
import { createIconNoSpan } from "../../../utils/icon";
import { escapeString } from "../../../utils/string";
import { Component } from "../../../widgets/component";
import { RefSelector } from "../../../widgets/componentAnnotations";
import { TouchListener } from "../../../widgets/touchListener";
export class HeaderGroupComp extends Component {
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
            doOnce(() => console.warn(message), 'HeaderGroupComp.templateNotSupported');
        }
    }
    setupExpandIcons() {
        this.addInIcon("columnGroupOpened", "agOpened");
        this.addInIcon("columnGroupClosed", "agClosed");
        const expandAction = (event) => {
            if (isStopPropagationForAgGrid(event)) {
                return;
            }
            const newExpandedValue = !this.params.columnGroup.isExpanded();
            this.columnModel.setColumnGroupOpened(this.params.columnGroup.getProvidedColumnGroup(), newExpandedValue, "uiColumnExpanded");
        };
        this.addTouchAndClickListeners(this.eCloseIcon, expandAction);
        this.addTouchAndClickListeners(this.eOpenIcon, expandAction);
        const stopPropagationAction = (event) => {
            stopPropagationForAgGrid(event);
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
        this.addManagedListener(providedColumnGroup, ProvidedColumnGroup.EVENT_EXPANDED_CHANGED, this.updateIconVisibility.bind(this));
        this.addManagedListener(providedColumnGroup, ProvidedColumnGroup.EVENT_EXPANDABLE_CHANGED, this.updateIconVisibility.bind(this));
    }
    addTouchAndClickListeners(eElement, action) {
        const touchListener = new TouchListener(eElement, true);
        this.addManagedListener(touchListener, TouchListener.EVENT_TAP, action);
        this.addDestroyFunc(() => touchListener.destroy());
        this.addManagedListener(eElement, "click", action);
    }
    updateIconVisibility() {
        const columnGroup = this.params.columnGroup;
        if (columnGroup.isExpandable()) {
            const expanded = this.params.columnGroup.isExpanded();
            setDisplayed(this.eOpenIcon, expanded);
            setDisplayed(this.eCloseIcon, !expanded);
        }
        else {
            setDisplayed(this.eOpenIcon, false);
            setDisplayed(this.eCloseIcon, false);
        }
    }
    addInIcon(iconName, refName) {
        const eIcon = createIconNoSpan(iconName, this.gridOptionsService, null);
        if (eIcon) {
            this.getRefElement(refName).appendChild(eIcon);
        }
    }
    addGroupExpandIcon() {
        if (!this.params.columnGroup.isExpandable()) {
            setDisplayed(this.eOpenIcon, false);
            setDisplayed(this.eCloseIcon, false);
            return;
        }
    }
    setupLabel() {
        var _a;
        // no renderer, default text render
        const { displayName, columnGroup } = this.params;
        if (exists(displayName)) {
            const displayNameSanitised = escapeString(displayName);
            this.getRefElement('agLabel').innerHTML = displayNameSanitised;
        }
        this.addOrRemoveCssClass('ag-sticky-label', !!((_a = columnGroup.getColGroupDef()) === null || _a === void 0 ? void 0 : _a.stickyLabel));
    }
}
HeaderGroupComp.TEMPLATE = `<div class="ag-header-group-cell-label" ref="agContainer" role="presentation">
            <span ref="agLabel" class="ag-header-group-text" role="presentation"></span>
            <span ref="agOpened" class="ag-header-icon ag-header-expand-icon ag-header-expand-icon-expanded"></span>
            <span ref="agClosed" class="ag-header-icon ag-header-expand-icon ag-header-expand-icon-collapsed"></span>
        </div>`;
__decorate([
    Autowired("columnModel")
], HeaderGroupComp.prototype, "columnModel", void 0);
__decorate([
    RefSelector("agOpened")
], HeaderGroupComp.prototype, "eOpenIcon", void 0);
__decorate([
    RefSelector("agClosed")
], HeaderGroupComp.prototype, "eCloseIcon", void 0);
