import type {
    AgComponentSelector,
    FilterManager,
    FocusService,
    ISideBar,
    IToolPanel,
    IToolPanelParams,
    SideBarDef,
    SideBarState,
    ToolPanelDef,
    ToolPanelVisibleChangedEvent,
    WithoutGridCommon} from '@ag-grid-community/core';
import {
    Autowired,
    Component,
    Events,
    KeyCode,
    ManagedFocusFeature,
    ModuleNames,
    ModuleRegistry,
    PostConstruct,
    RefSelector,
    _removeFromParent,
    _setAriaControls,
    _warnOnce,
} from '@ag-grid-community/core';

import type { SideBarButtonClickedEvent } from './agSideBarButtons';
import { AgSideBarButtons } from './agSideBarButtons';
import { SideBarDefParser } from './sideBarDefParser';
import type { SideBarService } from './sideBarService';
import { ToolPanelWrapper } from './toolPanelWrapper';

export class AgSideBar extends Component implements ISideBar {
    static readonly selector: AgComponentSelector = 'AG-SIDE-BAR';

    @Autowired('focusService') private focusService: FocusService;
    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('sideBarService') private sideBarService: SideBarService;
    @RefSelector('sideBarButtons') private sideBarButtonsComp: AgSideBarButtons;

    private toolPanelWrappers: ToolPanelWrapper[] = [];
    private sideBar: SideBarDef | undefined;
    private position: 'left' | 'right';

    private static readonly TEMPLATE /* html */ = `<div class="ag-side-bar ag-unselectable">
            <ag-side-bar-buttons ref="sideBarButtons"></ag-side-bar-buttons>
        </div>`;

    constructor() {
        super(AgSideBar.TEMPLATE, [AgSideBarButtons]);
    }

    @PostConstruct
    private postConstruct(): void {
        this.sideBarButtonsComp.addEventListener(
            AgSideBarButtons.EVENT_SIDE_BAR_BUTTON_CLICKED,
            this.onToolPanelButtonClicked.bind(this)
        );
        const { sideBar: sideBarState } = this.gos.get('initialState') ?? {};
        this.setSideBarDef({
            sideBarDef: SideBarDefParser.parse(this.gos.get('sideBar')),
            sideBarState,
        });

        this.addManagedPropertyListener('sideBar', this.onSideBarUpdated.bind(this));

        this.sideBarService.registerSideBarComp(this);
        this.createManagedBean(
            new ManagedFocusFeature(this.getFocusableElement(), {
                onTabKeyDown: this.onTabKeyDown.bind(this),
                handleKeyDown: this.handleKeyDown.bind(this),
            })
        );
    }

    protected onTabKeyDown(e: KeyboardEvent) {
        if (e.defaultPrevented) {
            return;
        }

        const { focusService, sideBarButtonsComp } = this;
        const eGui = this.getGui();
        const sideBarGui = sideBarButtonsComp.getGui();
        const activeElement = this.gos.getActiveDomElement() as HTMLElement;
        const openPanel = eGui.querySelector('.ag-tool-panel-wrapper:not(.ag-hidden)') as HTMLElement;
        const target = e.target as HTMLElement;

        if (!openPanel) {
            return;
        }

        if (sideBarGui.contains(activeElement)) {
            if (focusService.focusInto(openPanel, e.shiftKey)) {
                e.preventDefault();
            }
            return;
        }

        // only handle backwards focus to target the sideBar buttons
        if (!e.shiftKey) {
            return;
        }

        let nextEl: HTMLElement | null = null;

        if (openPanel.contains(activeElement)) {
            nextEl = this.focusService.findNextFocusableElement(openPanel, undefined, true);
        } else if (focusService.isTargetUnderManagedComponent(openPanel, target) && e.shiftKey) {
            nextEl = this.focusService.findFocusableElementBeforeTabGuard(openPanel, target);
        }

        if (!nextEl) {
            nextEl = sideBarGui.querySelector('.ag-selected button') as HTMLElement;
        }

        if (nextEl && nextEl !== e.target) {
            e.preventDefault();
            nextEl.focus();
        }
    }

    protected handleKeyDown(e: KeyboardEvent): void {
        const currentButton = this.gos.getActiveDomElement();

        if (!this.sideBarButtonsComp.getGui().contains(currentButton)) {
            return;
        }

        const sideBarGui = this.sideBarButtonsComp.getGui();
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
        this.sideBarButtonsComp.clearButtons();
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

        if (!!this.sideBar && !!this.sideBar.toolPanels) {
            const toolPanelDefs = this.sideBar.toolPanels as ToolPanelDef[];
            this.createToolPanelsAndSideButtons(toolPanelDefs, sideBarState, existingToolPanelWrappers);
            if (!this.toolPanelWrappers.length) {
                return;
            }

            const shouldDisplaySideBar = sideBarState ? sideBarState.visible : !this.sideBar.hiddenByDefault;
            this.setDisplayed(shouldDisplaySideBar);

            this.setSideBarPosition(sideBarState ? sideBarState.position : this.sideBar.position);

            if (shouldDisplaySideBar) {
                if (sideBarState) {
                    const { openToolPanel } = sideBarState;
                    if (openToolPanel) {
                        this.openToolPanel(openToolPanel, 'sideBarInitializing');
                    }
                } else {
                    this.openToolPanel(this.sideBar.defaultToolPanel, 'sideBarInitializing');
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

        this.addOrRemoveCssClass('ag-side-bar-left', isLeft);
        this.addOrRemoveCssClass('ag-side-bar-right', !isLeft);

        this.toolPanelWrappers.forEach((wrapper) => {
            wrapper.setResizerSizerSide(resizerSide);
        });

        this.eventService.dispatchEvent({ type: Events.EVENT_SIDE_BAR_UPDATED });

        return this;
    }

    public setDisplayed(displayed: boolean, options?: { skipAriaHidden?: boolean | undefined } | undefined): void {
        super.setDisplayed(displayed, options);
        this.eventService.dispatchEvent({ type: Events.EVENT_SIDE_BAR_UPDATED });
    }

    public getState(): SideBarState {
        const toolPanels: { [id: string]: any } = {};
        this.toolPanelWrappers.forEach((wrapper) => {
            toolPanels[wrapper.getToolPanelId()] = wrapper.getToolPanelInstance()?.getState?.();
        });
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
        if (def.id == null) {
            console.warn(
                `AG Grid: please review all your toolPanel components, it seems like at least one of them doesn't have an id`
            );
            return false;
        }

        // helpers, in case user doesn't have the right module loaded
        if (def.toolPanel === 'agColumnsToolPanel') {
            const moduleMissing = !ModuleRegistry.__assertRegistered(
                ModuleNames.ColumnsToolPanelModule,
                'Column Tool Panel',
                this.context.getGridId()
            );
            if (moduleMissing) {
                return false;
            }
        }

        if (def.toolPanel === 'agFiltersToolPanel') {
            const moduleMissing = !ModuleRegistry.__assertRegistered(
                ModuleNames.FiltersToolPanelModule,
                'Filters Tool Panel',
                this.context.getGridId()
            );
            if (moduleMissing) {
                return false;
            }
            if (this.filterManager.isAdvancedFilterEnabled()) {
                _warnOnce(
                    'Advanced Filter does not work with Filters Tool Panel. Filters Tool Panel has been disabled.'
                );
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
            return;
        }
        const button = this.sideBarButtonsComp.addButtonComp(def);
        let wrapper: ToolPanelWrapper;
        if (existingToolPanelWrapper) {
            wrapper = existingToolPanelWrapper;
        } else {
            wrapper = this.getContext().createBean(new ToolPanelWrapper());

            wrapper.setToolPanelDef(def, {
                initialState,
                onStateUpdated: () => this.eventService.dispatchEvent({ type: Events.EVENT_SIDE_BAR_UPDATED }),
            });
        }
        wrapper.setDisplayed(false);

        const wrapperGui = wrapper.getGui();
        this.appendChild(wrapperGui);

        this.toolPanelWrappers.push(wrapper);

        _setAriaControls(button.getButtonElement(), wrapperGui);
    }

    public refresh(): void {
        this.toolPanelWrappers.forEach((wrapper) => wrapper.refresh());
    }

    public openToolPanel(
        key: string | undefined,
        source: 'sideBarButtonClicked' | 'sideBarInitializing' | 'api' = 'api'
    ): void {
        const currentlyOpenedKey = this.openedItem();
        if (currentlyOpenedKey === key) {
            return;
        }

        this.toolPanelWrappers.forEach((wrapper) => {
            const show = key === wrapper.getToolPanelId();
            wrapper.setDisplayed(show);
        });

        const newlyOpenedKey = this.openedItem();
        const openToolPanelChanged = currentlyOpenedKey !== newlyOpenedKey;
        if (openToolPanelChanged) {
            this.sideBarButtonsComp.setActiveButton(key);
            this.raiseToolPanelVisibleEvent(key, currentlyOpenedKey ?? undefined, source);
        }
    }

    public getToolPanelInstance(key: string): IToolPanel | undefined {
        const toolPanelWrapper = this.toolPanelWrappers.filter((toolPanel) => toolPanel.getToolPanelId() === key)[0];

        if (!toolPanelWrapper) {
            console.warn(`AG Grid: unable to lookup Tool Panel as invalid key supplied: ${key}`);
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
        if (previousKey) {
            const event: WithoutGridCommon<ToolPanelVisibleChangedEvent> = {
                type: Events.EVENT_TOOL_PANEL_VISIBLE_CHANGED,
                source,
                key: previousKey,
                visible: false,
                switchingToolPanel,
            };
            this.eventService.dispatchEvent(event);
        }
        if (key) {
            const event: WithoutGridCommon<ToolPanelVisibleChangedEvent> = {
                type: Events.EVENT_TOOL_PANEL_VISIBLE_CHANGED,
                source,
                key,
                visible: true,
                switchingToolPanel,
            };
            this.eventService.dispatchEvent(event);
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
        this.toolPanelWrappers.forEach((wrapper) => {
            if (wrapper.isDisplayed()) {
                activeToolPanel = wrapper.getToolPanelId();
            }
        });
        return activeToolPanel;
    }

    private onSideBarUpdated(): void {
        const sideBarDef = SideBarDefParser.parse(this.gos.get('sideBar'));

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
                const toolPanelWrapper = this.toolPanelWrappers.find((toolPanel) => toolPanel.getToolPanelId() === id);
                if (!toolPanelWrapper) {
                    return;
                }
                const params = this.gos.addGridCommonParams<IToolPanelParams>({
                    ...(toolPanelDef.toolPanelParams ?? {}),
                    onStateUpdated: () => this.eventService.dispatchEvent({ type: Events.EVENT_SIDE_BAR_UPDATED }),
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
        this.setSideBarDef({ sideBarDef, existingToolPanelWrappers });
    }

    private destroyToolPanelWrappers(): void {
        this.toolPanelWrappers.forEach((wrapper) => {
            _removeFromParent(wrapper.getGui());
            this.destroyBean(wrapper);
        });
        this.toolPanelWrappers.length = 0;
    }

    protected destroy(): void {
        this.destroyToolPanelWrappers();
        super.destroy();
    }
}
