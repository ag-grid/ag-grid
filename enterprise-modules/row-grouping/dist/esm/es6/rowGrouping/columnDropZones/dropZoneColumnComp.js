var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { DragSourceType, Component, Autowired, Events, TouchListener, DragAndDropService, PostConstruct, RefSelector, Optional, VirtualList, KeyCode, _, } from "@ag-grid-community/core";
export class DropZoneColumnComp extends Component {
    constructor(column, dragSourceDropTarget, ghost, valueColumn, horizontal) {
        super();
        this.column = column;
        this.dragSourceDropTarget = dragSourceDropTarget;
        this.ghost = ghost;
        this.valueColumn = valueColumn;
        this.horizontal = horizontal;
        this.popupShowing = false;
    }
    init() {
        this.setTemplate(DropZoneColumnComp.TEMPLATE);
        const eGui = this.getGui();
        const isFunctionsReadOnly = this.gridOptionsWrapper.isFunctionsReadOnly();
        this.addElementClasses(eGui);
        this.addElementClasses(this.eDragHandle, 'drag-handle');
        this.addElementClasses(this.eText, 'text');
        this.addElementClasses(this.eButton, 'button');
        this.eDragHandle.appendChild(_.createIconNoSpan('columnDrag', this.gridOptionsWrapper));
        this.eButton.appendChild(_.createIconNoSpan('cancel', this.gridOptionsWrapper));
        this.displayName = this.columnModel.getDisplayNameForColumn(this.column, 'columnDrop');
        this.setupComponents();
        if (!this.ghost && !isFunctionsReadOnly) {
            this.addDragSource();
        }
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();
        const label = translate('ariaDropZoneColumnComponentDescription', 'Press DELETE to remove');
        const { name, aggFuncName } = this.getColumnAndAggFuncName();
        let extraDescription = '';
        if (this.valueColumn && !isFunctionsReadOnly) {
            extraDescription = translate('ariaDropZoneColumnValueItemDescription', 'Press ENTER to change the aggregation type');
        }
        _.setAriaLabel(eGui, `${aggFuncName} ${name} ${label} ${extraDescription}`);
        this.setupTooltip();
    }
    setupTooltip() {
        const refresh = () => {
            const newTooltipText = this.column.getColDef().headerTooltip;
            this.setTooltip(newTooltipText);
        };
        refresh();
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, refresh);
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
        if (this.valueColumn && !this.gridOptionsWrapper.isFunctionsReadOnly()) {
            this.addGuiEventListener('click', this.onShowAggFuncSelection.bind(this));
        }
    }
    setupRemove() {
        _.setDisplayed(this.eButton, !this.gridOptionsWrapper.isFunctionsReadOnly());
        const agEvent = { type: DropZoneColumnComp.EVENT_COLUMN_REMOVE };
        this.addGuiEventListener('keydown', (e) => {
            const isEnter = e.key === KeyCode.ENTER;
            const isDelete = e.key === KeyCode.DELETE;
            if (isDelete) {
                e.preventDefault();
                this.dispatchEvent(agEvent);
            }
            if (isEnter && this.valueColumn && !this.gridOptionsWrapper.isFunctionsReadOnly()) {
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
        if (this.valueColumn) {
            const aggFunc = this.column.getAggFunc();
            // if aggFunc is a string, we can use it, but if it's a function, then we swap with 'func'
            const aggFuncString = typeof aggFunc === 'string' ? aggFunc : 'agg';
            const localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
            aggFuncName = localeTextFunc(aggFuncString, aggFuncString);
        }
        return { name, aggFuncName };
    }
    setTextValue() {
        const { name, aggFuncName } = this.getColumnAndAggFuncName();
        const displayValue = this.valueColumn ? `${aggFuncName}(${name})` : name;
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
        // ePopup.style.height = this.gridOptionsWrapper.getAggFuncPopupHeight() + 'px';
        ePopup.style.width = `${eGui.clientWidth}px`;
        const popupHiddenFunc = () => {
            this.destroyBean(virtualList);
            this.popupShowing = false;
            eGui.focus();
        };
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();
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
        this.popupService.positionPopupUnderComponent({
            type: 'aggFuncSelect',
            eventSource: eGui,
            ePopup: ePopup,
            keepWithinBounds: true,
            column: this.column
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
            if (this.gridOptionsWrapper.isFunctionsPassive()) {
                const event = {
                    type: Events.EVENT_COLUMN_AGG_FUNC_CHANGE_REQUEST,
                    columns: [this.column],
                    aggFunc: value,
                    api: this.gridApi,
                    columnApi: this.columnApi
                };
                this.eventService.dispatchEvent(event);
            }
            else {
                this.columnModel.setColumnAggFunc(this.column, value, "toolPanelDragAndDrop");
            }
        };
        const localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
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
}
DropZoneColumnComp.EVENT_COLUMN_REMOVE = 'columnRemove';
DropZoneColumnComp.TEMPLATE = `<span role="option" tabindex="0">
          <span ref="eDragHandle" class="ag-drag-handle ag-column-drop-cell-drag-handle" role="presentation"></span>
          <span ref="eText" class="ag-column-drop-cell-text" aria-hidden="true"></span>
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
    Autowired('columnApi')
], DropZoneColumnComp.prototype, "columnApi", void 0);
__decorate([
    Autowired('gridApi')
], DropZoneColumnComp.prototype, "gridApi", void 0);
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
//# sourceMappingURL=dropZoneColumnComp.js.map