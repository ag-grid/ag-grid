/// <reference path="../widgets/agList.ts" />
/// <reference path="../constants.ts" />
/// <reference path="../utils.ts" />
/// <reference path="../layout/borderLayout.ts" />
/// <reference path="../svgFactory.ts" />
/// <reference path="../widgets/agDropdownList.ts" />

module awk.grid {

    var svgFactory = SvgFactory.getInstance();
    var constants = Constants;
    var utils = Utils;

    export class ValuesSelectionPanel {

        private gridOptionsWrapper: GridOptionsWrapper;
        private columnController: ColumnController;
        private cColumnList: any;
        private layout: any;
        private popupService: PopupService;

        constructor(columnController: ColumnController, gridOptionsWrapper: GridOptionsWrapper, popupService: PopupService) {
            this.popupService = popupService;
            this.gridOptionsWrapper = gridOptionsWrapper;
            this.setupComponents();
            this.columnController = columnController;

            this.columnController.addChangeListener(this.columnsChanged.bind(this));
        }

        public getLayout() {
            return this.layout;
        }

        private columnsChanged() {
            this.cColumnList.setModel(this.columnController.getValueColumns());
        }

        public addDragSource(dragSource: any) {
            this.cColumnList.addDragSource(dragSource);
        }

        private cellRenderer(params: any) {
            var column = params.value;
            var colDisplayName = this.columnController.getDisplayNameForCol(column);

            var eResult = document.createElement('span');

            var eRemove = utils.createIcon('columnRemoveFromGroup', this.gridOptionsWrapper, column, svgFactory.createArrowUpSvg);
            utils.addCssClass(eRemove, 'ag-visible-icons');
            eResult.appendChild(eRemove);

            var that = this;
            eRemove.addEventListener('click', function () {
                that.columnController.removeValueColumn(column);
            });

            var agValueType = new AgDropdownList(this.popupService);
            agValueType.setModel([constants.SUM, constants.MIN, constants.MAX]);
            agValueType.setSelected(column.aggFunc);
            agValueType.setWidth(45);

            agValueType.addItemSelectedListener(function (item: any) {
                that.columnController.setColumnAggFunction(column, item);
            });

            eResult.appendChild(agValueType.getGui());

            var eValue = document.createElement('span');
            eValue.innerHTML = colDisplayName;
            eValue.style.paddingLeft = '2px';
            eResult.appendChild(eValue);

            return eResult;
        }

        private setupComponents() {
            var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
            var columnsLocalText = localeTextFunc('valueColumns', 'Value Columns');
            var emptyMessage = localeTextFunc('valueColumnsEmptyMessage', 'Drag columns from above to create values');

            this.cColumnList = new AgList();
            this.cColumnList.setCellRenderer(this.cellRenderer.bind(this));
            this.cColumnList.setEmptyMessage(emptyMessage);
            this.cColumnList.addStyles({height: '100%', overflow: 'auto'});
            this.cColumnList.addBeforeDropListener(this.beforeDropListener.bind(this));
            this.cColumnList.setReadOnly(true);

            var eNorthPanel = document.createElement('div');
            eNorthPanel.style.paddingTop = '10px';
            eNorthPanel.innerHTML = '<div style="text-align: center;">' + columnsLocalText + '</div>';

            this.layout = new BorderLayout({
                center: this.cColumnList.getGui(),
                north: eNorthPanel
            });
        }

        private beforeDropListener(newItem: any) {
            this.columnController.addValueColumn(newItem);
        }
    }
}
