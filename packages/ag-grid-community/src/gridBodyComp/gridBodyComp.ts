import { RefPlaceholder } from '../agStack/interfaces/agComponent';
import { _setAriaColCount, _setAriaMultiSelectable, _setAriaRole, _setAriaRowCount } from '../agStack/utils/aria';
import { _isCellSelectionEnabled, _isMultiRowSelection } from '../gridOptionsUtils';
import type { FocusableContainer } from '../interfaces/iFocusableContainer';
import { LayoutCssClasses } from '../styling/layoutFeature';
import type { ElementParams } from '../utils/element';
import type { ComponentSelector } from '../widgets/component';
import { Component } from '../widgets/component';
import { FakeHScrollSelector } from './fakeHScrollComp';
import { FakeVScrollSelector } from './fakeVScrollComp';
import type { IGridBodyComp, PinnedSection, PinnedSectionState, RowAnimationCssClasses } from './gridBodyCtrl';
import { CSS_CLASS_FORCE_VERTICAL_SCROLL, GridBodyCtrl } from './gridBodyCtrl';
import type { RowContainerComp } from './rowContainer/rowContainerComp';
import { RowContainerSelector } from './rowContainer/rowContainerComp';
import type { RowContainerName } from './rowContainer/rowContainerCtrl';

function makeRowContainers(paramsMap: Record<string, { name: string }>, names: RowContainerName[]): ElementParams[] {
    return names.map((name) => {
        const refName =
            name === 'scrollingFullWidth'
                ? 'scrollingFullWidthRowContainerComp'
                : `e${name[0].toUpperCase() + name.substring(1)}RowContainer`;
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
            {
                tag: 'div',
                ref: 'eGridViewport',
                cls: 'ag-grid-viewport',
                role: 'presentation',
                children: [
                    {
                        tag: 'div',
                        ref: 'eGridScrollableArea',
                        cls: 'ag-grid-scrollable-area',
                        role: 'presentation',
                        children: [
                            {
                                tag: 'div',
                                ref: 'eTop',
                                cls: 'ag-grid-pinned-top-rows',
                                role: 'presentation',
                                children: makeRowContainers(paramsMap, ['pinnedTopCenter', 'pinnedTopFullWidth']),
                            },
                            {
                                tag: 'div',
                                ref: 'eBody',
                                cls: 'ag-grid-scrolling-rows',
                                role: 'presentation',
                                children: makeRowContainers(paramsMap, ['scrollingCenter', 'scrollingFullWidth']),
                            },
                            {
                                tag: 'div',
                                ref: 'eBottom',
                                cls: 'ag-grid-pinned-bottom-rows',
                                role: 'presentation',
                                children: makeRowContainers(paramsMap, ['pinnedBottomCenter', 'pinnedBottomFullWidth']),
                            },
                        ],
                    },
                ],
            },
            { tag: 'ag-fake-horizontal-scroll' },
            { tag: 'ag-fake-vertical-scroll' },
            includeOverlay ? { tag: 'ag-overlay-wrapper' } : null,
        ],
    };
    return { paramsMap, elementParams };
}

export class GridBodyComp extends Component implements FocusableContainer {
    private readonly eGridRoot: HTMLElement = RefPlaceholder;
    private readonly eGridViewport: HTMLElement = RefPlaceholder;
    private readonly eGridScrollableArea: HTMLElement = RefPlaceholder;
    private readonly eTop: HTMLElement = RefPlaceholder;
    private readonly ePinnedTopCenterRowContainer: RowContainerComp = RefPlaceholder;
    private readonly ePinnedTopFullWidthRowContainer: RowContainerComp = RefPlaceholder;
    private readonly eBottom: HTMLElement = RefPlaceholder;
    private readonly ePinnedBottomCenterRowContainer: RowContainerComp = RefPlaceholder;
    private readonly ePinnedBottomFullWidthRowContainer: RowContainerComp = RefPlaceholder;
    private readonly eBody: HTMLElement = RefPlaceholder;
    private readonly scrollingFullWidthRowContainerComp: RowContainerComp = RefPlaceholder;

    private ctrl: GridBodyCtrl;
    private pinnedSectionState: Record<PinnedSection, PinnedSectionState> = {
        top: { height: 0, invisible: true },
        bottom: { height: 0, invisible: true },
    };
    private stickyBottomRowsHeight = 0;

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
                RowContainerSelector,
            ],
            paramsMap
        );

        const compProxy: IGridBodyComp = {
            setRowAnimationCssOnBodyViewport: (cssClass, animate) =>
                this.setRowAnimationCssOnBodyViewport(cssClass, animate),
            setColumnCount: (count) => _setAriaColCount(this.getGui(), count),
            setRowCount: (count) => _setAriaRowCount(this.getGui(), count),
            setPinnedSection: (section, state) => this.setPinnedSection(section, state),
            setStickyBottomHeight: (height) => {
                this.stickyBottomRowsHeight = Number.parseFloat(height) || 0;
                this.refreshBottomSectionHeight();
            },
            setStickyBottomWidth: (width) => (this.eBottom.style.width = width),
            setColumnMovingCss: (cssClass, flag) => this.toggleCss(cssClass, flag),
            updateLayoutClasses: (cssClass, params) => {
                const classLists = [this.eGridViewport.classList, this.eBody.classList];

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
                this.eGridViewport.classList.toggle(CSS_CLASS_FORCE_VERTICAL_SCROLL, on),
            setCellSelectableCss: (cssClass: string | null, selectable: boolean) => {
                if (!cssClass) {
                    return;
                }
                for (const ct of [this.eTop, this.eBody, this.eBottom]) {
                    ct.classList.toggle(cssClass, selectable);
                }
            },
            setGridScrollableAreaWidth: (width) => (this.eGridScrollableArea.style.width = width),
            setGridRootRole: (role: 'grid' | 'treegrid') => _setAriaRole(this.eGridRoot, role),
        };

        this.ctrl = this.createManagedBean(new GridBodyCtrl());
        this.ctrl.setComp(
            compProxy,
            this.getGui(),
            this.eGridViewport,
            this.eBody,
            this.scrollingFullWidthRowContainerComp.getGui(),
            this.ePinnedTopCenterRowContainer.getGui(),
            this.ePinnedTopFullWidthRowContainer.getGui(),
            this.eTop,
            this.ePinnedBottomCenterRowContainer.getGui(),
            this.ePinnedBottomFullWidthRowContainer.getGui(),
            this.eBottom
        );

        if ((rangeSvc && _isCellSelectionEnabled(this.gos)) || _isMultiRowSelection(this.gos)) {
            _setAriaMultiSelectable(this.getGui(), true);
        }
    }

    private setRowAnimationCssOnBodyViewport(cssClass: RowAnimationCssClasses, animateRows: boolean): void {
        const bodyViewportClassList = this.eBody.classList;
        bodyViewportClassList.toggle('ag-row-animation' as RowAnimationCssClasses, animateRows);
        bodyViewportClassList.toggle('ag-row-no-animation' as RowAnimationCssClasses, !animateRows);
    }

    private setPinnedSection(section: PinnedSection, state: PinnedSectionState): void {
        this.pinnedSectionState[section] = state;

        if (section === 'top') {
            this.eTop.style.setProperty('--ag-top-rows-height', `${state.height}px`);
            const topSectionHeight = `calc(var(--ag-header-rows-height, 0px) + ${state.height}px)`;
            this.eTop.style.minHeight = topSectionHeight;
            this.eTop.style.height = topSectionHeight;
            this.eTop.classList.toggle('ag-no-top-rows', state.invisible);
            return;
        }

        this.eBottom.style.setProperty('--ag-bottom-rows-height', `${state.height}px`);
        this.eBottom.classList.toggle('ag-has-bottom-pinned-rows', !state.invisible);
        this.refreshBottomSectionHeight();
    }

    private refreshBottomSectionHeight(): void {
        const bottomSection = this.pinnedSectionState.bottom;
        const totalHeight = bottomSection.height + this.stickyBottomRowsHeight;
        const heightString = `${totalHeight}px`;
        this.eBottom.style.minHeight = heightString;
        this.eBottom.style.height = heightString;
        this.eBottom.classList.toggle('ag-no-bottom-rows', bottomSection.invisible && this.stickyBottomRowsHeight <= 0);
        this.eBottom.classList.toggle('ag-invisible', totalHeight <= 0);
    }

    public getFocusableContainerName(): 'gridBody' {
        return 'gridBody';
    }
}
export const GridBodySelector: ComponentSelector = {
    selector: 'AG-GRID-BODY',
    component: GridBodyComp,
};
