// @ag-grid-community/react v28.2.1
"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const beansContext_1 = require("../beansContext");
const core_1 = require("@ag-grid-community/core");
const utils_1 = require("../utils");
const headerRowContainerComp_1 = __importDefault(require("./headerRowContainerComp"));
const useEffectOnce_1 = require("../useEffectOnce");
const GridHeaderComp = () => {
    const [cssClasses, setCssClasses] = react_1.useState(new utils_1.CssClasses());
    const [height, setHeight] = react_1.useState();
    const { context } = react_1.useContext(beansContext_1.BeansContext);
    const eGui = react_1.useRef(null);
    useEffectOnce_1.useEffectOnce(() => {
        const compProxy = {
            addOrRemoveCssClass: (name, on) => setCssClasses(prev => prev.setClass(name, on)),
            setHeightAndMinHeight: height => setHeight(height)
        };
        const ctrl = context.createBean(new core_1.GridHeaderCtrl());
        ctrl.setComp(compProxy, eGui.current, eGui.current);
        return () => {
            context.destroyBean(ctrl);
        };
    });
    const className = react_1.useMemo(() => {
        let res = cssClasses.toString();
        return 'ag-header ' + res;
    }, [cssClasses]);
    const style = react_1.useMemo(() => ({
        height: height,
        minHeight: height
    }), [height]);
    return (react_1.default.createElement("div", { ref: eGui, className: className, style: style, role: "presentation" },
        react_1.default.createElement(headerRowContainerComp_1.default, { pinned: core_1.Constants.PINNED_LEFT }),
        react_1.default.createElement(headerRowContainerComp_1.default, { pinned: null }),
        react_1.default.createElement(headerRowContainerComp_1.default, { pinned: core_1.Constants.PINNED_RIGHT })));
};
exports.default = react_1.memo(GridHeaderComp);

//# sourceMappingURL=gridHeaderComp.js.map
