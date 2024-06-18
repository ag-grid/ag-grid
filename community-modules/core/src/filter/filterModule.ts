import { HeaderFilterCellCtrl } from '../headerRendering/cells/floatingFilter/headerFilterCellCtrl';
import type { Module } from '../interfaces/iModule';
import { VERSION } from '../version';
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

export const FilterCoreModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-community/filter-core',
    beans: [FilterManager],
};

export const FilterApiModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-community/filter-api',
    apiFunctions: {
        isAnyFilterPresent,
        onFilterChanged,
    },
    dependantModules: [FilterCoreModule],
};

export const ColumnFilterModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-community/column-filter',
    beans: [ColumnFilterService],
    dependantModules: [FilterCoreModule],
};

export const ColumnFilterApiModule: Module = {
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
};

export const FloatingFilterCoreModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-community/floating-filter-core',
    controllers: [{ name: 'headerFilterCell', classImp: HeaderFilterCellCtrl as any }],
    dependantModules: [ColumnFilterModule],
};

export const FloatingFilterModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-community/floating-filter',
    dependantModules: [FloatingFilterCoreModule, ColumnFilterModule],
};

export const ReadOnlyFloatingFilterModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-community/read-only-floating-filter',
    userComponents: [{ name: 'agReadOnlyFloatingFilter', classImp: ReadOnlyFloatingFilter }],
    dependantModules: [FloatingFilterCoreModule],
};

export const SimpleFilterModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-community/simple-filter',
    dependantModules: [ColumnFilterModule],
    userComponents: [
        { name: 'agTextColumnFilter', classImp: TextFilter },
        { name: 'agNumberColumnFilter', classImp: NumberFilter },
        { name: 'agDateColumnFilter', classImp: DateFilter },
        { name: 'agDateInput', classImp: DefaultDateComponent },
    ],
};

export const SimpleFloatingFilterModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-community/simple-floating-filter',
    dependantModules: [SimpleFilterModule, FloatingFilterCoreModule],
    userComponents: [
        { name: 'agTextColumnFloatingFilter', classImp: TextFloatingFilter },
        { name: 'agNumberColumnFloatingFilter', classImp: NumberFloatingFilter },
        { name: 'agDateColumnFloatingFilter', classImp: DateFloatingFilter },
    ],
};

export const QuickFilterCoreModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-community/quick-filter-core',
    beans: [QuickFilterService],
    dependantModules: [FilterCoreModule],
};

export const QuickFilterApiModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-community/quick-filter-api',
    apiFunctions: {
        isQuickFilterPresent,
        getQuickFilter,
        resetQuickFilter,
    },
    dependantModules: [QuickFilterCoreModule],
};

export const QuickFilterModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-community/quick-filter',
    dependantModules: [QuickFilterCoreModule, QuickFilterApiModule],
};

export const FilterModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-community/filter',
    dependantModules: [
        SimpleFloatingFilterModule,
        ReadOnlyFloatingFilterModule,
        QuickFilterModule,
        ColumnFilterApiModule,
    ],
};
