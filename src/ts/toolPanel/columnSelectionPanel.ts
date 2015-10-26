/// <reference path="../widgets/agList.ts" />
/// <reference path="../utils.ts" />
/// <reference path="../svgFactory.ts" />
/// <reference path="../constants.ts" />
/// <reference path="../layout/BorderLayout.ts" />
/// <reference path="../columnController.ts" />

module ag.grid {

    var utils = Utils;
    var svgFactory = SvgFactory.getInstance();

    export class ColumnSelectionPanel {

        private gridOptionsWrapper: GridOptionsWrapper;
        private columnController: ColumnController;
        private cColumnList: any;
        layout: any;
        private eRootPanel: any;
        private dragAndDropService: DragAndDropService;

        constructor(columnController: ColumnController, gridOptionsWrapper: GridOptionsWrapper, eventService: EventService, dragAndDropService: DragAndDropService) {
            this.dragAndDropService = dragAndDropService;
            this.gridOptionsWrapper = gridOptionsWrapper;
            this.columnController = columnController;

            this.setupComponents();

            eventService.addEventListener(Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.columnsChanged.bind(this));
            eventService.addEventListener(Events.EVENT_COLUMN_MOVED, this.columnsChanged.bind(this));
            eventService.addEventListener(Events.EVENT_COLUMN_VISIBLE, this.columnsChanged.bind(this));
        }

        private columnsChanged() {
            this.cColumnList.setModel(this.columnController.getAllColumns(this.gridOptionsWrapper.isToolPanelSuppressPinnedColDefs()));
        }

        public getDragSource() {
            return this.cColumnList.getUniqueId();
        }

        private columnCellRenderer(params: any) {
            var column = params.value;
            var colDisplayName = this.columnController.getDisplayNameForCol(column);

            var eResult = document.createElement('span');

            var eVisibleIcons = document.createElement('span');
            var eLockIcon = utils.createIcon('lockIcon', this.gridOptionsWrapper, column, svgFactory.createLockIconSvg);
            utils.addCssClass(eVisibleIcons, 'ag-visible-icons');
            var eShowing = utils.createIcon('columnVisible', this.gridOptionsWrapper, column, svgFactory.createColumnShowingSvg);
            var eHidden = utils.createIcon('columnHidden', this.gridOptionsWrapper, column, svgFactory.createColumnHiddenSvg);
            var eNoHide = utils.createIcon('columnNoHide', this.gridOptionsWrapper, column, svgFactory.createColumnNoHideSvg);
            eVisibleIcons.appendChild(eShowing);
            eVisibleIcons.appendChild(eHidden);
            eVisibleIcons.appendChild(eNoHide);
            eShowing.style.display = column.visible && !column.colDef.suppressInvisible ? '' : 'none';
            eHidden.style.display = column.visible || column.colDef.suppressInvisible ? 'none' : '';
            eNoHide.style.display = column.colDef.suppressInvisible ? '' : 'none';
            eResult.appendChild(eVisibleIcons);

            var eValue = document.createElement('span');
            eValue.innerHTML = colDisplayName;
            eResult.appendChild(eValue);

           eLockIcon.style.display = column.colDef.pinned ? '' : 'none';
            eResult.appendChild(eLockIcon);
 
            if (!column.visible && !column.colDef.suppressInvisible) {
                utils.addCssClass(eResult, 'ag-column-not-visible');
            }

            // change visible if use clicks the visible icon, or if row is double clicked
            if (!column.colDef.suppressInvisible) {
            eVisibleIcons.addEventListener('click', showEventListener);
            }

            var that = this;

            function showEventListener() {
                if (!column.colDef.suppressInvisible) {
                that.columnController.setColumnVisible(column, !column.visible);
            }
            }

            return eResult;
        }

        private setupComponents() {

            this.cColumnList = new AgList(this.dragAndDropService);
            this.cColumnList.setCellRenderer(this.columnCellRenderer.bind(this));
            this.cColumnList.addStyles({height: '100%', overflow: 'auto'});
            this.cColumnList.addItemMovedListener(this.onItemMoved.bind(this));
            this.cColumnList.setReadOnly(true);

            var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
            var columnsLocalText = localeTextFunc('columns', 'Columns');

            var eNorthPanel = document.createElement('div');
            eNorthPanel.innerHTML = '<div style="text-align: center;">' + columnsLocalText + '</div>';

            this.layout = new BorderLayout({
                center: this.cColumnList.getGui(),
                north: eNorthPanel
            });
        }

        private onItemMoved(fromIndex: number, toIndex: number) {
            var lastPinnedColumnIndex = this.getLastPinnedColDefIndex();
            if (this.gridOptionsWrapper.isToolPanelSuppressPinnedColDefs()) {
                fromIndex = fromIndex + lastPinnedColumnIndex + 1;
                toIndex = toIndex + lastPinnedColumnIndex + 1;
            }
            this.columnController.moveColumn(fromIndex, toIndex);
        }

        private getLastPinnedColDefIndex() {
            var index = -1;
            this.gridOptionsWrapper.getColumnDefs().forEach(function(colDef: any) {
               if (colDef.pinned === true || colDef.pinned === 'true') {
                   index++;
               }
            });
            
            return index;
        }

        public getGui() {
            return this.eRootPanel.getGui();
        }
    }
}

