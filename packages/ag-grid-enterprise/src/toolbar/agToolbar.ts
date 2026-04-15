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
    _addFocusableContainerListener,
    _addGridCommonParams,
    _clearElement,
    _getActiveDomElement,
    _removeFromParent,
    _warn,
} from 'ag-grid-community';

import agToolbarCSS from './agToolbar.css';

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

function normaliseItem(item: ToolbarItemDef | string, nextKey: () => string): ToolbarItemDef {
    if (typeof item === 'string') {
        if (item !== 'separator' && !BUILT_IN_ITEMS[item]) {
            _warn(302, { name: item, available: Object.keys(BUILT_IN_ITEMS).join(', ') });
        }
        const toolbarItem = BUILT_IN_ITEMS[item] ?? item;
        return { toolbarItem, key: item };
    }
    if (typeof item.toolbarItem === 'string' && BUILT_IN_ITEMS[item.toolbarItem]) {
        return { ...item, key: item.key ?? item.toolbarItem, toolbarItem: BUILT_IN_ITEMS[item.toolbarItem] };
    }
    if (item.key == null) {
        const key = typeof item.toolbarItem === 'string' ? item.toolbarItem : nextKey();
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
    role: 'toolbar',
};

class AgToolbar extends Component implements FocusableContainer {
    private userCompFactory: UserComponentFactory;
    private updateQueued: boolean = false;
    private itemsPromise: Promise<void> = Promise.resolve();
    private readonly toolbarItems: Map<string, IToolbarItemComp> = new Map();
    private customKeyCounter = 0;

    public wireBeans(beans: BeanCollection) {
        this.userCompFactory = beans.userCompFactory;
    }

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
    }

    public getFocusableContainerName(): 'toolbar' {
        return 'toolbar';
    }

    private onTabKeyDown(_e: KeyboardEvent): void {
        // Allow native tab order between toolbar items
    }

    private handleKeyDown(e: KeyboardEvent): void {
        const activeEl = _getActiveDomElement(this.beans) as HTMLElement;
        const eGui = this.getGui();
        if (!eGui.contains(activeEl)) {
            return;
        }

        const items: HTMLElement[] = Array.from(
            eGui.querySelectorAll<HTMLElement>(
                'button:not(:disabled), input:not(:disabled), [role="button"]:not([aria-disabled="true"])'
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

    private getValidItems(): ToolbarItemDef[] | undefined {
        const toolbar = this.gos.get('toolbar');
        if (!toolbar?.items) {
            return undefined;
        }
        const nextKey = () => `custom-toolbar-item-${this.customKeyCounter++}`;
        const seen = new Set<string>();
        return toolbar.items
            .map((item) => normaliseItem(item, nextKey))
            .filter((item) => {
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
            const eGui = this.getGui();
            const leftItems: ToolbarItemDef[] = [];
            const rightItems: ToolbarItemDef[] = [];
            // Separators inherit the alignment of the preceding item, unless explicitly set
            let lastAlignment: 'left' | 'right' = 'left';
            for (const item of items) {
                const isSeparator = item.key === 'separator';
                const alignment: 'left' | 'right' = item.alignment ?? (isSeparator ? lastAlignment : 'left');
                (alignment === 'right' ? rightItems : leftItems).push(item);
                if (!isSeparator) {
                    lastAlignment = alignment;
                }
            }

            this.itemsPromise = this.createAndRenderComponents(leftItems, eGui, existingItemsToReuse).then(() => {
                if (rightItems.length > 0) {
                    return this.createAndRenderComponents(rightItems, eGui, existingItemsToReuse, true);
                }
            });
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
                const existingItem = this.toolbarItems.get(key);
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
        _clearElement(this.getGui());

        this.destroyComponents();
        this.toolbarItems.clear();
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
        existingItemsToReuse: Map<string, IToolbarItemComp>,
        pushRight: boolean = false
    ): Promise<void> {
        const promises: Promise<void>[] = [];
        let firstItem = pushRight;

        for (const itemConfig of toolbarItems) {
            if (itemConfig.key === 'separator') {
                const separator = document.createElement('div');
                separator.className = 'ag-toolbar-separator';
                if (firstItem) {
                    separator.classList.add('ag-toolbar-right-start');
                    firstItem = false;
                }
                separator.setAttribute('role', 'separator');
                eContainer.appendChild(separator);
                continue;
            }

            const key = itemConfig.key || itemConfig.toolbarItem;

            if (itemConfig.toolbarItem == null) {
                _warn(301, { key });
                continue;
            }

            const existingItem = existingItemsToReuse.get(key);

            const placeholder = document.createElement('div');
            if (firstItem) {
                placeholder.classList.add('ag-toolbar-right-start');
                firstItem = false;
            }
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
        _eContainer: HTMLElement
    ): void {
        if (component == null) {
            _removeFromParent(placeholder);
            return;
        }

        const destroyFunc = () => {
            this.destroyBean(component);
        };

        if (this.isAlive()) {
            this.toolbarItems.set(key, component);
            const gui = component.getGui();
            gui.classList.toggle('ag-toolbar-right-start', placeholder.classList.contains('ag-toolbar-right-start'));
            placeholder.replaceWith(gui);
            const comp = component instanceof Component ? component : undefined;
            if (comp) {
                // Toggle display instead of removing from DOM to preserve order
                gui.style.display = comp.isDisplayed() ? '' : 'none';
                this.addManagedListeners(comp, {
                    displayChanged: () => {
                        gui.style.display = comp.isDisplayed() ? '' : 'none';
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
