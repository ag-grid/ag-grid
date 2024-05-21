import { BeanStub } from '../../context/beanStub';
import { Autowired } from '../../context/context';
import { Events } from '../../eventKeys';
import { _setDisplayed, _setFixedWidth } from '../../utils/dom';
import { PinnedWidthService } from '../pinnedWidthService';

export class SetPinnedLeftWidthFeature extends BeanStub {
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
