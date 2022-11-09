import { GridBodyCtrl, IGridBodyComp, RowContainerName } from 'ag-grid-community';
import React, { memo, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { BeansContext } from './beansContext';
import GridHeaderComp from './header/gridHeaderComp';
import useReactCommentEffect from './reactComment';
import RowContainerComp from './rows/rowContainerComp';
import { useEffectOnce } from './useEffectOnce';
import { classesList } from './utils';

interface SectionProperties {
    section: React.RefObject<HTMLDivElement>;
    className: string;
    style?: React.CSSProperties;
}

const GridBodyComp = () => {

    const {context, agStackComponentsRegistry, resizeObserverService} = useContext(BeansContext);

    const [rowAnimationClass, setRowAnimationClass] = useState<string>('');
    const [ariaColCount, setAriaColCount] = useState<number>(0);
    const [ariaRowCount, setAriaRowCount] = useState<number>(0);
    const [topHeight, setTopHeight] = useState<number>(0);
    const [bottomHeight, setBottomHeight] = useState<number>(0);
    const [stickyTopHeight, setStickyTopHeight] = useState<string>('0px');
    const [stickyTopTop, setStickyTopTop] = useState<string>('0px');
    const [stickyTopWidth, setStickyTopWidth] = useState<string>('100%');
    const [topDisplay, setTopDisplay] = useState<string>('');
    const [bottomDisplay, setBottomDisplay] = useState<string>('');
    
    const [movingCss, setMovingCss] = useState<string | null>(null);
    const [forceVerticalScrollClass, setForceVerticalScrollClass] = useState<string | null>(null);
    const [topAndBottomOverflowY, setTopAndBottomOverflowY] = useState<string>('');
    const [cellSelectableCss, setCellSelectableCss] = useState<string | null>(null);

    // we initialise layoutClass to 'ag-layout-normal', because if we don't, the comp will initially
    // render with no width (as ag-layout-normal sets width to 0, which is needed for flex) which
    // gives the grid a massive width, which then renders a massive amount of columns. this problem
    // is due to React been async, for the non-async version (ie when not using React) this is not a
    // problem as the UI will finish initialising before we set data.
    const [layoutClass, setLayoutClass] = useState<string>('ag-layout-normal');

    const eRoot = useRef<HTMLDivElement>(null);
    const eTop = useRef<HTMLDivElement>(null);
    const eStickyTop = useRef<HTMLDivElement>(null);
    const eBodyViewport = useRef<HTMLDivElement>(null);
    const eBottom = useRef<HTMLDivElement>(null);

    useReactCommentEffect(' AG Grid Body ', eRoot);
    useReactCommentEffect(' AG Pinned Top ', eTop);
    useReactCommentEffect(' AG Sticky Top ', eStickyTop);
    useReactCommentEffect(' AG Middle ', eBodyViewport);
    useReactCommentEffect(' AG Pinned Bottom ', eBottom);

    useEffectOnce( () => {
        const beansToDestroy: any[] = [];
        const destroyFuncs: (() => void)[] = [];

        if (!context) { return; }

        const newComp = (tag: string) => {
            const CompClass = agStackComponentsRegistry.getComponentClass(tag);
            const comp = context.createBean(new CompClass());
            beansToDestroy.push(comp);
            return comp;
        };

        eRoot.current!.appendChild(document.createComment(' AG Fake Horizontal Scroll '));
        eRoot.current!.appendChild(newComp('AG-FAKE-HORIZONTAL-SCROLL').getGui());

        eRoot.current!.appendChild(document.createComment(' AG Overlay Wrapper '));
        eRoot.current!.appendChild(newComp('AG-OVERLAY-WRAPPER').getGui());

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

            registerBodyViewportResizeListener: listener => {
                const unsubscribeFromResize = resizeObserverService.observeResize(eBodyViewport.current!, listener);
                destroyFuncs.push(() => unsubscribeFromResize());
            }
        };

        const ctrl = context.createBean(new GridBodyCtrl());
        beansToDestroy.push(ctrl);
        ctrl.setComp(
            compProxy,
            eRoot.current!,
            eBodyViewport.current!,
            eTop.current!,
            eBottom.current!,
            eStickyTop.current!
        );

        return () => {
            context.destroyBeans(beansToDestroy);
            destroyFuncs.forEach(f => f());
        };

    });

    const rootClasses = useMemo(() =>
        classesList('ag-root','ag-unselectable', movingCss, layoutClass), 
        [movingCss, layoutClass]
    );
    const bodyViewportClasses = useMemo(() =>
        classesList('ag-body-viewport', rowAnimationClass, layoutClass, forceVerticalScrollClass, cellSelectableCss), 
        [rowAnimationClass, layoutClass, forceVerticalScrollClass, cellSelectableCss]
    );
    const topClasses = useMemo(() =>
        classesList('ag-floating-top', cellSelectableCss), 
        [cellSelectableCss]
    );
    const stickyTopClasses = useMemo(() =>
        classesList('ag-sticky-top', cellSelectableCss), 
        [cellSelectableCss]
    );
    const bottomClasses = useMemo(() =>
        classesList('ag-floating-bottom', cellSelectableCss),
        [cellSelectableCss]
    );

    const topStyle: React.CSSProperties = useMemo(() => ({
        height: topHeight,
        minHeight: topHeight,
        display: topDisplay,
        overflowY: (topAndBottomOverflowY as any)
    }), [topHeight, topDisplay, topAndBottomOverflowY]);

    const stickyTopStyle: React.CSSProperties = useMemo(() => ({
        height: stickyTopHeight,
        top: stickyTopTop,
        width: stickyTopWidth
    }), [stickyTopHeight, stickyTopTop, stickyTopWidth]);

    const bottomStyle: React.CSSProperties = useMemo(()=> ({
        height: bottomHeight,
        minHeight: bottomHeight,
        display: bottomDisplay,
        overflowY: (topAndBottomOverflowY as any)
    }), [bottomHeight, bottomDisplay, topAndBottomOverflowY]);

    const createRowContainer = (container: RowContainerName) => <RowContainerComp name={ container } key={`${container}-container`} />;
    const createSection = ({
        section,
        children,
        className,
        style
    }: SectionProperties & { children: RowContainerName[] }) => (
        <div ref={ section } className={ className } role="presentation" style={ style }>
            { children.map(createRowContainer) }
        </div>
    );

    return (
        <div ref={ eRoot } className={ rootClasses } role="treegrid" aria-colcount={ ariaColCount } aria-rowcount={ ariaRowCount }>
            <GridHeaderComp/>
            { createSection({ section: eTop, className: topClasses, style: topStyle, children: [
                RowContainerName.TOP_LEFT,
                RowContainerName.TOP_CENTER,
                RowContainerName.TOP_RIGHT,
                RowContainerName.TOP_FULL_WIDTH,
            ]}) }
            { createSection({ section: eBodyViewport, className: bodyViewportClasses, children: [
                RowContainerName.LEFT,
                RowContainerName.CENTER,
                RowContainerName.RIGHT,
                RowContainerName.FULL_WIDTH,
            ]}) }
            { createSection({ section: eStickyTop, className: stickyTopClasses, style: stickyTopStyle, children: [
                RowContainerName.STICKY_TOP_LEFT,
                RowContainerName.STICKY_TOP_CENTER,
                RowContainerName.STICKY_TOP_RIGHT,
                RowContainerName.STICKY_TOP_FULL_WIDTH,
            ]}) }
            { createSection({ section: eBottom, className: bottomClasses, style: bottomStyle, children: [
                RowContainerName.BOTTOM_LEFT,
                RowContainerName.BOTTOM_CENTER,
                RowContainerName.BOTTOM_RIGHT,
                RowContainerName.BOTTOM_FULL_WIDTH,
            ]}) }
        </div>
    );
};

export default memo(GridBodyComp);
