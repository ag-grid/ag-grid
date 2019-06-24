import { _ } from "../utils";
import { Component } from "./component";
import { RefSelector } from "./componentAnnotations";
import {Autowired, PostConstruct} from "../context/context";
import {AgCheckbox} from "./agCheckbox";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {TouchListener} from "../main";

type GroupItem = Component | HTMLElement;

interface GroupParams {
    title: string;
    enabled: boolean;
    suppressEnabledCheckbox: boolean;
    items?: GroupItem[];
}

export class AgGroupComponent extends Component {
    private static TEMPLATE =
        `<div class="ag-group-component">
            <!-- TODO fix styles -->
            <div class="ag-group-component-label">
                 <span class="ag-column-group-icons" ref="eColumnGroupIcons" style="padding-left: 5px; padding-right: 5px">
                    <span class="ag-column-group-closed-icon" ref="eGroupOpenedIcon"></span>
                    <span class="ag-column-group-opened-icon" ref="eGroupClosedIcon"></span>
                </span>                        
                <ag-checkbox ref="cbGroupEnabled"></ag-checkbox>
                <div ref="lbGroupTitle" class="ag-group-component-title" style="padding-right: 5px"></div>
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
    @RefSelector('eColumnGroupIcons') private eColumnGroupIcons: HTMLElement;

    @RefSelector('cbGroupEnabled') private cbGroupEnabled: AgCheckbox;
    @RefSelector("lbGroupTitle") private lbGroupTitle: HTMLElement;
    @RefSelector("eContainer") private groupContainer: HTMLElement;

    constructor(params?: GroupParams) {
        super(AgGroupComponent.TEMPLATE);

        if (!params) {
            params = {} as GroupParams;
        }

        this.title = params.title;
        this.enabled = params.enabled;
        this.suppressEnabledCheckbox = params.suppressEnabledCheckbox;
        this.items = params.items || [];
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

        // groups are expanded by default
        this.expanded = true;
        this.setupExpandContract();
    }

    private setupExpandContract(): void {
        this.eGroupClosedIcon.appendChild(_.createIcon('columnSelectClosed', this.gridOptionsWrapper, null));
        this.eGroupOpenedIcon.appendChild(_.createIcon('columnSelectOpen', this.gridOptionsWrapper, null));

        this.setOpenClosedIcons();

        this.addDestroyableEventListener(this.eGroupClosedIcon, 'click', this.onExpandOrContractClicked.bind(this));
        this.addDestroyableEventListener(this.eGroupOpenedIcon, 'click', this.onExpandOrContractClicked.bind(this));

        const touchListener = new TouchListener(this.eColumnGroupIcons, true);
        this.addDestroyableEventListener(touchListener, TouchListener.EVENT_TAP, this.onExpandOrContractClicked.bind(this));
        this.addDestroyFunc(touchListener.destroy.bind(touchListener));
    }

    private onExpandOrContractClicked(): void {
        this.expanded = !this.expanded;
        this.setOpenClosedIcons();

        // TODO fix styles
        _.addOrRemoveCssClass(this.getGui(), 'ag-collapsed', !this.expanded);
        _.addOrRemoveCssClass(this.getGui(), 'ag-disabled', !this.expanded);
    }

    private setOpenClosedIcons(): void {
        const folderOpen = this.expanded;
        _.setVisible(this.eGroupClosedIcon, !folderOpen);
        _.setVisible(this.eGroupOpenedIcon, folderOpen);
    }

    public isExpanded(): boolean {
        return this.expanded;
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
        if (this.suppressEnabledCheckbox) {
            return this;
        }

        // TODO disable group title and inputs only
        // _.addOrRemoveCssClass(this.getGui(), 'ag-collapsed', !this.expanded);

        this.enabled = enabled;

        if (!skipToggle) {
            this.cbGroupEnabled.setSelected(enabled);
        }

        // TODO - review
        this.expanded = !enabled;
        this.onExpandOrContractClicked();

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