// @ag-grid-community/react v27.2.1
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
function debug(msg) {
    // uncomment this out to get debugging for this file
    // console.log(msg);
}
exports.useEffectOnce = (effect, location) => {
    const destroyFunc = react_1.useRef();
    const calledOnce = react_1.useRef(false);
    const renderAfterCalled = react_1.useRef(false);
    if (calledOnce.current) {
        renderAfterCalled.current = true;
    }
    react_1.useEffect(() => {
        if (calledOnce.current) {
            debug(`useEffectOnce skip execute ${location}`);
            return;
        }
        debug(`useEffectOnce execute ${location}`);
        calledOnce.current = true;
        destroyFunc.current = effect();
        return () => {
            if (!renderAfterCalled.current) {
                debug(`useEffectOnce skip destroy ${location}`);
                return;
            }
            debug(`useEffectOnce destroy ${location}`);
            if (destroyFunc.current) {
                destroyFunc.current();
            }
        };
    }, []);
};

//# sourceMappingURL=useEffectOnce.js.map
