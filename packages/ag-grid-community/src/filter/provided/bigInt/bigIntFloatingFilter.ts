import type { Column } from '../../../interfaces/iColumn';
import { FloatingFilterTextInputService } from '../../floating/provided/floatingFilterTextInputService';
import type { FloatingFilterInputService } from '../../floating/provided/iFloatingFilterInputService';
import { TextInputFloatingFilter } from '../../floating/provided/textInputFloatingFilter';
import { installAllowedCharPattern } from '../allowedCharPattern';
import type { OptionsFactory } from '../optionsFactory';
import { DEFAULT_BIGINT_FILTER_OPTIONS } from './bigIntFilterConstants';
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
    protected readonly defaultOptions = DEFAULT_BIGINT_FILTER_OPTIONS;

    protected createModelFormatter(
        optionsFactory: OptionsFactory,
        filterParams: IBigIntFilterParams,
        column: Column
    ): BigIntFilterModelFormatter {
        return new BigIntFilterModelFormatter(optionsFactory, filterParams, column);
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
        const allowedCharPattern = getAllowedCharPattern(filterParams);
        this.allowedCharPattern = allowedCharPattern;
        this.bigintParser = filterParams?.bigintParser;

        return this.createManagedBean(
            new FloatingFilterTextInputService((el) => installAllowedCharPattern(el, allowedCharPattern, this.beans))
        );
    }

    protected override convertValue<TValue>(value: string | null | undefined): TValue | null {
        const { gos, params } = this;
        return stringToBigInt(this.bigintParser, value, gos, params.column) as TValue | null;
    }
}
