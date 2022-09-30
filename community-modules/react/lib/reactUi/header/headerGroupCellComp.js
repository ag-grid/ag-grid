// @ag-grid-community/react v28.2.0
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
const jsComp_1 = require("../jsComp");
const useEffectOnce_1 = require("../useEffectOnce");
const utils_1 = require("../utils");
const HeaderGroupCellComp = (props) => {
    const { context } = react_1.useContext(beansContext_1.BeansContext);
    const [cssClasses, setCssClasses] = react_1.useState(new utils_1.CssClasses());
    const [cssResizableClasses, setResizableCssClasses] = react_1.useState(new utils_1.CssClasses());
    const [width, setWidth] = react_1.useState();
    const [title, setTitle] = react_1.useState();
    const [colId, setColId] = react_1.useState();
    const [ariaExpanded, setAriaExpanded] = react_1.useState();
    const [userCompDetails, setUserCompDetails] = react_1.useState();
    const eGui = react_1.useRef(null);
    const eResize = react_1.useRef(null);
    const { ctrl } = props;
    useEffectOnce_1.useEffectOnce(() => {
        const compProxy = {
            setWidth: width => setWidth(width),
            addOrRemoveCssClass: (name, on) => setCssClasses(prev => prev.setClass(name, on)),
            setColId: id => setColId(id),
            setTitle: title => setTitle(title),
            setUserCompDetails: compDetails => setUserCompDetails(compDetails),
            addOrRemoveResizableCssClass: (name, on) => setResizableCssClasses(prev => prev.setClass(name, on)),
            setAriaExpanded: expanded => setAriaExpanded(expanded)
        };
        ctrl.setComp(compProxy, eGui.current, eResize.current);
    });
    // js comps
    react_1.useEffect(() => {
        return jsComp_1.showJsComp(userCompDetails, context, eGui.current);
    }, [userCompDetails]);
    // add drag handling, must be done after component is added to the dom
    react_1.useEffect(() => {
        let userCompDomElement = undefined;
        eGui.current.childNodes.forEach(node => {
            if (node != null && node !== eResize.current) {
                userCompDomElement = node;
            }
        });
        userCompDomElement && ctrl.setDragSource(userCompDomElement);
    }, [userCompDetails]);
    const style = react_1.useMemo(() => ({
        width: width
    }), [width]);
    const className = react_1.useMemo(() => 'ag-header-group-cell ' + cssClasses.toString(), [cssClasses]);
    const resizableClassName = react_1.useMemo(() => 'ag-header-cell-resize ' + cssResizableClasses.toString(), [cssResizableClasses]);
    const reactUserComp = userCompDetails && userCompDetails.componentFromFramework;
    const UserCompClass = userCompDetails && userCompDetails.componentClass;
    return (react_1.default.createElement("div", { ref: eGui, className: className, style: style, title: title, "col-id": colId, role: "columnheader", tabIndex: -1, "aria-expanded": ariaExpanded },
        reactUserComp && react_1.default.createElement(UserCompClass, Object.assign({}, userCompDetails.params)),
        react_1.default.createElement("div", { ref: eResize, className: resizableClassName })));
};
exports.default = react_1.memo(HeaderGroupCellComp);

//# sourceMappingURL=headerGroupCellComp.js.map
