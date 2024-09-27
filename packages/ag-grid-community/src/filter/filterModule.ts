import type { _ColumnFilterGridApi, _FilterGridApi, _QuickFilterGridApi } from '../api/gridApi';
import { HeaderFilterCellCtrl } from '../headerRendering/cells/floatingFilter/headerFilterCellCtrl';
import { _defineModule } from '../interfaces/iModule';
import { SharedMenuModule } from '../misc/menu/sharedMenuModule';
import { VERSION } from '../version';
import { PopupModule } from '../widgets/popupModule';
import {
    destroyFilter,
    getColumnFilterInstance,
    getColumnFilterModel,
    getFilterInstance,
    getFilterModel,
    isColumnFilterPresent,
    setColumnFilterModel,
    setFilterModel,
    showColumnFilter,
} from './columnFilterApi';
import { ColumnFilterService } from './columnFilterService';
import { isAnyFilterPresent, onFilterChanged } from './filterApi';
import { FilterManager } from './filterManager';
import { FilterMenuFactory } from './filterMenuFactory';
import { FilterValueService } from './filterValueService';
import { ReadOnlyFloatingFilter } from './floating/provided/readOnlyFloatingFilter';
import { DateFilter } from './provided/date/dateFilter';
import { DateFloatingFilter } from './provided/date/dateFloatingFilter';
import { DefaultDateComponent } from './provided/date/defaultDateComponent';
import { NumberFilter } from './provided/number/numberFilter';
import { NumberFloatingFilter } from './provided/number/numberFloatingFilter';
import { TextFilter } from './provided/text/textFilter';
import { TextFloatingFilter } from './provided/text/textFloatingFilter';
import { getQuickFilter, isQuickFilterPresent, resetQuickFilter } from './quickFilterApi';
import { QuickFilterService } from './quickFilterService';

export const FilterCoreModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/filter-core',
    beans: [FilterManager],
});

export const FilterApiModule = _defineModule<_FilterGridApi>({
    version: VERSION,
    moduleName: '@ag-grid-community/filter-api',
    apiFunctions: {
        isAnyFilterPresent,
        onFilterChanged,
    },
    dependantModules: [FilterCoreModule],
});

export const FilterValueModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/filter-value',
    beans: [FilterValueService],
});

export const ColumnFilterModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/column-filter',
    beans: [ColumnFilterService],
    dependantModules: [FilterCoreModule, PopupModule, FilterValueModule],
});

export const ColumnFilterMenuModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/column-filter-menu',
    beans: [FilterMenuFactory],
    dependantModules: [ColumnFilterModule, PopupModule, SharedMenuModule],
});

export const ColumnFilterApiModule = _defineModule<_ColumnFilterGridApi>({
    version: VERSION,
    moduleName: '@ag-grid-community/column-filter-api',
    apiFunctions: {
        isColumnFilterPresent,
        getFilterInstance,
        getColumnFilterInstance,
        destroyFilter,
        setFilterModel,
        getFilterModel,
        getColumnFilterModel,
        setColumnFilterModel,
        showColumnFilter,
    },
    dependantModules: [ColumnFilterModule, FilterApiModule],
});

export const FloatingFilterCoreModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/floating-filter-core',
    controllers: [{ name: 'headerFilterCell', classImp: HeaderFilterCellCtrl as any }],
    dependantModules: [ColumnFilterModule],
});

export const FloatingFilterModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/floating-filter',
    dependantModules: [FloatingFilterCoreModule, ColumnFilterModule],
});

export const ReadOnlyFloatingFilterModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/read-only-floating-filter',
    userComponents: [{ name: 'agReadOnlyFloatingFilter', classImp: ReadOnlyFloatingFilter }],
    dependantModules: [FloatingFilterCoreModule],
});

export const SimpleFilterModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/simple-filter',
    dependantModules: [ColumnFilterModule],
    userComponents: [
        { name: 'agTextColumnFilter', classImp: TextFilter },
        { name: 'agNumberColumnFilter', classImp: NumberFilter },
        { name: 'agDateColumnFilter', classImp: DateFilter },
        { name: 'agDateInput', classImp: DefaultDateComponent },
    ],
});

export const SimpleFloatingFilterModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/simple-floating-filter',
    dependantModules: [SimpleFilterModule, FloatingFilterCoreModule],
    userComponents: [
        { name: 'agTextColumnFloatingFilter', classImp: TextFloatingFilter },
        { name: 'agNumberColumnFloatingFilter', classImp: NumberFloatingFilter },
        { name: 'agDateColumnFloatingFilter', classImp: DateFloatingFilter },
    ],
});

export const QuickFilterCoreModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/quick-filter-core',
    beans: [QuickFilterService],
    dependantModules: [FilterCoreModule, FilterValueModule],
});

export const QuickFilterApiModule = _defineModule<_QuickFilterGridApi>({
    version: VERSION,
    moduleName: '@ag-grid-community/quick-filter-api',
    apiFunctions: {
        isQuickFilterPresent,
        getQuickFilter,
        resetQuickFilter,
    },
    dependantModules: [QuickFilterCoreModule],
});

export const QuickFilterModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/quick-filter',
    dependantModules: [QuickFilterCoreModule, QuickFilterApiModule],
});

export const FilterModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/filter',
    dependantModules: [
        SimpleFloatingFilterModule,
        ReadOnlyFloatingFilterModule,
        QuickFilterModule,
        ColumnFilterApiModule,
        ColumnFilterMenuModule,
    ],
});
