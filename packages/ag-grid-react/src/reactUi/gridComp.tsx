import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { Component, Context, IGridComp } from 'ag-grid-community';
import { GridCtrl } from 'ag-grid-community';

import { BeansContext } from './beansContext';
import GridBodyComp from './gridBodyComp';
import useReactCommentEffect from './reactComment';
import type { TabGuardCompCallback } from './tabGuardComp';
import TabGuardComp from './tabGuardComp';
import { classesList } from './utils';

interface GridCompProps {
    context: Context;
}

const GridComp = ({ context }: GridCompProps) => {
    const [rtlClass, setRtlClass] = useState<string>('');
    const [layoutClass, setLayoutClass] = useState<string>('');
    const [cursor, setCursor] = useState<string | null>(null);
    const [userSelect, setUserSelect] = useState<string | null>(null);
    const [initialised, setInitialised] = useState<boolean>(false);
    const [tabGuardReady, setTabGuardReady] = useState<any>();

    const gridCtrlRef = useRef<GridCtrl | null>(null);
    const eRootWrapperRef = useRef<HTMLDivElement | null>(null);
    const tabGuardRef = useRef<TabGuardCompCallback>();
    // eGridBodyParent is state as we use it in render
    const [eGridBodyParent, setGridBodyParent] = useState<HTMLDivElement | null>(null);

    const focusInnerElementRef = useRef<(fromBottom?: boolean) => void>(() => undefined);

    const onTabKeyDown = useCallback(() => undefined, []);

    const beans = useMemo(() => {
        if (context.isDestroyed()) {
            return null;
        }
        return context.getBeans();
    }, [context]);

    useReactCommentEffect(' AG Grid ', eRootWrapperRef);

    const setRef = useCallback((e: HTMLDivElement) => {
        eRootWrapperRef.current = e;

        if (!eRootWrapperRef.current) {
            context.destroyBean(gridCtrlRef.current);
            gridCtrlRef.current = null;
            return;
        }

        if (context.isDestroyed()) {
            return;
        }

        gridCtrlRef.current = context.createBean(new GridCtrl());
        const gridCtrl = gridCtrlRef.current;

        focusInnerElementRef.current = gridCtrl.focusInnerElement.bind(gridCtrl);

        const compProxy: IGridComp = {
            destroyGridUi: () => {}, // do nothing, as framework users destroy grid by removing the comp
            setRtlClass: setRtlClass,
            forceFocusOutOfContainer: (up?: boolean) => {
                tabGuardRef.current?.forceFocusOutOfContainer(up);
            },
            updateLayoutClasses: setLayoutClass,
            getFocusableContainers: () => {
                const els: HTMLElement[] = [];

                const gridBodyCompEl = eRootWrapperRef.current?.querySelector('.ag-root');
                const sideBarEl = eRootWrapperRef.current?.querySelector('.ag-side-bar:not(.ag-hidden)');

                if (gridBodyCompEl) {
                    els.push(gridBodyCompEl as HTMLElement);
                }

                if (sideBarEl) {
                    els.push(sideBarEl as HTMLElement);
                }

                return els;
            },
            setCursor,
            setUserSelect,
        };

        gridCtrl.setComp(compProxy, eRootWrapperRef.current, eRootWrapperRef.current);

        setInitialised(true);
    }, []);

    // initialise the extra components
    useEffect(() => {
        if (!tabGuardReady || !beans || !gridCtrlRef.current || !eGridBodyParent || !eRootWrapperRef.current) {
            return;
        }

        const gridCtrl = gridCtrlRef.current;
        const beansToDestroy: any[] = [];

        // these components are optional, so we check if they are registered before creating them
        const {
            watermarkSelector,
            paginationSelector,
            sideBarSelector,
            statusBarSelector,
            gridHeaderDropZonesSelector,
        } = gridCtrl.getOptionalSelectors();
        const additionalEls: HTMLElement[] = [];
        const eRootWrapper = eRootWrapperRef.current;

        if (gridHeaderDropZonesSelector) {
            const headerDropZonesComp = context.createBean(new gridHeaderDropZonesSelector.Component());
            const eGui = headerDropZonesComp.getGui();
            eRootWrapper.insertAdjacentElement('afterbegin', eGui);
            additionalEls.push(eGui);
            beansToDestroy.push(headerDropZonesComp);
        }

        if (sideBarSelector) {
            const sideBarComp = context.createBean(new sideBarSelector.Component());
            const eGui = sideBarComp.getGui();
            const bottomTabGuard = eGridBodyParent.querySelector('.ag-tab-guard-bottom');
            if (bottomTabGuard) {
                bottomTabGuard.insertAdjacentElement('beforebegin', eGui);
                additionalEls.push(eGui);
            }

            beansToDestroy.push(sideBarComp);
        }

        const addComponentToDom = (component: { new (params?: any): Component<any> }) => {
            const comp = context.createBean(new component());
            const eGui = comp.getGui();
            eRootWrapper.insertAdjacentElement('beforeend', eGui);
            additionalEls.push(eGui);
            beansToDestroy.push(comp);
        };

        if (statusBarSelector) {
            addComponentToDom(statusBarSelector.Component);
        }

        if (paginationSelector) {
            addComponentToDom(paginationSelector.Component);
        }

        if (watermarkSelector) {
            addComponentToDom(watermarkSelector.Component);
        }

        return () => {
            context.destroyBeans(beansToDestroy);
            additionalEls.forEach((el) => {
                if (el.parentElement) {
                    el.parentElement.removeChild(el);
                }
            });
        };
    }, [tabGuardReady, eGridBodyParent, beans]);

    const rootWrapperClasses = useMemo(
        () => classesList('ag-root-wrapper', rtlClass, layoutClass),
        [rtlClass, layoutClass]
    );
    const rootWrapperBodyClasses = useMemo(
        () => classesList('ag-root-wrapper-body', 'ag-focus-managed', layoutClass),
        [layoutClass]
    );

    const topStyle: React.CSSProperties = useMemo(
        () => ({
            userSelect: userSelect != null ? (userSelect as any) : '',
            WebkitUserSelect: userSelect != null ? (userSelect as any) : '',
            cursor: cursor != null ? cursor : '',
        }),
        [userSelect, cursor]
    );

    const setTabGuardCompRef = useCallback((ref: TabGuardCompCallback) => {
        tabGuardRef.current = ref;
        setTabGuardReady(ref !== null);
    }, []);

    return (
        <div ref={setRef} className={rootWrapperClasses} style={topStyle} role="presentation">
            <div className={rootWrapperBodyClasses} ref={setGridBodyParent} role="presentation">
                {initialised && eGridBodyParent && beans && (
                    <BeansContext.Provider value={beans}>
                        <TabGuardComp
                            ref={setTabGuardCompRef}
                            eFocusableElement={eGridBodyParent}
                            onTabKeyDown={onTabKeyDown}
                            gridCtrl={gridCtrlRef.current!}
                            forceFocusOutWhenTabGuardsAreEmpty={true}
                        >
                            {
                                // we wait for initialised before rending the children, so GridComp has created and registered with it's
                                // GridCtrl before we create the child GridBodyComp. Otherwise the GridBodyComp would initialise first,
                                // before we have set the the Layout CSS classes, causing the GridBodyComp to render rows to a grid that
                                // doesn't have it's height specified, which would result if all the rows getting rendered (and if many rows,
                                // hangs the UI)
                                <GridBodyComp />
                            }
                        </TabGuardComp>
                    </BeansContext.Provider>
                )}
            </div>
        </div>
    );
};

export default memo(GridComp);
