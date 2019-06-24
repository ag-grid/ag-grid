import { _ } from "../utils";
import { Component } from "./component";
import { RefSelector } from "./componentAnnotations";
import { Autowired, PostConstruct } from "../context/context";
import { AgCheckbox } from "./agCheckbox";
import { GridOptionsWrapper } from "../gridOptionsWrapper";

type GroupItem = Component | HTMLElement;

interface GroupParams {
    title: string;
    enabled: boolean;
    suppressEnabledCheckbox: boolean;
    items?: GroupItem[]
}

export class AgGroupComponent extends Component {
    private static TEMPLATE =
        `<div class="ag-group-component">
            <div class="ag-group-component-label">
                 <span class="ag-column-group-icons" ref="eColumnGroupIcons">
                    <span class="ag-column-group-closed-icon" ref="eGroupOpenedIcon"></span>
                    <span class="ag-column-group-opened-icon" ref="eGroupClosedIcon"></span>
                </span>
                <ag-checkbox ref="cbGroupEnabled"></ag-checkbox>
                <div ref="lbGroupTitle" class="ag-group-component-title"></div>
            </div>
            <div ref="eContainer" class="ag-group-component-container"></div>
        </div>`;

    private items: GroupItem[];
    private title: string;
    private enabled: boolean;
    private expanded: boolean;
    private suppressEnabledCheckbox: boolean;

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    @RefSelector('eGroupOpenedIcon') private eGroupOpenedIcon: HTMLElement;
    @RefSelector('eGroupClosedIcon') private eGroupClosedIcon: HTMLElement;

    @RefSelector('cbGroupEnabled') private cbGroupEnabled: AgCheckbox;
    @RefSelector("lbGroupTitle") private lbGroupTitle: HTMLElement;
    @RefSelector("eContainer") private groupContainer: HTMLElement;

    constructor(params?: GroupParams) {
        super(AgGroupComponent.TEMPLATE);

        if (!params) {
            params = {} as GroupParams;
        }

        const { title, enabled, suppressEnabledCheckbox, items } = params;

        this.title = title;
        this.enabled = enabled != null ? enabled : true;
        this.suppressEnabledCheckbox = suppressEnabledCheckbox;
        this.items = items || [];
    }

    @PostConstruct
    private postConstruct() {
        if (this.items.length) {
            const initialItems = this.items;
            this.items = [];

            this.addItems(initialItems);
        }

        if (this.title) {
            this.setTitle(this.title);
        }

        if (this.enabled) {
            this.setEnabled(this.enabled);
        }

        if (this.suppressEnabledCheckbox) {
            this.hideEnabledCheckbox(this.suppressEnabledCheckbox);
        }

        this.setupExpandContract();
    }

    private setupExpandContract(): void {
        this.eGroupClosedIcon.appendChild(_.createIcon('columnSelectClosed', this.gridOptionsWrapper, null));
        this.eGroupOpenedIcon.appendChild(_.createIcon('columnSelectOpen', this.gridOptionsWrapper, null));

        this.setOpenClosedIcons();

        this.addDestroyableEventListener(this.eGroupClosedIcon, 'click', () => this.toggleGroupExpand());
        this.addDestroyableEventListener(this.eGroupOpenedIcon, 'click', () => this.toggleGroupExpand());
    }

    private setOpenClosedIcons(): void {
        const folderOpen = this.expanded;
        _.setVisible(this.eGroupClosedIcon, !folderOpen);
        _.setVisible(this.eGroupOpenedIcon, folderOpen);
    }

    public isExpanded(): boolean {
        return this.expanded;
    }

    public toggleGroupExpand(expanded?: boolean): this {
        expanded = expanded != null ? expanded : !this.expanded;
        if (this.expanded === expanded) { return; }

        this.expanded = expanded;
        this.setOpenClosedIcons();

        _.addOrRemoveCssClass(this.getGui(), 'ag-collapsed', !expanded);

        return this;
    }

    public addItems(items: GroupItem[]) {
        items.forEach(item => this.addItem(item));
    }

    public addItem(item: GroupItem) {
        const container = this.groupContainer;
        const el = item instanceof Component ? item.getGui() : item;
        _.addCssClass(el, 'ag-group-item');

        container.appendChild(el);
        this.items.push(el);
    }

    public setTitle(title: string): this {
        this.lbGroupTitle.innerText = title;
        return this;
    }

    public setEnabled(enabled: boolean, skipToggle?: boolean): this {
        this.enabled = enabled;
        _.addOrRemoveCssClass(this.getGui(), 'ag-disabled', !enabled);
        this.toggleGroupExpand(enabled);

        if (!this.suppressEnabledCheckbox && !skipToggle) {
            this.cbGroupEnabled.setSelected(enabled);
        }

        return this;
    }

    public isEnabled(): boolean {
        return this.enabled;
    }

    public onEnableChange(callbackFn: (enabled: boolean) => void): this {
        this.cbGroupEnabled.onSelectionChange((newSelection: boolean) => {
            this.setEnabled(newSelection, true);
            callbackFn(newSelection);
        });
        return this;
    }

    public hideEnabledCheckbox(hide: boolean): this {
        _.addOrRemoveCssClass(this.cbGroupEnabled.getGui(), 'ag-hidden', hide);
        return this;
    }
}