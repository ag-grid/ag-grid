import { Promise } from '../utils';
import { ManagedFocusComponent } from '../widgets/managedFocusComponent';
export declare class TabbedLayout extends ManagedFocusComponent {
    private eHeader;
    private eBody;
    private params;
    private afterAttachedParams;
    private items;
    private activeItem;
    constructor(params: TabbedLayoutParams);
    private static getTemplate;
    protected handleKeyDown(e: KeyboardEvent): void;
    protected onTabKeyDown(e: KeyboardEvent): void;
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
    titleLabel: string;
    bodyPromise: Promise<HTMLElement>;
    name: string;
    afterAttachedCallback?: Function;
}
