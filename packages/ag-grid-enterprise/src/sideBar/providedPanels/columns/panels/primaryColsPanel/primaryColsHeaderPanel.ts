import {
    Autowired,
    Column,
    ColumnController,
    Component,
    Events,
    EventService,
    GridOptionsWrapper,
    PostConstruct,
    PreConstruct,
    RefSelector,
    _
} from "ag-grid-community/main";
import { ToolPanelColumnCompParams } from "../../columnToolPanel";

export enum SELECTED_STATE {CHECKED, UNCHECKED, INDETERMINIATE}

export class PrimaryColsHeaderPanel extends Component {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('eventService') private eventService: EventService;

    @RefSelector('eFilterTextField')

    private eFilterTextField: HTMLInputElement;
    private eSelectChecked: HTMLElement;
    private eSelectUnchecked: HTMLElement;
    private eSelectIndeterminate: HTMLElement;

    @RefSelector('eExpandChecked') private eExpandChecked: HTMLElement;
    @RefSelector('eExpandUnchecked') private eExpandUnchecked: HTMLElement;
    @RefSelector('eExpandIndeterminate') private eExpandIndeterminate: HTMLElement;

    @RefSelector('eExpand') private eExpand: HTMLElement;
    @RefSelector('eSelect') private eSelect: HTMLElement;
    @RefSelector('eFilterWrapper') private eFilterWrapper: HTMLElement;

    private onFilterTextChangedDebounced: () => void;

    private expandState: SELECTED_STATE = SELECTED_STATE.CHECKED;
    private selectState: SELECTED_STATE = SELECTED_STATE.CHECKED;

    private params: ToolPanelColumnCompParams;

    @PreConstruct
    private preConstruct(): void {
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();

        this.setTemplate(
        `<div class="ag-primary-cols-header-panel">
            <div ref="eExpand">
                <span class="ag-icon ag-icon-tree-open" ref="eExpandChecked"></span>
                <span class="ag-icon ag-icon-tree-closed" ref="eExpandUnchecked"></span>
                <span class="ag-icon ag-icon ag-icon-tree-indeterminate" ref="eExpandIndeterminate"></span>
            </div>
            <div ref="eSelect"></div>
            <div class="ag-input-text-wrapper ag-primary-cols-filter-wrapper" ref="eFilterWrapper">
                <input class="ag-primary-cols-filter" ref="eFilterTextField" type="text" placeholder="${translate('filterOoo', 'Filter...')}">        
            </div>
        </div>`);
    }

    @PostConstruct
    public postConstruct(): void {
        this.addEventListeners();
        this.createCheckIcons();
        this.setExpandState(SELECTED_STATE.CHECKED);

        this.addDestroyableEventListener(this.eExpand, 'click', this.onExpandClicked.bind(this));
        this.addDestroyableEventListener(this.eSelect, 'click', this.onSelectClicked.bind(this));
        this.addDestroyableEventListener(this.eFilterTextField, 'input', this.onFilterTextChanged.bind(this));
    }

    public init(params: ToolPanelColumnCompParams): void {
        this.params = params;

        if (this.columnController.isReady()) {
            this.setColumnsCheckedState();
            this.showOrHideOptions();
        }
    }

    private createCheckIcons() {
        const eSelectChecked = this.eSelectChecked = _.createIconNoSpan('checkboxChecked', this.gridOptionsWrapper, null);
        const eSelectUnchecked = this.eSelectUnchecked = _.createIconNoSpan('checkboxUnchecked', this.gridOptionsWrapper, null);
        const eSelectIndeterminate = this.eSelectIndeterminate =  _.createIconNoSpan('checkboxIndeterminate', this.gridOptionsWrapper, null);
        
        this.eSelect.appendChild(eSelectChecked);
        this.eSelect.appendChild(eSelectUnchecked);
        this.eSelect.appendChild(eSelectIndeterminate);
    }

    // we only show expand / collapse if we are showing columns
    private showOrHideOptions(): void {

        const showFilter = !this.params.suppressColumnFilter;
        const showSelect = !this.params.suppressColumnSelectAll;
        const showExpand = !this.params.suppressColumnExpandAll;

        const groupsPresent = this.columnController.isPrimaryColumnGroupsPresent();

        _.setVisible(this.eFilterWrapper, showFilter);
        _.setVisible(this.eSelect, showSelect);
        _.setVisible(this.eExpand, showExpand && groupsPresent);
    }

    private addEventListeners(): void {
        const eventsImpactingCheckedState: string[] = [
            Events.EVENT_COLUMN_EVERYTHING_CHANGED, // api.setColumnState() called
            Events.EVENT_COLUMN_PIVOT_CHANGED,
            Events.EVENT_COLUMN_PIVOT_MODE_CHANGED,
            Events.EVENT_COLUMN_ROW_GROUP_CHANGED,
            Events.EVENT_COLUMN_VALUE_CHANGED,
            Events.EVENT_COLUMN_VISIBLE,
            Events.EVENT_NEW_COLUMNS_LOADED
        ];

        eventsImpactingCheckedState.forEach(event => {
            this.addDestroyableEventListener(this.eventService, event, this.setColumnsCheckedState.bind(this));
        });

        this.addDestroyableEventListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.showOrHideOptions.bind(this));
    }

    private onFilterTextChanged(): void {
        if (!this.onFilterTextChangedDebounced) {
            this.onFilterTextChangedDebounced = _.debounce(() => {
                const filterText = this.eFilterTextField.value;
                this.dispatchEvent({type: 'filterChanged', filterText: filterText});
            }, 400);
        }

        this.onFilterTextChangedDebounced();
    }

    private onSelectClicked(): void {
        // here we just fire the event. the following happens is the flow of events:
        // 1. event here fired.
        // 2. toolpanel updates the columns.
        // 3. column controller fires events of column updated
        // 4. update in this panel is updated based on events fired by column controller
        if (this.selectState === SELECTED_STATE.CHECKED) {
            this.dispatchEvent({type: 'unselectAll'});
        } else {
            this.dispatchEvent({type: 'selectAll'});
        }
    }

    private onExpandClicked(): void {
        if (this.expandState === SELECTED_STATE.CHECKED) {
            this.dispatchEvent({type: 'collapseAll'});
        } else {
            this.dispatchEvent({type: 'expandAll'});
        }
    }

    public setExpandState(state: SELECTED_STATE): void {
        this.expandState = state;

        _.setVisible(this.eExpandChecked, this.expandState === SELECTED_STATE.CHECKED);
        _.setVisible(this.eExpandUnchecked, this.expandState === SELECTED_STATE.UNCHECKED);
        _.setVisible(this.eExpandIndeterminate, this.expandState === SELECTED_STATE.INDETERMINIATE);
    }

    private setColumnsCheckedState(): void {

        const allPrimaryColumns = this.columnController.getAllPrimaryColumns();
        let columns: Column[] = [];
        if (allPrimaryColumns !== null) {
            columns = allPrimaryColumns.filter(col => !col.getColDef().lockVisible)
        }
        const pivotMode = this.columnController.isPivotMode();

        let checkedCount = 0;
        let uncheckedCount = 0;

        columns.forEach(col => {

            // ignore lock visible columns
            if (col.getColDef().lockVisible) {
                return;
            }

            // not not count columns not in tool panel
            const colDef = col.getColDef();
            if (colDef && colDef.suppressToolPanel) {
                return;
            }

            let checked: boolean;
            if (pivotMode) {
                const noPivotModeOptionsAllowed = !col.isAllowPivot() && !col.isAllowRowGroup() && !col.isAllowValue();
                if (noPivotModeOptionsAllowed) {
                    return;
                }
                checked = col.isValueActive() || col.isPivotActive() || col.isRowGroupActive();
            } else {
                checked = col.isVisible();
            }

            if (checked) {
                checkedCount++;
            } else {
                uncheckedCount++;
            }
        });

        if (checkedCount > 0 && uncheckedCount > 0) {
            this.selectState = SELECTED_STATE.INDETERMINIATE;
        } else if (uncheckedCount > 0) {
            this.selectState = SELECTED_STATE.UNCHECKED;
        } else {
            this.selectState = SELECTED_STATE.CHECKED;
        }

        _.setVisible(this.eSelectChecked, this.selectState === SELECTED_STATE.CHECKED);
        _.setVisible(this.eSelectUnchecked, this.selectState === SELECTED_STATE.UNCHECKED);
        _.setVisible(this.eSelectIndeterminate, this.selectState === SELECTED_STATE.INDETERMINIATE);
    }
}
