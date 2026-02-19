/* eslint-disable sonarjs/no-duplicate-string */
/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
    forbidden: [
        {
            name: 'ag-stack',
            comment: 'AG Stack cannot depend on grid code.',
            severity: 'error',
            from: { path: ['^src/agStack/'] },
            to: {
                pathNot: ['^src/agStack/'],
            },
        },
    ],
    options: {
        /* conditions specifying which files not to follow further when encountered:
       - path: a regular expression to match
       - dependencyTypes: see https://github.com/sverweij/dependency-cruiser/blob/main/doc/rules-reference.md#dependencytypes-and-dependencytypesnot
       for a complete list
    */
        doNotFollow: {
            path: ['node_modules'],
        },

        /* conditions specifying which dependencies to exclude
       - path: a regular expression to match
       - dynamic: a boolean indicating whether to ignore dynamic (true) or static (false) dependencies.
          leave out if you want to exclude neither (recommended!)
    */
        // exclude : {
        //   path: '',
        //   dynamic: true
        // },

        /* pattern specifying which files to include (regular expression)
       dependency-cruiser will skip everything not matching this pattern
    */
        // includeOnly : '',

        /* dependency-cruiser will include modules matching against the focus
       regular expression in its output, as well as their neighbours (direct
       dependencies and dependents)
    */
        // focus : '',

        /* list of module systems to cruise */
        // moduleSystems: ['amd', 'cjs', 'es6', 'tsd'],

        /* prefix for links in html and svg output (e.g. 'https://github.com/you/yourrepo/blob/develop/'
       to open it on your online repo or `vscode://file/${process.cwd()}/` to
       open it in visual studio code),
     */
        // prefix: '',

        /* false (the default): ignore dependencies that only exist before typescript-to-javascript compilation
       true: also detect dependencies that only exist before typescript-to-javascript compilation
       "specify": for each dependency identify whether it only exists before compilation or also after
     */
        tsPreCompilationDeps: true,

        /*
       list of extensions to scan that aren't javascript or compile-to-javascript.
       Empty by default. Only put extensions in here that you want to take into
       account that are _not_ parsable.
    */
        // extraExtensionsToScan: [".json", ".jpg", ".png", ".svg", ".webp"],

        /* if true combines the package.jsons found from the module up to the base
       folder the cruise is initiated from. Useful for how (some) mono-repos
       manage dependencies & dependency definitions.
     */
        // combinedDependencies: false,

        /* if true leave symlinks untouched, otherwise use the realpath */
        // preserveSymlinks: false,

        /* TypeScript project file ('tsconfig.json') to use for
       (1) compilation and
       (2) resolution (e.g. with the paths property)

       The (optional) fileName attribute specifies which file to take (relative to
       dependency-cruiser's current working directory). When not provided
       defaults to './tsconfig.json'.
     */
        tsConfig: {
            fileName: 'tsconfig.json',
        },

        /* Webpack configuration to use to get resolve options from.

       The (optional) fileName attribute specifies which file to take (relative
       to dependency-cruiser's current working directory. When not provided defaults
       to './webpack.conf.js'.

       The (optional) `env` and `arguments` attributes contain the parameters to be passed if
       your webpack config is a function and takes them (see webpack documentation
       for details)
     */
        // webpackConfig: {
        //  fileName: 'webpack.config.js',
        //  env: {},
        //  arguments: {}
        // },

        /* Babel config ('.babelrc', '.babelrc.json', '.babelrc.json5', ...) to use
      for compilation (and whatever other naughty things babel plugins do to
      source code). This feature is well tested and usable, but might change
      behavior a bit over time (e.g. more precise results for used module
      systems) without dependency-cruiser getting a major version bump.
     */
        // babelConfig: {
        //   fileName: '.babelrc',
        // },

        /* List of strings you have in use in addition to cjs/ es6 requires
       & imports to declare module dependencies. Use this e.g. if you've
       re-declared require, use a require-wrapper or use window.require as
       a hack.
    */
        // exoticRequireStrings: [],
        /* options to pass on to enhanced-resolve, the package dependency-cruiser
       uses to resolve module references to disk. You can set most of these
       options in a webpack.conf.js - this section is here for those
       projects that don't have a separate webpack config file.

       Note: settings in webpack.conf.js override the ones specified here.
     */
        enhancedResolveOptions: {
            /* List of strings to consider as 'exports' fields in package.json. Use
         ['exports'] when you use packages that use such a field and your environment
         supports it (e.g. node ^12.19 || >=14.7 or recent versions of webpack).

         If you have an `exportsFields` attribute in your webpack config, that one
         will have precedence over the one specified here.
      */
            exportsFields: ['exports'],
            /* List of conditions to check for in the exports field. e.g. use ['imports']
         if you're only interested in exposed es6 modules, ['require'] for commonjs,
         or all conditions at once `(['import', 'require', 'node', 'default']`)
         if anything goes for you. Only works when the 'exportsFields' array is
         non-empty.

        If you have a 'conditionNames' attribute in your webpack config, that one will
        have precedence over the one specified here.
      */
            conditionNames: ['import', 'require', 'node', 'default'],
            /*
         The extensions, by default are the same as the ones dependency-cruiser
         can access (run `npx depcruise --info` to see which ones that are in
         _your_ environment. If that list is larger than what you need (e.g.
         it contains .js, .jsx, .ts, .tsx, .cts, .mts - but you don't use
         TypeScript you can pass just the extensions you actually use (e.g.
         [".js", ".jsx"]). This can speed up the most expensive step in
         dependency cruising (module resolution) quite a bit.
       */
            // extensions: [".js", ".jsx", ".ts", ".tsx", ".d.ts"],
            /*
         If your TypeScript project makes use of types specified in 'types'
         fields in package.jsons of external dependencies, specify "types"
         in addition to "main" in here, so enhanced-resolve (the resolver
         dependency-cruiser uses) knows to also look there. You can also do
         this if you're not sure, but still use TypeScript. In a future version
         of dependency-cruiser this will likely become the default.
       */
            mainFields: ['main', 'types', 'typings'],
        },
        reporterOptions: {
            dot: {
                /* pattern of modules that can be consolidated in the detailed
           graphical dependency graph. The default pattern in this configuration
           collapses everything in node_modules to one folder deep so you see
           the external modules, but not the innards your app depends upon.
         */
                collapsePattern: 'node_modules/(@[^/]+/[^/]+|[^/]+)',

                /* Options to tweak the appearance of your graph.See
           https://github.com/sverweij/dependency-cruiser/blob/main/doc/options-reference.md#reporteroptions
           for details and some examples. If you don't specify a theme
           don't worry - dependency-cruiser will fall back to the default one.
        */
                // theme: {
                //   graph: {
                //     /* use splines: "ortho" for straight lines. Be aware though
                //       graphviz might take a long time calculating ortho(gonal)
                //       routings.
                //    */
                //     splines: "true"
                //   },
                //   modules: [
                //     {
                //       criteria: { matchesFocus: true },
                //       attributes: {
                //         fillcolor: "lime",
                //         penwidth: 2,
                //       },
                //     },
                //     {
                //       criteria: { matchesFocus: false },
                //       attributes: {
                //         fillcolor: "lightgrey",
                //       },
                //     },
                //     {
                //       criteria: { matchesReaches: true },
                //       attributes: {
                //         fillcolor: "lime",
                //         penwidth: 2,
                //       },
                //     },
                //     {
                //       criteria: { matchesReaches: false },
                //       attributes: {
                //         fillcolor: "lightgrey",
                //       },
                //     },
                //     {
                //       criteria: { source: "^src/model" },
                //       attributes: { fillcolor: "#ccccff" }
                //     },
                //     {
                //       criteria: { source: "^src/view" },
                //       attributes: { fillcolor: "#ccffcc" }
                //     },
                //   ],
                //   dependencies: [
                //     {
                //       criteria: { "rules[0].severity": "error" },
                //       attributes: { fontcolor: "red", color: "red" }
                //     },
                //     {
                //       criteria: { "rules[0].severity": "warn" },
                //       attributes: { fontcolor: "orange", color: "orange" }
                //     },
                //     {
                //       criteria: { "rules[0].severity": "info" },
                //       attributes: { fontcolor: "blue", color: "blue" }
                //     },
                //     {
                //       criteria: { resolved: "^src/model" },
                //       attributes: { color: "#0000ff77" }
                //     },
                //     {
                //       criteria: { resolved: "^src/view" },
                //       attributes: { color: "#00770077" }
                //     }
                //   ]
                // }
            },
            archi: {
                /* pattern of modules that can be consolidated in the high level
          graphical dependency graph. If you use the high level graphical
          dependency graph reporter (`archi`) you probably want to tweak
          this collapsePattern to your situation.
        */
                collapsePattern:
                    '^(packages|src|lib|app|bin|test(s?)|spec(s?))/[^/]+|node_modules/(@[^/]+/[^/]+|[^/]+)',

                /* Options to tweak the appearance of your graph.See
           https://github.com/sverweij/dependency-cruiser/blob/main/doc/options-reference.md#reporteroptions
           for details and some examples. If you don't specify a theme
           for 'archi' dependency-cruiser will use the one specified in the
           dot section (see above), if any, and otherwise use the default one.
         */
                // theme: {
                // },
            },
            text: {
                highlightFocused: true,
            },
        },
    },
};
// generated: dependency-cruiser@13.1.5 on 2023-09-14T16:55:18.243Z
