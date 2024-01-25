// ag-grid-react v31.0.3
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSyncJsComp = exports.showJsComp = void 0;
/**
 * Show a JS Component
 * @returns Effect Cleanup function
 */
var showJsComp = function (compDetails, context, eParent, ref) {
    var doNothing = !compDetails || compDetails.componentFromFramework || context.isDestroyed();
    if (doNothing) {
        return;
    }
    var promise = compDetails.newAgStackInstance();
    if (!promise) {
        return;
    }
    // almost all JS Comps are NOT async, however the Floating Multi Filter is Async as it could
    // be wrapping a React filter, so we need to cater for async comps here.
    var comp;
    var compGui;
    var destroyed = false;
    promise.then(function (c) {
        if (destroyed) {
            context.destroyBean(c);
            return;
        }
        comp = c;
        compGui = comp.getGui();
        eParent.appendChild(compGui);
        setRef(ref, comp);
    });
    return function () {
        destroyed = true;
        if (!comp) {
            return;
        } // in case we were destroyed before async comp was returned
        if (compGui && compGui.parentElement) {
            compGui.parentElement.removeChild(compGui);
        }
        context.destroyBean(comp);
        if (ref) {
            setRef(ref, undefined);
        }
    };
};
exports.showJsComp = showJsComp;
var setRef = function (ref, value) {
    if (!ref) {
        return;
    }
    if (ref instanceof Function) {
        var refCallback = ref;
        refCallback(value);
    }
    else {
        var refObj = ref;
        refObj.current = value;
    }
};
var createSyncJsComp = function (compDetails) {
    var promise = compDetails.newAgStackInstance();
    if (!promise) {
        return;
    }
    return promise.resolveNow(null, function (x) { return x; }); // js comps are never async
};
exports.createSyncJsComp = createSyncJsComp;
