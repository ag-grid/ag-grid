// @ag-grid-community/react v31.0.0
import { BaseComponentWrapper, ColumnApi, ComponentUtil, CtrlsService, GridCoreCreator } from '@ag-grid-community/core';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NewReactComponent } from '../shared/newReactComponent.mjs';
import { PortalManager } from '../shared/portalManager.mjs';
import { ReactFrameworkOverrides } from '../shared/reactFrameworkOverrides.mjs';
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
        const gridParams = {
            providedBeanInstances: {
                frameworkComponentWrapper: new ReactFrameworkComponentWrapper(portalManager.current),
            },
            modules,
            frameworkOverrides: new ReactFrameworkOverrides(),
        };
        const mergedGridOps = ComponentUtil.combineAttributesAndGridOptions(props.gridOptions, props);
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
    constructor(parent) {
        super();
        this.parent = parent;
    }
    createWrapper(UserReactComponent, componentType) {
        return new NewReactComponent(UserReactComponent, this.parent, componentType);
    }
}
