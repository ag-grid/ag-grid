// @ag-grid-community/react v26.0.0
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showJsComp = function (compDetails, context, eParent, callCompFactory, ref) {
    var doNothing = !compDetails || compDetails.componentFromFramework;
    if (doNothing) {
        return;
    }
    var comp = exports.createJsComp(context, callCompFactory);
    if (!comp) {
        return;
    }
    var compGui = comp.getGui();
    eParent.appendChild(compGui);
    if (ref) {
        ref.current = comp;
    }
    return function () {
        var compGui = comp.getGui();
        if (compGui && compGui.parentElement) {
            compGui.parentElement.removeChild(compGui);
        }
        context.destroyBean(comp);
        if (ref) {
            ref.current = undefined;
        }
    };
};
exports.createJsComp = function (context, callCompFactory) {
    var compFactory = context.getBean('userComponentFactory');
    var promise = callCompFactory(compFactory);
    if (!promise) {
        return;
    }
    return promise.resolveNow(null, function (x) { return x; }); // js comps are never async
};

//# sourceMappingURL=jsComp.js.map
