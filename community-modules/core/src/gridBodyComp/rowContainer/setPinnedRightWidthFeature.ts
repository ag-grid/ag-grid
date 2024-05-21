import { BeanStub } from '../../context/beanStub';
import { Autowired } from '../../context/context';
import { Events } from '../../eventKeys';
import { _setDisplayed, _setFixedWidth } from '../../utils/dom';
import { PinnedWidthService } from '../pinnedWidthService';

export class SetPinnedRightWidthFeature extends BeanStub {
    @Autowired('pinnedWidthService') private pinnedWidthService: PinnedWidthService;

    private element: HTMLElement;

    constructor(element: HTMLElement) {
        super();
        this.element = element;
    }

    protected override postConstruct(): void {
        super.postConstruct();
        this.addManagedListener(
            this.eventService,
            Events.EVENT_RIGHT_PINNED_WIDTH_CHANGED,
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
