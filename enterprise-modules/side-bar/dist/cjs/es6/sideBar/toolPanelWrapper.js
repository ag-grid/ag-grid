"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
const horizontalResizeComp_1 = require("./horizontalResizeComp");
class ToolPanelWrapper extends core_1.Component {
    constructor() {
        super(ToolPanelWrapper.TEMPLATE);
    }
    setupResize() {
        const eGui = this.getGui();
        const resizeBar = this.resizeBar = this.createManagedBean(new horizontalResizeComp_1.HorizontalResizeComp());
        resizeBar.setElementToResize(eGui);
        this.appendChild(resizeBar);
    }
    getToolPanelId() {
        return this.toolPanelId;
    }
    setToolPanelDef(toolPanelDef) {
        const { id, minWidth, maxWidth, width } = toolPanelDef;
        this.toolPanelId = id;
        this.width = width;
        const params = {};
        const compDetails = this.userComponentFactory.getToolPanelCompDetails(toolPanelDef, params);
        const componentPromise = compDetails.newAgStackInstance();
        if (componentPromise == null) {
            console.warn(`AG Grid: error processing tool panel component ${id}. You need to specify either 'toolPanel' or 'toolPanelFramework'`);
            return;
        }
        componentPromise.then(this.setToolPanelComponent.bind(this));
        if (minWidth != null) {
            this.resizeBar.setMinWidth(minWidth);
        }
        if (maxWidth != null) {
            this.resizeBar.setMaxWidth(maxWidth);
        }
    }
    setToolPanelComponent(compInstance) {
        this.toolPanelCompInstance = compInstance;
        this.appendChild(compInstance.getGui());
        this.addDestroyFunc(() => {
            this.destroyBean(compInstance);
        });
        if (this.width) {
            this.getGui().style.width = `${this.width}px`;
        }
    }
    getToolPanelInstance() {
        return this.toolPanelCompInstance;
    }
    setResizerSizerSide(side) {
        const isRtl = this.gridOptionsWrapper.isEnableRtl();
        const isLeft = side === 'left';
        const inverted = isRtl ? isLeft : !isLeft;
        this.resizeBar.setInverted(inverted);
    }
    refresh() {
        this.toolPanelCompInstance.refresh();
    }
}
ToolPanelWrapper.TEMPLATE = `<div class="ag-tool-panel-wrapper"/>`;
__decorate([
    core_1.Autowired("userComponentFactory")
], ToolPanelWrapper.prototype, "userComponentFactory", void 0);
__decorate([
    core_1.PostConstruct
], ToolPanelWrapper.prototype, "setupResize", null);
exports.ToolPanelWrapper = ToolPanelWrapper;
