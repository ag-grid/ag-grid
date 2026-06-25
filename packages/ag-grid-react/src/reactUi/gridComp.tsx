import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type {
    Component,
    ComponentSelector,
    Context,
    FocusableContainer,
    IGridComp,
    TabGuardComp as JsTabGuardComp,
} from 'ag-grid-community';
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

type FocusableContainerComp = Component & FocusableContainer;
type HeaderDropZonesComp = Component & { getFocusableContainers?: () => FocusableContainerComp[] };

const GridComp = ({ context }: GridCompProps) => {
    const [layoutClass, setLayoutClass] = useState<string>('');
    const [cursor, setCursor] = useState<string | null>(null);
    const [userSelect, setUserSelect] = useState<string | null>(null);
    const [initialised, setInitialised] = useState<boolean>(false);
    const [tabGuardReady, setTabGuardReady] = useState<any>();

    const gridCtrlRef = useRef<GridCtrl>();
    const eRootWrapperRef = useRef<HTMLDivElement | null>(null);
    const tabGuardRef = useRef<TabGuardCompCallback>();
    // eGridBodyParent is state as we use it in render
    const [eGridBodyParent, setGridBodyParent] = useState<HTMLDivElement | null>(null);

    const focusInnerElementRef = useRef<(fromBottom?: boolean) => void>(() => undefined);
    const paginationCompRef = useRef<JsTabGuardComp | undefined>();
    const focusableContainersRef = useRef<FocusableContainerComp[]>([]);

    const onTabKeyDown = useCallback(() => undefined, []);

    useReactCommentEffect(' AG Grid ', eRootWrapperRef);

    const setRef = useCallback((eRef: HTMLDivElement) => {
        eRootWrapperRef.current = eRef;
        gridCtrlRef.current = eRef ? context.createBean(new GridCtrl()) : context.destroyBean(gridCtrlRef.current);

        if (!eRef || context.isDestroyed()) {
            return;
        }

        const gridCtrl = gridCtrlRef.current!;

        focusInnerElementRef.current = gridCtrl.focusInnerElement.bind(gridCtrl);

        const compProxy: IGridComp = {
            destroyGridUi: () => {}, // do nothing, as framework users destroy grid by removing the comp
            forceFocusOutOfContainer: (up?: boolean) => {
                if (!up && paginationCompRef.current?.isDisplayed()) {
                    paginationCompRef.current.forceFocusOutOfContainer(up);
                    return;
                }
                tabGuardRef.current?.forceFocusOutOfContainer(up);
            },
            updateLayoutClasses: setLayoutClass,
            getFocusableContainers: () => {
                const beforeGridBody: FocusableContainer[] = [];
                const afterGridBody: FocusableContainer[] = [];
                const gridBodyCompEl = eRootWrapperRef.current?.querySelector('.ag-root');
                for (const comp of focusableContainersRef.current) {
                    if (!comp.isDisplayed()) {
                        continue;
                    }

                    const name = comp.getFocusableContainerName();
                    if (name === 'toolbar' || name === 'rowGroupToolbar' || name === 'pivotToolbar') {
                        beforeGridBody.push(comp);
                        continue;
                    }

                    afterGridBody.push(comp);
                }

                const comps: FocusableContainer[] = [...beforeGridBody];
                if (gridBodyCompEl) {
                    comps.push({
                        getGui: () => gridBodyCompEl as HTMLElement,
                        getFocusableContainerName: () => 'gridBody',
                    });
                }
                comps.push(...afterGridBody);
                return comps;
            },
            setCursor,
            setUserSelect,
        };

        gridCtrl.setComp(compProxy, eRef);

        setInitialised(true);
    }, []);

    // initialise the extra components
    useEffect(() => {
        const gridCtrl = gridCtrlRef.current;
        const eRootWrapper = eRootWrapperRef.current;
        if (!tabGuardReady || !gridCtrl || !eGridBodyParent || !eRootWrapper || context.isDestroyed()) {
            return;
        }

        const beansToDestroy: any[] = [];
        focusableContainersRef.current = [];
        paginationCompRef.current = undefined;

        // these components are optional, so we check if they are registered before creating them
        const {
            watermarkSelector,
            paginationSelector,
            sideBarSelector,
            statusBarSelector,
            toolbarSelector,
            gridHeaderDropZonesSelector,
        } = gridCtrl.getOptionalSelectors();
        const additionalEls: HTMLElement[] = [];

        const addComponentToDom = <T extends Component>(
            component: ComponentSelector<T>['component'],
            position: 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend' = 'beforeend'
        ): T => {
            const comp = context.createBean(new component()) as T;
            const eGui = comp.getGui();
            eRootWrapper.insertAdjacentElement(position, eGui);
            additionalEls.push(eGui);
            beansToDestroy.push(comp);
            return comp;
        };

        if (toolbarSelector) {
            const toolbarComp = addComponentToDom(toolbarSelector.component, 'afterbegin');
            focusableContainersRef.current.push(toolbarComp);
        }

        if (gridHeaderDropZonesSelector) {
            const headerDropZonesComp = context.createBean(
                new gridHeaderDropZonesSelector.component()
            ) as HeaderDropZonesComp;
            const eGui = headerDropZonesComp.getGui();
            // Insert after toolbar (if present) or at the start
            const toolbar = eRootWrapper.querySelector('.ag-toolbar');
            if (toolbar) {
                toolbar.after(eGui);
            } else {
                eRootWrapper.prepend(eGui);
            }
            additionalEls.push(eGui);
            beansToDestroy.push(headerDropZonesComp);
            focusableContainersRef.current.push(...(headerDropZonesComp.getFocusableContainers?.() ?? []));
        }

        if (sideBarSelector) {
            const sideBarComp = context.createBean(new sideBarSelector.component());
            const eGui = sideBarComp.getGui();
            const bottomTabGuard = eGridBodyParent.querySelector('.ag-tab-guard-bottom');
            if (bottomTabGuard) {
                bottomTabGuard.insertAdjacentElement('beforebegin', eGui);
                additionalEls.push(eGui);
            }

            beansToDestroy.push(sideBarComp);
            focusableContainersRef.current.push(sideBarComp as FocusableContainerComp);
        }

        if (statusBarSelector) {
            const statusBarComp = addComponentToDom(statusBarSelector.component);
            focusableContainersRef.current.push(statusBarComp as FocusableContainerComp);
        }

        if (paginationSelector) {
            const paginationComp = addComponentToDom(paginationSelector.component);
            paginationCompRef.current = paginationComp as JsTabGuardComp;
            focusableContainersRef.current.push(paginationComp as FocusableContainerComp);
        }

        if (watermarkSelector) {
            addComponentToDom(watermarkSelector.component);
        }

        return () => {
            context.destroyBeans(beansToDestroy);
            focusableContainersRef.current = [];
            paginationCompRef.current = undefined;
            for (const el of additionalEls) {
                el.remove();
            }
        };
    }, [tabGuardReady, eGridBodyParent, context]);

    const rootWrapperClasses = useMemo(() => classesList('ag-root-wrapper', layoutClass), [layoutClass]);
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

    const isFocusable = useCallback(() => !gridCtrlRef.current?.isFocusable(), []);

    return (
        <div ref={setRef} className={rootWrapperClasses} style={topStyle} role="presentation">
            <div className={rootWrapperBodyClasses} ref={setGridBodyParent} role="presentation">
                {initialised && eGridBodyParent && !context.isDestroyed() && (
                    <BeansContext.Provider value={context.getBeans()}>
                        <TabGuardComp
                            ref={setTabGuardCompRef}
                            eFocusableElement={eGridBodyParent}
                            onTabKeyDown={onTabKeyDown}
                            gridCtrl={gridCtrlRef.current!}
                            forceFocusOutWhenTabGuardsAreEmpty={true}
                            isEmpty={isFocusable}
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
