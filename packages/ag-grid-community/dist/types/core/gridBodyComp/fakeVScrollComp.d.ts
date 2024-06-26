import type { BeanCollection } from '../context/context';
import type { ComponentSelector } from '../widgets/component';
import { AbstractFakeScrollComp } from './abstractFakeScrollComp';
export declare class FakeVScrollComp extends AbstractFakeScrollComp {
    private ctrlsService;
    private scrollVisibleService;
    wireBeans(beans: BeanCollection): void;
    constructor();
    postConstruct(): void;
    protected setScrollVisible(): void;
    private onRowContainerHeightChanged;
    getScrollPosition(): number;
    setScrollPosition(value: number, force?: boolean): void;
}
export declare const FakeVScrollSelector: ComponentSelector;
