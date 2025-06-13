import type { ColDef, ValueGetterFunc } from '../entities/colDef';
import type { CoreDataTypeDefinition, DataTypeFormatValueFunc } from '../entities/dataType';
import type { IMultiFilterParams } from './iMultiFilter';
import type { SelectableFilterDef } from './iNewFiltersToolPanel';

export interface IMultiFilterService {
    getParamsForDataType(
        existingFilterParams: IMultiFilterParams | undefined,
        colDef: ColDef | SelectableFilterDef,
        dataTypeDefinition: CoreDataTypeDefinition,
        formatValue: DataTypeFormatValueFunc
    ): { filterParams?: any; filterValueGetter?: string | ValueGetterFunc };
}
