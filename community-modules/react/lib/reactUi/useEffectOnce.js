// @ag-grid-community/react v28.1.1
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
exports.useEffectOnce = (effect) => {
    const effectFn = react_1.useRef(effect);
    const destroyFn = react_1.useRef();
    const effectCalled = react_1.useRef(false);
    const rendered = react_1.useRef(false);
    const [, setVal] = react_1.useState(0);
    if (effectCalled.current) {
        rendered.current = true;
    }
    react_1.useEffect(() => {
        // only execute the effect first time around
        if (!effectCalled.current) {
            destroyFn.current = effectFn.current();
            effectCalled.current = true;
        }
        // this forces one render after the effect is run
        setVal((val) => val + 1);
        return () => {
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
exports.useLayoutEffectOnce = (effect) => {
    const effectFn = react_1.useRef(effect);
    const destroyFn = react_1.useRef();
    const effectCalled = react_1.useRef(false);
    const rendered = react_1.useRef(false);
    const [, setVal] = react_1.useState(0);
    if (effectCalled.current) {
        rendered.current = true;
    }
    react_1.useLayoutEffect(() => {
        // only execute the effect first time around
        if (!effectCalled.current) {
            destroyFn.current = effectFn.current();
            effectCalled.current = true;
        }
        // this forces one render after the effect is run
        setVal((val) => val + 1);
        return () => {
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

//# sourceMappingURL=useEffectOnce.js.map
