import { IToolPanelComp } from "../interfaces/iToolPanel";

export interface ToolPanelDef {
    /** The unique ID for this panel. Used in the API and elsewhere to refer to the panel. */
    id: string;
    /** The key used for [localisation](/localisation/) for displaying the label. The label is displayed in the tab button. */
    labelKey: string;
    /** The default label if `labelKey` is missing or does not map to valid text through localisation. */
    labelDefault: string;
    /** The min width of the tool panel. Default: `100` */
    minWidth?: number;
    /** The max width of the tool panel. Default: `undefined` */
    maxWidth?: number;
    /** The initial width of the tool panel. Default: `$side-bar-panel-width (theme variable)` */
    width?: number;
    /** The [key of the icon](/custom-icons/) to be used as a graphical aid beside the label in the side bar. */
    iconKey: string;

    /**
     * The tool panel component to use as the panel.
     * The provided panels use components `agColumnsToolPanel` and `agFiltersToolPanel`.
     * To provide your own custom panel component, you reference it by name here.
     */
    toolPanel?: any;
    /** @deprecated Same as `toolPanel` but for framework specific components. As of v27, use toolPanel instead for Framework components */
    toolPanelFramework?: any;
    /** Customise the parameters provided to the `toolPanel` component. */
    toolPanelParams?: any;
}

export interface SideBarDef {
    /**
     * A list of all the panels to place in the side bar. The panels will be displayed in the provided order from top to bottom.
     */
    toolPanels?: (ToolPanelDef | string)[];
    /** The panel (identified by ID) to open by default. If none specified, the side bar is initially displayed closed. */
    defaultToolPanel?: string;
    /** To hide the side bar by default, set this to `true`. If left undefined the side bar will be shown. */
    hiddenByDefault?: boolean;
    /** Sets the side bar position relative to the grid. */
    position?: 'left' | 'right';
}

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

    static readonly DEFAULT_BY_KEY: {[p: string]: ToolPanelDef} = {
        columns: SideBarDefParser.DEFAULT_COLUMN_COMP,
        filters: SideBarDefParser.DEFAULT_FILTER_COMP
    };

    static parse(toParse: SideBarDef | string | string[] | boolean): SideBarDef | null {
        if (!toParse) { return null; }
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
            const comps: ToolPanelDef [] = [];
            toParse.forEach(key => {
                const lookupResult = SideBarDefParser.DEFAULT_BY_KEY [key];
                if (! lookupResult) {
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

        const result: SideBarDef = {
            toolPanels: SideBarDefParser.parseComponents(toParse.toolPanels),
            defaultToolPanel: toParse.defaultToolPanel,
            hiddenByDefault: toParse.hiddenByDefault,
            position: toParse.position
        };

        return result;
    }

    static parseComponents(from?: (ToolPanelDef | string)[]) : ToolPanelDef[] {
        const result:ToolPanelDef[] = [];

        if (!from) { return result; }

        from.forEach((it: ToolPanelDef | string) => {
            let toAdd: ToolPanelDef | null = null;
            if (typeof it === 'string') {
                const lookupResult = SideBarDefParser.DEFAULT_BY_KEY [it];
                if (! lookupResult) {
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