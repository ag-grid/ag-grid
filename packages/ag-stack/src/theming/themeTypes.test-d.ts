import { describe, expectTypeOf, it } from 'vitest';

import type { BackdropFilterValue, LengthValue, WithParamTypes } from './themeTypes';

describe('BackdropFilterValue', () => {
    it('is the type of params named with a BackdropFilter suffix', () => {
        expectTypeOf<WithParamTypes<{ widgetBackdropFilter: unknown }>>().toEqualTypeOf<{
            widgetBackdropFilter: BackdropFilterValue;
        }>();
        expectTypeOf<WithParamTypes<{ widgetPadding: unknown }>>().toEqualTypeOf<{ widgetPadding: LengthValue }>();
    });

    it('accepts backdrop-filter strings and param references', () => {
        expectTypeOf<'none'>().toExtend<BackdropFilterValue>();
        expectTypeOf<'blur(4px) saturate(1.5)'>().toExtend<BackdropFilterValue>();
        expectTypeOf<{ ref: 'otherParam' }>().toExtend<BackdropFilterValue>();
    });

    it('accepts a list of single filter functions', () => {
        expectTypeOf<[]>().toExtend<BackdropFilterValue>();
        expectTypeOf<
            [{ blur: 8 }, { saturate: '150%' }, { brightness: { calc: 'spacing * 2' } }]
        >().toExtend<BackdropFilterValue>();
    });

    it('rejects length-only forms and unknown functions', () => {
        expectTypeOf<8>().not.toExtend<BackdropFilterValue>();
        expectTypeOf<{ calc: 'spacing * 2' }>().not.toExtend<BackdropFilterValue>();
        expectTypeOf<[{ hueRotate: 90 }]>().not.toExtend<BackdropFilterValue>();
    });
});
