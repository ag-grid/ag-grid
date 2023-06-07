var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { DragSourceType, Component, Autowired, Events, TouchListener, DragAndDropService, PostConstruct, Column, RefSelector, Optional, VirtualList, KeyCode, _, } from "@ag-grid-community/core";
export class DropZoneColumnComp extends Component {
    constructor(column, dragSourceDropTarget, ghost, dropZonePurpose, horizontal) {
        super();
        this.column = column;
        this.dragSourceDropTarget = dragSourceDropTarget;
        this.ghost = ghost;
        this.dropZonePurpose = dropZonePurpose;
        this.horizontal = horizontal;
        this.popupShowing = false;
    }
    init() {
        this.setTemplate(DropZoneColumnComp.TEMPLATE);
        const eGui = this.getGui();
        const isFunctionsReadOnly = this.gridOptionsService.is('functionsReadOnly');
        this.addElementClasses(eGui);
        this.addElementClasses(this.eDragHandle, 'drag-handle');
        this.addElementClasses(this.eText, 'text');
        this.addElementClasses(this.eButton, 'button');
        this.eDragHandle.appendChild(_.createIconNoSpan('columnDrag', this.gridOptionsService));
        this.eButton.appendChild(_.createIconNoSpan('cancel', this.gridOptionsService));
        this.setupSort();
        this.displayName = this.columnModel.getDisplayNameForColumn(this.column, 'columnDrop');
        this.setupComponents();
        if (!this.ghost && !isFunctionsReadOnly) {
            this.addDragSource();
        }
        this.setupAria();
        this.addManagedListener(this.eventService, Column.EVENT_SORT_CHANGED, () => {
            this.setupAria();
        });
        this.setupTooltip();
    }
    setupAria() {
        const translate = this.localeService.getLocaleTextFunc();
        const { name, aggFuncName } = this.getColumnAndAggFuncName();
        const aggSeparator = translate('ariaDropZoneColumnComponentAggFuncSeperator', ' of ');
        const sortDirection = {
            asc: translate('ariaDropZoneColumnComponentSortAscending', 'ascending'),
            desc: translate('ariaDropZoneColumnComponentSortDescending', 'descending'),
        };
        const columnSort = this.column.getSort();
        const isSortSuppressed = this.gridOptionsService.is('rowGroupPanelSuppressSort');
        const ariaInstructions = [
            [
                aggFuncName && `${aggFuncName}${aggSeparator}`,
                name,
                this.isGroupingZone() && !isSortSuppressed && columnSort && `, ${sortDirection[columnSort]}`
            ].filter(part => !!part).join(''),
        ];
        const isFunctionsReadOnly = this.gridOptionsService.is('functionsReadOnly');
        if (this.isAggregationZone() && !isFunctionsReadOnly) {
            const aggregationMenuAria = translate('ariaDropZoneColumnValueItemDescription', 'Press ENTER to change the aggregation type');
            ariaInstructions.push(aggregationMenuAria);
        }
        if (this.isGroupingZone() && this.column.getColDef().sortable && !isSortSuppressed) {
            const sortProgressAria = translate('ariaDropZoneColumnGroupItemDescription', 'Press ENTER to sort');
            ariaInstructions.push(sortProgressAria);
        }
        const deleteAria = translate('ariaDropZoneColumnComponentDescription', 'Press DELETE to remove');
        ariaInstructions.push(deleteAria);
        _.setAriaLabel(this.getGui(), ariaInstructions.join('. '));
    }
    setupTooltip() {
        const refresh = () => {
            const newTooltipText = this.column.getColDef().headerTooltip;
            this.setTooltip(newTooltipText);
        };
        refresh();
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, refresh);
    }
    setupSort() {
        const canSort = this.column.getColDef().sortable;
        const isGroupingZone = this.isGroupingZone();
        if (!canSort || !isGroupingZone) {
            return;
        }
        if (!this.gridOptionsService.is('rowGroupPanelSuppressSort')) {
            this.eSortIndicator.setupSort(this.column, true);
            const performSort = (event) => {
                event.preventDefault();
                const sortUsingCtrl = this.gridOptionsService.get('multiSortKey') === 'ctrl';
                const multiSort = sortUsingCtrl ? (event.ctrlKey || event.metaKey) : event.shiftKey;
                this.sortController.progressSort(this.column, multiSort, 'uiColumnSorted');
            };
            this.addGuiEventListener('click', performSort);
            this.addGuiEventListener('keydown', (e) => {
                const isEnter = e.key === KeyCode.ENTER;
                if (isEnter && this.isGroupingZone()) {
                    performSort(e);
                }
            });
        }
    }
    addDragSource() {
        const dragSource = {
            type: DragSourceType.ToolPanel,
            eElement: this.eDragHandle,
            defaultIconName: DragAndDropService.ICON_HIDE,
            getDragItem: () => this.createDragItem(),
            dragItemName: this.displayName,
            dragSourceDropTarget: this.dragSourceDropTarget
        };
        this.dragAndDropService.addDragSource(dragSource, true);
        this.addDestroyFunc(() => this.dragAndDropService.removeDragSource(dragSource));
    }
    createDragItem() {
        const visibleState = {};
        visibleState[this.column.getId()] = this.column.isVisible();
        return {
            columns: [this.column],
            visibleState: visibleState
        };
    }
    setupComponents() {
        this.setTextValue();
        this.setupRemove();
        if (this.ghost) {
            this.addCssClass('ag-column-drop-cell-ghost');
        }
        if (this.isAggregationZone() && !this.gridOptionsService.is('functionsReadOnly')) {
            this.addGuiEventListener('click', this.onShowAggFuncSelection.bind(this));
        }
    }
    setupRemove() {
        _.setDisplayed(this.eButton, !this.gridOptionsService.is('functionsReadOnly'));
        const agEvent = { type: DropZoneColumnComp.EVENT_COLUMN_REMOVE };
        this.addGuiEventListener('keydown', (e) => {
            const isEnter = e.key === KeyCode.ENTER;
            const isDelete = e.key === KeyCode.DELETE;
            if (isDelete) {
                e.preventDefault();
                this.dispatchEvent(agEvent);
            }
            if (isEnter && this.isAggregationZone() && !this.gridOptionsService.is('functionsReadOnly')) {
                e.preventDefault();
                this.onShowAggFuncSelection();
            }
        });
        this.addManagedListener(this.eButton, 'click', (mouseEvent) => {
            this.dispatchEvent(agEvent);
            mouseEvent.stopPropagation();
        });
        const touchListener = new TouchListener(this.eButton);
        this.addManagedListener(touchListener, TouchListener.EVENT_TAP, () => {
            this.dispatchEvent(agEvent);
        });
        this.addDestroyFunc(touchListener.destroy.bind(touchListener));
    }
    getColumnAndAggFuncName() {
        const name = this.displayName;
        let aggFuncName = '';
        if (this.isAggregationZone()) {
            const aggFunc = this.column.getAggFunc();
            // if aggFunc is a string, we can use it, but if it's a function, then we swap with 'func'
            const aggFuncString = typeof aggFunc === 'string' ? aggFunc : 'agg';
            const localeTextFunc = this.localeService.getLocaleTextFunc();
            aggFuncName = localeTextFunc(aggFuncString, aggFuncString);
        }
        return { name, aggFuncName };
    }
    setTextValue() {
        const { name, aggFuncName } = this.getColumnAndAggFuncName();
        const displayValue = this.isAggregationZone() ? `${aggFuncName}(${name})` : name;
        const displayValueSanitised = _.escapeString(displayValue);
        this.eText.innerHTML = displayValueSanitised;
    }
    onShowAggFuncSelection() {
        if (this.popupShowing) {
            return;
        }
        this.popupShowing = true;
        const virtualList = new VirtualList('select-agg-func');
        const rows = this.aggFuncService.getFuncNames(this.column);
        const eGui = this.getGui();
        const virtualListGui = virtualList.getGui();
        virtualList.setModel({
            getRow: function (index) { return rows[index]; },
            getRowCount: function () { return rows.length; }
        });
        this.getContext().createBean(virtualList);
        const ePopup = _.loadTemplate(/* html*/ `<div class="ag-select-agg-func-popup"></div>`);
        ePopup.style.top = '0px';
        ePopup.style.left = '0px';
        ePopup.appendChild(virtualListGui);
        // ePopup.style.height = this.gridOptionsService.getAggFuncPopupHeight() + 'px';
        ePopup.style.width = `${eGui.clientWidth}px`;
        const popupHiddenFunc = () => {
            this.destroyBean(virtualList);
            this.popupShowing = false;
            eGui.focus();
        };
        const translate = this.localeService.getLocaleTextFunc();
        const addPopupRes = this.popupService.addPopup({
            modal: true,
            eChild: ePopup,
            closeOnEsc: true,
            closedCallback: popupHiddenFunc,
            ariaLabel: translate('ariaLabelAggregationFunction', 'Aggregation Function')
        });
        if (addPopupRes) {
            virtualList.setComponentCreator(this.createAggSelect.bind(this, addPopupRes.hideFunc));
        }
        virtualList.addGuiEventListener('keydown', (e) => {
            if (e.key === KeyCode.ENTER || e.key === KeyCode.SPACE) {
                const row = virtualList.getLastFocusedRow();
                if (row == null) {
                    return;
                }
                const comp = virtualList.getComponentAt(row);
                if (comp) {
                    comp.selectItem();
                }
            }
        });
        this.popupService.positionPopupByComponent({
            type: 'aggFuncSelect',
            eventSource: eGui,
            ePopup: ePopup,
            keepWithinBounds: true,
            column: this.column,
            position: 'under'
        });
        virtualList.refresh();
        let rowToFocus = rows.findIndex(r => r === this.column.getAggFunc());
        if (rowToFocus === -1) {
            rowToFocus = 0;
        }
        virtualList.focusRow(rowToFocus);
    }
    createAggSelect(hidePopup, value) {
        const itemSelected = () => {
            hidePopup();
            if (this.gridOptionsService.is('functionsPassive')) {
                const event = {
                    type: Events.EVENT_COLUMN_AGG_FUNC_CHANGE_REQUEST,
                    columns: [this.column],
                    aggFunc: value
                };
                this.eventService.dispatchEvent(event);
            }
            else {
                this.columnModel.setColumnAggFunc(this.column, value, "toolPanelDragAndDrop");
            }
        };
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        const aggFuncString = value.toString();
        const aggFuncStringTranslated = localeTextFunc(aggFuncString, aggFuncString);
        const comp = new AggItemComp(itemSelected, aggFuncStringTranslated);
        return comp;
    }
    addElementClasses(el, suffix) {
        suffix = suffix ? `-${suffix}` : '';
        const direction = this.horizontal ? 'horizontal' : 'vertical';
        el.classList.add(`ag-column-drop-cell${suffix}`, `ag-column-drop-${direction}-cell${suffix}`);
    }
    isAggregationZone() {
        return this.dropZonePurpose === 'aggregation';
    }
    isGroupingZone() {
        return this.dropZonePurpose === 'rowGroup';
    }
}
DropZoneColumnComp.EVENT_COLUMN_REMOVE = 'columnRemove';
DropZoneColumnComp.TEMPLATE = `<span role="option" tabindex="0">
          <span ref="eDragHandle" class="ag-drag-handle ag-column-drop-cell-drag-handle" role="presentation"></span>
          <span ref="eText" class="ag-column-drop-cell-text" aria-hidden="true"></span>
          <ag-sort-indicator ref="eSortIndicator"></ag-sort-indicator>
          <span ref="eButton" class="ag-column-drop-cell-button" role="presentation"></span>
        </span>`;
__decorate([
    Autowired('dragAndDropService')
], DropZoneColumnComp.prototype, "dragAndDropService", void 0);
__decorate([
    Autowired('columnModel')
], DropZoneColumnComp.prototype, "columnModel", void 0);
__decorate([
    Autowired('popupService')
], DropZoneColumnComp.prototype, "popupService", void 0);
__decorate([
    Optional('aggFuncService')
], DropZoneColumnComp.prototype, "aggFuncService", void 0);
__decorate([
    Autowired('sortController')
], DropZoneColumnComp.prototype, "sortController", void 0);
__decorate([
    RefSelector('eText')
], DropZoneColumnComp.prototype, "eText", void 0);
__decorate([
    RefSelector('eDragHandle')
], DropZoneColumnComp.prototype, "eDragHandle", void 0);
__decorate([
    RefSelector('eButton')
], DropZoneColumnComp.prototype, "eButton", void 0);
__decorate([
    RefSelector('eSortIndicator')
], DropZoneColumnComp.prototype, "eSortIndicator", void 0);
__decorate([
    PostConstruct
], DropZoneColumnComp.prototype, "init", null);
class AggItemComp extends Component {
    constructor(itemSelected, value) {
        super(/* html */ `<div class="ag-select-agg-func-item"/>`);
        this.selectItem = itemSelected;
        this.getGui().innerText = value;
        this.addGuiEventListener('click', this.selectItem);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJvcFpvbmVDb2x1bW5Db21wLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3Jvd0dyb3VwaW5nL2NvbHVtbkRyb3Bab25lcy9kcm9wWm9uZUNvbHVtbkNvbXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUVILGNBQWMsRUFDZCxTQUFTLEVBQ1QsU0FBUyxFQUVULE1BQU0sRUFDTixhQUFhLEVBQ2Isa0JBQWtCLEVBRWxCLGFBQWEsRUFDYixNQUFNLEVBSU4sV0FBVyxFQUNYLFFBQVEsRUFFUixXQUFXLEVBQ1gsT0FBTyxFQUNQLENBQUMsR0FJSixNQUFNLHlCQUF5QixDQUFDO0FBS2pDLE1BQU0sT0FBTyxrQkFBbUIsU0FBUSxTQUFTO0lBMkI3QyxZQUNZLE1BQWMsRUFDZCxvQkFBZ0MsRUFDaEMsS0FBYyxFQUNkLGVBQTBCLEVBQzFCLFVBQW1CO1FBRTNCLEtBQUssRUFBRSxDQUFDO1FBTkEsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUNkLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBWTtRQUNoQyxVQUFLLEdBQUwsS0FBSyxDQUFTO1FBQ2Qsb0JBQWUsR0FBZixlQUFlLENBQVc7UUFDMUIsZUFBVSxHQUFWLFVBQVUsQ0FBUztRQVB2QixpQkFBWSxHQUFHLEtBQUssQ0FBQztJQVU3QixDQUFDO0lBR00sSUFBSTtRQUNQLElBQUksQ0FBQyxXQUFXLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDOUMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQzNCLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBRTVFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM3QixJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxhQUFh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