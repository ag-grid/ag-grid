import {
    RefPlaceholder,
    _setAriaColCount,
    _setAriaMultiSelectable,
    _setAriaRole,
    _setAriaRowCount,
    _setDisplayed,
} from 'ag-stack';

import { _isCellSelectionEnabled, _isMultiRowSelection } from '../gridOptionsUtils';
import { GridHeaderComp } from '../headerRendering/gridHeaderComp';
import type { FocusableContainer } from '../interfaces/iFocusableContainer';
import type { VerticalSection, VerticalSectionMap } from '../interfaces/iGridSection';
import { LayoutCssClasses } from '../styling/layoutFeature';
import type { ElementParams } from '../utils/element';
import type { ComponentSelector } from '../widgets/component';
import { Component } from '../widgets/component';
import { FakeHScrollSelector } from './fakeHScrollComp';
import { FakeVScrollSelector } from './fakeVScrollComp';
import type { IGridBodyComp, PinnedSectionState } from './gridBodyCtrl';
import { GridBodyCtrl } from './gridBodyCtrl';
import type { RowContainerComp } from './rowContainer/rowContainerComp';
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
        cls: 'ag-root ag-unselectable',
        role: 'presentation',
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
                        role: 'rowgroup',
                        children: [
                            {
                                tag: 'div',
                                ref: 'eTop',
                                cls: 'ag-grid-pinned-top-rows',
                                role: 'presentation',
                                children: [
                                    {
                                        tag: 'div',
                                        ref: 'eTopExtraRows',
                                        cls: 'ag-extra-rows-container',
                                        role: 'presentation',
                                    },
                                    ...makeRowContainers(paramsMap, ['pinnedTop', 'stickyTop']),
                                ],
                            },
                            {
                                tag: 'div',
                                ref: 'eBody',
                                cls: 'ag-grid-scrolling-rows',
                                role: 'presentation',
                                children: makeRowContainers(paramsMap, ['scrolling']),
                            },
                            {
                                tag: 'div',
                                ref: 'eBottom',
                                cls: 'ag-grid-pinned-bottom-rows',
                                role: 'presentation',
                                children: makeRowContainers(paramsMap, ['stickyBottom', 'pinnedBottom']),
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
    private readonly eGridViewport: HTMLElement = RefPlaceholder;
    private readonly eGridScrollableArea: HTMLElement = RefPlaceholder;
    private readonly eTop: HTMLElement = RefPlaceholder;
    private readonly eTopExtraRows: HTMLElement = RefPlaceholder;
    private readonly eBottom: HTMLElement = RefPlaceholder;
    private readonly eBody: HTMLElement = RefPlaceholder;
    private readonly eScrollingRowContainer: RowContainerComp = RefPlaceholder;
    private readonly ePinnedTopRowContainer: RowContainerComp = RefPlaceholder;
    private readonly ePinnedBottomRowContainer: RowContainerComp = RefPlaceholder;

    private ctrl: GridBodyCtrl;
    private pinnedSectionState: VerticalSectionMap<PinnedSectionState> = {
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
            setRowAnimationCssOnScrollableArea: (animate) => {
                this.toggleClassForContainers('ag-row-animation', !!animate);
                this.toggleClassForContainers('ag-row-no-animation', !animate);
            },
            setPreventRowAnimationCssOnContainers: (prevent) => {
                this.toggleClassForContainers('ag-prevent-animation', prevent);
            },
            setColumnCount: (count) => _setAriaColCount(this.eGridViewport, count),
            setRowCount: (count) => _setAriaRowCount(this.eGridViewport, count),
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
            setCellSelectableCss: (cssClass: string | null, selectable: boolean) => {
                if (!cssClass) {
                    return;
                }
                for (const ct of [this.eTop, this.eBody, this.eBottom]) {
                    ct.classList.toggle(cssClass, selectable);
                }
            },
            setGridScrollableAreaWidth: (width) => (this.eGridScrollableArea.style.width = width),
            setGridRole: (role: 'grid' | 'treegrid') => _setAriaRole(this.eGridViewport, role),
        };

        this.ctrl = this.createManagedBean(new GridBodyCtrl());
        this.ctrl.setComp(
            compProxy,
            this.getGui(),
            this.eGridViewport,
            this.eBody,
            this.eTop,
            this.eTopExtraRows,
            this.eBottom
        );

        this.createManagedBean(new GridHeaderComp(this.eTop, this.eGridViewport));

        if ((rangeSvc && _isCellSelectionEnabled(this.gos)) || _isMultiRowSelection(this.gos)) {
            _setAriaMultiSelectable(this.eGridViewport, true);
        }
    }

    private toggleClassForContainers(cssClass: string, toggle: boolean): void {
        for (const eContainer of [
            this.eScrollingRowContainer,
            this.ePinnedTopRowContainer,
            this.ePinnedBottomRowContainer,
        ]) {
            const eGui = eContainer.getGui();
            eGui.classList.toggle(cssClass, toggle);
        }
    }

    private setPinnedSection(section: VerticalSection, state: PinnedSectionState): void {
        this.pinnedSectionState[section] = state;
        const { height, invisible } = state;
        const eGridScrollableArea = this.eGridScrollableArea;
        if (section === 'top') {
            const eTop = this.eTop;
            const topSectionHeight = `calc(var(--ag-header-rows-height, 0px) + ${height}px)`;
            eTop.style.setProperty('--ag-top-rows-height', `${height}px`);
            eTop.style.minHeight = topSectionHeight;
            eTop.style.height = topSectionHeight;
            eGridScrollableArea.classList.toggle('ag-has-top-pinned-rows', !invisible);
        } else {
            this.eBottom.style.setProperty('--ag-bottom-rows-height', `${height}px`);
            eGridScrollableArea.classList.toggle('ag-has-bottom-pinned-rows', !invisible);
            this.refreshBottomSectionHeight();
        }
    }

    private refreshBottomSectionHeight(): void {
        const bottomSection = this.pinnedSectionState.bottom;
        const totalHeight = bottomSection.height + this.stickyBottomRowsHeight;
        const heightString = `${totalHeight}px`;
        const eBottom = this.eBottom;
        eBottom.style.minHeight = heightString;
        eBottom.style.height = heightString;
        _setDisplayed(eBottom, totalHeight > 0, { skipAriaHidden: true });
    }

    public getFocusableContainerName(): 'gridBody' {
        return 'gridBody';
    }
}
export const GridBodySelector: ComponentSelector = {
    selector: 'AG-GRID-BODY',
    component: GridBodyComp,
};
