// @ag-grid-community/react v31.0.0
import { getRowContainerTypeForName, RowContainerCtrl, RowContainerName } from '@ag-grid-community/core';
import React, { useMemo, useRef, useState, memo, useContext, useCallback } from 'react';
import { agFlushSync, classesList, getNextValueIfDifferent } from '../utils.mjs';
import useReactCommentEffect from '../reactComment.mjs';
import RowComp from './rowComp.mjs';
import { BeansContext } from '../beansContext.mjs';
const RowContainerComp = (params) => {
    const { context } = useContext(BeansContext);
    const { name } = params;
    const containerType = useMemo(() => getRowContainerTypeForName(name), [name]);
    const eViewport = useRef(null);
    const eContainer = useRef(null);
    const rowCtrlsRef = useRef([]);
    const [rowCtrlsOrdered, setRowCtrlsOrdered] = useState(() => []);
    const domOrderRef = useRef(false);
    const rowContainerCtrlRef = useRef();
    const cssClasses = useMemo(() => RowContainerCtrl.getRowContainerCssClasses(name), [name]);
    const viewportClasses = useMemo(() => classesList(cssClasses.viewport), [cssClasses]);
    const containerClasses = useMemo(() => classesList(cssClasses.container), [cssClasses]);
    // no need to useMemo for boolean types
    const centerTemplate = name === RowContainerName.CENTER
        || name === RowContainerName.TOP_CENTER
        || name === RowContainerName.BOTTOM_CENTER
        || name === RowContainerName.STICKY_TOP_CENTER;
    const topLevelRef = centerTemplate ? eViewport : eContainer;
    useReactCommentEffect(' AG Row Container ' + name + ' ', topLevelRef);
    const areElementsReady = useCallback(() => {
        if (centerTemplate) {
            return eViewport.current != null && eContainer.current != null;
        }
        return eContainer.current != null;
    }, []);
    const areElementsRemoved = useCallback(() => {
        if (centerTemplate) {
            return eViewport.current == null && eContainer.current == null;
        }
        return eContainer.current == null;
    }, []);
    const setRef = useCallback(() => {
        if (areElementsRemoved()) {
            context.destroyBean(rowContainerCtrlRef.current);
            rowContainerCtrlRef.current = null;
        }
        if (areElementsReady()) {
            const updateRowCtrlsOrdered = (useFlushSync) => {
                agFlushSync(useFlushSync, () => {
                    setRowCtrlsOrdered(prev => getNextValueIfDifferent(prev, rowCtrlsRef.current, domOrderRef.current));
                });
            };
            const compProxy = {
                setViewportHeight: (height) => {
                    if (eViewport.current) {
                        eViewport.current.style.height = height;
                    }
                },
                setRowCtrls: (rowCtrls, useFlushSync) => {
                    const useFlush = useFlushSync && rowCtrlsRef.current.length > 0 && rowCtrls.length > 0;
                    // Keep a record of the rowCtrls in case we need to reset the Dom order.
                    rowCtrlsRef.current = rowCtrls;
                    updateRowCtrlsOrdered(useFlush);
                },
                setDomOrder: domOrder => {
                    if (domOrderRef.current != domOrder) {
                        domOrderRef.current = domOrder;
                        updateRowCtrlsOrdered(false);
                    }
                },
                setContainerWidth: width => {
                    if (eContainer.current) {
                        eContainer.current.style.width = width;
                    }
                }
            };
            rowContainerCtrlRef.current = context.createBean(new RowContainerCtrl(name));
            rowContainerCtrlRef.current.setComp(compProxy, eContainer.current, eViewport.current);
        }
    }, [areElementsReady, areElementsRemoved]);
    const setContainerRef = useCallback((e) => { eContainer.current = e; setRef(); }, [setRef]);
    const setViewportRef = useCallback((e) => { eViewport.current = e; setRef(); }, [setRef]);
    const buildContainer = () => (React.createElement("div", { className: containerClasses, ref: setContainerRef, role: rowCtrlsOrdered.length ? "rowgroup" : "presentation" }, rowCtrlsOrdered.map(rowCtrl => React.createElement(RowComp, { rowCtrl: rowCtrl, containerType: containerType, key: rowCtrl.getInstanceId() }))));
    return (React.createElement(React.Fragment, null, centerTemplate ?
        React.createElement("div", { className: viewportClasses, ref: setViewportRef, role: "presentation" }, buildContainer()) :
        buildContainer()));
};
export default memo(RowContainerComp);
