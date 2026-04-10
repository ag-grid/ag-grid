import type {
    BeanCollection,
    ComponentSelector,
    ComponentType,
    ElementParams,
    FocusableContainer,
    IToolbarItemComp,
    IToolbarItemParams,
    ToolbarDisplay,
    ToolbarItemComponentName,
    ToolbarItemDef,
    UserCompDetails,
    UserComponentFactory,
} from 'ag-grid-community';
import {
    Component,
    KeyCode,
    ManagedFocusFeature,
    RefPlaceholder,
    _addFocusableContainerListener,
    _addGridCommonParams,
    _clearElement,
    _focusNextGridCoreContainer,
    _getActiveDomElement,
    _removeFromParent,
    _skipFocusableContainerListenerForAgGrid,
} from 'ag-grid-community';

import agToolbarCSS from './agToolbar.css';
import type { ToolbarService } from './toolbarService';

const BUILT_IN_ITEMS: Record<string, ToolbarItemComponentName> = {
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

let customKeyCounter = 0;

function normaliseItem(item: ToolbarItemDef | string): ToolbarItemDef {
    if (typeof item === 'string') {
        const toolbarItem = BUILT_IN_ITEMS[item] ?? item;
        return { toolbarItem, key: item };
    }
    if (typeof item.toolbarItem === 'string' && BUILT_IN_ITEMS[item.toolbarItem]) {
        return { ...item, key: item.key ?? item.toolbarItem, toolbarItem: BUILT_IN_ITEMS[item.toolbarItem] };
    }
    if (item.key == null) {
        const key =
            typeof item.toolbarItem === 'string' ? item.toolbarItem : `custom-toolbar-item-${customKeyCounter++}`;
        return { ...item, key };
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
    name: 'toolbarItem',
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
    private itemsPromise: Promise<void> = Promise.resolve();

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
        const eGui = this.getGui();

        this.processToolbarItems(new Map());
        this.addManagedPropertyListeners(['toolbar'], this.handleToolbarChanged.bind(this));

        this.createManagedBean(
            new ManagedFocusFeature(eGui, {
                onTabKeyDown: this.onTabKeyDown.bind(this),
                handleKeyDown: this.handleKeyDown.bind(this),
            })
        );

        _addFocusableContainerListener(this.beans, this, eGui);

        const tabIndex = String(this.gos.get('tabIndex') ?? 0);
        this.addManagedElementListeners(eGui, {
            focusin: (e: FocusEvent) => {
                const target = e.target as HTMLElement;
                if (target.matches('.ag-toolbar-button, .ag-toolbar-input-field')) {
                    eGui.querySelectorAll<HTMLElement>('.ag-toolbar-button, .ag-toolbar-input-field').forEach((el) =>
                        el.setAttribute('tabindex', '-1')
                    );
                    target.setAttribute('tabindex', tabIndex);
                }
            },
        });
    }

    public getFocusableContainerName(): 'toolbar' {
        return 'toolbar';
    }

    private onTabKeyDown(e: KeyboardEvent): void {
        if (e.defaultPrevented) {
            return;
        }
        const backwards = e.shiftKey;
        if (_focusNextGridCoreContainer(this.beans, backwards, true)) {
            e.preventDefault();
            return;
        }
        _skipFocusableContainerListenerForAgGrid(e);
    }

    private handleKeyDown(e: KeyboardEvent): void {
        const activeEl = _getActiveDomElement(this.beans) as HTMLElement;
        const eGui = this.getGui();
        if (!eGui.contains(activeEl)) {
            return;
        }

        const items: HTMLElement[] = Array.from(
            eGui.querySelectorAll<HTMLElement>(
                '.ag-toolbar-button:not(:disabled), .ag-toolbar-input-field:not(:disabled)'
            )
        );
        const currentIndex = items.indexOf(activeEl);
        if (currentIndex === -1) {
            return;
        }

        const rtl = this.gos.get('enableRtl');
        let nextIndex: number | null = null;

        switch (e.key) {
            case KeyCode.LEFT:
                nextIndex = rtl ? currentIndex + 1 : currentIndex - 1;
                break;
            case KeyCode.RIGHT:
                nextIndex = rtl ? currentIndex - 1 : currentIndex + 1;
                break;
            case KeyCode.PAGE_HOME:
                nextIndex = 0;
                break;
            case KeyCode.PAGE_END:
                nextIndex = items.length - 1;
                break;
        }

        if (nextIndex === null) {
            return;
        }

        nextIndex = Math.max(0, Math.min(nextIndex, items.length - 1));
        if (nextIndex !== currentIndex) {
            items[nextIndex].focus();
            e.preventDefault();
        }
    }

    private initRovingTabindex(): void {
        const eGui = this.getGui();
        const items = eGui.querySelectorAll<HTMLElement>('.ag-toolbar-button, .ag-toolbar-input-field');
        items.forEach((el, i) => el.setAttribute('tabindex', i === 0 ? '0' : '-1'));
    }

    private getValidItems(): ToolbarItemDef[] | undefined {
        const toolbar = this.gos.get('toolbar');
        if (!toolbar?.items) {
            return undefined;
        }
        const seen = new Set<string>();
        return toolbar.items.map(normaliseItem).filter((item) => {
            const key = item.key ?? item.toolbarItem;
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
        const validItemsProvided = Array.isArray(items) && items.length > 0;
        this.setDisplayed(validItemsProvided);

        if (validItemsProvided) {
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
            this.itemsPromise = Promise.all([
                this.createAndRenderComponents(leftItems, this.eToolbarLeft, existingItemsToReuse),
                this.createAndRenderComponents(rightItems, this.eToolbarRight, existingItemsToReuse),
            ]).then(() => this.initRovingTabindex());
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
                const key = itemConfig.key ?? itemConfig.toolbarItem;
                const existingItem = this.toolbarSvc.getToolbarItem(key);
                if (existingItem?.refresh) {
                    const newParams: IToolbarItemParams = _addGridCommonParams(this.gos, {
                        ...(itemConfig.toolbarItemParams ?? {}),
                        key,
                        display: this.resolveDisplay(itemConfig),
                        disabled: itemConfig.disabled ?? false,
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
    ): Promise<void> {
        const promises: Promise<void>[] = [];

        for (const itemConfig of toolbarItems) {
            if (itemConfig.key === 'separator') {
                const separator = document.createElement('div');
                separator.className = 'ag-toolbar-separator';
                separator.setAttribute('role', 'separator');
                eContainer.appendChild(separator);
                continue;
            }

            const key = itemConfig.key || itemConfig.toolbarItem;
            const existingItem = existingItemsToReuse.get(key);

            const placeholder = document.createElement('div');
            eContainer.appendChild(placeholder);

            if (existingItem) {
                this.mountComponent(key, existingItem, placeholder, eContainer);
            } else {
                const compDetails = getToolbarItemCompDetails(
                    this.userCompFactory,
                    itemConfig,
                    _addGridCommonParams(this.gos, {
                        ...(itemConfig.toolbarItemParams ?? {}),
                        key,
                        display: this.resolveDisplay(itemConfig),
                        disabled: itemConfig.disabled ?? false,
                    })
                );

                if (compDetails == null) {
                    _removeFromParent(placeholder);
                    continue;
                }

                promises.push(
                    new Promise<void>((resolve) => {
                        compDetails.newAgStackInstance().then((component) => {
                            this.mountComponent(key, component, placeholder, eContainer);
                            resolve();
                        });
                    })
                );
            }
        }

        return promises.length > 0 ? Promise.all(promises).then(() => {}) : Promise.resolve();
    }

    private mountComponent(
        key: string,
        component: IToolbarItemComp | null,
        placeholder: HTMLElement,
        eContainer: HTMLElement
    ): void {
        if (component == null) {
            _removeFromParent(placeholder);
            return;
        }

        const destroyFunc = () => {
            this.destroyBean(component);
        };

        if (this.isAlive()) {
            this.toolbarSvc.registerToolbarItem(key, component);
            const comp = component instanceof Component ? component : undefined;
            if (!comp || comp.isDisplayed()) {
                placeholder.replaceWith(component.getGui());
            } else {
                _removeFromParent(placeholder);
            }
            if (comp) {
                this.addManagedListeners(comp, {
                    displayChanged: () => {
                        const gui = comp.getGui();
                        if (comp.isDisplayed()) {
                            if (!gui.parentElement) {
                                eContainer.appendChild(gui);
                            }
                        } else {
                            _removeFromParent(gui);
                        }
                    },
                });
            }
            this.compDestroyFunctions[key] = destroyFunc;
        } else {
            _removeFromParent(placeholder);
            destroyFunc();
        }
    }
}

export const AgToolbarSelector: ComponentSelector = {
    selector: 'AG-TOOLBAR',
    component: AgToolbar,
};
