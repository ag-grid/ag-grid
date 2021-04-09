import { Autowired, Optional, PostConstruct } from '../context/context';
import { Events } from '../events';
import { IRangeController } from '../interfaces/iRangeController';
import { IContextMenuFactory } from '../interfaces/iContextMenuFactory';
import { GridApi } from '../gridApi';
import { AnimationFrameService } from '../misc/animationFrameService';
import { OverlayWrapperComponent } from '../rendering/overlays/overlayWrapperComponent';
import { Component } from '../widgets/component';
import { Beans } from '../rendering/beans';
import { RefSelector } from '../widgets/componentAnnotations';
import { HeaderRootComp } from '../headerRendering/headerRootComp';
import { ResizeObserverService } from '../misc/resizeObserverService';
import { HeaderNavigationService } from '../headerRendering/header/headerNavigationService';
import { setAriaColCount, setAriaMultiSelectable, setAriaRowCount } from '../utils/aria';
import { addCssClass, addOrRemoveCssClass, removeCssClass } from '../utils/dom';
import { IMenuFactory } from "../interfaces/iMenuFactory";
import { LayoutCssClasses } from "../styling/layoutFeature";
import {
    CSS_CLASS_CELL_SELECTABLE,
    CSS_CLASS_COLUMN_MOVING,
    CSS_CLASS_FORCE_VERTICAL_SCROLL,
    GridBodyController,
    GridBodyView,
    RowAnimationCssClasses
} from "./gridBodyController";
import { FakeHorizontalScrollComp } from "./fakeHorizontalScrollComp";
import { RowContainerNames } from "./rowContainer/rowContainerComp";

const GRID_BODY_TEMPLATE = /* html */
    `<div class="ag-root ag-unselectable" role="grid" unselectable="on">
        <ag-header-root ref="headerRoot" unselectable="on"></ag-header-root>
        <div class="ag-floating-top" ref="eTop" role="presentation" unselectable="on">
            <ag-row-container ref="topLeftContainer" name="${RowContainerNames.TOP_LEFT}"></ag-row-container>
            <ag-row-container ref="topCenterContainer" name="${RowContainerNames.TOP_CENTER}"></ag-row-container>
            <ag-row-container ref="topRightContainer" name="${RowContainerNames.TOP_RIGHT}"></ag-row-container>
            <ag-row-container ref="topFullWidthContainer" name="${RowContainerNames.TOP_FULL_WITH}"></ag-row-container>
        </div>
        <div class="ag-body-viewport" ref="eBodyViewport" role="presentation">
            <ag-row-container ref="leftContainer" name="${RowContainerNames.LEFT}"></ag-row-container>
            <ag-row-container ref="centerContainer" name="${RowContainerNames.CENTER}"></ag-row-container>
            <ag-row-container ref="rightContainer" name="${RowContainerNames.RIGHT}"></ag-row-container>
            <ag-row-container ref="fullWidthContainer" name="${RowContainerNames.FULL_WIDTH}"></ag-row-container>
        </div>
        <div class="ag-floating-bottom" ref="eBottom" role="presentation" unselectable="on">
            <ag-row-container ref="bottomLeftContainer" name="${RowContainerNames.BOTTOM_LEFT}"></ag-row-container>
            <ag-row-container ref="bottomCenterContainer" name="${RowContainerNames.BOTTOM_CENTER}"></ag-row-container>
            <ag-row-container ref="bottomRightContainer" name="${RowContainerNames.BOTTOM_RIGHT}"></ag-row-container>
            <ag-row-container ref="bottomFullWidthContainer" name="${RowContainerNames.BOTTOM_FULL_WITH}"></ag-row-container> 
        </div>
        <ag-fake-horizontal-scroll ref="fakeHScroll"></ag-fake-horizontal-scroll>
        <ag-overlay-wrapper ref="overlayWrapper"></ag-overlay-wrapper>
    </div>`;

export class GridBodyComp extends Component {

    @Autowired('animationFrameService') private animationFrameService: AnimationFrameService;
    @Autowired('beans') private beans: Beans;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('$scope') private $scope: any;
    @Autowired('resizeObserverService') private resizeObserverService: ResizeObserverService;
    @Autowired('headerNavigationService') private headerNavigationService: HeaderNavigationService;

    @Optional('rangeController') private rangeController: IRangeController;
    @Optional('contextMenuFactory') private contextMenuFactory: IContextMenuFactory;
    @Optional('menuFactory') private menuFactory: IMenuFactory;

    @RefSelector('eBodyViewport') private eBodyViewport: HTMLElement;
    @RefSelector('eTop') private eTop: HTMLElement;
    @RefSelector('eBottom') private eBottom: HTMLElement;

    // fake horizontal scroll
    @RefSelector('fakeHScroll') private fakeHScroll: FakeHorizontalScrollComp;

    @RefSelector('headerRoot') headerRootComp: HeaderRootComp;
    @RefSelector('overlayWrapper') private overlayWrapper: OverlayWrapperComponent;

    private controller: GridBodyController;

    constructor() {
        super(GRID_BODY_TEMPLATE);
    }

    @PostConstruct
    private init() {

        const setHeight = (height: number, element: HTMLElement) => {
            const heightString = `${height}px`;
            element.style.minHeight = heightString;
            element.style.height = heightString;
        };

        const view: GridBodyView = {
            setRowAnimationCssOnBodyViewport: this.setRowAnimationCssOnBodyViewport.bind(this),
            setColumnCount: count => setAriaColCount(this.getGui(), count),
            setRowCount: count => setAriaRowCount(this.getGui(), count),
            setTopHeight: height => setHeight(height, this.eTop),
            setBottomHeight: height => setHeight(height, this.eBottom),
            setTopDisplay: display => this.eTop.style.display = display,
            setBottomDisplay: display => this.eBottom.style.display = display,
            setColumnMovingCss: moving => this.addOrRemoveCssClass(CSS_CLASS_COLUMN_MOVING, moving),
            updateLayoutClasses: params => {
                addOrRemoveCssClass(this.eBodyViewport, LayoutCssClasses.AUTO_HEIGHT, params.autoHeight);
                addOrRemoveCssClass(this.eBodyViewport, LayoutCssClasses.NORMAL, params.normal);
                addOrRemoveCssClass(this.eBodyViewport, LayoutCssClasses.PRINT, params.print);

                this.addOrRemoveCssClass(LayoutCssClasses.AUTO_HEIGHT, params.autoHeight);
                this.addOrRemoveCssClass(LayoutCssClasses.NORMAL, params.normal);
                this.addOrRemoveCssClass(LayoutCssClasses.PRINT, params.print);
            },
            setAlwaysVerticalScrollClass: on =>
                addOrRemoveCssClass(this.eBodyViewport, CSS_CLASS_FORCE_VERTICAL_SCROLL, on),
            registerBodyViewportResizeListener: listener => {
                const unsubscribeFromResize = this.resizeObserverService.observeResize(this.eBodyViewport, listener);
                this.addDestroyFunc(() => unsubscribeFromResize());
            },
            setVerticalScrollPaddingVisible: show => {
                const scroller = show ? 'scroll' : 'hidden';
                this.eTop.style.overflowY = this.eBottom.style.overflowY = scroller;
            },
            setCellSelectableCss: selectable => {
                [this.eTop, this.eBodyViewport, this.eBottom]
                    .forEach(ct => addOrRemoveCssClass(ct, CSS_CLASS_CELL_SELECTABLE, selectable));
            },
        };

        this.controller = this.createManagedBean(new GridBodyController());
        this.controller.setView(view, this.getGui(), this.eBodyViewport, this.eTop, this.eBottom);

        if (this.$scope) {
            this.addAngularApplyCheck();
        }

        this.gridApi.registerGridComp(this);
        this.headerRootComp.registerGridComp(this);
        this.headerNavigationService.registerGridComp(this);
        this.beans.registerGridComp(this);
        this.animationFrameService.registerGridComp(this);
        if (this.contextMenuFactory) {
            this.contextMenuFactory.registerGridComp(this);
        }
        if (this.menuFactory) {
            this.menuFactory.registerGridComp(this);
        }

        if (this.rangeController || this.gridOptionsWrapper.isRowSelectionMulti()) {
            setAriaMultiSelectable(this.getGui(), true);
            if (this.rangeController) {
                this.rangeController.registerGridComp(this);
            }
        }

        [this.eTop, this.eBodyViewport, this.eBottom].forEach(element => {
            this.addManagedListener(element, 'focusin', () => {
                addCssClass(element, 'ag-has-focus');
            });

            this.addManagedListener(element, 'focusout', (e: FocusEvent) => {
                if (!element.contains(e.relatedTarget as HTMLElement)) {
                    removeCssClass(element, 'ag-has-focus');
                }
            });
        });
    }

    private setRowAnimationCssOnBodyViewport(animateRows: boolean): void {
        addOrRemoveCssClass(this.eBodyViewport, RowAnimationCssClasses.ANIMATION_ON, animateRows);
        addOrRemoveCssClass(this.eBodyViewport, RowAnimationCssClasses.ANIMATION_OFF, !animateRows);
    }

    private addAngularApplyCheck(): void {
        // this makes sure if we queue up requests, we only execute oe
        let applyTriggered = false;

        const listener = () => {
            // only need to do one apply at a time
            if (applyTriggered) { return; }
            applyTriggered = true; // mark 'need apply' to true
            window.setTimeout(() => {
                applyTriggered = false;
                this.$scope.$apply();
            }, 0);
        };

        // these are the events we need to do an apply after - these are the ones that can end up
        // with columns added or removed
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, listener);
        this.addManagedListener(this.eventService, Events.EVENT_VIRTUAL_COLUMNS_CHANGED, listener);
    }

    public getFloatingTopBottom(): HTMLElement[] {
        return [this.eTop, this.eBottom];
    }

    // + rangeController
    public addScrollEventListener(listener: () => void): void {
        this.eBodyViewport.addEventListener('scroll', listener);
    }

    // + rangeController
    public removeScrollEventListener(listener: () => void): void {
        this.eBodyViewport.removeEventListener('scroll', listener);
    }
}
