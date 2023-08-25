import {
    AdvancedFilterModel,
    Autowired,
    ColumnAdvancedFilterModel,
    Component,
    FilterManager,
    JoinAdvancedFilterModel,
    KeyCode,
    PostConstruct,
    RefSelector,
    VirtualList,
    VirtualListDragItem,
    _
} from "@ag-grid-community/core";
import { AdvancedFilterBuilderDragFeature } from "./advancedFilterBuilderDragFeature";
import { AdvancedFilterBuilderRowAddComp, AdvancedFilterBuilderRowComp, AdvancedFilterBuilderRowParams } from "./advancedFilterBuilderRowComp";
import { AdvancedFilterExpressionService } from "./advancedFilterExpressionService";
import { AdvancedFilterService } from "./advancedFilterService";

export class AdvancedFilterBuilderComp extends Component {
    @RefSelector('eList') private eList: HTMLElement;
    @RefSelector('eApplyFilterButton') private eApplyFilterButton: HTMLElement;
    @RefSelector('eCancelFilterButton') private eCancelFilterButton: HTMLElement;
    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('advancedFilterService') private advancedFilterService: AdvancedFilterService;
    @Autowired('advancedFilterExpressionService') private advancedFilterExpressionService: AdvancedFilterExpressionService;

    private virtualList: VirtualList;
    private filterModel: AdvancedFilterModel;
    private stringifiedModel: string;
    private rows: AdvancedFilterBuilderRowParams[];
    private removeEditor: (() => void) | undefined;

    constructor() {
        super(/* html */ `
            <div role="presentation" class="ag-advanced-filter-builder" style="height: 100%; width: 100%; background-color: var(--ag-control-panel-background-color); display: flex; flex-direction: column" tabindex="-1">
                <div class="ag-autocomplete-list ag-advanced-filter-builder-list" style="flex: 1" ref="eList"></div>
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
        this.virtualList.refresh();

        this.createManagedBean(new AdvancedFilterBuilderDragFeature(this, this.virtualList));

        this.eApplyFilterButton.innerText = this.advancedFilterExpressionService.translate('advancedFilterApply');
        this.activateTabIndex([this.eApplyFilterButton]);
        this.eApplyFilterButton.addEventListener('click', () => {
            this.advancedFilterService.setModel(this.filterModel);
            this.filterManager.onFilterChanged({ source: 'advancedFilter' });
            this.close();
        });
        _.setDisabled(this.eApplyFilterButton, true);
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

    public getNumRows(): number {
        return this.rows.length;
    }

    public moveRow(row: AdvancedFilterBuilderRowParams | null, destination: VirtualListDragItem<AdvancedFilterBuilderRowComp> | null): void {
        if (!destination || !row) { return; }
        const destinationRow = this.rows[destination.rowIndex];
        const destinationParent = destinationRow.parent;

        // trying to move before the root
        if (!destinationParent) { return; }

        // can't move into itself
        if (this.isChildOrSelf(destinationParent, row.filterModel!)) { return; }

        const sourceParentIndex = row.parent!.conditions.indexOf(row.filterModel!);
        row.parent!.conditions.splice(sourceParentIndex, 1);
        let destinationParentIndex = destinationParent.conditions.indexOf(destinationRow.filterModel!);
        if (destinationParentIndex === -1) {
            destinationParentIndex = destinationParent.conditions.length
        } else if (destination.position === 'bottom') {
            destinationParentIndex += 1;
        }
        destinationParent.conditions.splice(destinationParentIndex, 0, row.filterModel!);
        this.buildListAndRestoreValidity();
        this.validate();
    }

    private isChildOrSelf(modelToCheck: AdvancedFilterModel, potentialParentModel: AdvancedFilterModel): boolean {
        return modelToCheck === potentialParentModel || (
            potentialParentModel.filterType === 'join' &&
            potentialParentModel.conditions.some(condition => this.isChildOrSelf(modelToCheck, condition))
        );
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
        this.stringifiedModel = JSON.stringify(this.filterModel);
    }

    private buildList(): void {
        const parseFilterModel = (filterModel: AdvancedFilterModel, rows: AdvancedFilterBuilderRowParams[], level: number, parent?: JoinAdvancedFilterModel) => {
            rows.push({ filterModel, level, parent, valid: true });
            if (filterModel.filterType === 'join') {
                filterModel.conditions.forEach(childFilterModel => parseFilterModel(childFilterModel, rows, level + 1, filterModel));
                rows.push({ filterModel: null, level: level + 1, parent: filterModel, valid: true })
            }
        }
        this.rows = [];
        parseFilterModel(this.filterModel, this.rows, 0);
    }

    private buildListAndRestoreValidity(): void {
        const invalidModels: AdvancedFilterModel[] = [];
        this.rows.forEach(row => {
            if (!row.valid) {
                invalidModels.push(row.filterModel!);
            }
        });
        this.buildList();
        if (invalidModels.length) {
            this.rows.forEach(row => {
                if (row.filterModel && invalidModels.includes(row.filterModel)) {
                    row.valid = false;
                }
            });
        }
        this.virtualList.refresh();
    }

    private createRowComponent(rowParams: AdvancedFilterBuilderRowParams): Component {
        const row = rowParams.filterModel ? new AdvancedFilterBuilderRowComp(rowParams) : new AdvancedFilterBuilderRowAddComp(rowParams);
        row.addEventListener('remove', ({ row }: any) => {
            const index = this.rows.indexOf(row);
            if (index >= 0) {
                this.rows.splice(index, 1);
                this.virtualList.refresh(true);
            } else {
                this.buildListAndRestoreValidity();
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
        row.addEventListener('valueChanged', () => this.validate());
        row.addEventListener('add', ({ row, isJoin }:  any) => {
            const { parent, level } = row;
            const filterModel = isJoin ? {
                filterType: 'join',
                type: 'AND',
                conditions: []
            } as JoinAdvancedFilterModel : {} as ColumnAdvancedFilterModel;
            parent.conditions.push(filterModel);
            const index = this.rows.indexOf(row);
            if (index >= 0) {
                const newRows: AdvancedFilterBuilderRowParams[] = [{
                    filterModel,
                    level,
                    parent,
                    valid: isJoin
                }];
                if (isJoin) {
                    newRows.push({
                        filterModel: null,
                        level: level + 1,
                        valid: true,
                        parent: filterModel as JoinAdvancedFilterModel
                    })
                }
                this.rows.splice(index, 0, ...newRows);
                this.virtualList.refresh(true);
            } else {
                this.buildListAndRestoreValidity();
            }
            this.validate();
        });

        this.getContext().createBean(row);

        return row;
    }

    private close(): void {
        this.advancedFilterService.getCtrl().toggleFilterBuilder();
    }

    private validate(): void {
        let disableApply = !this.rows.every(({ valid }) => valid);
        if (!disableApply) {
            disableApply = JSON.stringify(this.filterModel) === this.stringifiedModel;
        }
        _.setDisabled(this.eApplyFilterButton, disableApply);
        // TODO - show invalid somehow
    }
}