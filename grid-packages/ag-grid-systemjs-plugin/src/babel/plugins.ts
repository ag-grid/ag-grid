import * as babel from '@babel/core';
import babelPluginNumericSeparator from '@babel/plugin-proposal-numeric-separator';
import babelPluginProposalDynamicImport from '@babel/plugin-proposal-dynamic-import';
import babelPluginProposalExportDefaultFrom from '@babel/plugin-proposal-export-default-from';
import babelPluginProposalExportNamespaceFrom from '@babel/plugin-proposal-export-namespace-from';
import babelPluginSyntaxClassProperties from '@babel/plugin-syntax-class-properties';
import babelPluginTransformModulesSystemJS from '@babel/plugin-transform-modules-systemjs';
import babelPluginTransformReactJsx from '@babel/plugin-transform-react-jsx';
import babelPluginTransformTypescript from '@babel/plugin-transform-typescript';
import './types.d.ts';

const SYNTAX_PLUGINS: babel.ParserOptions['plugins'] = [
  'asyncGenerators',
  'classProperties',
  'classPrivateProperties',
  'classPrivateMethods',
  'dynamicImport',
  'importMeta',
  'nullishCoalescingOperator',
  'numericSeparator',
  'optionalCatchBinding',
  'optionalChaining',
  'objectRestSpread',
  'topLevelAwait',
];

const DEFAULT_PLUGINS = [
  babelPluginTransformModulesSystemJS,
  babelPluginProposalDynamicImport,
  babelPluginProposalExportDefaultFrom,
  babelPluginProposalExportNamespaceFrom,
  babelPluginSyntaxClassProperties,
  babelPluginNumericSeparator,
];

const TS_PLUGINS: Array<babel.PluginItem> = [
  [
    babelPluginTransformTypescript,
    {
      onlyRemoveTypeImports: true,
    },
  ],
  ...DEFAULT_PLUGINS,
];

const TSX_PLUGINS: Array<babel.PluginItem> = [
  [
    babelPluginTransformTypescript,
    {
      isTSX: true,
      onlyRemoveTypeImports: true,
    },
  ],
  [
    babelPluginTransformReactJsx,
    {
      runtime: 'automatic',
    },
  ],
  ...DEFAULT_PLUGINS,
];

const JSX_PLUGINS: Array<babel.PluginItem> = [
  [
    babelPluginTransformReactJsx,
    {
      runtime: 'automatic',
    },
  ],
  ...DEFAULT_PLUGINS,
];

const PLUGINS_BY_EXTENSION: Record<string, Array<babel.PluginItem>> = {
  '.ts': TS_PLUGINS,
  '.tsx': TSX_PLUGINS,
  '.jsx': JSX_PLUGINS,
};

export function getBabelPlugins(extension: string | null): {
  syntax: babel.ParserOptions['plugins'];
  transform: Array<babel.PluginItem>;
} {
  return {
    syntax: SYNTAX_PLUGINS,
    transform: (extension && PLUGINS_BY_EXTENSION[extension]) || DEFAULT_PLUGINS,
  };
}
