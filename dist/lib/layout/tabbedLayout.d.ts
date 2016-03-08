// Type definitions for ag-grid v4.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
export declare class TabbedLayout {
    private eGui;
    private eHeader;
    private eBody;
    private params;
    private static TEMPLATE;
    private items;
    private activeItem;
    constructor(params: TabbedLayoutParams);
    getMinWidth(): number;
    showFirstItem(): void;
    private addItem(item);
    showItem(tabbedItem: TabbedItem): void;
    private showItemWrapper(wrapper);
    getGui(): HTMLElement;
}
export interface TabbedLayoutParams {
    items: TabbedItem[];
    cssClass?: string;
    onItemClicked?: Function;
    onActiveItemClicked?: Function;
}
export interface TabbedItem {
    title: Element;
    body: HTMLElement;
    afterAttachedCallback?: Function;
}
