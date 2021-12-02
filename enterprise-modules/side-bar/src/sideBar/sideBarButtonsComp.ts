import {
    Autowired,
    AgEvent,
    Component,
    PostConstruct,
    ToolPanelDef,
    PreDestroy,
    FocusService,
    _,
    KeyCode,
    ColumnModel
} from "@ag-grid-community/core";

import { SideBarButtonComp } from "./sideBarButtonComp";

export interface SideBarButtonClickedEvent extends AgEvent {
    toolPanelId: string;
}

export class SideBarButtonsComp extends Component {

    public static EVENT_SIDE_BAR_BUTTON_CLICKED = 'sideBarButtonClicked';
    private static readonly TEMPLATE: string = /* html */ `<div class="ag-side-buttons" role="tablist"></div>`;
    private buttonComps: SideBarButtonComp[] = [];

    @Autowired('focusService') private focusService: FocusService;
    @Autowired('columnModel') private columnModel: ColumnModel;

    constructor() {
        super(SideBarButtonsComp.TEMPLATE);
    }

    @PostConstruct
    private postConstruct(): void {
        this.addManagedListener(this.getFocusableElement(), 'keydown', this.handleKeyDown.bind(this));
    }

    private handleKeyDown(e: KeyboardEvent): void {
        if (e.key !== KeyCode.TAB || !e.shiftKey) { return; }

        const lastColumn = _.last(this.columnModel.getAllDisplayedColumns());

        if (this.focusService.focusGridView(lastColumn, true)) {
            e.preventDefault();
        }
    }

    public setToolPanelDefs(toolPanelDefs: ToolPanelDef[]): void {
        toolPanelDefs.forEach(this.addButtonComp.bind(this));
    }

    public setActiveButton(id: string | undefined): void {
        this.buttonComps.forEach(comp => {
            comp.setSelected(id === comp.getToolPanelId());
        });
    }

    private addButtonComp(def: ToolPanelDef): void {
        const buttonComp = this.createBean(new SideBarButtonComp(def));
        this.buttonComps.push(buttonComp);
        this.appendChild(buttonComp);

        buttonComp.addEventListener(SideBarButtonComp.EVENT_TOGGLE_BUTTON_CLICKED, () => {
            this.dispatchEvent({
                type: SideBarButtonsComp.EVENT_SIDE_BAR_BUTTON_CLICKED,
                toolPanelId: def.id
            });
        });
    }

    @PreDestroy
    public clearButtons(): void {
        this.buttonComps = this.destroyBeans(this.buttonComps);
        _.clearElement(this.getGui());
    }

}
