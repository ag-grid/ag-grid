// Type definitions for @ag-grid-community/core v26.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { AgPromise } from '../utils';
import { IAfterGuiAttachedParams } from '../interfaces/iAfterGuiAttachedParams';
import { Component } from '../widgets/component';
export declare class TabbedLayout extends Component {
    private focusService;
    private readonly eHeader;
    private readonly eBody;
    private params;
    private afterAttachedParams;
    private items;
    private activeItem;
    constructor(params: TabbedLayoutParams);
    private postConstruct;
    private static getTemplate;
    protected handleKeyDown(e: KeyboardEvent): void;
    protected onTabKeyDown(e: KeyboardEvent): void;
    setAfterAttachedParams(params: IAfterGuiAttachedParams): void;
    showFirstItem(): void;
    private addItem;
    showItem(tabbedItem: TabbedItem): void;
    private showItemWrapper;
}
export interface TabbedLayoutParams {
    items: TabbedItem[];
    cssClass?: string;
    onItemClicked?: Function;
    onActiveItemClicked?: Function;
}
export interface TabbedItem {
    title: Element;
    titleLabel: string;
    bodyPromise: AgPromise<HTMLElement>;
    name: string;
    afterAttachedCallback?: (params: IAfterGuiAttachedParams) => void;
}
