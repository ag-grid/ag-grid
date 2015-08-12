/// <reference path="columnController.ts" />
/// <reference path="gridOptionsWrapper.ts" />

module awk.grid {

    export class MasterSlaveService {

        private gridOptionsWrapper: GridOptionsWrapper;
        private columnController: ColumnController;
        private gridPanel: GridPanel;

        // flag to mark if we are consuming. to avoid cyclic events (ie slave firing back to master
        // while processing a master event) we mark this if consuming an event, and if we are, then
        // we don't fire back any events.
        private consuming = false;

        public init(gridOptionsWrapper: GridOptionsWrapper,
                    columnController: ColumnController,
                    gridPanel: GridPanel) {
            this.gridOptionsWrapper = gridOptionsWrapper;
            this.columnController = columnController;
            this.gridPanel = gridPanel;
        }

        public fireColumnEvent(event: ColumnChangeEvent): void {
            if (this.consuming) {
                return;
            }

            var slaveGrids = this.gridOptionsWrapper.getSlaveGrids();
            if (slaveGrids) {
                slaveGrids.forEach( (slaveGridOptions: GridOptions) => {
                    if (slaveGridOptions.api) {
                        slaveGridOptions.api.__getMasterSlaveService().onColumnEvent(event);
                    }
                });
            }
        }

        public fireHorizontalScrollEvent(horizontalScroll: number): void {
            if (this.consuming) {
                return;
            }

            var slaveGrids = this.gridOptionsWrapper.getSlaveGrids();
            if (slaveGrids) {
                slaveGrids.forEach( (slaveGridOptions: GridOptions) => {
                    if (slaveGridOptions.api) {
                        slaveGridOptions.api.__getMasterSlaveService().onScrollEvent(horizontalScroll);
                    }
                });
            }
        }

        public onScrollEvent(horizontalScroll: number): void {
            this.consuming = true;
            this.gridPanel.setHorizontalScrollPosition(horizontalScroll);
            this.consuming = false;
        }

        public onColumnEvent(event: ColumnChangeEvent): void {
            this.consuming = true;

            // the column in the even is from the master grid. need to
            // look up the equivalent from this (slave) grid
            var masterColumn = event.getColumn();
            var slaveColumn: Column;
            if (masterColumn) {
                slaveColumn = this.columnController.getColumn(masterColumn.colId);
            }

            var masterColumnGroup = event.getColumnGroup();
            var slaveColumnGroup: ColumnGroup;
            if (masterColumnGroup) {
                slaveColumnGroup = this.columnController.getColumnGroup(masterColumnGroup.name);
            }

            switch (event.getType()) {
                //case ColumnChangeEvent.TYPE_EVERYTHING:
                //case ColumnChangeEvent.TYPE_PIVOT_CHANGE:
                //case ColumnChangeEvent.TYPE_VALUE_CHANGE:
                //case ColumnChangeEvent.TYPE_COLUMN_MOVED:
                //case ColumnChangeEvent.TYPE_COLUMN_VISIBLE:
                case ColumnChangeEvent.TYPE_COLUMN_GROUP_OPENED:
                    if (masterColumnGroup && slaveColumnGroup) {
                        this.columnController.columnGroupOpened(slaveColumnGroup, masterColumnGroup.expanded);
                    }
                    break;
                case ColumnChangeEvent.TYPE_COLUMN_RESIZED:
                    this.columnController.setColumnWidth(slaveColumn, masterColumn.actualWidth);
                    break;
            }

            this.consuming = false;
        }
    }

}