/// <reference path="../widgets/agList.ts" />
/// <reference path="../utils.ts" />
/// <reference path="../svgFactory.ts" />
/// <reference path="../layout/BorderLayout.ts" />

module awk.grid {

    var utils = Utils;
    var svgFactory = SvgFactory.getInstance();

    export class ColumnSelectionPanel {

        private gridOptionsWrapper: GridOptionsWrapper;
        private columnController: ColumnController;
        private cColumnList: any;
        layout: any;
        private eRootPanel: any;

        constructor(columnController: ColumnController, gridOptionsWrapper: GridOptionsWrapper) {
            this.gridOptionsWrapper = gridOptionsWrapper;
            this.setupComponents();
            this.columnController = columnController;

            this.columnController.addChangeListener(this.columnsChanged.bind(this));
        }

        private columnsChanged() {
            this.cColumnList.setModel(this.columnController.getAllColumns());
        }

        public getDragSource() {
            return this.cColumnList.getUniqueId();
        }

        private columnCellRenderer(params: any) {
            var column = params.value;
            var colDisplayName = this.columnController.getDisplayNameForCol(column);

            var eResult = document.createElement('span');

            var eVisibleIcons = document.createElement('span');
            utils.addCssClass(eVisibleIcons, 'ag-visible-icons');
            var eShowing = utils.createIcon('columnVisible', this.gridOptionsWrapper, column, svgFactory.createColumnShowingSvg);
            var eHidden = utils.createIcon('columnHidden', this.gridOptionsWrapper, column, svgFactory.createColumnHiddenSvg);
            eVisibleIcons.appendChild(eShowing);
            eVisibleIcons.appendChild(eHidden);
            eShowing.style.display = column.visible ? '' : 'none';
            eHidden.style.display = column.visible ? 'none' : '';
            eResult.appendChild(eVisibleIcons);

            var eValue = document.createElement('span');
            eValue.innerHTML = colDisplayName;
            eResult.appendChild(eValue);

            if (!column.visible) {
                utils.addCssClass(eResult, 'ag-column-not-visible');
            }

            // change visible if use clicks the visible icon, or if row is double clicked
            eVisibleIcons.addEventListener('click', showEventListener);

            var that = this;

            function showEventListener() {
                that.columnController.setColumnVisible(column, !column.visible);
            }

            return eResult;
        }

        private setupComponents() {

            this.cColumnList = new AgList();
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
            this.columnController.moveColumn(fromIndex, toIndex);
        }

        public getGui() {
            return this.eRootPanel.getGui();
        }
    }
}

