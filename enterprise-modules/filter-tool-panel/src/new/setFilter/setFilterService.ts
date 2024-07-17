import type { AgColumn, SetFilterModel } from '@ag-grid-community/core';
import { BeanStub } from '@ag-grid-community/core';

import type { SetFilterParams } from '../filterState';
import type { FilterTypeService } from '../iFilterTypeService';
import type { SetFilterConfig } from './setFilterConfig';

export class SetFilterService
    extends BeanStub
    implements FilterTypeService<SetFilterParams, SetFilterModel, SetFilterConfig>
{
    public getParams(filterConfig: SetFilterConfig, model?: SetFilterModel | null): SetFilterParams {
        return {
            values: [],
        };
        // TODO
    }

    public updateParams(
        oldSetFilterParams: SetFilterParams | undefined,
        newSetFilterParams: SetFilterParams,
        setFilterConfig: any
    ): SetFilterParams {
        return {
            values: [],
        };
        // TODO
    }

    public getModel(setFilterParams: SetFilterParams): SetFilterModel | null {
        return null;
        // TODO
    }

    public getSummary(model: SetFilterModel | null): string {
        return '';
        // TODO
    }

    public getFilterConfig(column: AgColumn): SetFilterConfig {
        // TODO
        return {
            applyOnChange: true,
        };
    }
}
