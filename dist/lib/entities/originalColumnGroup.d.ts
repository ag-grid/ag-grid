// Type definitions for ag-grid v8.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { OriginalColumnGroupChild } from "./originalColumnGroupChild";
import { ColGroupDef } from "./colDef";
import { Column } from "./column";
import { IEventEmitter } from "../interfaces/iEventEmitter";
export declare class OriginalColumnGroup implements OriginalColumnGroupChild, IEventEmitter {
    static EVENT_EXPANDED_CHANGED: string;
    private localEventService;
    private colGroupDef;
    private children;
    private groupId;
    private expandable;
    private expanded;
    private padding;
    constructor(colGroupDef: ColGroupDef, groupId: string, padding: boolean);
    isPadding(): boolean;
    setExpanded(expanded: boolean): void;
    isExpandable(): boolean;
    isExpanded(): boolean;
    getGroupId(): string;
    getId(): string;
    setChildren(children: OriginalColumnGroupChild[]): void;
    getChildren(): OriginalColumnGroupChild[];
    getColGroupDef(): ColGroupDef;
    getLeafColumns(): Column[];
    private addLeafColumns(leafColumns);
    getColumnGroupShow(): string;
    calculateExpandable(): void;
    addEventListener(eventType: string, listener: Function): void;
    removeEventListener(eventType: string, listener: Function): void;
}
