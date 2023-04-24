import {ColumnApi, ComponentUtil, Context, CtrlsService, GridApi, GridCoreCreator, GridOptions, GridParams, Module} from '@ag-grid-community/core';
import {createEffect, createSignal, For, onCleanup, onMount} from "solid-js";
import {Portal} from 'solid-js/web';
import SolidCompWrapperFactory from './core/solidCompWrapperFactory';
import {SolidFrameworkOverrides} from './core/solidFrameworkOverrides';
import GridComp from './gridComp';

export interface AgGridSolidRef {
    api: GridApi;
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
    let gridOptions: GridOptions;

    const [context, setContext] = createSignal<Context>();
    const [getPortals, setPortals] = createSignal<PortalInfo[]>([]);

    const destroyFuncs: (() => void)[] = [];
    onCleanup(() => {
        destroyFuncs.forEach(f => f());
        destroyFuncs.length = 0;
    });

    // we check for property changes. to get things started, we take a copy
    // of all the properties at the start, and then compare against this for
    // changes.
    const propsCopy: any = {};
    Object.keys(props).forEach(key => propsCopy[key] = (props as any)[key]);

    createEffect(() => {
        const keys = Object.keys(props);
        const changes: { [key: string]: { currentValue: any, previousValue: any } } = {};
        let changesExist = false;

        keys.forEach(key => {
            // this line reads from the prop, which in turn makes
            // this prop a dependency for the effect.
            const currentValue = (props as any)[key];

            const previousValue = propsCopy[key];
            if (previousValue !== currentValue) {
                changes[key] = {
                    currentValue,
                    previousValue
                };
                propsCopy[key] = currentValue;
                changesExist = true;
            }
        });

        if (changesExist) {
            ComponentUtil.processOnChange(changes, gridOptions.api!);
        }
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

        gridOptions = props.gridOptions || {};
        ComponentUtil.copyAttributesToGridOptions(gridOptions, props);

        const createUiCallback = (context: Context) => {
            setContext(context);
            // because React is Async, we need to wait for the UI to be initialised before exposing the API's
            const ctrlsService = context.getBean(CtrlsService.NAME) as CtrlsService;
            ctrlsService.whenReady(() => {
                const refCallback = props.ref && (props.ref as (ref: AgGridSolidRef) => void);
                if (refCallback) {
                    const gridRef: AgGridSolidRef = {
                        api: gridOptions.api!,
                        columnApi: gridOptions.columnApi!
                    };
                    refCallback(gridRef);
                }
                destroyFuncs.push(() => gridOptions!.api!.destroy());
            });
        };

        const acceptChangesCallback = () => {
            // todo, what goes here?
        };

        const gridCoreCreator = new GridCoreCreator();
        gridCoreCreator.create(eGui, gridOptions, createUiCallback, acceptChangesCallback, gridParams);
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
