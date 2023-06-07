export class SideBarDefParser {
    static parse(toParse) {
        if (!toParse) {
            return undefined;
        }
        if (toParse === true) {
            return {
                toolPanels: [
                    SideBarDefParser.DEFAULT_COLUMN_COMP,
                    SideBarDefParser.DEFAULT_FILTER_COMP,
                ],
                defaultToolPanel: 'columns'
            };
        }
        if (typeof toParse === 'string') {
            return SideBarDefParser.parse([toParse]);
        }
        if (Array.isArray(toParse)) {
            const comps = [];
            toParse.forEach(key => {
                const lookupResult = SideBarDefParser.DEFAULT_BY_KEY[key];
                if (!lookupResult) {
                    console.warn(`AG Grid: the key ${key} is not a valid key for specifying a tool panel, valid keys are: ${Object.keys(SideBarDefParser.DEFAULT_BY_KEY).join(',')}`);
                    return;
                }
                comps.push(lookupResult);
            });
            if (comps.length === 0) {
                return undefined;
            }
            return {
                toolPanels: comps,
                defaultToolPanel: comps[0].id
            };
        }
        const result = {
            toolPanels: SideBarDefParser.parseComponents(toParse.toolPanels),
            defaultToolPanel: toParse.defaultToolPanel,
            hiddenByDefault: toParse.hiddenByDefault,
            position: toParse.position
        };
        return result;
    }
    static parseComponents(from) {
        const result = [];
        if (!from) {
            return result;
        }
        from.forEach((it) => {
            let toAdd = null;
            if (typeof it === 'string') {
                const lookupResult = SideBarDefParser.DEFAULT_BY_KEY[it];
                if (!lookupResult) {
                    console.warn(`AG Grid: the key ${it} is not a valid key for specifying a tool panel, valid keys are: ${Object.keys(SideBarDefParser.DEFAULT_BY_KEY).join(',')}`);
                    return;
                }
                toAdd = lookupResult;
            }
            else {
                toAdd = it;
            }
            result.push(toAdd);
        });
        return result;
    }
}
SideBarDefParser.DEFAULT_COLUMN_COMP = {
    id: 'columns',
    labelDefault: 'Columns',
    labelKey: 'columns',
    iconKey: 'columns',
    toolPanel: 'agColumnsToolPanel',
};
SideBarDefParser.DEFAULT_FILTER_COMP = {
    id: 'filters',
    labelDefault: 'Filters',
    labelKey: 'filters',
    iconKey: 'filter',
    toolPanel: 'agFiltersToolPanel',
};
SideBarDefParser.DEFAULT_BY_KEY = {
    columns: SideBarDefParser.DEFAULT_COLUMN_COMP,
    filters: SideBarDefParser.DEFAULT_FILTER_COMP
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lkZUJhckRlZlBhcnNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zaWRlQmFyL3NpZGVCYXJEZWZQYXJzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsTUFBTSxPQUFPLGdCQUFnQjtJQXNCekIsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFvRTtRQUM3RSxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQUUsT0FBTyxTQUFTLENBQUM7U0FBRTtRQUNuQyxJQUFJLE9BQU8sS0FBSyxJQUFJLEVBQUU7WUFDbEIsT0FBTztnQkFDSCxVQUFVLEVBQUU7b0JBQ1IsZ0JBQWdCLENBQUMsbUJBQW1CO29CQUNwQyxnQkFBZ0IsQ0FBQyxtQkFBbUI7aUJBQ3ZDO2dCQUNELGdCQUFnQixFQUFFLFNBQVM7YUFDOUIsQ0FBQztTQUNMO1FBRUQsSUFBSSxPQUFPLE9BQU8sS0FBSyxRQUFRLEVBQUU7WUFBRSxPQUFPLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7U0FBRTtRQUU5RSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDeEIsTUFBTSxLQUFLLEdBQW1CLEVBQUUsQ0FBQztZQUNqQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUNsQixNQUFNLFlBQVksR0FBRyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQzFELElBQUksQ0FBQyxZQUFZLEVBQUU7b0JBQ2YsT0FBTyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxvRUFBb0UsTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUNsSyxPQUFPO2lCQUNWO2dCQUVELEtBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDN0IsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUNwQixPQUFPLFNBQVMsQ0FBQzthQUNwQjtZQUVELE9BQU87Z0JBQ0gsVUFBVSxFQUFFLEtBQUs7Z0JBQ2pCLGdCQUFnQixFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO2FBQ2hDLENBQUM7U0FDTDtRQUVELE1BQU0sTUFBTSxHQUFlO1lBQ3ZCLFVBQVUsRUFBRSxnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQztZQUNoRSxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsZ0JBQWdCO1lBQzFDLGVBQWUsRUFBRSxPQUFPLENBQUMsZUFBZTtZQUN4QyxRQUFRLEVBQUUsT0FBTyxDQUFDLFFBQVE7U0FDN0IsQ0FBQztRQUVGLE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFFRCxNQUFNLENBQUMsZUFBZSxDQUFDLElBQWdDO1FBQ25ELE1BQU0sTUFBTSxHQUFtQixFQUFFLENBQUM7UUFFbEMsSUFBSSxDQUFDLElBQUksRUFBRTtZQUFFLE9BQU8sTUFBTSxDQUFDO1NBQUU7UUFFN0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQXlCLEVBQUUsRUFBRTtZQUN2QyxJQUFJLEtBQUssR0FBd0IsSUFBSSxDQUFDO1lBQ3RDLElBQUksT0FBTyxFQUFFLEtBQUssUUFBUSxFQUFFO2dCQUN4QixNQUFNLFlBQVksR0FBRyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3pELElBQUksQ0FBQyxZQUFZLEVBQUU7b0JBQ2YsT0FBTyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxvRUFBb0UsTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUNqSyxPQUFPO2lCQUNWO2dCQUVELEtBQUssR0FBRyxZQUFZLENBQUM7YUFDeEI7aUJBQU07Z0JBQ0gsS0FBSyxHQUFHLEVBQUUsQ0FBQzthQUNkO1lBRUQsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN2QixDQUFDLENBQUMsQ0FBQztRQUVILE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7O0FBMUZlLG9DQUFtQixHQUFpQjtJQUNoRCxFQUFFLEVBQUUsU0FBUztJQUNiLFlBQVksRUFBRSxTQUFTO0lBQ3ZCLFFBQVEsRUFBRSxTQUFTO0lBQ25CLE9BQU8sRUFBRSxTQUFTO0lBQ2xCLFNBQVMsRUFBRSxvQkFBb0I7Q0FDbEMsQ0FBQztBQUVjLG9DQUFtQixHQUFpQjtJQUNoRCxFQUFFLEVBQUUsU0FBUztJQUNiLFlBQVksRUFBRSxTQUFTO0lBQ3ZCLFFBQVEsRUFBRSxTQUFTO0lBQ25CLE9BQU8sRUFBRSxRQUFRO0lBQ2pCLFNBQVMsRUFBRSxvQkFBb0I7Q0FDbEMsQ0FBQztBQUVjLCtCQUFjLEdBQWtDO0lBQzVELE9BQU8sRUFBRSxnQkFBZ0IsQ0FBQyxtQkFBbUI7SUFDN0MsT0FBTyxFQUFFLGdCQUFnQixDQUFDLG1CQUFtQjtDQUNoRCxDQUFDIn0=