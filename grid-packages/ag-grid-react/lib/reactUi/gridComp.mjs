// ag-grid-react v30.0.4
import { FocusService, GridCtrl } from 'ag-grid-community';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState, useLayoutEffect } from 'react';
import { BeansContext } from './beansContext.mjs';
import GridBodyComp from './gridBodyComp.mjs';
import useReactCommentEffect from './reactComment.mjs';
import TabGuardComp from './tabGuardComp.mjs';
import { classesList } from './utils.mjs';
const GridComp = ({ context }) => {
    const [rtlClass, setRtlClass] = useState('');
    const [keyboardFocusClass, setKeyboardFocusClass] = useState('');
    const [layoutClass, setLayoutClass] = useState('');
    const [cursor, setCursor] = useState(null);
    const [userSelect, setUserSelect] = useState(null);
    const [initialised, setInitialised] = useState(false);
    const [tabGuardReady, setTabGuardReady] = useState();
    const gridCtrlRef = useRef(null);
    const eRootWrapperRef = useRef(null);
    const tabGuardRef = useRef();
    const eGridBodyParentRef = useRef(null);
    const focusInnerElementRef = useRef(() => undefined);
    const onTabKeyDown = useCallback(() => undefined, []);
    const beans = useMemo(() => {
        if (context.isDestroyed()) {
            return null;
        }
        return context.getBean('beans');
    }, [context]);
    useReactCommentEffect(' AG Grid ', eRootWrapperRef);
    // create shared controller.
    useLayoutEffect(() => {
        if (context.isDestroyed()) {
            return;
        }
        const currentController = gridCtrlRef.current = context.createBean(new GridCtrl());
        const gridCtrl = gridCtrlRef.current;
        focusInnerElementRef.current = gridCtrl.focusInnerElement.bind(gridCtrl);
        const compProxy = {
            destroyGridUi: () => { },
            setRtlClass: setRtlClass,
            addOrRemoveKeyboardFocusClass: (addOrRemove) => setKeyboardFocusClass(addOrRemove ? FocusService.AG_KEYBOARD_FOCUS : ''),
            forceFocusOutOfContainer: () => {
                var _a;
                (_a = tabGuardRef.current) === null || _a === void 0 ? void 0 : _a.forceFocusOutOfContainer();
            },
            updateLayoutClasses: setLayoutClass,
            getFocusableContainers: () => {
                var _a, _b;
                const els = [];
                const gridBodyCompEl = (_a = eRootWrapperRef.current) === null || _a === void 0 ? void 0 : _a.querySelector('.ag-root');
                const sideBarEl = (_b = eRootWrapperRef.current) === null || _b === void 0 ? void 0 : _b.querySelector('.ag-side-bar:not(.ag-hidden)');
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
        return () => {
            context.destroyBean(currentController);
            gridCtrlRef.current = null;
        };
    }, [context]);
    // initialise the extra components
    useEffect(() => {
        if (!tabGuardReady || !beans || !gridCtrlRef.current) {
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
    const rootWrapperClasses = useMemo(() => classesList('ag-root-wrapper', rtlClass, keyboardFocusClass, layoutClass), [rtlClass, keyboardFocusClass, layoutClass]);
    const rootWrapperBodyClasses = useMemo(() => classesList('ag-root-wrapper-body', 'ag-focus-managed', layoutClass), [layoutClass]);
    const topStyle = useMemo(() => ({
        userSelect: userSelect != null ? userSelect : '',
        WebkitUserSelect: userSelect != null ? userSelect : '',
        cursor: cursor != null ? cursor : ''
    }), [userSelect, cursor]);
    const eGridBodyParent = eGridBodyParentRef.current;
    const setTabGuardCompRef = useCallback((ref) => {
        tabGuardRef.current = ref;
        setTabGuardReady(ref !== null);
    }, []);
    return (React.createElement("div", { ref: eRootWrapperRef, className: rootWrapperClasses, style: topStyle, role: "presentation" },
        React.createElement("div", { className: rootWrapperBodyClasses, ref: eGridBodyParentRef, role: "presentation" }, initialised && eGridBodyParent && beans &&
            React.createElement(BeansContext.Provider, { value: beans },
                React.createElement(TabGuardComp, { ref: setTabGuardCompRef, eFocusableElement: eGridBodyParent, onTabKeyDown: onTabKeyDown, gridCtrl: gridCtrlRef.current }, // we wait for initialised before rending the children, so GridComp has created and registered with it's
                // GridCtrl before we create the child GridBodyComp. Otherwise the GridBodyComp would initialise first,
                // before we have set the the Layout CSS classes, causing the GridBodyComp to render rows to a grid that
                // doesn't have it's height specified, which would result if all the rows getting rendered (and if many rows,
                // hangs the UI)
                React.createElement(GridBodyComp, null))))));
};
export default memo(GridComp);
