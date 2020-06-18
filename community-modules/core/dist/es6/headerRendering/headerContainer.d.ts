// Type definitions for @ag-grid-community/core v23.2.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { HeaderRowComp } from './headerRowComp';
import { Component } from '../widgets/component';
import { BeanStub } from "../context/beanStub";
import { GridPanel } from '../gridPanel/gridPanel';
export declare class HeaderContainer extends BeanStub {
    private gridOptionsWrapper;
    private columnController;
    private scrollVisibleService;
    private eContainer;
    private eViewport;
    private headerRowComps;
    private pinned;
    private scrollWidth;
    private dropTarget;
    constructor(eContainer: HTMLElement, eViewport: HTMLElement, pinned: string);
    forEachHeaderElement(callback: (renderedHeaderElement: Component) => void): void;
    private init;
    private onColumnRowGroupChanged;
    private onColumnValueChanged;
    private onColumnResized;
    private onDisplayedColumnsChanged;
    private onScrollVisibilityChanged;
    private setWidthOfPinnedContainer;
    getRowComps(): HeaderRowComp[];
    private onGridColumnsChanged;
    private removeAndCreateAllRowComps;
    refresh(): void;
    setupDragAndDrop(gridComp: GridPanel): void;
    private removeHeaderRowComps;
    private createHeaderRowComps;
}
