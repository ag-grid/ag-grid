/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v9.0.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils");
var constants_1 = require("../constants");
var context_1 = require("../context/context");
var gridCore_1 = require("../gridCore");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var PopupService = (function () {
    function PopupService() {
    }
    // this.popupService.setPopupParent(this.eRootPanel.getGui());
    PopupService.prototype.getPopupParent = function () {
        return this.gridCore.getRootGui();
    };
    PopupService.prototype.positionPopupForMenu = function (params) {
        var sourceRect = params.eventSource.getBoundingClientRect();
        var parentRect = this.getPopupParent().getBoundingClientRect();
        var y = sourceRect.top - parentRect.top;
        y = this.keepYWithinBounds(params, y);
        var minWidth = (params.ePopup.clientWidth > 0) ? params.ePopup.clientWidth : 200;
        var widthOfParent = parentRect.right - parentRect.left;
        var maxX = widthOfParent - minWidth;
        // the x position of the popup depends on RTL or LTR. for normal cases, LTR, we put the child popup
        // to the right, unless it doesn't fit and we then put it to the left. for RTL it's the other way around,
        // we try place it first to the left, and then if not to the right.
        var x;
        if (this.gridOptionsWrapper.isEnableRtl()) {
            // for RTL, try left first
            x = xLeftPosition();
            if (x < 0) {
                x = xRightPosition();
            }
            if (x > maxX) {
                x = 0;
            }
        }
        else {
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
        function xRightPosition() {
            return sourceRect.right - parentRect.left - 2;
        }
        function xLeftPosition() {
            return sourceRect.left - parentRect.left - minWidth;
        }
    };
    PopupService.prototype.positionPopupUnderMouseEvent = function (params) {
        var parentRect = this.getPopupParent().getBoundingClientRect();
        this.positionPopup({
            ePopup: params.ePopup,
            x: params.mouseEvent.clientX - parentRect.left,
            y: params.mouseEvent.clientY - parentRect.top,
            keepWithinBounds: true
        });
    };
    PopupService.prototype.positionPopupUnderComponent = function (params) {
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
    };
    PopupService.prototype.positionPopupOverComponent = function (params) {
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
    };
    PopupService.prototype.positionPopup = function (params) {
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
    };
    PopupService.prototype.keepYWithinBounds = function (params, y) {
        var parentRect = this.getPopupParent().getBoundingClientRect();
        var minHeight;
        if (params.ePopup.clientHeight > 0) {
            minHeight = params.ePopup.clientHeight;
        }
        else {
            minHeight = 200;
        }
        var heightOfParent = parentRect.bottom - parentRect.top;
        var maxY = heightOfParent - minHeight - 5;
        if (y > maxY) {
            return maxY;
        }
        else if (y < 0) {
            return 0;
        }
        else {
            return y;
        }
    };
    PopupService.prototype.keepXWithinBounds = function (params, x) {
        var parentRect = this.getPopupParent().getBoundingClientRect();
        var minWidth;
        if (params.minWidth > 0) {
            minWidth = params.minWidth;
        }
        else if (params.ePopup.clientWidth > 0) {
            minWidth = params.ePopup.clientWidth;
        }
        else {
            minWidth = 200;
        }
        var widthOfParent = parentRect.right - parentRect.left;
        var maxX = widthOfParent - minWidth - 5;
        if (x > maxX) {
            return maxX;
        }
        else if (x < 0) {
            return 0;
        }
        else {
            return x;
        }
    };
    //adds an element to a div, but also listens to background checking for clicks,
    //so that when the background is clicked, the child is removed again, giving
    //a model look to popups.
    PopupService.prototype.addAsModalPopup = function (eChild, closeOnEsc, closedCallback) {
        var eBody = document.body;
        if (!eBody) {
            console.warn('ag-grid: could not find the body of the document, document.body is empty');
            return;
        }
        eChild.style.top = '0px';
        eChild.style.left = '0px';
        var popupAlreadyShown = utils_1.Utils.isVisible(eChild);
        if (popupAlreadyShown) {
            return;
        }
        this.getPopupParent().appendChild(eChild);
        var that = this;
        var popupHidden = false;
        // if we add these listeners now, then the current mouse
        // click will be included, which we don't want
        setTimeout(function () {
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
        var childMouseClick = null;
        var childTouch = null;
        function hidePopupOnEsc(event) {
            var key = event.which || event.keyCode;
            if (key === constants_1.Constants.KEY_ESCAPE) {
                hidePopup(null);
            }
        }
        function hidePopup(event) {
            // we don't hide popup if the event was on the child
            if (event && event === childMouseClick) {
                return;
            }
            if (event && event === childTouch) {
                return;
            }
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
        function consumeMouseClick(event) {
            childMouseClick = event;
        }
        function consumeTouchClick(event) {
            childTouch = event;
        }
        return hidePopup;
    };
    return PopupService;
}());
__decorate([
    context_1.Autowired('gridCore'),
    __metadata("design:type", gridCore_1.GridCore)
], PopupService.prototype, "gridCore", void 0);
__decorate([
    context_1.Autowired('gridOptionsWrapper'),
    __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
], PopupService.prototype, "gridOptionsWrapper", void 0);
PopupService = __decorate([
    context_1.Bean('popupService')
], PopupService);
exports.PopupService = PopupService;
