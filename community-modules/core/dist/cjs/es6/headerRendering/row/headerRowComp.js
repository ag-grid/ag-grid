/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.1.1
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
const context_1 = require("../../context/context");
const aria_1 = require("../../utils/aria");
const dom_1 = require("../../utils/dom");
const object_1 = require("../../utils/object");
const component_1 = require("../../widgets/component");
const headerCellComp_1 = require("../cells/column/headerCellComp");
const headerGroupCellComp_1 = require("../cells/columnGroup/headerGroupCellComp");
const headerFilterCellComp_1 = require("../cells/floatingFilter/headerFilterCellComp");
var HeaderRowType;
(function (HeaderRowType) {
    HeaderRowType["COLUMN_GROUP"] = "group";
    HeaderRowType["COLUMN"] = "column";
    HeaderRowType["FLOATING_FILTER"] = "filter";
})(HeaderRowType = exports.HeaderRowType || (exports.HeaderRowType = {}));
class HeaderRowComp extends component_1.Component {
    constructor(ctrl) {
        super();
        this.headerComps = {};
        const extraClass = ctrl.getType() == HeaderRowType.COLUMN_GROUP ? `ag-header-row-column-group` :
            ctrl.getType() == HeaderRowType.FLOATING_FILTER ? `ag-header-row-column-filter` : `ag-header-row-column`;
        this.setTemplate(/* html */ `<div class="ag-header-row ${extraClass}" role="row"></div>`);
        this.ctrl = ctrl;
    }
    //noinspection JSUnusedLocalSymbols
    init() {
        const compProxy = {
            setTransform: transform => this.getGui().style.transform = transform,
            setHeight: height => this.getGui().style.height = height,
            setTop: top => this.getGui().style.top = top,
            setHeaderCtrls: ctrls => this.setHeaderCtrls(ctrls),
            setWidth: width => this.getGui().style.width = width,
            setAriaRowIndex: rowIndex => aria_1.setAriaRowIndex(this.getGui(), rowIndex)
        };
        this.ctrl.setComp(compProxy);
    }
    destroyHeaderCtrls() {
        this.setHeaderCtrls([]);
    }
    setHeaderCtrls(ctrls) {
        if (!this.isAlive()) {
            return;
        }
        const oldComps = this.headerComps;
        this.headerComps = {};
        ctrls.forEach(ctrl => {
            const id = ctrl.getInstanceId();
            let comp = oldComps[id];
            delete oldComps[id];
            if (comp == null) {
                comp = this.createHeaderComp(ctrl);
                this.getGui().appendChild(comp.getGui());
            }
            this.headerComps[id] = comp;
        });
        object_1.iterateObject(oldComps, (id, comp) => {
            this.getGui().removeChild(comp.getGui());
            this.destroyBean(comp);
        });
        const ensureDomOrder = this.gridOptionsWrapper.isEnsureDomOrder();
        if (ensureDomOrder) {
            const comps = object_1.getAllValuesInObject(this.headerComps);
            // ordering the columns by left position orders them in the order they appear on the screen
            comps.sort((a, b) => {
                const leftA = a.getCtrl().getColumnGroupChild().getLeft();
                const leftB = b.getCtrl().getColumnGroupChild().getLeft();
                return leftA - leftB;
            });
            const elementsInOrder = comps.map(c => c.getGui());
            dom_1.setDomChildOrder(this.getGui(), elementsInOrder);
        }
    }
    createHeaderComp(headerCtrl) {
        let result;
        switch (this.ctrl.getType()) {
            case HeaderRowType.COLUMN_GROUP:
                result = new headerGroupCellComp_1.HeaderGroupCellComp(headerCtrl);
                break;
            case HeaderRowType.FLOATING_FILTER:
                result = new headerFilterCellComp_1.HeaderFilterCellComp(headerCtrl);
                break;
            default:
                result = new headerCellComp_1.HeaderCellComp(headerCtrl);
                break;
        }
        this.createBean(result);
        result.setParentComponent(this);
        return result;
    }
}
__decorate([
    context_1.PostConstruct
], HeaderRowComp.prototype, "init", null);
__decorate([
    context_1.PreDestroy
], HeaderRowComp.prototype, "destroyHeaderCtrls", null);
exports.HeaderRowComp = HeaderRowComp;
