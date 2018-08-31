import {ICellRendererComp, ICellRendererFunc} from "../rendering/cellRenderers/iCellRenderer";

export interface ToolPanelComponentDef {
    key: string,
    buttonLabel: string,
    // To allow binding this to an specific icon
    iconKey: string,
    component?: {new(): ICellRendererComp} | ICellRendererFunc | string
    componentFramework?: any;
    componentParams?: any;
}

export interface ToolPanelDef {
    components?: (ToolPanelComponentDef | string) [];
    defaultTab?: string;
}

export class ToolPanelDefLikeParser {
    static readonly DEFAULT_COLUMN_COMP = {
        key: 'columns',
        buttonLabel: 'Columns',
        iconKey: 'columns',
        component: 'agColumnsToolPanel',
    };

    static readonly DEFAULT_FILTER_COMP = {
        key: 'filters',
        buttonLabel: 'Filters',
        iconKey: 'filter',
        component: 'agFiltersToolPanel',
    };

    static readonly DEFAULT_BY_KEY: {[p: string]: ToolPanelComponentDef} = {
        columns: ToolPanelDefLikeParser.DEFAULT_COLUMN_COMP,
        filters: ToolPanelDefLikeParser.DEFAULT_FILTER_COMP
    };

    static parse (toParse: ToolPanelDef | string | string[] | boolean): ToolPanelDef {
        if (toParse === false) return null;
        if (toParse === true) {
            return {
                components: [
                    ToolPanelDefLikeParser.DEFAULT_COLUMN_COMP,
                    ToolPanelDefLikeParser.DEFAULT_FILTER_COMP,
                ],
                defaultTab: 'columns'
            }
        }

        if (typeof toParse === 'string') return ToolPanelDefLikeParser.parse([toParse]);

        if (Array.isArray(toParse)) {
            let comps: ToolPanelComponentDef [] = [];
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
                components: comps,
                defaultTab: comps[0].key
            }
        }

        let result: ToolPanelDef = {
            components: ToolPanelDefLikeParser.parseComponents(toParse.components),
            defaultTab: toParse.defaultTab
        };

        return result;
    }

    static parseComponents (from: (ToolPanelComponentDef | string)[]) : ToolPanelComponentDef[] {
        let result:ToolPanelComponentDef[] = [];

        from.forEach((it: ToolPanelComponentDef | string)=>{
            let toAdd: ToolPanelComponentDef = null;
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