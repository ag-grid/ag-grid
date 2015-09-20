module ag.grid {

    export class ColumnGroup {

        pinned: any;
        name: any;
        allColumns: Column[] = [];
        displayedColumns: Column[] = [];
        expandable = false;
        expanded = false;
        actualWidth: number;

        constructor(pinned: any, name: any) {
            this.pinned = pinned;
            this.name = name;
        }

        public getMinimumWidth(): number {
            var result = 0;
            this.displayedColumns.forEach( (column: Column) => {
                result += column.getMinimumWidth();
            });
            return result;
        }

        public addColumn(column: any) {
            this.allColumns.push(column);
        }

        // need to check that this group has at least one col showing when both expanded and contracted.
        // if not, then we don't allow expanding and contracting on this group
        public calculateExpandable() {
            // want to make sure the group doesn't disappear when it's open
            var atLeastOneShowingWhenOpen = false;
            // want to make sure the group doesn't disappear when it's closed
            var atLeastOneShowingWhenClosed = false;
            // want to make sure the group has something to show / hide
            var atLeastOneChangeable = false;
            for (var i = 0, j = this.allColumns.length; i < j; i++) {
                var column = this.allColumns[i];
                if (column.colDef.headerGroupShow === 'open') {
                    atLeastOneShowingWhenOpen = true;
                    atLeastOneChangeable = true;
                } else if (column.colDef.headerGroupShow === 'closed') {
                    atLeastOneShowingWhenClosed = true;
                    atLeastOneChangeable = true;
                } else {
                    atLeastOneShowingWhenOpen = true;
                    atLeastOneShowingWhenClosed = true;
                }
            }

            this.expandable = atLeastOneShowingWhenOpen && atLeastOneShowingWhenClosed && atLeastOneChangeable;
        }

        public calculateActualWidth(): void {
            var actualWidth = 0;
            this.displayedColumns.forEach( (column: Column)=> {
                actualWidth += column.actualWidth;
            });
            this.actualWidth = actualWidth;
        }

        public calculateDisplayedColumns() {
            // clear out last time we calculated
            this.displayedColumns = [];
            // it not expandable, everything is visible
            if (!this.expandable) {
                this.displayedColumns = this.allColumns;
                return;
            }
            // and calculate again
            for (var i = 0, j = this.allColumns.length; i < j; i++) {
                var column = this.allColumns[i];
                switch (column.colDef.headerGroupShow) {
                    case 'open':
                        // when set to open, only show col if group is open
                        if (this.expanded) {
                            this.displayedColumns.push(column);
                        }
                        break;
                    case 'closed':
                        // when set to open, only show col if group is open
                        if (!this.expanded) {
                            this.displayedColumns.push(column);
                        }
                        break;
                    default:
                        // default is always show the column
                        this.displayedColumns.push(column);
                        break;
                }
            }
        }

        // should replace with utils method 'add all'
        public addToVisibleColumns(colsToAdd: any) {
            for (var i = 0; i < this.displayedColumns.length; i++) {
                var column = this.displayedColumns[i];
                colsToAdd.push(column);
            }
        }
    }

}