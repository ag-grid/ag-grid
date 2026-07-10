import {
    _clearElement,
    _findFocusableElements,
    _getActiveDomElement,
    _removeFromParent,
    _scrollHorizontallyToShow,
} from 'ag-stack';

import type {
    ComponentSelector,
    ComponentType,
    ElementParams,
    FocusableContainer,
    IToolbarComp,
    IToolbarItem,
    IToolbarItemComp,
    IToolbarItemParams,
    IconName,
    Toolbar,
    ToolbarButtonItemDef,
    ToolbarItemActionParams,
    ToolbarItemDef,
    ToolbarMenuBuiltInItemDef,
} from 'ag-grid-community';
import {
    Component,
    KeyCode,
    ManagedFocusFeature,
    _addFocusableContainerListener,
    _addGridCommonParams,
    _clamp,
    _createElement,
    _unwrapUserComp,
} from 'ag-grid-community';

import agToolbarCSS from './agToolbar.css';

/**
 * The flat shape every toolbar item is coerced into before rendering.
 * `key` is always populated; `toolbarItem` may still be absent if the user
 * supplied a definition without any actionable fields (warned downstream).
 */
interface NormalisedToolbarItem {
    toolbarItem?: unknown;
    toolbarItemParams?: unknown;
    alignment?: 'left' | 'right';
    key: string;
    label?: string;
    tooltip?: string;
    icon?: IconName;
    action?: (params: ToolbarItemActionParams) => void;
}

function normaliseItem(item: ToolbarItemDef | string, nextKey: () => string): NormalisedToolbarItem {
    if (typeof item === 'string') {
        return { toolbarItem: item, key: item };
    }

    let toolbarItem: unknown = item.toolbarItem;
    let toolbarItemParams: unknown = item.toolbarItemParams;
    let label: string | undefined;
    let tooltip: string | undefined;
    let icon: IconName | undefined;
    let action: ((params: ToolbarItemActionParams) => void) | undefined;

    if (toolbarItem == null) {
        ({ label, tooltip, icon, action } = item as ToolbarButtonItemDef);
        if (action != null || label != null || icon != null) {
            toolbarItem = 'agButtonToolbarItem';
            toolbarItemParams = undefined;
        }
    } else if (toolbarItem === 'agMenuToolbarItem') {
        ({ label, tooltip, icon } = item as ToolbarMenuBuiltInItemDef);
    }

    return {
        toolbarItem,
        toolbarItemParams,
        alignment: item.alignment,
        key: item.key ?? nextKey(),
        label,
        tooltip,
        icon,
        action,
    };
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

class AgToolbar extends Component implements FocusableContainer, IToolbarComp {
    private readonly toolbarItems: Map<string, IToolbarItemComp> = new Map();
    private nextKey: number = 0;
    // Incremented on each rebuild so stale async resolves from a previous generation can be discarded
    private generation: number = 0;

    constructor() {
        super(AgToolbarElement);
        this.registerCSS(agToolbarCSS);
    }

    public postConstruct(): void {
        const eGui = this.getGui();

        this.beans.toolbar!.setToolbar(this);

        this.processToolbarItems();
        this.addManagedPropertyListeners(['toolbar'], this.updateToolbar.bind(this));

        this.createManagedBean(
            new ManagedFocusFeature(eGui, {
                onTabKeyDown: this.onTabKeyDown.bind(this),
                handleKeyDown: this.handleKeyDown.bind(this),
            })
        );

        // The toolbar clips overflow, so a focused item that sits outside the visible area
        // would otherwise appear to lose focus. Scroll it back into view on focusin.
        this.addManagedElementListeners(eGui, {
            focusin: this.ensureFocusedItemVisible.bind(this),
        });

        _addFocusableContainerListener(this.beans, this, eGui);
    }

    private ensureFocusedItemVisible(e: FocusEvent): void {
        const eGui = this.getGui();
        const target = e.target as HTMLElement | null;
        if (!target || !eGui.contains(target) || target === eGui) {
            return;
        }
        _scrollHorizontallyToShow(target);
    }

    public getFocusableContainerName(): 'toolbar' {
        return 'toolbar';
    }

    public getToolbarItemInstance<T = IToolbarItem>(key: string): T | undefined {
        const comp = this.toolbarItems.get(key);
        if (!comp) {
            return undefined;
        }
        return _unwrapUserComp(comp) as T | undefined;
    }

    private onTabKeyDown(_e: KeyboardEvent): void {
        // Allow native tab order between toolbar items
    }

    private handleKeyDown(e: KeyboardEvent): void {
        const activeEl = _getActiveDomElement(this.beans) as HTMLElement;
        // Let inputs handle their own key behaviour (caret, typing, arrow keys, etc.)
        if (activeEl instanceof HTMLInputElement) {
            return;
        }

        const { key } = e;
        if (key !== KeyCode.LEFT && key !== KeyCode.RIGHT && key !== KeyCode.PAGE_HOME && key !== KeyCode.PAGE_END) {
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

        nextIndex = _clamp(nextIndex, 0, items.length - 1);
        if (nextIndex !== currentIndex) {
            items[nextIndex].focus();
            e.preventDefault();
        }
    }

    private getValidItems(toolbar: Toolbar | undefined): NormalisedToolbarItem[] | undefined {
        if (!toolbar?.items) {
            return undefined;
        }
        // Reset counter so keyless items get stable positional keys across updates
        this.nextKey = 0;
        const nextKey = () => `toolbar-item-${this.nextKey++}`;
        return toolbar.items.map((item) => normaliseItem(item, nextKey));
    }

    private createItemParams(itemConfig: NormalisedToolbarItem, key: string): IToolbarItemParams {
        const { toolbarItem: _, ...rest } = itemConfig;
        return _addGridCommonParams(this.gos, { ...rest, key }) as IToolbarItemParams;
    }

    private processToolbarItems(): void {
        const toolbar = this.gos.get('toolbar');
        const items = this.getValidItems(toolbar);
        const validItemsProvided = Array.isArray(items) && items.length > 0;
        this.setDisplayed(validItemsProvided);

        if (!validItemsProvided) {
            return;
        }

        const leftItems: NormalisedToolbarItem[] = [];
        const rightItems: NormalisedToolbarItem[] = [];
        // Alignment is semantic, not physical — flex mirrors layout in RTL automatically, so
        // the default is always 'left' regardless of direction.
        const defaultAlignment = toolbar?.alignment ?? 'left';
        // Separators inherit the alignment of the preceding item, unless explicitly set
        let lastAlignment = defaultAlignment;
        for (const item of items) {
            const isSeparator = item.toolbarItem === 'separator';
            const alignment = item.alignment ?? (isSeparator ? lastAlignment : defaultAlignment);
            (alignment === 'right' ? rightItems : leftItems).push(item);
            if (!isSeparator) {
                lastAlignment = alignment;
            }
        }

        const generation = ++this.generation;
        this.createAndRenderComponents([...leftItems, ...rightItems], leftItems.length, generation);
    }

    private updateToolbar(): void {
        // Bump generation before destroying so any in-flight resolves are invalidated immediately
        this.generation++;
        _clearElement(this.getGui());
        this.destroyToolbarItems();
        this.processToolbarItems();
    }

    public override destroy(): void {
        this.generation++;
        this.destroyToolbarItems();
        this.beans.toolbar?.clearToolbar(this);
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
        toolbarItems: NormalisedToolbarItem[],
        rightStartIndex: number,
        generation: number
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

            const { key } = itemConfig;

            if (itemConfig.toolbarItem == null) {
                this.beans.log.error(301, { key });
                continue;
            }

            const placeholder = _createElement({ tag: 'div' });
            eContainer.appendChild(placeholder);

            const compDetails = this.beans.userCompFactory.getCompDetails(
                itemConfig,
                ToolbarItemComponent,
                undefined,
                this.createItemParams(itemConfig, key),
                true
            );

            if (compDetails == null) {
                _removeFromParent(placeholder);
                continue;
            }

            compDetails
                .newAgStackInstance()
                .then((component) => this.mountComponent(key, component, placeholder, generation));
        }
    }

    private mountComponent(
        key: string,
        component: IToolbarItemComp | null,
        placeholder: HTMLElement,
        generation: number
    ): void {
        // Stale resolve from a previous rebuild — discard and clean up
        if (generation !== this.generation) {
            _removeFromParent(placeholder);
            if (component != null) {
                this.destroyBean(component);
            }
            return;
        }

        if (component == null) {
            _removeFromParent(placeholder);
            return;
        }

        // Placeholder was discarded by a rebuild or destroy — clean up the orphan component.
        // Don't rely on isConnected: on initial render the grid is not yet in the document.
        const isDuplicate = this.toolbarItems.has(key);
        if (isDuplicate || !this.isAlive() || placeholder.parentNode !== this.getGui()) {
            _removeFromParent(placeholder);
            this.destroyBean(component);
            if (isDuplicate) {
                this.beans.log.warn(303, { key });
            }
            return;
        }

        this.toolbarItems.set(key, component);
        const eItemGui = component.getGui();
        if ('agToolbarButton' in component) {
            const eWrapper = _createElement({ tag: 'div', cls: 'ag-toolbar-button-wrapper' });
            eWrapper.appendChild(eItemGui);
            placeholder.replaceWith(eWrapper);
        } else {
            placeholder.replaceWith(eItemGui);
        }
    }
}

export const AgToolbarSelector: ComponentSelector = {
    selector: 'AG-TOOLBAR',
    component: AgToolbar,
};
