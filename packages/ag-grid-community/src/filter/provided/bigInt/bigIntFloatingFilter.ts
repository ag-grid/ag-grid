import { _parseBigIntOrNull } from 'ag-stack';

import { FloatingFilterTextInputService } from '../../floating/provided/floatingFilterTextInputService';
import type { FloatingFilterInputService } from '../../floating/provided/iFloatingFilterInputService';
import { TextInputFloatingFilter } from '../../floating/provided/textInputFloatingFilter';
import { DEFAULT_BIGINT_FILTER_OPTIONS } from './bigIntFilterConstants';
import { BigIntFilterModelFormatter } from './bigIntFilterModelFormatter';
import { getAllowedCharPattern } from './bigIntFilterUtils';
import type { BigIntFilterModel, BigIntFilterParams, IBigIntFloatingFilterParams } from './iBigIntFilter';

export class BigIntFloatingFilter extends TextInputFloatingFilter<IBigIntFloatingFilterParams, BigIntFilterModel> {
    protected readonly FilterModelFormatterClass = BigIntFilterModelFormatter;
    private allowedCharPattern: string | null;
    private bigintParser: BigIntFilterParams['bigintParser'] | undefined;
    protected readonly filterType = 'bigint';
    protected readonly defaultOptions = DEFAULT_BIGINT_FILTER_OPTIONS;

    protected override updateParams(params: IBigIntFloatingFilterParams): void {
        const filterParams = params.filterParams as BigIntFilterParams;
        const allowedCharPattern = getAllowedCharPattern(filterParams);
        if (allowedCharPattern !== this.allowedCharPattern) {
            this.recreateFloatingFilterInputService(params);
        }
        this.bigintParser = filterParams?.bigintParser;
        super.updateParams(params);
    }

    protected createFloatingFilterInputService(params: IBigIntFloatingFilterParams): FloatingFilterInputService {
        const filterParams = params.filterParams as BigIntFilterParams;
        this.allowedCharPattern = getAllowedCharPattern(filterParams);
        this.bigintParser = filterParams?.bigintParser;

        const config = this.allowedCharPattern ? { allowedCharPattern: this.allowedCharPattern } : undefined;
        return this.createManagedBean(new FloatingFilterTextInputService({ config }));
    }

    protected override convertValue<TValue>(value: string | null | undefined): TValue | null {
        if (value == null || value === '') {
            return null;
        }

        if (this.bigintParser) {
            return this.bigintParser(value) as TValue | null;
        }
        return _parseBigIntOrNull(value) as TValue | null;
    }
}
