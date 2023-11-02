// ag-grid-react v30.2.1
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CellCompState = void 0;
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
    var compDetails = showDetails.compDetails, value = showDetails.value;
    var noCellRenderer = !compDetails;
    var reactCellRenderer = compDetails && compDetails.componentFromFramework;
    var CellRendererClass = compDetails && compDetails.componentClass;
    // if we didn't do this, objects would cause React error. we depend on objects for things
    // like the aggregation functions avg and count, which return objects and depend on toString()
    // getting called.
    var valueForNoCellRenderer = (value === null || value === void 0 ? void 0 : value.toString) ? value.toString() : value;
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
    var tabIndex = cellCtrl.getTabIndex();
    var colId = cellCtrl.getColumnIdSanitised();
    var cellInstanceId = cellCtrl.getInstanceId();
    // Only provide an initial state when not using a Cell Renderer so that we do not display a raw value before the cell renderer is created.
    var _a = react_1.useState(function () { return cellCtrl.getIsCellRenderer() ? undefined : { compDetails: undefined, value: cellCtrl.getValueToDisplay(), force: false }; }), renderDetails = _a[0], setRenderDetails = _a[1];
    var _b = react_1.useState(), editDetails = _b[0], setEditDetails = _b[1];
    var _c = react_1.useState(1), renderKey = _c[0], setRenderKey = _c[1];
    var _d = react_1.useState(), userStyles = _d[0], setUserStyles = _d[1];
    var _e = react_1.useState(false), includeSelection = _e[0], setIncludeSelection = _e[1];
    var _f = react_1.useState(false), includeRowDrag = _f[0], setIncludeRowDrag = _f[1];
    var _g = react_1.useState(false), includeDndSource = _g[0], setIncludeDndSource = _g[1];
    var _h = react_1.useState(), jsEditorComp = _h[0], setJsEditorComp = _h[1];
    // useMemo as more then just accessing a boolean on the cellCtrl
    var forceWrapper = react_1.useMemo(function () { return cellCtrl.isForceWrapper(); }, [cellCtrl]);
    var eGui = react_1.useRef(null);
    var cellRendererRef = react_1.useRef(null);
    var jsCellRendererRef = react_1.useRef();
    var cellEditorRef = react_1.useRef();
    var eCellWrapper = react_1.useRef();
    var cellWrapperDestroyFuncs = react_1.useRef([]);
    // when setting the ref, we also update the state item to force a re-render
    var eCellValue = react_1.useRef();
    var _j = react_1.useState(0), cellValueVersion = _j[0], setCellValueVersion = _j[1];
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
                setTimeout(function () {
                    cellCtrl.stopEditing(true);
                    cellCtrl.focusCell(true);
                });
            }
        }
    }, [cellCtrl]);
    var setPopupCellEditorRef = react_1.useCallback(function (cellRenderer) { return setCellEditorRef(true, cellRenderer); }, [setCellEditorRef]);
    var setInlineCellEditorRef = react_1.useCallback(function (cellRenderer) { return setCellEditorRef(false, cellRenderer); }, [setCellEditorRef]);
    var cssClassManager = react_1.useRef();
    if (!cssClassManager.current) {
        cssClassManager.current = new ag_grid_community_1.CssClassManager(function () { return eGui.current; });
    }
    showJsRenderer_1.default(renderDetails, showCellWrapper, eCellValue.current, cellValueVersion, jsCellRendererRef, eGui);
    // if RenderDetails changed, need to call refresh. This is not our preferred way (the preferred
    // way for React is just allow the new props to propagate down to the React Cell Renderer)
    // however we do this for backwards compatibility, as having refresh used to be supported.
    var lastRenderDetails = react_1.useRef();
    react_1.useLayoutEffect(function () {
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
    react_1.useLayoutEffect(function () {
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
            parentEl === null || parentEl === void 0 ? void 0 : parentEl.appendChild(compGui);
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
    var setCellWrapperRef = react_1.useCallback(function (ref) {
        eCellWrapper.current = ref;
        if (!eCellWrapper.current) {
            cellWrapperDestroyFuncs.current.forEach(function (f) { return f(); });
            cellWrapperDestroyFuncs.current = [];
            return;
        }
        var addComp = function (comp) {
            var _a;
            if (comp) {
                var eGui_1 = comp.getGui();
                (_a = eCellWrapper.current) === null || _a === void 0 ? void 0 : _a.insertAdjacentElement('afterbegin', eGui_1);
                cellWrapperDestroyFuncs.current.push(function () {
                    context.destroyBean(comp);
                    ag_grid_community_1._.removeFromParent(eGui_1);
                });
            }
            return comp;
        };
        if (includeSelection) {
            var checkboxSelectionComp = cellCtrl.createSelectionCheckbox();
            addComp(checkboxSelectionComp);
        }
        if (includeDndSource) {
            addComp(cellCtrl.createDndSource());
        }
        if (includeRowDrag) {
            addComp(cellCtrl.createRowDragComp());
        }
    }, [cellCtrl, context, includeDndSource, includeRowDrag, includeSelection]);
    // we use layout effect here as we want to synchronously process setComp and it's side effects
    // to ensure the component is fully initialised prior to the first browser paint. See AG-7018.
    var setRef = react_1.useCallback(function (ref) {
        eGui.current = ref;
        if (!eGui.current) {
            return;
        }
        if (!cellCtrl) {
            return;
        }
        var compProxy = {
            addOrRemoveCssClass: function (name, on) { return cssClassManager.current.addOrRemoveCssClass(name, on); },
            setUserStyles: function (styles) { return setUserStyles(styles); },
            getFocusableElement: function () { return eGui.current; },
            setIncludeSelection: function (include) { return setIncludeSelection(include); },
            setIncludeRowDrag: function (include) { return setIncludeRowDrag(include); },
            setIncludeDndSource: function (include) { return setIncludeDndSource(include); },
            getCellEditor: function () { return cellEditorRef.current || null; },
            getCellRenderer: function () { return cellRendererRef.current ? cellRendererRef.current : jsCellRendererRef.current; },
            getParentOfValue: function () { return eCellValue.current ? eCellValue.current : eCellWrapper.current ? eCellWrapper.current : eGui.current; },
            setRenderDetails: function (compDetails, value, force) {
                setRenderDetails(function (prev) {
                    if ((prev === null || prev === void 0 ? void 0 : prev.compDetails) !== compDetails || (prev === null || prev === void 0 ? void 0 : prev.value) !== value || (prev === null || prev === void 0 ? void 0 : prev.force) !== force) {
                        return {
                            value: value,
                            compDetails: compDetails,
                            force: force
                        };
                    }
                    else {
                        return prev;
                    }
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
    }, []);
    var reactCellRendererStateless = react_1.useMemo(function () {
        var res = renderDetails &&
            renderDetails.compDetails &&
            renderDetails.compDetails.componentFromFramework &&
            utils_1.isComponentStateless(renderDetails.compDetails.componentClass);
        return !!res;
    }, [renderDetails]);
    react_1.useLayoutEffect(function () {
        var _a;
        if (!eGui.current) {
            return;
        }
        cssClassManager.current.addOrRemoveCssClass('ag-cell-value', !showCellWrapper);
        cssClassManager.current.addOrRemoveCssClass('ag-cell-inline-editing', !!editDetails && !editDetails.popup);
        cssClassManager.current.addOrRemoveCssClass('ag-cell-popup-editing', !!editDetails && !!editDetails.popup);
        cssClassManager.current.addOrRemoveCssClass('ag-cell-not-inline-editing', !editDetails || !!editDetails.popup);
        (_a = cellCtrl.getRowCtrl()) === null || _a === void 0 ? void 0 : _a.setInlineEditingCss(!!editDetails);
        if (cellCtrl.shouldRestoreFocus() && !cellCtrl.isEditing()) {
            // Restore focus to the cell if it was focused before and not editing.
            // If it is editing then it is likely the focus was moved to the editor and we should not move it back.
            eGui.current.focus({ preventScroll: true });
        }
    });
    var showContents = function () { return (react_1.default.createElement(react_1.default.Fragment, null,
        (renderDetails != null && jsxShowValue(renderDetails, renderKey, cellInstanceId, cellRendererRef, showCellWrapper, reactCellRendererStateless, setCellValueRef)),
        (editDetails != null && jsxEditValue(editDetails, setInlineCellEditorRef, setPopupCellEditorRef, eGui.current, cellCtrl, jsEditorComp)))); };
    return (react_1.default.createElement("div", { ref: setRef, style: userStyles, tabIndex: tabIndex, role: 'gridcell', "col-id": colId }, showCellWrapper
        ? (react_1.default.createElement("div", { className: "ag-cell-wrapper", role: "presentation", ref: setCellWrapperRef }, showContents()))
        : showContents()));
};
exports.default = react_1.memo(CellComp);
