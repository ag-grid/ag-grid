import React, { useEffect, useRef, useState } from 'react';
import {
    AgStackComponentsRegistry,
    Context,
    GridBodyCtrl,
    IGridBodyComp,
    ResizeObserverService,
    RowContainerName
} from '@ag-grid-community/core';
import { classesList } from './utils';
import RowContainerComp from './rows/rowContainerComp';

interface SectionStyle {
    height: number,
    minHeight: number,
    display: string,
    'overflow-y': string
};

interface SectionProperties {
    section: React.RefObject<HTMLDivElement>, 
    className: string, 
    style?: SectionStyle,
    unselectable?: boolean
}

const GridBodyComp = (params: { context: Context }) => {

    const { context } = params;

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

    useEffect(() => {
        const beansToDestroy: any[] = [];
        const destroyFuncs: (() => void)[] = [];

        if (!context) { return; }

        const agStackComponentsRegistry: AgStackComponentsRegistry = context.getBean('agStackComponentsRegistry');
        const newComp = (tag: string) => {
            const CompClass = agStackComponentsRegistry.getComponentClass(tag);
            const comp = context.createBean(new CompClass());
            beansToDestroy.push(comp);
            return comp;
        };

        insertFirstPosition(eRoot.current!, newComp('AG-HEADER-ROOT').getGui());

        eRoot.current!.appendChild(newComp('AG-FAKE-HORIZONTAL-SCROLL').getGui());
        eRoot.current!.appendChild(newComp('AG-OVERLAY-WRAPPER').getGui());

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

        return () => {
            context.destroyBeans(beansToDestroy);
            destroyFuncs.forEach(f => f());
        };

    }, [context]);

    const rootClasses = classesList('ag-root','ag-unselectable', movingCss, layoutClass);
    const topClasses = classesList('ag-floating-top', cellSelectableCss);
    const bodyViewportClasses = classesList('ag-body-viewport', rowAnimationClass, layoutClass, forceVerticalScrollClass, cellSelectableCss);
    const bottomClasses = classesList('ag-floating-bottom', cellSelectableCss);

    const topStyle: SectionStyle = {
        height: topHeight,
        minHeight: topHeight,
        display: topDisplay,
        'overflow-y': topAndBottomOverflowY
    };

    const bottomStyle: SectionStyle = {
        height: bottomHeight,
        minHeight: bottomHeight,
        display: bottomDisplay,
        'overflow-y': topAndBottomOverflowY
    };

    const createRowContainer = (container: RowContainerName) => <RowContainerComp context={ context } name={ container } key={`${container}-container`} />;
    const createSection = ({
        section, 
        children,
        className, 
        style,
        unselectable
    }: SectionProperties & { children: RowContainerName[] } ) => (
        <div ref={ section } className={ className } role="presentation" style={ style } { ...(unselectable ? { unselectable: 'on'} : {}) }>
            { children.map(createRowContainer) }
        </div>
    );

    return (
        <div ref={ eRoot } className={ rootClasses } role="grid" unselectable="on" aria-colcount={ ariaColCount } aria-rowcount={ ariaRowCount }>
            { createSection({ section: eTop, className: topClasses, style: topStyle, unselectable: true, children: [
                RowContainerName.TOP_LEFT,
                RowContainerName.TOP_CENTER,
                RowContainerName.TOP_RIGHT,
                RowContainerName.TOP_FULL_WITH,
            ]}) }
            { createSection({ section: eBodyViewport, className: bodyViewportClasses, children: [
                RowContainerName.LEFT,
                RowContainerName.CENTER,
                RowContainerName.RIGHT,
                RowContainerName.FULL_WIDTH,
            ]}) }
            { createSection({ section: eBottom, className: bottomClasses, style: bottomStyle, unselectable: true, children: [
                RowContainerName.BOTTOM_LEFT,
                RowContainerName.BOTTOM_CENTER,
                RowContainerName.BOTTOM_RIGHT,
                RowContainerName.BOTTOM_FULL_WITH,
            ]}) }
        </div>
    );
};

export default GridBodyComp;