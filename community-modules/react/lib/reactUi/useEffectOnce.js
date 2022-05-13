// @ag-grid-community/react v27.3.0
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
exports.useEffectOnce = (effect) => {
    const destroyFunc = react_1.useRef();
    const effectCalled = react_1.useRef(false);
    const renderAfterCalled = react_1.useRef(false);
    const [val, setVal] = react_1.useState(0);
    if (effectCalled.current) {
        renderAfterCalled.current = true;
    }
    react_1.useEffect(() => {
        // only execute the effect first time around
        if (!effectCalled.current) {
            destroyFunc.current = effect();
            effectCalled.current = true;
        }
        // this forces one render after the effect is run
        setVal((val) => val + 1);
        return () => {
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

//# sourceMappingURL=useEffectOnce.js.map
