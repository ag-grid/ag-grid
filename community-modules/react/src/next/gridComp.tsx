import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
    Context,
    FocusService,
    GridCtrl,
    IGridComp,
    AgStackComponentsRegistry,
} from '@ag-grid-community/core';
import { classesList } from './utils';
import TabGuardComp, { TabGuardCompCallback } from './tabGuardComp';
import GridBodyComp  from './gridBodyComp';

const GridComp = (props: { context: Context }) => {

    const [rtlClass, setRtlClass] = useState<string>('');
    const [keyboardFocusClass, setKeyboardFocusClass] = useState<string>('');
    const [layoutClass, setLayoutClass] = useState<string>('');
    const [cursor, setCursor] = useState<string | null>(null);
    const [userSelect, setUserSelect] = useState<string | null>(null);
    const [initialised, setInitialised] = useState<boolean>(false);
    
    const gridCtrlRef = useRef<GridCtrl | null>(null);
    const tabGuardComp = useRef<TabGuardCompCallback>(null);
    const eRootWrapperRef = useRef<HTMLDivElement>(null);
    const eGridBodyParentRef = useRef<HTMLDivElement>(null);
    const focusInnerElementRef = useRef<((fromBottom?: boolean) => void)>(() => undefined);

    const onTabKeyDown = useCallback(() => undefined, []);

    // create shared controller.
    useEffect(() => {
        if (gridCtrlRef.current) { return; }
        
        const currentController = gridCtrlRef.current = props.context.createBean(new GridCtrl());

        return () => {
            props.context.destroyBean(currentController);
            gridCtrlRef.current = null;
        }
    }, [props.context]);

    // initialise the UI
    useEffect(() => {
        const currentController = gridCtrlRef.current;

        if (!props.context || !currentController) { return; }

        focusInnerElementRef.current = currentController.focusInnerElement.bind(currentController);

        const compProxy: IGridComp = {
            destroyGridUi:
                () => {}, // do nothing, as framework users destroy grid by removing the comp
            setRtlClass: setRtlClass,
            addOrRemoveKeyboardFocusClass:
                (addOrRemove: boolean) => setKeyboardFocusClass(addOrRemove ? FocusService.AG_KEYBOARD_FOCUS : ''),
            forceFocusOutOfContainer: () => {
                tabGuardComp.current!.forceFocusOutOfContainer();
            },
            updateLayoutClasses: setLayoutClass,
            getFocusableContainers: () => {
                const els: HTMLElement[] = [];

                const gridBodyCompEl = eRootWrapperRef.current!.querySelector('.ag-root');
                const sideBarEl = eRootWrapperRef.current!.querySelector('.ag-side-bar')

                if (gridBodyCompEl) {
                    els.push(gridBodyCompEl as HTMLElement);
                }

                if (sideBarEl) {
                    els.push(sideBarEl as HTMLElement);
                }

                return els;
            },
            setCursor,
            setUserSelect
        };

        currentController.setComp(compProxy, eRootWrapperRef.current!, eRootWrapperRef.current!);

        setInitialised(true);
    }, [props.context]);

    // initialise the extra components
    useEffect(() => {
        const ctrl = gridCtrlRef.current;
        const beansToDestroy: any[] = [];

        if (!props.context || !ctrl || !eRootWrapperRef.current || !eGridBodyParentRef.current) { return; }

        const context = props.context;
        const agStackComponentsRegistry: AgStackComponentsRegistry = context.getBean('agStackComponentsRegistry');
        const HeaderDropZonesClass = agStackComponentsRegistry.getComponentClass('AG-GRID-HEADER-DROP-ZONES');
        const SideBarClass = agStackComponentsRegistry.getComponentClass('AG-SIDE-BAR');
        const StatusBarClass = agStackComponentsRegistry.getComponentClass('AG-STATUS-BAR');
        const WatermarkClass = agStackComponentsRegistry.getComponentClass('AG-WATERMARK');
        const PaginationClass = agStackComponentsRegistry.getComponentClass('AG-PAGINATION');
        const additionalEls: HTMLDivElement[] = [];

        if (ctrl.showDropZones() && HeaderDropZonesClass) {
            const headerDropZonesComp = context.createBean(new HeaderDropZonesClass());
            const eGui = headerDropZonesComp.getGui();
            eRootWrapperRef.current.insertAdjacentElement('afterbegin', eGui);
            additionalEls.push(eGui);
            beansToDestroy.push(headerDropZonesComp);
        }

        if (ctrl.showSideBar() && SideBarClass) {
            const sideBarComp = context.createBean(new SideBarClass());
            const eGui = sideBarComp.getGui();
            const bottomTabGuard = eGridBodyParentRef.current.querySelector('.ag-tab-guard-bottom');
            if (bottomTabGuard) {
                bottomTabGuard.insertAdjacentElement('beforebegin', eGui);
                additionalEls.push(eGui);
            }

            beansToDestroy.push(sideBarComp);
        }

        if (ctrl.showStatusBar() && StatusBarClass) {
            const statusBarComp = context.createBean(new StatusBarClass());
            const eGui = statusBarComp.getGui();
            eRootWrapperRef.current.insertAdjacentElement('beforeend', eGui);
            additionalEls.push(eGui);
            beansToDestroy.push(statusBarComp);
        }

        if (PaginationClass) {
            const paginationComp = context.createBean(new PaginationClass());
            const eGui = paginationComp.getGui();
            eRootWrapperRef.current.insertAdjacentElement('beforeend', eGui);
            additionalEls.push(eGui);
            beansToDestroy.push(paginationComp);
        }

        if (ctrl.showWatermark() && WatermarkClass) {
            const watermarkComp = context.createBean(new WatermarkClass());
            const eGui = watermarkComp.getGui();
            eRootWrapperRef.current.insertAdjacentElement('beforeend', eGui);
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
        }
    }, [props])

    const rootWrapperClasses = classesList('ag-root-wrapper', rtlClass, keyboardFocusClass, layoutClass);
    const rootWrapperBodyClasses = classesList('ag-root-wrapper-body', 'ag-focus-managed', layoutClass);

    const topStyle = useMemo(() => ({
        "user-select": userSelect != null ? userSelect : '',
        '-webkit-user-select': userSelect != null ? userSelect : '',
        cursor: cursor != null ? cursor : ''
    }), [userSelect, cursor]);

    const eGridBodyParent = eGridBodyParentRef.current;

    return (
        <div ref={ eRootWrapperRef } className={ rootWrapperClasses } style={ topStyle }>
            <div className={ rootWrapperBodyClasses } ref={ eGridBodyParentRef }>
                { initialised && eGridBodyParent &&
                    <TabGuardComp
                        ref={ tabGuardComp }
                        context={ props.context }
                        eFocusableElement= { eGridBodyParent }
                        onTabKeyDown={ onTabKeyDown }
                        gridCtrl={ gridCtrlRef.current! }>
                    { // we wait for initialised before rending the children, so GridComp has created and registered with it's
                    // GridCtrl before we create the child GridBodyComp. Otherwise the GridBodyComp would initialise first,
                    // before we have set the the Layout CSS classes, causing the GridBodyComp to render rows to a grid that
                    // doesn't have it's height specified, which would result if all the rows getting rendered (and if many rows,
                    // hangs the UI)
                        <GridBodyComp context={ props.context }/>
                    }
                    </TabGuardComp>
                }
            </div>
        </div>
    );
};

export default GridComp;
