/// <reference path="columnController.ts" />
/// <reference path="gridOptionsWrapper.ts" />
/// <reference path="logger.ts" />

module awk.grid {

    export class MasterSlaveService {

        private gridOptionsWrapper: GridOptionsWrapper;
        private columnController: ColumnController;
        private gridPanel: GridPanel;
        private logger: Logger;

        // flag to mark if we are consuming. to avoid cyclic events (ie slave firing back to master
        // while processing a master event) we mark this if consuming an event, and if we are, then
        // we don't fire back any events.
        private consuming = false;

        public init(gridOptionsWrapper: GridOptionsWrapper,
                    columnController: ColumnController,
                    gridPanel: GridPanel,
                    loggerFactory: LoggerFactory) {
            this.gridOptionsWrapper = gridOptionsWrapper;
            this.columnController = columnController;
            this.gridPanel = gridPanel;
            this.logger = loggerFactory.create('MasterSlaveService');
        }

        // common logic across all the fire methods
        private fireEvent(callback: (slaveService: MasterSlaveService)=>void): void {
            // if we are already consuming, then we are acting on an event from a master,
            // so we don't cause a cyclic firing of events
            if (this.consuming) {
                return;
            }

            // iterate through the slave grids, and pass each slave service to the callback
            var slaveGrids = this.gridOptionsWrapper.getSlaveGrids();
            if (slaveGrids) {
                slaveGrids.forEach( (slaveGridOptions: GridOptions) => {
                    if (slaveGridOptions.api) {
                        var slaveService = slaveGridOptions.api.__getMasterSlaveService();
                        callback(slaveService);
                    }
                });
            }
        }

        // common logic across all consume methods. very little common logic, however extracting
        // guarantees consistency across the methods.
        private onEvent(callback: ()=>void): void {
            this.consuming = true;
            callback();
            this.consuming = false;
        }

        public fireColumnEvent(event: ColumnChangeEvent): void {
            this.fireEvent( (slaveService: MasterSlaveService)=> {
                slaveService.onColumnEvent(event);
            });
        }

        public fireHorizontalScrollEvent(horizontalScroll: number): void {
            this.fireEvent( (slaveService: MasterSlaveService)=> {
                slaveService.onScrollEvent(horizontalScroll);
            });
        }

        public onScrollEvent(horizontalScroll: number): void {
            this.onEvent(()=> {
                this.gridPanel.setHorizontalScrollPosition(horizontalScroll);
            });
        }

        public onColumnEvent(event: ColumnChangeEvent): void {
            this.onEvent(() => {

                // the column in the even is from the master grid. need to
                // look up the equivalent from this (slave) grid
                var masterColumn = event.getColumn();
                var slaveColumn: Column;
                if (masterColumn) {
                    slaveColumn = this.columnController.getColumn(masterColumn.colId);
                }
                // if event was with respect to a master column, that is not present in this
                // grid, then we ignore the event
                if (masterColumn && !slaveColumn) { return; }

                // likewise for column group
                var masterColumnGroup = event.getColumnGroup();
                var slaveColumnGroup: ColumnGroup;
                if (masterColumnGroup) {
                    slaveColumnGroup = this.columnController.getColumnGroup(masterColumnGroup.name);
                }
                if (masterColumnGroup && !slaveColumnGroup) { return; }

                switch (event.getType()) {
                    // we don't do anything for these three events
                    //case ColumnChangeEvent.TYPE_EVERYTHING:
                    //case ColumnChangeEvent.TYPE_PIVOT_CHANGE:
                    //case ColumnChangeEvent.TYPE_VALUE_CHANGE:
                    case ColumnChangeEvent.TYPE_COLUMN_MOVED:
                        this.logger.log('onColumnEvent-> processing '+event+' fromIndex = '+ event.getFromIndex() + ', toIndex = ' + event.getToIndex());
                        this.columnController.moveColumn(event.getFromIndex(), event.getToIndex());
                        break;
                    case ColumnChangeEvent.TYPE_COLUMN_VISIBLE:
                        this.logger.log('onColumnEvent-> processing '+event+' visible = '+ masterColumn.visible);
                        this.columnController.setColumnVisible(slaveColumn, masterColumn.visible);
                        break;
                    case ColumnChangeEvent.TYPE_COLUMN_GROUP_OPENED:
                        this.logger.log('onColumnEvent-> processing '+event+' expanded = '+ masterColumnGroup.expanded);
                        this.columnController.columnGroupOpened(slaveColumnGroup, masterColumnGroup.expanded);
                        break;
                    case ColumnChangeEvent.TYPE_COLUMN_RESIZED:
                        this.logger.log('onColumnEvent-> processing '+event+' actualWidth = '+ masterColumn.actualWidth);
                        this.columnController.setColumnWidth(slaveColumn, masterColumn.actualWidth);
                        break;
                    case ColumnChangeEvent.TYPE_PINNED_COUNT_CHANGED:
                        this.logger.log('onColumnEvent-> processing '+event);
                        this.columnController.setPinnedColumnCount(event.getPinnedColumnCount());
                        break;
                }

            });
        }
    }

}