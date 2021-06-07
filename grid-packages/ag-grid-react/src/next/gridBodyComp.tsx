import React, { useEffect, useRef, useState } from "react";
import {
    AgStackComponentsRegistry,
    Component,
    Context,
    GridBodyCtrl,
    IGridBodyComp,
    ResizeObserverService,
    RowContainerComp as AgStackRowContainerComp,
    RowContainerName
} from "ag-grid-community";
import { classesList } from "./utils";
import { RowContainerComp } from "./rowContainerComp";

export function GridBodyComp(params: {context: Context}) {

    const {context} = params;

    const [rowAnimationClass, setRowAnimationClass] = useState<string>('');
    const [ariaColCount, setAriaColCount] = useState<number>(0);
    const [ariaRowCount, setAriaRowCount] = useState<number>(0);
    const [topHeight, setTopHeight] = useState<number>(0);
    const [bottomHeight, setBottomHeight] = useState<number>(0);
    const [topDisplay, setTopDisplay] = useState<string>('');
    const [bottomDisplay, setBottomDisplay] = useState<string>('');
    const [movingCss, setMovingCss] = useState<string | null>(null);
    const [layoutClass, setLayoutClass] = useState<string>('');
    const [forceVerticalScrollClass, setForceVerticalScrollClass] = useState<string | null>(null);
    const [topAndBottomOverflowY, setTopAndBottomOverflowY] = useState<string>('');
    const [cellSelectableCss, setCellSelectableCss] = useState<string | null>(null);

    const eRoot = useRef<HTMLDivElement>(null);
    const eTop = useRef<HTMLDivElement>(null);
    const eBodyViewport = useRef<HTMLDivElement>(null);
    const eBottom = useRef<HTMLDivElement>(null);

    // should be shared
    const insertFirstPosition = (parent: HTMLElement, child: HTMLElement) => parent.insertBefore(child, parent.firstChild);

    useEffect(()=> {
        const beansToDestroy: any[] = [];
        const destroyFuncs: (()=>void)[] = [];

        const agStackComponentsRegistry: AgStackComponentsRegistry = context.getBean('agStackComponentsRegistry');
        const newComp = (tag: string) => {
            const CompClass = agStackComponentsRegistry.getComponentClass(tag);
            const comp = context.createBean(new CompClass());
            beansToDestroy.push(comp);
            return comp;
        };

        insertFirstPosition(eRoot.current!, newComp('AG-HEADER-ROOT').getGui());

        eRoot.current!.appendChild(newComp('AG-FAKE-HORIZONTAL-SCROLL').getGui())
        eRoot.current!.appendChild(newComp('AG-OVERLAY-WRAPPER').getGui())

        const addRowContainer = (parent: HTMLElement, name: RowContainerName) => {
            Component.elementGettingCreated = { getAttribute: ()=> name };

            const comp = context.createBean(new AgStackRowContainerComp());
            beansToDestroy.push(comp);
            parent.appendChild(comp.getGui());
        };

        addRowContainer(eTop.current!, RowContainerName.TOP_LEFT);
        addRowContainer(eTop.current!, RowContainerName.TOP_CENTER);
        addRowContainer(eTop.current!, RowContainerName.TOP_RIGHT);
        addRowContainer(eTop.current!, RowContainerName.TOP_FULL_WITH);

        // addRowContainer(eBodyViewport.current!, RowContainerName.LEFT);
        // addRowContainer(eBodyViewport.current!, RowContainerName.CENTER);
        // addRowContainer(eBodyViewport.current!, RowContainerName.RIGHT);
        // addRowContainer(eBodyViewport.current!, RowContainerName.FULL_WIDTH);

        addRowContainer(eBottom.current!, RowContainerName.BOTTOM_LEFT);
        addRowContainer(eBottom.current!, RowContainerName.BOTTOM_CENTER);
        addRowContainer(eBottom.current!, RowContainerName.BOTTOM_RIGHT);
        addRowContainer(eBottom.current!, RowContainerName.BOTTOM_FULL_WITH);

        const resizeObserverService = context.getBean('resizeObserverService') as ResizeObserverService;

        const compProxy: IGridBodyComp = {
            setRowAnimationCssOnBodyViewport: setRowAnimationClass,
            setColumnCount: setAriaColCount,
            setRowCount: setAriaRowCount,
            setTopHeight: setTopHeight,
            setBottomHeight: setBottomHeight,
            setTopDisplay: setTopDisplay,
            setBottomDisplay: setBottomDisplay,
            setColumnMovingCss: setMovingCss,
            updateLayoutClasses: setLayoutClass,
            setAlwaysVerticalScrollClass: setForceVerticalScrollClass,
            setPinnedTopBottomOverflowY: setTopAndBottomOverflowY,
            setCellSelectableCss: setCellSelectableCss,

            registerBodyViewportResizeListener: listener => {
                const unsubscribeFromResize = resizeObserverService.observeResize(eBodyViewport.current!, listener);
                destroyFuncs.push(() => unsubscribeFromResize());
            }
        };

        const ctrl = context.createBean(new GridBodyCtrl());
        beansToDestroy.push(ctrl);
        ctrl.setComp(compProxy, eRoot.current!, eBodyViewport.current!, eTop.current!, eBottom.current!);

        return ()=> {
            beansToDestroy.forEach( b => context.destroyBean(b) );
            destroyFuncs.forEach( f => f() );
        };

    }, []);

    const rootClasses = classesList('ag-root','ag-unselectable', movingCss, layoutClass);
    const topClasses = classesList('ag-floating-top', cellSelectableCss);
    const bodyViewportClasses = classesList('ag-body-viewport', rowAnimationClass, layoutClass, forceVerticalScrollClass, cellSelectableCss);
    const bottomClasses = classesList('ag-floating-bottom', cellSelectableCss);

    const topStyle = {
        height: topHeight,
        minHeight: topHeight,
        display: topDisplay,
        "overflow-y": topAndBottomOverflowY
    };

    const bottomStyle = {
        height: bottomHeight,
        minHeight: bottomHeight,
        display: bottomDisplay,
        "overflow-y": topAndBottomOverflowY
    };

    return (
        <div ref={eRoot} className={rootClasses} role="grid" unselectable="on" aria-colcount={ariaColCount} aria-rowcount={ariaRowCount}>
            <div className={topClasses} ref={eTop} role="presentation" unselectable="on" style={topStyle}>
            </div>
            <div className={bodyViewportClasses} ref={eBodyViewport} role="presentation">
                <RowContainerComp context={context} name={RowContainerName.LEFT}/>
                <RowContainerComp context={context} name={RowContainerName.CENTER}/>
                <RowContainerComp context={context} name={RowContainerName.RIGHT}/>
                <RowContainerComp context={context} name={RowContainerName.FULL_WIDTH}/>
            </div>
            <div className={bottomClasses} ref={eBottom} role="presentation" unselectable="on" style={bottomStyle}>
            </div>
        </div>
    );
}
