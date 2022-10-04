import { GridBodyCtrl, RowContainerName } from 'ag-grid-community';
import { createMemo, createSignal, onCleanup, onMount, useContext } from "solid-js";
import { BeansContext } from './core/beansContext';
import { classesList } from './core/utils';
import GridHeaderComp from "./header/gridHeaderComp";
import RowContainerComp from "./rows/rowContainerComp";
const GridBodyComp = () => {
    const { context, agStackComponentsRegistry, resizeObserverService } = useContext(BeansContext);
    const [getRowAnimationClass, setRowAnimationClass] = createSignal('');
    const [getAriaColCount, setAriaColCount] = createSignal(0);
    const [getAriaRowCount, setAriaRowCount] = createSignal(0);
    const [getTopHeight, setTopHeight] = createSignal(0);
    const [getBottomHeight, setBottomHeight] = createSignal(0);
    const [getStickyTopHeight, setStickyTopHeight] = createSignal('0px');
    const [getStickyTopTop, setStickyTopTop] = createSignal('0px');
    const [getStickyTopWidth, setStickyTopWidth] = createSignal('100%');
    const [getTopDisplay, setTopDisplay] = createSignal('');
    const [getBottomDisplay, setBottomDisplay] = createSignal('');
    const [getMovingCss, setMovingCss] = createSignal(null);
    const [getForceVerticalScrollClass, setForceVerticalScrollClass] = createSignal(null);
    const [getTopAndBottomOverflowY, setTopAndBottomOverflowY] = createSignal('');
    const [getCellSelectableCss, setCellSelectableCss] = createSignal(null);
    // we initialise layoutClass to 'ag-layout-normal', because if we don't, the comp will initially
    // render with no width (as ag-layout-normal sets width to 0, which is needed for flex) which
    // gives the grid a massive width, which then renders a massive amount of columns. this problem
    // is due to React been async, for the non-async version (ie when not using React) this is not a
    // problem as the UI will finish initialising before we set data.
    const [getLayoutClass, setLayoutClass] = createSignal('ag-layout-normal');
    let eRoot;
    let eTop;
    let eStickyTop;
    let eBodyViewport;
    let eBottom;
    const destroyFuncs = [];
    onCleanup(() => {
        destroyFuncs.forEach(f => f());
        destroyFuncs.length = 0;
    });
    onMount(() => {
        if (!context) {
            return;
        }
        const newComp = (tag) => {
            const CompClass = agStackComponentsRegistry.getComponentClass(tag);
            const comp = context.createBean(new CompClass());
            onCleanup(() => context.destroyBean(comp));
            return comp;
        };
        eRoot.appendChild(newComp('AG-FAKE-HORIZONTAL-SCROLL').getGui());
        eRoot.appendChild(newComp('AG-OVERLAY-WRAPPER').getGui());
        const compProxy = {
            setRowAnimationCssOnBodyViewport: setRowAnimationClass,
            setColumnCount: setAriaColCount,
            setRowCount: setAriaRowCount,
            setTopHeight,
            setBottomHeight,
            setStickyTopHeight,
            setStickyTopTop,
            setStickyTopWidth,
            setTopDisplay,
            setBottomDisplay,
            setColumnMovingCss: setMovingCss,
            updateLayoutClasses: setLayoutClass,
            setAlwaysVerticalScrollClass: setForceVerticalScrollClass,
            setPinnedTopBottomOverflowY: setTopAndBottomOverflowY,
            setCellSelectableCss: setCellSelectableCss,
            registerBodyViewportResizeListener: listener => {
                const unsubscribeFromResize = resizeObserverService.observeResize(eBodyViewport, listener);
                destroyFuncs.push(() => unsubscribeFromResize());
            }
        };
        const ctrl = context.createBean(new GridBodyCtrl());
        onCleanup(() => context.destroyBean(ctrl));
        // fixme - should not be in a timeout,
        // was becusae we need GridHeaderComp to be created first
        setTimeout(() => ctrl.setComp(compProxy, eRoot, eBodyViewport, eTop, eBottom, eStickyTop), 0);
    });
    const getRootClasses = createMemo(() => classesList('ag-root', 'ag-unselectable', getMovingCss(), getLayoutClass()));
    const getBodyViewportClasses = createMemo(() => classesList('ag-body-viewport', getRowAnimationClass(), getLayoutClass(), getForceVerticalScrollClass(), getCellSelectableCss()));
    const getTopClasses = createMemo(() => classesList('ag-floating-top', getCellSelectableCss()));
    const getStickyTopClasses = createMemo(() => classesList('ag-sticky-top', getCellSelectableCss()));
    const getBottomClasses = createMemo(() => classesList('ag-floating-bottom', getCellSelectableCss()));
    const getTopStyle = createMemo(() => ({
        height: getTopHeight,
        'min-height': getTopHeight,
        display: getTopDisplay,
        'overflow-y': getTopAndBottomOverflowY
    }));
    const getStickyTopStyle = createMemo(() => ({
        height: getStickyTopHeight,
        top: getStickyTopTop,
        width: getStickyTopWidth
    }));
    const getBottomStyle = createMemo(() => ({
        height: getBottomHeight,
        'min-height': getBottomHeight,
        display: getBottomDisplay,
        'overflow-y': getTopAndBottomOverflowY
    }));
    return (<div ref={eRoot} class={getRootClasses()} role="grid" aria-colcount={getAriaColCount()} aria-rowcount={getAriaRowCount()}>
            <GridHeaderComp />
            <div ref={eTop} class={getTopClasses()} role="presentation" style={getTopStyle()}>
                <RowContainerComp name={RowContainerName.TOP_LEFT}/>
                <RowContainerComp name={RowContainerName.TOP_CENTER}/>
                <RowContainerComp name={RowContainerName.TOP_RIGHT}/>
                <RowContainerComp name={RowContainerName.TOP_FULL_WIDTH}/>
            </div>
            <div ref={eBodyViewport} class={getBodyViewportClasses()} role="presentation">
                <RowContainerComp name={RowContainerName.LEFT}/>
                <RowContainerComp name={RowContainerName.CENTER}/>
                <RowContainerComp name={RowContainerName.RIGHT}/>
                <RowContainerComp name={RowContainerName.FULL_WIDTH}/>
            </div>
            <div ref={eStickyTop} class={getStickyTopClasses()} role="presentation" style={getStickyTopStyle()}>
                <RowContainerComp name={RowContainerName.STICKY_TOP_LEFT}/>
                <RowContainerComp name={RowContainerName.STICKY_TOP_CENTER}/>
                <RowContainerComp name={RowContainerName.STICKY_TOP_RIGHT}/>
                <RowContainerComp name={RowContainerName.STICKY_TOP_FULL_WIDTH}/>
            </div>
            <div ref={eBottom} class={getBottomClasses()} role="presentation" style={getBottomStyle()}>
                <RowContainerComp name={RowContainerName.BOTTOM_LEFT}/>
                <RowContainerComp name={RowContainerName.BOTTOM_CENTER}/>
                <RowContainerComp name={RowContainerName.BOTTOM_RIGHT}/>
                <RowContainerComp name={RowContainerName.BOTTOM_FULL_WIDTH}/>
            </div>
        </div>);
};
export default GridBodyComp;
