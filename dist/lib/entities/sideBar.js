/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SideBarDefParser = /** @class */ (function () {
    function SideBarDefParser() {
    }
    SideBarDefParser.parse = function (toParse) {
        if (!toParse) {
            return null;
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
                    console.warn("ag-grid: the key " + key + " is not a valid key for specifying a tool panel, valid keys are: " + Object.keys(SideBarDefParser.DEFAULT_BY_KEY).join(','));
                    return;
                }
                comps_1.push(lookupResult);
            });
            if (comps_1.length === 0) {
                return null;
            }
            return {
                toolPanels: comps_1,
                defaultToolPanel: comps_1[0].id
            };
        }
        var result = {
            toolPanels: SideBarDefParser.parseComponents(toParse.toolPanels),
            defaultToolPanel: toParse.defaultToolPanel,
            hiddenByDefault: toParse.hiddenByDefault
        };
        return result;
    };
    SideBarDefParser.parseComponents = function (from) {
        var result = [];
        from.forEach(function (it) {
            var toAdd = null;
            if (typeof it === 'string') {
                var lookupResult = SideBarDefParser.DEFAULT_BY_KEY[it];
                if (!lookupResult) {
                    console.warn("ag-grid: the key " + it + " is not a valid key for specifying a tool panel, valid keys are: " + Object.keys(SideBarDefParser.DEFAULT_BY_KEY).join(','));
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
exports.SideBarDefParser = SideBarDefParser;
