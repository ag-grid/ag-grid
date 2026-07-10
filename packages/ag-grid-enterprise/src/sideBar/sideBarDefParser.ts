import type { LogService, SideBarDef, ToolPanelDef } from 'ag-grid-community';

const DEFAULT_COLUMN_COMP: ToolPanelDef = {
    id: 'columns',
    labelDefault: 'Columns',
    labelKey: 'columns',
    iconKey: 'columnsToolPanel',
    toolPanel: 'agColumnsToolPanel',
};

const DEFAULT_FILTER_COMP: ToolPanelDef = {
    id: 'filters',
    labelDefault: 'Filters',
    labelKey: 'filters',
    iconKey: 'filtersToolPanel',
    toolPanel: 'agFiltersToolPanel',
};

const DEFAULT_NEW_FILTER_COMP: ToolPanelDef = {
    id: 'filters-new',
    labelDefault: 'Filters',
    labelKey: 'filters',
    iconKey: 'filtersToolPanel',
    toolPanel: 'agNewFiltersToolPanel',
};

const DEFAULT_BY_KEY: { [p: string]: ToolPanelDef } = {
    columns: DEFAULT_COLUMN_COMP,
    filters: DEFAULT_FILTER_COMP,
    'filters-new': DEFAULT_NEW_FILTER_COMP,
};

export function parseSideBarDef(
    toParse: SideBarDef | string | string[] | boolean | null | undefined,
    log: LogService
): SideBarDef | undefined {
    if (!toParse) {
        return undefined;
    }
    if (toParse === true) {
        return {
            toolPanels: [DEFAULT_COLUMN_COMP, DEFAULT_FILTER_COMP],
            defaultToolPanel: 'columns',
        };
    }

    if (typeof toParse === 'string') {
        return parseSideBarDef([toParse], log);
    }

    if (Array.isArray(toParse)) {
        const comps: ToolPanelDef[] = [];
        for (const key of toParse) {
            const lookupResult = DEFAULT_BY_KEY[key];
            if (!lookupResult) {
                log.warn(215, { key, validKeys: Object.keys(DEFAULT_BY_KEY) });
                continue;
            }

            comps.push(lookupResult);
        }

        if (comps.length === 0) {
            return undefined;
        }

        return {
            toolPanels: comps,
            defaultToolPanel: comps[0].id,
        };
    }

    return {
        toolPanels: parseComponents(toParse.toolPanels, log),
        defaultToolPanel: toParse.defaultToolPanel,
        hiddenByDefault: toParse.hiddenByDefault,
        position: toParse.position,
        hideButtons: toParse.hideButtons,
    };
}

function parseComponents(from: (ToolPanelDef | string)[] | undefined, log: LogService): ToolPanelDef[] {
    const result: ToolPanelDef[] = [];

    if (!from) {
        return result;
    }

    from.forEach((it: ToolPanelDef | string) => {
        const parsed = parseOneComponent(it, log);
        if (!parsed) {
            return;
        }
        result.push(parsed);
    });

    return result;
}

function parseOneComponent(it: ToolPanelDef | string, log: LogService): ToolPanelDef | null {
    if (typeof it !== 'string') {
        return it;
    }
    if (DEFAULT_BY_KEY[it]) {
        return DEFAULT_BY_KEY[it];
    }
    log.warn(215, { key: it, validKeys: Object.keys(DEFAULT_BY_KEY) });
    return null;
}
