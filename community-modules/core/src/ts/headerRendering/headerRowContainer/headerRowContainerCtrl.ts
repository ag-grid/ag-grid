import { BeanStub } from "../../context/beanStub";
import { Autowired } from "../../context/context";
import { CtrlsService } from "../../ctrlsService";
import { Column } from "../../entities/column";
import { CenterWidthFeature } from "../../gridBodyComp/centerWidthFeature";
import { HeaderWrapperComp } from "./../columnHeader/headerWrapperComp";
import { HeaderRowComp } from "../headerRow/headerRowComp";
import { Constants } from "../../constants/constants";
import { ScrollVisibleService } from "../../gridBodyComp/scrollVisibleService";
import { PinnedWidthService } from "../../gridBodyComp/pinnedWidthService";
import { Events } from "../../eventKeys";
import { setFixedWidth } from "../../utils/dom";

export interface IHeaderRowContainerComp {
    setCenterWidth(width: string): void;
    setContainerTransform(transform: string): void;
    setContainerWidth(width: string): void;
    addOrRemoveCssClass(cssClassName: string, on: boolean): void;

    // remove these, the comp should not be doing
    getRowComps(): HeaderRowComp[];
    refresh(): void;
    getHeaderWrapperComp(column: Column): HeaderWrapperComp | undefined;
}

export class HeaderRowContainerCtrl extends BeanStub {

    @Autowired('ctrlsService') private ctrlsService: CtrlsService;
    @Autowired('scrollVisibleService') private scrollVisibleService: ScrollVisibleService;
    @Autowired('pinnedWidthService') private pinnedWidthService: PinnedWidthService;

    private pinned: string | null;
    private comp: IHeaderRowContainerComp;

    constructor(pinned: string | null) {
        super();
        this.pinned = pinned;
    }
    
    public setComp(comp: IHeaderRowContainerComp): void {
        this.comp = comp;

        this.setupCenterWidth();
        this.setupPinnedWidth();

        this.ctrlsService.registerHeaderContainer(this, this.pinned);
    }

    private setupCenterWidth(): void {
        if (this.pinned!=null) { return; }

        this.createManagedBean(new CenterWidthFeature(width => this.comp.setCenterWidth(`${width}px`)));
    }

    public setHorizontalScroll(offset: number): void {
        this.comp.setContainerTransform(`translateX(${offset}px)`);
    }

    private setupPinnedWidth(): void {
        if (this.pinned==null) { return; }

        const pinningLeft = this.pinned === Constants.PINNED_LEFT;
        const pinningRight = this.pinned === Constants.PINNED_RIGHT;

        const listener = ()=> {
            const width = pinningLeft ? this.pinnedWidthService.getPinnedLeftWidth() : this.pinnedWidthService.getPinnedRightWidth();
            if (width==null) { return; } // can happen at initialisation, width not yet set

            const hidden = width == 0;
            const isRtl = this.gridOptionsWrapper.isEnableRtl();
            const scrollbarWidth = this.gridOptionsWrapper.getScrollbarWidth();

            // if there is a scroll showing (and taking up space, so Windows, and not iOS)
            // in the body, then we add extra space to keep header aligned with the body,
            // as body width fits the cols and the scrollbar
            const addPaddingForScrollbar = this.scrollVisibleService.isVerticalScrollShowing() && ((isRtl && pinningLeft) || (!isRtl && pinningRight));
            const widthWithPadding = addPaddingForScrollbar ? width + scrollbarWidth : width;

            this.comp.setContainerWidth(widthWithPadding + 'px');
            this.comp.addOrRemoveCssClass('ag-hidden', hidden);
        };

        this.addManagedListener(this.eventService, Events.EVENT_LEFT_PINNED_WIDTH_CHANGED, listener);
        this.addManagedListener(this.eventService, Events.EVENT_RIGHT_PINNED_WIDTH_CHANGED, listener);
        this.addManagedListener(this.eventService, Events.EVENT_SCROLL_VISIBILITY_CHANGED, listener);
        this.addManagedListener(this.eventService, Events.EVENT_SCROLLBAR_WIDTH_CHANGED, listener);
    }

    // temp - should not be in new design
    public getRowComps(): HeaderRowComp[] {
        return this.comp.getRowComps();
    }

    // temp - should not be in new design
    public getHeaderWrapperComp(column: Column): HeaderWrapperComp | undefined {
        return this.comp.getHeaderWrapperComp(column);
    }

    // temp - should not be in new design
    public refresh(): void {
        this.comp.refresh();
    }
}
