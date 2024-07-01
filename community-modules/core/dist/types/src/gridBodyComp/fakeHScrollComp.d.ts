import type { BeanCollection } from '../context/context';
import type { ComponentSelector } from '../widgets/component';
import { AbstractFakeScrollComp } from './abstractFakeScrollComp';
export declare class FakeHScrollComp extends AbstractFakeScrollComp {
    private visibleColsService;
    private pinnedRowModel;
    private ctrlsService;
    private scrollVisibleService;
    wireBeans(beans: BeanCollection): void;
    private readonly eLeftSpacer;
    private readonly eRightSpacer;
    private enableRtl;
    constructor();
    postConstruct(): void;
    protected initialiseInvisibleScrollbar(): void;
    private onPinnedRowDataChanged;
    private refreshCompBottom;
    protected onScrollVisibilityChanged(): void;
    private setFakeHScrollSpacerWidths;
    protected setScrollVisible(): void;
    getScrollPosition(): number;
    setScrollPosition(value: number): void;
}
export declare const FakeHScrollSelector: ComponentSelector;
