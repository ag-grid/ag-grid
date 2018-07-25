/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v18.1.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var requestAnimationFrame$1 = (function () {
    if (typeof requestAnimationFrame === "function") {
        return requestAnimationFrame.bind(window);
    }
    return function (callback) {
        return setTimeout(function () {
            return callback(Date.now());
        }, 1000 / 60);
    };
})();
var trailingTimeout = 2;
var throttle = function (callback, delay) {
    var leadingCall = false;
    var trailingCall = false;
    var lastCallTime = 0;
    function resolvePending() {
        if (leadingCall) {
            leadingCall = false;
            callback();
        }
        if (trailingCall) {
            proxy();
        }
    }
    function timeoutCallback() {
        requestAnimationFrame$1(resolvePending);
    }
    function proxy() {
        var timeStamp = Date.now();
        if (leadingCall) {
            if (timeStamp - lastCallTime < trailingTimeout) {
                return;
            }
            trailingCall = true;
        }
        else {
            leadingCall = true;
            trailingCall = false;
            setTimeout(timeoutCallback, delay);
        }
        lastCallTime = timeStamp;
    }
    return proxy;
};
var REFRESH_DELAY = 20;
var getWindowOf = function (target) {
    var ownerGlobal = target && target.ownerDocument && target.ownerDocument.defaultView;
    return ownerGlobal || window;
};
var emptyRect = createRectInit(0, 0, 0, 0);
function toFloat(value) {
    return parseFloat(value) || 0;
}
function getBordersSize(styles, start, end) {
    var positions = [start, end];
    return positions.reduce(function (size, position) {
        var value = styles.getPropertyValue("border-" + position + "-width");
        return size + toFloat(value);
    }, 0);
}
function getPaddings(styles) {
    var positions = ["top", "right", "bottom", "left"];
    var paddings = {
        top: null,
        left: null,
        right: null,
        bottom: null
    };
    for (var i = 0, list = positions; i < list.length; i += 1) {
        var position = list[i];
        var value = styles.getPropertyValue("padding-" + position);
        paddings[position] = toFloat(value);
    }
    return paddings;
}
function getHTMLElementContentRect(target) {
    var clientWidth = target.clientWidth;
    var clientHeight = target.clientHeight;
    if (!clientWidth && !clientHeight) {
        return emptyRect;
    }
    var styles = getWindowOf(target).getComputedStyle(target);
    var paddings = getPaddings(styles);
    var horizPad = paddings.left + paddings.right;
    var vertPad = paddings.top + paddings.bottom;
    var width = toFloat(styles.width);
    var height = toFloat(styles.height);
    if (styles.boxSizing === "border-box") {
        if (Math.round(width + horizPad) !== clientWidth) {
            width -= getBordersSize(styles, "left", "right") + horizPad;
        }
        if (Math.round(height + vertPad) !== clientHeight) {
            height -= getBordersSize(styles, "top", "bottom") + vertPad;
        }
    }
    var vertScrollbar = Math.round(width + horizPad) - clientWidth;
    var horizScrollbar = Math.round(height + vertPad) - clientHeight;
    if (Math.abs(vertScrollbar) !== 1) {
        width -= vertScrollbar;
    }
    if (Math.abs(horizScrollbar) !== 1) {
        height -= horizScrollbar;
    }
    return createRectInit(paddings.left, paddings.top, width, height);
}
function getContentRect(target) {
    return getHTMLElementContentRect(target);
}
function createReadOnlyRect(ref) {
    var x = ref.x;
    var y = ref.y;
    var width = ref.width;
    var height = ref.height;
    var Constr = window.DOMRectReadOnly ? window.DOMRectReadOnly : Object;
    var rect = Object.create(Constr.prototype);
    defineConfigurable(rect, {
        x: x,
        y: y,
        width: width,
        height: height,
        top: y,
        right: x + width,
        bottom: height + y,
        left: x
    });
    return rect;
}
function createRectInit(x, y, width, height) {
    return { x: x, y: y, width: width, height: height };
}
var ResizeObserverController = (function () {
    function ResizeObserverController() {
        this.connected_ = false;
        this.mutationEventsAdded_ = false;
        this.mutationsObserver_ = null;
        this.observers_ = [];
        this.callback_ = null;
        this.refresh = throttle(this.refresh.bind(this), REFRESH_DELAY);
    }
    ResizeObserverController.prototype.addObserver = function (observer) {
        if (this.observers_.indexOf(observer) == -1) {
            this.observers_.push(observer);
        }
        // Add listeners if they haven't been added yet.
        if (!this.connected_) {
            this.connect_();
        }
    };
    ResizeObserverController.prototype.removeObserver = function (observer) {
        var observers = this.observers_;
        var index = observers.indexOf(observer);
        if (index > -1) {
            observers.splice(index, 1);
        }
        if (!observers.length && this.connected_) {
            this.disconnect_();
        }
    };
    ResizeObserverController.prototype.refresh = function () {
        var changesDetected = this.updateObservers_();
        if (changesDetected) {
            this.refresh();
        }
    };
    ResizeObserverController.prototype.updateObservers_ = function () {
        var activeObservers = this.observers_.filter(function (observer) {
            return observer.hasActive();
        });
        activeObservers.forEach(function (observer) {
            return observer.broadcastActive();
        });
        return activeObservers.length > 0;
    };
    ResizeObserverController.prototype.connect_ = function () {
        if (this.connected_) {
            return;
        }
        window.addEventListener("resize", this.refresh);
        document.addEventListener("DOMSubtreeModified", this.refresh);
        this.mutationEventsAdded_ = true;
        this.connected_ = true;
    };
    ResizeObserverController.prototype.disconnect_ = function () {
        if (!this.connected_) {
            return;
        }
        window.removeEventListener("resize", this.refresh);
        if (this.mutationsObserver_) {
            this.mutationsObserver_.disconnect();
        }
        if (this.mutationEventsAdded_) {
            document.removeEventListener("DOMSubtreeModified", this.refresh);
        }
        this.mutationsObserver_ = null;
        this.mutationEventsAdded_ = false;
        this.connected_ = false;
    };
    ResizeObserverController.getInstance = function () {
        if (!this.instance_) {
            this.instance_ = new ResizeObserverController();
        }
        return this.instance_;
    };
    ResizeObserverController.instance_ = null;
    return ResizeObserverController;
}());
var defineConfigurable = function (target, props) {
    for (var i = 0, list = Object.keys(props); i < list.length; i += 1) {
        var key = list[i];
        Object.defineProperty(target, key, {
            value: props[key],
            enumerable: false,
            writable: false,
            configurable: true
        });
    }
    return target;
};
var ResizeObservation = (function () {
    function ResizeObservation(target) {
        this.target = target;
        this.broadcastWidth = 0;
        this.broadcastHeight = 0;
        this.contentRect_ = null;
        this.contentRect_ = createRectInit(0, 0, 0, 0);
    }
    ResizeObservation.prototype.isActive = function () {
        var rect = getContentRect(this.target);
        this.contentRect_ = rect;
        return rect.width !== this.broadcastWidth || rect.height !== this.broadcastHeight;
    };
    ResizeObservation.prototype.broadcastRect = function () {
        var rect = this.contentRect_;
        this.broadcastWidth = rect.width;
        this.broadcastHeight = rect.height;
        return rect;
    };
    return ResizeObservation;
}());
var ResizeObserverSPI = (function () {
    function ResizeObserverSPI(callback, controller, callbackCtx) {
        this.observation = null;
        this.callback_ = null;
        this.controller_ = null;
        this.callbackCtx_ = null;
        this.observation = null;
        if (typeof callback !== "function") {
            throw new TypeError("The callback provided as parameter 1 is not a function.");
        }
        this.callback_ = callback;
        this.controller_ = controller;
        this.callbackCtx_ = callbackCtx;
    }
    ResizeObserverSPI.prototype.observe = function (target) {
        this.observation = new ResizeObservation(target);
        this.controller_.addObserver(this);
        // Force the update of observations.
        this.controller_.refresh();
    };
    ResizeObserverSPI.prototype.disconnect = function () {
        this.observation = null;
        this.controller_.removeObserver(this);
    };
    ResizeObserverSPI.prototype.broadcastActive = function () {
        if (!this.hasActive()) {
            return;
        }
        var ctx = this.callbackCtx_;
        this.callback_.call(ctx, {
            target: this.observation.target,
            contentRect: createReadOnlyRect(this.observation.broadcastRect())
        }, ctx);
    };
    ResizeObserverSPI.prototype.hasActive = function () {
        return this.observation.isActive();
    };
    return ResizeObserverSPI;
}());
var ResizeObserverFallback = (function () {
    function ResizeObserverFallback(callback) {
        var controller = ResizeObserverController.getInstance();
        var observer = new ResizeObserverSPI(callback, controller, this);
        this.observer_ = observer;
    }
    ResizeObserverFallback.prototype.observe = function (element) {
        this.observer_.observe(element);
    };
    ResizeObserverFallback.prototype.disconnect = function () {
        this.observer_.disconnect();
    };
    return ResizeObserverFallback;
}());
function observeResize(element, callback) {
    if (window.ResizeObserver) {
        var ro_1 = new window.ResizeObserver(function (entries, observer) {
            for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
                var entry = entries_1[_i];
                callback(entry);
            }
        });
        ro_1.observe(element);
        return function unobserve() {
            ro_1.disconnect();
        };
    }
    else {
        var ro_2 = new ResizeObserverFallback(function (entry) {
            callback(entry);
        });
        ro_2.observe(element);
        return function unobserve() {
            ro_2.disconnect();
        };
    }
}
exports.observeResize = observeResize;
