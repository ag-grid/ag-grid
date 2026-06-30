import { Direction, _findTabbableParent, _focusInto, _getActiveDomElement, _last, _observeResize } from 'ag-stack';

import { BeanStub } from '../context/beanStub';
import { isHeaderPosition } from '../headerRendering/headerUtils';
import type { GridContainerName, TabToNextGridContainerTarget } from '../interfaces/iCallbackParams';
import type { FocusableContainer } from '../interfaces/iFocusableContainer';
import type { LayoutView } from '../styling/layoutFeature';
import { LayoutFeature } from '../styling/layoutFeature';
import { _isCellFocusSuppressed, _isHeaderFocusSuppressed, _runWithContainerFocusAllowed } from '../utils/gridFocus';
import { _consoleWarn } from '../utils/log';
import type { Component, ComponentSelector } from '../widgets/component';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IGridComp extends LayoutView {
    destroyGridUi(): void;
    forceFocusOutOfContainer(up: boolean): void;
    getFocusableContainers(): FocusableContainer[];
    setCursor(value: string | null): void;
    setUserSelect(value: string | null): void;
}

export interface OptionalGridComponents {
    paginationSelector?: ComponentSelector<Component>;
    gridHeaderDropZonesSelector?: ComponentSelector<Component>;
    sideBarSelector?: ComponentSelector<Component>;
    statusBarSelector?: ComponentSelector<Component>;
    toolbarSelector?: ComponentSelector<Component & FocusableContainer>;
    watermarkSelector?: ComponentSelector<Component>;
}

const focusContainer = (comp: FocusableContainer, up?: boolean): boolean => {
    return _runWithContainerFocusAllowed(comp, () => _focusInto(comp.getGui(), up, false, true));
};

const getGridContainerName = (container?: FocusableContainer): GridContainerName => {
    return container?.getFocusableContainerName() ?? 'external';
};

const getDefaultTabToNextGridContainerTargetName = (target: TabToNextGridContainerTarget | null): GridContainerName => {
    if (target == null) {
        return 'external';
    }

    return typeof target === 'string' ? target : 'gridBody';
};

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class GridCtrl extends BeanStub {
    private view: IGridComp;
    private eGui: HTMLElement;

    private readonly additionalFocusableContainers: Set<FocusableContainer> = new Set();

    public setComp(view: IGridComp, eGui: HTMLElement, eAriaDescription: HTMLElement): void {
        this.view = view;
        this.eGui = eGui;

        this.eGui.setAttribute('grid-id', this.beans.context.getId());

        const { dragAndDrop, ctrlsSvc, ariaAnnounce } = this.beans;

        dragAndDrop?.registerGridDropTarget(() => this.eGui, this);

        ariaAnnounce.setDescriptionContainer(eAriaDescription);

        this.createManagedBean(new LayoutFeature(this.view));

        if (this.gos.get('suppressContentVisibilityAuto')) {
            this.eGui.style.setProperty('content-visibility', 'visible');
        }

        const unsubscribeFromResize = _observeResize(this.beans, this.eGui, this.onGridSizeChanged.bind(this));
        this.addDestroyFunc(() => unsubscribeFromResize());

        ctrlsSvc.register('gridCtrl', this);
    }

    public isDetailGrid(): boolean {
        const el = _findTabbableParent(this.getGui());

        return el?.getAttribute('row-id')?.startsWith('detail') || false;
    }

    public getOptionalSelectors(): OptionalGridComponents {
        const beans = this.beans;

        return {
            paginationSelector: beans.pagination?.getPaginationSelector(),
            gridHeaderDropZonesSelector: beans.registry?.getSelector('AG-GRID-HEADER-DROP-ZONES'),
            sideBarSelector: beans.sideBar?.getSelector(),
            statusBarSelector: beans.registry?.getSelector('AG-STATUS-BAR'),
            toolbarSelector: beans.registry?.getSelector('AG-TOOLBAR'),
            watermarkSelector: beans.licenseManager?.getWatermarkSelector(),
        };
    }

    private onGridSizeChanged(): void {
        this.eventSvc.dispatchEvent({
            type: 'gridSizeChanged',
            clientWidth: this.eGui.clientWidth,
            clientHeight: this.eGui.clientHeight,
        });
    }

    public destroyGridUi(): void {
        this.view.destroyGridUi();
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

    public setResizeCursor(direction: Direction | false, isColumn: boolean = false): void {
        const { view } = this;

        if (direction === false) {
            view.setCursor(null);
        } else if (isColumn) {
            view.setCursor(direction === Direction.Horizontal ? 'col-resize' : 'row-resize');
        } else {
            view.setCursor(direction === Direction.Horizontal ? 'ew-resize' : 'ns-resize');
        }
    }

    public disableUserSelect(on: boolean): void {
        this.view.setUserSelect(on ? 'none' : null);
    }

    public focusNextInnerContainer(backwards: boolean): boolean | undefined {
        const focusableContainers = this.getFocusableContainers();
        const { indexWithFocus, nextIndex } = this.getNextFocusableIndex(focusableContainers, backwards);
        const resolvedNextIndex = indexWithFocus === -1 ? (backwards ? focusableContainers.length - 1 : 0) : nextIndex;
        const {
            gos,
            beans: { focusSvc, navigation },
        } = this;
        const userCallbackFunction = gos.getCallback('tabToNextGridContainer');

        if (userCallbackFunction) {
            const defaultTarget = focusSvc.getDefaultTabToNextGridContainerTarget({
                backwards,
                focusableContainers,
                nextIndex: resolvedNextIndex,
            });

            const nextContainerName = getGridContainerName(focusableContainers[resolvedNextIndex]);
            const nextContainer =
                defaultTarget == null && nextContainerName === 'gridBody'
                    ? 'gridBody'
                    : getDefaultTabToNextGridContainerTargetName(defaultTarget);

            const userResult = userCallbackFunction({
                backwards,
                previousContainer: getGridContainerName(focusableContainers[indexWithFocus]),
                nextContainer,
                defaultTarget,
            });

            if (userResult !== undefined) {
                if (typeof userResult === 'boolean') {
                    return userResult;
                }

                if (typeof userResult === 'string') {
                    if (userResult === 'gridBody') {
                        return this.focusGridBodyDefault(backwards) || undefined;
                    }

                    const targetContainer = focusableContainers.find(
                        (container) => container.getFocusableContainerName() === userResult
                    );
                    if (!targetContainer) {
                        _consoleWarn(`tabToNextGridContainer - ${userResult} container not found`);
                        return undefined;
                    }

                    return focusContainer(targetContainer, backwards) ? true : undefined;
                }

                if (isHeaderPosition(userResult)) {
                    return focusSvc.focusHeaderPosition({ headerPosition: userResult }) || undefined;
                }

                navigation?.ensureCellVisible(userResult);
                focusSvc.setFocusedCell({ ...userResult, forceBrowserFocus: true });
                return focusSvc.isCellFocused(userResult) || undefined;
            }
        }

        return (
            this.focusNextInnerContainerDefault({
                backwards,
                focusableContainers,
                indexWithFocus,
                nextIndex: resolvedNextIndex,
            }) || undefined
        );
    }

    public focusInnerElement(fromBottom?: boolean): boolean {
        const {
            gos,
            beans,
            beans: { focusSvc, visibleCols },
        } = this;
        const userCallbackFunction = gos.getCallback('focusGridInnerElement');
        if (userCallbackFunction?.({ fromBottom: !!fromBottom })) {
            return true;
        }

        const focusableContainers = this.getFocusableContainers();

        if (fromBottom) {
            if (
                this.focusNextInnerContainerDefault({
                    backwards: true,
                    focusableContainers,
                    indexWithFocus: focusableContainers.length,
                    nextIndex: focusableContainers.length - 1,
                })
            ) {
                return true;
            }

            // preserve previous bottom-entry fallback for async row model timing.
            return focusSvc.focusGridView({ column: _last(visibleCols.allCols), backwards: true });
        }

        const allColumns = visibleCols.allCols;

        if (gos.get('headerHeight') === 0 || _isHeaderFocusSuppressed(beans)) {
            if (focusSvc.focusGridView({ column: allColumns[0], backwards: fromBottom })) {
                return true;
            }

            for (let i = 1; i < focusableContainers.length; i++) {
                if (_focusInto(focusableContainers[i].getGui(), fromBottom)) {
                    return true;
                }
            }
            return false;
        }

        return focusSvc.focusFirstHeader();
    }

    public forceFocusOutOfContainer(up = false): void {
        this.view.forceFocusOutOfContainer(up);
    }

    public isFocusInsideGridBody(): boolean {
        const focusableContainers = this.getFocusableContainers();
        const { indexWithFocus } = this.getNextFocusableIndex(focusableContainers);
        return focusableContainers[indexWithFocus]?.getFocusableContainerName() === 'gridBody';
    }

    public addFocusableContainer(container: FocusableContainer): void {
        this.additionalFocusableContainers.add(container);
    }

    public removeFocusableContainer(container: FocusableContainer): void {
        this.additionalFocusableContainers.delete(container);
    }

    public allowFocusForNextCoreContainer(up?: boolean): void {
        const coreContainers = this.view.getFocusableContainers();
        const { indexWithFocus, nextIndex } = this.getNextFocusableIndex(coreContainers, up);

        // browser default tabbing can focus unmanaged scrollable elements and lose focus context.
        // move focus to the next reachable core container first; if none can take focus, push focus out.
        if (
            !this.focusNextInnerContainerDefault({
                backwards: !!up,
                focusableContainers: coreContainers,
                indexWithFocus,
                nextIndex,
            })
        ) {
            this.forceFocusOutOfContainer(up);
        }
    }

    public isFocusable(): boolean {
        const beans = this.beans;
        return (
            !_isCellFocusSuppressed(beans) || !_isHeaderFocusSuppressed(beans) || !!beans.sideBar?.comp?.isDisplayed()
        );
    }

    private getNextFocusableIndex(
        focusableContainers: FocusableContainer[],
        backwards?: boolean
    ): {
        indexWithFocus: number;
        nextIndex: number;
    } {
        const activeEl = _getActiveDomElement(this.beans);
        const indexWithFocus = focusableContainers.findIndex((container) => container.getGui().contains(activeEl));

        return { indexWithFocus, nextIndex: indexWithFocus + (backwards ? -1 : 1) };
    }

    private focusGridBodyDefault(backwards: boolean): boolean {
        const {
            gos,
            beans,
            beans: {
                focusSvc,
                visibleCols: { allCols },
            },
        } = this;
        if (backwards) {
            return focusSvc.focusGridView({ column: _last(allCols), backwards: true });
        }

        if (gos.get('headerHeight') === 0 || _isHeaderFocusSuppressed(beans)) {
            return focusSvc.focusGridView({ column: allCols[0] });
        }

        return focusSvc.focusFirstHeader();
    }

    private focusNextInnerContainerDefault(params: {
        backwards: boolean;
        focusableContainers: FocusableContainer[];
        indexWithFocus: number;
        nextIndex: number;
    }): boolean {
        const { backwards, focusableContainers, indexWithFocus } = params;
        const step = backwards ? -1 : 1;

        // walk container order in tab direction and focus the first target that can accept focus.
        for (let index = params.nextIndex; index >= 0 && index < focusableContainers.length; index += step) {
            const container = focusableContainers[index];
            const containerName = container.getFocusableContainerName();

            // grid body transitions should restore a real grid target, not focus structural wrappers.
            if (containerName === 'gridBody') {
                const enteringGridBody =
                    indexWithFocus === -1 || (backwards ? indexWithFocus > index : indexWithFocus < index);
                if (enteringGridBody) {
                    if (this.focusGridBodyDefault(backwards)) {
                        return true;
                    }
                    continue;
                }
            }

            if (focusContainer(container, backwards)) {
                return true;
            }
        }

        return false;
    }

    private getFocusableContainers(): FocusableContainer[] {
        return [...this.view.getFocusableContainers(), ...this.additionalFocusableContainers];
    }

    public override destroy(): void {
        this.additionalFocusableContainers.clear();
        super.destroy();
    }
}
