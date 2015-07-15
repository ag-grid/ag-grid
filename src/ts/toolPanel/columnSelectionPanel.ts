/// <reference path="../widgets/agList.ts" />
/// <reference path="../utils.ts" />
/// <reference path="../svgFactory.ts" />
/// <reference path="../layout/BorderLayout.ts" />

module awk.grid {

    var utils = Utils;
    var svgFactory = SvgFactory.getInstance();

    export class ColumnSelectionPanel {

        gridOptionsWrapper: any;
        columnController: any;
        cColumnList: any;
        layout: any;
        eRootPanel: any;

        constructor(columnController: any, gridOptionsWrapper: any) {
            this.gridOptionsWrapper = gridOptionsWrapper;
            this.setupComponents();
            this.columnController = columnController;

            var that = this;
            this.columnController.addListener({
                columnsChanged: that.columnsChanged.bind(that)
            });
        }

        columnsChanged(newColumns: any) {
            this.cColumnList.setModel(newColumns);
        }

        getDragSource() {
            return this.cColumnList.getUniqueId();
        }

        columnCellRenderer(params: any) {
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
                column.visible = !column.visible;
                that.cColumnList.refreshView();
                that.columnController.onColumnStateChanged();

                if (typeof that.gridOptionsWrapper.getColumnVisibilityChanged() === 'function') {
                    that.gridOptionsWrapper.getColumnVisibilityChanged()(column);
                }
            }

            return eResult;
        }

        setupComponents() {

            this.cColumnList = new AgList();
            this.cColumnList.setCellRenderer(this.columnCellRenderer.bind(this));
            this.cColumnList.addStyles({height: '100%', overflow: 'auto'});

            var that = this;
            this.cColumnList.addModelChangedListener(function (columns: any) {
                that.columnController.onColumnStateChanged();

                if (typeof that.gridOptionsWrapper.getColumnOrderChanged() === 'function') {
                    that.gridOptionsWrapper.getColumnOrderChanged()(columns);
                }
            });

            var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
            var columnsLocalText = localeTextFunc('columns', 'Columns');

            var eNorthPanel = document.createElement('div');
            eNorthPanel.innerHTML = '<div style="text-align: center;">' + columnsLocalText + '</div>';

            this.layout = new BorderLayout({
                center: this.cColumnList.getGui(),
                north: eNorthPanel
            });
        }

        // not sure if this is called anywhere
        setSelected(column: any, selected: any) {
            column.visible = selected;
            this.columnController.onColumnStateChanged();
        }

        getGui() {
            return this.eRootPanel.getGui();
        }
    }
}

