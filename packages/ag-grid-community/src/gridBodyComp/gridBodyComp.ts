import { _isCellSelectionEnabled, _isMultiRowSelection } from '../gridOptionsUtils';
import { GridHeaderSelector } from '../headerRendering/gridHeaderComp';
import { LayoutCssClasses } from '../styling/layoutFeature';
import { _setAriaColCount, _setAriaMultiSelectable, _setAriaRole, _setAriaRowCount } from '../utils/aria';
import type { ElementParams } from '../utils/dom';
import { _observeResize } from '../utils/dom';
import type { ComponentSelector } from '../widgets/component';
import { Component, RefPlaceholder } from '../widgets/component';
import { FakeHScrollSelector } from './fakeHScrollComp';
import { FakeVScrollSelector } from './fakeVScrollComp';
import type { IGridBodyComp, RowAnimationCssClasses } from './gridBodyCtrl';
import { CSS_CLASS_FORCE_VERTICAL_SCROLL, GridBodyCtrl } from './gridBodyCtrl';
import { RowContainerSelector } from './rowContainer/rowContainerComp';
import type { RowContainerName } from './rowContainer/rowContainerCtrl';

function makeRowContainers(paramsMap: Record<string, { name: string }>, names: RowContainerName[]): ElementParams[] {
    return names.map((name) => {
        const refName = `e${name[0].toUpperCase() + name.substring(1)}RowContainer`;
        paramsMap[refName] = { name };
        return {
            tag: 'ag-row-container',
            ref: refName,
            attrs: { name },
        };
    });
}

function getGridBodyTemplate(includeOverlay?: boolean): {
    paramsMap: Record<string, { name: string }>;
    elementParams: ElementParams;
} {
    const paramsMap: Record<string, { name: string }> = {};

    const elementParams: ElementParams = {
        tag: 'div',
        ref: 'eGridRoot',
        cls: 'ag-root ag-unselectable',
        children: [
            { tag: 'ag-header-root' },
            {
                tag: 'div',
                ref: 'eTop',
                cls: 'ag-floating-top',
                role: 'presentation',
                children: makeRowContainers(paramsMap, ['topLeft', 'topCenter', 'topRight', 'topFullWidth']),
            },
            {
                tag: 'div',
                ref: 'eBody',
                cls: 'ag-body',
                role: 'presentation',
                children: [
                    {
                        tag: 'div',
                        ref: 'eBodyViewport',
                        cls: 'ag-body-viewport',
                        role: 'presentation',
                        children: makeRowContainers(paramsMap, ['left', 'center', 'right', 'fullWidth']),
                    },
                    { tag: 'ag-fake-vertical-scroll' },
                ],
            },
            {
                tag: 'div',
                ref: 'eStickyTop',
                cls: 'ag-sticky-top',
                role: 'presentation',
                children: makeRowContainers(paramsMap, [
                    'stickyTopLeft',
                    'stickyTopCenter',
                    'stickyTopRight',
                    'stickyTopFullWidth',
                ]),
            },
            {
                tag: 'div',
                ref: 'eStickyBottom',
                cls: 'ag-sticky-bottom',
                role: 'presentation',
                children: makeRowContainers(paramsMap, [
                    'stickyBottomLeft',
                    'stickyBottomCenter',
                    'stickyBottomRight',
                    'stickyBottomFullWidth',
                ]),
            },
            {
                tag: 'div',
                ref: 'eBottom',
                cls: 'ag-floating-bottom',
                role: 'presentation',
                children: makeRowContainers(paramsMap, [
                    'bottomLeft',
                    'bottomCenter',
                    'bottomRight',
                    'bottomFullWidth',
                ]),
            },
            { tag: 'ag-fake-horizontal-scroll' },
            includeOverlay ? { tag: 'ag-overlay-wrapper' } : null,
        ],
    };
    return { paramsMap, elementParams };
}

export class GridBodyComp extends Component {
    private readonly eGridRoot: HTMLElement = RefPlaceholder;
    private readonly eBodyViewport: HTMLElement = RefPlaceholder;
    private readonly eStickyTop: HTMLElement = RefPlaceholder;
    private readonly eStickyBottom: HTMLElement = RefPlaceholder;
    private readonly eTop: HTMLElement = RefPlaceholder;
    private readonly eBottom: HTMLElement = RefPlaceholder;
    private readonly eBody: HTMLElement = RefPlaceholder;

    private ctrl: GridBodyCtrl;

    public postConstruct() {
        const { overlays, rangeSvc } = this.beans;
        const overlaySelector = overlays?.getOverlayWrapperSelector();

        const { paramsMap, elementParams } = getGridBodyTemplate(!!overlaySelector);

        this.setTemplate(
            elementParams,
            [
                ...(overlaySelector ? [overlaySelector] : []),
                FakeHScrollSelector,
                FakeVScrollSelector,
                GridHeaderSelector,
                RowContainerSelector,
            ],
            paramsMap
        );

        const setHeight = (height: number, element: HTMLElement) => {
            const heightString = `${height}px`;
            element.style.minHeight = heightString;
            element.style.height = heightString;
        };

        const compProxy: IGridBodyComp = {
            setRowAnimationCssOnBodyViewport: (cssClass, animate) =>
                this.setRowAnimationCssOnBodyViewport(cssClass, animate),
            setColumnCount: (count) => _setAriaColCount(this.getGui(), count),
            setRowCount: (count) => _setAriaRowCount(this.getGui(), count),
            setTopHeight: (height) => setHeight(height, this.eTop),
            setBottomHeight: (height) => setHeight(height, this.eBottom),
            setTopInvisible: (invisible) => this.eTop.classList.toggle('ag-invisible', invisible),
            setBottomInvisible: (invisible) => this.eBottom.classList.toggle('ag-invisible', invisible),
            setStickyTopHeight: (height) => (this.eStickyTop.style.height = height),
            setStickyTopTop: (top) => (this.eStickyTop.style.top = top),
            setStickyTopWidth: (width) => (this.eStickyTop.style.width = width),
            setStickyBottomHeight: (height) => {
                this.eStickyBottom.style.height = height;
                this.eStickyBottom.classList.toggle('ag-invisible', height === '0px');
            },
            setStickyBottomBottom: (bottom) => (this.eStickyBottom.style.bottom = bottom),
            setStickyBottomWidth: (width) => (this.eStickyBottom.style.width = width),
            setColumnMovingCss: (cssClass, flag) => this.toggleCss(cssClass, flag),
            updateLayoutClasses: (cssClass, params) => {
                const classLists = [this.eBodyViewport.classList, this.eBody.classList];

                for (const classList of classLists) {
                    classList.toggle(LayoutCssClasses.AUTO_HEIGHT, params.autoHeight);
                    classList.toggle(LayoutCssClasses.NORMAL, params.normal);
                    classList.toggle(LayoutCssClasses.PRINT, params.print);
                }

                this.toggleCss(LayoutCssClasses.AUTO_HEIGHT, params.autoHeight);
                this.toggleCss(LayoutCssClasses.NORMAL, params.normal);
                this.toggleCss(LayoutCssClasses.PRINT, params.print);
            },
            setAlwaysVerticalScrollClass: (cssClass, on) =>
                this.eBodyViewport.classList.toggle(CSS_CLASS_FORCE_VERTICAL_SCROLL, on),
            registerBodyViewportResizeListener: (listener) => {
                const unsubscribeFromResize = _observeResize(this.beans, this.eBodyViewport, listener);
                this.addDestroyFunc(() => unsubscribeFromResize());
            },
            setPinnedTopBottomOverflowY: (overflow) =>
                (this.eTop.style.overflowY = this.eBottom.style.overflowY = overflow),
            setCellSelectableCss: (cssClass: string, selectable: boolean) => {
                [this.eTop, this.eBodyViewport, this.eBottom].forEach((ct) =>
                    ct.classList.toggle(cssClass, selectable)
                );
            },
            setBodyViewportWidth: (width) => (this.eBodyViewport.style.width = width),
            setGridRootRole: (role: 'grid' | 'treegrid') => _setAriaRole(this.eGridRoot, role),
        };

        this.ctrl = this.createManagedBean(new GridBodyCtrl());
        this.ctrl.setComp(
            compProxy,
            this.getGui(),
            this.eBodyViewport,
            this.eTop,
            this.eBottom,
            this.eStickyTop,
            this.eStickyBottom
        );

        if ((rangeSvc && _isCellSelectionEnabled(this.gos)) || _isMultiRowSelection(this.gos)) {
            _setAriaMultiSelectable(this.getGui(), true);
        }
    }

    private setRowAnimationCssOnBodyViewport(cssClass: RowAnimationCssClasses, animateRows: boolean): void {
        const bodyViewportClassList = this.eBodyViewport.classList;
        bodyViewportClassList.toggle('ag-row-animation' as RowAnimationCssClasses, animateRows);
        bodyViewportClassList.toggle('ag-row-no-animation' as RowAnimationCssClasses, !animateRows);
    }
}
export const GridBodySelector: ComponentSelector = {
    selector: 'AG-GRID-BODY',
    component: GridBodyComp,
};
