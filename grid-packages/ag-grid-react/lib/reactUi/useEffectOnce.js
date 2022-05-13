// ag-grid-react v27.3.0
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
exports.useEffectOnce = function (effect) {
    var destroyFunc = react_1.useRef();
    var effectCalled = react_1.useRef(false);
    var renderAfterCalled = react_1.useRef(false);
    var _a = react_1.useState(0), val = _a[0], setVal = _a[1];
    if (effectCalled.current) {
        renderAfterCalled.current = true;
    }
    react_1.useEffect(function () {
        // only execute the effect first time around
        if (!effectCalled.current) {
            destroyFunc.current = effect();
            effectCalled.current = true;
        }
        // this forces one render after the effect is run
        setVal(function (val) { return val + 1; });
        return function () {
            // if the comp didn't render since the useEffect was called,
            // we know it's the dummy React cycle
            if (!renderAfterCalled.current) {
                return;
            }
            // otherwise this is not a dummy destroy, so call the destroy func
            if (destroyFunc.current) {
                destroyFunc.current();
            }
        };
    }, []);
};
