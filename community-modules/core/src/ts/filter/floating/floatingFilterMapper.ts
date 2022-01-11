import { IFilterDef } from "../../interfaces/iFilter";
import { ModuleNames } from "../../modules/moduleNames";
import { ModuleRegistry } from "../../modules/moduleRegistry";

export class FloatingFilterMapper {
    private static filterToFloatingFilterMapping: { [p: string]: string; } = {
        set: 'agSetColumnFloatingFilter',
        agSetColumnFilter: 'agSetColumnFloatingFilter',

        multi: 'agMultiColumnFloatingFilter',
        agMultiColumnFilter: 'agMultiColumnFloatingFilter',

        number: 'agNumberColumnFloatingFilter',
        agNumberColumnFilter: 'agNumberColumnFloatingFilter',

        date: 'agDateColumnFloatingFilter',
        agDateColumnFilter: 'agDateColumnFloatingFilter',

        text: 'agTextColumnFloatingFilter',
        agTextColumnFilter: 'agTextColumnFloatingFilter'
    };

    public static getFloatingFilterType(filterType: string): string {
        return this.filterToFloatingFilterMapping[filterType];
    }

    public static getDefaultFloatingFilterType(def: IFilterDef): string | null {
        if (def == null) { return null; }

        let defaultFloatingFilterType: string | null = null;

        const filter = def.filter!=null ? def.filter : def.filterComp;
        if (typeof filter === 'string') {
            // will be undefined if not in the map
            defaultFloatingFilterType = FloatingFilterMapper.getFloatingFilterType(filter);
        } else if (def.filter === true) {
            const setFilterModuleLoaded = ModuleRegistry.isRegistered(ModuleNames.SetFilterModule);
            defaultFloatingFilterType = setFilterModuleLoaded ? 'agSetColumnFloatingFilter' : 'agTextColumnFloatingFilter';
        }

        return defaultFloatingFilterType;
    }
}
