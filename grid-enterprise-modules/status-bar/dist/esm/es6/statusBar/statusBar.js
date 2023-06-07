var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Component, PostConstruct, AgPromise, RefSelector } from '@ag-grid-community/core';
export class StatusBar extends Component {
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
        AgPromise.all(componentDetails.map((details) => details.promise))
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
    Autowired('userComponentFactory')
], StatusBar.prototype, "userComponentFactory", void 0);
__decorate([
    Autowired('statusBarService')
], StatusBar.prototype, "statusBarService", void 0);
__decorate([
    RefSelector('eStatusBarLeft')
], StatusBar.prototype, "eStatusBarLeft", void 0);
__decorate([
    RefSelector('eStatusBarCenter')
], StatusBar.prototype, "eStatusBarCenter", void 0);
__decorate([
    RefSelector('eStatusBarRight')
], StatusBar.prototype, "eStatusBarRight", void 0);
__decorate([
    PostConstruct
], StatusBar.prototype, "postConstruct", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdHVzQmFyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3N0YXR1c0Jhci9zdGF0dXNCYXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUNILFNBQVMsRUFDVCxTQUFTLEVBRVQsYUFBYSxFQUNiLFNBQVMsRUFDVCxXQUFXLEVBSWQsTUFBTSx5QkFBeUIsQ0FBQztBQUdqQyxNQUFNLE9BQU8sU0FBVSxTQUFRLFNBQVM7SUFnQnBDO1FBQ0ksS0FBSyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBR08sYUFBYTs7UUFDakIsTUFBTSxZQUFZLEdBQUcsTUFBQSxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQywwQ0FBRSxZQUFZLENBQUM7UUFDNUUsSUFBSSxZQUFZLEVBQUU7WUFDZCxNQUFNLHlCQUF5QixHQUFHLFlBQVk7aUJBQ3pDLE1BQU0sQ0FBQyxDQUFDLGVBQWUsRUFBRSxFQUFFLENBQUMsZUFBZSxDQUFDLEtBQUssS0FBSyxNQUFNLENBQUMsQ0FBQztZQUNuRSxJQUFJLENBQUMseUJBQXlCLENBQUMseUJBQXlCLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBRS9FLE1BQU0sMkJBQTJCLEdBQUcsWUFBWTtpQkFDM0MsTUFBTSxDQUFDLENBQUMsZUFBZSxFQUFFLEVBQUUsQ0FBQyxlQUFlLENBQUMsS0FBSyxLQUFLLFFBQVEsQ0FBQyxDQUFDO1lBQ3JFLElBQUksQ0FBQyx5QkFBeUIsQ0FBQywyQkFBMkIsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUVuRixNQUFNLDBCQUEwQixHQUFHLFlBQVk7aUJBQzFDLE1BQU0sQ0FBQyxDQUFDLGVBQWUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxLQUFLLElBQUksZUFBZSxDQUFDLEtBQUssS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFD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