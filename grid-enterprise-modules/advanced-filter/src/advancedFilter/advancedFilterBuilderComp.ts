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
import {
    AdvancedFilterBuilderAddEvent,
    AdvancedFilterBuilderEditStartedEvent,
    AdvancedFilterBuilderRemoveEvent,
    AdvancedFilterBuilderItemAddComp,
    AdvancedFilterBuilderItemComp,
    AdvancedFilterBuilderItem
 } from "./advancedFilterBuilderItemComp";
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
    private items: AdvancedFilterBuilderItem[];
    private removeEditor: (() => void) | undefined;
    private dragFeature: AdvancedFilterBuilderDragFeature;

    constructor() {
        super(/* html */ `
            <div role="presentation" class="ag-advanced-filter-builder" tabindex="-1">
                <div class="ag-advanced-filter-builder-list" ref="eList"></div>
                <div class="ag-advanced-filter-builder-button-panel">
                    <button class="ag-button ag-standard-button ag-advanced-filter-builder-button" ref="eApplyFilterButton"></button>
                    <button class="ag-button ag-standard-button ag-advanced-filter-builder-button" ref="eCancelFilterButton"></button>
                </div>
            </div>`);
    }

    @PostConstruct
    private postConstruct(): void {
        this.setupFilterModel();

        this.virtualList = this.createManagedBean(new VirtualList({ cssIdentifier: 'autocomplete' }));
        this.virtualList.setComponentCreator(this.createItemComponent.bind(this));
        this.virtualList.setComponentUpdater(() => {});
        this.virtualList.setRowHeight(40);
        this.eList.appendChild(this.virtualList.getGui());

        this.virtualList.setModel({
            getRowCount: () => this.items.length,
            getRow: (index: number) => this.items[index],
            areRowsEqual: (oldRow: AdvancedFilterBuilderItem, newRow: AdvancedFilterBuilderItem) => oldRow === newRow
        });
        this.buildList();
        this.virtualList.refresh();

        this.dragFeature = this.createManagedBean(new AdvancedFilterBuilderDragFeature(this, this.virtualList));

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

    public getNumItems(): number {
        return this.items.length;
    }

    public moveItem(item: AdvancedFilterBuilderItem | null, destination: VirtualListDragItem<AdvancedFilterBuilderItemComp> | null): void {
        if (!destination || !item) { return; }
        const destinationItem = this.items[destination.rowIndex];
        const destinationParent = destinationItem.parent;

        // trying to move before the root
        if (!destinationParent) { return; }

        // can't move into itself
        if (this.isChildOrSelf(destinationParent, item.filterModel!)) { return; }

        const sourceParentIndex = item.parent!.conditions.indexOf(item.filterModel!);
        item.parent!.conditions.splice(sourceParentIndex, 1);
        let destinationParentIndex = destinationParent.conditions.indexOf(destinationItem.filterModel!);
        if (destinationParentIndex === -1) {
            destinationParentIndex = destinationParent.conditions.length
        } else if (destination.position === 'bottom') {
            destinationParentIndex += 1;
        }
        destinationParent.conditions.splice(destinationParentIndex, 0, item.filterModel!);
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
        const parseFilterModel = (filterModel: AdvancedFilterModel, items: AdvancedFilterBuilderItem[], level: number, parent?: JoinAdvancedFilterModel) => {
            items.push({ filterModel, level, parent, valid: true });
            if (filterModel.filterType === 'join') {
                filterModel.conditions.forEach(childFilterModel => parseFilterModel(childFilterModel, items, level + 1, filterModel));
                items.push({ filterModel: null, level: level + 1, parent: filterModel, valid: true })
            }
        }
        this.items = [];
        parseFilterModel(this.filterModel, this.items, 0);
    }

    private buildListAndRestoreValidity(): void {
        const invalidModels: AdvancedFilterModel[] = [];
        this.items.forEach(item => {
            if (!item.valid) {
                invalidModels.push(item.filterModel!);
            }
        });
        this.buildList();
        if (invalidModels.length) {
            this.items.forEach(item => {
                if (item.filterModel && invalidModels.includes(item.filterModel)) {
                    item.valid = false;
                }
            });
        }
        this.virtualList.refresh();
    }

    private createItemComponent(item: AdvancedFilterBuilderItem): Component {
        const itemComp = item.filterModel ? new AdvancedFilterBuilderItemComp(item, this.dragFeature) : new AdvancedFilterBuilderItemAddComp(item);
        itemComp.addEventListener(AdvancedFilterBuilderItemComp.REMOVE_EVENT, ({ item }: AdvancedFilterBuilderRemoveEvent) => {
            const isJoin = item.filterModel?.filterType === 'join';
            // if it's a join, we don't know how many children there are, so always rebuild
            const index = isJoin ? -1 : this.items.indexOf(item);
            if (index >= 0) {
                this.items.splice(index, 1);
                this.virtualList.refresh(true);
            } else {
                this.buildListAndRestoreValidity();
            }
            this.validate();
        });
        itemComp.addEventListener(AdvancedFilterBuilderItemComp.EDIT_STARTED_EVENT, ({ removeEditor }: AdvancedFilterBuilderEditStartedEvent) => {
            if (this.removeEditor) {
                this.removeEditor();
            }
            this.removeEditor = removeEditor;
        });
        itemComp.addEventListener(AdvancedFilterBuilderItemComp.EDIT_ENDED_EVENT, () => {
            this.removeEditor = undefined;
        });
        itemComp.addEventListener(AdvancedFilterBuilderItemComp.VALUE_CHANGED_EVENT, () => this.validate());
        itemComp.addEventListener(AdvancedFilterBuilderItemComp.ADD_EVENT, ({ item, isJoin }:  AdvancedFilterBuilderAddEvent) => {
            const { parent, level } = item;
            const filterModel = isJoin ? {
                filterType: 'join',
                type: 'AND',
                conditions: []
            } as JoinAdvancedFilterModel : {} as ColumnAdvancedFilterModel;
            parent!.conditions.push(filterModel);
            const index = this.items.indexOf(item);
            if (index >= 0) {
                const newItems: AdvancedFilterBuilderItem[] = [{
                    filterModel,
                    level,
                    parent,
                    valid: isJoin
                }];
                if (isJoin) {
                    newItems.push({
                        filterModel: null,
                        level: level + 1,
                        valid: true,
                        parent: filterModel as JoinAdvancedFilterModel
                    })
                }
                this.items.splice(index, 0, ...newItems);
                this.virtualList.refresh(true);
            } else {
                this.buildListAndRestoreValidity();
            }
            this.validate();
        });

        this.getContext().createBean(itemComp);

        return itemComp;
    }

    private close(): void {
        this.advancedFilterService.getCtrl().toggleFilterBuilder();
    }

    private validate(): void {
        let disableApply = !this.items.every(({ valid }) => valid);
        if (!disableApply) {
            disableApply = JSON.stringify(this.filterModel) === this.stringifiedModel;
        }
        _.setDisabled(this.eApplyFilterButton, disableApply);
        // TODO - show invalid somehow
    }
}