import { Component } from './component';
import { RefSelector } from './componentAnnotations';
import { PostConstruct } from '../context/context';
import { AgCheckbox } from './agCheckbox';
import { createIcon } from '../utils/icon';
import { setDisplayed } from '../utils/dom';
import { KeyCode } from '../constants/keyCode';
import { setAriaExpanded } from '../utils/aria';
import { AgToggleButton } from './agToggleButton';
import { AgEvent } from '../events';

type GroupItem = Component | HTMLElement;
type Align = 'start' | 'end' | 'center' | 'stretch';
type Direction = 'horizontal' | 'vertical';

export interface AgGroupComponentParams {
    title?: string;
    enabled?: boolean;
    suppressEnabledCheckbox?: boolean;
    suppressOpenCloseIcons?: boolean;
    suppressToggleExpandOnEnableChange?: boolean;
    cssIdentifier?: string;
    items?: GroupItem[];
    alignItems?: Align;
    direction?: Direction;
    onEnableChange?: (enabled: boolean) => void;
    expanded?: boolean;
    useToggle?: boolean;
}

interface ExpandChangedEvent extends AgEvent {
    expanded?: boolean;
}

interface EnableChangeEvent extends AgEvent {
    enabled: boolean;
}

export class AgGroupComponent extends Component {
    public static EVENT_EXPANDED = 'expanded';
    public static EVENT_COLLAPSED = 'collapsed';
    public static EVENT_ENABLE_CHANGE = 'enableChange';

    private items: GroupItem[];
    private cssIdentifier: string;
    private enabled: boolean;
    private expanded: boolean;
    private suppressEnabledCheckbox: boolean = true;
    private suppressToggleExpandOnEnableChange: boolean = false;
    private alignItems: Align | undefined;
    private useToggle: boolean;

    private eToggle?: AgToggleButton;
    private eTitleBar?: DefaultTitleBar;

    @RefSelector('eToolbar') private eToolbar: HTMLElement;
    @RefSelector('cbGroupEnabled') private cbGroupEnabled: AgCheckbox;
    @RefSelector('eContainer') private eContainer: HTMLElement;

    constructor(private readonly params: AgGroupComponentParams = {}) {
        super(AgGroupComponent.getTemplate(params));

        const {
            enabled, items, suppressEnabledCheckbox, expanded, suppressToggleExpandOnEnableChange, useToggle: toggleMode
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

    private static getTemplate(params: AgGroupComponentParams) {
        const cssIdentifier = params.cssIdentifier || 'default';
        const direction: Direction = params.direction || 'vertical';

        return /* html */ `
            <div class="ag-group ag-${cssIdentifier}-group" role="presentation">
                <div ref="eToolbar" class="ag-group-toolbar ag-${cssIdentifier}-group-toolbar">
                    <ag-checkbox ref="cbGroupEnabled"></ag-checkbox>
                </div>
                <div ref="eContainer" class="ag-group-container ag-group-container-${direction} ag-${cssIdentifier}-group-container"></div>
            </div>
        `;
    }

    @PostConstruct
    private postConstruct() {
        this.setupTitleBar();

        if (this.items.length) {
            const initialItems = this.items;
            this.items = [];

            this.addItems(initialItems);
        }

        const localeTextFunc = this.localeService.getLocaleTextFunc();
        this.cbGroupEnabled.setLabel(localeTextFunc('enabled', 'Enabled'));

        if (this.enabled) {
            this.setEnabled(this.enabled, undefined, true);
        }

        this.setAlignItems(this.alignItems);

        const { onEnableChange, suppressOpenCloseIcons } = this.params;

        this.hideEnabledCheckbox(this.suppressEnabledCheckbox);
        this.hideOpenCloseIcons(suppressOpenCloseIcons ?? false);

        this.refreshChildDisplay();
        setDisplayed(this.eContainer, this.expanded);

        this.cbGroupEnabled.onValueChange((newSelection: boolean) => {
            this.setEnabled(newSelection, true, this.suppressToggleExpandOnEnableChange);
            this.dispatchEnableChangeEvent(newSelection);
        });

        if (onEnableChange != null) {
            this.onEnableChange(onEnableChange);
        }
    }

    private refreshChildDisplay(): void {
        setDisplayed(this.eToolbar, this.expanded && !this.suppressEnabledCheckbox);
        this.eTitleBar?.refreshOnExpand(this.expanded);
    }

    public isExpanded(): boolean {
        return this.expanded;
    }

    public setAlignItems(alignment: AgGroupComponentParams['alignItems']): this {
        if (this.alignItems !== alignment) {
            this.removeCssClass(`ag-group-item-alignment-${this.alignItems}`);
        }

        this.alignItems = alignment;
        const newCls = `ag-group-item-alignment-${this.alignItems}`;

        this.addCssClass(newCls);

        return this;
    }

    public toggleGroupExpand(expanded?: boolean): this {
        let silent = false;
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

        setDisplayed(this.eContainer, expanded);

        if (!silent) {
            this.dispatchEvent({ type: expanded ? AgGroupComponent.EVENT_EXPANDED : AgGroupComponent.EVENT_COLLAPSED });
        }

        return this;
    }

    public addItems(items: GroupItem[]) {
        items.forEach(item => this.addItem(item));
    }

    public prependItem(item: GroupItem) {
        this.insertItem(item, true);
    }

    public addItem(item: GroupItem) {
        this.insertItem(item, false);
    }

    private insertItem(item: GroupItem, prepend?: boolean) {
        const container = this.eContainer;
        const el = item instanceof Component ? item.getGui() : item;

        el.classList.add('ag-group-item', `ag-${this.cssIdentifier}-group-item`);

        if (prepend) {
            container.insertAdjacentElement('afterbegin', el);
            this.items.unshift(el);
        } else {
            container.appendChild(el);
            this.items.push(el);
        }
    }

    public hideItem(hide: boolean, index: number) {
        const itemToHide = this.items[index] as HTMLElement;
        setDisplayed(itemToHide, !hide);
    }

    public getItemIndex(item: GroupItem): number | -1 {
        const el = item instanceof Component ? item.getGui() : item;
        return this.items.indexOf(el);
    }

    public setTitle(title: string): this {
        this.eTitleBar?.setTitle(title);
        return this;
    }

    public addCssClassToTitleBar(cssClass: string) {
        this.eTitleBar?.addCssClass(cssClass);
    }

    private dispatchEnableChangeEvent(enabled: boolean): void {
        const event: EnableChangeEvent = {
            type: AgGroupComponent.EVENT_ENABLE_CHANGE,
            enabled
        };
        this.dispatchEvent(event);
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
        this.addManagedListener(this, AgGroupComponent.EVENT_ENABLE_CHANGE, (event: EnableChangeEvent) => callbackFn(event.enabled));

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

    private createDefaultTitleBar(): DefaultTitleBar {
        const titleBar = this.createManagedBean(new DefaultTitleBar(this.params));
        this.eTitleBar = titleBar;
        titleBar.refreshOnExpand(this.expanded);
        this.addManagedListener(titleBar, DefaultTitleBar.EVENT_EXPAND_CHANGED, (event: ExpandChangedEvent) => this.toggleGroupExpand(event.expanded));
        return titleBar;
    }

    private createToggleTitleBar(): AgToggleButton {
        const eToggle = this.createManagedBean(new AgToggleButton({
            value: this.enabled,
            label: this.params.title,
            labelAlignment: 'left',
            labelWidth: 'flex',
            onValueChange: enabled => {
                this.setEnabled(enabled, true);
                this.dispatchEnableChangeEvent(enabled);
            }
        }));
        eToggle.addCssClass('ag-group-title-bar')
        eToggle.addCssClass(`ag-${this.params.cssIdentifier ?? 'default'}-group-title-bar ag-unselectable`);
        this.eToggle = eToggle;
        this.toggleGroupExpand(this.enabled);
        return eToggle;
    }
}

class DefaultTitleBar extends Component {
    public static EVENT_EXPAND_CHANGED = 'expandedChanged';

    private title: string | undefined;
    private suppressOpenCloseIcons: boolean = false;

    @RefSelector('eGroupOpenedIcon') private eGroupOpenedIcon: HTMLElement;
    @RefSelector('eGroupClosedIcon') private eGroupClosedIcon: HTMLElement;
    @RefSelector('eTitle') private eTitle: HTMLElement;

    constructor(params: AgGroupComponentParams = {}) {
        super(DefaultTitleBar.getTemplate(params));

        const { title, suppressOpenCloseIcons } = params;

        this.title = title;

        if (suppressOpenCloseIcons != null) {
            this.suppressOpenCloseIcons = suppressOpenCloseIcons;
        }
    }

    private static getTemplate(params: AgGroupComponentParams) {
        const cssIdentifier = params.cssIdentifier ?? 'default';

        return /* html */ `
            <div class="ag-group-title-bar ag-${cssIdentifier}-group-title-bar ag-unselectable" role="button">
                <span class="ag-group-title-bar-icon ag-${cssIdentifier}-group-title-bar-icon" ref="eGroupOpenedIcon" role="presentation"></span>
                <span class="ag-group-title-bar-icon ag-${cssIdentifier}-group-title-bar-icon" ref="eGroupClosedIcon" role="presentation"></span>
                <span ref="eTitle" class="ag-group-title ag-${cssIdentifier}-group-title"></span>
            </div>
        `;
    }

    @PostConstruct
    private postConstruct() {
        this.setTitle(this.title);

        this.hideOpenCloseIcons(this.suppressOpenCloseIcons);

        this.setupExpandContract();
    }

    private setupExpandContract(): void {
        this.eGroupClosedIcon.appendChild(createIcon('columnSelectClosed', this.gos, null));
        this.eGroupOpenedIcon.appendChild(createIcon('columnSelectOpen', this.gos, null));
        this.addManagedListener(this.getGui(), 'click', () => this.dispatchExpandChanged());
        this.addManagedListener(this.getGui(), 'keydown', (e: KeyboardEvent) => {
            switch (e.key) {
                case KeyCode.ENTER:
                case KeyCode.SPACE:
                    e.preventDefault();
                    this.dispatchExpandChanged();
                    break;
                case KeyCode.RIGHT:
                case KeyCode.LEFT:
                    e.preventDefault();
                    this.dispatchExpandChanged(e.key === KeyCode.RIGHT);
                    break;
            }
        });
    }

    public refreshOnExpand(expanded: boolean): void {
        this.refreshAriaStatus(expanded);
        this.refreshOpenCloseIcons(expanded);
    }

    private refreshAriaStatus(expanded: boolean): void {
        if (!this.suppressOpenCloseIcons) {
            setAriaExpanded(this.getGui(), expanded);
        }
    }

    private refreshOpenCloseIcons(expanded: boolean): void {
        const showIcon = !this.suppressOpenCloseIcons;

        setDisplayed(this.eGroupOpenedIcon, showIcon && expanded);
        setDisplayed(this.eGroupClosedIcon, showIcon && !expanded);
    }

    public isSuppressCollapse(): boolean {
        return this.suppressOpenCloseIcons;
    }

    private dispatchExpandChanged(expanded?: boolean): void {
        const event: ExpandChangedEvent = {
            type: DefaultTitleBar.EVENT_EXPAND_CHANGED,
            expanded
        };
        this.dispatchEvent(event);
    }

    public setTitle(title: string | undefined): this {
        this.eTitle.innerText = title || '';
        setDisplayed(this.getGui(), title != undefined);
        return this;
    }

    public hideOpenCloseIcons(hide: boolean): this {
        this.suppressOpenCloseIcons = hide;

        if (hide) {
            this.dispatchExpandChanged(true);
        }

        return this;
    }

    public refreshDisabledStyles(disabled: boolean) {
        const eGui = this.getGui();
        if (disabled) {
            eGui.classList.add('ag-disabled-group-title-bar');
            eGui.removeAttribute('tabindex');
        } else {
            eGui.classList.remove('ag-disabled-group-title-bar');
            if (typeof this.title === 'string') {
                eGui.setAttribute('tabindex', '0');
            } else {
                eGui.removeAttribute('tabindex');
            }
        }
    }
}
