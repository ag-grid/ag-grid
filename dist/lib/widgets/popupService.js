/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v5.0.6
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var utils_1 = require("../utils");
var constants_1 = require("../constants");
var context_1 = require("../context/context");
var gridCore_1 = require("../gridCore");
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
        var x = sourceRect.right - parentRect.left - 2;
        var y = sourceRect.top - parentRect.top;
        var minWidth;
        if (params.ePopup.clientWidth > 0) {
            minWidth = params.ePopup.clientWidth;
        }
        else {
            minWidth = 200;
        }
        var widthOfParent = parentRect.right - parentRect.left;
        var maxX = widthOfParent - minWidth;
        if (x > maxX) {
            // try putting menu to the left
            x = sourceRect.left - minWidth;
        }
        if (x < 0) {
            x = 0;
        }
        params.ePopup.style.left = x + "px";
        params.ePopup.style.top = y + "px";
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
        var parentRect = this.getPopupParent().getBoundingClientRect();
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
            checkHorizontalOverflow();
            checkVerticalOverflow();
        }
        params.ePopup.style.left = x + "px";
        params.ePopup.style.top = y + "px";
        function checkHorizontalOverflow() {
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
                x = maxX;
            }
            if (x < 0) {
                x = 0;
            }
        }
        function checkVerticalOverflow() {
            var minHeight;
            if (params.ePopup.clientWidth > 0) {
                minHeight = params.ePopup.clientHeight;
            }
            else {
                minHeight = 200;
            }
            var heightOfParent = parentRect.bottom - parentRect.top;
            var maxY = heightOfParent - minHeight - 5;
            if (y > maxY) {
                y = maxY;
            }
            if (y < 0) {
                y = 0;
            }
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
            eBody.addEventListener('contextmenu', hidePopup);
            //eBody.addEventListener('mousedown', hidePopup);
            eChild.addEventListener('click', consumeClick);
            //eChild.addEventListener('mousedown', consumeClick);
        }, 0);
        var eventFromChild = null;
        function hidePopupOnEsc(event) {
            var key = event.which || event.keyCode;
            if (key === constants_1.Constants.KEY_ESCAPE) {
                hidePopup(null);
            }
        }
        function hidePopup(event) {
            if (event && event === eventFromChild) {
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
            eBody.removeEventListener('contextmenu', hidePopup);
            eChild.removeEventListener('click', consumeClick);
            //eChild.removeEventListener('mousedown', consumeClick);
            if (closedCallback) {
                closedCallback();
            }
        }
        function consumeClick(event) {
            eventFromChild = event;
        }
        return hidePopup;
    };
    __decorate([
        context_1.Autowired('gridCore'), 
        __metadata('design:type', gridCore_1.GridCore)
    ], PopupService.prototype, "gridCore", void 0);
    PopupService = __decorate([
        context_1.Bean('popupService'), 
        __metadata('design:paramtypes', [])
    ], PopupService);
    return PopupService;
})();
exports.PopupService = PopupService;
