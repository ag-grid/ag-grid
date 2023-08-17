import {
    BaseComponentWrapper, ComponentType,
    ComponentUtil,
    Context, CtrlsService, FrameworkComponentWrapper,
    GridCoreCreator,
    GridOptions,
    GridParams,
    WrappableInterface,
    _
} from 'ag-grid-community';
import React, {
    useCallback, useEffect, useMemo,
    useRef,
    useState
} from 'react';
import { AgReactUiProps } from '../shared/interfaces';
import { NewReactComponent } from '../shared/newReactComponent';
import { PortalManager } from '../shared/portalManager';
import { ReactFrameworkOverrides } from '../shared/reactFrameworkOverrides';
import GridComp from './gridComp';

function debug(msg: string, obj?: any) {
    // console.log(msg, obj);
}

export const AgGridReactUi = <TData,>(props: AgReactUiProps<TData>) => {
    const gridOptionsRef = useRef<GridOptions | null>(null);
    const eGui = useRef<HTMLDivElement | null>(null);
    const portalManager = useRef<PortalManager | null>(null);
    const destroyFuncs = useRef<(() => void)[]>([]);
    const whenReadyFuncs = useRef<(() => void)[]>([]);

    //prevProps
    const prevProps = useRef<AgReactUiProps<any>>(props);

    const ready = useRef<boolean>(false);

    const [context, setContext] = useState<Context | undefined>(undefined);

    const checkForDeprecations = useCallback((props: any) => {
        if (props.rowDataChangeDetectionStrategy) {
            _.doOnce(
                () =>
                    console.warn(
                        'AG Grid: Since v29 rowDataChangeDetectionStrategy has been deprecated. Row data property changes will be compared by reference via triple equals ===. See https://ag-grid.com/react-data-grid/react-hooks/'
                    ),
                'rowDataChangeDetectionStrategy_Deprecation'
            );
        }
    }, []);

    // Hook to enable Portals to be displayed via the PortalManager
    const [, setPortalRefresher] = useState(0);

    const setRef = useCallback((e: HTMLDivElement) => {
        eGui.current = e;
        if (!eGui.current) {

            debug('AgGridReactUi.destroy');
            destroyFuncs.current.forEach((f) => f());
            destroyFuncs.current.length = 0;

            return;
        }

        const modules = props.modules || [];

        if (!portalManager.current) {
            portalManager.current = new PortalManager(
                () => setPortalRefresher((prev) => prev + 1),
                props.componentWrappingElement,
                props.maxComponentCreationTimeMs
            );
            destroyFuncs.current.push(() => {
                portalManager.current?.destroy();
                portalManager.current = null;
            });
        }

        const gridParams: GridParams = {
            providedBeanInstances: {
                frameworkComponentWrapper: new ReactFrameworkComponentWrapper(portalManager.current),
            },
            modules,
            frameworkOverrides: new ReactFrameworkOverrides(true),
        };

        gridOptionsRef.current = props.gridOptions || {};
        gridOptionsRef.current = ComponentUtil.copyAttributesToGridOptions(gridOptionsRef.current, props);

        checkForDeprecations(props);

        const createUiCallback = (context: Context) => {
            setContext(context);

            destroyFuncs.current.push(() => {
                context.destroy();
            });

            // because React is Async, we need to wait for the UI to be initialised before exposing the API's
            const ctrlsService = context.getBean(CtrlsService.NAME) as CtrlsService;
            ctrlsService.whenReady(() => {
                debug('AgGridReactUi. ctlService is ready');

                if (context.isDestroyed()) {
                    return;
                }

                if (gridOptionsRef.current) {
                    const api = gridOptionsRef.current.api;
                    if (api) {
                        if (props.setGridApi) {
                            props.setGridApi(api, gridOptionsRef.current.columnApi!);
                        }
                    }
                }
            });
        };

        // this callback adds to ctrlsService.whenReady(), just like above, however because whenReady() executes
        // funcs in the order they were received, we know adding items here will be AFTER the grid has set columns
        // and data. this is because GridCoreCreator sets these between calling createUiCallback and acceptChangesCallback
        const acceptChangesCallback = (context: Context) => {
            const ctrlsService = context.getBean(CtrlsService.NAME) as CtrlsService;
            ctrlsService.whenReady(() => {
                debug('AgGridReactUi.acceptChangesCallback');
                whenReadyFuncs.current.forEach((f) => f());
                whenReadyFuncs.current.length = 0;
                ready.current = true;
            });
        };

        const gridCoreCreator = new GridCoreCreator();
        gridCoreCreator.create(
            eGui.current,
            gridOptionsRef.current,
            createUiCallback,
            acceptChangesCallback,
            gridParams
        );

    }, []);

    const style = useMemo(() => {
        return {
            height: '100%',
            ...(props.containerStyle || {}),
        };
    }, [props.containerStyle]);

    const processWhenReady = useCallback((func: () => void) => {
        if (ready.current) {
            debug('AgGridReactUi.processWhenReady sync');
            func();
        } else {
            debug('AgGridReactUi.processWhenReady async');
            whenReadyFuncs.current.push(func);
        }
    }, []);

    useEffect(() => {
        const changes = {};
        extractGridPropertyChanges(prevProps.current, props, changes);
        prevProps.current = props;
        processWhenReady(() => {
            if (gridOptionsRef.current?.api) {
                ComponentUtil.processOnChange(changes, gridOptionsRef.current.api)
            }
        });
    }, [props]);

    return (
        <div style={style} className={props.className} ref={setRef}>
            {context && !context.isDestroyed() ? <GridComp context={context} /> : null}
            {portalManager.current?.getPortals() ?? null}
        </div>
    );
};

class ReactFrameworkComponentWrapper
    extends BaseComponentWrapper<WrappableInterface>
    implements FrameworkComponentWrapper {
    private readonly parent: PortalManager;

    constructor(parent: PortalManager) {
        super();
        this.parent = parent;
    }

    createWrapper(UserReactComponent: { new(): any }, componentType: ComponentType): WrappableInterface {
        return new NewReactComponent(UserReactComponent, this.parent as any, componentType);
    }
}

function extractGridPropertyChanges(prevProps: any, nextProps: any, changes: any) {
    const debugLogging = !!nextProps.debug;

    Object.keys(nextProps).forEach((propKey) => {
        if (ComponentUtil.ALL_PROPERTIES_SET.has(propKey as any)) {
            if (prevProps[propKey] !== nextProps[propKey]) {
                if (debugLogging) {
                    console.log(` agGridReact: [${propKey}] property changed`);
                }

                changes[propKey] = {
                    previousValue: prevProps[propKey],
                    currentValue: nextProps[propKey],
                };
            }
        }
    });

    ComponentUtil.EVENT_CALLBACKS.forEach((funcName) => {
        if (prevProps[funcName] !== nextProps[funcName]) {
            if (debugLogging) {
                console.log(`agGridReact: [${funcName}] event callback changed`);
            }

            changes[funcName] = {
                previousValue: prevProps[funcName],
                currentValue: nextProps[funcName],
            };
        }
    });
}