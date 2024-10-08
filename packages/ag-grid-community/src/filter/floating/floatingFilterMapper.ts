import { _getFilterCompKeys } from '../../components/framework/userCompUtils';
import type { IFilterDef } from '../../interfaces/iFilter';
import type { IFrameworkOverrides } from '../../interfaces/iFrameworkOverrides';

export function _getDefaultFloatingFilterType(
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
            agSetColumnFilter: 'agSetColumnFloatingFilter',
            agMultiColumnFilter: 'agMultiColumnFloatingFilter',
            agGroupColumnFilter: 'agGroupColumnFloatingFilter',
            agNumberColumnFilter: 'agNumberColumnFloatingFilter',
            agDateColumnFilter: 'agDateColumnFloatingFilter',
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
