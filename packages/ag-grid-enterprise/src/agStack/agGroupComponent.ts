import type {
    AgBaseComponent,
    AgComponentSelector,
    AgCoreBeanCollection,
    AgElementParams,
    BaseEvents,
    BaseProperties,
    IPropertiesService,
} from 'ag-stack';
import {
    AgComponentStub,
    RefPlaceholder,
    _isComponent,
    _removeAriaExpanded,
    _removeFromParent,
    _setAriaControls,
    _setAriaExpanded,
    _setAriaRole,
    _setDisplayed,
} from 'ag-stack';

import type { AgCheckbox, AgEvent, _AgWidgetSelectorType } from 'ag-grid-community';
import { AgCheckboxSelector, AgToggleButton, KeyCode } from 'ag-grid-community';

import agGroupComponentCSS from './agGroupComponent.css';

type GroupItem<TBeanCollection> = AgBaseComponent<TBeanCollection> | HTMLElement;
type Align = 'start' | 'end' | 'center' | 'stretch';
type GroupDirection = 'horizontal' | 'vertical';

export interface AgGroupComponentParams<TBeanCollection> {
    title?: string;
    enabled?: boolean;
    suppressEnabledCheckbox?: boolean;
    suppressOpenCloseIcons?: boolean;
    suppressToggleExpandOnEnableChange?: boolean;
    cssIdentifier?: string;
    items?: GroupItem<TBeanCollection>[];
    alignItems?: Align;
    direction?: GroupDirection;
    onEnableChange?: (enabled: boolean) => void;
    onExpandedChange?: (expanded: boolean) => void;
    expanded?: boolean;
    useToggle?: boolean;
    suppressKeyboardNavigation?: boolean;
}

type AgGroupComponentEvent = 'expanded' | 'collapsed' | 'enableChange';
type ExpandedChangedEventType = 'expandedChanged';

interface ExpandChangedEvent extends AgEvent<ExpandedChangedEventType> {
    expanded?: boolean;
}

interface EnableChangeEvent extends AgEvent<'enableChange'> {
    enabled: boolean;
}

function getAgGroupComponentTemplate<TBeanCollection>(
    params: AgGroupComponentParams<TBeanCollection>
): AgElementParams<_AgWidgetSelectorType> {
    const cssIdentifier = params.cssIdentifier || 'default';
    const direction: GroupDirection = params.direction || 'vertical';

    return {
        tag: 'div',
        cls: `ag-group ag-${cssIdentifier}-group`,
        role: 'presentation',
        children: [
            {
                tag: 'div',
                ref: 'eToolbar',
                cls: `ag-group-toolbar ag-${cssIdentifier}-group-toolbar`,
                children: [{ tag: 'ag-checkbox', ref: 'cbGroupEnabled' }],
            },
            {
                tag: 'div',
                ref: 'eContainer',
                cls: `ag-group-container ag-group-container-${direction} ag-${cssIdentifier}-group-container`,
            },
        ],
    };
}

export class AgGroupComponent<
    TBeanCollection extends AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
    TProperties extends BaseProperties,
    TGlobalEvents extends BaseEvents,
    TCommon,
    TPropertiesService extends IPropertiesService<TProperties, TCommon>,
    TComponentSelectorType extends string,
> extends AgComponentStub<
    TBeanCollection,
    TProperties,
    TGlobalEvents,
    TCommon,
    TPropertiesService,
    TComponentSelectorType,
    AgGroupComponentEvent
> {
    private items: GroupItem<TBeanCollection>[];
    private readonly cssIdentifier: string;
    private enabled: boolean;
    private expanded: boolean;
    private suppressEnabledCheckbox: boolean = true;
    private readonly suppressToggleExpandOnEnableChange: boolean = false;
    private alignItems: Align | undefined;
    private readonly useToggle: boolean;

    private eToggle?: AgToggleButton<
        TBeanCollection,
        TProperties,
        TGlobalEvents,
        TCommon,
        TPropertiesService,
        TComponentSelectorType
    >;
    private eTitleBar?: DefaultTitleBar<
        TBeanCollection,
        TProperties,
        TGlobalEvents,
        TCommon,
        TPropertiesService,
        TComponentSelectorType
    >;

    private readonly eToolbar: HTMLElement = RefPlaceholder;
    private readonly cbGroupEnabled: AgCheckbox<
        TBeanCollection,
        TProperties,
        TGlobalEvents,
        TCommon,
        TPropertiesService,
        TComponentSelectorType
    > = RefPlaceholder;
    public readonly eContainer: HTMLElement = RefPlaceholder;

    constructor(private readonly params: AgGroupComponentParams<TBeanCollection> = {}) {
        super(
            getAgGroupComponentTemplate(params) as AgElementParams<TComponentSelectorType>,
            [AgCheckboxSelector] as AgComponentSelector<TComponentSelectorType>[]
        );

        this.registerCSS(agGroupComponentCSS);

        const {
            enabled,
            items,
            suppressEnabledCheckbox,
            expanded,
            suppressToggleExpandOnEnableChange,
            useToggle: toggleMode,
        } = params;

        this.cssIdentifier = params.cssIdentifier || 'default';
        this.enabled = enabled != null ? enabled : true;
        this.items = items || [];
        this.useToggle = toggleMode ?? false;

        this.alignItems = params.alignItems || 'center';

        // expanded by default
        this.expanded = expanded == null ? true : expanded;

        if (suppressEnabledCheckbox != null) {
            this.suppressEnabledCheckbox = suppressEnabledCheckbox;
        }

        if (suppressToggleExpandOnEnableChange != null) {
            this.suppressToggleExpandOnEnableChange = suppressToggleExpandOnEnableChange;
        }
    }

    public postConstruct() {
        this.setupTitleBar();

        if (this.items.length) {
            const initialItems = this.items;
            this.items = [];

            this.addItems(initialItems);
        }

        const localeTextFunc = this.getLocaleTextFunc();
        this.cbGroupEnabled.setLabel(localeTextFunc('enabled', 'Enabled'));

        if (this.enabled) {
            this.setEnabled(this.enabled, undefined, true);
        }

        this.setAlignItems(this.alignItems);

        const { onEnableChange, onExpandedChange, suppressOpenCloseIcons } = this.params;

        this.hideEnabledCheckbox(this.suppressEnabledCheckbox);
        this.hideOpenCloseIcons(suppressOpenCloseIcons ?? false);

        this.refreshChildDisplay();
        _setDisplayed(this.eContainer, this.expanded);

        this.cbGroupEnabled.onValueChange((newSelection: boolean) => {
            this.setEnabled(newSelection, true, this.suppressToggleExpandOnEnableChange);
            this.dispatchEnableChangeEvent(newSelection);
        });

        if (onEnableChange != null) {
            this.onEnableChange(onEnableChange);
        }

        if (onExpandedChange != null) {
            this.onExpandedChange(onExpandedChange);
        }
    }

    private refreshChildDisplay(): void {
        _setDisplayed(this.eToolbar, this.expanded && !this.suppressEnabledCheckbox);
        this.eTitleBar?.refreshOnExpand(this.expanded);
    }

    public isExpanded(): boolean {
        return this.expanded;
    }

    public setAlignItems(alignment: AgGroupComponentParams<TBeanCollection>['alignItems']): this {
        if (this.alignItems !== alignment) {
            this.removeCss(`ag-group-item-alignment-${this.alignItems}`);
        }

        this.alignItems = alignment;
        const newCls = `ag-group-item-alignment-${this.alignItems}`;

        this.addCss(newCls);

        return this;
    }

    public toggleGroupExpand(expanded?: boolean, silent?: boolean): this {
        if (this.eTitleBar?.isSuppressCollapse() && !this.useToggle) {
            expanded = true;
            silent = true;
        } else {
            expanded = expanded != null ? expanded : !this.expanded;

            if (this.expanded === expanded) {
                return this;
            }
        }

        this.expanded = expanded;
        this.refreshChildDisplay();

        _setDisplayed(this.eContainer, expanded);

        if (!silent) {
            this.dispatchLocalEvent({
                type: expanded ? 'expanded' : 'collapsed',
            });
        }

        return this;
    }

    public addItems(items: GroupItem<TBeanCollection>[]) {
        for (const item of items) {
            this.addItem(item);
        }
    }

    public prependItem(item: GroupItem<TBeanCollection>) {
        this.insertItem(item, true);
    }

    public addItem(item: GroupItem<TBeanCollection>) {
        this.insertItem(item, false);
    }

    public updateItems(newItems: GroupItem<TBeanCollection>[]): void {
        const oldItems = this.items;
        let newIndex = 0;
        for (let prevIndex = 0; prevIndex < oldItems.length; ++prevIndex) {
            const ePrevItem = oldItems[prevIndex];
            if (ePrevItem === newItems[newIndex]) {
                newIndex++;
            } else {
                const el = _isComponent(ePrevItem) ? ePrevItem.getGui() : ePrevItem;
                _removeFromParent(el);
            }
        }

        while (newIndex < newItems.length) {
            this.insertItem(newItems[newIndex++]);
        }
        this.items = newItems;
    }

    public setDirection(direction: GroupDirection): this {
        this.eContainer.classList.toggle('ag-group-container-horizontal', direction === 'horizontal');
        this.eContainer.classList.toggle('ag-group-container-vertical', direction === 'vertical');
        return this;
    }

    private insertItem(item: GroupItem<TBeanCollection>, prepend?: boolean) {
        const container = this.eContainer;
        const el = _isComponent(item) ? item.getGui() : item;

        el.classList.add('ag-group-item', `ag-${this.cssIdentifier}-group-item`);

        if (prepend) {
            container.prepend(el);
            this.items.unshift(el);
        } else {
            container.appendChild(el);
            this.items.push(el);
        }
    }

    public hideItem(hide: boolean, index: number) {
        const itemToHide = this.items[index] as HTMLElement;
        _setDisplayed(itemToHide, !hide);
    }

    public getItemIndex(item: GroupItem<TBeanCollection>): number | -1 {
        const el = _isComponent(item) ? item.getGui() : item;
        return this.items.indexOf(el);
    }

    public setTitle(title: string): this {
        this.eTitleBar?.setTitle(title);
        return this;
    }

    public addTitleBarWidget(el: Element): this {
        this.eTitleBar?.addWidget(el);
        return this;
    }

    public addCssClassToTitleBar(cssClass: string) {
        this.eTitleBar?.addCss(cssClass);
    }

    public getTitleBarGui(): HTMLElement {
        return this.eTitleBar?.getGui() ?? this.eToggle?.getGui() ?? this.getGui();
    }

    private dispatchEnableChangeEvent(enabled: boolean): void {
        const event: EnableChangeEvent = {
            type: 'enableChange',
            enabled,
        };
        this.dispatchLocalEvent(event);
    }

    public setEnabled(enabled: boolean, skipToggle?: boolean, skipExpand?: boolean): this {
        this.enabled = enabled;
        this.refreshDisabledStyles();

        if (!skipExpand) {
            this.toggleGroupExpand(enabled);
        }

        if (!skipToggle) {
            this.cbGroupEnabled.setValue(enabled);
            this.eToggle?.setValue(enabled);
        }

        return this;
    }

    public isEnabled(): boolean {
        return this.enabled;
    }

    public onEnableChange(callbackFn: (enabled: boolean) => void): this {
        this.addManagedListeners(this, { enableChange: (event: EnableChangeEvent) => callbackFn(event.enabled) });

        return this;
    }

    public onExpandedChange(callbackFn: (expanded: boolean) => void): this {
        this.addManagedListeners(this, {
            expanded: () => callbackFn(true),
            collapsed: () => callbackFn(false),
        });

        return this;
    }

    public hideEnabledCheckbox(hide: boolean): this {
        this.suppressEnabledCheckbox = hide;
        this.refreshChildDisplay();
        this.refreshDisabledStyles();
        return this;
    }

    public hideOpenCloseIcons(hide: boolean): this {
        this.eTitleBar?.hideOpenCloseIcons(hide);

        return this;
    }

    private refreshDisabledStyles() {
        const disabled = !this.enabled;
        this.eContainer.classList.toggle('ag-disabled', disabled);
        this.eTitleBar?.refreshDisabledStyles(this.suppressEnabledCheckbox && disabled);
        this.eContainer.classList.toggle('ag-disabled-group-container', disabled);
    }

    private setupTitleBar(): void {
        const titleBar = this.useToggle ? this.createToggleTitleBar() : this.createDefaultTitleBar();
        this.eToolbar.insertAdjacentElement('beforebegin', titleBar.getGui());
    }

    private createDefaultTitleBar(): DefaultTitleBar<
        TBeanCollection,
        TProperties,
        TGlobalEvents,
        TCommon,
        TPropertiesService,
        TComponentSelectorType
    > {
        const containerId = `ag-${this.getCompId()}-group-container`;
        this.eContainer.id = containerId;
        const titleBar = this.createManagedBean(
            new DefaultTitleBar<
                TBeanCollection,
                TProperties,
                TGlobalEvents,
                TCommon,
                TPropertiesService,
                TComponentSelectorType
            >(this.params, containerId)
        );
        this.eTitleBar = titleBar;
        titleBar.refreshOnExpand(this.expanded);
        this.addManagedListeners(titleBar, {
            expandedChanged: (event: ExpandChangedEvent) => this.toggleGroupExpand(event.expanded),
        });
        return titleBar;
    }

    private createToggleTitleBar(): AgToggleButton<
        TBeanCollection,
        TProperties,
        TGlobalEvents,
        TCommon,
        TPropertiesService,
        TComponentSelectorType
    > {
        const eToggle = this.createManagedBean<
            AgToggleButton<
                TBeanCollection,
                TProperties,
                TGlobalEvents,
                TCommon,
                TPropertiesService,
                TComponentSelectorType
            >
        >(
            new AgToggleButton({
                value: this.enabled,
                label: this.params.title,
                labelAlignment: 'left',
                labelWidth: 'flex',
                onValueChange: (enabled) => {
                    this.setEnabled(enabled, true);
                    this.dispatchEnableChangeEvent(enabled);
                },
            })
        );
        eToggle.addCss('ag-group-title-bar');
        eToggle.addCss(`ag-${this.params.cssIdentifier ?? 'default'}-group-title-bar ag-unselectable`);
        this.eToggle = eToggle;
        this.toggleGroupExpand(this.enabled);
        return eToggle;
    }
}

const TITLE_BAR_DISABLED_CLASS = 'ag-disabled-group-title-bar';
function getDefaultTitleBarTemplate<TBeanCollection, TComponentSelectorType extends string>(
    params: AgGroupComponentParams<TBeanCollection>
): AgElementParams<TComponentSelectorType> {
    const { cssIdentifier, suppressOpenCloseIcons } = params;
    const normalisedCssIdentifier = cssIdentifier ?? 'default';
    const interactiveRole = suppressOpenCloseIcons ? 'group' : 'button';

    return {
        tag: 'div',
        cls: `ag-group-title-bar ag-${normalisedCssIdentifier}-group-title-bar ag-unselectable`,
        role: params.suppressKeyboardNavigation ? 'presentation' : interactiveRole,
        children: [
            {
                tag: 'span',
                ref: 'eGroupOpenedIcon',
                cls: `ag-group-title-bar-icon ag-${normalisedCssIdentifier}-group-title-bar-icon`,
                role: 'presentation',
            },
            {
                tag: 'span',
                ref: 'eGroupClosedIcon',
                cls: `ag-group-title-bar-icon ag-${normalisedCssIdentifier}-group-title-bar-icon`,
                role: 'presentation',
            },
            { tag: 'span', ref: 'eTitle', cls: `ag-group-title ag-${normalisedCssIdentifier}-group-title` },
        ],
    };
}
class DefaultTitleBar<
    TBeanCollection extends AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
    TProperties extends BaseProperties,
    TGlobalEvents extends BaseEvents,
    TCommon,
    TPropertiesService extends IPropertiesService<TProperties, TCommon>,
    TComponentSelectorType extends string,
> extends AgComponentStub<
    TBeanCollection,
    TProperties,
    TGlobalEvents,
    TCommon,
    TPropertiesService,
    TComponentSelectorType,
    ExpandedChangedEventType
> {
    private title: string | undefined;
    private suppressOpenCloseIcons: boolean = false;
    private readonly suppressKeyboardNavigation: boolean = false;
    private expanded: boolean = true;
    private disabled: boolean = false;

    private readonly eGroupOpenedIcon: HTMLElement = RefPlaceholder;
    private readonly eGroupClosedIcon: HTMLElement = RefPlaceholder;
    private readonly eTitle: HTMLElement = RefPlaceholder;

    constructor(
        params: AgGroupComponentParams<TBeanCollection> = {},
        private readonly containerId?: string
    ) {
        super(getDefaultTitleBarTemplate(params));

        const { title, suppressOpenCloseIcons, suppressKeyboardNavigation } = params;

        if (!!title && title.length > 0) {
            this.title = title;
        }

        if (suppressOpenCloseIcons != null) {
            this.suppressOpenCloseIcons = suppressOpenCloseIcons;
        }

        this.suppressKeyboardNavigation = suppressKeyboardNavigation ?? false;
    }

    public postConstruct() {
        this.setTitle(this.title);

        this.hideOpenCloseIcons(this.suppressOpenCloseIcons);

        this.setupExpandContract();
    }

    private setupExpandContract(): void {
        const iconSvc = this.beans.iconSvc;
        this.eGroupClosedIcon.appendChild(iconSvc.createIconNoSpan('accordionClosed')!);
        this.eGroupOpenedIcon.appendChild(iconSvc.createIconNoSpan('accordionOpen')!);
        this.addManagedElementListeners(this.getGui(), {
            click: () => this.dispatchExpandChanged(),
            keydown: (e: KeyboardEvent) => {
                const { ENTER, SPACE, RIGHT, LEFT, UP, DOWN, PAGE_UP, PAGE_DOWN, PAGE_HOME, PAGE_END } = KeyCode;
                switch (e.key) {
                    case UP:
                    case DOWN:
                    case PAGE_UP:
                    case PAGE_DOWN:
                    case PAGE_HOME:
                    case PAGE_END:
                        e.preventDefault();
                        return;
                    case ENTER:
                    case SPACE:
                        e.preventDefault();
                        this.dispatchExpandChanged();
                        break;
                    case RIGHT:
                    case LEFT:
                        e.preventDefault();
                        this.dispatchExpandChanged(e.key === RIGHT);
                        break;
                }
            },
        });
    }

    public refreshOnExpand(expanded: boolean): void {
        this.expanded = expanded;
        this.refreshAriaState();
        this.refreshOpenCloseIcons(expanded);
    }

    private refreshAriaState(): void {
        const eGui = this.getGui();
        const interactive = this.title != null && !this.suppressKeyboardNavigation && !this.disabled;
        // suppressed open/close icons means the group cannot collapse, so no disclosure button semantics
        const collapsible = interactive && !this.suppressOpenCloseIcons;

        let role = 'presentation';

        if (collapsible) {
            role = 'button';
        } else if (interactive) {
            role = 'group';
        }

        _setAriaRole(eGui, role);

        if (interactive) {
            this.activateTabIndex([eGui]);
        } else {
            eGui.removeAttribute('tabindex');
        }

        if (collapsible) {
            _setAriaExpanded(eGui, this.expanded);
        } else {
            _removeAriaExpanded(eGui);
        }
        _setAriaControls(eGui, collapsible ? this.containerId : null);
    }

    private refreshOpenCloseIcons(expanded: boolean): void {
        const showIcon = !this.suppressOpenCloseIcons;

        _setDisplayed(this.eGroupOpenedIcon, showIcon && expanded);
        _setDisplayed(this.eGroupClosedIcon, showIcon && !expanded);
    }

    public isSuppressCollapse(): boolean {
        return this.suppressOpenCloseIcons;
    }

    private dispatchExpandChanged(expanded?: boolean): void {
        const event: ExpandChangedEvent = {
            type: 'expandedChanged',
            expanded,
        };
        this.dispatchLocalEvent(event);
    }

    public setTitle(title: string | undefined): this {
        const eGui = this.getGui();
        const hasTitle = !!title && title.length > 0;
        title = hasTitle ? title : undefined;

        this.eTitle.textContent = title ?? '';
        _setDisplayed(eGui, hasTitle);

        if (title !== this.title) {
            this.title = title;
        }

        this.refreshAriaState();

        return this;
    }

    public addWidget(el: Element): this {
        this.getGui().appendChild(el);

        return this;
    }

    public hideOpenCloseIcons(hide: boolean): this {
        this.suppressOpenCloseIcons = hide;

        if (hide) {
            this.dispatchExpandChanged(true);
        }

        this.refreshAriaState();

        return this;
    }

    public refreshDisabledStyles(disabled: boolean) {
        this.disabled = disabled;
        this.getGui().classList.toggle(TITLE_BAR_DISABLED_CLASS, disabled);
        this.refreshAriaState();
    }
}

export const AgGroupComponentSelector: AgComponentSelector<_AgWidgetSelectorType> = {
    selector: 'AG-GROUP-COMPONENT',
    component: AgGroupComponent,
};
