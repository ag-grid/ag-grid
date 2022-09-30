/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BeanStub } from "../../context/beanStub";
import { Autowired, PostConstruct } from "../../context/context";
export class HoverFeature extends BeanStub {
    constructor(columns, element) {
        super();
        this.columns = columns;
        this.element = element;
    }
    postConstruct() {
        if (this.gridOptionsWrapper.isColumnHoverHighlight()) {
            this.addMouseHoverListeners();
        }
    }
    addMouseHoverListeners() {
        this.addManagedListener(this.element, 'mouseout', this.onMouseOut.bind(this));
        this.addManagedListener(this.element, 'mouseover', this.onMouseOver.bind(this));
    }
    onMouseOut() {
        this.columnHoverService.clearMouseOver();
    }
    onMouseOver() {
        this.columnHoverService.setMouseOver(this.columns);
    }
}
__decorate([
    Autowired('columnHoverService')
], HoverFeature.prototype, "columnHoverService", void 0);
__decorate([
    PostConstruct
], HoverFeature.prototype, "postConstruct", null);
