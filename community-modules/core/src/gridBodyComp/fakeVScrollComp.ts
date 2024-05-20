import { PostConstruct } from '../context/context';
import { Events } from '../eventKeys';
import { _isVisible, _setFixedWidth } from '../utils/dom';
import { AbstractFakeScrollComp } from './abstractFakeScrollComp';
import { SetHeightFeature } from './rowContainer/setHeightFeature';

export class FakeVScrollComp extends AbstractFakeScrollComp {
    private static TEMPLATE /* html */ = `<div class="ag-body-vertical-scroll" aria-hidden="true">
            <div class="ag-body-vertical-scroll-viewport" ref="eViewport">
                <div class="ag-body-vertical-scroll-container" ref="eContainer"></div>
            </div>
        </div>`;

    constructor() {
        super(FakeVScrollComp.TEMPLATE, 'vertical');
    }

    @PostConstruct
    protected postConstruct(): void {
        super.postConstruct();

        this.createManagedBean(new SetHeightFeature(this.eContainer));
        this.ctrlsService.register('fakeVScrollComp', this);

        this.addManagedListener(
            this.eventService,
            Events.EVENT_ROW_CONTAINER_HEIGHT_CHANGED,
            this.onRowContainerHeightChanged.bind(this)
        );
    }

    protected setScrollVisible(): void {
        const vScrollShowing = this.scrollVisibleService.isVerticalScrollShowing();
        const invisibleScrollbar = this.invisibleScrollbar;

        const scrollbarWidth = vScrollShowing ? this.gos.getScrollbarWidth() || 0 : 0;
        const adjustedScrollbarWidth = scrollbarWidth === 0 && invisibleScrollbar ? 16 : scrollbarWidth;

        this.addOrRemoveCssClass('ag-scrollbar-invisible', invisibleScrollbar);
        _setFixedWidth(this.getGui(), adjustedScrollbarWidth);
        _setFixedWidth(this.eViewport, adjustedScrollbarWidth);
        _setFixedWidth(this.eContainer, adjustedScrollbarWidth);
        this.setDisplayed(vScrollShowing, { skipAriaHidden: true });
    }

    private onRowContainerHeightChanged(): void {
        const { ctrlsService } = this;
        const gridBodyCtrl = ctrlsService.getGridBodyCtrl();
        const gridBodyViewportEl = gridBodyCtrl.getBodyViewportElement();

        const eViewportScrollTop = this.getScrollPosition();
        const gridBodyViewportScrollTop = gridBodyViewportEl.scrollTop;

        if (eViewportScrollTop != gridBodyViewportScrollTop) {
            this.setScrollPosition(gridBodyViewportScrollTop, true);
        }
    }

    public getScrollPosition(): number {
        return this.getViewport().scrollTop;
    }

    public setScrollPosition(value: number, force?: boolean): void {
        if (!force && !_isVisible(this.getViewport())) {
            this.attemptSettingScrollPosition(value);
        }
        this.getViewport().scrollTop = value;
    }
}
