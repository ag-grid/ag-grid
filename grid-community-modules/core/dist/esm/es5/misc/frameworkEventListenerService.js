var FrameworkEventListenerService = /** @class */ (function () {
    function FrameworkEventListenerService(frameworkOverrides) {
        this.frameworkOverrides = frameworkOverrides;
        // Map from user listener to wrapped listener so we can remove listener provided by user
        this.wrappedListeners = new Map();
        this.wrappedGlobalListeners = new Map();
    }
    FrameworkEventListenerService.prototype.wrap = function (userListener) {
        var _this = this;
        var listener = userListener;
        if (this.frameworkOverrides.shouldWrapOutgoing) {
            listener = function (event) {
                _this.frameworkOverrides.wrapOutgoing(function () { return userListener(event); });
            };
            this.wrappedListeners.set(userListener, listener);
        }
        return listener;
    };
    FrameworkEventListenerService.prototype.wrapGlobal = function (userListener) {
        var _this = this;
        var listener = userListener;
        if (this.frameworkOverrides.shouldWrapOutgoing) {
            listener = function (eventType, event) {
                _this.frameworkOverrides.wrapOutgoing(function () { return userListener(eventType, event); });
            };
            this.wrappedGlobalListeners.set(userListener, listener);
        }
        return listener;
    };
    FrameworkEventListenerService.prototype.unwrap = function (userListener) {
        var _a;
        return (_a = this.wrappedListeners.get(userListener)) !== null && _a !== void 0 ? _a : userListener;
    };
    FrameworkEventListenerService.prototype.unwrapGlobal = function (userListener) {
        var _a;
        return (_a = this.wrappedGlobalListeners.get(userListener)) !== null && _a !== void 0 ? _a : userListener;
    };
    return FrameworkEventListenerService;
}());
export { FrameworkEventListenerService };
