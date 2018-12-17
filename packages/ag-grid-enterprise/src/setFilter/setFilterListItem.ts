import {
    AgEvent,
    Autowired,
    CellRendererService,
    Column,
    Component,
    GridOptionsWrapper,
    ICellRendererComp,
    PostConstruct,
    Promise,
    ValueFormatterService,
    _
} from "ag-grid-community";

export interface SelectedEvent extends AgEvent {
}

export class SetFilterListItem extends Component {

    public static EVENT_SELECTED = 'selected';

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('cellRendererService') private cellRendererService: CellRendererService;
    @Autowired('valueFormatterService') private valueFormatterService: ValueFormatterService;

    private static TEMPLATE =
        `<label class="ag-set-filter-item">
            <div class="ag-filter-checkbox"></div>
            <span class="ag-filter-value"></span>
        </label>`;

    private eCheckbox: HTMLElement;
    private eClickableArea: HTMLElement;
    private selected: boolean = true;

    private value: any;
    private column: Column;

    private eCheckedIcon: HTMLElement;
    private eUncheckedIcon: HTMLElement;

    constructor(value: any, column: Column) {
        super(SetFilterListItem.TEMPLATE);
        this.value = value;
        this.column = column;

    }

    @PostConstruct
    private init(): void {
        this.eCheckedIcon = _.createIconNoSpan('checkboxChecked', this.gridOptionsWrapper, this.column);
        this.eUncheckedIcon = _.createIconNoSpan('checkboxUnchecked', this.gridOptionsWrapper, this.column);
        this.eCheckbox = this.queryForHtmlElement(".ag-filter-checkbox");
        this.eClickableArea = this.getGui();

        this.updateCheckboxIcon();
        this.render();

        const listener = (mouseEvent: MouseEvent) => {
            _.addAgGridEventPath(mouseEvent);
            this.selected = !this.selected;
            this.updateCheckboxIcon();
            const event: SelectedEvent = {
                type: SetFilterListItem.EVENT_SELECTED
            };
            return this.dispatchEvent(event);
        };
        this.addDestroyableEventListener(this.eClickableArea, 'click', listener);
    }

    public isSelected(): boolean {
        return this.selected;
    }

    public setSelected(selected: boolean): void {
        this.selected = selected;
        this.updateCheckboxIcon();
    }

    private updateCheckboxIcon() {
        _.clearElement(this.eCheckbox);

        if (this.isSelected()) {
            this.eCheckbox.appendChild(this.eCheckedIcon);
        } else {
            this.eCheckbox.appendChild(this.eUncheckedIcon);
        }
    }

    public render(): void {
        const valueElement = this.queryForHtmlElement(".ag-filter-value");
        const valueFormatted = this.valueFormatterService.formatValue(this.column, null, null, this.value);

        const colDef = this.column.getColDef();
        const valueObj = {value: this.value, valueFormatted: valueFormatted};

        const componentPromise: Promise<ICellRendererComp> = this.cellRendererService.useFilterCellRenderer(colDef, valueElement, valueObj);

        if (!componentPromise) { return; }

        componentPromise.then(component => {
            if (component && component.destroy) {
                this.addDestroyFunc(component.destroy.bind(component));
            }
        });
    }
}
