/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.1.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var eventService_1 = require("../eventService");
var utils_1 = require("../utils");
var TouchListener = /** @class */ (function () {
    function TouchListener(eElement, preventMouseClick) {
        var _this = this;
        if (preventMouseClick === void 0) { preventMouseClick = false; }
        this.destroyFuncs = [];
        this.touching = false;
        this.eventService = new eventService_1.EventService();
        this.eElement = eElement;
        this.preventMouseClick = preventMouseClick;
        var startListener = this.onTouchStart.bind(this);
        var moveListener = this.onTouchMove.bind(this);
        var endListener = this.onTouchEnd.bind(this);
        this.eElement.addEventListener("touchstart", startListener, { passive: true });
        this.eElement.addEventListener("touchmove", moveListener, { passive: true });
        // we set passive=false, as we want to prevent default on this event
        this.eElement.addEventListener("touchend", endListener, { passive: false });
        this.destroyFuncs.push(function () {
            _this.eElement.removeEventListener("touchstart", startListener, { passive: true });
            _this.eElement.removeEventListener("touchmove", moveListener, { passive: true });
            _this.eElement.removeEventListener("touchend", endListener, { passive: false });
        });
    }
    TouchListener.prototype.getActiveTouch = function (touchList) {
        for (var i = 0; i < touchList.length; i++) {
            var matches = touchList[i].identifier === this.touchStart.identifier;
            if (matches) {
                return touchList[i];
            }
        }
        return null;
    };
    TouchListener.prototype.addEventListener = function (eventType, listener) {
        this.eventService.addEventListener(eventType, listener);
    };
    TouchListener.prototype.removeEventListener = function (eventType, listener) {
        this.eventService.removeEventListener(eventType, listener);
    };
    TouchListener.prototype.onTouchStart = function (touchEvent) {
        var _this = this;
        // only looking at one touch point at any time
        if (this.touching) {
            return;
        }
        this.touchStart = touchEvent.touches[0];
        this.touching = true;
        this.moved = false;
        var touchStartCopy = this.touchStart;
        window.setTimeout(function () {
            var touchesMatch = _this.touchStart === touchStartCopy;
            if (_this.touching && touchesMatch && !_this.moved) {
                _this.moved = true;
                var event_1 = {
                    type: TouchListener.EVENT_LONG_TAP,
                    touchStart: _this.touchStart,
                    touchEvent: touchEvent
                };
                _this.eventService.dispatchEvent(event_1);
            }
        }, 500);
    };
    TouchListener.prototype.onTouchMove = function (touchEvent) {
        if (!this.touching) {
            return;
        }
        var touch = this.getActiveTouch(touchEvent.touches);
        if (!touch) {
            return;
        }
        var eventIsFarAway = !utils_1._.areEventsNear(touch, this.touchStart, 4);
        if (eventIsFarAway) {
            this.moved = true;
        }
    };
    TouchListener.prototype.onTouchEnd = function (touchEvent) {
        if (!this.touching) {
            return;
        }
        if (!this.moved) {
            var event_2 = {
                type: TouchListener.EVENT_TAP,
                touchStart: this.touchStart
            };
            this.eventService.dispatchEvent(event_2);
            this.checkForDoubleTap();
        }
        // stops the tap from also been processed as a mouse click
        if (this.preventMouseClick) {
            touchEvent.preventDefault();
        }
        this.touching = false;
    };
    TouchListener.prototype.checkForDoubleTap = function () {
        var now = new Date().getTime();
        if (this.lastTapTime && this.lastTapTime > 0) {
            // if previous tap, see if duration is short enough to be considered double tap
            var interval = now - this.lastTapTime;
            if (interval > TouchListener.DOUBLE_TAP_MILLIS) {
                // dispatch double tap event
                var event_3 = {
                    type: TouchListener.EVENT_DOUBLE_TAP,
                    touchStart: this.touchStart
                };
                this.eventService.dispatchEvent(event_3);
                // this stops a tripple tap ending up as two double taps
                this.lastTapTime = null;
            }
            else {
                this.lastTapTime = now;
            }
        }
        else {
            this.lastTapTime = now;
        }
    };
    TouchListener.prototype.destroy = function () {
        this.destroyFuncs.forEach(function (func) { return func(); });
    };
    TouchListener.EVENT_TAP = "tap";
    TouchListener.EVENT_DOUBLE_TAP = "doubleTap";
    TouchListener.EVENT_LONG_TAP = "longTap";
    TouchListener.DOUBLE_TAP_MILLIS = 500;
    return TouchListener;
}());
exports.TouchListener = TouchListener;
