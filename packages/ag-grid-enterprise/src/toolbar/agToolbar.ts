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
    filtersPanel: 'agFiltersPanelToolbarItem',
    find: 'agFindToolbarItem',
    menu: 'agMenuToolbarItem',
    pivotPanel: 'agPivotPanelToolbarItem',
    quickFilter: 'agQuickFilterToolbarItem',
    resetColumns: 'agResetColumnsToolbarItem',
    rowGroupPanel: 'agRowGroupPanelToolbarItem',
};

function normaliseItem(item: ToolbarItemDef | string, nextKey: () => string): ToolbarItemDef {
    if (typeof item === 'string') {
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
    private readonly compDestroyFunctions: Map<string, () => void> = new Map();
    private customKeyCounter: number = 0;

    public wireBeans(beans: BeanCollection) {
        this.userCompFactory = beans.userCompFactory;
    }

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

        // Don't intercept navigation keys in text inputs — allow normal caret navigation
        if (activeEl instanceof HTMLInputElement && (activeEl.type === 'text' || activeEl.type === 'search')) {
            if (
                e.key === KeyCode.LEFT ||
                e.key === KeyCode.RIGHT ||
                e.key === KeyCode.PAGE_HOME ||
                e.key === KeyCode.PAGE_END
            ) {
                return;
            }
        }

        const items: HTMLElement[] = Array.from(
            eGui.querySelectorAll<HTMLElement>(
                'button:not(:disabled), input:not(:disabled), [role="button"]:not([aria-disabled="true"])'
            )
        ).filter((el) => el.offsetParent !== null);
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
        // Reset counter so keyless custom items get stable positional keys across updates
        this.customKeyCounter = 0;
        const nextKey = () => `custom-toolbar-item-${this.customKeyCounter++}`;
        const seen = new Set<string>();
        return toolbar.items
            .map((item) => normaliseItem(item, nextKey))
            .filter((item) => {
                const key = item.key ?? item.toolbarItem;
                if (item.toolbarItem === 'separator') {
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

    private createItemParams(itemConfig: ToolbarItemDef, key: string): IToolbarItemParams {
        return _addGridCommonParams(this.gos, {
            ...(itemConfig.toolbarItemParams ?? {}),
            key,
            display: this.resolveDisplay(itemConfig),
        });
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
                const isSeparator = item.toolbarItem === 'separator';
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
        const existingItemsToReuse: Map<string, IToolbarItemComp> = new Map();

        if (Array.isArray(items) && items.length > 0) {
            for (const itemConfig of items) {
                const key = itemConfig.key ?? itemConfig.toolbarItem;
                const existingItem = this.toolbarItems.get(key);
                if (existingItem?.refresh) {
                    const newParams = this.createItemParams(itemConfig, key);
                    const hasRefreshed = existingItem.refresh(newParams);
                    if (hasRefreshed) {
                        existingItemsToReuse.set(key, existingItem);
                        this.compDestroyFunctions.delete(key);
                        _removeFromParent(existingItem.getGui());
                    }
                }
            }
        }

        this.resetToolbar();
        this.processToolbarItems(existingItemsToReuse);
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
        for (const func of this.compDestroyFunctions.values()) {
            func();
        }
        this.compDestroyFunctions.clear();
    }

    private createSeparator(): HTMLElement {
        const separator = document.createElement('div');
        separator.className = 'ag-toolbar-separator';
        separator.setAttribute('role', 'separator');
        return separator;
    }

    private createAndRenderComponents(
        toolbarItems: ToolbarItemDef[],
        eContainer: HTMLElement,
        existingItemsToReuse: Map<string, IToolbarItemComp>,
        pushRight: boolean = false
    ): Promise<void> {
        const promises: Promise<void>[] = [];

        if (pushRight) {
            const spacer = document.createElement('div');
            spacer.className = 'ag-toolbar-right-start';
            eContainer.appendChild(spacer);
        }

        for (const itemConfig of toolbarItems) {
            if (itemConfig.toolbarItem === 'separator') {
                eContainer.appendChild(this.createSeparator());
                continue;
            }

            const key = itemConfig.key ?? itemConfig.toolbarItem;

            if (itemConfig.toolbarItem == null) {
                _warn(301, { key });
                continue;
            }

            const existingItem = existingItemsToReuse.get(key);

            const placeholder = document.createElement('div');
            eContainer.appendChild(placeholder);

            if (existingItem) {
                // Reused item already has a display listener — just re-insert into DOM
                placeholder.replaceWith(existingItem.getGui());
                this.toolbarItems.set(key, existingItem);
                this.compDestroyFunctions.set(key, () => this.destroyBean(existingItem));
            } else {
                const compDetails = getToolbarItemCompDetails(
                    this.userCompFactory,
                    itemConfig,
                    this.createItemParams(itemConfig, key)
                );

                if (compDetails == null) {
                    _removeFromParent(placeholder);
                    continue;
                }

                promises.push(
                    Promise.resolve(compDetails.newAgStackInstance()).then((component) => {
                        this.mountComponent(key, component, placeholder);
                    })
                );
            }
        }

        return promises.length > 0 ? Promise.all(promises).then(() => {}) : Promise.resolve();
    }

    private mountComponent(key: string, component: IToolbarItemComp | null, placeholder: HTMLElement): void {
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
            this.compDestroyFunctions.set(key, destroyFunc);
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
