import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
export declare class CenterWidthFeature extends BeanStub {
    private readonly callback;
    private readonly addSpacer;
    private visibleColsService;
    private scrollVisibleService;
    wireBeans(beans: BeanCollection): void;
    constructor(callback: (width: number) => void, addSpacer?: boolean);
    postConstruct(): void;
    private setWidth;
}
