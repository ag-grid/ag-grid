// ag-grid-react v30.0.4
import { BaseComponentWrapper, ComponentUtil, CtrlsService, GridCoreCreator, _ } from 'ag-grid-community';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { NewReactComponent } from '../shared/newReactComponent.mjs';
import { PortalManager } from '../shared/portalManager.mjs';
import { ReactFrameworkOverrides } from '../shared/reactFrameworkOverrides.mjs';
import GridComp from './gridComp.mjs';
function debug(msg, obj) {
    // console.log(msg, obj);
}
export const AgGridReactUi = (props) => {
    var _a, _b;
    const gridOptionsRef = useRef(null);
    const eGui = useRef(null);
    const portalManager = useRef(null);
    const destroyFuncs = useRef([]);
    const whenReadyFuncs = useRef([]);
    //prevProps
    const prevProps = useRef(props);
    const ready = useRef(false);
    const [context, setContext] = useState(undefined);
    const checkForDeprecations = useCallback((props) => {
        if (props.rowDataChangeDetectionStrategy) {
            _.doOnce(() => console.warn('AG Grid: Since v29 rowDataChangeDetectionStrategy has been deprecated. Row data property changes will be compared by reference via triple equals ===. See https://ag-grid.com/react-data-grid/react-hooks/'), 'rowDataChangeDetectionStrategy_Deprecation');
        }
    }, []);
    // Hook to enable Portals to be displayed via the PortalManager
    const [, setPortalRefresher] = useState(0);
    useLayoutEffect(() => {
        const modules = props.modules || [];
        if (!portalManager.current) {
            portalManager.current = new PortalManager(() => setPortalRefresher((prev) => prev + 1), props.componentWrappingElement, props.maxComponentCreationTimeMs);
            destroyFuncs.current.push(() => {
                var _a;
                (_a = portalManager.current) === null || _a === void 0 ? void 0 : _a.destroy();
                portalManager.current = null;
            });
        }
        const gridParams = {
            providedBeanInstances: {
                frameworkComponentWrapper: new ReactFrameworkComponentWrapper(portalManager.current),
            },
            modules,
            frameworkOverrides: new ReactFrameworkOverrides(true),
        };
        gridOptionsRef.current = props.gridOptions || {};
        gridOptionsRef.current = ComponentUtil.copyAttributesToGridOptions(gridOptionsRef.current, props);
        checkForDeprecations(props);
        const createUiCallback = (context) => {
            setContext(context);
            destroyFuncs.current.push(() => {
                context.destroy();
            });
            // because React is Async, we need to wait for the UI to be initialised before exposing the API's
            const ctrlsService = context.getBean(CtrlsService.NAME);
            ctrlsService.whenReady(() => {
                debug('AgGridReactUi. ctlService is ready');
                if (context.isDestroyed()) {
                    return;
                }
                if (gridOptionsRef.current) {
                    const api = gridOptionsRef.current.api;
                    if (api) {
                        if (props.setGridApi) {
                            props.setGridApi(api, gridOptionsRef.current.columnApi);
                        }
                        destroyFuncs.current.push(() => {
                            // Take local reference to api above so correct api gets destroyed on unmount.
                            api.destroy();
                        });
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
                debug('AgGridReactUi.acceptChangesCallback');
                whenReadyFuncs.current.forEach((f) => f());
                whenReadyFuncs.current.length = 0;
                ready.current = true;
            });
        };
        const gridCoreCreator = new GridCoreCreator();
        gridCoreCreator.create(eGui.current, gridOptionsRef.current, createUiCallback, acceptChangesCallback, gridParams);
        return () => {
            debug('AgGridReactUi.destroy');
            destroyFuncs.current.forEach((f) => f());
            destroyFuncs.current.length = 0;
        };
    }, []);
    const style = useMemo(() => {
        return Object.assign({ height: '100%' }, (props.containerStyle || {}));
    }, [props.containerStyle]);
    const processWhenReady = useCallback((func) => {
        if (ready.current) {
            debug('AgGridReactUi.processWhenReady sync');
            func();
        }
        else {
            debug('AgGridReactUi.processWhenReady async');
            whenReadyFuncs.current.push(func);
        }
    }, []);
    useEffect(() => {
        const changes = {};
        extractGridPropertyChanges(prevProps.current, props, changes);
        prevProps.current = props;
        processWhenReady(() => {
            var _a;
            if ((_a = gridOptionsRef.current) === null || _a === void 0 ? void 0 : _a.api) {
                ComponentUtil.processOnChange(changes, gridOptionsRef.current.api);
            }
        });
    }, [props]);
    return (React.createElement("div", { style: style, className: props.className, ref: eGui },
        context && !context.isDestroyed() ? React.createElement(GridComp, { context: context }) : null, (_b = (_a = portalManager.current) === null || _a === void 0 ? void 0 : _a.getPortals()) !== null && _b !== void 0 ? _b : null));
};
class ReactFrameworkComponentWrapper extends BaseComponentWrapper {
    constructor(parent) {
        super();
        this.parent = parent;
    }
    createWrapper(UserReactComponent, componentType) {
        return new NewReactComponent(UserReactComponent, this.parent, componentType);
    }
}
function extractGridPropertyChanges(prevProps, nextProps, changes) {
    const debugLogging = !!nextProps.debug;
    Object.keys(nextProps).forEach((propKey) => {
        if (ComponentUtil.ALL_PROPERTIES_SET.has(propKey)) {
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
