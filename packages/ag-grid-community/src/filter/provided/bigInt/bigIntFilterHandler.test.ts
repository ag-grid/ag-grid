import { BigIntFilterHandler } from './bigIntFilterHandler';

describe('BigIntFilterHandler', () => {
    let handler: BigIntFilterHandler;

    beforeEach(() => {
        handler = new BigIntFilterHandler();
        (handler as any).beans = { log: { warn: () => {}, error: () => {}, deprecated: () => {} } };
        (handler as any).createManagedBean = (bean: any) => bean;
        (handler as any).addDestroyFunc = () => {};
    });

    const createParams = (filterParams: any = {}, model: any = null): any => ({
        filterParams: {
            filterOptions: [
                'equals',
                'notEqual',
                'lessThan',
                'lessThanOrEqual',
                'greaterThan',
                'greaterThanOrEqual',
                'inRange',
                'blank',
                'notBlank',
            ],
            ...filterParams,
        },
        model,
        getValue: (node: any) => node.value,
        onModelChange: () => {},
    });

    it('should pass for equal bigint values', () => {
        const params = createParams({}, { filterType: 'bigint', type: 'equals', filter: '10' });
        handler.init(params);

        expect(handler.doesFilterPass({ node: { value: 10n }, model: params.model } as any)).toBe(true);
        expect(handler.doesFilterPass({ node: { value: 11n }, model: params.model } as any)).toBe(false);
    });

    it('should handle null cell values with default settings', () => {
        const params = createParams({}, { filterType: 'bigint', type: 'equals', filter: '10' });
        handler.init(params);

        expect(handler.doesFilterPass({ node: { value: null }, model: params.model } as any)).toBe(false);
    });

    it('should handle null cell values with includeBlanksInEquals', () => {
        const params = createParams(
            { includeBlanksInEquals: true },
            { filterType: 'bigint', type: 'equals', filter: '10' }
        );
        handler.init(params);

        expect(handler.doesFilterPass({ node: { value: null }, model: params.model } as any)).toBe(true);
    });

    it('should handle invalid cell values (mixed data)', () => {
        const params = createParams({}, { filterType: 'bigint', type: 'equals', filter: '10' });
        handler.init(params);

        // Equals should still return false for mixed types because of === in comparator
        expect(handler.doesFilterPass({ node: { value: 10 }, model: params.model } as any)).toBe(false);
        expect(handler.doesFilterPass({ node: { value: '10' }, model: params.model } as any)).toBe(false);

        // But lessThan should work if we updated isValid to be more robust
        const lessThanParams = createParams({}, { filterType: 'bigint', type: 'lessThan', filter: '20' });
        handler.init(lessThanParams);
        expect(handler.doesFilterPass({ node: { value: 10 }, model: lessThanParams.model } as any)).toBe(true);
        expect(handler.doesFilterPass({ node: { value: '10' }, model: lessThanParams.model } as any)).toBe(true);
    });

    it('should handle null and undefined values in model', () => {
        // null filter value should pass everything for equals (standard SimpleFilter behavior)
        const params = createParams({}, { filterType: 'bigint', type: 'equals', filter: null });
        handler.init(params);
        expect(handler.doesFilterPass({ node: { value: 10n }, model: params.model } as any)).toBe(true);

        const undefinedParams = createParams({}, { filterType: 'bigint', type: 'equals', filter: undefined });
        handler.init(undefinedParams);
        expect(handler.doesFilterPass({ node: { value: 10n }, model: undefinedParams.model } as any)).toBe(true);
    });

    it('should handle inRange with null filterTo', () => {
        const params = createParams({}, { filterType: 'bigint', type: 'inRange', filter: '10', filterTo: null });
        handler.init(params);

        // 15n should not pass inRange(10n, null) because null < 15n returns 1 (compareToResult > 0)
        expect(handler.doesFilterPass({ node: { value: 15n }, model: params.model } as any)).toBe(false);
    });

    it('should handle blank and notBlank types correctly', () => {
        const params = createParams({}, { filterType: 'bigint', type: 'blank' });
        handler.init(params);

        expect(handler.doesFilterPass({ node: { value: null }, model: params.model } as any)).toBe(true);
        expect(handler.doesFilterPass({ node: { value: undefined }, model: params.model } as any)).toBe(true);
        expect(handler.doesFilterPass({ node: { value: 10n }, model: params.model } as any)).toBe(false);

        const notBlankParams = createParams({}, { filterType: 'bigint', type: 'notBlank' });
        handler.init(notBlankParams);
        expect(handler.doesFilterPass({ node: { value: null }, model: notBlankParams.model } as any)).toBe(false);
        expect(handler.doesFilterPass({ node: { value: 10n }, model: notBlankParams.model } as any)).toBe(true);
    });
});
