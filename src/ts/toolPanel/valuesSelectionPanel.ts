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

        private gridOptionsWrapper: any;
        private columnController: any;
        private cColumnList: any;
        private layout: any;
        private popupService: PopupService;

        constructor(columnController: any, gridOptionsWrapper: any, popupService: PopupService) {
            this.popupService = popupService;
            this.gridOptionsWrapper = gridOptionsWrapper;
            this.setupComponents();
            this.columnController = columnController;

            var that = this;
            this.columnController.addListener({
                columnsChanged: that.columnsChanged.bind(that)
            });
        }

        public getLayout() {
            return this.layout;
        }

        private columnsChanged(newColumns: any, newGroupedColumns: any, newValuesColumns: any) {
            this.cColumnList.setModel(newValuesColumns);
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
                var model = that.cColumnList.getModel();
                model.splice(model.indexOf(column), 1);
                that.cColumnList.setModel(model);
                that.onValuesChanged();
            });

            var agValueType = new AgDropdownList(this.popupService);
            agValueType.setModel([constants.SUM, constants.MIN, constants.MAX]);
            agValueType.setSelected(column.aggFunc);
            agValueType.setWidth(45);

            agValueType.addItemSelectedListener(function (item: any) {
                column.aggFunc = item;
                that.onValuesChanged();
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
            this.cColumnList.addModelChangedListener(this.onValuesChanged.bind(this));
            this.cColumnList.setEmptyMessage(emptyMessage);
            this.cColumnList.addStyles({height: '100%', overflow: 'auto'});
            this.cColumnList.addBeforeDropListener(this.beforeDropListener.bind(this));

            var eNorthPanel = document.createElement('div');
            eNorthPanel.style.paddingTop = '10px';
            eNorthPanel.innerHTML = '<div style="text-align: center;">' + columnsLocalText + '</div>';

            this.layout = new BorderLayout({
                center: this.cColumnList.getGui(),
                north: eNorthPanel
            });
        }

        private beforeDropListener(newItem: any) {
            if (!newItem.aggFunc) {
                newItem.aggFunc = constants.SUM;
            }
        }

        private onValuesChanged() {
            var api = this.gridOptionsWrapper.getApi();
            api.recomputeAggregates();
        }
    }
}
