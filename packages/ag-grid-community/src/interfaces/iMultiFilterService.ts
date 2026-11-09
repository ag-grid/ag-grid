import type { ValueGetterFunc } from '../entities/colDef';
import type { BaseCellDataType, CoreDataTypeDefinition, DataTypeFormatValueFunc } from '../entities/dataType';
import type { IMultiFilterParams } from './iMultiFilter';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IMultiFilterService {
    getParamsForDataType(
        existingFilterParams: IMultiFilterParams | undefined,
        existingFilterValueGetter: string | ValueGetterFunc | undefined,
        dataTypeDefinition: CoreDataTypeDefinition,
        formatValue: DataTypeFormatValueFunc
    ): { filterParams?: any; filterValueGetter?: string | ValueGetterFunc };
    /**
     * Whether a Multi Filter with `filterParams` builds different children, or children with different params,
     * for the two base data types.
     */
    areChildFiltersChangedByDataType(
        filterParams: IMultiFilterParams | ((params: any) => IMultiFilterParams) | undefined,
        from: BaseCellDataType | undefined,
        to: BaseCellDataType | undefined
    ): boolean;
}
