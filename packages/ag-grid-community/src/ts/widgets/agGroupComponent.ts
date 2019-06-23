import { _ } from "../utils";
import { Component } from "./component";
import { RefSelector } from "./componentAnnotations";
import { PostConstruct } from "../context/context";
import {AgCheckbox} from "./agCheckbox";

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

            <!-- TODO fix styling -->
            <div class="ag-group-component-label" style="display: flex; flex-direction: row; top: -8px">     
                <ag-checkbox ref="cbGroupEnabled" style="padding-right: 3px"></ag-checkbox>
                <div ref="lbGroupTitle" style="padding-top: 2px">        
                <!--<div ref="eGroupLabel" class="ag-group-component-label">        -->
            </div>
            
        </div>`;

    private items: GroupItem[];
    private title: string;
    private enabled: boolean;
    private suppressEnabledCheckbox: boolean;

    @RefSelector('cbGroupEnabled') private cbGroupEnabled: AgCheckbox;
    @RefSelector("lbGroupTitle") private lbGroupTitle: HTMLElement;

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
    }

    public addItems(items: GroupItem[]) {
        items.forEach(item => this.addItem(item));
    }

    public addItem(item: GroupItem) {
        const eGui = this.getGui();
        const el = item instanceof Component ? item.getGui() : item;
        _.addCssClass(el, 'ag-group-item');

        eGui.appendChild(el);
        this.items.push(el);
    }

    public setTitle(title: string): this {
        this.lbGroupTitle.innerText = title;
        return this;
    }

    public setEnabled(enabled: boolean): this {
        this.cbGroupEnabled.setSelected(enabled);
        return this;
    }

    public isEnabled(): boolean {
        return this.cbGroupEnabled.isSelected();
    }

    public onEnableChange(callbackFn: (enabled: boolean) => void) {
        this.cbGroupEnabled.onSelectionChange(callbackFn);
        return this;
    }

    public hideEnabledCheckbox(hide: boolean) {
        _.addOrRemoveCssClass(this.cbGroupEnabled.getGui(), 'ag-hidden', hide);
    }
}