import { expect, test } from 'vitest';
import { PickVariables, defineTheme as defineThemeImport } from './Theme';
import { AnyPart } from './theme-types';
import { definePart } from './theme-utils';

export const defineTheme = <P extends AnyPart>(
  partOrParts: P | readonly P[],
  parameters: PickVariables<P, any> & { aPreset?: string } = {},
) => defineThemeImport(partOrParts, parameters);

test('Parameters', () => {
  const a = definePart({
    partId: 'a',
    defaults: { paramA1: 'paramA1-default', paramA2: 'paramA2-default' },
    presets: {
      preset1: { paramA1: 'preset1-paramA1' },
      preset2: { paramA2: 'preset2-paramA2' },
    },
  });
  const b = definePart({
    partId: 'b',
    defaults: { paramB1: 'paramB1-default' },
  });
  const theme = defineTheme([a, b], {
    paramA1: 'foo',
    aPreset: 'preset2',
  });
  expect(theme.css).toMatchInlineSnapshot(`
    {
      "common": "",
      "theme-custom-variables": "
    .ag-theme-custom {
    	--ag-param-a1: foo;
    	--ag-param-a2: preset2-paramA2;
    	--ag-param-b1: paramB1-default;
    }",
    }
  `);
});

test('Icons', () => {
  const a = definePart({
    partId: 'a',
    defaults: {},
    icons: {
      iconFoo: 'iconFoo-a.svg',
      iconBar: 'iconBar-a.svg',
    },
  });
  const b = definePart({
    partId: 'b',
    defaults: {},
    icons: {
      iconBar: 'iconBar-b.svg',
      iconBaz: 'iconBaz-b.svg',
    },
  });
  const theme = defineTheme([a, b]);
  expect(theme.icons).toMatchInlineSnapshot(`
    {
      "iconBar": "iconBar-b.svg",
      "iconBaz": "iconBaz-b.svg",
      "iconFoo": "iconFoo-a.svg",
    }
  `);
});
