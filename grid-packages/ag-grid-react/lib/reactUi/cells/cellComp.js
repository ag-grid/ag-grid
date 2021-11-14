// ag-grid-react v26.2.0
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var ag_grid_community_1 = require("ag-grid-community");
var react_1 = __importStar(require("react"));
var utils_1 = require("../utils");
var popupEditorComp_1 = __importDefault(require("./popupEditorComp"));
var showJsRenderer_1 = __importDefault(require("./showJsRenderer"));
var beansContext_1 = require("../beansContext");
var jsComp_1 = require("../jsComp");
var CellCompState;
(function (CellCompState) {
    CellCompState[CellCompState["ShowValue"] = 0] = "ShowValue";
    CellCompState[CellCompState["EditValue"] = 1] = "EditValue";
})(CellCompState = exports.CellCompState || (exports.CellCompState = {}));
var checkCellEditorDeprecations = function (popup, cellEditor, cellCtrl) {
    var col = cellCtrl.getColumn();
    // cellEditor is written to be a popup editor, however colDef.cellEditorPopup is not set
    if (!popup && cellEditor.isPopup && cellEditor.isPopup()) {
        var msg_1 = "AG Grid: Found an issue in column " + col.getColId() + ". If using ReactUI, specify an editor is a popup using colDef.cellEditorPopup=true";
        ag_grid_community_1._.doOnce(function () { return console.warn(msg_1); }, 'jsEditorComp-isPopup-' + cellCtrl.getColumn().getColId());
    }
    // cellEditor is a popup and is trying to position itself the deprecated way
    if (popup && cellEditor.getPopupPosition && cellEditor.getPopupPosition() != null) {
        var msg_2 = "AG Grid: AG Grid: Found an issue in column " + col.getColId() + ". If using ReactUI, specify an editor popup position using colDef.cellEditorPopupPosition=[value]";
        ag_grid_community_1._.doOnce(function () { return console.warn(msg_2); }, 'jsEditorComp-getPopupPosition-' + cellCtrl.getColumn().getColId());
    }
};
var jsxEditValue = function (editDetails, setInlineCellEditorRef, setPopupCellEditorRef, eGui, cellCtrl, jsEditorComp) {
    var compDetails = editDetails.compDetails;
    var CellEditorClass = compDetails.componentClass;
    var reactInlineEditor = compDetails.componentFromFramework && !editDetails.popup;
    var reactPopupEditor = compDetails.componentFromFramework && editDetails.popup;
    var jsPopupEditor = !compDetails.componentFromFramework && editDetails.popup;
    return (react_1.default.createElement(react_1.default.Fragment, null,
        reactInlineEditor
            && react_1.default.createElement(CellEditorClass, __assign({}, editDetails.compDetails.params, { ref: setInlineCellEditorRef })),
        reactPopupEditor
            && react_1.default.createElement(popupEditorComp_1.default, { editDetails: editDetails, cellCtrl: cellCtrl, eParentCell: eGui, wrappedContent: react_1.default.createElement(CellEditorClass, __assign({}, editDetails.compDetails.params, { ref: setPopupCellEditorRef })) }),
        jsPopupEditor && jsEditorComp && react_1.default.createElement(popupEditorComp_1.default, { editDetails: editDetails, cellCtrl: cellCtrl, eParentCell: eGui, jsChildComp: jsEditorComp })));
};
var jsxShowValue = function (showDetails, parentId, cellRendererRef, showTools, unSelectable, reactCellRendererStateless, toolsRefCallback, toolsValueRefCallback) {
    var compDetails = showDetails.compDetails, value = showDetails.value;
    var noCellRenderer = !compDetails;
    var reactCellRenderer = compDetails && compDetails.componentFromFramework;
    var CellRendererClass = compDetails && compDetails.componentClass;
    var bodyJsxFunc = function () { return (react_1.default.createElement(react_1.default.Fragment, null,
        noCellRenderer && react_1.default.createElement(react_1.default.Fragment, null, value),
        reactCellRenderer && !reactCellRendererStateless && react_1.default.createElement(CellRendererClass, __assign({}, compDetails.params, { ref: cellRendererRef })),
        reactCellRenderer && reactCellRendererStateless && react_1.default.createElement(CellRendererClass, __assign({}, compDetails.params)))); };
    return (react_1.default.createElement(react_1.default.Fragment, null, showTools ?
        react_1.default.createElement("div", { className: "ag-cell-wrapper", role: "presentation", ref: toolsRefCallback },
            react_1.default.createElement("span", { role: "presentation", id: "cell-" + parentId, className: "ag-cell-value", unselectable: unSelectable, ref: toolsValueRefCallback }, bodyJsxFunc())) :
        bodyJsxFunc()));
};
var CellComp = function (props) {
    var context = react_1.useContext(beansContext_1.BeansContext).context;
    var cellCtrl = props.cellCtrl, printLayout = props.printLayout, editingRow = props.editingRow;
    var _a = react_1.useState(), renderDetails = _a[0], setRenderDetails = _a[1];
    var _b = react_1.useState(), editDetails = _b[0], setEditDetails = _b[1];
    var _c = react_1.useState(new utils_1.CssClasses()), cssClasses = _c[0], setCssClasses = _c[1];
    var _d = react_1.useState(), userStyles = _d[0], setUserStyles = _d[1];
    var _e = react_1.useState('on'), unselectable = _e[0], setUnselectable = _e[1];
    var _f = react_1.useState(), left = _f[0], setLeft = _f[1];
    var _g = react_1.useState(), width = _g[0], setWidth = _g[1];
    var _h = react_1.useState(), height = _h[0], setHeight = _h[1];
    var _j = react_1.useState(), transition = _j[0], setTransition = _j[1];
    var _k = react_1.useState(), tabIndex = _k[0], setTabIndex = _k[1];
    var _l = react_1.useState(), ariaSelected = _l[0], setAriaSelected = _l[1];
    var _m = react_1.useState(), ariaExpanded = _m[0], setAriaExpanded = _m[1];
    var _o = react_1.useState(), ariaColIndex = _o[0], setAriaColIndex = _o[1];
    var _p = react_1.useState(), ariaDescribedBy = _p[0], setAriaDescribedBy = _p[1];
    var _q = react_1.useState(), zIndex = _q[0], setZIndex = _q[1];
    var _r = react_1.useState(), role = _r[0], setRole = _r[1];
    var _s = react_1.useState(), colId = _s[0], setColId = _s[1];
    var _t = react_1.useState(), title = _t[0], setTitle = _t[1];
    var _u = react_1.useState(false), includeSelection = _u[0], setIncludeSelection = _u[1];
    var _v = react_1.useState(false), includeRowDrag = _v[0], setIncludeRowDrag = _v[1];
    var _w = react_1.useState(false), includeDndSource = _w[0], setIncludeDndSource = _w[1];
    var _x = react_1.useState(false), forceWrapper = _x[0], setForceWrapper = _x[1];
    var _y = react_1.useState(), jsEditorComp = _y[0], setJsEditorComp = _y[1];
    var eGui = react_1.useRef(null);
    var cellRendererRef = react_1.useRef(null);
    var jsCellRendererRef = react_1.useRef();
    var cellEditorRef = react_1.useRef();
    var _z = react_1.useState(), toolsSpan = _z[0], setToolsSpan = _z[1];
    var _0 = react_1.useState(), toolsValueSpan = _0[0], setToolsValueSpan = _0[1];
    var showTools = renderDetails != null && (includeSelection || includeDndSource || includeRowDrag || forceWrapper);
    var setCellEditorRef = react_1.useCallback(function (popup, cellEditor) {
        cellEditorRef.current = cellEditor;
        if (cellEditor) {
            checkCellEditorDeprecations(popup, cellEditor, cellCtrl);
            var editingCancelledByUserComp = cellEditor.isCancelBeforeStart && cellEditor.isCancelBeforeStart();
            if (editingCancelledByUserComp) {
                // we cannot set state inside render, so hack is to do it in next VM turn
                setTimeout(function () { return cellCtrl.stopEditing(); }, 0);
            }
        }
    }, []);
    var setPopupCellEditorRef = react_1.useCallback(function (cellRenderer) { return setCellEditorRef(true, cellRenderer); }, []);
    var setInlineCellEditorRef = react_1.useCallback(function (cellRenderer) { return setCellEditorRef(false, cellRenderer); }, []);
    showJsRenderer_1.default(renderDetails, showTools, toolsValueSpan, jsCellRendererRef, eGui);
    react_1.useEffect(function () {
        var doingJsEditor = editDetails && !editDetails.compDetails.componentFromFramework;
        if (!doingJsEditor) {
            return;
        }
        var compDetails = editDetails.compDetails;
        var isPopup = editDetails.popup === true;
        var cellEditor = jsComp_1.createJsComp(compDetails);
        if (!cellEditor) {
            return;
        }
        var compGui = cellEditor.getGui();
        setCellEditorRef(isPopup, cellEditor);
        if (!isPopup) {
            eGui.current.appendChild(compGui);
            cellEditor.afterGuiAttached && cellEditor.afterGuiAttached();
        }
        setJsEditorComp(cellEditor);
        return function () {
            context.destroyBean(cellEditor);
            setCellEditorRef(isPopup, undefined);
            setJsEditorComp(undefined);
            if (compGui && compGui.parentElement) {
                compGui.parentElement.removeChild(compGui);
            }
        };
    }, [editDetails]);
    // tool widgets effect
    react_1.useEffect(function () {
        if (!cellCtrl || !context) {
            return;
        }
        setAriaDescribedBy(!!toolsSpan ? "cell-" + cellCtrl.getInstanceId() : undefined);
        if (!toolsSpan) {
            return;
        }
        var beansToDestroy = [];
        var addComp = function (comp) {
            if (comp) {
                toolsSpan.insertAdjacentElement('afterbegin', comp.getGui());
                beansToDestroy.push(comp);
            }
            return comp;
        };
        if (includeSelection) {
            addComp(cellCtrl.createSelectionCheckbox());
        }
        if (includeDndSource) {
            addComp(cellCtrl.createDndSource());
        }
        if (includeRowDrag) {
            addComp(cellCtrl.createRowDragComp());
        }
        return function () {
            context.destroyBeans(beansToDestroy);
        };
    }, [includeDndSource, includeRowDrag, includeSelection, toolsSpan]);
    // attaching the ref to state makes sure we render again when state is set. this is
    // how we make sure the tools are added, as it's not possible to have an effect depend
    // on a reference, as reference is not state, it doesn't create another render cycle.
    var toolsRefCallback = react_1.useCallback(function (ref) { return setToolsSpan(ref); }, []);
    var toolsValueRefCallback = react_1.useCallback(function (ref) { return setToolsValueSpan(ref); }, []);
    react_1.useEffect(function () {
        if (!cellCtrl) {
            return;
        }
        var compProxy = {
            addOrRemoveCssClass: function (name, on) { return setCssClasses(function (prev) { return prev.setClass(name, on); }); },
            setUserStyles: function (styles) { return setUserStyles(styles); },
            setAriaSelected: function (value) { return setAriaSelected(value); },
            setAriaExpanded: function (value) { return setAriaExpanded(value); },
            getFocusableElement: function () { return eGui.current; },
            setLeft: function (left) { return setLeft(left); },
            setWidth: function (width) { return setWidth(width); },
            setAriaColIndex: function (index) { return setAriaColIndex(index); },
            setHeight: function (height) { return setHeight(height); },
            setZIndex: function (zIndex) { return setZIndex(zIndex); },
            setTabIndex: function (tabIndex) { return setTabIndex(tabIndex); },
            setRole: function (role) { return setRole(role); },
            setColId: function (colId) { return setColId(colId); },
            setTitle: function (title) { return setTitle(title); },
            setUnselectable: function (value) { return setUnselectable(value || undefined); },
            setTransition: function (transition) { return setTransition(transition); },
            setIncludeSelection: function (include) { return setIncludeSelection(include); },
            setIncludeRowDrag: function (include) { return setIncludeRowDrag(include); },
            setIncludeDndSource: function (include) { return setIncludeDndSource(include); },
            setForceWrapper: function (force) { return setForceWrapper(force); },
            getCellEditor: function () { return cellEditorRef.current || null; },
            getCellRenderer: function () { return cellRendererRef.current ? cellRendererRef.current : jsCellRendererRef.current; },
            getParentOfValue: function () { return toolsValueSpan ? toolsValueSpan : eGui.current; },
            setRenderDetails: function (compDetails, value, force) {
                setRenderDetails({
                    value: value,
                    compDetails: compDetails,
                    force: force
                });
            },
            setEditDetails: function (compDetails, popup, popupPosition) {
                if (compDetails) {
                    // start editing
                    setEditDetails({
                        compDetails: compDetails,
                        popup: popup,
                        popupPosition: popupPosition
                    });
                    if (!popup) {
                        setRenderDetails(undefined);
                    }
                }
                else {
                    // stop editing
                    setEditDetails(undefined);
                }
            }
        };
        cellCtrl.setComp(compProxy, null, eGui.current, printLayout, editingRow);
    }, []);
    var reactCellRendererStateless = react_1.useMemo(function () {
        var res = renderDetails && renderDetails.compDetails
            && renderDetails.compDetails.componentFromFramework
            && utils_1.isComponentStateless(renderDetails.compDetails.componentClass);
        return !!res;
    }, [renderDetails]);
    var className = react_1.useMemo(function () {
        var res = cssClasses.toString();
        if (!showTools) {
            res += ' ag-cell-value';
        }
        return res;
    }, [cssClasses, showTools]);
    var cellStyles = react_1.useMemo(function () {
        var res = {
            left: left,
            width: width,
            height: height,
            transition: transition,
            zIndex: zIndex
        };
        ag_grid_community_1._.assign(res, userStyles);
        return res;
    }, [left, width, height, transition, zIndex, userStyles]);
    var cellInstanceId = react_1.useMemo(function () { return cellCtrl.getInstanceId(); }, []);
    return (react_1.default.createElement("div", { ref: eGui, className: className, style: cellStyles, tabIndex: tabIndex, "aria-selected": ariaSelected, "aria-colindex": ariaColIndex, role: role, "aria-expanded": ariaExpanded, "col-id": colId, title: title, unselectable: unselectable, "aria-describedby": ariaDescribedBy },
        renderDetails != null && jsxShowValue(renderDetails, cellInstanceId, cellRendererRef, showTools, unselectable, reactCellRendererStateless, toolsRefCallback, toolsValueRefCallback),
        editDetails != null && jsxEditValue(editDetails, setInlineCellEditorRef, setPopupCellEditorRef, eGui.current, cellCtrl, jsEditorComp)));
};
exports.default = react_1.memo(CellComp);
