import { Component } from './component';
import { RefSelector } from './componentAnnotations';
import { Autowired, PostConstruct } from '../context/context';
import { GridOptionsWrapper } from '../gridOptionsWrapper';
import { AgCheckbox } from './agCheckbox';
import { Constants } from '../constants';
import { createIcon } from '../utils/icon';
import { setDisplayed, removeCssClass, addCssClass, addOrRemoveCssClass } from '../utils/dom';

type GroupItem = Component | HTMLElement;
type Align = 'start' | 'end' | 'center' | 'stretch';
type Direction = 'horizontal' | 'vertical';

export interface AgGroupComponentParams {
    title?: string;
    enabled?: boolean;
    suppressEnabledCheckbox?: boolean;
    suppressOpenCloseIcons?: boolean;
    cssIdentifier?: string;
    items?: GroupItem[];
    alignItems?: Align;
    direction?: Direction;
}

export class AgGroupComponent extends Component {
    public static EVENT_EXPANDED = 'expanded';
    public static EVENT_COLLAPSED = 'collapsed';

    private items: GroupItem[];
    private title: string;
    private cssIdentifier: string;
    private enabled: boolean;
    private expanded: boolean;
    private suppressEnabledCheckbox: boolean = true;
    private suppressOpenCloseIcons: boolean = false;
    private alignItems: Align;

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    @RefSelector('eTitleBar') private eTitleBar: HTMLElement;
    @RefSelector('eGroupOpenedIcon') private eGroupOpenedIcon: HTMLElement;
    @RefSelector('eGroupClosedIcon') private eGroupClosedIcon: HTMLElement;
    @RefSelector('eToolbar') private eToolbar: HTMLElement;
    @RefSelector('cbGroupEnabled') private cbGroupEnabled: AgCheckbox;
    @RefSelector('eTitle') private eTitle: HTMLElement;
    @RefSelector('eContainer') private eContainer: HTMLElement;

    constructor(params: AgGroupComponentParams = {}) {
        super(AgGroupComponent.getTemplate(params));

        const { title, enabled, items, suppressEnabledCheckbox, suppressOpenCloseIcons } = params;

        this.title = title;
        this.cssIdentifier = params.cssIdentifier || 'default';
        this.enabled = enabled != null ? enabled : true;
        this.items = items || [];

        this.alignItems = params.alignItems || 'center';

        if (suppressEnabledCheckbox != null) {
            this.suppressEnabledCheckbox = suppressEnabledCheckbox;
        }

        if (suppressOpenCloseIcons != null) {
            this.suppressOpenCloseIcons = suppressOpenCloseIcons;
        }
    }

    private static getTemplate(params: AgGroupComponentParams) {
        const cssIdentifier = params.cssIdentifier || 'default';
        const direction: Direction = params.direction || 'vertical';

        return /* html */ `<div class="ag-group ag-${cssIdentifier}-group">
            <div class="ag-group-title-bar ag-${cssIdentifier}-group-title-bar ag-unselectable" ref="eTitleBar">
                <span class="ag-group-title-bar-icon ag-${cssIdentifier}-group-title-bar-icon" ref="eGroupOpenedIcon"></span>
                <span class="ag-group-title-bar-icon ag-${cssIdentifier}-group-title-bar-icon" ref="eGroupClosedIcon"></span>
                <span ref="eTitle" class="ag-group-title ag-${cssIdentifier}-group-title"></span>
            </div>
            <div ref="eToolbar" class="ag-group-toolbar ag-${cssIdentifier}-group-toolbar">
                <ag-checkbox ref="cbGroupEnabled"></ag-checkbox>
            </div>
            <div ref="eContainer" class="ag-group-container ag-group-container-${direction} ag-${cssIdentifier}-group-container"></div>
        </div>`;
    }

    @PostConstruct
    private postConstruct() {
        if (this.items.length) {
            const initialItems = this.items;
            this.items = [];

            this.addItems(initialItems);
        }

        const localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        this.cbGroupEnabled.setLabel(localeTextFunc('enabled', 'Enabled'));

        if (this.title) {
            this.setTitle(this.title);
        }

        if (this.enabled) {
            this.setEnabled(this.enabled);
        }

        this.setAlignItems(this.alignItems);

        this.hideEnabledCheckbox(this.suppressEnabledCheckbox);
        this.hideOpenCloseIcons(this.suppressOpenCloseIcons);

        this.setupExpandContract();
        this.refreshChildDisplay();
    }

    private setupExpandContract(): void {
        this.eGroupClosedIcon.appendChild(createIcon('columnSelectClosed', this.gridOptionsWrapper, null));
        this.eGroupOpenedIcon.appendChild(createIcon('columnSelectOpen', this.gridOptionsWrapper, null));
        this.addManagedListener(this.eTitleBar, 'click', () => this.toggleGroupExpand());
        this.addManagedListener(this.eTitleBar, 'keydown', (e: KeyboardEvent) => {
            switch (e.keyCode) {
                case Constants.KEY_ENTER:
                    this.toggleGroupExpand();
                    break;
                case Constants.KEY_RIGHT:
                    this.toggleGroupExpand(true);
                    break;
                case Constants.KEY_LEFT:
                    this.toggleGroupExpand(false);
                    break;
            }
        });
    }

    private refreshChildDisplay(): void {
        const showIcon = !this.suppressOpenCloseIcons;

        setDisplayed(this.eToolbar, this.expanded && !this.suppressEnabledCheckbox);
        setDisplayed(this.eGroupOpenedIcon, showIcon && this.expanded);
        setDisplayed(this.eGroupClosedIcon, showIcon && !this.expanded);
    }

    public isExpanded(): boolean {
        return this.expanded;
    }

    public setAlignItems(alignment: AgGroupComponentParams['alignItems']): this {
        const eGui = this.getGui();

        if (this.alignItems !== alignment) {
            removeCssClass(eGui, `ag-group-item-alignment-${this.alignItems}`);
        }

        this.alignItems = alignment;
        const newCls = `ag-group-item-alignment-${this.alignItems}`;

        addCssClass(eGui, newCls);

        return this;
    }

    public toggleGroupExpand(expanded?: boolean): this {
        if (this.suppressOpenCloseIcons) {
            this.expanded = true;
            this.refreshChildDisplay();
            setDisplayed(this.eContainer, true);

            return this;
        }

        expanded = expanded != null ? expanded : !this.expanded;

        if (this.expanded === expanded) {
            return this;
        }

        this.expanded = expanded;
        this.refreshChildDisplay();

        setDisplayed(this.eContainer, expanded);

        this.dispatchEvent({ type: this.expanded ? AgGroupComponent.EVENT_EXPANDED : AgGroupComponent.EVENT_COLLAPSED });

        return this;
    }

    public addItems(items: GroupItem[]) {
        items.forEach(item => this.addItem(item));
    }

    public addItem(item: GroupItem) {
        const container = this.eContainer;
        const el = item instanceof Component ? item.getGui() : item;

        addCssClass(el, 'ag-group-item');
        addCssClass(el, `ag-${this.cssIdentifier}-group-item`);

        container.appendChild(el);
        this.items.push(el);
    }

    public hideItem(hide: boolean, index: number) {
        const itemToHide = this.items[index] as HTMLElement;
        addOrRemoveCssClass(itemToHide, 'ag-hidden', hide);
    }

    public setTitle(title: string): this {
        this.eTitle.innerText = title;
        return this;
    }

    public addCssClassToTitleBar(cssClass: string) {
        addCssClass(this.eTitleBar, cssClass);
    }

    public setEnabled(enabled: boolean, skipToggle?: boolean): this {
        this.enabled = enabled;
        this.refreshDisabledStyles();

        this.toggleGroupExpand(enabled);

        if (!skipToggle) {
            this.cbGroupEnabled.setValue(enabled);
        }

        return this;
    }

    public isEnabled(): boolean {
        return this.enabled;
    }

    public onEnableChange(callbackFn: (enabled: boolean) => void): this {
        this.cbGroupEnabled.onValueChange((newSelection: boolean) => {
            this.setEnabled(newSelection, true);
            callbackFn(newSelection);
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
        this.suppressOpenCloseIcons = hide;

        if (hide) {
            this.toggleGroupExpand(true);
        }

        return this;
    }

    private refreshDisabledStyles() {
        addOrRemoveCssClass(this.getGui(), 'ag-disabled', !this.enabled);

        if (this.suppressEnabledCheckbox && !this.enabled) {
            addCssClass(this.eTitleBar, 'ag-disabled-group-title-bar');
            this.eTitleBar.removeAttribute('tabindex');
        } else {
            removeCssClass(this.eTitleBar, 'ag-disabled-group-title-bar');
            this.eTitleBar.setAttribute('tabindex', '0');
        }

        addOrRemoveCssClass(this.eContainer, 'ag-disabled-group-container', !this.enabled);
    }
}
