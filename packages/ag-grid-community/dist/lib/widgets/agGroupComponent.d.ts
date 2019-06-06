// Type definitions for ag-grid-community v21.0.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Component } from "./component";
declare type GroupItem = Component | HTMLElement;
interface GroupParams {
    label: string;
    items?: GroupItem[];
}
export declare class AgGroupComponent extends Component {
    static TEMPLATE: string;
    private items;
    private label;
    private eLabel;
    constructor(params: GroupParams);
    private init;
    addItems(items: GroupItem[]): void;
    addItem(item: GroupItem): void;
}
export {};
