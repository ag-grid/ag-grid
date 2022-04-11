// @ag-grid-community/react v27.2.0
"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const beansContext_1 = require("../beansContext");
const core_1 = require("@ag-grid-community/core");
const utils_1 = require("../utils");
const jsComp_1 = require("../jsComp");
const HeaderFilterCellComp = (props) => {
    const { context } = react_1.useContext(beansContext_1.BeansContext);
    const [cssClasses, setCssClasses] = react_1.useState(new utils_1.CssClasses());
    const [cssBodyClasses, setBodyCssClasses] = react_1.useState(new utils_1.CssClasses());
    const [cssButtonWrapperClasses, setButtonWrapperCssClasses] = react_1.useState(new utils_1.CssClasses());
    const [width, setWidth] = react_1.useState();
    const [userCompDetails, setUserCompDetails] = react_1.useState();
    const eGui = react_1.useRef(null);
    const eFloatingFilterBody = react_1.useRef(null);
    const eButtonWrapper = react_1.useRef(null);
    const eButtonShowMainFilter = react_1.useRef(null);
    const userCompResolve = react_1.useRef();
    const userCompPromise = react_1.useMemo(() => new core_1.AgPromise(resolve => userCompResolve.current = resolve), []);
    const { ctrl } = props;
    react_1.useEffect(() => {
        const compProxy = {
            addOrRemoveCssClass: (name, on) => setCssClasses(prev => prev.setClass(name, on)),
            addOrRemoveBodyCssClass: (name, on) => setBodyCssClasses(prev => prev.setClass(name, on)),
            addOrRemoveButtonWrapperCssClass: (name, on) => setButtonWrapperCssClasses(prev => prev.setClass(name, on)),
            setWidth: width => setWidth(width),
            setCompDetails: compDetails => setUserCompDetails(compDetails),
            getFloatingFilterComp: () => userCompPromise,
            setMenuIcon: eIcon => eButtonShowMainFilter.current.appendChild(eIcon)
        };
        ctrl.setComp(compProxy, eGui.current, eButtonShowMainFilter.current, eFloatingFilterBody.current);
    }, []);
    // js comps
    react_1.useEffect(() => {
        return jsComp_1.showJsComp(userCompDetails, context, eFloatingFilterBody.current, userCompResolve.current);
    }, [userCompDetails]);
    const style = react_1.useMemo(() => ({
        width: width
    }), [width]);
    const className = react_1.useMemo(() => 'ag-header-cell ag-floating-filter ' + cssClasses.toString(), [cssClasses]);
    const bodyClassName = react_1.useMemo(() => cssBodyClasses.toString(), [cssBodyClasses]);
    const buttonWrapperClassName = react_1.useMemo(() => 'ag-floating-filter-button ' + cssButtonWrapperClasses.toString(), [cssBodyClasses]);
    const userCompStateless = react_1.useMemo(() => {
        const res = userCompDetails
            && userCompDetails.componentFromFramework
            && utils_1.isComponentStateless(userCompDetails.componentClass);
        return !!res;
    }, [userCompDetails]);
    const reactUserComp = userCompDetails && userCompDetails.componentFromFramework;
    const UserCompClass = userCompDetails && userCompDetails.componentClass;
    return (react_1.default.createElement("div", { ref: eGui, className: className, style: style, role: "gridcell", tabIndex: -1 },
        react_1.default.createElement("div", { ref: eFloatingFilterBody, className: bodyClassName, role: "presentation" },
            reactUserComp && userCompStateless && react_1.default.createElement(UserCompClass, Object.assign({}, userCompDetails.params)),
            reactUserComp && !userCompStateless && react_1.default.createElement(UserCompClass, Object.assign({}, userCompDetails.params, { ref: userCompResolve.current }))),
        react_1.default.createElement("div", { ref: eButtonWrapper, className: buttonWrapperClassName, role: "presentation" },
            react_1.default.createElement("button", { ref: eButtonShowMainFilter, type: "button", "aria-label": "Open Filter Menu", className: "ag-floating-filter-button-button", tabIndex: -1 }))));
};
exports.default = react_1.memo(HeaderFilterCellComp);

//# sourceMappingURL=headerFilterCellComp.js.map
