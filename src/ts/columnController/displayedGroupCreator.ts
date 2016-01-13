/// <reference path='../entities/colDef.ts'/>
/// <reference path='../entities/column.ts'/>
/// <reference path='../entities/columnGroup.ts'/>
/// <reference path='../logger.ts'/>

module ag.grid {

    // takes in a list of columns, as specified by the column definitions, and returns column groups
    export class DisplayedGroupCreator {

        public createDisplayedGroups(sortedVisibleColumns: Column[],
                                     balancedColumnTree: ColumnGroupChild[]): ColumnGroupChild[] {

            var result: ColumnGroupChild[] = [];

            var previousRealPath: ColumnGroup[];
            var previousOriginalPath: OriginalColumnGroup[];

            // go through each column, then do a bottom up comparison to the previous column, and start
            // to share groups if they converge at any point.
            sortedVisibleColumns.forEach( (currentColumn: Column)=> {

                var currentOriginalPath = this.getOriginalPathForColumn(balancedColumnTree, currentColumn);
                var currentRealPath: ColumnGroup[] = [];
                var firstColumn = !previousOriginalPath;

                for (var i = 0; i<currentOriginalPath.length; i++) {
                    if (firstColumn || currentOriginalPath[i]!==previousOriginalPath[i]) {
                        // new group needed
                        var originalGroup = currentOriginalPath[i];
                        var newGroup = new ColumnGroup(null, originalGroup.getColGroupDef());
                        currentRealPath[i] = newGroup;
                        // if top level, add to result, otherwise add to parent
                        if (i==0) {
                            result.push(newGroup);
                        } else {
                            currentRealPath[i-1].addChild(newGroup);
                        }
                    } else {
                        // reuse old group
                        currentRealPath[i] = previousRealPath[i];
                    }
                }

                var noColumnGroups = currentRealPath.length===0;
                if (noColumnGroups) {
                    // if we are not grouping, then the result of the above is an empty
                    // path (no groups), and we just add the column to the root list.
                    result.push(currentColumn);
                } else {
                    var leafGroup = currentRealPath[currentRealPath.length-1];
                    leafGroup.addChild(currentColumn);
                }

                previousRealPath = currentRealPath;
                previousOriginalPath = currentOriginalPath;
            });

            return result;
        }

        private getOriginalPathForColumn(balancedColumnTree: ColumnGroupChild[], column: Column): OriginalColumnGroup[] {

            var result: OriginalColumnGroup[] = [];
            var found = false;

            recursePath(balancedColumnTree, 0);

            // catch error, so caller will fail rather than have wrong result
            if (found) {
                return result;
            } else {
                return null;
            }

            function recursePath(balancedColumnTree: OriginalColumnGroupChild[], dept: number): void {

                for (var i = 0; i<balancedColumnTree.length; i++) {
                    if (found) {
                        // quit the search, so 'result' is kept with the found result
                        return;
                    }
                    var node = balancedColumnTree[i];
                    if (node instanceof OriginalColumnGroup) {
                        var nextNode = <OriginalColumnGroup> node;
                        recursePath(nextNode.getChildren(), dept+1);
                        result[dept] = node;
                    } else {
                        if (node === column) {
                            found = true;
                        }
                    }
                }

            }
        }
    }

}