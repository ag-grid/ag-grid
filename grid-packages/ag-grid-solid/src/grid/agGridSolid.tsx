import {ColumnApi, ComponentUtil, Context, CtrlsService, GridApi, GridCoreCreator, GridOptions, GridParams, Module} from 'ag-grid-community';
import {createEffect, createSignal, For, onCleanup, onMount} from "solid-js";
import {Portal} from 'solid-js/web';
import SolidCompWrapperFactory from './core/solidCompWrapperFactory';
import {SolidFrameworkOverrides} from './core/solidFrameworkOverrides';
import GridComp from './gridComp';

export interface AgGridSolidRef {
    api: GridApi;
    /** @deprecated v31 - The `columnApi` has been deprecated and all the methods are now present of the `api`. */
    columnApi: ColumnApi;
}

export interface AgGridSolidProps extends GridOptions {
    gridOptions?: GridOptions;
    ref?: AgGridSolidRef | ((ref: AgGridSolidRef) => void);
    modules?: Module[];
    class?: string;
}

export interface PortalInfo {
    mount: HTMLElement;
    SolidClass: any;
    props: any;
    ref: (instance: any) => void;
}

export interface PortalManager {
    addPortal(info: PortalInfo): void;

    removePortal(info: PortalInfo): void;
}

const AgGridSolid = (props: AgGridSolidProps) => {
    let eGui: HTMLDivElement;
    let api: GridApi;

    const [context, setContext] = createSignal<Context>();
    const [getPortals, setPortals] = createSignal<PortalInfo[]>([]);

    const destroyFuncs: (() => void)[] = [];
    onCleanup(() => {
        destroyFuncs.forEach(f => f());
        destroyFuncs.length = 0;
    });

    createEffect(() => {
        ComponentUtil.processOnChange(props, api!);
    });

    onMount(() => {

        const modules = props.modules || [];

        const portalManager: PortalManager = {
            addPortal: info => {
                setPortals([...getPortals(), info]);
            },
            removePortal: info => {
                setPortals(getPortals().filter(item => item != info));
            }
        };

        const gridParams: GridParams = {
            providedBeanInstances: {
                frameworkComponentWrapper: new SolidCompWrapperFactory(portalManager)
            },
            modules,
            frameworkOverrides: new SolidFrameworkOverrides()
        };

        const gridOptions = ComponentUtil.combineAttributesAndGridOptions(props.gridOptions, props);

        const createUiCallback = (context: Context) => {
            setContext(context);
            // because React is Async, we need to wait for the UI to be initialised before exposing the API's
            const ctrlsService = context.getBean(CtrlsService.NAME) as CtrlsService;
            ctrlsService.whenReady(() => {
                const refCallback = props.ref && (props.ref as (ref: AgGridSolidRef) => void);
                if (refCallback) {
                    const gridRef: AgGridSolidRef = {
                        api: api!,
                        columnApi: new ColumnApi(api!)
                    };
                    refCallback(gridRef);
                }
                destroyFuncs.push(() => api!.destroy());
            });
        };

        const acceptChangesCallback = () => {
            // todo, what goes here?
        };

        const gridCoreCreator = new GridCoreCreator();
        api = gridCoreCreator.create(eGui, gridOptions, createUiCallback, acceptChangesCallback, gridParams);
    });

    return (
        <div ref={eGui!} style={{height: '100%'}}>
            {context() &&
                <GridComp class={props.class} context={context()!}></GridComp>
            }
            <For each={getPortals()}>{(info, i) =>
                <Portal mount={info.mount}>
                    <info.SolidClass {...info.props} ref={info.ref}/>
                </Portal>
            }</For>
        </div>
    );
}

export default AgGridSolid;
