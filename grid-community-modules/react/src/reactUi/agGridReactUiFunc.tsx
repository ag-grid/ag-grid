import {
    BaseComponentWrapper,
    CtrlsService,
    ColumnApi,
    ComponentType,
    ComponentUtil,
    Context,
    FrameworkComponentWrapper,
    GridApi,
    GridCoreCreator,
    GridOptions,
    GridParams,
    WrappableInterface,
    _,
} from '@ag-grid-community/core';
import React, {
    useContext,
    useCallback,
    useImperativeHandle,
    forwardRef,
    useMemo,
    useRef,
    useState,
    useLayoutEffect,
    useEffect,
} from 'react';
import { AgReactUiProps } from '../shared/interfaces';
import { NewReactComponent } from '../shared/newReactComponent';
import { PortalManager, PortalManager2 } from '../shared/portalManager';
import GridComp from './gridComp';
import { ReactFrameworkOverrides } from '../shared/reactFrameworkOverrides';

export const AgGridReactUiFunc = (props: AgReactUiProps<any>) => {
    const apiRef = useRef<GridApi<any> | null>(null);
    const columnApiRef = useRef<ColumnApi | null>(null);
    const gridOptionsRef = useRef<GridOptions | null>(null);
    const eGui = useRef<HTMLDivElement | null>(null);
    const portalManager = useRef<PortalManager2 | null>(null);
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

    useLayoutEffect(() => {
        if (!portalManager.current) {
            portalManager.current = new PortalManager2(
                eGui.current!,
                props.componentWrappingElement,
                props.maxComponentCreationTimeMs
            );
            destroyFuncs.current.push(() => portalManager.current!.destroy());
        }
    }, []);

    useLayoutEffect(() => {
        const modules = props.modules || [];
        const gridParams: GridParams = {
            providedBeanInstances: {
                frameworkComponentWrapper: new ReactFrameworkComponentWrapper(portalManager.current!),
            },
            modules,
            frameworkOverrides: new ReactFrameworkOverrides(true),
        };

        gridOptionsRef.current = props.gridOptions || {};
        gridOptionsRef.current = ComponentUtil.copyAttributesToGridOptions(gridOptionsRef.current, props);

        checkForDeprecations(props);

        const createUiCallback = (context: Context) => {
            setContext(context);

            // because React is Async, we need to wait for the UI to be initialised before exposing the API's
            const ctrlsService = context.getBean(CtrlsService.NAME) as CtrlsService;
            ctrlsService.whenReady(() => {
                debug('AgGridReactUi.createUiCallback');

                apiRef.current = gridOptionsRef.current!.api!;
                columnApiRef.current = gridOptionsRef.current!.columnApi!;
                if (props.setGridApi) {
                    props.setGridApi(apiRef.current, columnApiRef.current);
                }
                destroyFuncs.current.push(() => apiRef.current!.destroy());
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

        // don't need the return value
        const gridCoreCreator = new GridCoreCreator();
        gridCoreCreator.create(
            eGui.current!,
            gridOptionsRef.current,
            createUiCallback,
            acceptChangesCallback,
            gridParams
        );

        return () => {
            debug('AgGridReactUi.destroy');
            destroyFuncs.current.forEach((f) => f());
            destroyFuncs.current.length = 0;
        };
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

    const processPropsChanges = useCallback((nextProps: any) => {
        const changes = {};

        extractGridPropertyChanges(prevProps.current, nextProps, changes, context);
        prevProps.current = nextProps;

        processWhenReady(() => ComponentUtil.processOnChange(changes, apiRef.current!));
    }, []);

    useEffect(() => {
        processPropsChanges(props);
    }, [props])
    //{portalManager.current!.getPortals()}
    return (
        <div style={style} className={props.className} ref={eGui}>
            {context && <> <span>context.id{(context as any).id}</span> <GridComp context={context} /> </>}

        </div>
    );
};

class ReactFrameworkComponentWrapper
    extends BaseComponentWrapper<WrappableInterface>
    implements FrameworkComponentWrapper {
    private readonly parent: PortalManager2;

    constructor(parent: PortalManager2) {
        super();
        this.parent = parent;
    }

    createWrapper(UserReactComponent: { new(): any }, componentType: ComponentType): WrappableInterface {
        return new NewReactComponent(UserReactComponent, this.parent as any, componentType);
    }
}

function debug(msg: string, obj?: any) {
    // console.log(msg, obj);
}

function extractGridPropertyChanges(prevProps: any, nextProps: any, changes: any, context: any) {
    const debugLogging = !!nextProps.debug;

    Object.keys(nextProps).forEach((propKey) => {
        if (ComponentUtil.ALL_PROPERTIES_SET.has(propKey as any)) {
            if (prevProps[propKey] !== nextProps[propKey]) {
                if (debugLogging) {
                    console.log(context?.id, ` agGridReact: [${propKey}] property changed`);
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