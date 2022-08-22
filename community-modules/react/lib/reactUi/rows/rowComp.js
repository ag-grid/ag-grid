// @ag-grid-community/react v28.1.1
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
const core_1 = require("@ag-grid-community/core");
const jsComp_1 = require("../jsComp");
const utils_1 = require("../utils");
const beansContext_1 = require("../beansContext");
const cellComp_1 = __importDefault(require("../cells/cellComp"));
const useEffectOnce_1 = require("../useEffectOnce");
const maintainOrderOnColumns = (prev, next, domOrder) => {
    if (domOrder) {
        const res = { list: next, instanceIdMap: new Map() };
        next.forEach(c => res.instanceIdMap.set(c.getInstanceId(), c));
        return res;
    }
    // if dom order not important, we don't want to change the order
    // of the elements in the dom, as this would break transition styles
    const oldCellCtrls = [];
    const newCellCtrls = [];
    const newInstanceIdMap = new Map();
    const tempMap = new Map();
    next.forEach(c => tempMap.set(c.getInstanceId(), c));
    prev.list.forEach(c => {
        const instanceId = c.getInstanceId();
        if (tempMap.has(instanceId)) {
            oldCellCtrls.push(c);
            newInstanceIdMap.set(instanceId, c);
        }
    });
    next.forEach(c => {
        const instanceId = c.getInstanceId();
        if (!prev.instanceIdMap.has(instanceId)) {
            newCellCtrls.push(c);
            newInstanceIdMap.set(instanceId, c);
        }
    });
    const res = {
        list: [...oldCellCtrls, ...newCellCtrls],
        instanceIdMap: newInstanceIdMap
    };
    return res;
};
const RowComp = (params) => {
    const { context } = react_1.useContext(beansContext_1.BeansContext);
    const { rowCtrl, containerType } = params;
    const [rowIndex, setRowIndex] = react_1.useState();
    const [rowId, setRowId] = react_1.useState();
    const [role, setRole] = react_1.useState();
    const [rowBusinessKey, setRowBusinessKey] = react_1.useState();
    const [tabIndex, setTabIndex] = react_1.useState();
    const [userStyles, setUserStyles] = react_1.useState();
    const [cellCtrls, setCellCtrls] = react_1.useState({ list: [], instanceIdMap: new Map() });
    const [fullWidthCompDetails, setFullWidthCompDetails] = react_1.useState();
    const [domOrder, setDomOrder] = react_1.useState(false);
    // these styles have initial values, so element is placed into the DOM with them,
    // rather than an transition getting applied.
    const [top, setTop] = react_1.useState(rowCtrl.getInitialRowTop());
    const [transform, setTransform] = react_1.useState(rowCtrl.getInitialTransform());
    const eGui = react_1.useRef(null);
    const fullWidthCompRef = react_1.useRef();
    const autoHeightSetup = react_1.useRef(false);
    const [autoHeightSetupAttempt, setAutoHeightSetupAttempt] = react_1.useState(0);
    // puts autoHeight onto full with detail rows. this needs trickery, as we need
    // the HTMLElement for the provided Detail Cell Renderer, however the Detail Cell Renderer
    // could be a stateless React Func Comp which won't work with useRef, so we need
    // to poll (we limit to 10) looking for the Detail HTMLElement (which will be the only
    // child) after the fullWidthCompDetails is set.
    react_1.useEffect(() => {
        var _a;
        if (autoHeightSetup.current) {
            return;
        }
        if (!fullWidthCompDetails) {
            return;
        }
        if (autoHeightSetupAttempt > 10) {
            return;
        }
        const eChild = (_a = eGui.current) === null || _a === void 0 ? void 0 : _a.firstChild;
        if (eChild) {
            rowCtrl.setupDetailRowAutoHeight(eChild);
            autoHeightSetup.current = true;
        }
        else {
            setAutoHeightSetupAttempt(prev => prev + 1);
        }
    }, [fullWidthCompDetails, autoHeightSetupAttempt]);
    const cssClassManager = react_1.useMemo(() => new core_1.CssClassManager(() => eGui.current), []);
    // we use layout effect here as we want to synchronously process setComp and it's side effects
    // to ensure the component is fully initialised prior to the first browser paint. See AG-7018.
    useEffectOnce_1.useLayoutEffectOnce(() => {
        // because React is asychronous, it's possible the RowCtrl is no longer a valid RowCtrl. This can
        // happen if user calls two API methods one after the other, with the second API invalidating the rows
        // the first call created. Thus the rows for the first call could still get created even though no longer needed.
        if (!rowCtrl.isAlive()) {
            return;
        }
        const compProxy = {
            // the rowTop is managed by state, instead of direct style manipulation by rowCtrl (like all the other styles)
            // as we need to have an initial value when it's placed into he DOM for the first time, for animation to work.
            setTop: value => setTop(value),
            setTransform: value => setTransform(value),
            // i found using React for managing classes at the row level was to slow, as modifying classes caused a lot of
            // React code to execute, so avoiding React for managing CSS Classes made the grid go much faster.
            addOrRemoveCssClass: (name, on) => cssClassManager.addOrRemoveCssClass(name, on),
            setDomOrder: domOrder => setDomOrder(domOrder),
            setRowIndex: value => setRowIndex(value),
            setRowId: value => setRowId(value),
            setRowBusinessKey: value => setRowBusinessKey(value),
            setTabIndex: value => setTabIndex(value),
            setUserStyles: styles => setUserStyles(styles),
            setRole: value => setRole(value),
            // if we don't maintain the order, then cols will be ripped out and into the dom
            // when cols reordered, which would stop the CSS transitions from working
            setCellCtrls: next => setCellCtrls(prev => maintainOrderOnColumns(prev, next, domOrder)),
            showFullWidth: compDetails => setFullWidthCompDetails(compDetails),
            getFullWidthCellRenderer: () => fullWidthCompRef.current,
        };
        rowCtrl.setComp(compProxy, eGui.current, containerType);
    });
    react_1.useEffect(() => jsComp_1.showJsComp(fullWidthCompDetails, context, eGui.current, fullWidthCompRef), [fullWidthCompDetails]);
    const rowStyles = react_1.useMemo(() => {
        const res = { top, transform };
        Object.assign(res, userStyles);
        return res;
    }, [top, transform, userStyles]);
    const showFullWidthFramework = fullWidthCompDetails && fullWidthCompDetails.componentFromFramework;
    const showCells = cellCtrls != null;
    const reactFullWidthCellRendererStateless = react_1.useMemo(() => {
        var _a;
        const res = ((_a = fullWidthCompDetails) === null || _a === void 0 ? void 0 : _a.componentFromFramework) && utils_1.isComponentStateless(fullWidthCompDetails.componentClass);
        return !!res;
    }, [fullWidthCompDetails]);
    const showCellsJsx = () => cellCtrls.list.map(cellCtrl => (react_1.default.createElement(cellComp_1.default, { cellCtrl: cellCtrl, editingRow: rowCtrl.isEditing(), printLayout: rowCtrl.isPrintLayout(), key: cellCtrl.getInstanceId() })));
    const showFullWidthFrameworkJsx = () => {
        const FullWidthComp = fullWidthCompDetails.componentClass;
        return (react_1.default.createElement(react_1.default.Fragment, null,
            reactFullWidthCellRendererStateless
                && react_1.default.createElement(FullWidthComp, Object.assign({}, fullWidthCompDetails.params)),
            !reactFullWidthCellRendererStateless
                && react_1.default.createElement(FullWidthComp, Object.assign({}, fullWidthCompDetails.params, { ref: fullWidthCompRef }))));
    };
    return (react_1.default.createElement("div", { ref: eGui, role: role, style: rowStyles, "row-index": rowIndex, "row-id": rowId, "row-business-key": rowBusinessKey, tabIndex: tabIndex },
        showCells && showCellsJsx(),
        showFullWidthFramework && showFullWidthFrameworkJsx()));
};
exports.default = react_1.memo(RowComp);

//# sourceMappingURL=rowComp.js.map
