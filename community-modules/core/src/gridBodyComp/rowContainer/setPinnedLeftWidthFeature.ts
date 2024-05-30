import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import { Events } from '../../eventKeys';
import { _setDisplayed, _setFixedWidth } from '../../utils/dom';
import type { PinnedWidthService } from '../pinnedWidthService';

export class SetPinnedLeftWidthFeature extends BeanStub {
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
            Events.EVENT_LEFT_PINNED_WIDTH_CHANGED,
            this.onPinnedLeftWidthChanged.bind(this)
        );
    }

    private onPinnedLeftWidthChanged(): void {
        const leftWidth = this.pinnedWidthService.getPinnedLeftWidth();
        const displayed = leftWidth > 0;
        _setDisplayed(this.element, displayed);
        _setFixedWidth(this.element, leftWidth);
    }

    public getWidth(): number {
        return this.pinnedWidthService.getPinnedLeftWidth();
    }
}
