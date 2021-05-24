// Type definitions for @ag-grid-community/core v25.3.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Column } from '../entities/column';
declare type ColumnSortState = 'ascending' | 'descending' | 'none';
export declare function getAriaSortState(column: Column): ColumnSortState;
export declare function getAriaLevel(element: HTMLElement): number;
export declare function getAriaPosInSet(element: HTMLElement): number;
export declare function getAriaDescribedBy(element: HTMLElement): string;
export declare function setAriaLabel(element: HTMLElement, label: string): void;
export declare function setAriaLabelledBy(element: HTMLElement, labelledBy: string): void;
export declare function setAriaDescribedBy(element: HTMLElement, describedby: string): void;
export declare function setAriaLevel(element: HTMLElement, level: number): void;
export declare function setAriaDisabled(element: HTMLElement, disabled: boolean): void;
export declare function setAriaExpanded(element: HTMLElement, expanded: boolean): void;
export declare function removeAriaExpanded(element: HTMLElement): void;
export declare function setAriaSetSize(element: HTMLElement, setsize: number): void;
export declare function setAriaPosInSet(element: HTMLElement, position: number): void;
export declare function setAriaMultiSelectable(element: HTMLElement, multiSelectable: boolean): void;
export declare function setAriaRowCount(element: HTMLElement, rowCount: number): void;
export declare function setAriaRowIndex(element: HTMLElement, rowIndex: number): void;
export declare function setAriaColCount(element: HTMLElement, colCount: number): void;
export declare function setAriaColIndex(element: HTMLElement, colIndex: number): void;
export declare function setAriaColSpan(element: HTMLElement, colSpan: number): void;
export declare function setAriaSort(element: HTMLElement, sort: ColumnSortState): void;
export declare function removeAriaSort(element: HTMLElement): void;
export declare function setAriaSelected(element: HTMLElement, selected: boolean): void;
export declare function setAriaChecked(element: HTMLElement, checked?: boolean): void;
export {};
