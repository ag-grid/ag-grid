"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusBar = void 0;
const core_1 = require("@ag-grid-community/core");
class StatusBar extends core_1.Component {
    constructor() {
        super(StatusBar.TEMPLATE);
    }
    postConstruct() {
        var _a;
        const statusPanels = (_a = this.gridOptionsService.get('statusBar')) === null || _a === void 0 ? void 0 : _a.statusPanels;
        if (statusPanels) {
            const leftStatusPanelComponents = statusPanels
                .filter((componentConfig) => componentConfig.align === 'left');
            this.createAndRenderComponents(leftStatusPanelComponents, this.eStatusBarLeft);
            const centerStatusPanelComponents = statusPanels
                .filter((componentConfig) => componentConfig.align === 'center');
            this.createAndRenderComponents(centerStatusPanelComponents, this.eStatusBarCenter);
            const rightStatusPanelComponents = statusPanels
                .filter((componentConfig) => (!componentConfig.align || componentConfig.align === 'right'));
            this.createAndRenderComponents(rightStatusPanelComponents, this.eStatusBarRight);
        }
        else {
            this.setDisplayed(false);
        }
    }
    createAndRenderComponents(statusBarComponents, ePanelComponent) {
        const componentDetails = [];
        statusBarComponents.forEach(componentConfig => {
            const params = {};
            const compDetails = this.userComponentFactory.getStatusPanelCompDetails(componentConfig, params);
            const promise = compDetails.newAgStackInstance();
            if (!promise) {
                return;
            }
            componentDetails.push({
                // default to the component name if no key supplied
                key: componentConfig.key || componentConfig.statusPanel,
                promise
            });
        });
        core_1.AgPromise.all(componentDetails.map((details) => details.promise))
            .then(() => {
            componentDetails.forEach(componentDetail => {
                componentDetail.promise.then((component) => {
                    const destroyFunc = () => {
                        this.getContext().destroyBean(component);
                    };
                    if (this.isAlive()) {
                        this.statusBarService.registerStatusPanel(componentDetail.key, component);
                        ePanelComponent.appendChild(component.getGui());
                        this.addDestroyFunc(destroyFunc);
                    }
                    else {
                        destroyFunc();
                    }
                });
            });
        });
    }
}
StatusBar.TEMPLATE = `<div class="ag-status-bar">
            <div ref="eStatusBarLeft" class="ag-status-bar-left" role="status"></div>
            <div ref="eStatusBarCenter" class="ag-status-bar-center" role="status"></div>
            <div ref="eStatusBarRight" class="ag-status-bar-right" role="status"></div>
        </div>`;
__decorate([
    core_1.Autowired('userComponentFactory')
], StatusBar.prototype, "userComponentFactory", void 0);
__decorate([
    core_1.Autowired('statusBarService')
], StatusBar.prototype, "statusBarService", void 0);
__decorate([
    core_1.RefSelector('eStatusBarLeft')
], StatusBar.prototype, "eStatusBarLeft", void 0);
__decorate([
    core_1.RefSelector('eStatusBarCenter')
], StatusBar.prototype, "eStatusBarCenter", void 0);
__decorate([
    core_1.RefSelector('eStatusBarRight')
], StatusBar.prototype, "eStatusBarRight", void 0);
__decorate([
    core_1.PostConstruct
], StatusBar.prototype, "postConstruct", null);
exports.StatusBar = StatusBar;
