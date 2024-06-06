import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import { _setDisplayed, _setFixedWidth } from '../../utils/dom';
import type { PinnedWidthService } from '../pinnedWidthService';

export class SetPinnedRightWidthFeature extends BeanStub {
    private pinnedWidthService: PinnedWidthService;

    public wireBeans(beans: BeanCollection): void {
        this.pinnedWidthService = beans.pinnedWidthService;
    }

    private element: HTMLElement;

    constructor(element: HTMLElement) {
        super();
        this.element = element;
    }

    public postConstruct(): void {
        this.addManagedListener(
            this.eventService,
            'rightPinnedWidthChanged',
            this.onPinnedRightWidthChanged.bind(this)
        );
    }

    private onPinnedRightWidthChanged(): void {
        const rightWidth = this.pinnedWidthService.getPinnedRightWidth();
        const displayed = rightWidth > 0;
        _setDisplayed(this.element, displayed);
        _setFixedWidth(this.element, rightWidth);
    }

    public getWidth(): number {
        return this.pinnedWidthService.getPinnedRightWidth();
    }
}
