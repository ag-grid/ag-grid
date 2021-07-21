import React, { useEffect, useRef, useState } from 'react';
import {
    Context,
    FocusService,
    GridCtrl,
    IGridComp,
    AgStackComponentsRegistry
} from 'ag-grid-community';
import { GridBodyComp } from './gridBodyComp';
import { classesList } from './utils';
import { ManagedFocusContainer } from './managedFocusContainer';

export const GridComp = (props: { context: Context }) => {

    const [rtlClass, setRtlClass] = useState<string>('');
    const [keyboardFocusClass, setKeyboardFocusClass] = useState<string>('');
    const [layoutClass, setLayoutClass] = useState<string>('');
    const [cursor, setCursor] = useState<string | null>(null);
    const [userSelect, setUserSelect] = useState<string | null>(null);
    const [initialised, setInitialised] = useState<boolean>(false);
    
    const ctrlRef = useRef<GridCtrl | null>(null);
    const eRootWrapper = useRef<HTMLDivElement>(null);
    const eGridBodyParent = useRef<HTMLDivElement>(null);
    const focusInnerElement = useRef<((fromBottom?: boolean) => void)>(() => undefined);

    // create shared controller.
    useEffect(() => {
        if (ctrlRef.current) { return; }
        
        ctrlRef.current = props.context.createBean(new GridCtrl());

        return () => {
            props.context.destroyBean([ctrlRef.current]);
            ctrlRef.current = null;
        }
    }, [props.context]);

    // initialise the UI
    useEffect(() => {
        const currentController = ctrlRef.current;

        if (!props.context || !currentController) { return; }

        focusInnerElement.current = currentController.focusInnerElement.bind(currentController);

        const compProxy: IGridComp = {
            destroyGridUi:
                () => {}, // do nothing, as framework users destroy grid by removing the comp
            setRtlClass: setRtlClass,
            addOrRemoveKeyboardFocusClass:
                (addOrRemove: boolean) => setKeyboardFocusClass(addOrRemove ? FocusService.AG_KEYBOARD_FOCUS : ''),
            forceFocusOutOfContainer: () => {}, //this.forceFocusOutOfContainer.bind(this),
            updateLayoutClasses: setLayoutClass,
            getFocusableContainers: () => {
                const els: HTMLElement[] = [];

                const gridBodyCompEl = eRootWrapper.current!.querySelector('.ag-root');
                const sideBarEl = eRootWrapper.current!.querySelector('.ag-side-bar')

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

        currentController.setComp(compProxy, eRootWrapper.current!, eRootWrapper.current!);

        setInitialised(true);
    }, [props.context]);

    // initialise the extra components
    useEffect(() => {
        const ctrl = ctrlRef.current;
        const beansToDestroy: any[] = [];

        if (!props.context || !ctrl || !eRootWrapper.current || !eGridBodyParent.current) { return; }

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
            eRootWrapper.current.insertAdjacentElement('afterbegin', eGui);
            additionalEls.push(eGui);
            beansToDestroy.push(headerDropZonesComp);
        }

        if (ctrl.showSideBar() && SideBarClass) {
            const sideBarComp = context.createBean(new SideBarClass());
            const eGui = sideBarComp.getGui();
            const bottomTabGuard = eGridBodyParent.current.querySelector('.ag-tab-guard-bottom');
            if (bottomTabGuard) {
                bottomTabGuard.insertAdjacentElement('beforebegin', eGui);
                additionalEls.push(eGui);
            }
            
            beansToDestroy.push(sideBarComp);
        }

        if (ctrl.showStatusBar() && StatusBarClass) {
            const statusBarComp = context.createBean(new StatusBarClass());
            const eGui = statusBarComp.getGui();
            eRootWrapper.current.insertAdjacentElement('beforeend', eGui);
            additionalEls.push(eGui);
            beansToDestroy.push(statusBarComp);
        }

        if (PaginationClass) {
            const paginationComp = context.createBean(new PaginationClass());
            const eGui = paginationComp.getGui();
            eRootWrapper.current.insertAdjacentElement('beforeend', eGui);
            additionalEls.push(eGui);
            beansToDestroy.push(paginationComp);
        }

        if (ctrl.showWatermark() && WatermarkClass) {
            const watermarkComp = context.createBean(new WatermarkClass());
            const eGui = watermarkComp.getGui();
            eRootWrapper.current.insertAdjacentElement('beforeend', eGui);
            additionalEls.push(eGui);
            beansToDestroy.push(watermarkComp);
        }

        return () => {
            context.destroyBean(beansToDestroy);
            additionalEls.forEach(el => {
                if (el.parentElement) {
                    el.parentElement.removeChild(el);
                }
            });
        }
    }, [props])

    const rootWrapperClasses = classesList('ag-root-wrapper', rtlClass, keyboardFocusClass, layoutClass);
    const rootWrapperBodyClasses = classesList('ag-root-wrapper-body', 'ag-focus-managed', layoutClass);

    const topStyle = {
        "user-select": userSelect != null ? userSelect : '',
        '-webkit-user-select': userSelect != null ? userSelect : '',
        cursor: cursor != null ? cursor : ''
    };

    return (
        <div ref={ eRootWrapper } className={ rootWrapperClasses } style={ topStyle }>
                { props.context &&
                <div className={ rootWrapperBodyClasses } ref={ eGridBodyParent }>
                    <ManagedFocusContainer context={ props.context } focusableElementRef= { eGridBodyParent } focusInnerElement={ (fromBottom?: boolean) => focusInnerElement.current(fromBottom) }>
                    { // we wait for initialised before rending the children, so GridComp has created and registered with it's
                    // GridCtrl before we create the child GridBodyComp. Otherwise the GridBodyComp would initialise first,
                    // before we have set the the Layout CSS classes, causing the GridBodyComp to render rows to a grid that
                    // doesn't have it's height specified, which would result if all the rows getting rendered (and if many rows,
                    // hangs the UI)
                        initialised && <GridBodyComp context={ props.context }/>

                    }
                    </ManagedFocusContainer>
                </div>
                }
        </div>
    );
}
