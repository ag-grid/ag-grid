const fs = require('fs');
const { join, resolve } = require('path');
const Ajv = require('ajv');
const standaloneCode = require('ajv/dist/standalone').default;
const tjs = require('typescript-json-schema');

const DEBUG = process.argv.includes('--debug');

const sources = [
    {
        path: 'chart/agChartOptions.ts', 
        rootType: ['AgChartOptions']
    },
];

const outputs = [
    { path: 'src', code: { es5: true } }, // Needed for docs Webpack build. We .gitignore this file.
    { path: 'dist/cjs/es5', code: { es5: true } },
    { path: 'dist/cjs/es6', code: {} },
    { path: 'dist/esm/es5', code: { es5: true, esm: true } },
    { path: 'dist/esm/es6', code: { esm: true } },
];

function visit(object, cb) {
    Object.entries(object)
        .forEach(([prop, value]) => {
            if (cb(prop, value) === false) {
                delete object[prop];
            } else if (typeof value === 'object') {
                visit(value, cb);
            }
        });
}

function cleanSchema(schema) {
    visit(schema, (prop, value) => {
        return prop !== 'description';
    });
}

sources.forEach(({path, rootType}) => {
    const inputFilename = `src/${path}`;
    const schemaFilename = path.replace(/\.ts$/, '.jsonschema');
    const outputFilename = path.replace(/\.ts$/, '.ajv.js');
    const tsdFilename = path.replace(/\.ts$/, '.ajv.d.ts');
    const tsjProgram = tjs.getProgramFromFiles(
        [resolve(inputFilename)],
        {
            strictNullChecks: true,
        },
        './src'
    );
    const tsjSettings = {
        required: true,
        noExtraProps: true,
    };
    const schema = tjs.generateSchema(tsjProgram, typeof rootType === 'string' ? rootType : '*', tsjSettings);
    cleanSchema(schema);
    if (DEBUG) {
        fs.writeFileSync(join(__dirname, 'src', schemaFilename), JSON.stringify(schema, null, 2));
    }

    let schemaConfig = undefined;
    if (rootType === '*') {
        // Skip.
    } else {
        const rootTypeArray = typeof rootType === 'string' ? [rootType] : rootType;
        schemaConfig = rootTypeArray.reduce(
            (out, next) => {
                out[`validate${next}`] = `#/definitions/${next}`;
                return out;
            },
            {},
        );
    }

    outputs.forEach(({ path: outputPath, code }) => {
        const sizeOptimisationOptions = {
            inlineRefs: false,
            loopEnum: 1,
            loopRequired: 1,
            meta: false,
            validateSchema: false,
            messages: false,
        };
        const ajv = new Ajv({
            schemas: [schema],
            code: { source: true, optimize: true, ...code },
            strict: true,
            strictSchema: true,
            allowUnionTypes: true,
            ...sizeOptimisationOptions,
        });
        const moduleCode = standaloneCode(ajv, schemaConfig);
        const fullOutputPath = join(__dirname, outputPath, outputFilename);

        // create the dist folders if they don't exist - ie on a clean build
        const distPath = fullOutputPath.substring(0, fullOutputPath.lastIndexOf("/"));
        if(!fs.existsSync(distPath)) {
            fs.mkdirSync(distPath, { recursive: true });
            console.log(`Created ${distPath.replace(__dirname, '.')}...`);
        }

       // copy the declaration file - it won't be done by TSC
       const inputTsd = join(__dirname, 'src', tsdFilename);
       const outputTsd = join(__dirname, outputPath, tsdFilename);
       if(fs.existsSync(inputTsd) && !fs.existsSync(outputTsd)) {
           fs.copyFileSync(inputTsd, outputTsd);
           console.log(`Copied ${outputTsd.replace(__dirname, '.')}...`);
        }

        fs.writeFileSync(fullOutputPath, moduleCode);
        console.log(` Built ${fullOutputPath.replace(__dirname, '.')}...`);
    });
});
