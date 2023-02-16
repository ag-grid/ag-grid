import { ComponentUtil, CtrlsService, GridCoreCreator } from 'ag-grid-community';
import { createEffect, createSignal, For, onCleanup, onMount } from "solid-js";
import { Portal } from 'solid-js/web';
import SolidCompWrapperFactory from './core/solidCompWrapperFactory';
import { SolidFrameworkOverrides } from './core/solidFrameworkOverrides';
import GridComp from './gridComp';
const AgGridSolid = (props) => {
    let eGui;
    let gridOptions;
    const [context, setContext] = createSignal();
    const [getPortals, setPortals] = createSignal([]);
    const destroyFuncs = [];
    onCleanup(() => {
        destroyFuncs.forEach(f => f());
        destroyFuncs.length = 0;
    });
    // we check for property changes. to get things started, we take a copy
    // of all the properties at the start, and then compare against this for
    // changes.
    const propsCopy = {};
    Object.keys(props).forEach(key => propsCopy[key] = props[key]);
    createEffect(() => {
        const keys = Object.keys(props);
        const changes = {};
        let changesExist = false;
        keys.forEach(key => {
            // this line reads from the prop, which in turn makes
            // this prop a dependency for the effect.
            const currentValue = props[key];
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
            ComponentUtil.processOnChange(changes, gridOptions.api);
        }
    });
    onMount(() => {
        const modules = props.modules || [];
        const portalManager = {
            addPortal: info => {
                setPortals([...getPortals(), info]);
            },
            removePortal: info => {
                setPortals(getPortals().filter(item => item != info));
            }
        };
        const gridParams = {
            providedBeanInstances: {
                frameworkComponentWrapper: new SolidCompWrapperFactory(portalManager)
            },
            modules,
            frameworkOverrides: new SolidFrameworkOverrides()
        };
        gridOptions = props.gridOptions || {};
        ComponentUtil.copyAttributesToGridOptions(gridOptions, props);
        const createUiCallback = (context) => {
            setContext(context);
            // because React is Async, we need to wait for the UI to be initialised before exposing the API's
            const ctrlsService = context.getBean(CtrlsService.NAME);
            ctrlsService.whenReady(() => {
                const refCallback = props.ref && props.ref;
                if (refCallback) {
                    const gridRef = {
                        api: gridOptions.api,
                        columnApi: gridOptions.columnApi
                    };
                    refCallback(gridRef);
                }
                destroyFuncs.push(() => gridOptions.api.destroy());
            });
        };
        const acceptChangesCallback = () => {
            // todo, what goes here?
        };
        const gridCoreCreator = new GridCoreCreator();
        gridCoreCreator.create(eGui, gridOptions, createUiCallback, acceptChangesCallback, gridParams);
    });
    return (<div ref={eGui} style={{ height: '100%' }}>
            {context() &&
            <GridComp class={props.class} context={context()}></GridComp>}
            <For each={getPortals()}>{(info, i) => <Portal mount={info.mount}>
                    <info.SolidClass {...info.props} ref={info.ref}/>
                </Portal>}</For>
        </div>);
};
export default AgGridSolid;
