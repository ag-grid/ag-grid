import { Promise } from '../utils';
export declare class TabbedLayout {
    private eGui;
    private eHeader;
    private eBody;
    private params;
    private afterAttachedParams;
    private static TEMPLATE;
    private items;
    private activeItem;
    constructor(params: TabbedLayoutParams);
    setAfterAttachedParams(params: any): void;
    getMinDimensions(): {
        width: number;
        height: number;
    };
    showFirstItem(): void;
    private addItem;
    showItem(tabbedItem: TabbedItem): void;
    private showItemWrapper;
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
    bodyPromise: Promise<HTMLElement>;
    name: string;
    afterAttachedCallback?: Function;
}
