import { AdvancedFilterModel, Autowired, ColumnAdvancedFilterModel, Component, JoinAdvancedFilterModel, KeyCode, PostConstruct, RefSelector, VirtualList, _ } from "@ag-grid-community/core";
import { AdvancedFilterBuilderRowAddComp, AdvancedFilterBuilderRowComp, AdvancedFilterBuilderRowParams } from "./advancedFilterBuilderRowComp";
import { AdvancedFilterExpressionService } from "./advancedFilterExpressionService";
import { AdvancedFilterService } from "./advancedFilterService";

export class AdvancedFilterBuilderComp extends Component {
    @RefSelector('eList') private eList: HTMLElement;
    @RefSelector('eApplyFilterButton') private eApplyFilterButton: HTMLElement;
    @RefSelector('eCancelFilterButton') private eCancelFilterButton: HTMLElement;
    @Autowired('advancedFilterService') private advancedFilterService: AdvancedFilterService;
    @Autowired('advancedFilterExpressionService') private advancedFilterExpressionService: AdvancedFilterExpressionService;

    private virtualList: VirtualList;
    private filterModel: AdvancedFilterModel;
    private rows: AdvancedFilterBuilderRowParams[];
    private removeEditor: (() => void) | undefined;

    constructor() {
        super(/* html */ `
            <div role="presentation" style="height: 100%; width: 100%; background-color: var(--ag-control-panel-background-color); display: flex; flex-direction: column" tabindex="-1">
                <div class="ag-autocomplete-list" style="flex: 1" ref="eList"></div>
                <div style="display: flex; justify-content: flex-end; padding: var(--ag-widget-container-vertical-padding) var(--ag-widget-container-horizontal-padding); border-top: var(--ag-borders-secondary) var(--ag-secondary-border-color);">
                    <button class="ag-button ag-standard-button ag-advanced-filter-apply-button" ref="eApplyFilterButton"></button>
                    <button class="ag-button ag-standard-button ag-advanced-filter-apply-button" ref="eCancelFilterButton"></button>
                </div>
            </div>`);
    }

    @PostConstruct
    private postConstruct(): void {
        this.setupFilterModel();

        this.virtualList = this.createManagedBean(new VirtualList({ cssIdentifier: 'autocomplete' }));
        this.virtualList.setComponentCreator(this.createRowComponent.bind(this));
        this.virtualList.setComponentUpdater(() => {});
        this.virtualList.setRowHeight(40);
        this.eList.appendChild(this.virtualList.getGui());

        this.virtualList.setModel({
            getRowCount: () => this.rows.length,
            getRow: (index: number) => this.rows[index],
            areRowsEqual: (oldRow: AdvancedFilterBuilderRowParams, newRow: AdvancedFilterBuilderRowParams) => oldRow === newRow
        });
        this.buildList();

        this.eApplyFilterButton.innerText = this.advancedFilterExpressionService.translate('advancedFilterApply');
        this.activateTabIndex([this.eApplyFilterButton]);
        this.eApplyFilterButton.addEventListener('click', () => {
            this.advancedFilterService.setModel(this.filterModel);
            this.close();
        });
        this.eCancelFilterButton.innerText = 'Cancel';
        this.activateTabIndex([this.eCancelFilterButton]);
        this.eCancelFilterButton.addEventListener('click', () => this.close());

        this.addGuiEventListener('keydown', (event: KeyboardEvent) => {
            switch (event.key) {
            case KeyCode.ESCAPE:
                if (this.removeEditor) {
                    event.preventDefault();
                    event.stopPropagation();
                    this.removeEditor();
                }
                break;
            }
        });
    }

    private setupFilterModel(): void {
        this.filterModel = this.advancedFilterService.getModel() ?? {
            filterType: 'join',
            type: 'AND',
            conditions: []
        }
        if (this.filterModel.filterType !== 'join') {
            this.filterModel = {
                filterType: 'join',
                type: 'AND',
                conditions: [this.filterModel]
            };
        }
    }

    private buildList(): void {
        const parseFilterModel = (filterModel: AdvancedFilterModel, rows: AdvancedFilterBuilderRowParams[], level: number, parent?: AdvancedFilterModel) => {
            rows.push({ filterModel, level, parent, valid: true });
            if (filterModel.filterType === 'join') {
                filterModel.conditions.forEach(childFilterModel => parseFilterModel(childFilterModel, rows, level + 1, filterModel));
                rows.push({ filterModel: null, level: level + 1, parent: filterModel, valid: true })
            }
        }
        this.rows = [];
        parseFilterModel(this.filterModel, this.rows, 0);
        this.virtualList.refresh();
    }

    private createRowComponent(rowParams: AdvancedFilterBuilderRowParams): Component {
        const row = rowParams.filterModel ? new AdvancedFilterBuilderRowComp() : new AdvancedFilterBuilderRowAddComp();
        row.addEventListener('remove', ({ row }: any) => {
            const index = this.rows.indexOf(row);
            if (index >= 0) {
                this.rows.splice(index, 1);
                this.virtualList.refresh(true);
            } else {
                this.buildList();
            }
            this.validate();
        });
        row.addEventListener('editStart', ({ removeEditor }: any) => {
            if (this.removeEditor) {
                this.removeEditor();
            }
            this.removeEditor = removeEditor;
        });
        row.addEventListener('editEnd', () => {
            this.removeEditor = undefined;
        });
        row.addEventListener('validChanged', () => this.validate());
        row.addEventListener('add', ({ row }:  any) => {
            const { parent, level } = row;
            const filterModel = {} as ColumnAdvancedFilterModel;
            (parent as JoinAdvancedFilterModel).conditions.push(filterModel);
            const newRow: AdvancedFilterBuilderRowParams = {
                filterModel,
                level,
                parent,
                valid: false
            }
            const index = this.rows.indexOf(row);
            if (index >= 0) {
                this.rows.splice(index, 0, newRow);
                this.virtualList.refresh(true);
            } else {
                this.buildList();
            }
            this.validate();
        });

        this.getContext().createBean(row);

        row.setState(rowParams);

        return row;
    }

    private close(): void {
        this.advancedFilterService.getCtrl().toggleFilterBuilder();
    }

    private validate(): void {
        const valid = this.rows.every(({ valid }) => valid);
        _.setDisabled(this.eApplyFilterButton, !valid);
        // TODO - show invalid somehow
    }
}