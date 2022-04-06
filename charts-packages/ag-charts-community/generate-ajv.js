const fs = require('fs');
const { join, resolve } = require('path');
const Ajv = require('ajv');
const standaloneCode = require('ajv/dist/standalone').default;
const tjs = require('typescript-json-schema');
const uglifyjs = require('uglify-js');

const DEBUG = process.argv.includes('--debug');

const sources = [
    {
        path: 'chart/agChartOptions.ts',
        rootType: ['AgChartOptions'],
    },
];

const outputs = [
    { path: 'src', code: { es5: true } }, // Needed for docs Webpack build. We .gitignore this file.
    { path: 'dist/cjs/es5', code: { es5: true, esm: false } },
    { path: 'dist/cjs/es6', code: { es5: false, esm: false } },
    { path: 'dist/esm/es5', code: { es5: true, esm: true } },
    { path: 'dist/esm/es6', code: { es5: false, esm: true } },
];

function visit(object, cb, path = '#') {
    Object.entries(object).forEach(([prop, value]) => {
        const visitResult = cb(prop, value, path);
        const { rename, update } = visitResult;

        if (visitResult === false) {
            delete object[prop];
            return;
        } else if (rename != null) {
            object[rename] = object[prop];
            delete object[prop];
            prop = rename;
        } else if (update != null) {
            object[prop] = update;
        }

        if (typeof value === 'object') {
            visit(value, cb, `${path}/${prop}`);
        }
    });
}

function cleanJsonSchema(schema) {
    let count = 0;
    let nameCache = {};

    visit(schema, (prop, value, parentPath) => {
        if (prop === 'description') {
            // Remove descriptions.
            return false;
        }

        if (parentPath === '#/definitions') {
            // Rename definitions to optimise JSONSchema size.
            const propPath = `${parentPath}/${prop}`;
            if (nameCache[propPath] == null) {
                nameCache[propPath] = `#/definitions/${count++}`;
            }
            
            return { rename: nameCache[propPath].split('/')[2] };
        }

        if (prop === '$ref') {
            // Update references to renamed definitions.
            if (nameCache[value] == null) {
                nameCache[value] = `#/definitions/${count++}`;
            }

            return { update: nameCache[value] };
        }

        return true;
    });

    return nameCache;
}

function normaliseAjvCode(code) {
    // Inject some constants to reduce repetition.
    const constants = {D: "#/definitions/"};
    code = code.replace(/"#\/definitions\//g, 'D+"');

    // Inject constants.
    const constantJs = Object.entries(constants)
        .reduce((out, [name, value]) => {
            out += `var ${name}="${value}";`;
            return out;
        }, '');
    code = code.replace('"use strict";', `"use strict";${constantJs}`);

    return code;
}

let exitCode = 0;
sources.forEach(({ path, rootType }) => {
    const inputFilename = `src/${path}`;
    const schemaFilename = path.replace(/\.ts$/, '.jsonschema');
    const ajvFilename = path.replace(/\.ts$/, '.ajv.raw.js');
    const outputModuleName = path.replace(/\.ts$/, '.ajv').split('/').pop();
    const outputFilename = path.replace(/\.ts$/, '.ajv.js');
    const tsdFilename = path.replace(/\.ts$/, '.ajv.d.ts');
    const tsjProgram = tjs.getProgramFromFiles(
        [resolve(inputFilename)],
        {
            // strictNullChecks: true,
        },
        './src'
    );
    const tsjSettings = {
        topRef: true,
        required: true,
        noExtraProps: true,
        aliasRefs: true,
    };
    const schema = tjs.generateSchema(tsjProgram, typeof rootType === 'string' ? rootType : '*', tsjSettings);
    const remappedSchemaIds = cleanJsonSchema(schema);
    if (DEBUG) {
        const debugFilename = join(__dirname, 'src', schemaFilename);
        fs.writeFileSync(debugFilename, JSON.stringify(schema, null, 2));
        console.log(` Debug ${debugFilename.replace(__dirname, '.')} ...`);
    }

    let schemaConfig = undefined;
    if (rootType === '*') {
        // Skip.
    } else {
        const rootTypeArray = typeof rootType === 'string' ? [rootType] : rootType;
        schemaConfig = rootTypeArray.reduce((out, next) => {
            out[`validate${next}`] = remappedSchemaIds[`#/definitions/${next}`];
            return out;
        }, {});
    }

    outputs.forEach(({ path: outputPath, code }) => {
        const ajv = new Ajv({
            schemas: [schema],
            code: { source: true, lines: false, optimize: true, ...code },
            strict: true,
            strictSchema: true,
            allowUnionTypes: true,
            // Size optimisations below here.
            inlineRefs: false,
            meta: false,
            validateSchema: false,
            messages: false,
        });
        const moduleCode = normaliseAjvCode(standaloneCode(ajv, schemaConfig));
        const minifiedResult = uglifyjs.minify(
            { main: moduleCode },
            {
                compress: {
                    passes: 5,
                },
                // mangle: {
                //     properties: true,
                //     reserved: Object.keys(schemaConfig),
                // },
                // wrap: outputModuleName,
            },
        );

        if (minifiedResult.error) {
            console.error(minifiedResult.error);
            exitCode = 10;
            return;
        }
        const minifiedCode = minifiedResult.code;

        const fullOutputPath = join(__dirname, outputPath, outputFilename);

        // create the dist folders if they don't exist - ie on a clean build
        const distPath = fullOutputPath.substring(0, fullOutputPath.lastIndexOf('/'));
        if (!fs.existsSync(distPath)) {
            fs.mkdirSync(distPath, { recursive: true });
            console.log(`Created ${distPath.replace(__dirname, '.')} ...`);
        }

        // copy the declaration file - it won't be done by TSC
        const inputTsd = join(__dirname, 'src', tsdFilename);
        const outputTsd = join(__dirname, outputPath, tsdFilename);
        if (fs.existsSync(inputTsd) && !fs.existsSync(outputTsd)) {
            fs.copyFileSync(inputTsd, outputTsd);
            console.log(`Copied ${outputTsd.replace(__dirname, '.')} ...`);
        }

        if (DEBUG) {
            const debugFilename = fullOutputPath.replace(/.js$/, '.debug.js');
            fs.writeFileSync(debugFilename, moduleCode);
            console.log(` Debug ${debugFilename.replace(__dirname, '.')} ...`);
        }
        fs.writeFileSync(fullOutputPath, minifiedCode);
        console.log(` Built ${fullOutputPath.replace(__dirname, '.')} (${Math.round(minifiedCode.length / 1024)}K) ...`);
    });
});

process.exit(exitCode);
