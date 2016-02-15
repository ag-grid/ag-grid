import _ from '../utils';
import SvgFactory from "../svgFactory";
import {ColumnController} from "../columnController/columnController";
import DragAndDropService from "../dragAndDrop/dragAndDropService";
import GridOptionsWrapper from "../gridOptionsWrapper";
import EventService from "../eventService";
import {Events} from "../events";
import AgList from "../widgets/agList";
import BorderLayout from "../layout/borderLayout";

var svgFactory = SvgFactory.getInstance();

export default class GroupSelectionPanel {

    private gridOptionsWrapper: any;
    private columnController: ColumnController;
    private inMemoryRowController: any;
    private cColumnList: any;
    public layout: any; // need to change this to private
    private dragAndDropService: DragAndDropService;

    constructor(columnController: ColumnController, inMemoryRowController: any,
                gridOptionsWrapper: GridOptionsWrapper, eventService: EventService,
                dragAndDropService: DragAndDropService) {
        this.dragAndDropService = dragAndDropService;
        this.gridOptionsWrapper = gridOptionsWrapper;
        this.setupComponents();
        this.columnController = columnController;
        this.inMemoryRowController = inMemoryRowController;

        eventService.addEventListener(Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.columnsChanged.bind(this));
        eventService.addEventListener(Events.EVENT_COLUMN_ROW_GROUP_CHANGE, this.columnsChanged.bind(this));
    }

    private columnsChanged() {
        this.cColumnList.setModel(this.columnController.getRowGroupColumns());
    }

    public addDragSource(dragSource: any) {
        this.cColumnList.addDragSource(dragSource);
    }

    private columnCellRenderer(params: any) {
        var column = params.value;
        var colDisplayName = this.columnController.getDisplayNameForCol(column);

        var eResult = document.createElement('span');

        var eRemove = _.createIcon('columnRemoveFromGroup',
            this.gridOptionsWrapper, column, svgFactory.createArrowUpSvg);
        _.addCssClass(eRemove, 'ag-visible-icons');
        eResult.appendChild(eRemove);

        var that = this;
        eRemove.addEventListener('click', function () {
            that.columnController.removeRowGroupColumn(column);
        });

        var eValue = document.createElement('span');
        eValue.innerHTML = colDisplayName;
        eResult.appendChild(eValue);

        return eResult;
    }

    private setupComponents() {
        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        var columnsLocalText = localeTextFunc('rowGroupColumns', 'Row Groupings');
        var rowGroupColumnsEmptyMessage = localeTextFunc('rowGroupColumnsEmptyMessage', 'Drag columns from above to group rows');

        this.cColumnList = new AgList(this.dragAndDropService);
        this.cColumnList.setCellRenderer(this.columnCellRenderer.bind(this));
        this.cColumnList.addBeforeDropListener(this.onBeforeDrop.bind(this));
        this.cColumnList.addItemMovedListener(this.onItemMoved.bind(this));
        this.cColumnList.setEmptyMessage(rowGroupColumnsEmptyMessage);
        this.cColumnList.addStyles({height: '100%', overflow: 'auto'});
        this.cColumnList.setReadOnly(true);

        var eNorthPanel = document.createElement('div');
        eNorthPanel.style.paddingTop = '10px';
        eNorthPanel.innerHTML = '<div style="text-align: center;">' + columnsLocalText + '</div>';

        this.layout = new BorderLayout({
            center: this.cColumnList.getGui(),
            north: eNorthPanel
        });
    }

    private onBeforeDrop(newItem: any) {
        this.columnController.addRowGroupColumn(newItem);
    }

    private onItemMoved(fromIndex: number, toIndex: number) {
        this.columnController.moveRowGroupColumn(fromIndex, toIndex);
    }
}
