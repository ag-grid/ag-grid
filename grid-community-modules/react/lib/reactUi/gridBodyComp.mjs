// @ag-grid-community/react v31.0.0
import { CssClassManager, GridBodyCtrl, RowContainerName, _ } from '@ag-grid-community/core';
import React, { memo, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { BeansContext } from './beansContext.mjs';
import GridHeaderComp from './header/gridHeaderComp.mjs';
import useReactCommentEffect from './reactComment.mjs';
import RowContainerComp from './rows/rowContainerComp.mjs';
import { classesList } from './utils.mjs';
const GridBodyComp = () => {
    const { context, agStackComponentsRegistry, resizeObserverService } = useContext(BeansContext);
    const [rowAnimationClass, setRowAnimationClass] = useState('');
    const [topHeight, setTopHeight] = useState(0);
    const [bottomHeight, setBottomHeight] = useState(0);
    const [stickyTopHeight, setStickyTopHeight] = useState('0px');
    const [stickyTopTop, setStickyTopTop] = useState('0px');
    const [stickyTopWidth, setStickyTopWidth] = useState('100%');
    const [topDisplay, setTopDisplay] = useState('');
    const [bottomDisplay, setBottomDisplay] = useState('');
    const [forceVerticalScrollClass, setForceVerticalScrollClass] = useState(null);
    const [topAndBottomOverflowY, setTopAndBottomOverflowY] = useState('');
    const [cellSelectableCss, setCellSelectableCss] = useState(null);
    // we initialise layoutClass to 'ag-layout-normal', because if we don't, the comp will initially
    // render with no width (as ag-layout-normal sets width to 0, which is needed for flex) which
    // gives the grid a massive width, which then renders a massive amount of columns. this problem
    // is due to React been async, for the non-async version (ie when not using React) this is not a
    // problem as the UI will finish initialising before we set data.
    const [layoutClass, setLayoutClass] = useState('ag-layout-normal');
    let cssClassManager = useRef();
    if (!cssClassManager.current) {
        cssClassManager.current = new CssClassManager(() => eRoot.current);
    }
    const eRoot = useRef(null);
    const eTop = useRef(null);
    const eStickyTop = useRef(null);
    const eBody = useRef(null);
    const eBodyViewport = useRef(null);
    const eBottom = useRef(null);
    const beansToDestroy = useRef([]);
    const destroyFuncs = useRef([]);
    useReactCommentEffect(' AG Grid Body ', eRoot);
    useReactCommentEffect(' AG Pinned Top ', eTop);
    useReactCommentEffect(' AG Sticky Top ', eStickyTop);
    useReactCommentEffect(' AG Middle ', eBodyViewport);
    useReactCommentEffect(' AG Pinned Bottom ', eBottom);
    const setRef = useCallback((e) => {
        eRoot.current = e;
        if (!eRoot.current) {
            context.destroyBeans(beansToDestroy.current);
            destroyFuncs.current.forEach(f => f());
            beansToDestroy.current = [];
            destroyFuncs.current = [];
            return;
        }
        if (!context) {
            return;
        }
        const newComp = (tag) => {
            const CompClass = agStackComponentsRegistry.getComponentClass(tag);
            const comp = context.createBean(new CompClass());
            beansToDestroy.current.push(comp);
            return comp;
        };
        const attachToDom = (eParent, eChild) => {
            eParent.appendChild(eChild);
            destroyFuncs.current.push(() => eParent.removeChild(eChild));
        };
        attachToDom(eRoot.current, document.createComment(' AG Fake Horizontal Scroll '));
        attachToDom(eRoot.current, newComp('AG-FAKE-HORIZONTAL-SCROLL').getGui());
        attachToDom(eRoot.current, document.createComment(' AG Overlay Wrapper '));
        attachToDom(eRoot.current, newComp('AG-OVERLAY-WRAPPER').getGui());
        if (eBody.current) {
            attachToDom(eBody.current, document.createComment(' AG Fake Vertical Scroll '));
            attachToDom(eBody.current, newComp('AG-FAKE-VERTICAL-SCROLL').getGui());
        }
        const compProxy = {
            setRowAnimationCssOnBodyViewport: setRowAnimationClass,
            setColumnCount: count => {
                if (eRoot.current) {
                    _.setAriaColCount(eRoot.current, count);
                }
            },
            setRowCount: count => {
                if (eRoot.current) {
                    _.setAriaRowCount(eRoot.current, count);
                }
            },
            setTopHeight,
            setBottomHeight,
            setStickyTopHeight,
            setStickyTopTop,
            setStickyTopWidth,
            setTopDisplay,
            setBottomDisplay,
            setColumnMovingCss: (cssClass, flag) => cssClassManager.current.addOrRemoveCssClass(cssClass, flag),
            updateLayoutClasses: setLayoutClass,
            setAlwaysVerticalScrollClass: setForceVerticalScrollClass,
            setPinnedTopBottomOverflowY: setTopAndBottomOverflowY,
            setCellSelectableCss: (cssClass, flag) => setCellSelectableCss(flag ? cssClass : null),
            setBodyViewportWidth: (width) => {
                if (eBodyViewport.current) {
                    eBodyViewport.current.style.width = width;
                }
            },
            registerBodyViewportResizeListener: listener => {
                if (eBodyViewport.current) {
                    const unsubscribeFromResize = resizeObserverService.observeResize(eBodyViewport.current, listener);
                    destroyFuncs.current.push(() => unsubscribeFromResize());
                }
            }
        };
        const ctrl = context.createBean(new GridBodyCtrl());
        beansToDestroy.current.push(ctrl);
        ctrl.setComp(compProxy, eRoot.current, eBodyViewport.current, eTop.current, eBottom.current, eStickyTop.current);
    }, []);
    const rootClasses = useMemo(() => classesList('ag-root', 'ag-unselectable', layoutClass), [layoutClass]);
    const bodyViewportClasses = useMemo(() => classesList('ag-body-viewport', rowAnimationClass, layoutClass, forceVerticalScrollClass, cellSelectableCss), [rowAnimationClass, layoutClass, forceVerticalScrollClass, cellSelectableCss]);
    const bodyClasses = useMemo(() => classesList('ag-body', layoutClass), [layoutClass]);
    const topClasses = useMemo(() => classesList('ag-floating-top', cellSelectableCss), [cellSelectableCss]);
    const stickyTopClasses = useMemo(() => classesList('ag-sticky-top', cellSelectableCss), [cellSelectableCss]);
    const bottomClasses = useMemo(() => classesList('ag-floating-bottom', cellSelectableCss), [cellSelectableCss]);
    const topStyle = useMemo(() => ({
        height: topHeight,
        minHeight: topHeight,
        display: topDisplay,
        overflowY: topAndBottomOverflowY
    }), [topHeight, topDisplay, topAndBottomOverflowY]);
    const stickyTopStyle = useMemo(() => ({
        height: stickyTopHeight,
        top: stickyTopTop,
        width: stickyTopWidth
    }), [stickyTopHeight, stickyTopTop, stickyTopWidth]);
    const bottomStyle = useMemo(() => ({
        height: bottomHeight,
        minHeight: bottomHeight,
        display: bottomDisplay,
        overflowY: topAndBottomOverflowY
    }), [bottomHeight, bottomDisplay, topAndBottomOverflowY]);
    const createRowContainer = (container) => React.createElement(RowContainerComp, { name: container, key: `${container}-container` });
    const createSection = ({ section, children, className, style }) => (React.createElement("div", { ref: section, className: className, role: "presentation", style: style }, children.map(createRowContainer)));
    return (React.createElement("div", { ref: setRef, className: rootClasses, role: "treegrid" },
        React.createElement(GridHeaderComp, null),
        createSection({ section: eTop, className: topClasses, style: topStyle, children: [
                RowContainerName.TOP_LEFT,
                RowContainerName.TOP_CENTER,
                RowContainerName.TOP_RIGHT,
                RowContainerName.TOP_FULL_WIDTH,
            ] }),
        React.createElement("div", { className: bodyClasses, ref: eBody, role: "presentation" }, createSection({ section: eBodyViewport, className: bodyViewportClasses,
            children: [
                RowContainerName.LEFT,
                RowContainerName.CENTER,
                RowContainerName.RIGHT,
                RowContainerName.FULL_WIDTH,
            ] })),
        createSection({ section: eStickyTop, className: stickyTopClasses, style: stickyTopStyle, children: [
                RowContainerName.STICKY_TOP_LEFT,
                RowContainerName.STICKY_TOP_CENTER,
                RowContainerName.STICKY_TOP_RIGHT,
                RowContainerName.STICKY_TOP_FULL_WIDTH,
            ] }),
        createSection({ section: eBottom, className: bottomClasses, style: bottomStyle, children: [
                RowContainerName.BOTTOM_LEFT,
                RowContainerName.BOTTOM_CENTER,
                RowContainerName.BOTTOM_RIGHT,
                RowContainerName.BOTTOM_FULL_WIDTH,
            ] })));
};
export default memo(GridBodyComp);
