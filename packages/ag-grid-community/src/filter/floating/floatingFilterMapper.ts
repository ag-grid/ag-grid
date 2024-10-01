import { _getFilterCompKeys } from '../../components/framework/userCompUtils';
import type { IFilterDef } from '../../interfaces/iFilter';
import type { IFrameworkOverrides } from '../../interfaces/iFrameworkOverrides';

export function getDefaultFloatingFilterType(
    frameworkOverrides: IFrameworkOverrides,
    def: IFilterDef,
    getFromDefault: () => string
): string | null {
    if (def == null) {
        return null;
    }

    let defaultFloatingFilterType: string | null = null;

    const { compName, jsComp, fwComp } = _getFilterCompKeys(frameworkOverrides, def);

    if (compName) {
        const floatingFilterTypeMap: { [p: string]: string } = {
            set: 'agSetColumnFloatingFilter',
            agSetColumnFilter: 'agSetColumnFloatingFilter',

            multi: 'agMultiColumnFloatingFilter',
            agMultiColumnFilter: 'agMultiColumnFloatingFilter',

            group: 'agGroupColumnFloatingFilter',
            agGroupColumnFilter: 'agGroupColumnFloatingFilter',

            number: 'agNumberColumnFloatingFilter',
            agNumberColumnFilter: 'agNumberColumnFloatingFilter',

            date: 'agDateColumnFloatingFilter',
            agDateColumnFilter: 'agDateColumnFloatingFilter',

            text: 'agTextColumnFloatingFilter',
            agTextColumnFilter: 'agTextColumnFloatingFilter',
        };
        // will be undefined if not in the map
        defaultFloatingFilterType = floatingFilterTypeMap[compName];
    } else {
        const usingDefaultFilter = jsComp == null && fwComp == null && def.filter === true;
        if (usingDefaultFilter) {
            defaultFloatingFilterType = getFromDefault();
        }
    }

    return defaultFloatingFilterType;
}
