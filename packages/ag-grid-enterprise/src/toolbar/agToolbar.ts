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
    private readonly compDestroyFunctions: Map<string, () => void> = new Map();
    private customKeyCounter = 0;

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

    private createSeparator(isRightStart: boolean): HTMLElement {
        const separator = document.createElement('div');
        separator.className = 'ag-toolbar-separator';
        if (isRightStart) {
            separator.classList.add('ag-toolbar-right-start');
        }
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
        let firstItem = pushRight;

        for (const itemConfig of toolbarItems) {
            if (itemConfig.key === 'separator') {
                eContainer.appendChild(this.createSeparator(firstItem));
                firstItem = false;
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
                this.mountComponent(key, existingItem, placeholder);
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
            gui.classList.toggle('ag-toolbar-right-start', placeholder.classList.contains('ag-toolbar-right-start'));
            placeholder.replaceWith(gui);
            const comp = component instanceof Component ? component : undefined;
            if (comp) {
                // Toggle display instead of removing from DOM to preserve order
                gui.style.display = comp.isDisplayed() ? '' : 'none';
                this.addManagedListeners(comp, {
                    displayChanged: () => {
                        const visible = comp.isDisplayed();
                        gui.style.display = visible ? '' : 'none';
                        this.reassignRightStartAnchor(gui, visible);
                    },
                });
                if (!comp.isDisplayed()) {
                    this.reassignRightStartAnchor(gui, false);
                }
            }
            this.compDestroyFunctions.set(key, destroyFunc);
        } else {
            _removeFromParent(placeholder);
            destroyFunc();
        }
    }

    /** Move the right-start anchor to the first visible right-aligned item */
    private reassignRightStartAnchor(gui: HTMLElement, nowVisible: boolean): void {
        const cls = 'ag-toolbar-right-start';
        if (!nowVisible && gui.classList.contains(cls)) {
            gui.classList.remove(cls);
            let next = gui.nextElementSibling as HTMLElement | null;
            while (next) {
                if (next.style.display !== 'none') {
                    next.classList.add(cls);
                    return;
                }
                next = next.nextElementSibling as HTMLElement | null;
            }
        } else if (nowVisible && !gui.classList.contains(cls)) {
            let prev = gui.previousElementSibling as HTMLElement | null;
            while (prev) {
                if (prev.classList.contains(cls)) {
                    return; // another visible item already anchors
                }
                prev = prev.previousElementSibling as HTMLElement | null;
            }
            gui.classList.add(cls);
        }
    }
}

export const AgToolbarSelector: ComponentSelector = {
    selector: 'AG-TOOLBAR',
    component: AgToolbar,
};
