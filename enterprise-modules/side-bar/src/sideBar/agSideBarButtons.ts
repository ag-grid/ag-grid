import type {
    AgComponentSelector,
    AgEvent,
    BeanCollection,
    FocusService,
    ToolPanelDef,
    VisibleColsService,
} from '@ag-grid-community/core';
import { Component, KeyCode, _clearElement, _last } from '@ag-grid-community/core';

import { SideBarButtonComp } from './sideBarButtonComp';

export interface SideBarButtonClickedEvent extends AgEvent {
    toolPanelId: string;
}

export class AgSideBarButtons extends Component {
    private focusService: FocusService;
    private visibleColsService: VisibleColsService;

    public override wireBeans(beans: BeanCollection) {
        super.wireBeans(beans);
        this.focusService = beans.focusService;
        this.visibleColsService = beans.visibleColsService;
    }

    static readonly selector: AgComponentSelector = 'AG-SIDE-BAR-BUTTONS';

    public static EVENT_SIDE_BAR_BUTTON_CLICKED = 'sideBarButtonClicked';
    private static readonly TEMPLATE: string = /* html */ `<div class="ag-side-buttons" role="tablist"></div>`;
    private buttonComps: SideBarButtonComp[] = [];

    constructor() {
        super(AgSideBarButtons.TEMPLATE);
    }

    public postConstruct(): void {
        this.addManagedListener(this.getFocusableElement(), 'keydown', this.handleKeyDown.bind(this));
    }

    private handleKeyDown(e: KeyboardEvent): void {
        if (e.key !== KeyCode.TAB || !e.shiftKey) {
            return;
        }

        const lastColumn = _last(this.visibleColsService.getAllCols());

        if (this.focusService.focusGridView(lastColumn, true)) {
            e.preventDefault();
        }
    }

    public setActiveButton(id: string | undefined): void {
        this.buttonComps.forEach((comp) => {
            comp.setSelected(id === comp.getToolPanelId());
        });
    }

    public addButtonComp(def: ToolPanelDef): SideBarButtonComp {
        const buttonComp = this.createBean(new SideBarButtonComp(def));
        this.buttonComps.push(buttonComp);
        this.appendChild(buttonComp);

        buttonComp.addEventListener(SideBarButtonComp.EVENT_TOGGLE_BUTTON_CLICKED, () => {
            this.dispatchEvent({
                type: AgSideBarButtons.EVENT_SIDE_BAR_BUTTON_CLICKED,
                toolPanelId: def.id,
            });
        });

        return buttonComp;
    }

    public clearButtons(): void {
        this.destroyBeans(this.buttonComps);
        this.buttonComps = [];
        _clearElement(this.getGui());
        super.destroy();
    }

    public override destroy(): void {
        this.clearButtons();
        super.destroy();
    }
}
