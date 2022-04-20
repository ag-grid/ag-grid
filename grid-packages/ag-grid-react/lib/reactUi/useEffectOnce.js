// ag-grid-react v27.2.1
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
function debug(msg) {
    // uncomment this out to get debugging for this file
    // console.log(msg);
}
exports.useEffectOnce = function (effect, location) {
    var destroyFunc = react_1.useRef();
    var calledOnce = react_1.useRef(false);
    var renderAfterCalled = react_1.useRef(false);
    if (calledOnce.current) {
        renderAfterCalled.current = true;
    }
    react_1.useEffect(function () {
        if (calledOnce.current) {
            debug("useEffectOnce skip execute " + location);
            return;
        }
        debug("useEffectOnce execute " + location);
        calledOnce.current = true;
        destroyFunc.current = effect();
        return function () {
            if (!renderAfterCalled.current) {
                debug("useEffectOnce skip destroy " + location);
                return;
            }
            debug("useEffectOnce destroy " + location);
            if (destroyFunc.current) {
                destroyFunc.current();
            }
        };
    }, []);
};
