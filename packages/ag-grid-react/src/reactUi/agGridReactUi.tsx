import {
    BaseComponentWrapper, ComponentType,
    ComponentUtil,
    Context, CtrlsService, FrameworkComponentWrapper,
    FrameworkOverridesIncomingSource,
    GridApi,
    GridCoreCreator,
    GridOptions,
    GridParams, IDetailCellRenderer, IDetailCellRendererCtrl,
    IDetailCellRendererParams, ModuleRegistry, VanillaFrameworkOverrides, WrappableInterface, _
} from 'ag-grid-community';
import React, {
    forwardRef,
    useCallback, useContext, useEffect, useImperativeHandle, useMemo,
    useRef,
    useState
} from 'react';
import { DateComponentWrapper } from '../shared/customComp/dateComponentWrapper';
import { FilterComponentWrapper } from '../shared/customComp/filterComponentWrapper';
import { FloatingFilterComponentWrapper } from '../shared/customComp/floatingFilterComponentWrapper';
import { LoadingOverlayComponentWrapper } from '../shared/customComp/loadingOverlayComponentWrapper';
import { MenuItemComponentWrapper } from '../shared/customComp/menuItemComponentWrapper';
import { NoRowsOverlayComponentWrapper } from '../shared/customComp/noRowsOverlayComponentWrapper';
import { StatusPanelComponentWrapper } from '../shared/customComp/statusPanelComponentWrapper';
import { ToolPanelComponentWrapper } from '../shared/customComp/toolPanelComponentWrapper';
import { AgGridReactProps } from '../shared/interfaces';
import { ReactComponent } from '../shared/reactComponent';
import { PortalManager } from '../shared/portalManager';
import { BeansContext } from "./beansContext";
import { CssClasses, runWithoutFlushSync } from "./utils";
import GroupCellRenderer from "../reactUi/cellRenderer/groupCellRenderer";
import GridComp from './gridComp';
import { warnReactiveCustomComponents } from '../shared/customComp/util';


export const AgGridReactUi = <TData,>(props: AgGridReactProps<TData>) => {
    const apiRef = useRef<GridApi<TData>>();
    const eGui = useRef<HTMLDivElement | null>(null);
    const portalManager = useRef<PortalManager | null>(null);
    const destroyFuncs = useRef<(() => void)[]>([]);
    const whenReadyFuncs = useRef<(() => void)[]>([]);
    const prevProps = useRef<AgGridReactProps<any>>(props);

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

        const mergedGridOps = ComponentUtil.combineAttributesAndGridOptions(props.gridOptions, props);

        const gridParams: GridParams = {
            providedBeanInstances: {
                frameworkComponentWrapper: new ReactFrameworkComponentWrapper(portalManager.current, !!mergedGridOps.reactiveCustomComponents),
            },
            modules,
            frameworkOverrides: new ReactFrameworkOverrides(),
        };

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
                        props.setGridApi(api);
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
    constructor(private readonly parent: PortalManager, private readonly reactiveCustomComponents?: boolean) {
        super();
    }

    createWrapper(UserReactComponent: { new(): any }, componentType: ComponentType): WrappableInterface {
        if (this.reactiveCustomComponents) {
            const getComponentClass = (propertyName: string) => {
                switch (propertyName) {
                    case 'filter':
                        return FilterComponentWrapper;
                    case 'floatingFilterComponent':
                        return FloatingFilterComponentWrapper;
                    case 'dateComponent':
                        return DateComponentWrapper;
                    case 'loadingOverlayComponent':
                        return LoadingOverlayComponentWrapper;
                    case 'noRowsOverlayComponent':
                        return NoRowsOverlayComponentWrapper;
                    case 'statusPanel':
                        return StatusPanelComponentWrapper;
                    case 'toolPanel':
                        return ToolPanelComponentWrapper;
                    case 'menuItem':
                        return MenuItemComponentWrapper;
                }
            }
            const ComponentClass = getComponentClass(componentType.propertyName);
            if (ComponentClass) {
                return new ComponentClass(UserReactComponent, this.parent, componentType);
            }
        } else {
            switch (componentType.propertyName) {
                case 'filter':
                case 'floatingFilterComponent':
                case 'dateComponent':
                case 'loadingOverlayComponent':
                case 'noRowsOverlayComponent':
                case 'statusPanel':
                case 'toolPanel':
                case 'menuItem':
                    warnReactiveCustomComponents();
                    break;
            }
        }
        // only cell renderers and tool panel should use fallback methods
        const suppressFallbackMethods = !componentType.cellRenderer && componentType.propertyName !== 'toolPanel';
        return new ReactComponent(UserReactComponent, this.parent, componentType, suppressFallbackMethods);
    }
}

// Define DetailCellRenderer and ReactFrameworkOverrides here to avoid circular dependency
const DetailCellRenderer = forwardRef((props: IDetailCellRendererParams, ref: any) => {

    const { ctrlsFactory, context, gos, resizeObserverService, clientSideRowModel, serverSideRowModel } = useContext(BeansContext);

    const [cssClasses, setCssClasses] = useState<CssClasses>(() => new CssClasses());
    const [gridCssClasses, setGridCssClasses] = useState<CssClasses>(() => new CssClasses());
    const [detailGridOptions, setDetailGridOptions] = useState<GridOptions>();
    const [detailRowData, setDetailRowData] = useState<any[]>();

    const ctrlRef = useRef<IDetailCellRendererCtrl>();
    const eGuiRef = useRef<HTMLDivElement | null>(null);

    const resizeObserverDestroyFunc = useRef<() => void>();

    const parentModules = useMemo(() => ModuleRegistry.__getGridRegisteredModules(props.api.getGridId()), [props]);
    const topClassName = useMemo(() => cssClasses.toString() + ' ag-details-row', [cssClasses]);
    const gridClassName = useMemo(() => gridCssClasses.toString() + ' ag-details-grid', [gridCssClasses]);

    if (ref) {
        useImperativeHandle(ref, () => ({
            refresh() { return ctrlRef.current?.refresh() ?? false; }
        }));
    }

    if (props.template) {
        _.warnOnce('detailCellRendererParams.template is not supported by AG Grid React. To change the template, provide a Custom Detail Cell Renderer. See https://ag-grid.com/react-data-grid/master-detail-custom-detail/');
    }

    const setRef = useCallback((e: HTMLDivElement) => {
        eGuiRef.current = e;

        if (!eGuiRef.current) {
            context.destroyBean(ctrlRef.current);
            if (resizeObserverDestroyFunc.current) {
                resizeObserverDestroyFunc.current();
            }
            return;
        }

        const compProxy: IDetailCellRenderer = {
            addOrRemoveCssClass: (name: string, on: boolean) => setCssClasses(prev => prev.setClass(name, on)),
            addOrRemoveDetailGridCssClass: (name: string, on: boolean) => setGridCssClasses(prev => prev.setClass(name, on)),
            setDetailGrid: gridOptions => setDetailGridOptions(gridOptions),
            setRowData: rowData => setDetailRowData(rowData),
            getGui: () => eGuiRef.current!
        };

        const ctrl = ctrlsFactory.getInstance('detailCellRenderer') as IDetailCellRendererCtrl;
        if (!ctrl) { return; } // should never happen, means master/detail module not loaded
        context.createBean(ctrl);

        ctrl.init(compProxy, props);

        ctrlRef.current = ctrl;

        if (gos.get('detailRowAutoHeight')) {
            const checkRowSizeFunc = () => {
                // when disposed, current is null, so nothing to do, and the resize observer will
                // be disposed of soon
                if (eGuiRef.current == null) { return; }

                const clientHeight = eGuiRef.current.clientHeight;

                // if the UI is not ready, the height can be 0, which we ignore, as otherwise a flicker will occur
                // as UI goes from the default height, to 0, then to the real height as UI becomes ready. this means
                // it's not possible for have 0 as auto-height, however this is an improbable use case, as even an
                // empty detail grid would still have some styling around it giving at least a few pixels.
                if (clientHeight != null && clientHeight > 0) {
                    // we do the update in a timeout, to make sure we are not calling from inside the grid
                    // doing another update
                    const updateRowHeightFunc = () => {
                        props.node.setRowHeight(clientHeight);
                        if (clientSideRowModel) {
                            clientSideRowModel.onRowHeightChanged();
                        } else if (serverSideRowModel) {
                            serverSideRowModel.onRowHeightChanged();
                        }
                    };
                    setTimeout(updateRowHeightFunc, 0);
                }
            };

            resizeObserverDestroyFunc.current = resizeObserverService.observeResize(eGuiRef.current, checkRowSizeFunc);
            checkRowSizeFunc();
        }
    }, []);

    const setGridApi = useCallback((api: GridApi) => {
        ctrlRef.current?.registerDetailWithMaster(api)
    }, []);

    return (
        <div className={topClassName} ref={setRef}>
            {
                detailGridOptions &&
                <AgGridReactUi className={gridClassName} {...detailGridOptions} modules={parentModules} rowData={detailRowData} setGridApi={setGridApi} />
            }
        </div>
    );
});

class ReactFrameworkOverrides extends VanillaFrameworkOverrides {

    constructor() {
        super('react');
        this.renderingEngine = 'react';
    }

    private frameworkComponents: any = {
        agGroupCellRenderer: GroupCellRenderer,
        agGroupRowRenderer: GroupCellRenderer,
        agDetailCellRenderer: DetailCellRenderer
    };

    public frameworkComponent(name: string): any {
        return this.frameworkComponents[name];
    }

    isFrameworkComponent(comp: any): boolean {
        if (!comp) { return false; }
        const prototype = comp.prototype;
        const isJsComp = prototype && 'getGui' in prototype;
        return !isJsComp;
    }

    wrapIncoming: <T>(callback: () => T, source?: FrameworkOverridesIncomingSource) => T = (callback, source) => {
        if (source === 'ensureVisible') {
            // As ensureVisible could easily be called from an effect which is already running inside a React render
            // we need to run it without flushSync to avoid the DEV error from React when calling flushSync inside a render.
            // This does mean there will be a flicker as the grid redraws the cells in the new location but this is deemed
            // less of an issue then the error in the console for devs. 
            return runWithoutFlushSync(callback);
        }
        return callback();
    }
}

