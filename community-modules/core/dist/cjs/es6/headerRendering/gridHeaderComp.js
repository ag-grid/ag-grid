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
const constants_1 = require("../constants/constants");
const context_1 = require("../context/context");
const component_1 = require("../widgets/component");
const gridHeaderCtrl_1 = require("./gridHeaderCtrl");
const headerRowContainerComp_1 = require("./rowContainer/headerRowContainerComp");
class GridHeaderComp extends component_1.Component {
    constructor() {
        super(GridHeaderComp.TEMPLATE);
    }
    postConstruct() {
        const compProxy = {
            addOrRemoveCssClass: (cssClassName, on) => this.addOrRemoveCssClass(cssClassName, on),
            setHeightAndMinHeight: height => {
                this.getGui().style.height = height;
                this.getGui().style.minHeight = height;
            }
        };
        const ctrl = this.createManagedBean(new gridHeaderCtrl_1.GridHeaderCtrl());
        ctrl.setComp(compProxy, this.getGui(), this.getFocusableElement());
        const addContainer = (container) => {
            this.createManagedBean(container);
            this.appendChild(container);
        };
        addContainer(new headerRowContainerComp_1.HeaderRowContainerComp(constants_1.Constants.PINNED_LEFT));
        addContainer(new headerRowContainerComp_1.HeaderRowContainerComp(null));
        addContainer(new headerRowContainerComp_1.HeaderRowContainerComp(constants_1.Constants.PINNED_RIGHT));
    }
}
GridHeaderComp.TEMPLATE = `<div class="ag-header" role="presentation"/>`;
__decorate([
    context_1.PostConstruct
], GridHeaderComp.prototype, "postConstruct", null);
exports.GridHeaderComp = GridHeaderComp;
