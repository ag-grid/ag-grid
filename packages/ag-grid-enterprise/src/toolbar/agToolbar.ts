import type {
    ComponentSelector,
    ComponentType,
    ElementParams,
    FocusableContainer,
    IToolbarItemComp,
    IToolbarItemParams,
    Toolbar,
    ToolbarButtonItemDef,
    ToolbarItemDef,
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

/**
 * The flat shape every toolbar item is coerced into before rendering.
 * `key` is always populated; `toolbarItem` may still be absent if the user
 * supplied a definition without any actionable fields (warned downstream).
 */
interface NormalisedToolbarItem {
    toolbarItem?: unknown;
    toolbarItemParams?: any;
    alignment?: 'left' | 'right';
    key: string;
}

function normaliseItem(item: ToolbarItemDef | string, nextKey: () => string): NormalisedToolbarItem {
    if (typeof item === 'string') {
        return { toolbarItem: item, key: item };
    }

    let toolbarItem: unknown = item.toolbarItem;
    let toolbarItemParams: any = item.toolbarItemParams;

    if (toolbarItem == null) {
        const { label, icon, action } = item as ToolbarButtonItemDef;
        if (action != null || label != null || icon != null) {
            toolbarItem = 'agButtonToolbarItem';
            toolbarItemParams = { ...(toolbarItemParams ?? {}), label, icon, action };
        }
    }

    const key = item.key ?? (typeof toolbarItem === 'string' ? toolbarItem : nextKey());

    return { toolbarItem, toolbarItemParams, alignment: item.alignment, key };
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
    private readonly toolbarItems: Map<string, IToolbarItemComp> = new Map();
    private customKeyCounter: number = 0;
    // Incremented on each rebuild so stale async resolves from a previous generation can be discarded
    private generation: number = 0;

    constructor() {
        super(AgToolbarElement);
        this.registerCSS(agToolbarCSS);
    }

    public postConstruct(): void {
        const eGui = this.getGui();

        this.processToolbarItems();
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

        nextIndex = Math.max(0, Math.min(nextIndex, items.length - 1));
        if (nextIndex !== currentIndex) {
            items[nextIndex].focus();
            e.preventDefault();
        }
    }

    private getValidItems(toolbar: Toolbar | undefined): NormalisedToolbarItem[] | undefined {
        if (!toolbar?.items) {
            return undefined;
        }
        // Reset counter so keyless custom items get stable positional keys across updates
        this.customKeyCounter = 0;
        const nextKey = () => `custom-toolbar-item-${this.customKeyCounter++}`;
        const seen = new Set<string>();
        return toolbar.items.reduce<NormalisedToolbarItem[]>((acc, item) => {
            const normalised = normaliseItem(item, nextKey);
            if (normalised.toolbarItem === 'separator') {
                acc.push(normalised);
                return acc;
            }
            if (!seen.has(normalised.key)) {
                seen.add(normalised.key);
                acc.push(normalised);
            }
            return acc;
        }, []);
    }

    private createItemParams(itemConfig: NormalisedToolbarItem, key: string): IToolbarItemParams {
        return _addGridCommonParams(this.gos, {
            ...(itemConfig.toolbarItemParams ?? {}),
            key,
        });
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
        const defaultAlignment: 'left' | 'right' = toolbar?.alignment ?? (this.gos.get('enableRtl') ? 'right' : 'left');
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
                _warn(301, { key });
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
        if (!this.isAlive() || placeholder.parentNode !== this.getGui()) {
            _removeFromParent(placeholder);
            this.destroyBean(component);
            return;
        }

        this.toolbarItems.set(key, component);
        placeholder.replaceWith(component.getGui());
    }
}

export const AgToolbarSelector: ComponentSelector = {
    selector: 'AG-TOOLBAR',
    component: AgToolbar,
};
