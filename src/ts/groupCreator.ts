module awk.grid {

    export class GroupCreator {

        private valueService: ValueService;

        public init(valueService: ValueService) {
            this.valueService = valueService;
        }

        public group(rowNodes: any, groupedCols: any, expandByDefault: any) {

            var topMostGroup = {
                level: -1,
                children: <any>[],
                childrenMap: <any>{}
            };

            var allGroups = <any>[];
            allGroups.push(topMostGroup);

            var levelToInsertChild = groupedCols.length - 1;
            var i: number;
            var currentLevel: number;
            var node: any;
            var data: any;
            var currentGroup: any;
            var groupKey: any;
            var nextGroup: any;

            // start at -1 and go backwards, as all the positive indexes
            // are already used by the nodes.
            var index = -1;

            for (i = 0; i < rowNodes.length; i++) {
                node = rowNodes[i];
                data = node.data;

                // all leaf nodes have the same level in this grouping, which is one level after the last group
                node.level = levelToInsertChild + 1;

                for (currentLevel = 0; currentLevel < groupedCols.length; currentLevel++) {
                    var groupColumn = groupedCols[currentLevel];
                    groupKey = this.valueService.getValue(groupColumn.colDef, data, node);

                    if (currentLevel === 0) {
                        currentGroup = topMostGroup;
                    }

                    // if group doesn't exist yet, create it
                    nextGroup = currentGroup.childrenMap[groupKey];
                    if (!nextGroup) {
                        nextGroup = {
                            group: true,
                            field: groupColumn.colId,
                            id: index--,
                            key: groupKey,
                            expanded: this.isExpanded(expandByDefault, currentLevel),
                            children: [],
                            // for top most level, parent is null
                            parent: currentGroup === topMostGroup ? null : currentGroup,
                            allChildrenCount: 0,
                            level: currentGroup.level + 1,
                            childrenMap: {} //this is a temporary map, we remove at the end of this method
                        };
                        currentGroup.childrenMap[groupKey] = nextGroup;
                        currentGroup.children.push(nextGroup);
                        allGroups.push(nextGroup);
                    }

                    nextGroup.allChildrenCount++;

                    if (currentLevel == levelToInsertChild) {
                        node.parent = nextGroup === topMostGroup ? null : nextGroup;
                        nextGroup.children.push(node);
                    } else {
                        currentGroup = nextGroup;
                    }
                }

            }

            //remove the temporary map
            for (i = 0; i < allGroups.length; i++) {
                delete allGroups[i].childrenMap;
            }

            return topMostGroup.children;
        }

        isExpanded(expandByDefault: any, level: any) {
            if (typeof expandByDefault === 'number') {
                return level < expandByDefault;
            } else {
                return expandByDefault === true || expandByDefault === 'true';
            }
        }
    }
}

