import type { BeanCollection, ComponentSelector } from 'ag-grid-community';
import { Component } from 'ag-grid-community';
export declare class AgStatusBar extends Component {
    private userComponentFactory;
    private statusBarService;
    private updateQueued;
    private panelsPromise;
    wireBeans(beans: BeanCollection): void;
    private readonly eStatusBarLeft;
    private readonly eStatusBarCenter;
    private readonly eStatusBarRight;
    private compDestroyFunctions;
    constructor();
    postConstruct(): void;
    private processStatusPanels;
    private handleStatusBarChanged;
    private updateStatusBar;
    resetStatusBar(): void;
    destroy(): void;
    private destroyComponents;
    private createAndRenderComponents;
}
export declare const AgStatusBarSelector: ComponentSelector;
