import { HeaderRowComp } from './headerRowComp';
import { Component } from '../widgets/component';
import { BeanStub } from "../context/beanStub";
import { GridPanel } from '../gridPanel/gridPanel';
export declare class HeaderContainer extends BeanStub {
    private columnController;
    private scrollVisibleService;
    private eContainer;
    private eViewport;
    private pinned;
    private filtersRowComp;
    private columnsRowComp;
    private groupsRowComps;
    constructor(eContainer: HTMLElement, eViewport: HTMLElement | null, pinned: string | null);
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
