import type {
    BeanCollection,
    ComponentSelector,
    ComponentType,
    ElementParams,
    IStatusPanelComp,
    IStatusPanelParams,
    StatusPanelDef,
    UserCompDetails,
    UserComponentFactory,
} from 'ag-grid-community';
import {
    AgPromise,
    Component,
    RefPlaceholder,
    _addGridCommonParams,
    _clearElement,
    _removeFromParent,
} from 'ag-grid-community';

import { agStatusBarCSS } from './agStatusBar.css-GENERATED';
import type { StatusBarService } from './statusBarService';

function getStatusPanelCompDetails(
    userCompFactory: UserComponentFactory,
    def: StatusPanelDef,
    params: IStatusPanelParams
): UserCompDetails<IStatusPanelComp> | undefined {
    return userCompFactory.getCompDetails(def, StatusPanelComponent, undefined, params, true);
}

const StatusPanelComponent: ComponentType = {
    name: 'statusPanel',
    optionalMethods: ['refresh'],
};

const AgStatusBarElement: ElementParams = {
    tag: 'div',
    cls: 'ag-status-bar',
    children: [
        {
            tag: 'div',
            ref: 'eStatusBarLeft',
            cls: 'ag-status-bar-left',
            role: 'status',
        },
        {
            tag: 'div',
            ref: 'eStatusBarCenter',
            cls: 'ag-status-bar-center',
            role: 'status',
        },
        {
            tag: 'div',
            ref: 'eStatusBarRight',
            cls: 'ag-status-bar-right',
            role: 'status',
        },
    ],
};
export class AgStatusBar extends Component {
    private userCompFactory: UserComponentFactory;
    private statusBarSvc: StatusBarService;
    private updateQueued: boolean = false;
    private panelsPromise: AgPromise<(void | null)[]> = AgPromise.resolve();

    public wireBeans(beans: BeanCollection) {
        this.userCompFactory = beans.userCompFactory;
        this.statusBarSvc = beans.statusBarSvc as StatusBarService;
    }

    private readonly eStatusBarLeft: HTMLElement = RefPlaceholder;
    private readonly eStatusBarCenter: HTMLElement = RefPlaceholder;
    private readonly eStatusBarRight: HTMLElement = RefPlaceholder;

    private compDestroyFunctions: { [key: string]: () => void } = {};

    constructor() {
        super(AgStatusBarElement);
        this.registerCSS(agStatusBarCSS);
    }

    public postConstruct(): void {
        this.processStatusPanels(new Map());
        this.addManagedPropertyListeners(['statusBar'], this.handleStatusBarChanged.bind(this));
    }

    private processStatusPanels(existingStatusPanelsToReuse: Map<string, IStatusPanelComp>): void {
        const statusPanels = this.gos.get('statusBar')?.statusPanels;
        if (statusPanels) {
            const leftStatusPanelComponents = statusPanels.filter(
                (componentConfig) => componentConfig.align === 'left'
            );
            const centerStatusPanelComponents = statusPanels.filter(
                (componentConfig) => componentConfig.align === 'center'
            );
            const rightStatusPanelComponents = statusPanels.filter(
                (componentConfig) => !componentConfig.align || componentConfig.align === 'right'
            );
            this.panelsPromise = AgPromise.all([
                this.createAndRenderComponents(
                    leftStatusPanelComponents,
                    this.eStatusBarLeft,
                    existingStatusPanelsToReuse
                ),
                this.createAndRenderComponents(
                    centerStatusPanelComponents,
                    this.eStatusBarCenter,
                    existingStatusPanelsToReuse
                ),
                this.createAndRenderComponents(
                    rightStatusPanelComponents,
                    this.eStatusBarRight,
                    existingStatusPanelsToReuse
                ),
            ]);
        } else {
            this.setDisplayed(false);
        }
    }

    private handleStatusBarChanged(): void {
        if (this.updateQueued) {
            return;
        }
        this.updateQueued = true;
        this.panelsPromise.then(() => {
            this.updateStatusBar();
            this.updateQueued = false;
        });
    }

    private updateStatusBar(): void {
        const statusPanels = this.gos.get('statusBar')?.statusPanels;
        const validStatusBarPanelsProvided = Array.isArray(statusPanels) && statusPanels.length > 0;
        this.setDisplayed(validStatusBarPanelsProvided);

        const existingStatusPanelsToReuse: Map<string, IStatusPanelComp> = new Map();

        if (validStatusBarPanelsProvided) {
            statusPanels.forEach((statusPanelConfig) => {
                const key = statusPanelConfig.key ?? statusPanelConfig.statusPanel;
                const existingStatusPanel = this.statusBarSvc.getStatusPanel(key);
                if (existingStatusPanel?.refresh) {
                    const newParams: IStatusPanelParams = _addGridCommonParams(this.gos, {
                        ...(statusPanelConfig.statusPanelParams ?? {}),
                        key,
                    });
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

    resetStatusBar(): void {
        _clearElement(this.eStatusBarLeft);
        _clearElement(this.eStatusBarCenter);
        _clearElement(this.eStatusBarRight);

        this.destroyComponents();
        this.statusBarSvc.unregisterAllComponents();
    }

    public override destroy(): void {
        this.destroyComponents();
        super.destroy();
    }

    private destroyComponents(): void {
        Object.values(this.compDestroyFunctions).forEach((func) => func());
        this.compDestroyFunctions = {};
    }

    private createAndRenderComponents(
        statusBarComponents: StatusPanelDef[],
        ePanelComponent: HTMLElement,
        existingStatusPanelsToReuse: Map<string, IStatusPanelComp>
    ): AgPromise<void> {
        const componentDetails: { key: string; promise: AgPromise<IStatusPanelComp> }[] = [];

        statusBarComponents.forEach((componentConfig) => {
            // default to the component name if no key supplied
            const key = componentConfig.key || componentConfig.statusPanel;
            const existingStatusPanel = existingStatusPanelsToReuse.get(key);
            let promise: AgPromise<IStatusPanelComp>;
            if (existingStatusPanel) {
                promise = AgPromise.resolve(existingStatusPanel);
            } else {
                const compDetails = getStatusPanelCompDetails(
                    this.userCompFactory,
                    componentConfig,
                    _addGridCommonParams(this.gos, { key })
                );

                if (compDetails == null) {
                    return;
                }
                promise = compDetails.newAgStackInstance();
            }

            componentDetails.push({
                key,
                promise,
            });
        });

        return AgPromise.all(componentDetails.map((details) => details.promise)).then(() => {
            componentDetails.forEach((componentDetail) => {
                componentDetail.promise.then((component: IStatusPanelComp) => {
                    const destroyFunc = () => {
                        this.destroyBean(component);
                    };

                    if (this.isAlive()) {
                        this.statusBarSvc.registerStatusPanel(componentDetail.key, component);
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

export const AgStatusBarSelector: ComponentSelector = {
    selector: 'AG-STATUS-BAR',
    component: AgStatusBar,
};
