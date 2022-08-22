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
const core_1 = require("@ag-grid-community/core");
const react_1 = __importStar(require("react"));
const beansContext_1 = require("./beansContext");
const gridBodyComp_1 = __importDefault(require("./gridBodyComp"));
const reactComment_1 = __importDefault(require("./reactComment"));
const tabGuardComp_1 = __importDefault(require("./tabGuardComp"));
const useEffectOnce_1 = require("./useEffectOnce");
const utils_1 = require("./utils");
const GridComp = ({ context }) => {
    const [rtlClass, setRtlClass] = react_1.useState('');
    const [keyboardFocusClass, setKeyboardFocusClass] = react_1.useState('');
    const [layoutClass, setLayoutClass] = react_1.useState('');
    const [cursor, setCursor] = react_1.useState(null);
    const [userSelect, setUserSelect] = react_1.useState(null);
    const [initialised, setInitialised] = react_1.useState(false);
    const [tabGuardReady, setTabGuardReady] = react_1.useState();
    const gridCtrlRef = react_1.useRef(null);
    const eRootWrapperRef = react_1.useRef(null);
    const tabGuardRef = react_1.useRef();
    const eGridBodyParentRef = react_1.useRef(null);
    const focusInnerElementRef = react_1.useRef(() => undefined);
    const onTabKeyDown = react_1.useCallback(() => undefined, []);
    const beans = react_1.useMemo(() => context.getBean('beans'), []);
    reactComment_1.default(' AG Grid ', eRootWrapperRef);
    // create shared controller.
    useEffectOnce_1.useEffectOnce(() => {
        const currentController = gridCtrlRef.current = context.createBean(new core_1.GridCtrl());
        return () => {
            context.destroyBean(currentController);
            gridCtrlRef.current = null;
        };
    });
    // initialise the UI
    useEffectOnce_1.useEffectOnce(() => {
        const gridCtrl = gridCtrlRef.current;
        focusInnerElementRef.current = gridCtrl.focusInnerElement.bind(gridCtrl);
        const compProxy = {
            destroyGridUi: () => { },
            setRtlClass: setRtlClass,
            addOrRemoveKeyboardFocusClass: (addOrRemove) => setKeyboardFocusClass(addOrRemove ? core_1.FocusService.AG_KEYBOARD_FOCUS : ''),
            forceFocusOutOfContainer: () => {
                tabGuardRef.current.forceFocusOutOfContainer();
            },
            updateLayoutClasses: setLayoutClass,
            getFocusableContainers: () => {
                const els = [];
                const gridBodyCompEl = eRootWrapperRef.current.querySelector('.ag-root');
                const sideBarEl = eRootWrapperRef.current.querySelector('.ag-side-bar');
                if (gridBodyCompEl) {
                    els.push(gridBodyCompEl);
                }
                if (sideBarEl) {
                    els.push(sideBarEl);
                }
                return els;
            },
            setCursor,
            setUserSelect
        };
        gridCtrl.setComp(compProxy, eRootWrapperRef.current, eRootWrapperRef.current);
        setInitialised(true);
    });
    // initialise the extra components
    react_1.useEffect(() => {
        if (!tabGuardReady) {
            return;
        }
        const gridCtrl = gridCtrlRef.current;
        const beansToDestroy = [];
        const { agStackComponentsRegistry } = beans;
        const HeaderDropZonesClass = agStackComponentsRegistry.getComponentClass('AG-GRID-HEADER-DROP-ZONES');
        const SideBarClass = agStackComponentsRegistry.getComponentClass('AG-SIDE-BAR');
        const StatusBarClass = agStackComponentsRegistry.getComponentClass('AG-STATUS-BAR');
        const WatermarkClass = agStackComponentsRegistry.getComponentClass('AG-WATERMARK');
        const PaginationClass = agStackComponentsRegistry.getComponentClass('AG-PAGINATION');
        const additionalEls = [];
        const eRootWrapper = eRootWrapperRef.current;
        const eGridBodyParent = eGridBodyParentRef.current;
        if (gridCtrl.showDropZones() && HeaderDropZonesClass) {
            const headerDropZonesComp = context.createBean(new HeaderDropZonesClass());
            const eGui = headerDropZonesComp.getGui();
            eRootWrapper.insertAdjacentElement('afterbegin', eGui);
            additionalEls.push(eGui);
            beansToDestroy.push(headerDropZonesComp);
        }
        if (gridCtrl.showSideBar() && SideBarClass) {
            const sideBarComp = context.createBean(new SideBarClass());
            const eGui = sideBarComp.getGui();
            const bottomTabGuard = eGridBodyParent.querySelector('.ag-tab-guard-bottom');
            if (bottomTabGuard) {
                bottomTabGuard.insertAdjacentElement('beforebegin', eGui);
                additionalEls.push(eGui);
            }
            beansToDestroy.push(sideBarComp);
        }
        if (gridCtrl.showStatusBar() && StatusBarClass) {
            const statusBarComp = context.createBean(new StatusBarClass());
            const eGui = statusBarComp.getGui();
            eRootWrapper.insertAdjacentElement('beforeend', eGui);
            additionalEls.push(eGui);
            beansToDestroy.push(statusBarComp);
        }
        if (PaginationClass) {
            const paginationComp = context.createBean(new PaginationClass());
            const eGui = paginationComp.getGui();
            eRootWrapper.insertAdjacentElement('beforeend', eGui);
            additionalEls.push(eGui);
            beansToDestroy.push(paginationComp);
        }
        if (gridCtrl.showWatermark() && WatermarkClass) {
            const watermarkComp = context.createBean(new WatermarkClass());
            const eGui = watermarkComp.getGui();
            eRootWrapper.insertAdjacentElement('beforeend', eGui);
            additionalEls.push(eGui);
            beansToDestroy.push(watermarkComp);
        }
        return () => {
            context.destroyBeans(beansToDestroy);
            additionalEls.forEach(el => {
                if (el.parentElement) {
                    el.parentElement.removeChild(el);
                }
            });
        };
    }, [tabGuardReady]);
    const rootWrapperClasses = react_1.useMemo(() => utils_1.classesList('ag-root-wrapper', rtlClass, keyboardFocusClass, layoutClass), [rtlClass, keyboardFocusClass, layoutClass]);
    const rootWrapperBodyClasses = react_1.useMemo(() => utils_1.classesList('ag-root-wrapper-body', 'ag-focus-managed', layoutClass), [layoutClass]);
    const topStyle = react_1.useMemo(() => ({
        userSelect: userSelect != null ? userSelect : '',
        WebkitUserSelect: userSelect != null ? userSelect : '',
        cursor: cursor != null ? cursor : ''
    }), [userSelect, cursor]);
    const eGridBodyParent = eGridBodyParentRef.current;
    const setTabGuardCompRef = react_1.useCallback((ref) => {
        tabGuardRef.current = ref;
        setTabGuardReady(true);
    }, []);
    return (react_1.default.createElement("div", { ref: eRootWrapperRef, className: rootWrapperClasses, style: topStyle, role: "presentation" },
        react_1.default.createElement("div", { className: rootWrapperBodyClasses, ref: eGridBodyParentRef, role: "presentation" }, initialised && eGridBodyParent &&
            react_1.default.createElement(beansContext_1.BeansContext.Provider, { value: beans },
                react_1.default.createElement(tabGuardComp_1.default, { ref: setTabGuardCompRef, eFocusableElement: eGridBodyParent, onTabKeyDown: onTabKeyDown, gridCtrl: gridCtrlRef.current }, // we wait for initialised before rending the children, so GridComp has created and registered with it's
                // GridCtrl before we create the child GridBodyComp. Otherwise the GridBodyComp would initialise first,
                // before we have set the the Layout CSS classes, causing the GridBodyComp to render rows to a grid that
                // doesn't have it's height specified, which would result if all the rows getting rendered (and if many rows,
                // hangs the UI)
                react_1.default.createElement(gridBodyComp_1.default, null))))));
};
exports.default = react_1.memo(GridComp);

//# sourceMappingURL=gridComp.js.map
