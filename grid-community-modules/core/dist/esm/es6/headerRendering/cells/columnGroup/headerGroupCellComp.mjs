var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, PostConstruct } from "../../../context/context.mjs";
import { setDisplayed } from "../../../utils/dom.mjs";
import { RefSelector } from "../../../widgets/componentAnnotations.mjs";
import { AbstractHeaderCellComp } from "../abstractCell/abstractHeaderCellComp.mjs";
export class HeaderGroupCellComp extends AbstractHeaderCellComp {
    constructor(ctrl) {
        super(HeaderGroupCellComp.TEMPLATE, ctrl);
    }
    postConstruct() {
        const eGui = this.getGui();
        const setAttribute = (key, value) => value != undefined ? eGui.setAttribute(key, value) : eGui.removeAttribute(key);
        eGui.setAttribute("col-id", this.ctrl.getColId());
        const compProxy = {
            addOrRemoveCssClass: (cssClassName, on) => this.addOrRemoveCssClass(cssClassName, on),
            setResizableDisplayed: (displayed) => setDisplayed(this.eResize, displayed),
            setWidth: width => eGui.style.width = width,
            setAriaExpanded: expanded => setAttribute('aria-expanded', expanded),
            setUserCompDetails: details => this.setUserCompDetails(details),
            getUserCompInstance: () => this.headerGroupComp,
        };
        this.ctrl.setComp(compProxy, eGui, this.eResize);
    }
    setUserCompDetails(details) {
        details.newAgStackInstance().then(comp => this.afterHeaderCompCreated(comp));
    }
    afterHeaderCompCreated(headerGroupComp) {
        const destroyFunc = () => this.destroyBean(headerGroupComp);
        if (!this.isAlive()) {
            destroyFunc();
            return;
        }
        const eGui = this.getGui();
        const eHeaderGroupGui = headerGroupComp.getGui();
        eGui.appendChild(eHeaderGroupGui);
        this.addDestroyFunc(destroyFunc);
        this.headerGroupComp = headerGroupComp;
        this.ctrl.setDragSource(eGui);
    }
}
HeaderGroupCellComp.TEMPLATE = `<div class="ag-header-group-cell" role="columnheader" tabindex="-1">
            <div ref="eResize" class="ag-header-cell-resize" role="presentation"></div>
        </div>`;
__decorate([
    Autowired('userComponentFactory')
], HeaderGroupCellComp.prototype, "userComponentFactory", void 0);
__decorate([
    RefSelector('eResize')
], HeaderGroupCellComp.prototype, "eResize", void 0);
__decorate([
    PostConstruct
], HeaderGroupCellComp.prototype, "postConstruct", null);
