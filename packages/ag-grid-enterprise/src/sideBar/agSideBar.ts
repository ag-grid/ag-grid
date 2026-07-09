import {
    RefPlaceholder,
    _findNextFocusableElement,
    _focusInto,
    _getActiveDomElement,
    _isVisible,
    _removeFromParent,
    _setAriaControlsAndLabel,
} from 'ag-stack';

import type {
    ComponentSelector,
    ElementParams,
    FocusableContainer,
    ISideBar,
    IToolPanel,
    IToolPanelParams,
    SideBarDef,
    SideBarState,
    ToolPanelDef,
} from 'ag-grid-community';
import {
    Component,
    KeyCode,
    ManagedFocusFeature,
    _addFocusableContainerListener,
    _addGridCommonParams,
    _focusNextGridCoreContainer,
    _skipFocusableContainerListenerForAgGrid,
} from 'ag-grid-community';

import { findFocusableElementBeforeTabGuard, isTargetUnderManagedComponent } from '../misc/enterpriseFocusUtils';
import agSideBarCSS from './agSideBar.css';
import type { AgSideBarButtons, SideBarButtonClickedEvent } from './agSideBarButtons';
import { AgSideBarButtonsSelector } from './agSideBarButtons';
import { parseSideBarDef } from './sideBarDefParser';
import type { SideBarService } from './sideBarService';
import { ToolPanelWrapper } from './toolPanelWrapper';

const AgSideBarElement: ElementParams = {
    tag: 'div',
    cls: 'ag-side-bar ag-unselectable',
    children: [
        {
            tag: 'ag-side-bar-buttons',
            ref: 'sideBarButtons',
        },
    ],
};
class AgSideBar extends Component implements ISideBar, FocusableContainer {
    private readonly sideBarButtons: AgSideBarButtons = RefPlaceholder;
    private toolPanelWrappers: ToolPanelWrapper[] = [];
    private sideBar: SideBarDef | undefined;
    private position: 'left' | 'right';

    constructor() {
        super(AgSideBarElement, [AgSideBarButtonsSelector]);
        this.registerCSS(agSideBarCSS);
    }

    public postConstruct(): void {
        this.sideBarButtons.addEventListener('sideBarButtonClicked', this.onToolPanelButtonClicked.bind(this));
        const { beans, gos } = this;
        const { sideBar: sideBarState } = gos.get('initialState') ?? {};
        this.setSideBarDef({
            sideBarDef: parseSideBarDef(gos.get('sideBar'), beans.log),
            sideBarState,
        });

        this.addManagedPropertyListener('sideBar', () => this.setState());

        (beans.sideBar as SideBarService).comp = this;
        const eGui = this.getFocusableElement();
        this.createManagedBean(
            new ManagedFocusFeature(eGui, {
                onTabKeyDown: this.onTabKeyDown.bind(this),
                handleKeyDown: this.handleKeyDown.bind(this),
            })
        );

        _addFocusableContainerListener(beans, this, eGui);

        this.addManagedPropertyListener('enableAdvancedFilter', this.onAdvancedFilterChanged.bind(this));
    }

    public getFocusableContainerName(): 'sideBar' {
        return 'sideBar';
    }

    protected onTabKeyDown(e: KeyboardEvent) {
        if (e.defaultPrevented) {
            return;
        }

        const { beans, sideBarButtons } = this;
        const eGui = this.getGui();
        const sideBarGui = sideBarButtons.getGui();
        const activeElement = _getActiveDomElement(beans) as HTMLElement;
        const openPanel = eGui.querySelector('.ag-tool-panel-wrapper:not(.ag-hidden)') as HTMLElement;
        const target = e.target as HTMLElement;
        const backwards = e.shiftKey;

        if (!openPanel) {
            if (_focusNextGridCoreContainer(beans, backwards, true)) {
                e.preventDefault();
                return true;
            }
            // avoid a second core-container evaluation from the generic focusable-container listener
            // without blocking other ag grid keyboard handling for this event.
            _skipFocusableContainerListenerForAgGrid(e);
            return false;
        }

        if (sideBarGui.contains(activeElement)) {
            if (_focusInto(openPanel, backwards)) {
                e.preventDefault();
            }
            return;
        }

        // only handle backwards focus to target the sideBar buttons
        if (!backwards) {
            return;
        }

        let nextEl: HTMLElement | null = null;

        if (openPanel.contains(activeElement)) {
            nextEl = _findNextFocusableElement(beans, openPanel, undefined, true);
        } else if (isTargetUnderManagedComponent(openPanel, target)) {
            nextEl = findFocusableElementBeforeTabGuard(openPanel, target);
        }

        if (!nextEl) {
            nextEl = sideBarGui.querySelector('.ag-selected button') as HTMLElement;
            nextEl = _isVisible(nextEl) ? nextEl : null;
        }

        if (nextEl && nextEl !== e.target) {
            e.preventDefault();
            nextEl.focus();
        }
    }

    protected handleKeyDown(e: KeyboardEvent): void {
        const currentButton = _getActiveDomElement(this.beans);

        const sideBarButtons = this.sideBarButtons;
        if (!sideBarButtons.getGui().contains(currentButton)) {
            return;
        }

        const sideBarGui = sideBarButtons.getGui();
        const buttons: HTMLElement[] = Array.prototype.slice.call(sideBarGui.querySelectorAll('.ag-side-button'));

        const currentPos = buttons.findIndex((button) => button.contains(currentButton));
        let nextPos: number | null = null;

        switch (e.key) {
            case KeyCode.LEFT:
            case KeyCode.UP:
                nextPos = Math.max(0, currentPos - 1);
                break;
            case KeyCode.RIGHT:
            case KeyCode.DOWN:
                nextPos = Math.min(currentPos + 1, buttons.length - 1);
                break;
        }

        if (nextPos === null) {
            return;
        }

        const innerButton = buttons[nextPos].querySelector('button');

        if (innerButton) {
            innerButton.focus();
            e.preventDefault();
        }
    }

    private onToolPanelButtonClicked(event: SideBarButtonClickedEvent): void {
        const id = event.toolPanelId;
        const openedItem = this.openedItem();

        // if item was already open, we close it
        if (openedItem === id) {
            this.openToolPanel(undefined, 'sideBarButtonClicked'); // passing undefined closes
        } else {
            this.openToolPanel(id, 'sideBarButtonClicked');
        }
    }

    private clearDownUi(): void {
        this.sideBarButtons.clearButtons();
        this.destroyToolPanelWrappers();
    }

    private setSideBarDef({
        sideBarDef,
        sideBarState,
        existingToolPanelWrappers,
    }: {
        sideBarDef?: SideBarDef;
        sideBarState?: SideBarState;
        existingToolPanelWrappers?: { [id: string]: ToolPanelWrapper };
    }): void {
        // initially hide side bar
        this.setDisplayed(false);

        this.sideBar = sideBarDef;

        if (sideBarDef) {
            this.sideBarButtons.setDisplayed(!sideBarDef.hideButtons);
        }
        if (sideBarDef?.toolPanels) {
            const toolPanelDefs = sideBarDef.toolPanels as ToolPanelDef[];
            this.createToolPanelsAndSideButtons(toolPanelDefs, sideBarState, existingToolPanelWrappers);
            if (!this.toolPanelWrappers.length) {
                return;
            }

            const shouldDisplaySideBar = sideBarState ? sideBarState.visible : !sideBarDef.hiddenByDefault;
            this.setDisplayed(shouldDisplaySideBar);

            this.setSideBarPosition(sideBarState ? sideBarState.position : sideBarDef.position);

            if (shouldDisplaySideBar) {
                if (sideBarState) {
                    const { openToolPanel } = sideBarState;
                    if (openToolPanel) {
                        this.openToolPanel(openToolPanel, 'sideBarInitializing');
                    }
                } else {
                    this.openToolPanel(sideBarDef.defaultToolPanel, 'sideBarInitializing');
                }
            }
        }
    }

    public getDef() {
        return this.sideBar;
    }

    public setSideBarPosition(position?: 'left' | 'right'): this {
        if (!position) {
            position = 'right';
        }

        this.position = position;

        const isLeft = position === 'left';
        const resizerSide = isLeft ? 'right' : 'left';

        this.toggleCss('ag-side-bar-left', isLeft);
        this.toggleCss('ag-side-bar-right', !isLeft);

        for (const wrapper of this.toolPanelWrappers) {
            wrapper.setResizerSizerSide(resizerSide);
        }

        this.dispatchSideBarUpdated();

        return this;
    }

    public override setDisplayed(displayed: boolean, options?: { skipAriaHidden?: boolean }): void {
        super.setDisplayed(displayed, options);
        this.dispatchSideBarUpdated();
    }

    public getState(): SideBarState {
        const toolPanels: { [id: string]: any } = {};
        for (const wrapper of this.toolPanelWrappers) {
            toolPanels[wrapper.getToolPanelId()] = wrapper.getToolPanelInstance()?.getState?.();
        }
        return {
            visible: this.isDisplayed(),
            position: this.position,
            openToolPanel: this.openedItem(),
            toolPanels,
        };
    }

    private createToolPanelsAndSideButtons(
        defs: ToolPanelDef[],
        sideBarState?: SideBarState,
        existingToolPanelWrappers?: { [id: string]: ToolPanelWrapper }
    ): void {
        for (const def of defs) {
            this.createToolPanelAndSideButton(
                def,
                sideBarState?.toolPanels?.[def.id],
                existingToolPanelWrappers?.[def.id]
            );
        }
    }

    private validateDef(def: ToolPanelDef): boolean {
        const { id, toolPanel } = def;
        if (id == null) {
            this.beans.log.warn(212);
            return false;
        }

        if (isFilterPanel(toolPanel)) {
            if (this.beans.filterManager?.isAdvFilterEnabled()) {
                this.beans.log.warn(213);
                return false;
            }
        }

        return true;
    }

    private createToolPanelAndSideButton(
        def: ToolPanelDef,
        initialState?: any,
        existingToolPanelWrapper?: ToolPanelWrapper
    ): void {
        if (!this.validateDef(def)) {
            this.destroyBean(existingToolPanelWrapper);
            return;
        }
        let wrapper: ToolPanelWrapper;
        if (existingToolPanelWrapper) {
            wrapper = existingToolPanelWrapper;
            wrapper.setDefParent(def.parent ?? null);
        } else {
            wrapper = this.createBean(new ToolPanelWrapper());

            const created = wrapper.setToolPanelDef(
                def,
                _addGridCommonParams<IToolPanelParams>(this.gos, {
                    initialState,
                    onStateUpdated: () => this.dispatchSideBarUpdated(),
                })
            );
            if (!created) {
                return;
            }
        }
        wrapper.setDisplayed(false);

        this.renderToolPanelUnderParent(wrapper, def.parent);

        this.toolPanelWrappers.push(wrapper);

        const button = this.sideBarButtons.addButtonComp(def);

        _setAriaControlsAndLabel(button.eToggleButton, wrapper.getGui());
    }

    public refresh(): void {
        for (const wrapper of this.toolPanelWrappers) {
            wrapper.refresh();
        }
    }

    private renderToolPanelUnderParent(
        wrapper: ToolPanelWrapper,
        externalParent: HTMLElement | null | undefined
    ): void {
        const correctParent = externalParent ?? wrapper.getDefParent() ?? this.getGui();
        if (correctParent !== this.getGui()) {
            wrapper.ensureStyledRoot();
            correctParent.classList.add('ag-tool-panel-external');
        }
        const wrapperGui = wrapper.getGui();
        if (wrapperGui.parentElement !== correctParent) {
            correctParent.appendChild(wrapperGui);
        }
    }

    private getWrapper(key: string | null | undefined): ToolPanelWrapper | undefined {
        return this.toolPanelWrappers.find((wrapper) => wrapper.getToolPanelId() === key);
    }

    public openToolPanel(
        key: string | undefined,
        source: 'sideBarButtonClicked' | 'sideBarInitializing' | 'api' = 'api',
        parent?: HTMLElement | null
    ): void {
        const currentlyOpenedKey = this.openedItem();
        const switchingToolPanel = !!key && !!currentlyOpenedKey;
        const skipAnimation = switchingToolPanel || source === 'sideBarInitializing';

        for (const wrapper of this.toolPanelWrappers) {
            const show = key === wrapper.getToolPanelId();
            if (show) {
                this.renderToolPanelUnderParent(wrapper, parent ?? null);
            }
            if (skipAnimation) {
                wrapper.setDisplayed(show);
            } else {
                wrapper.animateDisplayed(show);
            }
        }

        const newlyOpenedKey = this.openedItem();
        const openToolPanelChanged = currentlyOpenedKey !== newlyOpenedKey;
        if (openToolPanelChanged) {
            this.sideBarButtons.setActiveButton(key);
            this.raiseToolPanelVisibleEvent(key, currentlyOpenedKey ?? undefined, source);
        }
    }

    public getToolPanelInstance(key: string): IToolPanel | undefined {
        const toolPanelWrapper = this.getWrapper(key);

        if (!toolPanelWrapper) {
            this.beans.log.warn(214, { key });
            return;
        }

        return toolPanelWrapper.getToolPanelInstance();
    }

    private raiseToolPanelVisibleEvent(
        key: string | undefined,
        previousKey: string | undefined,
        source: 'sideBarButtonClicked' | 'sideBarInitializing' | 'api'
    ): void {
        const switchingToolPanel = !!key && !!previousKey;
        const eventSvc = this.eventSvc;
        if (previousKey) {
            eventSvc.dispatchEvent({
                type: 'toolPanelVisibleChanged',
                source,
                key: previousKey,
                visible: false,
                switchingToolPanel,
            });
        }
        if (key) {
            eventSvc.dispatchEvent({
                type: 'toolPanelVisibleChanged',
                source,
                key,
                visible: true,
                switchingToolPanel,
            });
        }
    }

    public close(source: 'sideBarButtonClicked' | 'sideBarInitializing' | 'api' = 'api'): void {
        this.openToolPanel(undefined, source);
    }

    public isToolPanelShowing(): boolean {
        return !!this.openedItem();
    }

    public openedItem(): string | null {
        let activeToolPanel: string | null = null;
        for (const wrapper of this.toolPanelWrappers) {
            if (wrapper.isDisplayed()) {
                activeToolPanel = wrapper.getToolPanelId();
            }
        }
        return activeToolPanel;
    }

    public setState(sideBarState?: SideBarState): void {
        const sideBarDef = parseSideBarDef(this.gos.get('sideBar'), this.beans.log);

        const existingToolPanelWrappers: { [id: string]: ToolPanelWrapper } = {};
        if (sideBarDef && this.sideBar) {
            sideBarDef.toolPanels?.forEach((toolPanelDef: ToolPanelDef) => {
                const { id } = toolPanelDef;
                if (!id) {
                    return;
                }
                const existingToolPanelDef = this.sideBar!.toolPanels?.find(
                    (toolPanelDefToCheck: ToolPanelDef) => toolPanelDefToCheck.id === id
                ) as ToolPanelDef | undefined;
                if (!existingToolPanelDef || toolPanelDef.toolPanel !== existingToolPanelDef.toolPanel) {
                    return;
                }
                const toolPanelWrapper = this.getWrapper(id);
                if (!toolPanelWrapper) {
                    return;
                }
                const params = _addGridCommonParams<IToolPanelParams>(this.gos, {
                    ...(toolPanelDef.toolPanelParams ?? {}),
                    initialState: sideBarState?.toolPanels?.[id],
                    onStateUpdated: () => this.dispatchSideBarUpdated(),
                });
                const hasRefreshed = toolPanelWrapper.getToolPanelInstance()?.refresh(params);
                if (hasRefreshed !== true) {
                    return;
                }
                this.toolPanelWrappers = this.toolPanelWrappers.filter((toolPanel) => toolPanel !== toolPanelWrapper);
                _removeFromParent(toolPanelWrapper.getGui());
                existingToolPanelWrappers[id] = toolPanelWrapper;
            });
        }

        this.clearDownUi();

        // don't re-assign initial state
        this.setSideBarDef({ sideBarDef, sideBarState, existingToolPanelWrappers });
    }

    private dispatchSideBarUpdated(): void {
        this.eventSvc.dispatchEvent({ type: 'sideBarUpdated' });
    }

    private destroyToolPanelWrappers(): void {
        for (const wrapper of this.toolPanelWrappers) {
            _removeFromParent(wrapper.getGui());
            this.destroyBean(wrapper);
        }
        this.toolPanelWrappers.length = 0;
    }

    private onAdvancedFilterChanged(): void {
        const needsRefresh = this.sideBar?.toolPanels?.some((toolPanel) =>
            isFilterPanel(typeof toolPanel === 'string' ? toolPanel : toolPanel.toolPanel)
        );
        if (needsRefresh) {
            // either need to show or hide the filter panel
            this.setState();
        }
    }

    public override destroy(): void {
        this.destroyToolPanelWrappers();
        super.destroy();
    }
}

function isFilterPanel(toolPanel: any): boolean {
    return toolPanel === 'agFiltersToolPanel' || toolPanel === 'agNewFiltersToolPanel';
}

export const AgSideBarSelector: ComponentSelector<Component> = {
    selector: 'AG-SIDE-BAR',
    component: AgSideBar,
};
