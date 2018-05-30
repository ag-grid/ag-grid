let requestAnimationFrame$1 = (function() {
    if (typeof requestAnimationFrame === "function") {
        return requestAnimationFrame.bind(window);
    }

    return function(callback) {
        return setTimeout(function() {
            return callback(Date.now());
        }, 1000 / 60);
    };
})();

let trailingTimeout = 2;

let throttle = function(callback, delay) {
    let leadingCall = false;
    let trailingCall = false;
    let lastCallTime = 0;

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
        let timeStamp = Date.now();

        if (leadingCall) {
            if (timeStamp - lastCallTime < trailingTimeout) {
                return;
            }
            trailingCall = true;
        } else {
            leadingCall = true;
            trailingCall = false;

            setTimeout(timeoutCallback, delay);
        }

        lastCallTime = timeStamp;
    }

    return proxy;
};

let REFRESH_DELAY = 20;

let mutationObserverSupported = typeof MutationObserver !== "undefined";

let getWindowOf = function(target) {
    let ownerGlobal = target && target.ownerDocument && target.ownerDocument.defaultView;

    return ownerGlobal || window;
};

let emptyRect = createRectInit(0, 0, 0, 0);

function toFloat(value) {
    return parseFloat(value) || 0;
}

function getBordersSize(styles, start, end) {
    let positions = [];
    let len = arguments.length - 1;

    while (len-- > 0) {
        positions[len] = arguments[len + 1];
    }

    return positions.reduce(function(size, position) {
        let value = styles["border-" + position + "-width"];

        return size + toFloat(value);
    }, 0);
}

function getPaddings(styles) {
    let positions = ["top", "right", "bottom", "left"];
    let paddings = {
        top: null,
        left: null,
        right: null,
        bottom: null
    };

    for (let i = 0, list = positions; i < list.length; i += 1) {
        let position = list[i];

        let value = styles["padding-" + position];

        paddings[position] = toFloat(value);
    }

    return paddings;
}

function getHTMLElementContentRect(target) {
    let clientWidth = target.clientWidth;
    let clientHeight = target.clientHeight;

    if (!clientWidth && !clientHeight) {
        return emptyRect;
    }

    let styles = getWindowOf(target).getComputedStyle(target);
    let paddings = getPaddings(styles);
    let horizPad = paddings.left + paddings.right;
    let vertPad = paddings.top + paddings.bottom;

    let width = toFloat(styles.width);
    let height = toFloat(styles.height);

    if (styles.boxSizing === "border-box") {
        if (Math.round(width + horizPad) !== clientWidth) {
            width -= getBordersSize(styles, "left", "right") + horizPad;
        }

        if (Math.round(height + vertPad) !== clientHeight) {
            height -= getBordersSize(styles, "top", "bottom") + vertPad;
        }
    }

    let vertScrollbar = Math.round(width + horizPad) - clientWidth;
    let horizScrollbar = Math.round(height + vertPad) - clientHeight;
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
    let x = ref.x;
    let y = ref.y;
    let width = ref.width;
    let height = ref.height;

    let Constr = typeof (<any>window).DOMRectReadOnly ? (<any>window).DOMRectReadOnly : Object;
    let rect = Object.create(Constr.prototype);

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

class ResizeObserverController {
    connected_ = false;
    mutationEventsAdded_ = false;
    mutationsObserver_ = null;
    observers_ = [];
    callback_ = null;

    constructor() {
        this.refresh = throttle(this.refresh.bind(this), REFRESH_DELAY);
    }

    addObserver(observer) {
        if (this.observers_.indexOf(observer) == -1) {
            this.observers_.push(observer);
        }

        // Add listeners if they haven't been added yet.
        if (!this.connected_) {
            this.connect_();
        }
    }

    removeObserver(observer) {
        let observers = this.observers_;
        let index = observers.indexOf(observer);

        if (index > -1) {
            observers.splice(index, 1);
        }

        if (!observers.length && this.connected_) {
            this.disconnect_();
        }
    }

    refresh() {
        let changesDetected = this.updateObservers_();

        if (changesDetected) {
            this.refresh();
        }
    }
    updateObservers_() {
        let activeObservers = this.observers_.filter(function(observer) {
            return observer.hasActive();
        });
        activeObservers.forEach(function(observer) {
            return observer.broadcastActive();
        });

        return activeObservers.length > 0;
    }

    connect_() {
        if (this.connected_) {
            return;
        }

        window.addEventListener("resize", this.refresh);

        if (mutationObserverSupported) {
            this.mutationsObserver_ = new MutationObserver(this.refresh);

            this.mutationsObserver_.observe(document, {
                attributes: true,
                childList: true,
                characterData: true,
                subtree: true
            });
        } else {
            document.addEventListener("DOMSubtreeModified", this.refresh);

            this.mutationEventsAdded_ = true;
        }

        this.connected_ = true;
    }

    disconnect_() {
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
    }

    static instance_: ResizeObserverController = null;

    static getInstance() {
        if (!this.instance_) {
            this.instance_ = new ResizeObserverController();
        }

        return this.instance_;
    }
}

let defineConfigurable = function(target, props) {
    for (let i = 0, list = Object.keys(props); i < list.length; i += 1) {
        let key = list[i];

        Object.defineProperty(target, key, {
            value: props[key],
            enumerable: false,
            writable: false,
            configurable: true
        });
    }

    return target;
};

class ResizeObservation {
    broadcastWidth = 0;
    broadcastHeight = 0;
    contentRect_ = null;

    constructor(public target) {
        this.contentRect_ = createRectInit(0, 0, 0, 0);
    }

    isActive() {
        let rect = getContentRect(this.target);

        this.contentRect_ = rect;

        return rect.width !== this.broadcastWidth || rect.height !== this.broadcastHeight;
    }

    broadcastRect() {
        let rect = this.contentRect_;

        this.broadcastWidth = rect.width;
        this.broadcastHeight = rect.height;

        return rect;
    }
}

class ResizeObserverSPI {
    observation = null;
    callback_ = null;
    controller_ = null;
    callbackCtx_ = null;

    constructor(callback, controller, callbackCtx) {
        this.observation = null;

        if (typeof callback !== "function") {
            throw new TypeError("The callback provided as parameter 1 is not a function.");
        }

        this.callback_ = callback;
        this.controller_ = controller;
        this.callbackCtx_ = callbackCtx;
    }

    observe(target) {
        this.observation = new ResizeObservation(target);

        this.controller_.addObserver(this);

        // Force the update of observations.
        this.controller_.refresh();
    }

    disconnect() {
        this.observation = null;
        this.controller_.removeObserver(this);
    }

    broadcastActive() {
        if (!this.hasActive()) {
            return;
        }

        let ctx = this.callbackCtx_;

        this.callback_.call(
            ctx,
            {
                target: this.observation.target,
                contentRect: createReadOnlyRect(this.observation.broadcastRect())
            },
            ctx
        );
    }

    hasActive() {
        return this.observation.isActive();
    }
}

class ResizeObserverFallback {
    observer_: ResizeObserverSPI;

    constructor(callback) {
        let controller = ResizeObserverController.getInstance();
        let observer = new ResizeObserverSPI(callback, controller, this);

        this.observer_ = observer;
    }

    observe(element: HTMLElement) {
        this.observer_.observe(element);
    }

    disconnect() {
        this.observer_.disconnect();
    }
}

export function observeResize(element: HTMLElement, callback: (any) => void) {
    if ((<any>window).ResizeObserver) {
        const ro = new (<any>window).ResizeObserver((entries, observer) => {
            for (const entry of entries) {
                callback(entry);
            }
        });

        ro.observe(element);
        return function unobserve() {
            ro.disconnect();
        };
    } else {
        const ro = new ResizeObserverFallback((entry, observer) => {
            callback(entry);
        });
        ro.observe(element);

        return function unobserve() {
            ro.disconnect();
        };
    }
}
