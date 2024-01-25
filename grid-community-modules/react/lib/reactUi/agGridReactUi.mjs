// @ag-grid-community/react v31.0.3
import { BaseComponentWrapper, ColumnApi, ComponentUtil, CtrlsService, GridCoreCreator, ModuleRegistry, VanillaFrameworkOverrides, _ } from '@ag-grid-community/core';
import React, { forwardRef, useCallback, useContext, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { DateComponentWrapper } from '../shared/customComp/dateComponentWrapper.mjs';
import { FilterComponentWrapper } from '../shared/customComp/filterComponentWrapper.mjs';
import { FloatingFilterComponentWrapper } from '../shared/customComp/floatingFilterComponentWrapper.mjs';
import { LoadingOverlayComponentWrapper } from '../shared/customComp/loadingOverlayComponentWrapper.mjs';
import { NoRowsOverlayComponentWrapper } from '../shared/customComp/noRowsOverlayComponentWrapper.mjs';
import { StatusPanelComponentWrapper } from '../shared/customComp/statusPanelComponentWrapper.mjs';
import { ToolPanelComponentWrapper } from '../shared/customComp/toolPanelComponentWrapper.mjs';
import { ReactComponent } from '../shared/reactComponent.mjs';
import { PortalManager } from '../shared/portalManager.mjs';
import { BeansContext } from "./beansContext.mjs";
import { CssClasses } from "./utils.mjs";
import GroupCellRenderer from "../reactUi/cellRenderer/groupCellRenderer.mjs";
import GridComp from './gridComp.mjs';
export const AgGridReactUi = (props) => {
    var _a, _b;
    const apiRef = useRef();
    const eGui = useRef(null);
    const portalManager = useRef(null);
    const destroyFuncs = useRef([]);
    const whenReadyFuncs = useRef([]);
    const prevProps = useRef(props);
    const ready = useRef(false);
    const [context, setContext] = useState(undefined);
    // Hook to enable Portals to be displayed via the PortalManager
    const [, setPortalRefresher] = useState(0);
    const setRef = useCallback((e) => {
        eGui.current = e;
        if (!eGui.current) {
            destroyFuncs.current.forEach((f) => f());
            destroyFuncs.current.length = 0;
            return;
        }
        const modules = props.modules || [];
        if (!portalManager.current) {
            portalManager.current = new PortalManager(() => setPortalRefresher((prev) => prev + 1), props.componentWrappingElement, props.maxComponentCreationTimeMs);
            destroyFuncs.current.push(() => {
                var _a;
                (_a = portalManager.current) === null || _a === void 0 ? void 0 : _a.destroy();
                portalManager.current = null;
            });
        }
        const mergedGridOps = ComponentUtil.combineAttributesAndGridOptions(props.gridOptions, props);
        const gridParams = {
            providedBeanInstances: {
                frameworkComponentWrapper: new ReactFrameworkComponentWrapper(portalManager.current, !!mergedGridOps.reactiveCustomComponents),
            },
            modules,
            frameworkOverrides: new ReactFrameworkOverrides(),
        };
        const createUiCallback = (context) => {
            setContext(context);
            destroyFuncs.current.push(() => {
                context.destroy();
            });
            // because React is Async, we need to wait for the UI to be initialised before exposing the API's
            const ctrlsService = context.getBean(CtrlsService.NAME);
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
        const acceptChangesCallback = (context) => {
            const ctrlsService = context.getBean(CtrlsService.NAME);
            ctrlsService.whenReady(() => {
                whenReadyFuncs.current.forEach((f) => f());
                whenReadyFuncs.current.length = 0;
                ready.current = true;
            });
        };
        const gridCoreCreator = new GridCoreCreator();
        apiRef.current = gridCoreCreator.create(eGui.current, mergedGridOps, createUiCallback, acceptChangesCallback, gridParams);
    }, []);
    const style = useMemo(() => {
        return Object.assign({ height: '100%' }, (props.containerStyle || {}));
    }, [props.containerStyle]);
    const processWhenReady = useCallback((func) => {
        if (ready.current) {
            func();
        }
        else {
            whenReadyFuncs.current.push(func);
        }
    }, []);
    useEffect(() => {
        const changes = extractGridPropertyChanges(prevProps.current, props);
        prevProps.current = props;
        processWhenReady(() => {
            if (apiRef.current) {
                ComponentUtil.processOnChange(changes, apiRef.current);
            }
        });
    }, [props]);
    return (React.createElement("div", { style: style, className: props.className, ref: setRef },
        context && !context.isDestroyed() ? React.createElement(GridComp, { context: context }) : null, (_b = (_a = portalManager.current) === null || _a === void 0 ? void 0 : _a.getPortals()) !== null && _b !== void 0 ? _b : null));
};
function extractGridPropertyChanges(prevProps, nextProps) {
    const changes = {};
    Object.keys(nextProps).forEach(propKey => {
        const propValue = nextProps[propKey];
        if (prevProps[propKey] !== propValue) {
            changes[propKey] = propValue;
        }
    });
    return changes;
}
class ReactFrameworkComponentWrapper extends BaseComponentWrapper {
    constructor(parent, reactiveCustomComponents) {
        super();
        this.parent = parent;
        this.reactiveCustomComponents = reactiveCustomComponents;
    }
    createWrapper(UserReactComponent, componentType) {
        if (this.reactiveCustomComponents) {
            const getComponentClass = (propertyName) => {
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
                }
            };
            const ComponentClass = getComponentClass(componentType.propertyName);
            if (ComponentClass) {
                return new ComponentClass(UserReactComponent, this.parent, componentType);
            }
        }
        // only cell renderers and tool panel should use fallback methods
        const suppressFallbackMethods = !componentType.cellRenderer && componentType.propertyName !== 'toolPanel';
        return new ReactComponent(UserReactComponent, this.parent, componentType, suppressFallbackMethods);
    }
}
// Define DetailCellRenderer and ReactFrameworkOverrides here to avoid circular dependency
const DetailCellRenderer = forwardRef((props, ref) => {
    const { ctrlsFactory, context, gridOptionsService, resizeObserverService, clientSideRowModel, serverSideRowModel } = useContext(BeansContext);
    const [cssClasses, setCssClasses] = useState(() => new CssClasses());
    const [gridCssClasses, setGridCssClasses] = useState(() => new CssClasses());
    const [detailGridOptions, setDetailGridOptions] = useState();
    const [detailRowData, setDetailRowData] = useState();
    const ctrlRef = useRef();
    const eGuiRef = useRef(null);
    const resizeObserverDestroyFunc = useRef();
    const parentModules = useMemo(() => ModuleRegistry.__getGridRegisteredModules(props.api.getGridId()), [props]);
    const topClassName = useMemo(() => cssClasses.toString() + ' ag-details-row', [cssClasses]);
    const gridClassName = useMemo(() => gridCssClasses.toString() + ' ag-details-grid', [gridCssClasses]);
    if (ref) {
        useImperativeHandle(ref, () => ({
            refresh() { var _a, _b; return (_b = (_a = ctrlRef.current) === null || _a === void 0 ? void 0 : _a.refresh()) !== null && _b !== void 0 ? _b : false; }
        }));
    }
    if (props.template) {
        _.warnOnce('detailCellRendererParams.template is not supported by AG Grid React. To change the template, provide a Custom Detail Cell Renderer. See https://ag-grid.com/react-data-grid/master-detail-custom-detail/');
    }
    const setRef = useCallback((e) => {
        eGuiRef.current = e;
        if (!eGuiRef.current) {
            context.destroyBean(ctrlRef.current);
            if (resizeObserverDestroyFunc.current) {
                resizeObserverDestroyFunc.current();
            }
            return;
        }
        const compProxy = {
            addOrRemoveCssClass: (name, on) => setCssClasses(prev => prev.setClass(name, on)),
            addOrRemoveDetailGridCssClass: (name, on) => setGridCssClasses(prev => prev.setClass(name, on)),
            setDetailGrid: gridOptions => setDetailGridOptions(gridOptions),
            setRowData: rowData => setDetailRowData(rowData),
            getGui: () => eGuiRef.current
        };
        const ctrl = ctrlsFactory.getInstance('detailCellRenderer');
        if (!ctrl) {
            return;
        } // should never happen, means master/detail module not loaded
        context.createBean(ctrl);
        ctrl.init(compProxy, props);
        ctrlRef.current = ctrl;
        if (gridOptionsService.get('detailRowAutoHeight')) {
            const checkRowSizeFunc = () => {
                // when disposed, current is null, so nothing to do, and the resize observer will
                // be disposed of soon
                if (eGuiRef.current == null) {
                    return;
                }
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
                        }
                        else if (serverSideRowModel) {
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
    const setGridApi = useCallback((api, columnApi) => {
        var _a;
        (_a = ctrlRef.current) === null || _a === void 0 ? void 0 : _a.registerDetailWithMaster(api, columnApi);
    }, []);
    return (React.createElement("div", { className: topClassName, ref: setRef }, detailGridOptions &&
        React.createElement(AgGridReactUi, Object.assign({ className: gridClassName }, detailGridOptions, { modules: parentModules, rowData: detailRowData, setGridApi: setGridApi }))));
});
class ReactFrameworkOverrides extends VanillaFrameworkOverrides {
    constructor() {
        super('react');
        this.frameworkComponents = {
            agGroupCellRenderer: GroupCellRenderer,
            agGroupRowRenderer: GroupCellRenderer,
            agDetailCellRenderer: DetailCellRenderer
        };
        this.renderingEngine = 'react';
    }
    frameworkComponent(name) {
        return this.frameworkComponents[name];
    }
    isFrameworkComponent(comp) {
        if (!comp) {
            return false;
        }
        const prototype = comp.prototype;
        const isJsComp = prototype && 'getGui' in prototype;
        return !isJsComp;
    }
}
