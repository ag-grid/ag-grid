import { Promise } from '../utils';
import { ManagedTabComponent } from '../widgets/managedTabComponent';
export declare class TabbedLayout extends ManagedTabComponent {
    private focusController;
    private eHeader;
    private eBody;
    private params;
    private afterAttachedParams;
    private items;
    private activeItem;
    constructor(params: TabbedLayoutParams);
    init(): void;
    private handleKeyDown;
    protected onTabKeyDown(e: KeyboardEvent): void;
    private static getTemplate;
    setAfterAttachedParams(params: any): void;
    getMinDimensions(): {
        width: number;
        height: number;
    };
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
    bodyPromise: Promise<HTMLElement>;
    name: string;
    afterAttachedCallback?: Function;
}
