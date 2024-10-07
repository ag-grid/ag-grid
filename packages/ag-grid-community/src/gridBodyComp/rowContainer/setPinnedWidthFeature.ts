import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import { _setDisplayed, _setFixedWidth } from '../../utils/dom';
import type { PinnedWidthService } from '../pinnedWidthService';

export class SetPinnedWidthFeature extends BeanStub {
    private pinnedWidthService: PinnedWidthService;

    public readonly getWidth: () => number;

    public wireBeans(beans: BeanCollection): void {
        this.pinnedWidthService = beans.pinnedWidthService;
    }

    constructor(
        private readonly element: HTMLElement,
        private readonly isLeft: boolean
    ) {
        super();
        this.getWidth = isLeft
            ? this.pinnedWidthService.getPinnedLeftWidth.bind(this)
            : this.pinnedWidthService.getPinnedRightWidth.bind(this);
    }

    public postConstruct(): void {
        this.addManagedEventListeners({
            [`${this.isLeft ? 'left' : 'right'}PinnedWidthChanged` as const]: this.onPinnedWidthChanged.bind(this),
        });
    }

    private onPinnedWidthChanged(): void {
        const width = this.getWidth();
        const displayed = width > 0;
        _setDisplayed(this.element, displayed);
        _setFixedWidth(this.element, width);
    }
}
