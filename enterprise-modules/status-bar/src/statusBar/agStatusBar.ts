import {
    AgComponentSelector,
    AgPromise,
    Autowired,
    Component,
    IStatusPanelComp,
    IStatusPanelParams,
    PostConstruct,
    PreDestroy,
    RefPlaceholder,
    StatusPanelDef,
    UserComponentFactory,
    WithoutGridCommon,
    _removeFromParent,
} from '@ag-grid-community/core';

import { StatusBarService } from './statusBarService';

export class AgStatusBar extends Component {
    static readonly selector: AgComponentSelector = 'AG-STATUS-BAR';
    private static TEMPLATE /* html */ = `<div class="ag-status-bar">
            <div data-ref="eStatusBarLeft" class="ag-status-bar-left" role="status"></div>
            <div data-ref="eStatusBarCenter" class="ag-status-bar-center" role="status"></div>
            <div data-ref="eStatusBarRight" class="ag-status-bar-right" role="status"></div>
        </div>`;

    @Autowired('userComponentFactory') private userComponentFactory: UserComponentFactory;
    @Autowired('statusBarService') private statusBarService: StatusBarService;

    private readonly eStatusBarLeft: HTMLElement = RefPlaceholder;
    private readonly eStatusBarCenter: HTMLElement = RefPlaceholder;
    private readonly eStatusBarRight: HTMLElement = RefPlaceholder;

    private compDestroyFunctions: { [key: string]: () => void } = {};

    constructor() {
        super(AgStatusBar.TEMPLATE);
    }

    @PostConstruct
    private postConstruct(): void {
        this.processStatusPanels(new Map());
        this.addManagedPropertyListeners(['statusBar'], this.handleStatusBarChanged.bind(this));
    }

    private processStatusPanels(existingStatusPanelsToReuse: Map<string, IStatusPanelComp>) {
        const statusPanels = this.gos.get('statusBar')?.statusPanels;
        if (statusPanels) {
            const leftStatusPanelComponents = statusPanels.filter(
                (componentConfig) => componentConfig.align === 'left'
            );
            this.createAndRenderComponents(leftStatusPanelComponents, this.eStatusBarLeft, existingStatusPanelsToReuse);

            const centerStatusPanelComponents = statusPanels.filter(
                (componentConfig) => componentConfig.align === 'center'
            );
            this.createAndRenderComponents(
                centerStatusPanelComponents,
                this.eStatusBarCenter,
                existingStatusPanelsToReuse
            );

            const rightStatusPanelComponents = statusPanels.filter(
                (componentConfig) => !componentConfig.align || componentConfig.align === 'right'
            );
            this.createAndRenderComponents(
                rightStatusPanelComponents,
                this.eStatusBarRight,
                existingStatusPanelsToReuse
            );
        } else {
            this.setDisplayed(false);
        }
    }

    private handleStatusBarChanged() {
        const statusPanels = this.gos.get('statusBar')?.statusPanels;
        const validStatusBarPanelsProvided = Array.isArray(statusPanels) && statusPanels.length > 0;
        this.setDisplayed(validStatusBarPanelsProvided);

        const existingStatusPanelsToReuse: Map<string, IStatusPanelComp> = new Map();

        if (validStatusBarPanelsProvided) {
            statusPanels.forEach((statusPanelConfig) => {
                const key = statusPanelConfig.key ?? statusPanelConfig.statusPanel;
                const existingStatusPanel = this.statusBarService.getStatusPanel(key);
                if (existingStatusPanel?.refresh) {
                    const newParams = this.gos.addGridCommonParams(statusPanelConfig.statusPanelParams ?? {});
                    const hasRefreshed = existingStatusPanel.refresh(newParams);
                    if (hasRefreshed) {
                        existingStatusPanelsToReuse.set(key, existingStatusPanel);
                        delete this.compDestroyFunctions[key];
                        _removeFromParent(existingStatusPanel.getGui());
                    }
                }
            });
        }

        this.resetStatusBar();
        if (validStatusBarPanelsProvided) {
            this.processStatusPanels(existingStatusPanelsToReuse);
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
        Object.values(this.compDestroyFunctions).forEach((func) => func());
        this.compDestroyFunctions = {};
    }

    private createAndRenderComponents(
        statusBarComponents: StatusPanelDef[],
        ePanelComponent: HTMLElement,
        existingStatusPanelsToReuse: Map<string, IStatusPanelComp>
    ) {
        const componentDetails: { key: string; promise: AgPromise<IStatusPanelComp> }[] = [];

        statusBarComponents.forEach((componentConfig) => {
            // default to the component name if no key supplied
            const key = componentConfig.key || componentConfig.statusPanel;
            const existingStatusPanel = existingStatusPanelsToReuse.get(key);
            let promise: AgPromise<IStatusPanelComp>;
            if (existingStatusPanel) {
                promise = AgPromise.resolve(existingStatusPanel);
            } else {
                const params: WithoutGridCommon<IStatusPanelParams> = {};

                const compDetails = this.userComponentFactory.getStatusPanelCompDetails(componentConfig, params);
                promise = compDetails.newAgStackInstance();

                if (!promise) {
                    return;
                }
            }

            componentDetails.push({
                key,
                promise,
            });
        });

        AgPromise.all(componentDetails.map((details) => details.promise)).then(() => {
            componentDetails.forEach((componentDetail) => {
                componentDetail.promise.then((component: IStatusPanelComp) => {
                    const destroyFunc = () => {
                        this.getContext().destroyBean(component);
                    };

                    if (this.isAlive()) {
                        this.statusBarService.registerStatusPanel(componentDetail.key, component);
                        ePanelComponent.appendChild(component.getGui());
                        this.compDestroyFunctions[componentDetail.key] = destroyFunc;
                    } else {
                        destroyFunc();
                    }
                });
            });
        });
    }
}
