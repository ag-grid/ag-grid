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
const headerRowComp_1 = __importDefault(require("./headerRowComp"));
const useEffectOnce_1 = require("../useEffectOnce");
const HeaderRowContainerComp = (props) => {
    const [cssClasses, setCssClasses] = react_1.useState(new utils_1.CssClasses());
    const [centerContainerWidth, setCenterContainerWidth] = react_1.useState();
    const [centerContainerTransform, setCenterContainerTransform] = react_1.useState();
    const [pinnedContainerWidth, setPinnedContainerWidth] = react_1.useState();
    const [headerRowCtrls, setHeaderRowCtrls] = react_1.useState([]);
    const { context } = react_1.useContext(beansContext_1.BeansContext);
    const eGui = react_1.useRef(null);
    const pinnedLeft = props.pinned === core_1.Constants.PINNED_LEFT;
    const pinnedRight = props.pinned === core_1.Constants.PINNED_RIGHT;
    const centre = !pinnedLeft && !pinnedRight;
    useEffectOnce_1.useEffectOnce(() => {
        const compProxy = {
            addOrRemoveCssClass: (name, on) => setCssClasses(prev => prev.setClass(name, on)),
            setCtrls: ctrls => setHeaderRowCtrls(ctrls),
            // centre only
            setCenterWidth: width => setCenterContainerWidth(width),
            setContainerTransform: transform => setCenterContainerTransform(transform),
            // pinned only
            setPinnedContainerWidth: width => setPinnedContainerWidth(width)
        };
        const ctrl = context.createBean(new core_1.HeaderRowContainerCtrl(props.pinned));
        ctrl.setComp(compProxy, eGui.current);
        return () => {
            context.destroyBean(ctrl);
        };
    });
    const className = react_1.useMemo(() => cssClasses.toString(), [cssClasses]);
    const insertRowsJsx = () => headerRowCtrls.map(ctrl => react_1.default.createElement(headerRowComp_1.default, { ctrl: ctrl, key: ctrl.getInstanceId() }));
    const eCenterContainerStyle = react_1.useMemo(() => ({
        width: centerContainerWidth,
        transform: centerContainerTransform
    }), [centerContainerWidth, centerContainerTransform]);
    const ePinnedStyle = react_1.useMemo(() => ({
        width: pinnedContainerWidth,
        minWidth: pinnedContainerWidth,
        maxWidth: pinnedContainerWidth,
    }), [pinnedContainerWidth]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        pinnedLeft &&
            react_1.default.createElement("div", { ref: eGui, className: "ag-pinned-left-header " + className, role: "presentation", style: ePinnedStyle }, insertRowsJsx()),
        pinnedRight &&
            react_1.default.createElement("div", { ref: eGui, className: "ag-pinned-right-header " + className, role: "presentation", style: ePinnedStyle }, insertRowsJsx()),
        centre &&
            react_1.default.createElement("div", { ref: eGui, className: "ag-header-viewport " + className, role: "presentation" },
                react_1.default.createElement("div", { className: "ag-header-container", role: "rowgroup", style: eCenterContainerStyle }, insertRowsJsx()))));
};
exports.default = react_1.memo(HeaderRowContainerComp);

//# sourceMappingURL=headerRowContainerComp.js.map
