import {Utils as _} from "../utils";
import {Constants} from "../constants";
import {Bean, Autowired} from "../context/context";
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

    private getPopupParent(): HTMLElement {
        let ePopupParent = this.gridOptionsWrapper.getPopupParent();
        if (ePopupParent) {
            // user provided popup parent, may not have the right theme applied
            return ePopupParent;
        } else {
            return this.gridCore.getRootGui();
        }
    }

    public positionPopupForMenu(params: {eventSource: any, ePopup: HTMLElement}) {

        let sourceRect = params.eventSource.getBoundingClientRect();
        let parentRect = this.getPopupParent().getBoundingClientRect();

        let y = sourceRect.top - parentRect.top;

        y = this.keepYWithinBounds(params, y);

        let minWidth = (params.ePopup.clientWidth > 0) ? params.ePopup.clientWidth: 200;
        let widthOfParent = parentRect.right - parentRect.left;
        let maxX = widthOfParent - minWidth;

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

        params.ePopup.style.left = x + "px";
        params.ePopup.style.top = y + "px";

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
                            mouseEvent: MouseEvent|Touch,
                            ePopup: HTMLElement}): void {

        let parentRect = this.getPopupParent().getBoundingClientRect();

        this.positionPopup({
            ePopup: params.ePopup,
            x: params.mouseEvent.clientX - parentRect.left,
            y: params.mouseEvent.clientY - parentRect.top,
            keepWithinBounds: true
        });

        this.callPostProcessPopup(params.ePopup, null, params.mouseEvent, params.type, params.column, params.rowNode);
    }

    public positionPopupUnderComponent(params: {
                            type: string,
                            eventSource: HTMLElement,
                            ePopup: HTMLElement,
                            column?: Column,
                            rowNode?: RowNode,
                            minWidth?: number,
                            nudgeX?: number,
                            nudgeY?: number,
                            keepWithinBounds?: boolean}) {

        let sourceRect = params.eventSource.getBoundingClientRect();
        let parentRect = this.getPopupParent().getBoundingClientRect();

        this.positionPopup({
            ePopup: params.ePopup,
            minWidth: params.minWidth,
            nudgeX: params.nudgeX,
            nudgeY: params.nudgeY,
            x: sourceRect.left - parentRect.left,
            y: sourceRect.top - parentRect.top + sourceRect.height,
            keepWithinBounds: params.keepWithinBounds
        });

        this.callPostProcessPopup(params.ePopup, params.eventSource, null, params.type, params.column, params.rowNode);
    }

    private callPostProcessPopup(ePopup: HTMLElement, eventSource: HTMLElement, mouseEvent: MouseEvent|Touch, type:string, column: Column, rowNode: RowNode): void {
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
        keepWithinBounds?: boolean}) {

        let sourceRect = params.eventSource.getBoundingClientRect();
        let parentRect = this.getPopupParent().getBoundingClientRect();

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
                        nudgeX?: number,
                        nudgeY?: number,
                        x: number,
                        y: number,
                        keepWithinBounds?: boolean}): void {

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

        params.ePopup.style.left = x + "px";
        params.ePopup.style.top = y + "px";

    }

    private keepYWithinBounds(params: {ePopup: HTMLElement}, y: number): number {
        let parentRect = this.getPopupParent().getBoundingClientRect();

        let minHeight: number;
        if (params.ePopup.clientHeight > 0) {
            minHeight = params.ePopup.clientHeight;
        } else {
            minHeight = 200;
        }

        let heightOfParent = parentRect.bottom - parentRect.top;
        let maxY = heightOfParent - minHeight - 5;
        if (y > maxY) { // move position left, back into view
            return maxY;
        } else if (y < 0) { // in case the popup has a negative value
            return 0;
        } else {
            return y;
        }

    }

    private keepXWithinBounds(params: {minWidth?: number, ePopup: HTMLElement}, x: number): number {
        let parentRect = this.getPopupParent().getBoundingClientRect();

        let minWidth: number;
        if (params.minWidth > 0) {
            minWidth = params.minWidth;
        } else if (params.ePopup.clientWidth>0) {
            minWidth = params.ePopup.clientWidth;
        } else {
            minWidth = 200;
        }

        let widthOfParent = parentRect.right - parentRect.left;
        let maxX = widthOfParent - minWidth - 5;
        if (x > maxX) { // move position left, back into view
            return maxX;
        } else if (x < 0) { // in case the popup has a negative value
            return 0;
        } else {
            return x;
        }
    }

    //adds an element to a div, but also listens to background checking for clicks,
    //so that when the background is clicked, the child is removed again, giving
    //a model look to popups.
    public addAsModalPopup(eChild: any, closeOnEsc: boolean, closedCallback?: ()=>void, click?: MouseEvent | Touch): (event?: any)=>void {

        let eBody = this.gridOptionsWrapper.getDocument();
        if (!eBody) {
            console.warn('ag-grid: could not find the body of the document, document.body is empty');
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

        let hidePopup = (mouseEvent?: MouseEvent, touchEvent?: TouchEvent) => {
            // we don't hide popup if the event was on the child, or any
            // children of this child
            if (this.isEventFromCurrentPopup(mouseEvent, touchEvent, eChild)) { return; }

            // if the event to close is actually the open event, then ignore it
            if (this.isEventSameChainAsOriginalEvent(click, mouseEvent, touchEvent)) { return; }

            // this method should only be called once. the client can have different
            // paths, each one wanting to close, so this method may be called multiple times.
            if (popupHidden) { return; }
            popupHidden = true;

            ePopupParent.removeChild(eWrapper);
            _.removeFromArray(this.activePopupElements, eChild);

            eBody.removeEventListener('keydown', hidePopupOnKeyboardEvent);
            eBody.removeEventListener('click', hidePopupOnMouseEvent);
            eBody.removeEventListener('touchstart', hidePopupOnTouchEvent);
            eBody.removeEventListener('contextmenu', hidePopupOnMouseEvent);
            if (closedCallback) {
                closedCallback();
            }
        };

        // if we add these listeners now, then the current mouse
        // click will be included, which we don't want
        setTimeout(function() {
            if (closeOnEsc) {
                eBody.addEventListener('keydown', hidePopupOnKeyboardEvent);
            }
            eBody.addEventListener('click', hidePopupOnMouseEvent);
            eBody.addEventListener('touchstart', hidePopupOnTouchEvent);
            eBody.addEventListener('contextmenu', hidePopupOnMouseEvent);
        }, 0);

        return hidePopup;
    }

    private isEventFromCurrentPopup(mouseEvent: MouseEvent, touchEvent: TouchEvent, eChild: HTMLElement): boolean {
        let event = mouseEvent ? mouseEvent : touchEvent;
        if (event) {
            let indexOfThisChild = this.activePopupElements.indexOf(eChild);
            for (let i = indexOfThisChild; i<this.activePopupElements.length; i++) {
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
    private isEventSameChainAsOriginalEvent(originalClick: MouseEvent | Touch, mouseEvent: MouseEvent, touchEvent: TouchEvent): boolean {
        // we check the coordinates of the event, to see if it's the same event. there is a 1 / 1000 chance that
        // the event is a different event, however that is an edge case that is not very relevant (the user clicking
        // twice on the same location isn't a normal path).

        // event could be mouse event or touch event.
        let mouseEventOrTouch: MouseEvent | Touch;
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
            let xMatch = Math.abs(originalClick.screenX - mouseEvent.screenX) < 5;
            let yMatch = Math.abs(originalClick.screenY - mouseEvent.screenY) < 5;
            if (xMatch && yMatch) {
                return true;
            }
        }

        return false;
    }
}
