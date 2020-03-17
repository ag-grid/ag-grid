import { Component } from "./component";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
export interface VirtualListModel {
    getRowCount(): number;
    getRow(index: number): any;
}
export declare class VirtualList extends Component {
    private cssIdentifier;
    private model;
    private eListContainer;
    private rowsInBodyContainer;
    private componentCreator;
    private rowHeight;
    private environment;
    gridOptionsWrapper: GridOptionsWrapper;
    constructor(cssIdentifier?: string);
    private init;
    private static getTemplate;
    private getItemHeight;
    ensureIndexVisible(index: number): void;
    setComponentCreator(componentCreator: (value: any) => Component): void;
    getRowHeight(): number;
    getScrollTop(): number;
    setRowHeight(rowHeight: number): void;
    refresh(): void;
    private clearVirtualRows;
    private drawVirtualRows;
    private ensureRowsRendered;
    private removeVirtualRows;
    private insertRow;
    private addScrollListener;
    setModel(model: VirtualListModel): void;
}
