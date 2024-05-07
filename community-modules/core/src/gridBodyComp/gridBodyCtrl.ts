import { ColumnModel } from "../columns/columnModel";
import { BeanStub } from "../context/beanStub";
import { Autowired } from "../context/context";
import { CtrlsService } from "../ctrlsService";
import { Events } from "../eventKeys";
import { HeaderNavigationService } from "../headerRendering/common/headerNavigationService";
import { IRowModel } from "../interfaces/iRowModel";
import { AnimationFrameService } from "../misc/animationFrameService";
import { RowContainerHeightService } from "../rendering/rowContainerHeightService";
import { LayoutFeature, LayoutView } from "../styling/layoutFeature";
import { isElementChildOfClass, isVerticalScrollShowing } from "../utils/dom";
import { GridBodyScrollFeature } from "./gridBodyScrollFeature";

export enum RowAnimationCssClasses {
    ANIMATION_ON = 'ag-row-animation',
    ANIMATION_OFF = 'ag-row-no-animation'
}

export const CSS_CLASS_FORCE_VERTICAL_SCROLL = 'ag-force-vertical-scroll';

const CSS_CLASS_CELL_SELECTABLE = 'ag-selectable';
const CSS_CLASS_COLUMN_MOVING = 'ag-column-moving';

export interface IGridBodyComp extends LayoutView {
    setColumnMovingCss(cssClass: string, on: boolean): void;
    setCellSelectableCss(cssClass: string | null, on: boolean): void;
    setTopHeight(height: number): void;
    setTopDisplay(display: string): void;
    setBottomHeight(height: number): void;
    setBottomDisplay(display: string): void;
    setStickyTopHeight(height: string): void;
    setStickyTopTop(offsetTop: string): void;
    setStickyTopWidth(width: string): void;
    setStickyBottomHeight(height: string): void;
    setStickyBottomBottom(offsetBottom: string): void;
    setStickyBottomWidth(width: string): void;
    setColumnCount(count: number): void;
    setRowCount(count: number): void;
    setRowAnimationCssOnBodyViewport(cssClass: string, animate: boolean): void;
    setAlwaysVerticalScrollClass(cssClass: string | null, on: boolean): void;
    setPinnedTopBottomOverflowY(overflow: 'scroll' | 'hidden'): void;
    registerBodyViewportResizeListener(listener: (() => void)): void;
    setBodyViewportWidth(width: string): void;
}

export class GridBodyCtrl extends BeanStub {

    @Autowired('animationFrameService') private animationFrameService: AnimationFrameService;
    @Autowired('rowContainerHeightService') private rowContainerHeightService: RowContainerHeightService;
    @Autowired('ctrlsService') private ctrlsService: CtrlsService;
    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('headerNavigationService') private headerNavigationService: HeaderNavigationService;
    @Autowired('rowModel') public rowModel: IRowModel;

    private comp: IGridBodyComp;
    private eGridBody: HTMLElement;
    private eBodyViewport: HTMLElement;
    private eTop: HTMLElement;
    private eBottom: HTMLElement;
    private eStickyTop: HTMLElement;
    private stickyTopHeight: number = 0;
    private eStickyBottom: HTMLElement;
    private stickyBottomHeight: number = 0;
    
    private bodyScrollFeature: GridBodyScrollFeature;

    public getScrollFeature(): GridBodyScrollFeature {
        return this.bodyScrollFeature;
    }

    public getBodyViewportElement(): HTMLElement {
        return this.eBodyViewport;
    }

    public setComp(
        comp: IGridBodyComp,
        eGridBody: HTMLElement,
        eBodyViewport: HTMLElement,
        eTop: HTMLElement,
        eBottom: HTMLElement,
        eStickyTop: HTMLElement,
        eStickyBottom: HTMLElement,
    ): void {
        this.comp = comp;
        this.eGridBody = eGridBody;
        this.eBodyViewport = eBodyViewport;
        this.eTop = eTop;
        this.eBottom = eBottom;
        this.eStickyTop = eStickyTop;
        this.eStickyBottom = eStickyBottom;

        this.setCellTextSelection(this.gos.get('enableCellTextSelection'));
        this.addManagedPropertyListener('enableCellTextSelection', (props) => this.setCellTextSelection(props.currentValue));

        this.createManagedBean(new LayoutFeature(this.comp));
        this.bodyScrollFeature = this.createManagedBean(new GridBodyScrollFeature(this.eBodyViewport));

        this.setupRowAnimationCssClass();

        this.addEventListeners();
        this.addFocusListeners([eTop, eBodyViewport, eBottom, eStickyTop, eStickyBottom]);
        this.onGridColumnsChanged();
        this.addBodyViewportListener();
        this.setFloatingHeights();
        this.disableBrowserDragging();

        this.ctrlsService.register('gridBodyCtrl',this);
    }

    public getComp(): IGridBodyComp {
        return this.comp;
    }

    private addEventListeners(): void {
        this.addManagedListener(this.eventService, Events.EVENT_GRID_COLUMNS_CHANGED, this.onGridColumnsChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_HEADER_HEIGHT_CHANGED, this.onHeaderHeightChanged.bind(this));
    }

    private addFocusListeners(elements: HTMLElement[]): void {
        elements.forEach(element => {
            this.addManagedListener(element, 'focusin', (e: FocusEvent) => {
                const { target } = e;
                // element being focused is nested?
                const isFocusedElementNested = isElementChildOfClass(target as HTMLElement, 'ag-root', element);

                element.classList.toggle('ag-has-focus', !isFocusedElementNested);
            });

            this.addManagedListener(element, 'focusout', (e: FocusEvent) => {
                const { target, relatedTarget } = e;
                const gridContainRelatedTarget = element.contains(relatedTarget as HTMLElement);
                const isNestedRelatedTarget = isElementChildOfClass(relatedTarget as HTMLElement, 'ag-root', element);
                const isNestedTarget = isElementChildOfClass(target as HTMLElement, 'ag-root', element);

                // element losing focus belongs to a nested grid,
                // it should not be handled here.
                if (isNestedTarget) { return; }

                // the grid does not contain, or the focus element is within
                // a nested grid
                if (!gridContainRelatedTarget || isNestedRelatedTarget) {
                    element.classList.remove('ag-has-focus');
                }
            });
        });
    }

    // used by ColumnAnimationService
    public setColumnMovingCss(moving: boolean): void {
        this.comp.setColumnMovingCss(CSS_CLASS_COLUMN_MOVING, moving);
    }

    public setCellTextSelection(selectable: boolean = false): void {
        this.comp.setCellSelectableCss(CSS_CLASS_CELL_SELECTABLE, selectable);
    }

    private onGridColumnsChanged(): void {
        const columns = this.columnModel.getAllGridColumns();
        this.comp.setColumnCount(columns.length);
    }

    // if we do not do this, then the user can select a pic in the grid (eg an image in a custom cell renderer)
    // and then that will start the browser native drag n' drop, which messes up with our own drag and drop.
    private disableBrowserDragging(): void {
        this.addManagedListener(this.eGridBody, 'dragstart', (event: MouseEvent) => {
            if (event.target instanceof HTMLImageElement) {
                event.preventDefault();
                return false;
            }
        });
    }

    public updateRowCount(): void {
        const headerCount = this.headerNavigationService.getHeaderRowCount();

        const rowCount = this.rowModel.isLastRowIndexKnown() ? this.rowModel.getRowCount() : -1;
        const total = rowCount === -1 ? -1 : (headerCount + rowCount);

        this.comp.setRowCount(total);
    }

    public registerBodyViewportResizeListener(listener: (() => void)): void {
        this.comp.registerBodyViewportResizeListener(listener);
    }

    public setVerticalScrollPaddingVisible(visible: boolean): void {
        const overflowY = visible ? 'scroll' : 'hidden';
        this.comp.setPinnedTopBottomOverflowY(overflowY);
    }

    public isVerticalScrollShowing(): boolean {
        const show = this.gos.get('alwaysShowVerticalScroll');
        const cssClass = show ? CSS_CLASS_FORCE_VERTICAL_SCROLL : null;
        const allowVerticalScroll = this.gos.isDomLayout('normal');
        this.comp.setAlwaysVerticalScrollClass(cssClass, show);
        return show || (allowVerticalScroll && isVerticalScrollShowing(this.eBodyViewport));
    }

    private setupRowAnimationCssClass(): void {
        const listener = () => {
            // we don't want to use row animation if scaling, as rows jump strangely as you scroll,
            // when scaling and doing row animation.
            const animateRows = this.gos.isAnimateRows() && !this.rowContainerHeightService.isStretching();
            const animateRowsCssClass = animateRows ? RowAnimationCssClasses.ANIMATION_ON : RowAnimationCssClasses.ANIMATION_OFF;
            this.comp.setRowAnimationCssOnBodyViewport(animateRowsCssClass, animateRows);
        };

        listener();

        this.addManagedListener(this.eventService, Events.EVENT_HEIGHT_SCALE_CHANGED, listener);
        this.addManagedPropertyListener('animateRows', listener);
    }

    public getGridBodyElement(): HTMLElement {
        return this.eGridBody;
    }

    private addBodyViewportListener(): void {
        // we want to listen for clicks directly on the eBodyViewport, so the user has a way of showing
        // the context menu if no rows or columns are displayed, or user simply clicks outside of a cell
        const listener = this.onBodyViewportContextMenu.bind(this);
        this.addManagedListener(this.eBodyViewport, 'contextmenu', listener);

        this.addManagedListener(this.eBodyViewport, 'wheel', this.onBodyViewportWheel.bind(this));
        this.addManagedListener(this.eStickyTop, 'wheel', this.onStickyWheel.bind(this));
        this.addManagedListener(this.eStickyBottom, 'wheel', this.onStickyWheel.bind(this));

    }


    private onBodyViewportContextMenu(mouseEvent?: MouseEvent, touch?: Touch, touchEvent?: TouchEvent): void {
        if (!mouseEvent && !touchEvent) { return; }

        if (this.gos.get('preventDefaultOnContextMenu')) {
            const event = (mouseEvent || touchEvent)!;
            event.preventDefault();
        }

        const { target } = (mouseEvent || touch)!;

        if (target === this.eBodyViewport || target === this.ctrlsService.get('center').getViewportElement()) {
            // show it
        }
    }

  

    private onBodyViewportWheel(e: WheelEvent): void {
        if (!this.gos.get('suppressScrollWhenPopupsAreOpen')) { return; }

       
    }

    private onStickyWheel(e: WheelEvent): void {
        e.preventDefault();

        if (e.offsetY) {
            this.scrollVertically(e.deltaY);
        }
    }

    public getGui(): HTMLElement {
        return this.eGridBody;
    }

    // called by rowDragFeature
    public scrollVertically(pixels: number): number {
        const oldScrollPosition = this.eBodyViewport.scrollTop;

        this.bodyScrollFeature.setVerticalScrollPosition(oldScrollPosition + pixels);
        return this.eBodyViewport.scrollTop - oldScrollPosition;
    }

       private setFloatingHeights(): void {
        let floatingTopHeight = 0;
        let floatingBottomHeight = 0;
        this.comp.setTopHeight(floatingTopHeight);
        this.comp.setBottomHeight(floatingBottomHeight);
        this.comp.setTopDisplay(floatingTopHeight ? 'inherit' : 'none');
        this.comp.setBottomDisplay(floatingBottomHeight ? 'inherit' : 'none');
        this.setStickyTopOffsetTop();
    }

    public setStickyTopHeight(height: number = 0): void {
        // console.log('setting sticky top height ' + height);
        this.comp.setStickyTopHeight(`${height}px`);
        this.stickyTopHeight = height;
    }

    public getStickyTopHeight(): number {
        return this.stickyTopHeight;
    }

    public setStickyBottomHeight(height: number = 0): void {
        this.comp.setStickyBottomHeight(`${height}px`);
        this.stickyBottomHeight = height;
    }

    public getStickyBottomHeight(): number {
        return this.stickyBottomHeight;
    }

    private onHeaderHeightChanged(): void {
        this.setStickyTopOffsetTop();
    }

    private setStickyTopOffsetTop(): void {
        const headerCtrl = this.ctrlsService.get('gridHeaderCtrl');

        let height = 0;

        if (height > 0) { height += 1; }

        this.comp.setStickyTopTop(`${height}px`);
    }


    // + rangeService
    public addScrollEventListener(listener: () => void): void {
        this.eBodyViewport.addEventListener('scroll', listener, { passive: true });
    }

    // + focusService
    public removeScrollEventListener(listener: () => void): void {
        this.eBodyViewport.removeEventListener('scroll', listener);
    }
}
