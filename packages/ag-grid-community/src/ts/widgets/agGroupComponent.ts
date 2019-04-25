import { Component } from "./component";
import { RefSelector } from "./componentAnnotations";
import { PostConstruct } from "../context/context";
import { _ } from "../utils";

type GroupItem = Component | HTMLElement;

interface GroupParams {
    label: string;
    items?: GroupItem[];
}

export class AgGroupComponent extends Component {
    static TEMPLATE =
        `<div class="ag-group-component">
            <div ref="eLabel" class="ag-group-component-label">
        </div>
        `;

    private items: GroupItem[];
    private label: string;

    @RefSelector("eLabel") private eLabel: HTMLElement;

    constructor(params: GroupParams) {
        super(AgGroupComponent.TEMPLATE);
        this.label = params.label;

        this.items = params.items || [];

    }

    @PostConstruct
    private init() {
        if (this.items.length) {
            const initialItems = this.items;
            this.items = [];

            this.addItems(initialItems);
        }

        this.eLabel.innerHTML = this.label;
    }

    public addItems(items: GroupItem[]) {
        items.forEach(this.addItem);
    }

    public addItem(item: GroupItem) {
        const eGui = this.getGui();
        const el = item instanceof Component ? item.getGui() : item;
        _.addCssClass(el, 'ag-group-item');

        eGui.appendChild(el);
        this.items.push(el);
    }
}