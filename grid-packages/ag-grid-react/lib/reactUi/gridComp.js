// ag-grid-react v31.0.3
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_community_1 = require("ag-grid-community");
var react_1 = __importStar(require("react"));
var beansContext_1 = require("./beansContext");
var gridBodyComp_1 = __importDefault(require("./gridBodyComp"));
var reactComment_1 = __importDefault(require("./reactComment"));
var tabGuardComp_1 = __importDefault(require("./tabGuardComp"));
var utils_1 = require("./utils");
var GridComp = function (_a) {
    var context = _a.context;
    var _b = react_1.useState(''), rtlClass = _b[0], setRtlClass = _b[1];
    var _c = react_1.useState(''), keyboardFocusClass = _c[0], setKeyboardFocusClass = _c[1];
    var _d = react_1.useState(''), layoutClass = _d[0], setLayoutClass = _d[1];
    var _e = react_1.useState(null), cursor = _e[0], setCursor = _e[1];
    var _f = react_1.useState(null), userSelect = _f[0], setUserSelect = _f[1];
    var _g = react_1.useState(false), initialised = _g[0], setInitialised = _g[1];
    var _h = react_1.useState(), tabGuardReady = _h[0], setTabGuardReady = _h[1];
    var gridCtrlRef = react_1.useRef(null);
    var eRootWrapperRef = react_1.useRef(null);
    var tabGuardRef = react_1.useRef();
    // eGridBodyParent is state as we use it in render
    var _j = react_1.useState(null), eGridBodyParent = _j[0], setGridBodyParent = _j[1];
    var focusInnerElementRef = react_1.useRef(function () { return undefined; });
    var onTabKeyDown = react_1.useCallback(function () { return undefined; }, []);
    var beans = react_1.useMemo(function () {
        if (context.isDestroyed()) {
            return null;
        }
        return context.getBean('beans');
    }, [context]);
    reactComment_1.default(' AG Grid ', eRootWrapperRef);
    var setRef = react_1.useCallback(function (e) {
        eRootWrapperRef.current = e;
        if (!eRootWrapperRef.current) {
            context.destroyBean(gridCtrlRef.current);
            gridCtrlRef.current = null;
            return;
        }
        if (context.isDestroyed()) {
            return;
        }
        gridCtrlRef.current = context.createBean(new ag_grid_community_1.GridCtrl());
        var gridCtrl = gridCtrlRef.current;
        focusInnerElementRef.current = gridCtrl.focusInnerElement.bind(gridCtrl);
        var compProxy = {
            destroyGridUi: function () { },
            setRtlClass: setRtlClass,
            forceFocusOutOfContainer: function () {
                var _a;
                (_a = tabGuardRef.current) === null || _a === void 0 ? void 0 : _a.forceFocusOutOfContainer();
            },
            updateLayoutClasses: setLayoutClass,
            getFocusableContainers: function () {
                var _a, _b;
                var els = [];
                var gridBodyCompEl = (_a = eRootWrapperRef.current) === null || _a === void 0 ? void 0 : _a.querySelector('.ag-root');
                var sideBarEl = (_b = eRootWrapperRef.current) === null || _b === void 0 ? void 0 : _b.querySelector('.ag-side-bar:not(.ag-hidden)');
                if (gridBodyCompEl) {
                    els.push(gridBodyCompEl);
                }
                if (sideBarEl) {
                    els.push(sideBarEl);
                }
                return els;
            },
            setCursor: setCursor,
            setUserSelect: setUserSelect
        };
        gridCtrl.setComp(compProxy, eRootWrapperRef.current, eRootWrapperRef.current);
        setInitialised(true);
    }, []);
    // initialise the extra components
    react_1.useEffect(function () {
        if (!tabGuardReady || !beans || !gridCtrlRef.current || !eGridBodyParent || !eRootWrapperRef.current) {
            return;
        }
        var gridCtrl = gridCtrlRef.current;
        var beansToDestroy = [];
        var agStackComponentsRegistry = beans.agStackComponentsRegistry;
        var HeaderDropZonesClass = agStackComponentsRegistry.getComponentClass('AG-GRID-HEADER-DROP-ZONES');
        var SideBarClass = agStackComponentsRegistry.getComponentClass('AG-SIDE-BAR');
        var StatusBarClass = agStackComponentsRegistry.getComponentClass('AG-STATUS-BAR');
        var WatermarkClass = agStackComponentsRegistry.getComponentClass('AG-WATERMARK');
        var PaginationClass = agStackComponentsRegistry.getComponentClass('AG-PAGINATION');
        var additionalEls = [];
        var eRootWrapper = eRootWrapperRef.current;
        if (gridCtrl.showDropZones() && HeaderDropZonesClass) {
            var headerDropZonesComp = context.createBean(new HeaderDropZonesClass());
            var eGui = headerDropZonesComp.getGui();
            eRootWrapper.insertAdjacentElement('afterbegin', eGui);
            additionalEls.push(eGui);
            beansToDestroy.push(headerDropZonesComp);
        }
        if (gridCtrl.showSideBar() && SideBarClass) {
            var sideBarComp = context.createBean(new SideBarClass());
            var eGui = sideBarComp.getGui();
            var bottomTabGuard = eGridBodyParent.querySelector('.ag-tab-guard-bottom');
            if (bottomTabGuard) {
                bottomTabGuard.insertAdjacentElement('beforebegin', eGui);
                additionalEls.push(eGui);
            }
            beansToDestroy.push(sideBarComp);
        }
        if (gridCtrl.showStatusBar() && StatusBarClass) {
            var statusBarComp = context.createBean(new StatusBarClass());
            var eGui = statusBarComp.getGui();
            eRootWrapper.insertAdjacentElement('beforeend', eGui);
            additionalEls.push(eGui);
            beansToDestroy.push(statusBarComp);
        }
        if (PaginationClass) {
            var paginationComp = context.createBean(new PaginationClass());
            var eGui = paginationComp.getGui();
            eRootWrapper.insertAdjacentElement('beforeend', eGui);
            additionalEls.push(eGui);
            beansToDestroy.push(paginationComp);
        }
        if (gridCtrl.showWatermark() && WatermarkClass) {
            var watermarkComp = context.createBean(new WatermarkClass());
            var eGui = watermarkComp.getGui();
            eRootWrapper.insertAdjacentElement('beforeend', eGui);
            additionalEls.push(eGui);
            beansToDestroy.push(watermarkComp);
        }
        return function () {
            context.destroyBeans(beansToDestroy);
            additionalEls.forEach(function (el) {
                if (el.parentElement) {
                    el.parentElement.removeChild(el);
                }
            });
        };
    }, [tabGuardReady, eGridBodyParent, beans]);
    var rootWrapperClasses = react_1.useMemo(function () { return utils_1.classesList('ag-root-wrapper', rtlClass, keyboardFocusClass, layoutClass); }, [rtlClass, keyboardFocusClass, layoutClass]);
    var rootWrapperBodyClasses = react_1.useMemo(function () { return utils_1.classesList('ag-root-wrapper-body', 'ag-focus-managed', layoutClass); }, [layoutClass]);
    var topStyle = react_1.useMemo(function () { return ({
        userSelect: userSelect != null ? userSelect : '',
        WebkitUserSelect: userSelect != null ? userSelect : '',
        cursor: cursor != null ? cursor : ''
    }); }, [userSelect, cursor]);
    var setTabGuardCompRef = react_1.useCallback(function (ref) {
        tabGuardRef.current = ref;
        setTabGuardReady(ref !== null);
    }, []);
    return (react_1.default.createElement("div", { ref: setRef, className: rootWrapperClasses, style: topStyle, role: "presentation" },
        react_1.default.createElement("div", { className: rootWrapperBodyClasses, ref: setGridBodyParent, role: "presentation" }, initialised && eGridBodyParent && beans &&
            react_1.default.createElement(beansContext_1.BeansContext.Provider, { value: beans },
                react_1.default.createElement(tabGuardComp_1.default, { ref: setTabGuardCompRef, eFocusableElement: eGridBodyParent, onTabKeyDown: onTabKeyDown, gridCtrl: gridCtrlRef.current }, // we wait for initialised before rending the children, so GridComp has created and registered with it's
                // GridCtrl before we create the child GridBodyComp. Otherwise the GridBodyComp would initialise first,
                // before we have set the the Layout CSS classes, causing the GridBodyComp to render rows to a grid that
                // doesn't have it's height specified, which would result if all the rows getting rendered (and if many rows,
                // hangs the UI)
                react_1.default.createElement(gridBodyComp_1.default, null))))));
};
exports.default = react_1.memo(GridComp);
