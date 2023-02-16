// @ag-grid-community/react v29.1.0
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
const react_1 = __importStar(require("react"));
const beansContext_1 = require("../beansContext");
const jsComp_1 = require("../jsComp");
const useEffectOnce_1 = require("../useEffectOnce");
const utils_1 = require("../utils");
const GroupCellRenderer = react_1.forwardRef((props, ref) => {
    const context = react_1.useContext(beansContext_1.BeansContext).context;
    const eGui = react_1.useRef(null);
    const eValueRef = react_1.useRef(null);
    const eCheckboxRef = react_1.useRef(null);
    const eExpandedRef = react_1.useRef(null);
    const eContractedRef = react_1.useRef(null);
    const [innerCompDetails, setInnerCompDetails] = react_1.useState();
    const [childCount, setChildCount] = react_1.useState();
    const [value, setValue] = react_1.useState();
    const [cssClasses, setCssClasses] = react_1.useState(new utils_1.CssClasses());
    const [expandedCssClasses, setExpandedCssClasses] = react_1.useState(new utils_1.CssClasses('ag-hidden'));
    const [contractedCssClasses, setContractedCssClasses] = react_1.useState(new utils_1.CssClasses('ag-hidden'));
    const [checkboxCssClasses, setCheckboxCssClasses] = react_1.useState(new utils_1.CssClasses('ag-invisible'));
    react_1.useImperativeHandle(ref, () => {
        return {
            // force new instance when grid tries to refresh
            refresh() { return false; }
        };
    });
    react_1.useEffect(() => {
        return jsComp_1.showJsComp(innerCompDetails, context, eValueRef.current);
    }, [innerCompDetails]);
    useEffectOnce_1.useEffectOnce(() => {
        const compProxy = {
            setInnerRenderer: (details, valueToDisplay) => {
                setInnerCompDetails(details);
                setValue(valueToDisplay);
            },
            setChildCount: count => setChildCount(count),
            addOrRemoveCssClass: (name, on) => setCssClasses(prev => prev.setClass(name, on)),
            setContractedDisplayed: displayed => setContractedCssClasses(prev => prev.setClass('ag-hidden', !displayed)),
            setExpandedDisplayed: displayed => setExpandedCssClasses(prev => prev.setClass('ag-hidden', !displayed)),
            setCheckboxVisible: visible => setCheckboxCssClasses(prev => prev.setClass('ag-invisible', !visible))
        };
        const ctrl = context.createBean(new core_1.GroupCellRendererCtrl());
        ctrl.init(compProxy, eGui.current, eCheckboxRef.current, eExpandedRef.current, eContractedRef.current, GroupCellRenderer, props);
        return () => { context.destroyBean(ctrl); };
    });
    const className = react_1.useMemo(() => `ag-cell-wrapper ${cssClasses.toString()}`, [cssClasses]);
    const expandedClassName = react_1.useMemo(() => `ag-group-expanded ${expandedCssClasses.toString()}`, [expandedCssClasses]);
    const contractedClassName = react_1.useMemo(() => `ag-group-contracted ${contractedCssClasses.toString()}`, [contractedCssClasses]);
    const checkboxClassName = react_1.useMemo(() => `ag-group-checkbox ${checkboxCssClasses.toString()}`, [checkboxCssClasses]);
    const useFwRenderer = innerCompDetails && innerCompDetails.componentFromFramework;
    const FwRenderer = useFwRenderer ? innerCompDetails.componentClass : undefined;
    const useValue = innerCompDetails == null && value != null;
    const escapedValue = core_1._.escapeString(value, true);
    return (react_1.default.createElement("span", Object.assign({ className: className, ref: eGui }, (!props.colDef ? { role: 'gridcell' } : {})),
        react_1.default.createElement("span", { className: expandedClassName, ref: eExpandedRef }),
        react_1.default.createElement("span", { className: contractedClassName, ref: eContractedRef }),
        react_1.default.createElement("span", { className: checkboxClassName, ref: eCheckboxRef }),
        react_1.default.createElement("span", { className: "ag-group-value", ref: eValueRef },
            useValue && react_1.default.createElement(react_1.default.Fragment, null, escapedValue),
            useFwRenderer && react_1.default.createElement(FwRenderer, Object.assign({}, innerCompDetails.params))),
        react_1.default.createElement("span", { className: "ag-group-child-count" }, childCount)));
});
// we do not memo() here, as it would stop the forwardRef working
exports.default = GroupCellRenderer;

//# sourceMappingURL=groupCellRenderer.js.map
