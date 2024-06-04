import { HeaderFilterCellCtrl } from '../headerRendering/cells/floatingFilter/headerFilterCellCtrl';
import type { Module } from '../interfaces/iModule';
import { VERSION } from '../version';
import { ColumnFilterService } from './columnFilterService';
import { FilterManager } from './filterManager';
import { ReadOnlyFloatingFilter } from './floating/provided/readOnlyFloatingFilter';
import { DateFilter } from './provided/date/dateFilter';
import { DateFloatingFilter } from './provided/date/dateFloatingFilter';
import { DefaultDateComponent } from './provided/date/defaultDateComponent';
import { NumberFilter } from './provided/number/numberFilter';
import { NumberFloatingFilter } from './provided/number/numberFloatingFilter';
import { TextFilter } from './provided/text/textFilter';
import { TextFloatingFilter } from './provided/text/textFloatingFilter';
import { QuickFilterService } from './quickFilterService';

export const FilterCoreModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-community/filter-core',
    beans: [FilterManager],
};

export const ColumnFilterModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-community/column-filter',
    beans: [ColumnFilterService],
    dependantModules: [FilterCoreModule],
};

export const FloatingFilterModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-community/floating-filter',
    controllers: [{ name: 'headerFilterCell', classImp: HeaderFilterCellCtrl as any }],
    dependantModules: [ColumnFilterModule],
};

export const ReadOnlyFloatingFilterModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-community/read-only-floating-filter',
    dependantModules: [FloatingFilterModule],
    userComponents: [{ name: 'agReadOnlyFloatingFilter', classImp: ReadOnlyFloatingFilter }],
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
    dependantModules: [SimpleFilterModule, FloatingFilterModule],
    userComponents: [
        { name: 'agTextColumnFloatingFilter', classImp: TextFloatingFilter },
        { name: 'agNumberColumnFloatingFilter', classImp: NumberFloatingFilter },
        { name: 'agDateColumnFloatingFilter', classImp: DateFloatingFilter },
    ],
};

export const QuickFilterModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-community/quick-filter',
    beans: [QuickFilterService],
    dependantModules: [FilterCoreModule],
};

export const FilterModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-community/filter',
    dependantModules: [SimpleFloatingFilterModule, ReadOnlyFloatingFilterModule, QuickFilterModule],
};
