// ag-grid-react v28.2.1
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
var useEffectOnce_1 = require("../useEffectOnce");
var CellCompState;
(function (CellCompState) {
    CellCompState[CellCompState["ShowValue"] = 0] = "ShowValue";
    CellCompState[CellCompState["EditValue"] = 1] = "EditValue";
})(CellCompState = exports.CellCompState || (exports.CellCompState = {}));
var checkCellEditorDeprecations = function (popup, cellEditor, cellCtrl) {
    var col = cellCtrl.getColumn();
    // cellEditor is written to be a popup editor, however colDef.cellEditorPopup is not set
    if (!popup && cellEditor.isPopup && cellEditor.isPopup()) {
        var msg_1 = "AG Grid: Found an issue in column " + col.getColId() + ". If using React, specify an editor is a popup using colDef.cellEditorPopup=true. AG Grid React cannot depend on the editor component specifying if it's in a popup (via the isPopup() method on the editor), as React needs to know this information BEFORE the component is created.";
        ag_grid_community_1._.doOnce(function () { return console.warn(msg_1); }, 'jsEditorComp-isPopup-' + cellCtrl.getColumn().getColId());
    }
    // cellEditor is a popup and is trying to position itself the deprecated way
    if (popup && cellEditor.getPopupPosition && cellEditor.getPopupPosition() != null) {
        var msg_2 = "AG Grid: Found an issue in column " + col.getColId() + ". If using React, specify an editor popup position using colDef.cellEditorPopupPosition=true. AG Grid React cannot depend on the editor component specifying it's position (via the getPopupPosition() method on the editor), as React needs to know this information BEFORE the component is created.";
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
        reactInlineEditor && react_1.default.createElement(CellEditorClass, __assign({}, editDetails.compDetails.params, { ref: setInlineCellEditorRef })),
        reactPopupEditor &&
            react_1.default.createElement(popupEditorComp_1.default, { editDetails: editDetails, cellCtrl: cellCtrl, eParentCell: eGui, wrappedContent: react_1.default.createElement(CellEditorClass, __assign({}, editDetails.compDetails.params, { ref: setPopupCellEditorRef })) }),
        jsPopupEditor &&
            jsEditorComp &&
            react_1.default.createElement(popupEditorComp_1.default, { editDetails: editDetails, cellCtrl: cellCtrl, eParentCell: eGui, jsChildComp: jsEditorComp })));
};
var jsxShowValue = function (showDetails, key, parentId, cellRendererRef, showCellWrapper, reactCellRendererStateless, setECellValue) {
    var _a;
    var compDetails = showDetails.compDetails, value = showDetails.value;
    var noCellRenderer = !compDetails;
    var reactCellRenderer = compDetails && compDetails.componentFromFramework;
    var CellRendererClass = compDetails && compDetails.componentClass;
    // if we didn't do this, objects would cause React error. we depend on objects for things
    // like the aggregation functions avg and count, which return objects and depend on toString()
    // getting called.
    var valueForNoCellRenderer = ((_a = value) === null || _a === void 0 ? void 0 : _a.toString) ? value.toString() : value;
    var bodyJsxFunc = function () { return (react_1.default.createElement(react_1.default.Fragment, null,
        noCellRenderer && react_1.default.createElement(react_1.default.Fragment, null, valueForNoCellRenderer),
        reactCellRenderer && !reactCellRendererStateless && react_1.default.createElement(CellRendererClass, __assign({}, compDetails.params, { key: key, ref: cellRendererRef })),
        reactCellRenderer && reactCellRendererStateless && react_1.default.createElement(CellRendererClass, __assign({}, compDetails.params, { key: key })))); };
    return (react_1.default.createElement(react_1.default.Fragment, null, showCellWrapper
        ? (react_1.default.createElement("span", { role: "presentation", id: "cell-" + parentId, className: "ag-cell-value", ref: setECellValue }, bodyJsxFunc()))
        : bodyJsxFunc()));
};
var CellComp = function (props) {
    var context = react_1.useContext(beansContext_1.BeansContext).context;
    var cellCtrl = props.cellCtrl, printLayout = props.printLayout, editingRow = props.editingRow;
    var _a = react_1.useState(), renderDetails = _a[0], setRenderDetails = _a[1];
    var _b = react_1.useState(), editDetails = _b[0], setEditDetails = _b[1];
    var _c = react_1.useState(1), renderKey = _c[0], setRenderKey = _c[1];
    var _d = react_1.useState(), userStyles = _d[0], setUserStyles = _d[1];
    var _e = react_1.useState(), tabIndex = _e[0], setTabIndex = _e[1];
    var _f = react_1.useState(), ariaDescribedBy = _f[0], setAriaDescribedBy = _f[1];
    var _g = react_1.useState(), role = _g[0], setRole = _g[1];
    var _h = react_1.useState(), colId = _h[0], setColId = _h[1];
    var _j = react_1.useState(), title = _j[0], setTitle = _j[1];
    var _k = react_1.useState(false), includeSelection = _k[0], setIncludeSelection = _k[1];
    var _l = react_1.useState(false), includeRowDrag = _l[0], setIncludeRowDrag = _l[1];
    var _m = react_1.useState(false), includeDndSource = _m[0], setIncludeDndSource = _m[1];
    var _o = react_1.useState(), jsEditorComp = _o[0], setJsEditorComp = _o[1];
    var forceWrapper = react_1.useMemo(function () { return cellCtrl.isForceWrapper(); }, []);
    var eGui = react_1.useRef(null);
    var cellRendererRef = react_1.useRef(null);
    var jsCellRendererRef = react_1.useRef();
    var cellEditorRef = react_1.useRef();
    // when setting the ref, we also update the state item to force a re-render
    var eCellWrapper = react_1.useRef();
    var _p = react_1.useState(0), cellWrapperVersion = _p[0], setCellWrapperVersion = _p[1];
    var setCellWrapperRef = react_1.useCallback(function (ref) {
        eCellWrapper.current = ref;
        setCellWrapperVersion(function (v) { return v + 1; });
    }, []);
    // when setting the ref, we also update the state item to force a re-render
    var eCellValue = react_1.useRef();
    var _q = react_1.useState(0), cellValueVersion = _q[0], setCellValueVersion = _q[1];
    var setCellValueRef = react_1.useCallback(function (ref) {
        eCellValue.current = ref;
        setCellValueVersion(function (v) { return v + 1; });
    }, []);
    var showTools = renderDetails != null && (includeSelection || includeDndSource || includeRowDrag);
    var showCellWrapper = forceWrapper || showTools;
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
    var cssClassManager = react_1.useMemo(function () { return new ag_grid_community_1.CssClassManager(function () { return eGui.current; }); }, []);
    showJsRenderer_1.default(renderDetails, showCellWrapper, eCellValue.current, cellValueVersion, jsCellRendererRef, eGui);
    // if RenderDetails changed, need to call refresh. This is not our preferred way (the preferred
    // way for React is just allow the new props to propagate down to the React Cell Renderer)
    // however we do this for backwards compatibility, as having refresh used to be supported.
    var lastRenderDetails = react_1.useRef();
    react_1.useEffect(function () {
        var oldDetails = lastRenderDetails.current;
        var newDetails = renderDetails;
        lastRenderDetails.current = renderDetails;
        // if not updating renderDetails, do nothing
        if (oldDetails == null ||
            oldDetails.compDetails == null ||
            newDetails == null ||
            newDetails.compDetails == null) {
            return;
        }
        var oldCompDetails = oldDetails.compDetails;
        var newCompDetails = newDetails.compDetails;
        // if different Cell Renderer, then do nothing, as renderer will be recreated
        if (oldCompDetails.componentClass != newCompDetails.componentClass) {
            return;
        }
        // if no refresh method, do nothing
        if (cellRendererRef.current == null || cellRendererRef.current.refresh == null) {
            return;
        }
        var result = cellRendererRef.current.refresh(newCompDetails.params);
        if (result != true) {
            // increasing the render key forces the refresh. this is undocumented (for React users,
            // we don't document the refresh method, instead we tell them to act on new params).
            // however the GroupCellRenderer has this logic in it and would need a small refactor
            // to get it working without using refresh() returning false. so this hack staying in,
            // in React if refresh() is implemented and returns false (or undefined), we force a refresh
            setRenderKey(function (prev) { return prev + 1; });
        }
    }, [renderDetails]);
    react_1.useEffect(function () {
        var _a;
        var doingJsEditor = editDetails && !editDetails.compDetails.componentFromFramework;
        if (!doingJsEditor) {
            return;
        }
        var compDetails = editDetails.compDetails;
        var isPopup = editDetails.popup === true;
        var cellEditor = jsComp_1.createSyncJsComp(compDetails);
        if (!cellEditor) {
            return;
        }
        var compGui = cellEditor.getGui();
        setCellEditorRef(isPopup, cellEditor);
        if (!isPopup) {
            var parentEl = (forceWrapper ? eCellWrapper : eGui).current;
            (_a = parentEl) === null || _a === void 0 ? void 0 : _a.appendChild(compGui);
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
        setAriaDescribedBy(!!eCellWrapper.current ? "cell-" + cellCtrl.getInstanceId() : undefined);
        if (!eCellWrapper.current || !showCellWrapper) {
            return;
        }
        var destroyFuncs = [];
        var addComp = function (comp) {
            if (comp) {
                var eGui_1 = comp.getGui();
                eCellWrapper.current.insertAdjacentElement('afterbegin', eGui_1);
                destroyFuncs.push(function () {
                    context.destroyBean(comp);
                    ag_grid_community_1._.removeFromParent(eGui_1);
                });
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
        return function () { return destroyFuncs.forEach(function (f) { return f(); }); };
    }, [showCellWrapper, includeDndSource, includeRowDrag, includeSelection, cellWrapperVersion]);
    // we use layout effect here as we want to synchronously process setComp and it's side effects
    // to ensure the component is fully initialised prior to the first browser paint. See AG-7018.
    useEffectOnce_1.useLayoutEffectOnce(function () {
        if (!cellCtrl) {
            return;
        }
        var compProxy = {
            addOrRemoveCssClass: function (name, on) { return cssClassManager.addOrRemoveCssClass(name, on); },
            setUserStyles: function (styles) { return setUserStyles(styles); },
            getFocusableElement: function () { return eGui.current; },
            setTabIndex: function (tabIndex) { return setTabIndex(tabIndex); },
            setRole: function (role) { return setRole(role); },
            setColId: function (colId) { return setColId(colId); },
            setTitle: function (title) { return setTitle(title); },
            setIncludeSelection: function (include) { return setIncludeSelection(include); },
            setIncludeRowDrag: function (include) { return setIncludeRowDrag(include); },
            setIncludeDndSource: function (include) { return setIncludeDndSource(include); },
            getCellEditor: function () { return cellEditorRef.current || null; },
            getCellRenderer: function () { return cellRendererRef.current ? cellRendererRef.current : jsCellRendererRef.current; },
            getParentOfValue: function () { return eCellValue.current ? eCellValue.current : eCellWrapper.current ? eCellWrapper.current : eGui.current; },
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
        var cellWrapperOrUndefined = eCellWrapper.current || undefined;
        cellCtrl.setComp(compProxy, eGui.current, cellWrapperOrUndefined, printLayout, editingRow);
    });
    var reactCellRendererStateless = react_1.useMemo(function () {
        var res = renderDetails &&
            renderDetails.compDetails &&
            renderDetails.compDetails.componentFromFramework &&
            utils_1.isComponentStateless(renderDetails.compDetails.componentClass);
        return !!res;
    }, [renderDetails]);
    if (eGui.current && !showCellWrapper) {
        cssClassManager.addOrRemoveCssClass('ag-cell-value', !showCellWrapper);
    }
    var cellInstanceId = react_1.useMemo(function () { return cellCtrl.getInstanceId(); }, []);
    var showContents = function () { return (react_1.default.createElement(react_1.default.Fragment, null,
        renderDetails != null &&
            jsxShowValue(renderDetails, renderKey, cellInstanceId, cellRendererRef, showCellWrapper, reactCellRendererStateless, setCellValueRef),
        editDetails != null &&
            jsxEditValue(editDetails, setInlineCellEditorRef, setPopupCellEditorRef, eGui.current, cellCtrl, jsEditorComp))); };
    return (react_1.default.createElement("div", { ref: eGui, style: userStyles, tabIndex: tabIndex, role: role, "col-id": colId, title: title, "aria-describedby": ariaDescribedBy }, showCellWrapper
        ? (react_1.default.createElement("div", { className: "ag-cell-wrapper", role: "presentation", ref: setCellWrapperRef }, showContents()))
        : showContents()));
};
exports.default = react_1.memo(CellComp);
