/// <reference path='../entities/colDef.ts'/>
/// <reference path='../entities/column.ts'/>
/// <reference path='../entities/originalColumnGroup.ts'/>
/// <reference path='../logger.ts'/>

module ag.grid {

    var constants = Constants;

    // takes in a list of columns, as specified by the column definitions, and returns column groups
    export class ColumnUtils {

        private gridOptionsWrapper: GridOptionsWrapper;

        public init(gridOptionsWrapper: GridOptionsWrapper): void {
            this.gridOptionsWrapper = gridOptionsWrapper;
        }

        public calculateColInitialWidth(colDef: any): number {
            if (!colDef.width) {
                // if no width defined in colDef, use default
                return this.gridOptionsWrapper.getColWidth();
            } else if (colDef.width < constants.MIN_COL_WIDTH) {
                // if width in col def to small, set to min width
                return constants.MIN_COL_WIDTH;
            } else {
                // otherwise use the provided width
                return colDef.width;
            }
        }

        public getUniqueColumnIdFromTree(allColumnsAndGroups: ColumnGroupChild[], colId: string, colField: string): String {
            var taken = this.getAllColumnIds(allColumnsAndGroups);
            return this.getUniqueColumnIdFromTaken(taken, colId, colField);
        }

        // this method returns a unique id to use for the column. it checks the existing columns, and if the requested
        // id is already taken, it will start appending numbers until it gets a unique id.
        // eg, if the col field is 'name', it will try ids: {name, name_1, name_2...}
        // if no field or id provided in the col, it will try the ids of natural numbers
        public getUniqueColumnIdFromTaken(takenColumnIds: String[], colId: string, colField: string): String {

            var count = 0;
            while (true) {

                var idToTry: string;
                if (colId) {
                    idToTry = colId;
                    if (count!==0) {
                        idToTry += '_' + count;
                    }
                } else if (colField) {
                    idToTry = colField;
                    if (count!==0) {
                        idToTry += '_' + count;
                    }
                } else {
                    idToTry = '' + count;
                }

                if (takenColumnIds.indexOf(idToTry) < 0) {
                    return idToTry;
                }

                count++;
            }
        }

        private getAllColumnIds(tree: ColumnGroupChild[]): String[] {
            var result: String[] = [];
            this.deptFirstAllColumnTreeSearch( tree, (child: ColumnGroupChild) => {
                result.push(child.getColId());
            });
            return result;
        }

        public deptFirstAllColumnTreeSearch(tree: ColumnGroupChild[], callback: (treeNode: ColumnGroupChild)=>void ): void {

            if (!tree) { return; }

            tree.forEach( (child: ColumnGroupChild) => {
                if (child instanceof ColumnGroup) {
                    this.deptFirstAllColumnTreeSearch((<ColumnGroup>child).getChildren(), callback);
                }
                callback(child);
            });

        }

        public deptFirstDisplayedColumnTreeSearch(tree: ColumnGroupChild[], callback: (treeNode: ColumnGroupChild)=>void ): void {

            if (!tree) { return; }

            tree.forEach( (child: ColumnGroupChild) => {
                if (child instanceof ColumnGroup) {
                    this.deptFirstDisplayedColumnTreeSearch((<ColumnGroup>child).getDisplayedChildren(), callback);
                }
                callback(child);
            });

        }

    }

}