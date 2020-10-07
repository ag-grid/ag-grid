// Type definitions for @ag-grid-community/core v24.1.0
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
    private pinned;
    private filtersRowComp;
    private columnsRowComp;
    private groupsRowComps;
    constructor(eContainer: HTMLElement, eViewport: HTMLElement, pinned: string);
    forEachHeaderElement(callback: (renderedHeaderElement: Component) => void): void;
    private init;
    private onColumnResized;
    private onDisplayedColumnsChanged;
    private onScrollVisibilityChanged;
    private onScrollbarWidthChanged;
    private setWidthOfPinnedContainer;
    getRowComps(): HeaderRowComp[];
    private onGridColumnsChanged;
    refresh(keepColumns?: boolean): void;
    setupDragAndDrop(gridComp: GridPanel): void;
    private destroyRowComps;
    private destroyRowComp;
    private refreshRowComps;
}
