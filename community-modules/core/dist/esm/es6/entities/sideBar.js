/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
export class SideBarDefParser {
    static parse(toParse) {
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
                return null;
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
