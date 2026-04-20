import type {
    BeanCollection,
    ComponentSelector,
    ComponentType,
    ElementParams,
    FocusableContainer,
    IToolbarItemComp,
    IToolbarItemParams,
    Toolbar,
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
    _createElement,
    _findFocusableElements,
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
    private readonly toolbarItems: Map<string, IToolbarItemComp> = new Map();
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
        this.addManagedPropertyListeners(['toolbar'], this.updateToolbar.bind(this));

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
        const { key } = e;
        if (key !== KeyCode.LEFT && key !== KeyCode.RIGHT && key !== KeyCode.PAGE_HOME && key !== KeyCode.PAGE_END) {
            return;
        }

        const activeEl = _getActiveDomElement(this.beans) as HTMLElement;
        // Allow native caret navigation inside text inputs
        if (activeEl instanceof HTMLInputElement && (activeEl.type === 'text' || activeEl.type === 'search')) {
            return;
        }

        const items = _findFocusableElements(this.getGui());
        const currentIndex = items.indexOf(activeEl);
        if (currentIndex === -1) {
            return;
        }

        const rtl = this.gos.get('enableRtl');
        let nextIndex: number;
        switch (key) {
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

        nextIndex = Math.max(0, Math.min(nextIndex, items.length - 1));
        if (nextIndex !== currentIndex) {
            items[nextIndex].focus();
            e.preventDefault();
        }
    }

    private getValidItems(toolbar: Toolbar | undefined): ToolbarItemDef[] | undefined {
        if (!toolbar?.items) {
            return undefined;
        }
        // Reset counter so keyless custom items get stable positional keys across updates
        this.customKeyCounter = 0;
        const nextKey = () => `custom-toolbar-item-${this.customKeyCounter++}`;
        const seen = new Set<string>();
        return toolbar.items.reduce<ToolbarItemDef[]>((acc, item) => {
            const normalised = normaliseItem(item, nextKey);
            if (normalised.toolbarItem === 'separator') {
                acc.push(normalised);
                return acc;
            }
            const key = normalised.key ?? normalised.toolbarItem;
            if (!seen.has(key)) {
                seen.add(key);
                acc.push(normalised);
            }
            return acc;
        }, []);
    }

    private createItemParams(
        itemConfig: ToolbarItemDef,
        key: string,
        defaultDisplay: ToolbarDisplay
    ): IToolbarItemParams {
        return _addGridCommonParams(this.gos, {
            ...(itemConfig.toolbarItemParams ?? {}),
            key,
            display: itemConfig.display ?? defaultDisplay,
        });
    }

    private processToolbarItems(existingItemsToReuse: Map<string, IToolbarItemComp>): void {
        const toolbar = this.gos.get('toolbar');
        const items = this.getValidItems(toolbar);
        const validItemsProvided = Array.isArray(items) && items.length > 0;
        this.setDisplayed(validItemsProvided);

        if (!validItemsProvided) {
            return;
        }

        const leftItems: ToolbarItemDef[] = [];
        const rightItems: ToolbarItemDef[] = [];
        const defaultAlignment: 'left' | 'right' = toolbar?.alignment ?? (this.gos.get('enableRtl') ? 'right' : 'left');
        const defaultDisplay: ToolbarDisplay = toolbar?.display ?? 'icon';
        // Separators inherit the alignment of the preceding item, unless explicitly set
        let lastAlignment: 'left' | 'right' = defaultAlignment;
        for (const item of items) {
            const isSeparator = item.toolbarItem === 'separator';
            const alignment: 'left' | 'right' = item.alignment ?? (isSeparator ? lastAlignment : defaultAlignment);
            (alignment === 'right' ? rightItems : leftItems).push(item);
            if (!isSeparator) {
                lastAlignment = alignment;
            }
        }

        this.createAndRenderComponents(
            [...leftItems, ...rightItems],
            leftItems.length,
            existingItemsToReuse,
            defaultDisplay
        );
    }

    private updateToolbar(): void {
        const toolbar = this.gos.get('toolbar');
        const items = this.getValidItems(toolbar);
        const existingItemsToReuse: Map<string, IToolbarItemComp> = new Map();
        const defaultDisplay: ToolbarDisplay = toolbar?.display ?? 'icon';

        if (Array.isArray(items) && items.length > 0) {
            for (const itemConfig of items) {
                const key = itemConfig.key ?? itemConfig.toolbarItem;
                const existingItem = this.toolbarItems.get(key);
                if (existingItem?.refresh) {
                    const newParams = this.createItemParams(itemConfig, key, defaultDisplay);
                    const hasRefreshed = existingItem.refresh(newParams);
                    if (hasRefreshed) {
                        existingItemsToReuse.set(key, existingItem);
                        this.toolbarItems.delete(key);
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
        this.destroyToolbarItems();
    }

    public override destroy(): void {
        this.destroyToolbarItems();
        super.destroy();
    }

    private destroyToolbarItems(): void {
        for (const comp of this.toolbarItems.values()) {
            this.destroyBean(comp);
        }
        this.toolbarItems.clear();
    }

    private createSeparator(): HTMLElement {
        return _createElement({
            tag: 'div',
            cls: 'ag-toolbar-separator',
            attrs: { role: 'separator' },
        });
    }

    private createAndRenderComponents(
        toolbarItems: ToolbarItemDef[],
        rightStartIndex: number,
        existingItemsToReuse: Map<string, IToolbarItemComp>,
        defaultDisplay: ToolbarDisplay
    ): void {
        const eContainer = this.getGui();
        const hasRightItems = rightStartIndex < toolbarItems.length;

        for (let i = 0; i < toolbarItems.length; i++) {
            if (hasRightItems && i === rightStartIndex) {
                eContainer.appendChild(_createElement({ tag: 'div', cls: 'ag-toolbar-right-start' }));
            }

            const itemConfig = toolbarItems[i];

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

            const placeholder = _createElement({ tag: 'div' });
            eContainer.appendChild(placeholder);

            if (existingItem) {
                // Reused item already has a display listener — just re-insert into DOM
                placeholder.replaceWith(existingItem.getGui());
                this.toolbarItems.set(key, existingItem);
                continue;
            }

            const compDetails = getToolbarItemCompDetails(
                this.userCompFactory,
                itemConfig,
                this.createItemParams(itemConfig, key, defaultDisplay)
            );

            if (compDetails == null) {
                _removeFromParent(placeholder);
                continue;
            }

            compDetails.newAgStackInstance().then((component) => this.mountComponent(key, component, placeholder));
        }
    }

    private mountComponent(key: string, component: IToolbarItemComp | null, placeholder: HTMLElement): void {
        if (component == null) {
            _removeFromParent(placeholder);
            return;
        }

        // Placeholder was discarded by a rebuild or destroy — clean up the orphan component
        if (!this.isAlive() || !placeholder.isConnected) {
            _removeFromParent(placeholder);
            this.destroyBean(component);
            return;
        }

        this.toolbarItems.set(key, component);
        const gui = component.getGui();
        placeholder.replaceWith(gui);
        if (component instanceof Component) {
            // Toggle display instead of removing from DOM to preserve order
            gui.style.display = component.isDisplayed() ? '' : 'none';
            this.addManagedListeners(component, {
                displayChanged: () => {
                    gui.style.display = component.isDisplayed() ? '' : 'none';
                },
            });
        }
    }
}

export const AgToolbarSelector: ComponentSelector = {
    selector: 'AG-TOOLBAR',
    component: AgToolbar,
};
