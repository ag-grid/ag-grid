import {Utils as _} from "../utils";
import {Constants} from "../constants";
import {Autowired, Bean} from "../context/context";
import {GridCore} from "../gridCore";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {PostProcessPopupParams} from "../entities/gridOptions";
import {RowNode} from "../entities/rowNode";
import {Column} from "../entities/column";
import {Environment} from "../environment";

@Bean('popupService')
export class PopupService {

    // really this should be using eGridDiv, not sure why it's not working.
    // maybe popups in the future should be parent to the body??
    @Autowired('gridCore') private gridCore: GridCore;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('environment') private environment: Environment;

    private activePopupElements: HTMLElement[] = [];

    private getDocument(): Document {
        return this.gridOptionsWrapper.getDocument();
    }

    private getPopupParent(): HTMLElement {
        let ePopupParent = this.gridOptionsWrapper.getPopupParent();
        if (ePopupParent) {
            // user provided popup parent, may not have the right theme applied
            return ePopupParent;
        } else {
            return this.gridCore.getRootGui();
        }
    }

    public positionPopupForMenu(params: { eventSource: HTMLElement, ePopup: HTMLElement }) {
        const sourceRect = params.eventSource.getBoundingClientRect();
        const eDocument = this.getDocument();
        const popupParent = this.getPopupParent();

        let parentRect:ClientRect;

        if (popupParent === eDocument.body) {
            parentRect = eDocument.documentElement.getBoundingClientRect();
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
        ePopup: HTMLElement
    }): void {

        const {x, y} = this.calculatePointerAlign(params.mouseEvent);
        this.positionPopup({
            ePopup: params.ePopup,
            x,
            y,
            keepWithinBounds: true
        });

        this.callPostProcessPopup(params.ePopup, null, params.mouseEvent, params.type, params.column, params.rowNode);
    }
    private calculatePointerAlign(e: MouseEvent | Touch): {x: number, y: number} {
        const eDocument = this.getDocument();
        const popupParent = this.getPopupParent();
        const parentRect = popupParent.getBoundingClientRect();
        const documentRect = eDocument.documentElement.getBoundingClientRect();

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
        keepWithinBounds?: boolean
    }) {

        const sourceRect = params.eventSource.getBoundingClientRect();
        const eDocument = this.getDocument();
        const popupParent = this.getPopupParent();

        let parentRect:ClientRect;

        if (popupParent === eDocument.body) {
            parentRect = eDocument.documentElement.getBoundingClientRect();
        } else {
            parentRect = popupParent.getBoundingClientRect();
        }

        this.positionPopup({
            ePopup: params.ePopup,
            minWidth: params.minWidth,
            minHeight: params.minHeight,
            nudgeX: params.nudgeX,
            nudgeY: params.nudgeY,
            x: sourceRect.left - parentRect.left,
            y: sourceRect.top - parentRect.top + sourceRect.height,
            keepWithinBounds: params.keepWithinBounds
        });

        this.callPostProcessPopup(params.ePopup, params.eventSource, null, params.type, params.column, params.rowNode);
    }

    private callPostProcessPopup(ePopup: HTMLElement, eventSource: HTMLElement | null, mouseEvent: MouseEvent | Touch | null, type: string, column: Column | null | undefined, rowNode: RowNode | undefined): void {
        let callback = this.gridOptionsWrapper.getPostProcessPopupFunc();
        if (callback) {
            let params: PostProcessPopupParams = {
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

    public positionPopupOverComponent(params: {
        type: string,
        eventSource: HTMLElement,
        ePopup: HTMLElement,
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

        let parentRect:ClientRect;

        if (popupParent === eDocument.body) {
            parentRect = eDocument.documentElement.getBoundingClientRect();
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

    private positionPopup(params: {
        ePopup: HTMLElement,
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

        params.ePopup.style.left = `${x}px`;
        params.ePopup.style.top = `${y}px`;
    }

    private keepYWithinBounds(params: { ePopup: HTMLElement, minHeight?: number }, y: number): number {
        const eDocument = this.gridOptionsWrapper.getDocument();
        const docElement = eDocument.documentElement;
        const popupParent = this.getPopupParent();
        const parentRect = popupParent.getBoundingClientRect();
        const documentRect = eDocument.documentElement.getBoundingClientRect();
        const isBody = popupParent === eDocument.body;
        const defaultPadding = 3;

        let minHeight = Math.min(200, parentRect.height);
        let diff = 0;

        if (params.minHeight && params.minHeight < minHeight) {
            minHeight = params.minHeight;
        } else if (params.ePopup.offsetHeight > 0) {
            minHeight = params.ePopup.clientHeight;
            diff = _.getAbsoluteHeight(params.ePopup) - minHeight;
        }

        let heightOfParent = isBody ? (_.getAbsoluteHeight(docElement) + docElement.scrollTop) : parentRect.height;
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
        const documentRect = eDocument.documentElement.getBoundingClientRect();
        const isBody = popupParent === eDocument.body;
        const defaultPadding = 3;

        let minWidth = Math.min(200, parentRect.width);
        let diff = 0;

        if (params.minWidth && params.minWidth < minWidth) {
            minWidth = params.minWidth;
        } else if (params.ePopup.clientWidth > 0) {
            minWidth = params.ePopup.clientWidth;
            params.ePopup.style.minWidth = `${minWidth}px`;
            diff = _.getAbsoluteWidth(params.ePopup) - minWidth;
        }

        let widthOfParent = isBody ? (_.getAbsoluteWidth(docElement) + docElement.scrollLeft) : parentRect.width;
        if (isBody) {
            widthOfParent -= Math.abs(documentRect.left - parentRect.left);
        }

        const maxX = widthOfParent - minWidth - diff - defaultPadding;

        return Math.min(Math.max(x, 0), Math.abs(maxX));
    }

    //adds an element to a div, but also listens to background checking for clicks,
    //so that when the background is clicked, the child is removed again, giving
    //a model look to popups.
    public addAsModalPopup(eChild: any, closeOnEsc: boolean, closedCallback?: () => void, click?: MouseEvent | Touch): (event?: any) => void {
        return this.addPopup(true, eChild, closeOnEsc, closedCallback, click);
    }

    public addPopup(modal: boolean, eChild: any, closeOnEsc: boolean, closedCallback?: () => void, click?: MouseEvent | Touch): (event?: any) => void {

        let eDocument = this.gridOptionsWrapper.getDocument();
        if (!eDocument) {
            console.warn('ag-grid: could not find the document, document is empty');
            return;
        }

        eChild.style.top = '0px';
        eChild.style.left = '0px';

        let popupAlreadyShown = _.isVisible(eChild);
        if (popupAlreadyShown) {
            return;
        }

        let ePopupParent = this.getPopupParent();

        // add env CSS class to child, in case user provided a popup parent, which means
        // theme class may be missing
        let eWrapper = document.createElement('div');
        _.addCssClass(eWrapper, this.environment.getTheme());
        eWrapper.appendChild(eChild);

        ePopupParent.appendChild(eWrapper);
        this.activePopupElements.push(eChild);

        let popupHidden = false;

        let hidePopupOnKeyboardEvent = (event: KeyboardEvent) => {
            let key = event.which || event.keyCode;
            if (key === Constants.KEY_ESCAPE) {
                hidePopup(null);
            }
        };

        let hidePopupOnMouseEvent = (event: MouseEvent) => {
            hidePopup(event);
        };

        let hidePopupOnTouchEvent = (event: TouchEvent) => {
            hidePopup(null, event);
        };

        let hidePopup = (mouseEvent?: MouseEvent | null, touchEvent?: TouchEvent) => {
            // we don't hide popup if the event was on the child, or any
            // children of this child
            if (this.isEventFromCurrentPopup(mouseEvent, touchEvent, eChild)) {
                return;
            }

            // if the event to close is actually the open event, then ignore it
            if (this.isEventSameChainAsOriginalEvent(click, mouseEvent, touchEvent)) {
                return;
            }

            // this method should only be called once. the client can have different
            // paths, each one wanting to close, so this method may be called multiple times.
            if (popupHidden) {
                return;
            }
            popupHidden = true;

            ePopupParent.removeChild(eWrapper);
            _.removeFromArray(this.activePopupElements, eChild);

            eDocument.removeEventListener('keydown', hidePopupOnKeyboardEvent);
            eDocument.removeEventListener('mousedown', hidePopupOnMouseEvent);
            eDocument.removeEventListener('touchstart', hidePopupOnTouchEvent);
            eDocument.removeEventListener('contextmenu', hidePopupOnMouseEvent);
            if (closedCallback) {
                closedCallback();
            }
        };

        // if we add these listeners now, then the current mouse
        // click will be included, which we don't want
        window.setTimeout(function() {
            if (closeOnEsc) {
                eDocument.addEventListener('keydown', hidePopupOnKeyboardEvent);
            }
            if (modal) {
                eDocument.addEventListener('mousedown', hidePopupOnMouseEvent);
                eDocument.addEventListener('touchstart', hidePopupOnTouchEvent);
                eDocument.addEventListener('contextmenu', hidePopupOnMouseEvent);
            }
        }, 0);

        return hidePopup;
    }

    private isEventFromCurrentPopup(mouseEvent: MouseEvent | null | undefined, touchEvent: TouchEvent | undefined, eChild: HTMLElement): boolean {
        let event = mouseEvent ? mouseEvent : touchEvent;
        if (event) {
            let indexOfThisChild = this.activePopupElements.indexOf(eChild);
            for (let i = indexOfThisChild; i < this.activePopupElements.length; i++) {
                let element = this.activePopupElements[i];
                if (_.isElementInEventPath(element, event)) {
                    return true;
                }
            }
        }

        return false;
    }

    // in some browsers, the context menu event can be fired before the click event, which means
    // the context menu event could open the popup, but then the click event closes it straight away.
    private isEventSameChainAsOriginalEvent(originalClick: MouseEvent | Touch | undefined, mouseEvent: MouseEvent | undefined | null, touchEvent: TouchEvent | undefined): boolean {
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

            let xMatch = Math.abs(originalClick.screenX - screenX) < 5;
            let yMatch = Math.abs(originalClick.screenY - screenY) < 5;
            if (xMatch && yMatch) {
                return true;
            }
        }

        return false;
    }
}
