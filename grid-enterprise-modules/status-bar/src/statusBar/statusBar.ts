import {
    Autowired,
    Component,
    UserComponentFactory,
    PostConstruct,
    PreDestroy,
    AgPromise,
    RefSelector,
    IStatusPanelComp,
    IStatusPanelParams,
    WithoutGridCommon
} from '@ag-grid-community/core';
import { StatusBarService } from "./statusBarService";

export class StatusBar extends Component {

    private static TEMPLATE = /* html */
        `<div class="ag-status-bar">
            <div ref="eStatusBarLeft" class="ag-status-bar-left" role="status"></div>
            <div ref="eStatusBarCenter" class="ag-status-bar-center" role="status"></div>
            <div ref="eStatusBarRight" class="ag-status-bar-right" role="status"></div>
        </div>`;

    @Autowired('userComponentFactory') private userComponentFactory: UserComponentFactory;
    @Autowired('statusBarService') private statusBarService: StatusBarService;

    @RefSelector('eStatusBarLeft') private eStatusBarLeft: HTMLElement;
    @RefSelector('eStatusBarCenter') private eStatusBarCenter: HTMLElement;
    @RefSelector('eStatusBarRight') private eStatusBarRight: HTMLElement;

    private compDestroyFunctions: (() => void)[] = [];

    constructor() {
        super(StatusBar.TEMPLATE);
    }

    @PostConstruct
    private postConstruct(): void {
        this.processStatusPanels();
        this.addManagedPropertyListeners(['statusBar'], this.handleStatusBarChanged.bind(this));
    }

    private processStatusPanels() {
        const statusPanels = this.gridOptionsService.get('statusBar')?.statusPanels;
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
        } else {
            this.setDisplayed(false);
        }
    }

    private handleStatusBarChanged() {
        const statusPanels = this.gridOptionsService.get('statusBar')?.statusPanels;
        const validStatusBarPanelsProvided = Array.isArray(statusPanels) && statusPanels.length > 0;
        this.setDisplayed(validStatusBarPanelsProvided);

        this.resetStatusBar();
        if (validStatusBarPanelsProvided) {
            this.processStatusPanels();
        }
    }

    resetStatusBar() {
        this.eStatusBarLeft.innerHTML = '';
        this.eStatusBarCenter.innerHTML = '';
        this.eStatusBarRight.innerHTML = '';

        this.destroyComponents();
        this.statusBarService.unregisterAllComponents();
    }

    @PreDestroy
    private destroyComponents() {
        this.compDestroyFunctions.forEach((func) => func());
        this.compDestroyFunctions = [];
    }

    private createAndRenderComponents(statusBarComponents: any[], ePanelComponent: HTMLElement) {
        const componentDetails: { key: string; promise: AgPromise<IStatusPanelComp>; }[] = [];

        statusBarComponents.forEach(componentConfig => {
            const params: WithoutGridCommon<IStatusPanelParams> = {};

            const compDetails = this.userComponentFactory.getStatusPanelCompDetails(componentConfig, params);
            const promise = compDetails.newAgStackInstance();

            if (!promise) { return; }

            componentDetails.push({
                // default to the component name if no key supplied
                key: componentConfig.key || componentConfig.statusPanel,
                promise
            });
        });

        AgPromise.all(componentDetails.map((details) => details.promise))
            .then(() => {
                componentDetails.forEach(componentDetail => {
                    componentDetail.promise.then((component: IStatusPanelComp) => {
                        const destroyFunc = () => {
                            this.getContext().destroyBean(component);
                        };

                        if (this.isAlive()) {
                            this.statusBarService.registerStatusPanel(componentDetail.key, component);
                            ePanelComponent.appendChild(component.getGui());
                            this.compDestroyFunctions.push(destroyFunc);
                        } else {
                            destroyFunc();
                        }
                    });
                });
            });
    }
}
