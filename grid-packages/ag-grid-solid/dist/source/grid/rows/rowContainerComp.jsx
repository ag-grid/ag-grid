import { getRowContainerTypeForName, RowContainerCtrl, RowContainerName } from 'ag-grid-community';
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
    const [containerWidth, setContainerWidth] = createSignal('');
    const { name } = props;
    const containerType = createMemo(() => getRowContainerTypeForName(name));
    let eWrapper;
    let eViewport;
    let eContainer;
    const cssClasses = createMemo(() => RowContainerCtrl.getRowContainerCssClasses(name));
    const wrapperClasses = createMemo(() => classesList(cssClasses().wrapper));
    const viewportClasses = createMemo(() => classesList(cssClasses().viewport));
    const containerClasses = createMemo(() => classesList(cssClasses().container));
    // no need to useMemo for boolean types
    const template1 = name === RowContainerName.CENTER;
    const template2 = name === RowContainerName.TOP_CENTER
        || name === RowContainerName.BOTTOM_CENTER
        || name === RowContainerName.STICKY_TOP_CENTER;
    const template3 = !template1 && !template2;
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
            setContainerWidth: width => setContainerWidth(width)
        };
        const ctrl = context.createBean(new RowContainerCtrl(name));
        onCleanup(() => context.destroyBean(ctrl));
        ctrl.setComp(compProxy, eContainer, eViewport, eWrapper);
    });
    const viewportStyle = createMemo(() => ({
        height: viewportHeight()
    }));
    const containerStyle = createMemo(() => ({
        width: containerWidth()
    }));
    const buildContainer = () => (<div class={containerClasses()} ref={eContainer} role={rowCtrls().length ? "rowgroup" : "presentation"} style={containerStyle()}>
                <For each={rowCtrlsOrdered()}>{(rowCtrl, i) => <RowComp rowCtrl={rowCtrl} containerType={containerType()}></RowComp>}</For>
        </div>);
    return (<>
            {template1 &&
            <div class={wrapperClasses()} ref={eWrapper} role="presentation">
                    <div class={viewportClasses()} ref={eViewport} role="presentation" style={viewportStyle()}>
                        {buildContainer()}
                    </div>
                </div>}
            {template2 &&
            <div class={viewportClasses()} ref={eViewport} role="presentation" style={viewportStyle()}>
                    {buildContainer()}
                </div>}
            {template3 && buildContainer()}
        </>);
};
export default RowContainerComp;
