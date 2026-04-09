import type {
    BeanCollection,
    ComponentSelector,
    ComponentType,
    ElementParams,
    FocusableContainer,
    IToolbarItemComp,
    IToolbarItemParams,
    ToolbarDisplay,
    ToolbarItemDef,
    UserCompDetails,
    UserComponentFactory,
} from 'ag-grid-community';
import {
    AgPromise,
    Component,
    RefPlaceholder,
    _addFocusableContainerListener,
    _addGridCommonParams,
    _clearElement,
    _removeFromParent,
} from 'ag-grid-community';

import agToolbarCSS from './agToolbar.css';
import type { ToolbarService } from './toolbarService';

const BUILT_IN_ITEMS: Record<string, string> = {
    autoSizeAll: 'agAutoSizeAllToolbarItem',
    columnChooser: 'agColumnChooserToolbarItem',
    columnsPanel: 'agColumnsPanelToolbarItem',
    csvExport: 'agCsvExportToolbarItem',
    excelExport: 'agExcelExportToolbarItem',
    export: 'agExportToolbarItem',
    filtersPanel: 'agFiltersPanelToolbarItem',
    find: 'agFindToolbarItem',
    pivotPanel: 'agPivotPanelToolbarItem',
    quickFilter: 'agQuickFilterToolbarItem',
    resetColumns: 'agResetColumnsToolbarItem',
    rowGroupPanel: 'agRowGroupPanelToolbarItem',
};

function normaliseItem(item: ToolbarItemDef | string): ToolbarItemDef {
    if (typeof item === 'string') {
        const component = BUILT_IN_ITEMS[item] ?? item;
        return { component, key: item };
    }
    if (typeof item.component === 'string' && BUILT_IN_ITEMS[item.component]) {
        return { ...item, key: item.key ?? item.component, component: BUILT_IN_ITEMS[item.component] };
    }
    return item;
}

function getToolbarItemCompDetails(
    userCompFactory: UserComponentFactory,
    def: ToolbarItemDef,
    params: IToolbarItemParams
): UserCompDetails<IToolbarItemComp> | undefined {
    return userCompFactory.getCompDetails(def, ToolbarItemComponent, undefined, params, true);
}

const ToolbarItemComponent: ComponentType = {
    name: 'component',
    optionalMethods: ['refresh'],
};

const AgToolbarElement: ElementParams = {
    tag: 'div',
    cls: 'ag-toolbar',
    children: [
        {
            tag: 'div',
            ref: 'eToolbarLeft',
            cls: 'ag-toolbar-left',
            role: 'toolbar',
        },
        {
            tag: 'div',
            ref: 'eToolbarRight',
            cls: 'ag-toolbar-right',
            role: 'toolbar',
        },
    ],
};

class AgToolbar extends Component implements FocusableContainer {
    private userCompFactory: UserComponentFactory;
    private toolbarSvc: ToolbarService;
    private updateQueued: boolean = false;
    private itemsPromise: AgPromise<(void | null)[]> = AgPromise.resolve();

    public wireBeans(beans: BeanCollection) {
        this.userCompFactory = beans.userCompFactory;
        this.toolbarSvc = beans.toolbarSvc as ToolbarService;
    }

    private readonly eToolbarLeft: HTMLElement = RefPlaceholder;
    private readonly eToolbarRight: HTMLElement = RefPlaceholder;

    private compDestroyFunctions: { [key: string]: () => void } = {};

    constructor() {
        super(AgToolbarElement);
        this.registerCSS(agToolbarCSS);
    }

    public postConstruct(): void {
        this.processToolbarItems(new Map());
        this.addManagedPropertyListeners(['toolbar'], this.handleToolbarChanged.bind(this));
        _addFocusableContainerListener(this.beans, this, this.getGui());
    }

    public getFocusableContainerName(): 'toolbar' {
        return 'toolbar';
    }

    private getValidItems(): ToolbarItemDef[] | undefined {
        const toolbar = this.gos.get('toolbar');
        if (!toolbar?.items) {
            return undefined;
        }
        const seen = new Set<string>();
        return toolbar.items.map(normaliseItem).filter((item) => {
            const key = item.key ?? item.component;
            if (key === 'separator') {
                return true;
            }
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    private resolveDisplay(itemDef: ToolbarItemDef): ToolbarDisplay {
        return itemDef.display ?? this.gos.get('toolbar')?.display ?? 'icon';
    }

    private processToolbarItems(existingItemsToReuse: Map<string, IToolbarItemComp>): void {
        const items = this.getValidItems();
        if (items) {
            const leftItems: ToolbarItemDef[] = [];
            const rightItems: ToolbarItemDef[] = [];
            let lastAlignment: 'left' | 'right' = 'left';
            for (const item of items) {
                const alignment: 'left' | 'right' = item.key === 'separator' ? lastAlignment : item.alignment ?? 'left';
                (alignment === 'right' ? rightItems : leftItems).push(item);
                if (item.key !== 'separator') {
                    lastAlignment = alignment;
                }
            }
            this.itemsPromise = AgPromise.all([
                this.createAndRenderComponents(leftItems, this.eToolbarLeft, existingItemsToReuse),
                this.createAndRenderComponents(rightItems, this.eToolbarRight, existingItemsToReuse),
            ]);
        } else {
            this.setDisplayed(false);
        }
    }

    private handleToolbarChanged(): void {
        if (this.updateQueued) {
            return;
        }
        this.updateQueued = true;
        this.itemsPromise.then(() => {
            this.updateToolbar();
            this.updateQueued = false;
        });
    }

    private updateToolbar(): void {
        const items = this.getValidItems();
        const validItemsProvided = Array.isArray(items) && items.length > 0;
        this.setDisplayed(validItemsProvided);

        const existingItemsToReuse: Map<string, IToolbarItemComp> = new Map();

        if (validItemsProvided) {
            for (const itemConfig of items) {
                const key = itemConfig.key ?? itemConfig.component;
                const existingItem = this.toolbarSvc.getToolbarItem(key);
                if (existingItem?.refresh) {
                    const newParams: IToolbarItemParams = _addGridCommonParams(this.gos, {
                        ...(itemConfig.toolbarItemParams ?? {}),
                        key,
                        display: this.resolveDisplay(itemConfig),
                    });
                    const hasRefreshed = existingItem.refresh(newParams);
                    if (hasRefreshed) {
                        existingItemsToReuse.set(key, existingItem);
                        delete this.compDestroyFunctions[key];
                        _removeFromParent(existingItem.getGui());
                    }
                }
            }
        }

        this.resetToolbar();
        if (validItemsProvided) {
            this.processToolbarItems(existingItemsToReuse);
        }
    }

    private resetToolbar(): void {
        _clearElement(this.eToolbarLeft);
        _clearElement(this.eToolbarRight);

        this.destroyComponents();
        this.toolbarSvc.unregisterAllComponents();
    }

    public override destroy(): void {
        this.destroyComponents();
        super.destroy();
    }

    private destroyComponents(): void {
        for (const func of Object.values(this.compDestroyFunctions)) {
            func();
        }
        this.compDestroyFunctions = {};
    }

    private createAndRenderComponents(
        toolbarItems: ToolbarItemDef[],
        eContainer: HTMLElement,
        existingItemsToReuse: Map<string, IToolbarItemComp>
    ): AgPromise<void> {
        const componentDetails: {
            key: string;
            placeholder: HTMLElement;
            eContainer: HTMLElement;
            promise: AgPromise<IToolbarItemComp>;
        }[] = [];

        for (const itemConfig of toolbarItems) {
            if (itemConfig.key === 'separator') {
                const separator = document.createElement('div');
                separator.className = 'ag-toolbar-separator';
                separator.setAttribute('role', 'separator');
                eContainer.appendChild(separator);
                continue;
            }

            const key = itemConfig.key || itemConfig.component;
            const existingItem = existingItemsToReuse.get(key);
            let promise: AgPromise<IToolbarItemComp>;
            if (existingItem) {
                promise = AgPromise.resolve(existingItem);
            } else {
                const compDetails = getToolbarItemCompDetails(
                    this.userCompFactory,
                    itemConfig,
                    _addGridCommonParams(this.gos, {
                        ...(itemConfig.toolbarItemParams ?? {}),
                        key,
                        display: this.resolveDisplay(itemConfig),
                    })
                );

                if (compDetails == null) {
                    continue;
                }
                promise = compDetails.newAgStackInstance();
            }

            const placeholder = document.createElement('div');
            eContainer.appendChild(placeholder);

            componentDetails.push({
                key,
                placeholder,
                eContainer,
                promise,
            });
        }

        return AgPromise.all(componentDetails.map((details) => details.promise)).then((components) => {
            if (!components) {
                return;
            }
            for (let i = 0; i < componentDetails.length; i++) {
                const componentDetail = componentDetails[i];
                const component = components[i];
                if (component == null) {
                    continue;
                }
                const destroyFunc = () => {
                    this.destroyBean(component);
                };

                if (this.isAlive()) {
                    const comp = component as unknown as Component;
                    this.toolbarSvc.registerToolbarItem(componentDetail.key, component);
                    if (comp.isDisplayed()) {
                        componentDetail.placeholder.replaceWith(comp.getGui());
                    } else {
                        _removeFromParent(componentDetail.placeholder);
                    }
                    this.addManagedListeners(comp, {
                        displayChanged: () => {
                            const gui = comp.getGui();
                            if (comp.isDisplayed()) {
                                if (!gui.parentElement) {
                                    componentDetail.eContainer.appendChild(gui);
                                }
                            } else {
                                _removeFromParent(gui);
                            }
                        },
                    });
                    this.compDestroyFunctions[componentDetail.key] = destroyFunc;
                } else {
                    _removeFromParent(componentDetail.placeholder);
                    destroyFunc();
                }
            }
        });
    }
}

export const AgToolbarSelector: ComponentSelector = {
    selector: 'AG-TOOLBAR',
    component: AgToolbar,
};
