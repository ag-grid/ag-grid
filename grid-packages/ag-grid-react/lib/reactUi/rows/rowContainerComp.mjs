// ag-grid-react v30.0.4
import { getRowContainerTypeForName, RowContainerCtrl, RowContainerName } from 'ag-grid-community';
import React, { useMemo, useRef, useState, memo, useContext } from 'react';
import { classesList, agFlushSync } from '../utils.mjs';
import useReactCommentEffect from '../reactComment.mjs';
import RowComp from './rowComp.mjs';
import { BeansContext } from '../beansContext.mjs';
import { useLayoutEffectOnce } from '../useEffectOnce.mjs';
const RowContainerComp = (params) => {
    const { context } = useContext(BeansContext);
    const [rowCtrlsOrdered, setRowCtrlsOrdered] = useState([]);
    const { name } = params;
    const containerType = useMemo(() => getRowContainerTypeForName(name), [name]);
    const eWrapper = useRef(null);
    const eViewport = useRef(null);
    const eContainer = useRef(null);
    const rowCtrlsRef = useRef([]);
    const domOrderRef = useRef(false);
    const cssClasses = useMemo(() => RowContainerCtrl.getRowContainerCssClasses(name), [name]);
    const wrapperClasses = useMemo(() => classesList(cssClasses.wrapper), []);
    const viewportClasses = useMemo(() => classesList(cssClasses.viewport), []);
    const containerClasses = useMemo(() => classesList(cssClasses.container), []);
    // no need to useMemo for boolean types
    const template1 = name === RowContainerName.CENTER;
    const template2 = name === RowContainerName.TOP_CENTER
        || name === RowContainerName.BOTTOM_CENTER
        || name === RowContainerName.STICKY_TOP_CENTER;
    const template3 = !template1 && !template2;
    const topLevelRef = template1 ? eWrapper : template2 ? eViewport : eContainer;
    useReactCommentEffect(' AG Row Container ' + name + ' ', topLevelRef);
    // if domOrder=true, then we just copy rowCtrls into rowCtrlsOrdered observing order,
    // however if false, then we need to keep the order as they are in the dom, otherwise rowAnimation breaks
    function updateRowCtrlsOrdered(useFlushSync) {
        agFlushSync(useFlushSync, () => {
            setRowCtrlsOrdered(prev => {
                const rowCtrls = rowCtrlsRef.current;
                if (domOrderRef.current) {
                    return rowCtrls;
                }
                // if dom order not important, we don't want to change the order
                // of the elements in the dom, as this would break transition styles
                const oldRows = prev.filter(r => rowCtrls.indexOf(r) >= 0);
                const newRows = rowCtrls.filter(r => oldRows.indexOf(r) < 0);
                return [...oldRows, ...newRows];
            });
        });
    }
    useLayoutEffectOnce(() => {
        const beansToDestroy = [];
        const compProxy = {
            setViewportHeight: (height) => {
                if (eViewport.current) {
                    eViewport.current.style.height = height;
                }
            },
            setRowCtrls: (rowCtrls, useFlushSync) => {
                if (rowCtrlsRef.current !== rowCtrls) {
                    const useFlush = useFlushSync && rowCtrlsRef.current.length > 0 && rowCtrls.length > 0;
                    rowCtrlsRef.current = rowCtrls;
                    updateRowCtrlsOrdered(useFlush);
                }
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
        const ctrl = context.createBean(new RowContainerCtrl(name));
        beansToDestroy.push(ctrl);
        ctrl.setComp(compProxy, eContainer.current, eViewport.current, eWrapper.current);
        return () => {
            context.destroyBeans(beansToDestroy);
        };
    });
    const buildContainer = () => (React.createElement("div", { className: containerClasses, ref: eContainer, role: rowCtrlsOrdered.length ? "rowgroup" : "presentation" }, rowCtrlsOrdered.map(rowCtrl => React.createElement(RowComp, { rowCtrl: rowCtrl, containerType: containerType, key: rowCtrl.getInstanceId() }))));
    return (React.createElement(React.Fragment, null,
        template1 &&
            React.createElement("div", { className: wrapperClasses, ref: eWrapper, role: "presentation" },
                React.createElement("div", { className: viewportClasses, ref: eViewport, role: "presentation" }, buildContainer())),
        template2 &&
            React.createElement("div", { className: viewportClasses, ref: eViewport, role: "presentation" }, buildContainer()),
        template3 && buildContainer()));
};
export default memo(RowContainerComp);
