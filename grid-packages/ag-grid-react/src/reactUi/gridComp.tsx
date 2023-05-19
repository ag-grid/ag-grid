import {
    Beans, Context,
    FocusService,
    GridCtrl,
    IGridComp
} from 'ag-grid-community';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BeansContext } from './beansContext';
import GridBodyComp from './gridBodyComp';
import useReactCommentEffect from './reactComment';
import TabGuardComp, { TabGuardCompCallback } from './tabGuardComp';
import { useLayoutEffectOnce } from './useEffectOnce';
import { classesList } from './utils';

interface GridCompProps {
    context: Context;
}

const GridComp = ({ context }: GridCompProps) => {

    const [rtlClass, setRtlClass] = useState<string>('');
    const [keyboardFocusClass, setKeyboardFocusClass] = useState<string>('');
    const [layoutClass, setLayoutClass] = useState<string>('');
    const [cursor, setCursor] = useState<string | null>(null);
    const [userSelect, setUserSelect] = useState<string | null>(null);
    const [initialised, setInitialised] = useState<boolean>(false);
    const [tabGuardReady, setTabGuardReady] = useState<any>();

    const gridCtrlRef = useRef<GridCtrl | null>(null);
    const eRootWrapperRef = useRef<HTMLDivElement>(null);
    const tabGuardRef = useRef<TabGuardCompCallback>();
    const eGridBodyParentRef = useRef<HTMLDivElement>(null);
    const focusInnerElementRef = useRef<((fromBottom?: boolean) => void)>(() => undefined);

    const onTabKeyDown = useCallback(() => undefined, []);

    const beans = useMemo( ()=> context.getBean('beans') as Beans, []);

    useReactCommentEffect(' AG Grid ', eRootWrapperRef);

    // create shared controller.
    useLayoutEffectOnce(() => {
        const currentController = gridCtrlRef.current = context.createBean(new GridCtrl());

        return () => {
            context.destroyBean(currentController);
            gridCtrlRef.current = null;
        }
    });

    // initialise the UI
    useLayoutEffectOnce(() => {
        const gridCtrl = gridCtrlRef.current!;

        focusInnerElementRef.current = gridCtrl.focusInnerElement.bind(gridCtrl);

        const compProxy: IGridComp = {
            destroyGridUi:
                () => {}, // do nothing, as framework users destroy grid by removing the comp
            setRtlClass: setRtlClass,
            addOrRemoveKeyboardFocusClass:
                (addOrRemove: boolean) => setKeyboardFocusClass(addOrRemove ? FocusService.AG_KEYBOARD_FOCUS : ''),
            forceFocusOutOfContainer: () => {
                tabGuardRef.current!.forceFocusOutOfContainer();
            },
            updateLayoutClasses: setLayoutClass,
            getFocusableContainers: () => {
                const els: HTMLElement[] = [];

                const gridBodyCompEl = eRootWrapperRef.current!.querySelector('.ag-root');
                const sideBarEl = eRootWrapperRef.current!.querySelector('.ag-side-bar:not(.ag-hidden)');

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

        gridCtrl.setComp(compProxy, eRootWrapperRef.current!, eRootWrapperRef.current!);

        setInitialised(true);
    });

    // initialise the extra components
    useEffect(() => {
        if (!tabGuardReady) { return; }

        const gridCtrl = gridCtrlRef.current!;
        const beansToDestroy: any[] = [];

        const {agStackComponentsRegistry} = beans;

        const HeaderDropZonesClass = agStackComponentsRegistry.getComponentClass('AG-GRID-HEADER-DROP-ZONES');
        const SideBarClass = agStackComponentsRegistry.getComponentClass('AG-SIDE-BAR');
        const StatusBarClass = agStackComponentsRegistry.getComponentClass('AG-STATUS-BAR');
        const WatermarkClass = agStackComponentsRegistry.getComponentClass('AG-WATERMARK');
        const PaginationClass = agStackComponentsRegistry.getComponentClass('AG-PAGINATION');
        const additionalEls: HTMLDivElement[] = [];
        const eRootWrapper = eRootWrapperRef.current!;
        const eGridBodyParent = eGridBodyParentRef.current!;

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
        }
    }, [tabGuardReady])

    const rootWrapperClasses = useMemo(()=> classesList('ag-root-wrapper', rtlClass, keyboardFocusClass, layoutClass), [rtlClass, keyboardFocusClass, layoutClass]);
    const rootWrapperBodyClasses = useMemo(() => classesList('ag-root-wrapper-body', 'ag-focus-managed', layoutClass), [layoutClass]);

    const topStyle: React.CSSProperties = useMemo(() => ({
        userSelect: userSelect != null ? (userSelect as any) : '',
        WebkitUserSelect: userSelect != null ? (userSelect as any) : '',
        cursor: cursor != null ? cursor : ''
    }), [userSelect, cursor]);

    const eGridBodyParent = eGridBodyParentRef.current;

    const setTabGuardCompRef = useCallback((ref: TabGuardCompCallback) => {
        tabGuardRef.current = ref;
        setTabGuardReady(true);
    }, []);
    
    return (
        <div ref={ eRootWrapperRef } className={ rootWrapperClasses } style={ topStyle } role="presentation">
            <div className={ rootWrapperBodyClasses } ref={ eGridBodyParentRef } role="presentation">
                { initialised && eGridBodyParent &&
                    <BeansContext.Provider value={beans}>
                        <TabGuardComp
                            ref={ setTabGuardCompRef }
                            eFocusableElement= { eGridBodyParent }
                            onTabKeyDown={ onTabKeyDown }
                            gridCtrl={ gridCtrlRef.current! }>
                        { // we wait for initialised before rending the children, so GridComp has created and registered with it's
                        // GridCtrl before we create the child GridBodyComp. Otherwise the GridBodyComp would initialise first,
                        // before we have set the the Layout CSS classes, causing the GridBodyComp to render rows to a grid that
                        // doesn't have it's height specified, which would result if all the rows getting rendered (and if many rows,
                        // hangs the UI)
                            <GridBodyComp/>
                        }
                        </TabGuardComp>
                    </BeansContext.Provider>
                }
            </div>
        </div>
    );
};

export default memo(GridComp);
