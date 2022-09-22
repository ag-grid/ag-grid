import {
    Context,
    FocusService,
    GridCtrl,
    IGridComp
} from 'ag-grid-community';
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { BeansContext } from './core/beansContext';
import { classesList } from './core/utils';
import GridBodyComp from './gridBodyComp';
import TabGuardComp, { TabGuardRef } from './tabGuardComp';

const GridComp = (props: {context: Context, class?: string})=> {

    const [rtlClass, setRtlClass] = createSignal<string>('');
    const [keyboardFocusClass, setKeyboardFocusClass] = createSignal<string>('');
    const [layoutClass, setLayoutClass] = createSignal<string>('');
    const [cursor, setCursor] = createSignal<string | null>(null);
    const [userSelect, setUserSelect] = createSignal<string | null>(null);
    const [initialised, setInitialised] = createSignal<boolean>(false);

    const {context} = props;
    const beans = context.getBean('beans');

    let tabGuardRef: TabGuardRef;
    const setTabGuardRef = (newRef: TabGuardRef)=> {
        tabGuardRef = newRef;
        tabGuardRef && tabGuardReady();
    };

    let eGui: HTMLDivElement;
    let eBody: HTMLDivElement;
    let gridCtrl: GridCtrl;

    const onTabKeyDown = () => undefined;

    const destroyFuncs: (()=>void)[] = [];
    onCleanup( ()=> {
        destroyFuncs.forEach( f => f() );
        destroyFuncs.length = 0;
    });

    const tabGuardReady = ()=> {

        const beansToDestroy: any[] = [];

        const {agStackComponentsRegistry} = beans;

        const HeaderDropZonesClass = agStackComponentsRegistry.getComponentClass('AG-GRID-HEADER-DROP-ZONES');
        const SideBarClass = agStackComponentsRegistry.getComponentClass('AG-SIDE-BAR');
        const StatusBarClass = agStackComponentsRegistry.getComponentClass('AG-STATUS-BAR');
        const WatermarkClass = agStackComponentsRegistry.getComponentClass('AG-WATERMARK');
        const PaginationClass = agStackComponentsRegistry.getComponentClass('AG-PAGINATION');
        const additionalEls: HTMLDivElement[] = [];

        if (gridCtrl.showDropZones() && HeaderDropZonesClass) {
            const headerDropZonesComp = context.createBean(new HeaderDropZonesClass());
            const el = headerDropZonesComp.getGui();
            eGui.insertAdjacentElement('afterbegin', el);
            additionalEls.push(el);
            beansToDestroy.push(headerDropZonesComp);
        }

        if (gridCtrl.showSideBar() && SideBarClass) {
            const sideBarComp = context.createBean(new SideBarClass());
            const el = sideBarComp.getGui();
            const bottomTabGuard = eBody.querySelector('.ag-tab-guard-bottom');
            if (bottomTabGuard) {
                bottomTabGuard.insertAdjacentElement('beforebegin', el);
                additionalEls.push(el);
            }

            beansToDestroy.push(sideBarComp);
        }

        if (gridCtrl.showStatusBar() && StatusBarClass) {
            const statusBarComp = context.createBean(new StatusBarClass());
            const el = statusBarComp.getGui();
            eGui.insertAdjacentElement('beforeend', el);
            additionalEls.push(el);
            beansToDestroy.push(statusBarComp);
        }

        if (PaginationClass) {
            const paginationComp = context.createBean(new PaginationClass());
            const el = paginationComp.getGui();
            eGui.insertAdjacentElement('beforeend', el);
            additionalEls.push(el);
            beansToDestroy.push(paginationComp);
        }

        if (gridCtrl.showWatermark() && WatermarkClass) {
            const watermarkComp = context.createBean(new WatermarkClass());
            const el = watermarkComp.getGui();
            eGui.insertAdjacentElement('beforeend', el);
            additionalEls.push(el);
            beansToDestroy.push(watermarkComp);
        }

        destroyFuncs.push( ()=> {
            context.destroyBeans(beansToDestroy);
            additionalEls.forEach(el => {
                if (el.parentElement) {
                    el.parentElement.removeChild(el);
                }
            });
        });
    };

    onMount( ()=> {
        gridCtrl = context.createBean(new GridCtrl());
        destroyFuncs.push( ()=> context.destroyBean(gridCtrl) );

        const compProxy: IGridComp = {
            destroyGridUi:
                () => {}, // do nothing, as framework users destroy grid by removing the comp
            setRtlClass: setRtlClass,
            addOrRemoveKeyboardFocusClass:
                (addOrRemove: boolean) => setKeyboardFocusClass(addOrRemove ? FocusService.AG_KEYBOARD_FOCUS : ''),
            forceFocusOutOfContainer: () => {
                tabGuardRef && tabGuardRef.forceFocusOutOfContainer();
            },
            updateLayoutClasses: setLayoutClass,
            getFocusableContainers: () => {
                const els: HTMLElement[] = [];

                const gridBodyCompEl = eGui.querySelector('.ag-root');
                const sideBarEl = eGui.querySelector('.ag-side-bar')

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

        gridCtrl.setComp(compProxy, eGui, eGui);
        setInitialised(true);
    });
    
    const cssClasses = createMemo( () => classesList('ag-root-wrapper', rtlClass(), keyboardFocusClass(), layoutClass(), props.class) );
    const bodyCssClasses = createMemo( () => classesList('ag-root-wrapper-body', 'ag-focus-managed', layoutClass()));

    const topStyle = createMemo( () => ({
        userSelect: userSelect != null ? (userSelect as any) : '',
        WebkitUserSelect: userSelect != null ? (userSelect as any) : '',
        cursor: cursor != null ? cursor : ''
    }));

    return (
        <div ref={ eGui! } class={ cssClasses() } style={ topStyle() }>
            <div class={ bodyCssClasses() } ref={ eBody! }>
                { initialised() &&
                    // we wait for initialised before rending the children, so GridComp has created and registered with it's
                    // GridCtrl before we create the child GridBodyComp. Otherwise the GridBodyComp would initialise first,
                    // before we have set the the Layout CSS classes, causing the GridBodyComp to render rows to a grid that
                    // doesn't have it's height specified, which would result if all the rows getting rendered (and if many rows,
                    // hangs the UI)
                    <BeansContext.Provider value={beans}>
                        <TabGuardComp
                            ref={ setTabGuardRef }
                            eFocusableElement= { eGui! }
                            onTabKeyDown={ onTabKeyDown }
                            gridCtrl={ gridCtrl! }>
                            <GridBodyComp/>
                        </TabGuardComp>
                    </BeansContext.Provider>
                }
            </div>
        </div>
    );
};

export default GridComp;