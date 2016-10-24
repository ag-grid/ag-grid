/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v6.2.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var eventService_1 = require("../eventService");
var utils_1 = require("../utils");
var TouchListener = (function () {
    function TouchListener(eElement) {
        var _this = this;
        this.destroyFuncs = [];
        this.touching = false;
        this.eventService = new eventService_1.EventService();
        this.eElement = eElement;
        var startListener = this.onTouchStart.bind(this);
        var moveListener = this.onTouchMove.bind(this);
        var endListener = this.onTouchEnd.bind(this);
        this.eElement.addEventListener('touchstart', startListener);
        this.eElement.addEventListener('touchmove', moveListener);
        this.eElement.addEventListener('touchend', endListener);
        this.destroyFuncs.push(function () {
            _this.eElement.addEventListener('touchstart', startListener);
            _this.eElement.addEventListener('touchmove', moveListener);
            _this.eElement.addEventListener('touchend', endListener);
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
        setTimeout(function () {
            var touchesMatch = _this.touchStart === touchStartCopy;
            console.log("touching = " + _this.touching);
            if (_this.touching && touchesMatch && !_this.moved) {
                console.log("dispatching");
                _this.moved = true;
                _this.eventService.dispatchEvent(TouchListener.EVENT_LONG_TAP, _this.touchStart);
            }
        }, 500);
    };
    TouchListener.prototype.onTouchMove = function (touchEvent) {
        if (!this.touching) {
            return;
        }
        var touch = this.getActiveTouch(touchEvent.touches);
        if (!touch) {
            console.log("no matching");
            return;
        }
        var eventIsFarAway = !utils_1.Utils.areEventsNear(touch, this.touchStart, 4);
        if (eventIsFarAway) {
            console.log("eventIsFarAway");
            this.moved = true;
        }
    };
    TouchListener.prototype.onTouchEnd = function (touchEvent) {
        if (!this.touching) {
            return;
        }
        if (!this.moved) {
            this.eventService.dispatchEvent(TouchListener.EVENT_TAP, this.touchStart);
        }
        this.touching = false;
    };
    TouchListener.prototype.destroy = function () {
        this.destroyFuncs.forEach(function (func) { return func(); });
    };
    // private mostRecentTouch: Touch;
    TouchListener.EVENT_TAP = 'tap';
    TouchListener.EVENT_LONG_TAP = 'longTap';
    return TouchListener;
})();
exports.TouchListener = TouchListener;
