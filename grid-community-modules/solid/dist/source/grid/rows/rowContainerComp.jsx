import { getRowContainerTypeForName, RowContainerCtrl, RowContainerName } from '@ag-grid-community/core';
import { createEffect, createMemo, createSignal, For, onCleanup, onMount, useContext } from "solid-js";
import { BeansContext } from '../core/beansContext';
import { classesList } from '../core/utils';
import RowComp from './rowComp';
const RowContainerComp = (props) => {
    const { context } = useContext(BeansContext);
    const [viewportHeight, setViewportHeight] = createSignal('');
    const [rowCtrlsOrdered, setRowCtrlsOrdered] = createSignal([]);
    const [rowCtrls, setRowCtrls] = createSignal([]);
    const [domOrder, setDomOrder] = createSignal(false);
    const { name } = props;
    const containerType = createMemo(() => getRowContainerTypeForName(name));
    let eViewport;
    let eContainer;
    const cssClasses = createMemo(() => RowContainerCtrl.getRowContainerCssClasses(name));
    const viewportClasses = createMemo(() => classesList(cssClasses().viewport));
    const containerClasses = createMemo(() => classesList(cssClasses().container));
    // no need to useMemo for boolean types
    const centerTemplate = name === RowContainerName.CENTER
        || name === RowContainerName.TOP_CENTER
        || name === RowContainerName.BOTTOM_CENTER
        || name === RowContainerName.STICKY_TOP_CENTER;
    // if domOrder=true, then we just copy rowCtrls into rowCtrlsOrdered observing order,
    // however if false, then we need to keep the order as they are in the dom, otherwise rowAnimation breaks
    let rowCtrlsOrderedCopy = [];
    createEffect(() => {
        if (domOrder()) {
            setRowCtrlsOrdered(rowCtrls());
            return;
        }
        // if dom order not important, we don't want to change the order
        // of the elements in the dom, as this would break transition styles
        // 
        // we use the rowCtrlsOrderedCopy, to avoid this effect depending on and
        // setting the same value, hence causing an infinite loop
        const prev = rowCtrlsOrderedCopy;
        const oldRows = prev.filter(r => rowCtrls().indexOf(r) >= 0);
        const newRows = rowCtrls().filter(r => oldRows.indexOf(r) < 0);
        const next = [...oldRows, ...newRows];
        setRowCtrlsOrdered(next);
        rowCtrlsOrderedCopy = next;
    });
    onMount(() => {
        const compProxy = {
            setViewportHeight: setViewportHeight,
            setRowCtrls: rowCtrls => setRowCtrls(rowCtrls),
            setDomOrder: domOrder => setDomOrder(domOrder),
            setContainerWidth: width => {
                if (eContainer) {
                    eContainer.style.width = width;
                }
            }
        };
        const ctrl = context.createBean(new RowContainerCtrl(name));
        onCleanup(() => context.destroyBean(ctrl));
        ctrl.setComp(compProxy, eContainer, eViewport);
    });
    const viewportStyle = createMemo(() => ({
        height: viewportHeight()
    }));
    const buildContainer = () => (<div class={containerClasses()} ref={eContainer} role={rowCtrls().length ? "rowgroup" : "presentation"}>
                <For each={rowCtrlsOrdered()}>{(rowCtrl, i) => <RowComp rowCtrl={rowCtrl} containerType={containerType()}></RowComp>}</For>
        </div>);
    return (<>
            {centerTemplate ?
            <div class={viewportClasses()} ref={eViewport} role="presentation" style={viewportStyle()}>
                    {buildContainer()}
                </div> :
            buildContainer()}
        </>);
};
export default RowContainerComp;
