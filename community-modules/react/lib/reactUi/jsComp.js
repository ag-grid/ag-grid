// @ag-grid-community/react v28.2.0
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showJsComp = (compDetails, context, eParent, ref) => {
    const doNothing = !compDetails || compDetails.componentFromFramework;
    if (doNothing) {
        return;
    }
    const promise = compDetails.newAgStackInstance();
    if (!promise) {
        return;
    }
    // almost all JS Comps are NOT async, however the Floating Multi Filter is Async as it could
    // be wrapping a React filter, so we need to cater for async comps here.
    let comp;
    let compGui;
    let destroyed = false;
    promise.then(c => {
        if (destroyed) {
            context.destroyBean(c);
            return;
        }
        comp = c;
        compGui = comp.getGui();
        eParent.appendChild(compGui);
        setRef(ref, comp);
    });
    return () => {
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
const setRef = (ref, value) => {
    if (!ref) {
        return;
    }
    if (ref instanceof Function) {
        const refCallback = ref;
        refCallback(value);
    }
    else {
        const refObj = ref;
        refObj.current = value;
    }
};
exports.createSyncJsComp = (compDetails) => {
    const promise = compDetails.newAgStackInstance();
    if (!promise) {
        return;
    }
    return promise.resolveNow(null, x => x); // js comps are never async
};

//# sourceMappingURL=jsComp.js.map
