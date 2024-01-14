import { AgPromise } from '../utils';
import { IAfterGuiAttachedParams } from '../interfaces/iAfterGuiAttachedParams';
import { TabGuardComp } from '../widgets/tabGuardComp';
export declare class TabbedLayout extends TabGuardComp {
    private focusService;
    private readonly eHeader;
    private readonly eBody;
    private params;
    private afterAttachedParams;
    private items;
    private activeItem;
    private lastScrollListener;
    private readonly tabbedItemScrollMap;
    constructor(params: TabbedLayoutParams);
    private postConstruct;
    private static getTemplate;
    protected handleKeyDown(e: KeyboardEvent): void;
    protected onTabKeyDown(e: KeyboardEvent): void;
    private focusInnerElement;
    private focusHeader;
    private focusBody;
    setAfterAttachedParams(params: IAfterGuiAttachedParams): void;
    showFirstItem(): void;
    private addItem;
    showItem(tabbedItem: TabbedItem): void;
    private showItemWrapper;
}
export interface TabbedLayoutParams {
    items: TabbedItem[];
    cssClass?: string;
    keepScrollPosition?: boolean;
    onItemClicked?: Function;
    onActiveItemClicked?: Function;
}
export interface TabbedItem {
    title: Element;
    titleLabel: string;
    bodyPromise: AgPromise<HTMLElement>;
    name: string;
    getScrollableContainer?: () => HTMLElement;
    afterAttachedCallback?: (params: IAfterGuiAttachedParams) => void;
    afterDetachedCallback?: () => void;
}
