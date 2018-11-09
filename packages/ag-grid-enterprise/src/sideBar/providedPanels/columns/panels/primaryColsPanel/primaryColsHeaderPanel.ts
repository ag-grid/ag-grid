import {
    _,
    Autowired,
    Column,
    ColumnController,
    Component,
    Context,
    Events,
    EventService,
    GridOptionsWrapper,
    PostConstruct,
    PreConstruct,
    RefSelector
} from "ag-grid-community/main";
import {ToolPanelColumnCompParams} from "../../columnToolPanel";

export enum SELECTED_STATE {CHECKED, UNCHECKED, INDETERMINIATE}

export class PrimaryColsHeaderPanel extends Component {

    @Autowired('context') private context: Context;

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('eventService') private eventService: EventService;

    @RefSelector('eFilterTextField')
    private eFilterTextField: HTMLInputElement;

    @RefSelector('eSelectChecked') private eSelectChecked: HTMLElement;
    @RefSelector('eSelectUnchecked') private eSelectUnchecked: HTMLElement;
    @RefSelector('eSelectIndeterminate') private eSelectIndeterminate: HTMLElement;

    @RefSelector('eExpandChecked') private eExpandChecked: HTMLElement;
    @RefSelector('eExpandUnchecked') private eExpandUnchecked: HTMLElement;
    @RefSelector('eExpandIndeterminate') private eExpandIndeterminate: HTMLElement;

    @RefSelector('eExpand') private eExpand: HTMLElement;
    @RefSelector('eSelect') private eSelect: HTMLElement;
    @RefSelector('eFilterWrapper') private eFilterWrapper: HTMLElement;

    private onFilterTextChangedDebounced: () => void;

    private expandState: SELECTED_STATE = SELECTED_STATE.CHECKED;
    private selectState: SELECTED_STATE = SELECTED_STATE.CHECKED;

    private props: {
        params: ToolPanelColumnCompParams;
    };


    @PreConstruct
    private preConstruct(): void {

        let translate = this.gridOptionsWrapper.getLocaleTextFunc();

        this.setTemplate(
            `<div class="ag-primary-cols-header-panel">
            <a href="javascript:void(0)" (click)="onExpandClicked" ref="eExpand">
                <span class="ag-icon ag-icon-tree-open" ref="eExpandChecked"></span>
                <span class="ag-icon ag-icon-tree-closed" ref="eExpandUnchecked"></span>
                <span class="ag-icon ag-icon ag-icon-tree-indeterminate" ref="eExpandIndeterminate"></span>
            </a>
            <a href="javascript:void(0)" (click)="onSelectClicked" ref="eSelect">
                <span class="ag-icon ag-icon-checkbox-checked" ref="eSelectChecked"></span>
                <span class="ag-icon ag-icon-checkbox-unchecked" ref="eSelectUnchecked"></span>
                <span class="ag-icon ag-icon-checkbox-indeterminate" ref="eSelectIndeterminate"></span>
            </a>
            <div class="ag-primary-cols-filter-wrapper" ref="eFilterWrapper">
                <input class="ag-primary-cols-filter" ref="eFilterTextField" type="text" placeholder="${translate('filterOoo', 'Filter...')}" (input)="onFilterTextChanged">        
            </div>
        </div>`);
    }

    @PostConstruct
    public init(params: ToolPanelColumnCompParams): void {
        this.instantiate(this.context);
        this.addEventListeners();

        if (this.columnController.isReady()) {
            this.setColumnsCheckedState();
            this.showOrHideOptions();
        }
        this.setExpandState(SELECTED_STATE.CHECKED);
    }

    // we only show expand / collapse if we are showing columns
    private showOrHideOptions(): void {

        let showFilter = !this.props.params.suppressColumnFilter;
        let showSelect = !this.props.params.suppressColumnSelectAll;
        let showExpand = !this.props.params.suppressColumnExpandAll;

        let groupsPresent = this.columnController.isPrimaryColumnGroupsPresent();

        _.setVisible(this.eFilterWrapper, showFilter);
        _.setVisible(this.eSelect, showSelect);
        _.setVisible(this.eExpand, showExpand && groupsPresent);
    }

    private addEventListeners(): void {
        let eventsImpactingCheckedState: string[] = [
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
                let filterText = this.eFilterTextField.value;
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
            columns = allPrimaryColumns.filter(col => !col.isLockVisible())
        }
        let pivotMode = this.columnController.isPivotMode();

        let checkedCount = 0;
        let uncheckedCount = 0;

        columns.forEach(col => {

            // ignore lock visible columns
            if (col.isLockVisible()) {
                return;
            }

            // not not count columns not in tool panel
            let colDef = col.getColDef();
            if (colDef && colDef.suppressToolPanel) {
                return;
            }

            let checked: boolean;
            if (pivotMode) {
                let noPivotModeOptionsAllowed = !col.isAllowPivot() && !col.isAllowRowGroup() && !col.isAllowValue();
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
