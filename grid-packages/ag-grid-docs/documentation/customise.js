/**
 * There are some issues which we have had to resolve by editing plugins as it was the only way to achieve what we
 * needed to. This script applies these customisations by replacing content inside the node_modules after they've been
 * installed; perhaps we should fork the plugins properly and point to those instead.
 */

const fs = require('fs-extra');

const applyCustomisation = (packageName, expectedVersion, customisation, optional = false) => {
    if (!fs.existsSync(`./node_modules/${packageName}/package.json`) && optional) {
        console.log(`./node_modules/${packageName}/package.json doesn't exist but is optional - skipping`);
        return true;
    }

    const version = require(`./node_modules/${packageName}/package.json`).version;
    const versionMatches = version === expectedVersion;

    if (versionMatches) {
        customisation.apply();
        console.log(`✓ ${customisation.name}`);
    } else {
        console.error(`✗ ${customisation.name}`);
        console.error(`Customisation failed: Expected version ${expectedVersion} of ${packageName} but found ${version}. You should test the customisation with the new version and update the expected version number if it works.`);
    }

    return versionMatches;
};

const updateFileContents = (filename, existingContent, newContent) => {
    const contents = fs.readFileSync(filename, 'utf8');
    const newContents = contents.replace(existingContent, newContent);

    if (newContents !== contents) {
        fs.writeFileSync(filename, newContents);
    }
};

const addMarkdownIncludeSupport = () => {
    // updates the method for reading files to automatically replace the Markdown imports with file contents at this stage

    return applyCustomisation('gatsby-source-filesystem', '3.14.0', {
        name: 'Add support for including Markdown files into other Markdown files',
        apply: () => updateFileContents(
            './node_modules/gatsby-source-filesystem/index.js',
            `
function loadNodeContent(fileNode) {
  return fs.readFile(fileNode.absolutePath, \`utf-8\`);
}`,
            `const path = require('path');

function loadNodeContent(fileNode) {
    const sourcePath = path.dirname(fileNode.absolutePath);

    // this allows Markdown files to import other Markdown files using md-include syntax
    return fs.readFile(fileNode.absolutePath, \`utf-8\`).then(value => {
        if (fileNode.extension !== 'md') { return value; }

        return value.replace(/\\bmd-include:(\\S+)/g, (_, filename) => {
            const includeFileName = path.join(sourcePath, \`_\${filename}\`);

            return fs.readFileSync(includeFileName);
        });
    });
}`)
    });
};

const fixScrollingIssue = () => {
    // removes some of the scroll handling that this plugin adds which seems to cause the page to scroll to the wrong
    // position when hash URLs are initially loaded

    return applyCustomisation('gatsby-remark-autolink-headers', '4.11.0', {
        name: 'Fix scrolling issue for hash URLs',
        apply: () => updateFileContents(
            './node_modules/gatsby-remark-autolink-headers/gatsby-browser.js',
            'exports.onInitialClientRender = function (_',
            'exports.onInitialClientRender = function() {}; var ignore = function (_'
        )
    });
};

const ignoreFsUsages = () => {
    // ignores fs usages when doing prod builds
    // this feature is added to allow for incremental builds but causes issue with code out of our control (algolia) as well as with the ExampleRunner
    // remove this check and just allow it to continue

    return applyCustomisation('gatsby', '3.14.6', {
        name: `Don't track fs usages when doing prod build`,
        apply: () => updateFileContents(
            './node_modules/gatsby/dist/utils/webpack.config.js',
            'const builtinModulesToTrack = [`fs`, `http`, `http2`, `https`, `child_process`];',
            'const builtinModulesToTrack = [`http`, `http2`, `https`, `child_process`];'
        )
    });
};

const fixFileLoadingIssue = () => {
    // adds error handling around loading of files to avoid the Gatsby process periodically dying when file contents
    // cannot be read correctly when saving examples

    return applyCustomisation('gatsby-source-filesystem', '3.14.0', {
        name: 'Fix file loading issue',
        apply: () => updateFileContents(
            './node_modules/gatsby-source-filesystem/gatsby-node.js',
            `
  const createAndProcessNode = path => {
    const fileNodePromise = createFileNode(path, createNodeId, pluginOptions).then(fileNode => {
      createNode(fileNode);
      return null;
    });
    return fileNodePromise;
  };`,
            `
  const createAndProcessNode = path => {
    return createFileNode(path, createNodeId, pluginOptions)
      .catch(() => {
        reporter.warn(\`Failed to create FileNode for \${path}. Re-trying...\`);
        return createFileNode(path, createNodeId, pluginOptions);
      })
      .then(fileNode => {
        createNode(fileNode);
        return null;
      })
      .catch(error => {
        reporter.error(\`Failed to create FileNode for \${path}\`, error);
      });
  };`
        )
    });
};

const jsxErrorProcessingIssue = () => {
    // Prevents Gatsby from dying when an JSX error is introduced

    return applyCustomisation('gatsby-cli', '3.14.2', {
            name: 'JSX Error Processing Issue',
            apply: () => updateFileContents(
                './node_modules/gatsby-cli/lib/structured-errors/construct-error.js',
                `
  if (error) {
    console.log(\`Failed to validate error\`, error);
    process.exit(1);
  }`,
                `
  if (error) {
    console.log(\`Failed to validate error\`, error);
  }`,
            )
        },
        true);
};

const excludeDodgyLintRules = () => {
    // Prevents
    return applyCustomisation('eslint-config-react-app', '6.0.0', {
            name: 'Exclude React Lint Rules',
            apply: () => updateFileContents(
                './node_modules/eslint-config-react-app/index.js',
                `
  rules: {
    // http://eslint.org/docs/rules/
    'array-callback-return': 'warn',
    'default-case': ['warn', { commentPattern: '^no default$' }],
    'dot-location': ['warn', 'property'],
    eqeqeq: ['warn', 'smart'],
    'new-parens': 'warn',
    'no-array-constructor': 'warn',
    'no-caller': 'warn',
    'no-cond-assign': ['warn', 'except-parens'],
    'no-const-assign': 'warn',
    'no-control-regex': 'warn',
    'no-delete-var': 'warn',
    'no-dupe-args': 'warn',
    'no-dupe-class-members': 'warn',
    'no-dupe-keys': 'warn',
    'no-duplicate-case': 'warn',
    'no-empty-character-class': 'warn',
    'no-empty-pattern': 'warn',
    'no-eval': 'warn',
    'no-ex-assign': 'warn',
    'no-extend-native': 'warn',
    'no-extra-bind': 'warn',
    'no-extra-label': 'warn',
    'no-fallthrough': 'warn',
    'no-func-assign': 'warn',
    'no-implied-eval': 'warn',
    'no-invalid-regexp': 'warn',
    'no-iterator': 'warn',
    'no-label-var': 'warn',
    'no-labels': ['warn', { allowLoop: true, allowSwitch: false }],
    'no-lone-blocks': 'warn',
    'no-loop-func': 'warn',
    'no-mixed-operators': [
      'warn',
      {
        groups: [
          ['&', '|', '^', '~', '<<', '>>', '>>>'],
          ['==', '!=', '===', '!==', '>', '>=', '<', '<='],
          ['&&', '||'],
          ['in', 'instanceof'],
        ],
        allowSamePrecedence: false,
      },
    ],
    'no-multi-str': 'warn',
    'no-native-reassign': 'warn',
    'no-negated-in-lhs': 'warn',
    'no-new-func': 'warn',
    'no-new-object': 'warn',
    'no-new-symbol': 'warn',
    'no-new-wrappers': 'warn',
    'no-obj-calls': 'warn',
    'no-octal': 'warn',
    'no-octal-escape': 'warn',
    'no-redeclare': 'warn',
    'no-regex-spaces': 'warn',
    'no-restricted-syntax': ['warn', 'WithStatement'],
    'no-script-url': 'warn',
    'no-self-assign': 'warn',
    'no-self-compare': 'warn',
    'no-sequences': 'warn',
    'no-shadow-restricted-names': 'warn',
    'no-sparse-arrays': 'warn',
    'no-template-curly-in-string': 'warn',
    'no-this-before-super': 'warn',
    'no-throw-literal': 'warn',
    'no-undef': 'error',
    'no-restricted-globals': ['error'].concat(restrictedGlobals),
    'no-unreachable': 'warn',
    'no-unused-expressions': [
      'error',
      {
        allowShortCircuit: true,
        allowTernary: true,
        allowTaggedTemplates: true,
      },
    ],
    'no-unused-labels': 'warn',
    'no-unused-vars': [
      'warn',
      {
        args: 'none',
        ignoreRestSiblings: true,
      },
    ],
    'no-use-before-define': [
      'warn',
      {
        functions: false,
        classes: false,
        variables: false,
      },
    ],
    'no-useless-computed-key': 'warn',
    'no-useless-concat': 'warn',
    'no-useless-constructor': 'warn',
    'no-useless-escape': 'warn',
    'no-useless-rename': [
      'warn',
      {
        ignoreDestructuring: false,
        ignoreImport: false,
        ignoreExport: false,
      },
    ],
    'no-with': 'warn',
    'no-whitespace-before-property': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    'require-yield': 'warn',
    'rest-spread-spacing': ['warn', 'never'],
    strict: ['warn', 'never'],
    'unicode-bom': ['warn', 'never'],
    'use-isnan': 'warn',
    'valid-typeof': 'warn',
    'no-restricted-properties': [
      'error',
      {
        object: 'require',
        property: 'ensure',
        message:
          'Please use import() instead. More info: https://facebook.github.io/create-react-app/docs/code-splitting',
      },
      {
        object: 'System',
        property: 'import',
        message:
          'Please use import() instead. More info: https://facebook.github.io/create-react-app/docs/code-splitting',
      },
    ],
    'getter-return': 'warn',

    // https://github.com/benmosher/eslint-plugin-import/tree/master/docs/rules
    'import/first': 'error',
    'import/no-amd': 'error',
    'import/no-anonymous-default-export': 'warn',
    'import/no-webpack-loader-syntax': 'error',

    // https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules
    'react/forbid-foreign-prop-types': ['warn', { allowInPropTypes: true }],
    'react/jsx-no-comment-textnodes': 'warn',
    'react/jsx-no-duplicate-props': 'warn',
    'react/jsx-no-target-blank': 'warn',
    'react/jsx-no-undef': 'error',
    'react/jsx-pascal-case': [
      'warn',
      {
        allowAllCaps: true,
        ignore: [],
      },
    ],
    'react/no-danger-with-children': 'warn',
    // Disabled because of undesirable warnings
    // See https://github.com/facebook/create-react-app/issues/5204 for
    // blockers until its re-enabled
    // 'react/no-deprecated': 'warn',
    'react/no-direct-mutation-state': 'warn',
    'react/no-is-mounted': 'warn',
    'react/no-typos': 'error',
    'react/require-render-return': 'error',
    'react/style-prop-object': 'warn',

    // https://github.com/evcohen/eslint-plugin-jsx-a11y/tree/master/docs/rules
    'jsx-a11y/alt-text': 'warn',
    'jsx-a11y/anchor-has-content': 'warn',
    'jsx-a11y/anchor-is-valid': [
      'warn',
      {
        aspects: ['noHref', 'invalidHref'],
      },
    ],
    'jsx-a11y/aria-activedescendant-has-tabindex': 'warn',
    'jsx-a11y/aria-props': 'warn',
    'jsx-a11y/aria-proptypes': 'warn',
    'jsx-a11y/aria-role': ['warn', { ignoreNonDOM: true }],
    'jsx-a11y/aria-unsupported-elements': 'warn',
    'jsx-a11y/heading-has-content': 'warn',
    'jsx-a11y/iframe-has-title': 'warn',
    'jsx-a11y/img-redundant-alt': 'warn',
    'jsx-a11y/no-access-key': 'warn',
    'jsx-a11y/no-distracting-elements': 'warn',
    'jsx-a11y/no-redundant-roles': 'warn',
    'jsx-a11y/role-has-required-aria-props': 'warn',
    'jsx-a11y/role-supports-aria-props': 'warn',
    'jsx-a11y/scope': 'warn',

    // https://github.com/facebook/react/tree/master/packages/eslint-plugin-react-hooks
    'react-hooks/rules-of-hooks': 'error',

    // https://github.com/gajus/eslint-plugin-flowtype
    'flowtype/define-flow-type': 'warn',
    'flowtype/require-valid-file-annotation': 'warn',
    'flowtype/use-flow-type': 'warn',
  }`,
                `
rules: {}`,
            )
        },
        true);
};

const restrictSearchForPageQueries = () => {
    // restricts the files that Gatsby searches for queries, which improves performance

    return applyCustomisation('gatsby', '3.14.6', {
        name: 'Restrict search for page queries',
        apply: () => updateFileContents(
            './node_modules/gatsby/dist/query/query-compiler.js',
            `path.join(base, \`src\`),`,
            `path.join(base, \`src\`, \`templates\`),`,
        )
    });
};

console.log(`--------------------------------------------------------------------------------`);
console.log(`Applying customisations...`);

const success = [
    addMarkdownIncludeSupport(),
    fixScrollingIssue(),
    fixFileLoadingIssue(),
    restrictSearchForPageQueries(),
    ignoreFsUsages(),
    jsxErrorProcessingIssue(),
    excludeDodgyLintRules()
].every(x => x);

if (success) {
    console.log(`Finished!`);
} else {
    console.error('Failed.');
    process.exitCode = 1;
}

console.log(`--------------------------------------------------------------------------------`);
