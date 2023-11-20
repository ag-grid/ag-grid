import {
    BaseComponentWrapper, ColumnApi, ComponentType,
    ComponentUtil,
    Context, CtrlsService, FrameworkComponentWrapper,
    GridApi,
    GridCoreCreator,
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


export const AgGridReactUi = <TData,>(props: AgReactUiProps<TData>) => {
    const apiRef = useRef<GridApi<TData>>();
    const eGui = useRef<HTMLDivElement | null>(null);
    const portalManager = useRef<PortalManager | null>(null);
    const destroyFuncs = useRef<(() => void)[]>([]);
    const whenReadyFuncs = useRef<(() => void)[]>([]);
    const prevProps = useRef<AgReactUiProps<any>>(props);

    const ready = useRef<boolean>(false);

    const [context, setContext] = useState<Context | undefined>(undefined);

    // Hook to enable Portals to be displayed via the PortalManager
    const [, setPortalRefresher] = useState(0);

    const setRef = useCallback((e: HTMLDivElement) => {
        eGui.current = e;
        if (!eGui.current) {

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
            frameworkOverrides: new ReactFrameworkOverrides(),
        };

        const mergedGridOps = ComponentUtil.combineAttributesAndGridOptions(props.gridOptions, props);

        const createUiCallback = (context: Context) => {
            setContext(context);

            destroyFuncs.current.push(() => {
                context.destroy();
            });

            // because React is Async, we need to wait for the UI to be initialised before exposing the API's
            const ctrlsService = context.getBean(CtrlsService.NAME) as CtrlsService;
            ctrlsService.whenReady(() => {

                if (context.isDestroyed()) {
                    return;
                }

                const api = apiRef.current;
                if (api) {
                    if (props.setGridApi) {
                        props.setGridApi(api, new ColumnApi(api));
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
                whenReadyFuncs.current.forEach((f) => f());
                whenReadyFuncs.current.length = 0;
                ready.current = true;
            });
        };

        const gridCoreCreator = new GridCoreCreator();
        apiRef.current = gridCoreCreator.create(
            eGui.current,
            mergedGridOps,
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
            func();
        } else {
            whenReadyFuncs.current.push(func);
        }
    }, []);

    useEffect(() => {
        const changes = extractGridPropertyChanges(prevProps.current, props);
        prevProps.current = props;
        processWhenReady(() => {
            if (apiRef.current) {
                ComponentUtil.processOnChange(changes, apiRef.current)
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

function extractGridPropertyChanges(prevProps: any, nextProps: any): { [p: string]: any } {
    const changes: { [p: string]: any } = {};
    Object.keys(nextProps).forEach(propKey => {
        const propValue = nextProps[propKey];
        if (prevProps[propKey] !== propValue) {
            changes[propKey] = propValue;
        }
    });

    return changes;
}

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
