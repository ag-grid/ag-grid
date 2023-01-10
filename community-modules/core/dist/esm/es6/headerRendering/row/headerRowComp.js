/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PostConstruct, PreDestroy } from '../../context/context';
import { setAriaRowIndex } from '../../utils/aria';
import { setDomChildOrder } from '../../utils/dom';
import { getAllValuesInObject, iterateObject } from '../../utils/object';
import { Component } from '../../widgets/component';
import { HeaderCellComp } from '../cells/column/headerCellComp';
import { HeaderGroupCellComp } from '../cells/columnGroup/headerGroupCellComp';
import { HeaderFilterCellComp } from '../cells/floatingFilter/headerFilterCellComp';
export var HeaderRowType;
(function (HeaderRowType) {
    HeaderRowType["COLUMN_GROUP"] = "group";
    HeaderRowType["COLUMN"] = "column";
    HeaderRowType["FLOATING_FILTER"] = "filter";
})(HeaderRowType || (HeaderRowType = {}));
export class HeaderRowComp extends Component {
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
            setAriaRowIndex: rowIndex => setAriaRowIndex(this.getGui(), rowIndex)
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
        iterateObject(oldComps, (id, comp) => {
            this.getGui().removeChild(comp.getGui());
            this.destroyBean(comp);
        });
        const isEnsureDomOrder = this.gridOptionsService.is('ensureDomOrder');
        const isPrintLayout = this.gridOptionsService.isDomLayout('print');
        if (isEnsureDomOrder || isPrintLayout) {
            const comps = getAllValuesInObject(this.headerComps);
            // ordering the columns by left position orders them in the order they appear on the screen
            comps.sort((a, b) => {
                const leftA = a.getCtrl().getColumnGroupChild().getLeft();
                const leftB = b.getCtrl().getColumnGroupChild().getLeft();
                return leftA - leftB;
            });
            const elementsInOrder = comps.map(c => c.getGui());
            setDomChildOrder(this.getGui(), elementsInOrder);
        }
    }
    createHeaderComp(headerCtrl) {
        let result;
        switch (this.ctrl.getType()) {
            case HeaderRowType.COLUMN_GROUP:
                result = new HeaderGroupCellComp(headerCtrl);
                break;
            case HeaderRowType.FLOATING_FILTER:
                result = new HeaderFilterCellComp(headerCtrl);
                break;
            default:
                result = new HeaderCellComp(headerCtrl);
                break;
        }
        this.createBean(result);
        result.setParentComponent(this);
        return result;
    }
}
__decorate([
    PostConstruct
], HeaderRowComp.prototype, "init", null);
__decorate([
    PreDestroy
], HeaderRowComp.prototype, "destroyHeaderCtrls", null);
