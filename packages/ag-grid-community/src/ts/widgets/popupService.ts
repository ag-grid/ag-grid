import { Constants } from "../constants";
import { Autowired, Bean } from "../context/context";
import { GridCore } from "../gridCore";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { PostProcessPopupParams } from "../entities/gridOptions";
import { RowNode } from "../entities/rowNode";
import { Column } from "../entities/column";
import { Environment } from "../environment";
import { EventService } from "../eventService";
import { Events } from '../events';
import { _ } from "../utils";

interface AgPopup {
    element: HTMLElement;
    hideFunc: () => void;
}

@Bean('popupService')
export class PopupService {

    // really this should be using eGridDiv, not sure why it's not working.
    // maybe popups in the future should be parent to the body??
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('environment') private environment: Environment;
    @Autowired('eventService') private eventService: EventService;

    private gridCore: GridCore;
    private popupList: AgPopup[] = [];

    public registerGridCore(gridCore: GridCore): void {
        this.gridCore = gridCore;
    }

    private getDocument(): Document {
        return this.gridOptionsWrapper.getDocument();
    }

    public getPopupParent(): HTMLElement {
        const ePopupParent = this.gridOptionsWrapper.getPopupParent();
        if (ePopupParent) {
            return ePopupParent;
        }

        return this.gridCore.getRootGui();
    }

    public positionPopupForMenu(params: { eventSource: HTMLElement, ePopup: HTMLElement }) {
        const sourceRect = params.eventSource.getBoundingClientRect();
        const eDocument = this.getDocument();
        const popupParent = this.getPopupParent();

        let parentRect: ClientRect;

        if (popupParent === eDocument.body) {
            parentRect = eDocument.documentElement!.getBoundingClientRect();
        } else {
            parentRect = popupParent.getBoundingClientRect();
        }

        let y = sourceRect.top - parentRect.top;

        y = this.keepYWithinBounds(params, y);

        const minWidth = (params.ePopup.clientWidth > 0) ? params.ePopup.clientWidth : 200;
        params.ePopup.style.minWidth = `${minWidth}px`;
        const widthOfParent = parentRect.right - parentRect.left;
        const maxX = widthOfParent - minWidth;

        // the x position of the popup depends on RTL or LTR. for normal cases, LTR, we put the child popup
        // to the right, unless it doesn't fit and we then put it to the left. for RTL it's the other way around,
        // we try place it first to the left, and then if not to the right.
        let x: number;
        if (this.gridOptionsWrapper.isEnableRtl()) {
            // for RTL, try left first
            x = xLeftPosition();
            if (x < 0) {
                x = xRightPosition();
            }
            if (x > maxX) {
                x = 0;
            }
        } else {
            // for LTR, try right first
            x = xRightPosition();
            if (x > maxX) {
                x = xLeftPosition();
            }
            if (x < 0) {
                x = 0;
            }
        }

        params.ePopup.style.left = `${x}px`;
        params.ePopup.style.top = `${y}px`;

        function xRightPosition(): number {
            return sourceRect.right - parentRect.left - 2;
        }

        function xLeftPosition(): number {
            return sourceRect.left - parentRect.left - minWidth;
        }
    }

    public positionPopupUnderMouseEvent(params: {
        rowNode?: RowNode,
        column?: Column,
        type: string,
        mouseEvent: MouseEvent | Touch,
        nudgeX?: number,
        nudgeY?: number,
        ePopup: HTMLElement,
    }): void {

        const {x, y} = this.calculatePointerAlign(params.mouseEvent);
        const { ePopup, nudgeX, nudgeY} = params;

        this.positionPopup({
            ePopup: ePopup,
            x,
            y,
            nudgeX,
            nudgeY,
            keepWithinBounds: true
        });

        this.callPostProcessPopup(params.ePopup, null, params.mouseEvent, params.type, params.column, params.rowNode);
    }

    private calculatePointerAlign(e: MouseEvent | Touch): { x: number, y: number } {
        const eDocument = this.getDocument();
        const popupParent = this.getPopupParent();
        const parentRect = popupParent.getBoundingClientRect();
        const documentRect = eDocument.documentElement!.getBoundingClientRect();

        return {
            x: e.clientX - (popupParent === eDocument.body ? documentRect.left : parentRect.left),
            y: e.clientY - (popupParent === eDocument.body ? documentRect.top : parentRect.top)
        };
    }

    public positionPopupUnderComponent(params: {
        type: string,
        eventSource: HTMLElement,
        ePopup: HTMLElement,
        column?: Column,
        rowNode?: RowNode,
        minWidth?: number,
        minHeight?: number,
        nudgeX?: number,
        nudgeY?: number,
        alignSide?: 'left' | 'right',
        keepWithinBounds?: boolean
    }) {
        const sourceRect = params.eventSource.getBoundingClientRect();
        const eDocument = this.getDocument();
        const popupParent = this.getPopupParent();
        const alignSide = params.alignSide || 'left';

        let parentRect: ClientRect;

        if (popupParent === eDocument.body) {
            parentRect = eDocument.documentElement!.getBoundingClientRect();
        } else {
            parentRect = popupParent.getBoundingClientRect();
        }

        let x = sourceRect.left - parentRect.left;

        if (alignSide === 'right') {
            x -= (params.ePopup.offsetWidth - sourceRect.width);
        }

        this.positionPopup({
            ePopup: params.ePopup,
            minWidth: params.minWidth,
            minHeight: params.minHeight,
            nudgeX: params.nudgeX,
            nudgeY: params.nudgeY,
            x,
            y: sourceRect.top - parentRect.top + sourceRect.height,
            keepWithinBounds: params.keepWithinBounds
        });

        this.callPostProcessPopup(params.ePopup, params.eventSource, null, params.type, params.column, params.rowNode);
    }

    public positionPopupOverComponent(params: {
        type: string,
        eventSource: HTMLElement,
        ePopup: HTMLElement | null,
        column: Column,
        rowNode: RowNode,
        minWidth?: number,
        nudgeX?: number,
        nudgeY?: number,
        keepWithinBounds?: boolean
    }) {

        const sourceRect = params.eventSource.getBoundingClientRect();
        const eDocument = this.getDocument();
        const popupParent = this.getPopupParent();

        let parentRect: ClientRect;

        if (popupParent === eDocument.body) {
            parentRect = eDocument.documentElement!.getBoundingClientRect();
        } else {
            parentRect = popupParent.getBoundingClientRect();
        }

        this.positionPopup({
            ePopup: params.ePopup,
            minWidth: params.minWidth,
            nudgeX: params.nudgeX,
            nudgeY: params.nudgeY,
            x: sourceRect.left - parentRect.left,
            y: sourceRect.top - parentRect.top,
            keepWithinBounds: params.keepWithinBounds
        });

        this.callPostProcessPopup(params.ePopup, params.eventSource, null, params.type, params.column, params.rowNode);
    }

    private callPostProcessPopup(ePopup: HTMLElement | null, eventSource: HTMLElement | null, mouseEvent: MouseEvent | Touch | null, type: string, column: Column | null | undefined, rowNode: RowNode | undefined): void {
        const callback = this.gridOptionsWrapper.getPostProcessPopupFunc();
        if (callback) {
            const params: PostProcessPopupParams = {
                column: column,
                rowNode: rowNode,
                ePopup: ePopup,
                type: type,
                eventSource: eventSource,
                mouseEvent: mouseEvent
            };
            callback(params);
        }
    }

    public positionPopup(params: {
        ePopup: HTMLElement | null,
        minWidth?: number,
        minHeight?: number,
        nudgeX?: number,
        nudgeY?: number,
        x: number,
        y: number,
        keepWithinBounds?: boolean
    }): void {

        let x = params.x;
        let y = params.y;

        if (params.nudgeX) {
            x += params.nudgeX;
        }
        if (params.nudgeY) {
            y += params.nudgeY;
        }

        // if popup is overflowing to the bottom, move it up
        if (params.keepWithinBounds) {
            x = this.keepXWithinBounds(params, x);
            y = this.keepYWithinBounds(params, y);
        }

        params.ePopup!.style.left = `${x}px`;
        params.ePopup!.style.top = `${y}px`;
    }

    private keepYWithinBounds(params: { ePopup: HTMLElement | null, minHeight?: number }, y: number): number {
        const eDocument = this.gridOptionsWrapper.getDocument();
        const docElement = eDocument.documentElement;
        const popupParent = this.getPopupParent();
        const parentRect = popupParent.getBoundingClientRect();
        const documentRect = eDocument.documentElement!.getBoundingClientRect();
        const isBody = popupParent === eDocument.body;
        const defaultPadding = 3;

        let minHeight = Math.min(200, parentRect.height);
        let diff = 0;

        if (params.minHeight && params.minHeight < minHeight) {
            minHeight = params.minHeight;
        } else if (params.ePopup!.offsetHeight > 0) {
            minHeight = params.ePopup!.clientHeight;
            diff = _.getAbsoluteHeight(params.ePopup) - minHeight;
        }

        let heightOfParent = isBody ? (_.getAbsoluteHeight(docElement) + docElement!.scrollTop) : parentRect.height;
        if (isBody) {
            heightOfParent -= Math.abs(documentRect.top - parentRect.top);
        }
        const maxY = heightOfParent - minHeight - diff - defaultPadding;

        return Math.min(Math.max(y, 0), Math.abs(maxY));
    }

    private keepXWithinBounds(params: { minWidth?: number, ePopup: HTMLElement }, x: number): number {
        const eDocument = this.gridOptionsWrapper.getDocument();
        const docElement = eDocument.documentElement;
        const popupParent = this.getPopupParent();
        const parentRect = popupParent.getBoundingClientRect();
        const documentRect = eDocument.documentElement!.getBoundingClientRect();
        const isBody = popupParent === eDocument.body;
        const defaultPadding = 3;
        const ePopup = params.ePopup;

        let minWidth = Math.min(200, parentRect.width);
        let diff = 0;

        if (params.minWidth && params.minWidth < minWidth) {
            minWidth = params.minWidth;
        } else if (ePopup.offsetWidth > 0) {
            minWidth = ePopup.offsetWidth;
            ePopup.style.minWidth = `${minWidth}px`;
            diff = _.getAbsoluteWidth(ePopup) - minWidth;
        }

        let widthOfParent = isBody ? (_.getAbsoluteWidth(docElement!) + docElement!.scrollLeft) : parentRect.width;

        if (isBody) {
            widthOfParent -= Math.abs(documentRect.left - parentRect.left);
        }

        const maxX = widthOfParent - minWidth - diff - defaultPadding;

        return Math.min(Math.max(x, 0), Math.abs(maxX));
    }

    // adds an element to a div, but also listens to background checking for clicks,
    // so that when the background is clicked, the child is removed again, giving
    // a model look to popups.
    public addAsModalPopup(eChild: any, closeOnEsc: boolean, closedCallback?: () => void, click?: MouseEvent | Touch | null): (event?: any) => void {
        return this.addPopup(true, eChild, closeOnEsc, closedCallback, click);
    }

    public addPopup(
        modal: boolean,
        eChild: any,
        closeOnEsc: boolean,
        closedCallback?: () => void,
        click?: MouseEvent | Touch | null,
        alwaysOnTop?: boolean
    ): (event?: any) => void {
        const eDocument = this.gridOptionsWrapper.getDocument();

        if (!eDocument) {
            console.warn('ag-grid: could not find the document, document is empty');
            return () => {};
        }

        const pos = _.findIndex(this.popupList, popup => popup.element === eChild);

        if (pos !== -1) {
            const popup = this.popupList[pos];
            return popup.hideFunc;
        }

        const ePopupParent = this.getPopupParent();

        // for angular specifically, but shouldn't cause an issue with js or other fw's
        // https://github.com/angular/angular/issues/8563
        ePopupParent.appendChild(eChild);

        eChild.style.top = '0px';
        eChild.style.left = '0px';

        // add env CSS class to child, in case user provided a popup parent, which means
        // theme class may be missing
        const eWrapper = document.createElement('div');
        const { theme } = this.environment.getTheme();

        if (theme) {
            _.addCssClass(eWrapper, theme);
        }

        _.addCssClass(eWrapper, 'ag-popup');
        _.addCssClass(eChild, this.gridOptionsWrapper.isEnableRtl() ? 'ag-rtl' : 'ag-ltr');

        eWrapper.appendChild(eChild);

        ePopupParent.appendChild(eWrapper);

        if (alwaysOnTop) {
            this.setAlwaysOnTop(eWrapper, true);
        } else {
            this.bringPopupToFront(eWrapper);
        }

        let popupHidden = false;

        const hidePopupOnKeyboardEvent = (event: KeyboardEvent) => {
            const key = event.which || event.keyCode;
            if (key === Constants.KEY_ESCAPE && eWrapper.contains(document.activeElement)) {
                hidePopup(null);
            }
        };

        const hidePopupOnMouseEvent = (event: MouseEvent) => {
            hidePopup(event);
        };

        const hidePopupOnTouchEvent = (event: TouchEvent) => {
            hidePopup(null, event);
        };

        const hidePopup = (mouseEvent?: MouseEvent | null, touchEvent?: TouchEvent) => {
            if (
                // we don't hide popup if the event was on the child, or any
                // children of this child
                this.isEventFromCurrentPopup(mouseEvent, touchEvent, eChild) ||
                // if the event to close is actually the open event, then ignore it
                this.isEventSameChainAsOriginalEvent(click, mouseEvent, touchEvent) ||
                // this method should only be called once. the client can have different
                // paths, each one wanting to close, so this method may be called multiple times.
                popupHidden
            ) {
                return;
            }

            popupHidden = true;

            ePopupParent.removeChild(eWrapper);

            eDocument.removeEventListener('keydown', hidePopupOnKeyboardEvent);
            eDocument.removeEventListener('mousedown', hidePopupOnMouseEvent);
            eDocument.removeEventListener('touchstart', hidePopupOnTouchEvent);
            eDocument.removeEventListener('contextmenu', hidePopupOnMouseEvent);
            this.eventService.removeEventListener(Events.EVENT_DRAG_STARTED, hidePopupOnMouseEvent);

            if (closedCallback) {
                closedCallback();
            }

            this.popupList = this.popupList.filter(popup => popup.element !== eChild);
        };

        // if we add these listeners now, then the current mouse
        // click will be included, which we don't want
        window.setTimeout(() => {
            if (closeOnEsc) {
                eDocument.addEventListener('keydown', hidePopupOnKeyboardEvent);
            }
            if (modal) {
                eDocument.addEventListener('mousedown', hidePopupOnMouseEvent);
                this.eventService.addEventListener(Events.EVENT_DRAG_STARTED, hidePopupOnMouseEvent);
                eDocument.addEventListener('touchstart', hidePopupOnTouchEvent);
                eDocument.addEventListener('contextmenu', hidePopupOnMouseEvent);
            }
        }, 0);

        this.popupList.push({
            element: eChild,
            hideFunc: hidePopup
        });

        return hidePopup;
    }

    private isEventFromCurrentPopup(mouseEvent: MouseEvent | null | undefined, touchEvent: TouchEvent | undefined, eChild: HTMLElement): boolean {
        const event = mouseEvent ? mouseEvent : touchEvent;

        if (!event) {
            return false;
        }

        const indexOfThisChild = _.findIndex(this.popupList, popup => popup.element === eChild);

        if (indexOfThisChild === -1) {
            return false;
        }

        for (let i = indexOfThisChild; i < this.popupList.length; i++) {
            const popup = this.popupList[i];

            if (_.isElementInEventPath(popup.element, event)) {
                return true;
            }
        }

        // if the user did not write their own Custom Element to be rendered as popup
        // and this component has additional popup element, they should have the
        // `ag-custom-component-popup` class to be detected as part of the Custom Component
        let el = event.target as HTMLElement;
        while (el && el != document.body) {
            if (el.classList.contains('ag-custom-component-popup') || el.parentElement === null) { return true; }
            el = el.parentElement;
        }
    }

    // in some browsers, the context menu event can be fired before the click event, which means
    // the context menu event could open the popup, but then the click event closes it straight away.
    private isEventSameChainAsOriginalEvent(originalClick: MouseEvent | Touch | undefined | null, mouseEvent: MouseEvent | undefined | null, touchEvent: TouchEvent | undefined): boolean {
        // we check the coordinates of the event, to see if it's the same event. there is a 1 / 1000 chance that
        // the event is a different event, however that is an edge case that is not very relevant (the user clicking
        // twice on the same location isn't a normal path).

        // event could be mouse event or touch event.
        let mouseEventOrTouch: MouseEvent | Touch | null = null;
        if (mouseEvent) {
            // mouse event can be used direction, it has coordinates
            mouseEventOrTouch = mouseEvent;
        } else if (touchEvent) {
            // touch event doesn't have coordinates, need it's touch object
            mouseEventOrTouch = touchEvent.touches[0];
        }
        if (mouseEventOrTouch && originalClick) {
            // for x, allow 4px margin, to cover iPads, where touch (which opens menu) is followed
            // by browser click (when you life finger up, touch is interrupted as click in browser)
            const screenX = mouseEvent ? mouseEvent.screenX : 0;
            const screenY = mouseEvent ? mouseEvent.screenY : 0;

            const xMatch = Math.abs(originalClick.screenX - screenX) < 5;
            const yMatch = Math.abs(originalClick.screenY - screenY) < 5;

            if (xMatch && yMatch) {
                return true;
            }
        }

        return false;
    }

    private getWrapper(ePopup: HTMLElement): HTMLElement | null {
        while (!_.containsClass(ePopup, 'ag-popup') && ePopup.parentElement) {
            ePopup = ePopup.parentElement;
        }

        return _.containsClass(ePopup, 'ag-popup') ? ePopup : null;
    }

    public setAlwaysOnTop(ePopup: HTMLElement, alwaysOnTop?: boolean): void {
        const eWrapper = this.getWrapper(ePopup);

        if (!eWrapper) { return; }

        _.addOrRemoveCssClass(eWrapper, 'ag-always-on-top', !!alwaysOnTop);

        if (alwaysOnTop) {
            this.bringPopupToFront(eWrapper);
        }
    }

    public bringPopupToFront(ePopup: HTMLElement) {
        const parent = this.getPopupParent();
        const popupList = Array.prototype.slice.call(parent.querySelectorAll('.ag-popup'));
        const popupLen = popupList.length;
        const alwaysOnTopList = Array.prototype.slice.call(parent.querySelectorAll('.ag-popup.ag-always-on-top'));
        const onTopLength = alwaysOnTopList.length;
        const eWrapper = this.getWrapper(ePopup);

        if (!eWrapper || popupLen <= 1 || !parent.contains(ePopup)) { return; }

        const pos = popupList.indexOf(eWrapper);

        if (onTopLength) {
            const isPopupAlwaysOnTop = _.containsClass(eWrapper, 'ag-always-on-top');
            if (isPopupAlwaysOnTop) {
                if (pos !== popupLen - 1) {
                    (_.last(alwaysOnTopList) as HTMLElement).insertAdjacentElement('afterend', eWrapper);
                }
            } else if (pos !== popupLen - onTopLength - 1) {
                alwaysOnTopList[0].insertAdjacentElement('beforebegin', eWrapper);
            }
        } else if (pos !== popupLen - 1) {
            (_.last(popupList) as HTMLElement).insertAdjacentElement('afterend', eWrapper);
        }

        const params = {
            type: 'popupToFront',
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi(),
            eWrapper
        };

        this.eventService.dispatchEvent(params);
    }
}
