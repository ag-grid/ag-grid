import { GridBodyCtrl, IGridBodyComp, RowContainerName } from 'ag-grid-community';
import { createMemo, createSignal, onCleanup, onMount, useContext } from "solid-js";
import { BeansContext } from './core/beansContext';
import { classesList } from './core/utils';
import GridHeaderComp from "./header/gridHeaderComp";
import RowContainerComp from "./rows/rowContainerComp";

const GridBodyComp = ()=> {

    const {context, agStackComponentsRegistry, resizeObserverService} = useContext(BeansContext);

    const [getRowAnimationClass, setRowAnimationClass] = createSignal<string>('');
    const [getAriaColCount, setAriaColCount] = createSignal<number>(0);
    const [getAriaRowCount, setAriaRowCount] = createSignal<number>(0);
    const [getTopHeight, setTopHeight] = createSignal<number>(0);
    const [getBottomHeight, setBottomHeight] = createSignal<number>(0);
    const [getStickyTopHeight, setStickyTopHeight] = createSignal<string>('0px');
    const [getStickyTopTop, setStickyTopTop] = createSignal<string>('0px');
    const [getStickyTopWidth, setStickyTopWidth] = createSignal<string>('100%');
    const [getTopDisplay, setTopDisplay] = createSignal<string>('');
    const [getBottomDisplay, setBottomDisplay] = createSignal<string>('');
    const [getBodyViewportWidth, setBodyViewportWidth] = createSignal<string>('');
    
    const [getMovingCss, setMovingCss] = createSignal<string | null>(null);
    const [getForceVerticalScrollClass, setForceVerticalScrollClass] = createSignal<string | null>(null);
    const [getTopAndBottomOverflowY, setTopAndBottomOverflowY] = createSignal<string>('');
    const [getCellSelectableCss, setCellSelectableCss] = createSignal<string | null>(null);

    // we initialise layoutClass to 'ag-layout-normal', because if we don't, the comp will initially
    // render with no width (as ag-layout-normal sets width to 0, which is needed for flex) which
    // gives the grid a massive width, which then renders a massive amount of columns. this problem
    // is due to React been async, for the non-async version (ie when not using React) this is not a
    // problem as the UI will finish initialising before we set data.
    const [getLayoutClass, setLayoutClass] = createSignal<string>('ag-layout-normal');

    let eRoot: HTMLDivElement;
    let eTop: HTMLDivElement;
    let eStickyTop: HTMLDivElement;
    let eBody: HTMLDivElement;
    let eBodyViewport: HTMLDivElement;
    let eBottom: HTMLDivElement;

    const destroyFuncs: (()=>void)[] = [];
    onCleanup( ()=> {
        destroyFuncs.forEach( f => f() );
        destroyFuncs.length = 0;
    });

    onMount( () => {
        if (!context) { return; }

        const newComp = (tag: string) => {
            const CompClass = agStackComponentsRegistry.getComponentClass(tag);
            const comp = context.createBean(new CompClass());
            onCleanup( ()=> context.destroyBean(comp) );
            return comp;
        };

        eRoot.appendChild(newComp('AG-FAKE-HORIZONTAL-SCROLL').getGui());
        eRoot.appendChild(newComp('AG-OVERLAY-WRAPPER').getGui());
        eBody.appendChild(newComp('AG-FAKE-VERTICAL-SCROLL').getGui());

        const compProxy: IGridBodyComp = {
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
            setBodyViewportWidth: setBodyViewportWidth,

            registerBodyViewportResizeListener: listener => {
                const unsubscribeFromResize = resizeObserverService.observeResize(eBodyViewport!, listener);
                destroyFuncs.push(() => unsubscribeFromResize());
            }
        };

        const ctrl = context.createBean(new GridBodyCtrl());
        onCleanup( ()=> context.destroyBean(ctrl) );

        // fixme - should not be in a timeout,
        // was becusae we need GridHeaderComp to be created first
        setTimeout( ()=> 
            ctrl.setComp(
                compProxy,
                eRoot,
                eBodyViewport,
                eTop,
                eBottom,
                eStickyTop
            ), 0);
    });

    const getRootClasses = createMemo(() =>
        classesList('ag-root','ag-unselectable', getMovingCss(), getLayoutClass())
    );
    const getBodyClasses = createMemo(() => 
        classesList('ag-body', getLayoutClass())
    );
    const getBodyClipperClasses = createMemo(() =>
        classesList('ag-body-clipper', getLayoutClass())
    );
    const getBodyViewportClasses = createMemo(() =>
        classesList('ag-body-viewport', getRowAnimationClass(), getLayoutClass(), getForceVerticalScrollClass(), getCellSelectableCss())
    );
    const getTopClasses = createMemo(() =>
        classesList('ag-floating-top', getCellSelectableCss())
    );
    const getStickyTopClasses = createMemo(() =>
        classesList('ag-sticky-top', getCellSelectableCss())
    );
    const getBottomClasses = createMemo(() =>
        classesList('ag-floating-bottom', getCellSelectableCss())
    );

    const getTopStyle = createMemo(() => ({
        height: getTopHeight,
        'min-height': getTopHeight,
        display: getTopDisplay,
        'overflow-y': (getTopAndBottomOverflowY as any)
    }));

    const getStickyTopStyle = createMemo(() => ({
        height: getStickyTopHeight,
        top: getStickyTopTop,
        width: getStickyTopWidth
    }));

    const getBottomStyle = createMemo(()=> ({
        height: getBottomHeight,
        'min-height': getBottomHeight,
        display: getBottomDisplay,
        'overflow-y': (getTopAndBottomOverflowY as any)
    }));

    const getBodyViewportStyle = createMemo( ()=> ({
        width: getBodyViewportWidth()
    }));

    return (
        <div ref={ eRoot! } class={ getRootClasses() } role="treegrid" aria-colcount={ getAriaColCount() } aria-rowcount={ getAriaRowCount() }>
            <GridHeaderComp/>
            <div ref={ eTop! } class={ getTopClasses() } role="presentation" style={ getTopStyle() }>
                <RowContainerComp name={ RowContainerName.TOP_LEFT } />
                <RowContainerComp name={ RowContainerName.TOP_CENTER } />
                <RowContainerComp name={ RowContainerName.TOP_RIGHT } />
                <RowContainerComp name={ RowContainerName.TOP_FULL_WIDTH } />
            </div>
            <div class={getBodyClasses()} ref={eBody!} role="presentation">
                <div class={getBodyClipperClasses()} role="presentation">
                    <div ref={ eBodyViewport! } class={ getBodyViewportClasses() } role="presentation" style={ getBodyViewportStyle() }>
                        <RowContainerComp name={ RowContainerName.LEFT } />
                        <RowContainerComp name={ RowContainerName.CENTER } />
                        <RowContainerComp name={ RowContainerName.RIGHT } />
                        <RowContainerComp name={ RowContainerName.FULL_WIDTH } />
                    </div>
                </div>
            </div>
            <div ref={ eStickyTop! } class={ getStickyTopClasses() } role="presentation" style={ getStickyTopStyle() }>
                <RowContainerComp name={ RowContainerName.STICKY_TOP_LEFT } />
                <RowContainerComp name={ RowContainerName.STICKY_TOP_CENTER } />
                <RowContainerComp name={ RowContainerName.STICKY_TOP_RIGHT } />
                <RowContainerComp name={ RowContainerName.STICKY_TOP_FULL_WIDTH } />
            </div>
            <div ref={ eBottom! } class={ getBottomClasses() } role="presentation" style={ getBottomStyle() }>
                <RowContainerComp name={ RowContainerName.BOTTOM_LEFT } />
                <RowContainerComp name={ RowContainerName.BOTTOM_CENTER } />
                <RowContainerComp name={ RowContainerName.BOTTOM_RIGHT } />
                <RowContainerComp name={ RowContainerName.BOTTOM_FULL_WIDTH } />
            </div>
        </div>
    );
};

export default GridBodyComp;
