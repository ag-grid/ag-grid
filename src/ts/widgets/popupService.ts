import {Utils as _} from "../utils";
import {Constants} from "../constants";
import {Bean, Autowired} from "../context/context";
import {GridCore} from "../gridCore";
import {GridOptionsWrapper} from "../gridOptionsWrapper";

@Bean('popupService')
export class PopupService {

    // really this should be using eGridDiv, not sure why it's not working.
    // maybe popups in the future should be parent to the body??
    @Autowired('gridCore') private gridCore: GridCore;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    // this.popupService.setPopupParent(this.eRootPanel.getGui());

    private getPopupParent(): HTMLElement {
        return this.gridCore.getRootGui();
    }

    public positionPopupForMenu(params: {eventSource: any, ePopup: HTMLElement}) {

        var sourceRect = params.eventSource.getBoundingClientRect();
        var parentRect = this.getPopupParent().getBoundingClientRect();

        var y = sourceRect.top - parentRect.top;

        y = this.keepYWithinBounds(params, y);

        var minWidth = (params.ePopup.clientWidth > 0) ? params.ePopup.clientWidth: 200;
        var widthOfParent = parentRect.right - parentRect.left;
        var maxX = widthOfParent - minWidth;

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
                            mouseEvent: MouseEvent|Touch,
                            ePopup: HTMLElement}): void {

        var parentRect = this.getPopupParent().getBoundingClientRect();

        this.positionPopup({
            ePopup: params.ePopup,
            x: params.mouseEvent.clientX - parentRect.left,
            y: params.mouseEvent.clientY - parentRect.top,
            keepWithinBounds: true
        });
    }

    public positionPopupUnderComponent(params: {
                            eventSource: HTMLElement,
                            ePopup: HTMLElement,
                            minWidth?: number,
                            nudgeX?: number,
                            nudgeY?: number,
                            keepWithinBounds?: boolean}) {

        var sourceRect = params.eventSource.getBoundingClientRect();
        var parentRect = this.getPopupParent().getBoundingClientRect();

        this.positionPopup({
            ePopup: params.ePopup,
            minWidth: params.minWidth,
            nudgeX: params.nudgeX,
            nudgeY: params.nudgeY,
            x: sourceRect.left - parentRect.left,
            y: sourceRect.top - parentRect.top + sourceRect.height,
            keepWithinBounds: params.keepWithinBounds
        });
    }

    public positionPopupOverComponent(params: {
        eventSource: HTMLElement,
        ePopup: HTMLElement,
        minWidth?: number,
        nudgeX?: number,
        nudgeY?: number,
        keepWithinBounds?: boolean}) {

        var sourceRect = params.eventSource.getBoundingClientRect();
        var parentRect = this.getPopupParent().getBoundingClientRect();

        this.positionPopup({
            ePopup: params.ePopup,
            minWidth: params.minWidth,
            nudgeX: params.nudgeX,
            nudgeY: params.nudgeY,
            x: sourceRect.left - parentRect.left,
            y: sourceRect.top - parentRect.top,
            keepWithinBounds: params.keepWithinBounds
        });
    }
    
    private positionPopup(params: {
                        ePopup: HTMLElement,
                        minWidth?: number,
                        nudgeX?: number,
                        nudgeY?: number,
                        x: number,
                        y: number,
                        keepWithinBounds?: boolean}): void {

        var x = params.x;
        var y = params.y;

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
        var parentRect = this.getPopupParent().getBoundingClientRect();

        var minHeight: number;
        if (params.ePopup.clientHeight > 0) {
            minHeight = params.ePopup.clientHeight;
        } else {
            minHeight = 200;
        }

        var heightOfParent = parentRect.bottom - parentRect.top;
        var maxY = heightOfParent - minHeight - 5;
        if (y > maxY) { // move position left, back into view
            return maxY;
        } else if (y < 0) { // in case the popup has a negative value
            return 0;
        } else {
            return y;
        }

    }

    private keepXWithinBounds(params: {minWidth?: number, ePopup: HTMLElement}, x: number): number {
        var parentRect = this.getPopupParent().getBoundingClientRect();

        var minWidth: number;
        if (params.minWidth > 0) {
            minWidth = params.minWidth;
        } else if (params.ePopup.clientWidth>0) {
            minWidth = params.ePopup.clientWidth;
        } else {
            minWidth = 200;
        }

        var widthOfParent = parentRect.right - parentRect.left;
        var maxX = widthOfParent - minWidth - 5;
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
    public addAsModalPopup(eChild: any, closeOnEsc: boolean, closedCallback?: ()=>void): (event?: any)=>void {
        var eBody = document.body;
        if (!eBody) {
            console.warn('ag-grid: could not find the body of the document, document.body is empty');
            return;
        }

        eChild.style.top = '0px';
        eChild.style.left = '0px';

        var popupAlreadyShown = _.isVisible(eChild);
        if (popupAlreadyShown) {
            return;
        }

        this.getPopupParent().appendChild(eChild);

        var that = this;

        var popupHidden = false;

        // if we add these listeners now, then the current mouse
        // click will be included, which we don't want
        setTimeout(function() {
            if (closeOnEsc) {
                eBody.addEventListener('keydown', hidePopupOnEsc);
            }
            eBody.addEventListener('click', hidePopup);
            eBody.addEventListener('touchstart', hidePopup);
            eBody.addEventListener('contextmenu', hidePopup);
            //eBody.addEventListener('mousedown', hidePopup);
            eChild.addEventListener('click', consumeMouseClick);
            eChild.addEventListener('touchstart', consumeTouchClick);
            //eChild.addEventListener('mousedown', consumeClick);
        }, 0);

        // var timeOfMouseEventOnChild = new Date().getTime();
        var childMouseClick: MouseEvent = null;
        var childTouch: TouchEvent = null;

        function hidePopupOnEsc(event: any) {
            var key = event.which || event.keyCode;
            if (key === Constants.KEY_ESCAPE) {
                hidePopup(null);
            }
        }

        function hidePopup(event?: any) {
            // we don't hide popup if the event was on the child
            if (event && event === childMouseClick) { return; }
            if (event && event === childTouch) { return; }
            // this method should only be called once. the client can have different
            // paths, each one wanting to close, so this method may be called multiple
            // times.
            if (popupHidden) {
                return;
            }
            popupHidden = true;

            that.getPopupParent().removeChild(eChild);
            eBody.removeEventListener('keydown', hidePopupOnEsc);
            //eBody.removeEventListener('mousedown', hidePopupOnEsc);
            eBody.removeEventListener('click', hidePopup);
            eBody.removeEventListener('touchstart', hidePopup);
            eBody.removeEventListener('contextmenu', hidePopup);
            eChild.removeEventListener('click', consumeMouseClick);
            eChild.removeEventListener('touchstart', consumeTouchClick);
            //eChild.removeEventListener('mousedown', consumeClick);
            if (closedCallback) {
                closedCallback();
            }
        }

        function consumeMouseClick(event: any) {
            childMouseClick = event;
        }
        function consumeTouchClick(event: any) {
            childTouch = event;
        }

        return hidePopup;
    }
}
