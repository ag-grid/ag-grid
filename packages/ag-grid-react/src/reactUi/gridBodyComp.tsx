import { CssClassManager, _setAriaColCount, _setAriaMultiSelectable, _setAriaRole, _setAriaRowCount } from 'ag-stack';
import React, { memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import type { ComponentSelector, IGridBodyComp, VerticalSection, VerticalSectionMap } from 'ag-grid-community';
import {
    FakeHScrollComp,
    FakeVScrollComp,
    GridBodyCtrl,
    _isCellSelectionEnabled,
    _isMultiRowSelection,
} from 'ag-grid-community';

import { BeansContext } from './beansContext';
import GridHeaderComp from './header/gridHeaderComp';
import useReactCommentEffect from './reactComment';
import RowContainerComp from './rows/rowContainerComp';
import { classesList } from './utils';

type PinnedSectionState = { height: number; invisible: boolean };

const GridBodyComp = () => {
    const { context, gos, overlays, rangeSvc } = useContext(BeansContext);

    const [rowAnimationClass, setRowAnimationClass] = useState<string>('');
    const [pinnedSections, setPinnedSections] = useState<VerticalSectionMap<PinnedSectionState>>({
        top: { height: 0, invisible: true },
        bottom: { height: 0, invisible: true },
    });
    const [stickyBottomHeight, setStickyBottomHeight] = useState<string>('0px');
    const [stickyBottomWidth, setStickyBottomWidth] = useState<string>('100%');
    const [cellSelectableCss, setCellSelectableCss] = useState<string | null>(null);
    const [preventRowAnimationClass, setPreventRowAnimationClass] = useState<string | null>(null);

    // we initialise layoutClass to 'ag-layout-normal', because if we don't, the comp will initially
    // render with no width (as ag-layout-normal sets width to 0, which is needed for flex) which
    // gives the grid a massive width, which then renders a massive amount of columns. this problem
    // is due to React been async, for the non-async version (ie when not using React) this is not a
    // problem as the UI will finish initialising before we set data.
    const [layoutClass, setLayoutClass] = useState<string>('ag-layout-normal');

    const cssManager = useRef<CssClassManager>();
    if (!cssManager.current) {
        cssManager.current = new CssClassManager(() => eRoot.current);
    }

    const eRoot = useRef<HTMLDivElement | null>(null);
    const [rootElement, setRootElement] = useState<HTMLDivElement | null>(null);
    const eTop = useRef<HTMLDivElement | null>(null);
    const [topElement, setTopElement] = useState<HTMLDivElement | null>(null);
    const eGridViewport = useRef<HTMLDivElement | null>(null);
    const [gridViewportElement, setGridViewportElement] = useState<HTMLDivElement | null>(null);
    const eGridScrollableArea = useRef<HTMLDivElement | null>(null);
    const eBody = useRef<HTMLDivElement | null>(null);
    const eBottom = useRef<HTMLDivElement | null>(null);
    const eTopExtraRows = useRef<HTMLDivElement | null>(null);

    useReactCommentEffect(' AG Grid Body ', eRoot);
    useReactCommentEffect(' AG Pinned Top ', eTop);
    useReactCommentEffect(' AG Middle ', eGridViewport);
    useReactCommentEffect(' AG Pinned Bottom ', eBottom);

    const setRootRef = useCallback((eRef: HTMLDivElement | null) => {
        eRoot.current = eRef;
        setRootElement(eRef);
    }, []);

    const setPinnedSection = useCallback((section: VerticalSection, state: PinnedSectionState) => {
        setPinnedSections((prev) => {
            const current = prev[section];
            if (current.height === state.height && current.invisible === state.invisible) {
                return prev;
            }
            return { ...prev, [section]: state };
        });
    }, []);

    useEffect(() => {
        if (
            !rootElement ||
            context.isDestroyed() ||
            !eGridViewport.current ||
            !eBody.current ||
            !eTop.current ||
            !eBottom.current ||
            !eTopExtraRows.current
        ) {
            return;
        }

        const beansToDestroy: any[] = [];
        const destroyFuncs: (() => void)[] = [];

        const attachToDom = (eParent: HTMLElement, eChild: HTMLElement | Comment) => {
            eParent.appendChild(eChild);
            destroyFuncs.push(() => eChild.remove());
        };
        const newComp = (compClass: ComponentSelector['component']) => {
            const comp = context.createBean(new compClass());
            beansToDestroy.push(comp);
            return comp;
        };
        const addComp = (eParent: HTMLElement, compClass: ComponentSelector['component'], comment: string) => {
            attachToDom(eParent, document.createComment(comment));
            attachToDom(eParent, newComp(compClass).getGui());
        };

        addComp(rootElement, FakeHScrollComp, ' AG Fake Horizontal Scroll ');
        addComp(rootElement, FakeVScrollComp, ' AG Fake Vertical Scroll ');
        const overlayComp = overlays?.getOverlayWrapperCompClass();
        if (overlayComp) {
            addComp(rootElement, overlayComp, ' AG Overlay Wrapper ');
        }

        const compProxy: IGridBodyComp = {
            setColumnCount: (count: number) => {
                if (eGridViewport.current) {
                    _setAriaColCount(eGridViewport.current, count);
                }
            },
            setRowCount: (count: number) => {
                if (eGridViewport.current) {
                    _setAriaRowCount(eGridViewport.current, count);
                }
            },
            setPinnedSection,
            setColumnMovingCss: (cssClass: string, flag: boolean) => cssManager.current!.toggleCss(cssClass, flag),
            updateLayoutClasses: setLayoutClass,
            setCellSelectableCss: (cssClass: string | null, flag: boolean) =>
                setCellSelectableCss(flag ? cssClass : null),
            setRowAnimationCssOnScrollableArea: (animate: boolean) =>
                setRowAnimationClass(animate ? 'ag-row-animation' : 'ag-row-no-animation'),
            setPreventRowAnimationCssOnContainers: (prevent: boolean) =>
                setPreventRowAnimationClass(prevent ? 'ag-prevent-animation' : null),
            setGridScrollableAreaWidth: (width: string) => {
                if (eGridScrollableArea.current) {
                    eGridScrollableArea.current.style.width = width;
                }
            },
            setStickyBottomHeight,
            setStickyBottomWidth,
            setGridRole: (role: 'grid' | 'treegrid') => {
                if (eGridViewport.current) {
                    _setAriaRole(eGridViewport.current, role);
                }
            },
        };

        const ctrl = context.createBean(new GridBodyCtrl());
        beansToDestroy.push(ctrl);
        ctrl.setComp(
            compProxy,
            rootElement,
            eGridViewport.current,
            eBody.current,
            eTop.current,
            eTopExtraRows.current,
            eBottom.current
        );

        if (eGridViewport.current && ((rangeSvc && _isCellSelectionEnabled(gos)) || _isMultiRowSelection(gos))) {
            _setAriaMultiSelectable(eGridViewport.current, true);
        }

        return () => {
            context.destroyBeans(beansToDestroy);
            for (const f of destroyFuncs) {
                f();
            }
        };
    }, [context, gos, overlays, rangeSvc, rootElement]);

    const rootClasses = useMemo(() => classesList('ag-root', 'ag-unselectable', layoutClass), [layoutClass]);
    const gridViewportClasses = useMemo(() => classesList('ag-grid-viewport', layoutClass), [layoutClass]);
    const bodyClasses = useMemo(
        () => classesList('ag-grid-scrolling-rows', layoutClass, cellSelectableCss),
        [layoutClass, cellSelectableCss]
    );
    const topSection = pinnedSections.top;
    const bottomSection = pinnedSections.bottom;
    const topClasses = useMemo(
        () => classesList('ag-grid-pinned-top-rows', cellSelectableCss),
        [cellSelectableCss, topSection.invisible]
    );
    const stickyBottomHeightNumber = Number.parseFloat(stickyBottomHeight) || 0;
    const bottomSectionHidden = bottomSection.height <= 0 && stickyBottomHeightNumber <= 0;

    const scrollableClasses = useMemo(
        () =>
            classesList(
                'ag-grid-scrollable-area',
                topSection.invisible ? null : 'ag-has-top-pinned-rows',
                bottomSection.invisible ? null : 'ag-has-bottom-pinned-rows'
            ),
        [bottomSection.invisible, topSection.invisible]
    );
    const bottomClasses = useMemo(
        () => classesList('ag-grid-pinned-bottom-rows', bottomSectionHidden ? 'ag-hidden' : null, cellSelectableCss),
        [bottomSection.invisible, bottomSectionHidden, cellSelectableCss]
    );
    const rowAnimationContainerClass = useMemo(
        () => classesList(rowAnimationClass, preventRowAnimationClass),
        [preventRowAnimationClass, rowAnimationClass]
    );

    const topStyle: React.CSSProperties = useMemo(() => {
        const topRowsHeight = `${topSection.height}px`;
        const topSectionHeight = `calc(var(--ag-header-rows-height, 0px) + ${topRowsHeight})`;
        return {
            '--ag-top-rows-height': topRowsHeight,
            minHeight: topSectionHeight,
            height: topSectionHeight,
        } as React.CSSProperties;
    }, [topSection.height]);

    const bottomStyle: React.CSSProperties = useMemo(
        () =>
            ({
                '--ag-bottom-rows-height': `${bottomSection.height}px`,
                height: `calc(${bottomSection.height}px + ${stickyBottomHeight})`,
                minHeight: `calc(${bottomSection.height}px + ${stickyBottomHeight})`,
                width: stickyBottomWidth,
            }) as React.CSSProperties,
        [bottomSection.height, stickyBottomHeight, stickyBottomWidth]
    );

    const setTopRef = useCallback((el: HTMLDivElement | null) => {
        eTop.current = el;
        setTopElement(el);
    }, []);

    const setGridViewportRef = useCallback((el: HTMLDivElement | null) => {
        eGridViewport.current = el;
        setGridViewportElement(el);
    }, []);

    return (
        <div ref={setRootRef} className={rootClasses} role="presentation">
            <div ref={setGridViewportRef} className={gridViewportClasses} role="presentation">
                <div ref={eGridScrollableArea} className={scrollableClasses} role="rowgroup">
                    <div ref={setTopRef} className={topClasses} role="presentation" style={topStyle}>
                        {topElement && gridViewportElement && (
                            <GridHeaderComp eTopSection={topElement} eGridViewport={gridViewportElement} />
                        )}
                        <div ref={eTopExtraRows} className="ag-extra-rows-container" role="presentation" />
                        <RowContainerComp
                            name="pinnedTop"
                            viewportElement={gridViewportElement}
                            extraClassName={rowAnimationContainerClass}
                        />
                        <RowContainerComp name="stickyTop" viewportElement={gridViewportElement} />
                    </div>
                    <div className={bodyClasses} ref={eBody} role="presentation">
                        <RowContainerComp
                            name="scrolling"
                            viewportElement={gridViewportElement}
                            extraClassName={rowAnimationContainerClass}
                        />
                    </div>
                    <div className={bottomClasses} ref={eBottom} role="presentation" style={bottomStyle}>
                        <RowContainerComp name="stickyBottom" viewportElement={gridViewportElement} />
                        <RowContainerComp
                            name="pinnedBottom"
                            viewportElement={gridViewportElement}
                            extraClassName={rowAnimationContainerClass}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(GridBodyComp);
