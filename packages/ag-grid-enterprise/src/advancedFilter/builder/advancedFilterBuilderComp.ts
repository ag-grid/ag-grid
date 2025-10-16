import type {
    AdvancedFilterModel,
    BeanCollection,
    ColumnAdvancedFilterModel,
    ElementParams,
    FilterAction,
    FilterButtonEvent,
    FilterManager,
    IAdvancedFilterBuilderParams,
    JoinAdvancedFilterModel,
} from 'ag-grid-community';
import { Component, FilterButtonComp, RefPlaceholder, _exists, _removeFromParent } from 'ag-grid-community';

import type { VirtualListDragItem } from '../../features/iVirtualListDragFeature';
import { VirtualList } from '../../widgets/virtualList';
import type { AdvancedFilterExpressionService } from '../advancedFilterExpressionService';
import type { ADVANCED_FILTER_LOCALE_TEXT } from '../advancedFilterLocaleText';
import type { AdvancedFilterService } from '../advancedFilterService';
import { AdvancedFilterBuilderDragFeature } from './advancedFilterBuilderDragFeature';
import { AdvancedFilterBuilderItemAddComp } from './advancedFilterBuilderItemAddComp';
import { AdvancedFilterBuilderItemComp } from './advancedFilterBuilderItemComp';
import type {
    AdvancedFilterBuilderAddEvent,
    AdvancedFilterBuilderEvents,
    AdvancedFilterBuilderItem,
    AdvancedFilterBuilderMoveEvent,
    AdvancedFilterBuilderRemoveEvent,
} from './iAdvancedFilterBuilder';

const ButtonLocaleMap: Record<FilterAction, keyof typeof ADVANCED_FILTER_LOCALE_TEXT> = {
    apply: 'advancedFilterBuilderApply',
    clear: 'advancedFilterBuilderClear',
    cancel: 'advancedFilterBuilderCancel',
    reset: 'advancedFilterBuilderReset',
};

const AdvancedFilterBuilderElement: ElementParams = {
    tag: 'div',
    cls: 'ag-advanced-filter-builder',
    role: 'presentation',
    attrs: { tabindex: '-1' },
    children: [
        {
            tag: 'div',
            ref: 'eList',
            cls: 'ag-advanced-filter-builder-list',
            role: 'presentation',
        },
    ],
};
export class AdvancedFilterBuilderComp extends Component<AdvancedFilterBuilderEvents> {
    private filterManager?: FilterManager;
    private advancedFilter: AdvancedFilterService;
    private advFilterExpSvc: AdvancedFilterExpressionService;

    public wireBeans(beans: BeanCollection): void {
        this.filterManager = beans.filterManager;
        this.advancedFilter = beans.advancedFilter as AdvancedFilterService;
        this.advFilterExpSvc = beans.advFilterExpSvc as AdvancedFilterExpressionService;
    }

    private readonly eList: HTMLElement = RefPlaceholder;

    private eButtons?: FilterButtonComp;
    private params: IAdvancedFilterBuilderParams;

    private virtualList: VirtualList<AdvancedFilterBuilderItemComp | AdvancedFilterBuilderItemAddComp>;
    private filterModel: AdvancedFilterModel;
    private stringifiedModel: string;
    private items: AdvancedFilterBuilderItem[];
    private dragFeature: AdvancedFilterBuilderDragFeature;

    constructor() {
        super(AdvancedFilterBuilderElement);
    }

    public postConstruct(): void {
        const params = this.gos.get('advancedFilterBuilderParams');
        this.params = { buttons: ['apply', 'cancel'], ...params };
        this.addManagedPropertyListener('advancedFilterBuilderParams', ({ currentValue }) => {
            this.params.showMoveButtons = !!currentValue?.showMoveButtons;
            this.params.buttons = currentValue?.buttons ?? ['apply', 'cancel'];
            this.refreshList(false);
        });

        this.filterModel = this.setupFilterModel();
        this.setupVirtualList();

        this.dragFeature = this.createManagedBean(new AdvancedFilterBuilderDragFeature(this, this.virtualList));

        this.resetButtonsPanel(this.params.buttons);
    }

    public refresh(): void {
        const virtualList = this.virtualList;
        let indexToFocus = virtualList.getLastFocusedRow();
        this.setupFilterModel();
        this.validateItems();
        this.refreshList(false);
        if (indexToFocus != null) {
            // last focused row is cleared on focus out, so if defined, we need to put the focus back
            if (!virtualList.getComponentAt(indexToFocus)) {
                indexToFocus = 0;
            }
            virtualList.focusRow(indexToFocus);
        }
    }

    public getNumItems(): number {
        return this.items.length;
    }

    public moveItem(
        item: AdvancedFilterBuilderItem | null,
        destination: VirtualListDragItem<AdvancedFilterBuilderItemComp> | null
    ): void {
        if (!destination || !item) {
            return;
        }
        this.moveItemToIndex(item, destination.rowIndex, destination.position);
    }

    public afterGuiAttached(): void {
        this.virtualList.awaitStable(() => this.virtualList.focusRow(0));
    }

    private setupVirtualList(): void {
        const virtualList = (this.virtualList = this.createManagedBean(
            new VirtualList<
                AdvancedFilterBuilderItemComp | AdvancedFilterBuilderItemAddComp,
                AdvancedFilterBuilderItem
            >({
                cssIdentifier: 'advanced-filter-builder',
                ariaRole: 'tree',
                listName: this.advFilterExpSvc.translate('ariaAdvancedFilterBuilderList'),
                moveItemCallback: this.virtualListMoveItemCallback.bind(this),
            })
        ));

        virtualList.setComponentCreator(this.createItemComponent.bind(this));
        virtualList.setComponentUpdater(this.updateItemComponent.bind(this));
        virtualList.setRowHeight(40);
        this.eList.appendChild(virtualList.getGui());

        virtualList.setModel({
            getRowCount: () => this.items?.length || 0,
            getRow: (index: number) => this.items[index],
            areRowsEqual: (oldRow: AdvancedFilterBuilderItem, newRow: AdvancedFilterBuilderItem) => oldRow === newRow,
        });
        this.buildList();
        virtualList.refresh();
    }

    private resetButtonsPanel(actions?: FilterAction[]): void {
        const hasButtons = actions && actions.length > 0;

        let eButtonsPanel = this.eButtons;
        if (hasButtons) {
            const buttons = actions.map((type) => ({
                type,
                label: this.advFilterExpSvc.translate(ButtonLocaleMap[type]),
            }));

            if (!eButtonsPanel) {
                eButtonsPanel = this.createBean(new FilterButtonComp());
                this.appendChild(eButtonsPanel.getGui());
                const getListener =
                    (action: FilterAction) =>
                    ({ event }: FilterButtonEvent) => {
                        this.updateModel(action);
                        this.afterAction(action, event);
                    };
                eButtonsPanel.addManagedListeners(eButtonsPanel, {
                    apply: getListener('apply'),
                    clear: getListener('clear'),
                    reset: getListener('reset'),
                    cancel: getListener('cancel'),
                });

                this.eButtons = eButtonsPanel;
            }
            eButtonsPanel.updateButtons(buttons);
            const applyButton = eButtonsPanel.getApplyButton();
            if (applyButton) {
                const mouseListener = (isEnter: boolean) =>
                    this.toggleCss('ag-advanced-filter-builder-validation', isEnter);
                this.addManagedElementListeners(applyButton, {
                    mouseenter: () => mouseListener(true),
                    mouseleave: () => mouseListener(false),
                });
            }
        } else {
            if (eButtonsPanel) {
                _removeFromParent(eButtonsPanel.getGui());
                this.eButtons = this.destroyBean(eButtonsPanel);
            }
        }
    }

    private updateModel(action: FilterAction): void {
        switch (action) {
            case 'apply':
                this.advancedFilter.setModel(this.filterModel);
                this.filterManager?.onFilterChanged({ source: 'advancedFilter' });
                break;
            case 'reset':
                this.advancedFilter.setModel(null);
                this.filterManager?.onFilterChanged({ source: 'advancedFilter' });
                break;
            case 'cancel':
                break;
            case 'clear':
                this.filterModel = this.formatFilterModel(null);
                this.refreshList(false);
                break;
        }
    }

    private afterAction(action: FilterAction, event?: Event): void {
        switch (action) {
            case 'apply': {
                // Prevent form submission
                event?.preventDefault();
                this.close();
                break;
            }
            case 'reset': {
                this.close();
                break;
            }
            case 'cancel': {
                this.close();
                break;
            }
        }
    }

    private removeItemFromParent(item: AdvancedFilterBuilderItem): number {
        const sourceParentIndex = item.parent!.conditions.indexOf(item.filterModel!);
        item.parent!.conditions.splice(sourceParentIndex, 1);
        return sourceParentIndex;
    }

    private moveItemToIndex(
        item: AdvancedFilterBuilderItem,
        destinationRowIndex: number,
        destinationPosition: 'top' | 'bottom'
    ): void {
        const destinationItem = this.items[destinationRowIndex];
        const destinationIsParent =
            destinationItem.filterModel?.filterType === 'join' && destinationPosition === 'bottom';
        const destinationParent = destinationIsParent
            ? (destinationItem.filterModel as JoinAdvancedFilterModel)
            : destinationItem.parent;

        // trying to move before the root
        if (!destinationParent) {
            return;
        }

        // can't move into itself
        if (this.isChildOrSelf(destinationParent, item.filterModel!) || destinationItem === item) {
            return;
        }

        this.removeItemFromParent(item);

        let destinationParentIndex;
        if (destinationIsParent) {
            destinationParentIndex = 0;
        } else {
            destinationParentIndex = destinationParent.conditions.indexOf(destinationItem.filterModel!);
            if (destinationParentIndex === -1) {
                destinationParentIndex = destinationParent.conditions.length;
            } else if (destinationPosition === 'bottom') {
                destinationParentIndex += 1;
            }
        }
        destinationParent.conditions.splice(destinationParentIndex, 0, item.filterModel!);
        this.refreshList(false);
    }

    private isChildOrSelf(modelToCheck: AdvancedFilterModel, potentialParentModel: AdvancedFilterModel): boolean {
        return (
            modelToCheck === potentialParentModel ||
            (potentialParentModel.filterType === 'join' &&
                potentialParentModel.conditions.some((condition) => this.isChildOrSelf(modelToCheck, condition)))
        );
    }

    private setupFilterModel(): AdvancedFilterModel {
        const filterModel = this.formatFilterModel(this.advancedFilter.getModel());
        this.stringifiedModel = JSON.stringify(filterModel);
        return filterModel;
    }

    private formatFilterModel(filterModel: AdvancedFilterModel | null): AdvancedFilterModel {
        filterModel = filterModel ?? {
            filterType: 'join',
            type: 'AND',
            conditions: [],
        };
        if (filterModel.filterType !== 'join') {
            filterModel = {
                filterType: 'join',
                type: 'AND',
                conditions: [filterModel],
            };
        }
        return filterModel;
    }

    private buildList(): void {
        const parseFilterModel = (
            filterModel: AdvancedFilterModel,
            items: AdvancedFilterBuilderItem[],
            level: number,
            parent?: JoinAdvancedFilterModel
        ) => {
            items.push({ filterModel, level, parent, valid: true, showMove: this.params.showMoveButtons });
            if (filterModel.filterType === 'join') {
                for (const childFilterModel of filterModel.conditions) {
                    parseFilterModel(childFilterModel, items, level + 1, filterModel);
                }
                if (level === 0) {
                    items.push({ filterModel: null, level: level + 1, parent: filterModel, valid: true });
                }
            }
        };
        this.items = [];
        parseFilterModel(this.filterModel, this.items, 0);
    }

    private refreshList(softRefresh: boolean): void {
        if (!softRefresh) {
            const invalidModels: AdvancedFilterModel[] = [];
            for (const item of this.items) {
                if (!item.valid) {
                    invalidModels.push(item.filterModel!);
                }
            }
            this.buildList();
            if (invalidModels.length) {
                for (const item of this.items) {
                    if (item.filterModel && invalidModels.includes(item.filterModel)) {
                        item.valid = false;
                    }
                }
            }
        }
        this.virtualList.refresh(softRefresh);
        this.validate();
    }

    private updateItemComponent(item: AdvancedFilterBuilderItem, comp: AdvancedFilterBuilderItemComp): void {
        const index = this.items.indexOf(item);
        const populateTreeLines = (filterModel: AdvancedFilterModel | null, treeLines: boolean[]) => {
            const parentItem = this.items.find((itemToCheck) => itemToCheck.filterModel === filterModel);
            const parentFilterModel = parentItem?.parent;
            if (parentFilterModel) {
                const { conditions } = parentFilterModel;
                // check parent
                populateTreeLines(parentFilterModel, treeLines);
                treeLines.push(conditions[conditions.length - 1] === filterModel);
            }
        };
        const treeLines: boolean[] = [];
        const { filterModel } = item;
        if (filterModel) {
            populateTreeLines(filterModel, treeLines);
            // the add item button is always last child
            treeLines[0] = false;
        }
        const showStartTreeLine = filterModel?.filterType === 'join' && !!filterModel.conditions.length;
        comp.setState({
            disableMoveUp: index === 1,
            disableMoveDown: !this.canMoveDown(item, index),
            treeLines,
            showStartTreeLine,
        });
    }

    private createItemComponent(
        item: AdvancedFilterBuilderItem,
        focusWrapper: HTMLElement
    ): AdvancedFilterBuilderItemComp | AdvancedFilterBuilderItemAddComp {
        const itemComp = this.createBean(
            item.filterModel
                ? new AdvancedFilterBuilderItemComp(item, this.dragFeature, focusWrapper)
                : new AdvancedFilterBuilderItemAddComp(item, focusWrapper)
        );

        itemComp.addManagedListeners(itemComp, {
            advancedFilterBuilderRemoved: ({ item }: AdvancedFilterBuilderRemoveEvent) => this.removeItem(item),
            advancedFilterBuilderValueChanged: () => this.validate(),
            advancedFilterBuilderAdded: ({ item, isJoin }: AdvancedFilterBuilderAddEvent) => this.addItem(item, isJoin),
            advancedFilterBuilderMoved: ({ item, backwards }: AdvancedFilterBuilderMoveEvent) =>
                this.moveItemUpDown(item, backwards),
        });

        if (itemComp instanceof AdvancedFilterBuilderItemComp) {
            this.updateItemComponent(item, itemComp);
        }

        return itemComp;
    }

    private addItem(item: AdvancedFilterBuilderItem, isJoin: boolean): void {
        const { parent: itemParent, level, filterModel: itemFilterModel } = item;
        const itemIsJoin = itemFilterModel?.filterType === 'join';
        const filterModel = isJoin
            ? ({
                  filterType: 'join',
                  type: 'AND',
                  conditions: [],
              } as JoinAdvancedFilterModel)
            : ({} as ColumnAdvancedFilterModel);
        const parent = (itemIsJoin ? itemFilterModel : itemParent)!;
        let insertIndex = itemIsJoin ? 0 : parent.conditions.indexOf(itemFilterModel!);
        if (insertIndex >= 0) {
            if (!itemIsJoin) {
                insertIndex += 1;
            }
            parent.conditions.splice(insertIndex, 0, filterModel);
        } else {
            parent.conditions.push(filterModel);
        }
        let index = this.items.indexOf(item);
        const softRefresh = index >= 0;
        if (softRefresh) {
            if (item.filterModel) {
                index++;
            }
            const newItems: AdvancedFilterBuilderItem[] = [
                {
                    filterModel,
                    level: itemIsJoin ? level + 1 : level,
                    parent,
                    valid: isJoin,
                    showMove: this.params.showMoveButtons,
                },
            ];
            this.items.splice(index, 0, ...newItems);
        }
        this.refreshList(softRefresh);
        if (softRefresh) {
            this.virtualList.getComponentAt(index)?.afterAdd();
        }
    }

    private removeItem(item: AdvancedFilterBuilderItem): void {
        const parent = item.parent!;
        const { filterModel } = item;
        const parentIndex = parent.conditions.indexOf(filterModel!);
        parent.conditions.splice(parentIndex, 1);

        const isJoin = item.filterModel?.filterType === 'join';
        const index = this.items.indexOf(item);
        // if it's a join, we don't know how many children there are, so always rebuild
        const softRefresh = !isJoin && index >= 0;
        if (softRefresh) {
            this.items.splice(index, 1);
        }
        this.refreshList(softRefresh);
        if (index >= 0) {
            this.virtualList.focusRow(index);
        }
    }

    private moveItemUpDown(item: AdvancedFilterBuilderItem, backwards: boolean, fromVirtualList?: boolean): void {
        const itemIndex = this.items.indexOf(item);
        const destinationIndex = backwards ? itemIndex - 1 : itemIndex + 1;
        if (destinationIndex === 0 || (!backwards && !this.canMoveDown(item, itemIndex))) {
            return;
        }
        const destinationItem = this.items[destinationIndex];
        const indexInParent = this.removeItemFromParent(item);
        const { level, filterModel, parent } = item;
        const {
            level: destinationLevel,
            filterModel: destinationFilterModel,
            parent: destinationParent,
        } = destinationItem;
        if (backwards) {
            if (destinationLevel === level && destinationFilterModel!.filterType === 'join') {
                // destination is empty join. move to last child
                (destinationFilterModel as JoinAdvancedFilterModel).conditions.push(filterModel!);
            } else if (destinationLevel <= level) {
                // same parent or first child. move above destination in destination parent
                const destinationIndex = destinationParent!.conditions.indexOf(destinationFilterModel!);
                destinationParent!.conditions.splice(destinationIndex, 0, filterModel!);
            } else {
                // need to move up a level. move to end of previous item's children
                const newParentItem = parent!.conditions[indexInParent - 1] as JoinAdvancedFilterModel;
                newParentItem.conditions.push(filterModel!);
            }
        } else {
            if (destinationLevel === level) {
                if (destinationFilterModel!.filterType === 'join') {
                    // destination is join. move to first child
                    (destinationFilterModel as JoinAdvancedFilterModel).conditions.splice(0, 0, filterModel!);
                } else {
                    // switch positions
                    const destinationIndex = destinationParent!.conditions.indexOf(destinationFilterModel!);
                    destinationParent!.conditions.splice(destinationIndex + 1, 0, filterModel!);
                }
            } else {
                if (indexInParent < parent!.conditions.length) {
                    // keep in parent, but swap with next child
                    parent!.conditions.splice(indexInParent + 1, 0, filterModel!);
                } else {
                    // need to move down a level. move after parent in its parent
                    const parentItem = this.items.find((itemToCheck) => itemToCheck.filterModel === parent);
                    const destinationIndex = parentItem!.parent!.conditions.indexOf(parentItem!.filterModel!) + 1;
                    parentItem!.parent!.conditions.splice(destinationIndex, 0, filterModel!);
                }
            }
        }
        this.refreshList(false);
        const newIndex = this.items.findIndex(
            ({ filterModel: filterModelToCheck }) => filterModelToCheck === filterModel
        );
        if (newIndex < 0) {
            return;
        }
        const comp = this.virtualList.getComponentAt(newIndex);
        if (!(comp instanceof AdvancedFilterBuilderItemComp)) {
            return;
        }

        if (!fromVirtualList) {
            comp.focusMoveButton(backwards);
        }
    }

    private virtualListMoveItemCallback(itemComp: AdvancedFilterBuilderItemComp, isUp: boolean): void {
        const item = itemComp.item;
        const from = this.items.indexOf(item);

        if (from <= 0 || from === this.items.length - 1) {
            return;
        }

        if ((isUp && from === 1) || (!isUp && !this.canMoveDown(item, from))) {
            return;
        }

        this.moveItemUpDown(item, isUp, true);
        this.virtualList.focusRow(from + (isUp ? -1 : 1));
    }

    private canMoveDown(item: AdvancedFilterBuilderItem, index: number): boolean {
        return !(
            (item.level === 1 && index === this.items.length - 2) ||
            (item.level === 1 && item.parent!.conditions[item.parent!.conditions.length - 1] === item.filterModel!)
        );
    }

    private close(): void {
        this.advancedFilter.getCtrl().toggleFilterBuilder({ source: 'ui' });
    }

    private validate(): void {
        let isValid = this.items.every(({ valid }) => valid);
        let validationMessage = null;
        if (isValid) {
            isValid = JSON.stringify(this.filterModel) !== this.stringifiedModel;
            if (!isValid) {
                validationMessage = this.advFilterExpSvc.translate('advancedFilterBuilderValidationAlreadyApplied');
            }
        } else {
            validationMessage = this.advFilterExpSvc.translate('advancedFilterBuilderValidationIncomplete');
        }
        this.eButtons?.updateValidity(isValid, validationMessage);
    }

    private validateItems(): void {
        const clearOperator = (filterModel: ColumnAdvancedFilterModel) => {
            filterModel.type = undefined as any;
        };
        const clearOperand = (filterModel: ColumnAdvancedFilterModel) => {
            delete (filterModel as any).filter;
        };
        for (const item of this.items) {
            if (!item.valid || !item.filterModel || item.filterModel.filterType === 'join') {
                continue;
            }
            const { filterModel } = item;
            const { colId } = filterModel;
            const hasColumn = this.advFilterExpSvc.getColumnAutocompleteEntries().find(({ key }) => key === colId);
            const columnDetails = this.advFilterExpSvc.getColumnDetails(filterModel.colId);
            if (!hasColumn || !columnDetails.column) {
                item.valid = false;
                filterModel.colId = undefined as any;
                clearOperator(filterModel);
                clearOperand(filterModel);
                continue;
            }
            const operatorForType = this.advFilterExpSvc.getDataTypeExpressionOperator(columnDetails.baseCellDataType)!;
            const operator = operatorForType.operators[filterModel.type];
            if (!operator) {
                item.valid = false;
                clearOperator(filterModel);
                clearOperand(filterModel);
                continue;
            }
            if (operator.numOperands > 0 && !_exists((filterModel as any).filter)) {
                item.valid = false;
            }
        }
    }
}
