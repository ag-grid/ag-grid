import {ICellRendererComp, ICellRendererFunc} from "../rendering/cellRenderers/iCellRenderer";

export interface ToolPanelDef {
    id: string,
    labelDefault: string,
    labelKey: string,
    // To allow binding this to an specific icon
    iconKey: string,
    component?: {new(): ICellRendererComp} | ICellRendererFunc | string
    componentFramework?: any;
    componentParams?: any;
}

export interface SideBarDef {
    toolPanels?: (ToolPanelDef | string) [];
    defaultToolPanel?: string;
}

export class SideBarDefLikeParser {
    static readonly DEFAULT_COLUMN_COMP: ToolPanelDef = {
        id: 'columns',
        labelDefault: 'Columns',
        labelKey: 'columns',
        iconKey: 'columns',
        component: 'agColumnsToolPanel',
    };

    static readonly DEFAULT_FILTER_COMP: ToolPanelDef = {
        id: 'filters',
        labelDefault: 'Filters',
        labelKey: 'filters',
        iconKey: 'filter',
        component: 'agFiltersToolPanel',
    };

    static readonly DEFAULT_BY_KEY: {[p: string]: ToolPanelDef} = {
        columns: SideBarDefLikeParser.DEFAULT_COLUMN_COMP,
        filters: SideBarDefLikeParser.DEFAULT_FILTER_COMP
    };

    static parse (toParse: SideBarDef | string | string[] | boolean): SideBarDef {
        if (toParse === false) return null;
        if (toParse === true) {
            return {
                toolPanels: [
                    SideBarDefLikeParser.DEFAULT_COLUMN_COMP,
                    SideBarDefLikeParser.DEFAULT_FILTER_COMP,
                ],
                defaultToolPanel: 'columns'
            }
        }

        if (typeof toParse === 'string') return SideBarDefLikeParser.parse([toParse]);

        if (Array.isArray(toParse)) {
            let comps: ToolPanelDef [] = [];
            toParse.forEach(key=>{
                const lookupResult = SideBarDefLikeParser.DEFAULT_BY_KEY [key];
                if (! lookupResult) {
                    console.warn(`ag-grid: the key ${key} is not a valid key for specifying a tool panel, valid keys are: ${Object.keys(SideBarDefLikeParser.DEFAULT_BY_KEY).join(',')}`)
                    return
                }

                comps.push(lookupResult);
            });

            if (comps.length === 0) {
                return null;
            }

            return {
                toolPanels: comps,
                defaultToolPanel: comps[0].id
            }
        }

        let result: SideBarDef = {
            toolPanels: SideBarDefLikeParser.parseComponents(toParse.toolPanels),
            defaultToolPanel: toParse.defaultToolPanel
        };

        return result;
    }

    static parseComponents (from: (ToolPanelDef | string)[]) : ToolPanelDef[] {
        let result:ToolPanelDef[] = [];

        from.forEach((it: ToolPanelDef | string)=>{
            let toAdd: ToolPanelDef = null;
            if (typeof it === 'string') {
                const lookupResult = SideBarDefLikeParser.DEFAULT_BY_KEY [it];
                if (! lookupResult) {
                    console.warn(`ag-grid: the key ${it} is not a valid key for specifying a tool panel, valid keys are: ${Object.keys(SideBarDefLikeParser.DEFAULT_BY_KEY).join(',')}`)
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