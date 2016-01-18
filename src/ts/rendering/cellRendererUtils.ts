
module ag.grid {

    class CellRendererUtils {

        private gridOptionsWrapper: GridOptionsWrapper;

        public init(): void {

        }
/*
        private useCellRenderer(cellRenderer: Function | {}) {
            var colDef = this.column.getColDef();

            var rendererParams = {
                value: this.value,
                valueGetter: this.getValue,
                data: this.node.data,
                node: this.node,
                colDef: colDef,
                column: this.column,
                $scope: this.scope,
                rowIndex: this.rowIndex,
                api: this.gridOptionsWrapper.getApi(),
                context: this.gridOptionsWrapper.getContext(),
                refreshCell: this.refreshCell.bind(this),
                eGridCell: this.vGridCell
            };
            // start duplicated code
            var actualCellRenderer: Function;
            if (typeof cellRenderer === 'object' && cellRenderer !== null) {
                var cellRendererObj = <{ renderer: string }> cellRenderer;
                actualCellRenderer = this.cellRendererMap[cellRendererObj.renderer];
                if (!actualCellRenderer) {
                    throw 'Cell renderer ' + cellRenderer + ' not found, available are ' + Object.keys(this.cellRendererMap);
                }
            } else if (typeof cellRenderer === 'function') {
                actualCellRenderer = <Function>cellRenderer;
            } else {
                throw 'Cell Renderer must be String or Function';
            }
            var resultFromRenderer = actualCellRenderer(rendererParams);
            return resultFromRenderer;
        }*/
    }
}