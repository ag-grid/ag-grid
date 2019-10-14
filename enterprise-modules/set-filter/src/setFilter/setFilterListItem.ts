import {
    _,
    AgEvent,
    Autowired,
    ColDef,
    Column,
    Component,
    GridOptionsWrapper,
    ICellRendererComp,
    ISetFilterParams,
    PostConstruct,
    Promise,
    UserComponentFactory,
    ValueFormatterService
} from "ag-grid-community";

export interface SelectedEvent extends AgEvent {
}

export class SetFilterListItem extends Component {

    public static EVENT_SELECTED = 'selected';

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('valueFormatterService') private valueFormatterService: ValueFormatterService;
    @Autowired('userComponentFactory') private userComponentFactory: UserComponentFactory;

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

    private useCellRenderer(
        target: ColDef,
        eTarget: HTMLElement,
        params: any
    ): Promise<ICellRendererComp> {
        const cellRendererPromise: Promise<ICellRendererComp> = this.userComponentFactory.newCellRenderer((target.filterParams as ISetFilterParams), params);
        if (cellRendererPromise != null) {
            _.bindCellRendererToHtmlElement(cellRendererPromise, eTarget);
        } else {
            if (params.valueFormatted == null && params.value == null) {
                const localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
                eTarget.innerText = '(' + localeTextFunc('blanks', 'Blanks') + ')';
            } else {
                eTarget.innerText = params.valueFormatted != null ? params.valueFormatted : params.value;
            }
        }
        return cellRendererPromise;
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
            mouseEvent.preventDefault();
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
        const params = {
            value: this.value,
            valueFormatted: valueFormatted,
            api: this.gridOptionsWrapper.getApi()
        };

        const componentPromise: Promise<ICellRendererComp> = this.useCellRenderer(colDef, valueElement, params);

        if (!componentPromise) { return; }

        componentPromise.then(component => {
            if (component && component.destroy) {
                this.addDestroyFunc(component.destroy.bind(component));
            }
        });
    }
}
