import React, { memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import type { ComponentSelector, IGridBodyComp } from 'ag-grid-community';
import {
    CssClassManager,
    FakeHScrollComp,
    FakeVScrollComp,
    GridBodyCtrl,
    _isCellSelectionEnabled,
    _isMultiRowSelection,
    _setAriaColCount,
    _setAriaMultiSelectable,
    _setAriaRole,
    _setAriaRowCount,
} from 'ag-grid-community';

import { BeansContext } from './beansContext';
import useReactCommentEffect from './reactComment';
import RowContainerComp from './rows/rowContainerComp';
import type { ReactRowContainerName } from './rows/rowContainerComp';
import { classesList } from './utils';

type PinnedSection = 'top' | 'bottom';
type PinnedSectionState = { height: number; invisible: boolean };

const GridBodyComp = () => {
    const { context, gos, overlays, rangeSvc } = useContext(BeansContext);

    const [rowAnimationClass, setRowAnimationClass] = useState<string>('');
    const [pinnedSections, setPinnedSections] = useState<Record<PinnedSection, PinnedSectionState>>({
        top: { height: 0, invisible: true },
        bottom: { height: 0, invisible: true },
    });
    const [stickyBottomHeight, setStickyBottomHeight] = useState<string>('0px');
    const [stickyBottomWidth, setStickyBottomWidth] = useState<string>('100%');
    const [forceVerticalScrollClass, setForceVerticalScrollClass] = useState<string | null>(null);
    const [cellSelectableCss, setCellSelectableCss] = useState<string | null>(null);

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
    const eGridViewport = useRef<HTMLDivElement | null>(null);
    const [gridViewportElement, setGridViewportElement] = useState<HTMLDivElement | null>(null);
    const eGridScrollableArea = useRef<HTMLDivElement | null>(null);
    const eBody = useRef<HTMLDivElement | null>(null);
    const eBottom = useRef<HTMLDivElement | null>(null);
    const [topRowsHost, setTopRowsHost] = useState<HTMLDivElement | null>(null);
    const [topRowsFullWidthHost, setTopRowsFullWidthHost] = useState<HTMLDivElement | null>(null);
    const [bottomRowsHost, setBottomRowsHost] = useState<HTMLDivElement | null>(null);
    const [bottomRowsFullWidthHost, setBottomRowsFullWidthHost] = useState<HTMLDivElement | null>(null);
    const [scrollingFullWidthContainer, setScrollingFullWidthContainer] = useState<HTMLDivElement | null>(null);

    useReactCommentEffect(' AG Grid Body ', eRoot);
    useReactCommentEffect(' AG Pinned Top ', eTop);
    useReactCommentEffect(' AG Middle ', eGridViewport);
    useReactCommentEffect(' AG Pinned Bottom ', eBottom);

    const setRootRef = useCallback((eRef: HTMLDivElement | null) => {
        eRoot.current = eRef;
        setRootElement(eRef);
    }, []);

    const setPinnedSection = useCallback((section: PinnedSection, state: PinnedSectionState) => {
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
            !scrollingFullWidthContainer ||
            context.isDestroyed() ||
            !eGridViewport.current ||
            !eBody.current ||
            !eTop.current ||
            !eBottom.current ||
            !topRowsHost ||
            !topRowsFullWidthHost ||
            !bottomRowsHost ||
            !bottomRowsFullWidthHost
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
            setRowAnimationCssOnBodyViewport: setRowAnimationClass,
            setColumnCount: (count: number) => {
                if (eRoot.current) {
                    _setAriaColCount(eRoot.current, count);
                }
            },
            setRowCount: (count: number) => {
                if (eRoot.current) {
                    _setAriaRowCount(eRoot.current, count);
                }
            },
            setPinnedSection,
            setColumnMovingCss: (cssClass: string, flag: boolean) => cssManager.current!.toggleCss(cssClass, flag),
            updateLayoutClasses: setLayoutClass,
            setAlwaysVerticalScrollClass: setForceVerticalScrollClass,
            setCellSelectableCss: (cssClass: string | null, flag: boolean) =>
                setCellSelectableCss(flag ? cssClass : null),
            setGridScrollableAreaWidth: (width: string) => {
                if (eGridScrollableArea.current) {
                    eGridScrollableArea.current.style.width = width;
                }
            },
            setStickyBottomHeight,
            setStickyBottomWidth,
            setGridRootRole: (role: 'grid' | 'treegrid') => _setAriaRole(rootElement, role),
        };

        const ctrl = context.createBean(new GridBodyCtrl());
        beansToDestroy.push(ctrl);
        ctrl.setComp(
            compProxy,
            rootElement,
            eGridViewport.current,
            eBody.current,
            topRowsHost,
            topRowsFullWidthHost,
            eTop.current,
            bottomRowsHost,
            bottomRowsFullWidthHost,
            eBottom.current
        );

        if ((rangeSvc && _isCellSelectionEnabled(gos)) || _isMultiRowSelection(gos)) {
            _setAriaMultiSelectable(rootElement, true);
        }

        return () => {
            context.destroyBeans(beansToDestroy);
            for (const f of destroyFuncs) {
                f();
            }
        };
    }, [
        context,
        gos,
        overlays,
        rangeSvc,
        rootElement,
        scrollingFullWidthContainer,
        topRowsHost,
        topRowsFullWidthHost,
        bottomRowsHost,
        bottomRowsFullWidthHost,
    ]);

    const rootClasses = useMemo(() => classesList('ag-root', 'ag-unselectable', layoutClass), [layoutClass]);
    const gridViewportClasses = useMemo(
        () => classesList('ag-grid-viewport', layoutClass, forceVerticalScrollClass),
        [layoutClass, forceVerticalScrollClass]
    );
    const bodyClasses = useMemo(
        () => classesList('ag-grid-scrolling-rows', rowAnimationClass, layoutClass, cellSelectableCss),
        [rowAnimationClass, layoutClass, cellSelectableCss]
    );
    const topSection = pinnedSections.top;
    const bottomSection = pinnedSections.bottom;
    const topClasses = useMemo(
        () => classesList('ag-grid-pinned-top-rows', topSection.invisible ? 'ag-no-top-rows' : null, cellSelectableCss),
        [cellSelectableCss, topSection.invisible]
    );
    const stickyBottomHeightNumber = Number.parseFloat(stickyBottomHeight) || 0;
    const bottomSectionInvisible = bottomSection.height <= 0 && stickyBottomHeightNumber <= 0;
    const bottomNoRows = bottomSection.invisible && stickyBottomHeightNumber <= 0;
    const bottomClasses = useMemo(
        () =>
            classesList(
                'ag-grid-pinned-bottom-rows',
                !bottomSection.invisible ? 'ag-has-bottom-pinned-rows' : null,
                bottomNoRows ? 'ag-no-bottom-rows' : null,
                bottomSectionInvisible ? 'ag-invisible' : null,
                cellSelectableCss
            ),
        [bottomSection.invisible, bottomNoRows, bottomSectionInvisible, cellSelectableCss]
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

    const createRowContainer = (container: ReactRowContainerName) => (
        <RowContainerComp
            name={container}
            viewportElement={container === 'scrollingCenter' ? gridViewportElement : undefined}
            onContainerElementChanged={container === 'scrollingFullWidth' ? setScrollingFullWidthContainer : undefined}
            key={`${container}-container`}
        />
    );

    const setGridViewportRef = useCallback((el: HTMLDivElement | null) => {
        eGridViewport.current = el;
        setGridViewportElement(el);
    }, []);

    return (
        <div ref={setRootRef} className={rootClasses}>
            <div ref={setGridViewportRef} className={gridViewportClasses} role="presentation">
                <div ref={eGridScrollableArea} className="ag-grid-scrollable-area" role="presentation">
                    <div ref={eTop} className={topClasses} role="presentation" style={topStyle}>
                        <RowContainerComp
                            name="pinnedTopCenter"
                            viewportElement={gridViewportElement}
                            onContainerElementChanged={setTopRowsHost}
                        />
                        <RowContainerComp
                            name="pinnedTopFullWidth"
                            onContainerElementChanged={setTopRowsFullWidthHost}
                        />
                    </div>
                    <div className={bodyClasses} ref={eBody} role="presentation">
                        {(['scrollingCenter', 'scrollingFullWidth'] as const).map(createRowContainer)}
                    </div>
                    <div className={bottomClasses} ref={eBottom} role="presentation" style={bottomStyle}>
                        <RowContainerComp
                            name="pinnedBottomCenter"
                            viewportElement={gridViewportElement}
                            onContainerElementChanged={setBottomRowsHost}
                        />
                        <RowContainerComp
                            name="pinnedBottomFullWidth"
                            onContainerElementChanged={setBottomRowsFullWidthHost}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(GridBodyComp);
