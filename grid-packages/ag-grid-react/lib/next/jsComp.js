// ag-grid-react v26.1.0
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showJsComp = function (compDetails, context, eParent, ref) {
    var doNothing = !compDetails || compDetails.componentFromFramework;
    if (doNothing) {
        return;
    }
    var callCompFactory = function (compFactory) { return compFactory.createInstanceFromCompDetails(compDetails); };
    var comp = exports.createJsComp(context, callCompFactory);
    if (!comp) {
        return;
    }
    var compGui = comp.getGui();
    eParent.appendChild(compGui);
    setRef(ref, comp);
    return function () {
        var compGui = comp.getGui();
        if (compGui && compGui.parentElement) {
            compGui.parentElement.removeChild(compGui);
        }
        context.destroyBean(comp);
        if (ref) {
            setRef(ref, undefined);
        }
    };
};
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
exports.createJsComp = function (context, callCompFactory) {
    var compFactory = context.getBean('userComponentFactory');
    var promise = callCompFactory(compFactory);
    if (!promise) {
        return;
    }
    return promise.resolveNow(null, function (x) { return x; }); // js comps are never async
};
