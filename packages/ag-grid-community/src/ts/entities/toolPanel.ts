import {ICellRendererComp, ICellRendererFunc} from "../rendering/cellRenderers/iCellRenderer";

export interface ToolPanelItemDef {
    id: string,
    labelDefault: string,
    labelKey: string,
    // To allow binding this to an specific icon
    iconKey: string,
    component?: {new(): ICellRendererComp} | ICellRendererFunc | string
    componentFramework?: any;
    componentParams?: any;
}

export interface ToolPanelDef {
    items?: (ToolPanelItemDef | string) [];
    defaultItem?: string;
}

export class ToolPanelDefLikeParser {
    static readonly DEFAULT_COLUMN_COMP: ToolPanelItemDef = {
        id: 'columns',
        labelDefault: 'Columns',
        labelKey: 'columns',
        iconKey: 'columns',
        component: 'agColumnsToolPanel',
    };

    static readonly DEFAULT_FILTER_COMP: ToolPanelItemDef = {
        id: 'filters',
        labelDefault: 'Filters',
        labelKey: 'filters',
        iconKey: 'filter',
        component: 'agFiltersToolPanel',
    };

    static readonly DEFAULT_BY_KEY: {[p: string]: ToolPanelItemDef} = {
        columns: ToolPanelDefLikeParser.DEFAULT_COLUMN_COMP,
        filters: ToolPanelDefLikeParser.DEFAULT_FILTER_COMP
    };

    static parse (toParse: ToolPanelDef | string | string[] | boolean): ToolPanelDef {
        if (toParse === false) return null;
        if (toParse === true) {
            return {
                items: [
                    ToolPanelDefLikeParser.DEFAULT_COLUMN_COMP,
                    ToolPanelDefLikeParser.DEFAULT_FILTER_COMP,
                ],
                defaultItem: 'columns'
            }
        }

        if (typeof toParse === 'string') return ToolPanelDefLikeParser.parse([toParse]);

        if (Array.isArray(toParse)) {
            let comps: ToolPanelItemDef [] = [];
            toParse.forEach(key=>{
                const lookupResult = ToolPanelDefLikeParser.DEFAULT_BY_KEY [key];
                if (! lookupResult) {
                    console.warn(`ag-grid: the key ${key} is not a valid key for specifying a tool panel, valid keys are: ${Object.keys(ToolPanelDefLikeParser.DEFAULT_BY_KEY).join(',')}`)
                    return
                }

                comps.push(lookupResult);
            });

            if (comps.length === 0) {
                return null;
            }

            return {
                items: comps,
                defaultItem: comps[0].id
            }
        }

        let result: ToolPanelDef = {
            items: ToolPanelDefLikeParser.parseComponents(toParse.items),
            defaultItem: toParse.defaultItem
        };

        return result;
    }

    static parseComponents (from: (ToolPanelItemDef | string)[]) : ToolPanelItemDef[] {
        let result:ToolPanelItemDef[] = [];

        from.forEach((it: ToolPanelItemDef | string)=>{
            let toAdd: ToolPanelItemDef = null;
            if (typeof it === 'string') {
                const lookupResult = ToolPanelDefLikeParser.DEFAULT_BY_KEY [it];
                if (! lookupResult) {
                    console.warn(`ag-grid: the key ${it} is not a valid key for specifying a tool panel, valid keys are: ${Object.keys(ToolPanelDefLikeParser.DEFAULT_BY_KEY).join(',')}`)
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