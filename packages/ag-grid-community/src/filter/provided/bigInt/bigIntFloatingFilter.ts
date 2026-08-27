import { FloatingFilterTextInputService } from '../../floating/provided/floatingFilterTextInputService';
import type { FloatingFilterInputService } from '../../floating/provided/iFloatingFilterInputService';
import { TextInputFloatingFilter } from '../../floating/provided/textInputFloatingFilter';
import { installAllowedCharPattern } from '../allowedCharPattern';
import type { ResolvedSimpleFilterConfig } from '../resolvedFilterConfig';
import { BigIntFilterModelFormatter } from './bigIntFilterModelFormatter';
import { getAllowedCharPattern, stringToBigInt } from './bigIntFilterUtils';
import type {
    BigIntFilterModel,
    BigIntFilterParams,
    IBigIntFilterParams,
    IBigIntFloatingFilterParams,
} from './iBigIntFilter';

export class BigIntFloatingFilter extends TextInputFloatingFilter<IBigIntFloatingFilterParams, BigIntFilterModel> {
    private allowedCharPattern: string | null;
    private bigintParser: BigIntFilterParams['bigintParser'] | undefined;
    protected readonly filterType = 'bigint';

    protected createModelFormatter(
        filterConfig: ResolvedSimpleFilterConfig,
        filterParams: IBigIntFilterParams
    ): BigIntFilterModelFormatter {
        return new BigIntFilterModelFormatter(filterConfig, filterParams);
    }

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

        // Read for these params rather than from the field: a recreate runs before the base has taken them on.
        const pattern = this.beans.filterConfigSvc!.getSimple(params.column, filterParams, 'bigint').allowedCharPattern;
        return this.createManagedBean(
            new FloatingFilterTextInputService((el) => installAllowedCharPattern(el, pattern))
        );
    }

    protected override convertValue<TValue>(value: string | null | undefined): TValue | null {
        const { gos, params } = this;
        return stringToBigInt(this.bigintParser, value, gos, params.column) as TValue | null;
    }
}
