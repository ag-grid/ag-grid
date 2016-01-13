/// <reference path='../entities/colDef.ts'/>
/// <reference path='../entities/column.ts'/>
/// <reference path='../entities/originalColumnGroup.ts'/>
/// <reference path='../logger.ts'/>

module ag.grid {

    // takes in a list of columns, as specified by the column definitions, and returns column groups
    export class BalancedColumnTreeBuilder {

        private gridOptionsWrapper: GridOptionsWrapper;
        private logger: Logger;
        private columnUtils: ColumnUtils;

        public init(gridOptionsWrapper: GridOptionsWrapper, loggerFactory: LoggerFactory, columnUtils: ColumnUtils) {
            this.gridOptionsWrapper = gridOptionsWrapper;
            this.columnUtils = columnUtils;

            this.logger = loggerFactory.create('BalancedColumnTreeBuilder');
        }

        public createBalancedColumnGroups(abstractColDefs: AbstractColDef[]): any {
            // create am unbalanced tree that maps the provided definitions
            var takenColumnIds: String[] = [];
            var unbalancedTree = this.recursivelyCreateColumns(abstractColDefs, 0, takenColumnIds);
            var treeDept = this.findMaxDept(unbalancedTree, 0);
            this.logger.log('Number of levels for grouped columns is ' + treeDept);
            var balancedTree = this.balanceColumnTree(unbalancedTree, 0, treeDept);

            //this.setOriginalParents(balancedTree, null);

            return {
                balancedTree: balancedTree,
                treeDept: treeDept
            };
        }

        private balanceColumnTree(unbalancedTree: OriginalColumnGroupChild[], currentDept: number, columnDept: number): OriginalColumnGroupChild[] {

            var result: OriginalColumnGroupChild[] = [];

            // go through each child, for groups, recurse a level deeper,
            // for columns we need to pad
            unbalancedTree.forEach( (child: OriginalColumnGroupChild)=> {
                if (child instanceof OriginalColumnGroup) {
                    var originalGroup = <OriginalColumnGroup> child;
                    var newChildren = this.balanceColumnTree(originalGroup.getChildren(), currentDept + 1, columnDept);
                    originalGroup.setChildren(newChildren);
                    result.push(originalGroup);
                } else {
                    var newChild = child;
                    for (var i = columnDept-1; i>=currentDept; i--) {
                        var paddedGroup = new OriginalColumnGroup(null);
                        paddedGroup.setChildren([newChild]);
                        newChild = paddedGroup;
                    }
                    result.push(newChild);
                }
            });

            return result;
        }

        private findMaxDept(treeChildren: OriginalColumnGroupChild[], dept: number): number {
            var maxDeptThisLevel = dept;
            for (var i = 0; i<treeChildren.length; i++) {
                var abstractColumn = treeChildren[i];
                if (abstractColumn instanceof OriginalColumnGroup) {
                    var originalGroup = <OriginalColumnGroup> abstractColumn;
                    var newDept = this.findMaxDept(originalGroup.getChildren(), dept+1);
                    if (maxDeptThisLevel<newDept) {
                        maxDeptThisLevel = newDept;
                    }
                }
            }
            return maxDeptThisLevel;
        }

        private recursivelyCreateColumns(abstractColDefs: AbstractColDef[], level: number, takenColumnIds: String[]): OriginalColumnGroupChild[] {

            var result: OriginalColumnGroupChild[] = [];

            abstractColDefs.forEach( (abstractColDef: AbstractColDef)=> {
                this.checkForDeprecatedItems(abstractColDef);
                if (this.isColumnGroup(abstractColDef)) {
                    var groupColDef = <ColGroupDef> abstractColDef;
                    var originalGroup = new OriginalColumnGroup(groupColDef);
                    var children = this.recursivelyCreateColumns(groupColDef.children, level + 1, takenColumnIds);
                    originalGroup.setChildren(children);
                    result.push(originalGroup);
                } else {
                    var colDef = <ColDef> abstractColDef;
                    var width = this.columnUtils.calculateColInitialWidth(colDef);
                    var colId = this.columnUtils.getUniqueColumnIdFromTaken(takenColumnIds, colDef.colId, colDef.field);
                    takenColumnIds.push(colId);
                    var column = new Column(colDef, width, colId);
                    result.push(column);
                }
            });

            return result;
        }

        private checkForDeprecatedItems(colDef: AbstractColDef) {
            if (colDef) {
                var colDefNoType = <any> colDef; // take out the type, so we can access attributes not defined in the type
                if (colDefNoType.group !== undefined) {
                    console.warn('ag-grid: colDef.group is invalid, please check documentation on how to do grouping as it changed in version 3');
                }
                if (colDefNoType.headerGroup !== undefined) {
                    console.warn('ag-grid: colDef.headerGroup is invalid, please check documentation on how to do grouping as it changed in version 3');
                }
                if (colDefNoType.headerGroupShow !== undefined) {
                    console.warn('ag-grid: colDef.headerGroupShow is invalid, should be columnGroupShow, please check documentation on how to do grouping as it changed in version 3');
                }
            }
        }

        // if object has children, we assume it's a group
        private isColumnGroup(abstractColDef: AbstractColDef): boolean {
            return (<ColGroupDef>abstractColDef).children !== undefined;
        }



    }

}