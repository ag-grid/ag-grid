import { SideBarDef, ToolPanelDef } from "@ag-grid-community/core";

export class SideBarDefParser {
    static readonly DEFAULT_COLUMN_COMP: ToolPanelDef = {
        id: 'columns',
        labelDefault: 'Columns',
        labelKey: 'columns',
        iconKey: 'columns',
        toolPanel: 'agColumnsToolPanel',
    };

    static readonly DEFAULT_FILTER_COMP: ToolPanelDef = {
        id: 'filters',
        labelDefault: 'Filters',
        labelKey: 'filters',
        iconKey: 'filter',
        toolPanel: 'agFiltersToolPanel',
    };

    static readonly DEFAULT_BY_KEY: { [p: string]: ToolPanelDef } = {
        columns: SideBarDefParser.DEFAULT_COLUMN_COMP,
        filters: SideBarDefParser.DEFAULT_FILTER_COMP
    };

    static parse(toParse: SideBarDef | string | string[] | boolean | null | undefined): SideBarDef | undefined {
        if (!toParse) { return undefined; }
        if (toParse === true) {
            return {
                toolPanels: [
                    SideBarDefParser.DEFAULT_COLUMN_COMP,
                    SideBarDefParser.DEFAULT_FILTER_COMP,
                ],
                defaultToolPanel: 'columns'
            };
        }

        if (typeof toParse === 'string') { return SideBarDefParser.parse([toParse]); }

        if (Array.isArray(toParse)) {
            const comps: ToolPanelDef[] = [];
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

        const result: SideBarDef = {
            toolPanels: SideBarDefParser.parseComponents(toParse.toolPanels),
            defaultToolPanel: toParse.defaultToolPanel,
            hiddenByDefault: toParse.hiddenByDefault,
            position: toParse.position
        };

        return result;
    }

    static parseComponents(from?: (ToolPanelDef | string)[]): ToolPanelDef[] {
        const result: ToolPanelDef[] = [];

        if (!from) { return result; }

        from.forEach((it: ToolPanelDef | string) => {
            let toAdd: ToolPanelDef | null = null;
            if (typeof it === 'string') {
                const lookupResult = SideBarDefParser.DEFAULT_BY_KEY[it];
                if (!lookupResult) {
                    console.warn(`AG Grid: the key ${it} is not a valid key for specifying a tool panel, valid keys are: ${Object.keys(SideBarDefParser.DEFAULT_BY_KEY).join(',')}`);
                    return;
                }

                toAdd = lookupResult;
            } else {
                toAdd = it;
            }

            result.push(toAdd);
        });

        return result;
    }
}