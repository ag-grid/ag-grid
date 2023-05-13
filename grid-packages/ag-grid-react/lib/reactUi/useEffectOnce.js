// ag-grid-react v29.3.5
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useLayoutEffectOnce = exports.useEffectOnce = void 0;
var react_1 = require("react");
exports.useEffectOnce = function (effect) {
    var effectFn = react_1.useRef(effect);
    var destroyFn = react_1.useRef();
    var effectCalled = react_1.useRef(false);
    var rendered = react_1.useRef(false);
    var _a = react_1.useState(0), setVal = _a[1];
    if (effectCalled.current) {
        rendered.current = true;
    }
    react_1.useEffect(function () {
        // only execute the effect first time around
        if (!effectCalled.current) {
            destroyFn.current = effectFn.current();
            effectCalled.current = true;
        }
        // this forces one render after the effect is run
        setVal(function (val) { return val + 1; });
        return function () {
            // if the comp didn't render since the useEffect was called,
            // we know it's the dummy React cycle
            if (!rendered.current) {
                return;
            }
            // otherwise this is not a dummy destroy, so call the destroy func
            if (destroyFn.current) {
                destroyFn.current();
            }
        };
    }, []);
};
exports.useLayoutEffectOnce = function (effect) {
    var effectFn = react_1.useRef(effect);
    var destroyFn = react_1.useRef();
    var effectCalled = react_1.useRef(false);
    var rendered = react_1.useRef(false);
    var _a = react_1.useState(0), setVal = _a[1];
    if (effectCalled.current) {
        rendered.current = true;
    }
    react_1.useLayoutEffect(function () {
        // only execute the effect first time around
        if (!effectCalled.current) {
            destroyFn.current = effectFn.current();
            effectCalled.current = true;
        }
        // this forces one render after the effect is run
        setVal(function (val) { return val + 1; });
        return function () {
            // if the comp didn't render since the useEffect was called,
            // we know it's the dummy React cycle
            if (!rendered.current) {
                return;
            }
            // otherwise this is not a dummy destroy, so call the destroy func
            if (destroyFn.current) {
                destroyFn.current();
            }
        };
    }, []);
};
