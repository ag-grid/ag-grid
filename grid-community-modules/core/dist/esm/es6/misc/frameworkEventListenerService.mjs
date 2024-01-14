export class FrameworkEventListenerService {
    constructor(frameworkOverrides) {
        this.frameworkOverrides = frameworkOverrides;
        // Map from user listener to wrapped listener so we can remove listener provided by user
        this.wrappedListeners = new Map();
        this.wrappedGlobalListeners = new Map();
    }
    wrap(userListener) {
        let listener = userListener;
        if (this.frameworkOverrides.shouldWrapOutgoing) {
            listener = (event) => {
                this.frameworkOverrides.wrapOutgoing(() => userListener(event));
            };
            this.wrappedListeners.set(userListener, listener);
        }
        return listener;
    }
    wrapGlobal(userListener) {
        let listener = userListener;
        if (this.frameworkOverrides.shouldWrapOutgoing) {
            listener = (eventType, event) => {
                this.frameworkOverrides.wrapOutgoing(() => userListener(eventType, event));
            };
            this.wrappedGlobalListeners.set(userListener, listener);
        }
        return listener;
    }
    unwrap(userListener) {
        var _a;
        return (_a = this.wrappedListeners.get(userListener)) !== null && _a !== void 0 ? _a : userListener;
    }
    unwrapGlobal(userListener) {
        var _a;
        return (_a = this.wrappedGlobalListeners.get(userListener)) !== null && _a !== void 0 ? _a : userListener;
    }
}
