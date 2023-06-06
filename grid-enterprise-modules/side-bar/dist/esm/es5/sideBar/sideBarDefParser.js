var SideBarDefParser = /** @class */ (function () {
    function SideBarDefParser() {
    }
    SideBarDefParser.parse = function (toParse) {
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
            var comps_1 = [];
            toParse.forEach(function (key) {
                var lookupResult = SideBarDefParser.DEFAULT_BY_KEY[key];
                if (!lookupResult) {
                    console.warn("AG Grid: the key " + key + " is not a valid key for specifying a tool panel, valid keys are: " + Object.keys(SideBarDefParser.DEFAULT_BY_KEY).join(','));
                    return;
                }
                comps_1.push(lookupResult);
            });
            if (comps_1.length === 0) {
                return undefined;
            }
            return {
                toolPanels: comps_1,
                defaultToolPanel: comps_1[0].id
            };
        }
        var result = {
            toolPanels: SideBarDefParser.parseComponents(toParse.toolPanels),
            defaultToolPanel: toParse.defaultToolPanel,
            hiddenByDefault: toParse.hiddenByDefault,
            position: toParse.position
        };
        return result;
    };
    SideBarDefParser.parseComponents = function (from) {
        var result = [];
        if (!from) {
            return result;
        }
        from.forEach(function (it) {
            var toAdd = null;
            if (typeof it === 'string') {
                var lookupResult = SideBarDefParser.DEFAULT_BY_KEY[it];
                if (!lookupResult) {
                    console.warn("AG Grid: the key " + it + " is not a valid key for specifying a tool panel, valid keys are: " + Object.keys(SideBarDefParser.DEFAULT_BY_KEY).join(','));
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
    };
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
    return SideBarDefParser;
}());
export { SideBarDefParser };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lkZUJhckRlZlBhcnNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zaWRlQmFyL3NpZGVCYXJEZWZQYXJzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7SUFBQTtJQTRGQSxDQUFDO0lBdEVVLHNCQUFLLEdBQVosVUFBYSxPQUFvRTtRQUM3RSxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQUUsT0FBTyxTQUFTLENBQUM7U0FBRTtRQUNuQyxJQUFJLE9BQU8sS0FBSyxJQUFJLEVBQUU7WUFDbEIsT0FBTztnQkFDSCxVQUFVLEVBQUU7b0JBQ1IsZ0JBQWdCLENBQUMsbUJBQW1CO29CQUNwQyxnQkFBZ0IsQ0FBQyxtQkFBbUI7aUJBQ3ZDO2dCQUNELGdCQUFnQixFQUFFLFNBQVM7YUFDOUIsQ0FBQztTQUNMO1FBRUQsSUFBSSxPQUFPLE9BQU8sS0FBSyxRQUFRLEVBQUU7WUFBRSxPQUFPLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7U0FBRTtRQUU5RSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDeEIsSUFBTSxPQUFLLEdBQW1CLEVBQUUsQ0FBQztZQUNqQyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQUEsR0FBRztnQkFDZixJQUFNLFlBQVksR0FBRyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQzFELElBQUksQ0FBQyxZQUFZLEVBQUU7b0JBQ2YsT0FBTyxDQUFDLElBQUksQ0FBQyxzQkFBb0IsR0FBRyx5RUFBb0UsTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFHLENBQUMsQ0FBQztvQkFDbEssT0FBTztpQkFDVjtnQkFFRCxPQUFLLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQzdCLENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxPQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDcEIsT0FBTyxTQUFTLENBQUM7YUFDcEI7WUFFRCxPQUFPO2dCQUNILFVBQVUsRUFBRSxPQUFLO2dCQUNqQixnQkFBZ0IsRUFBRSxPQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTthQUNoQyxDQUFDO1NBQ0w7UUFFRCxJQUFNLE1BQU0sR0FBZTtZQUN2QixVQUFVLEVBQUUsZ0JBQWdCLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUM7WUFDaEUsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDLGdCQUFnQjtZQUMxQyxlQUFlLEVBQUUsT0FBTyxDQUFDLGVBQWU7WUFDeEMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxRQUFRO1NBQzdCLENBQUM7UUFFRixPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDO0lBRU0sZ0NBQWUsR0FBdEIsVUFBdUIsSUFBZ0M7UUFDbkQsSUFBTSxNQUFNLEdBQW1CLEVBQUUsQ0FBQztRQUVsQyxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQUUsT0FBTyxNQUFNLENBQUM7U0FBRTtRQUU3QixJQUFJLENBQUMsT0FBTyxDQUFDLFVBQUMsRUFBeUI7WUFDbkMsSUFBSSxLQUFLLEdBQXdCLElBQUksQ0FBQztZQUN0QyxJQUFJLE9BQU8sRUFBRSxLQUFLLFFBQVEsRUFBRTtnQkFDeEIsSUFBTSxZQUFZLEdBQUcsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUN6RCxJQUFJLENBQUMsWUFBWSxFQUFFO29CQUNmLE9BQU8sQ0FBQyxJQUFJLENBQUMsc0JBQW9CLEVBQUUseUVBQW9FLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBRyxDQUFDLENBQUM7b0JBQ2pLLE9BQU87aUJBQ1Y7Z0JBRUQsS0FBSyxHQUFHLFlBQVksQ0FBQzthQUN4QjtpQkFBTTtnQkFDSCxLQUFLLEdBQUcsRUFBRSxDQUFDO2FBQ2Q7WUFFRCxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3ZCLENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQTFGZSxvQ0FBbUIsR0FBaUI7UUFDaEQsRUFBRSxFQUFFLFNBQVM7UUFDYixZQUFZLEVBQUUsU0FBUztRQUN2QixRQUFRLEVBQUUsU0FBUztRQUNuQixPQUFPLEVBQUUsU0FBUztRQUNsQixTQUFTLEVBQUUsb0JBQW9CO0tBQ2xDLENBQUM7SUFFYyxvQ0FBbUIsR0FBaUI7UUFDaEQsRUFBRSxFQUFFLFNBQVM7UUFDYixZQUFZLEVBQUUsU0FBUztRQUN2QixRQUFRLEVBQUUsU0FBUztRQUNuQixPQUFPLEVBQUUsUUFBUTtRQUNqQixTQUFTLEVBQUUsb0JBQW9CO0tBQ2xDLENBQUM7SUFFYywrQkFBYyxHQUFrQztRQUM1RCxPQUFPLEVBQUUsZ0JBQWdCLENBQUMsbUJBQW1CO1FBQzdDLE9BQU8sRUFBRSxnQkFBZ0IsQ0FBQyxtQkFBbUI7S0FDaEQsQ0FBQztJQXdFTix1QkFBQztDQUFBLEFBNUZELElBNEZDO1NBNUZZLGdCQUFnQiJ9