const fs = require('fs');
const path = require('path');
const resultsFilePath = path.resolve(__dirname, 'module-size-results.json');
const { TestSuites, TestSuite, TestCase } = require('ag-shared/processor');

const isCI = process.env.CI || process.env.NX_TASK_TARGET_CONFIGURATION === 'ci';

function validateSizes() {
    const testSuites = new TestSuites('Module Size Tests');

    console.log('Running module size tests...');

    // Read and parse the module-size-results.json file
    const results = JSON.parse(fs.readFileSync(resultsFilePath, 'utf8'));

    if (results.length === 0) {
        console.error('No results found in module-size-results.json');
        process.exit(1);
    }

    results.forEach((result) => {
        const testName = result.modules.length === 0 ? 'default' : result.modules.join(', ');
        const testSuite = new TestSuite(testName);
        testSuites.addTestSuite(testSuite);

        const testCase = new TestCase(testName, testName, 0.0);

        // validate that all results their selfSize is less than the expectedSize + 2%

        // Some modules are very small and the expected size is very close to the actual size
        // But for large modules cap at a 5kb change.
        const bufferSize = (expected) => Math.min(5, Math.max(expected * 0.03, 1));

        const tooBig = result.selfSize > result.expectedSize + bufferSize(result.expectedSize);

        // We should reduce the expected size if the module is smaller than expected
        const tooSmall = result.selfSize < result.expectedSize - bufferSize(result.expectedSize);

        if (tooBig || tooSmall) {
            const errors: string[] = [];
            if (tooBig) {
                errors.push(
                    'Validation failed for the following modules which are too large compared to their expected size:'
                );
                errors.push(
                    `Module: [${result.modules.join()}], selfSize: ${result.selfSize}, expectedSize: ${result.expectedSize} + (${bufferSize(result.expectedSize)})`
                );
            }
            if (tooSmall) {
                errors.push(
                    'Validation failed for the following modules which are too small compared to their expected size:'
                );
                errors.push(
                    'Is the expected size too high in moduleDefinitions? Or have the module dependencies changed?'
                );
                errors.push(
                    `Module: [${result.modules.join()}], selfSize: ${result.selfSize}, expectedSize: ${result.expectedSize} + (${bufferSize(result.expectedSize)})`
                );
            }
            testCase.setFailure(errors.join('\n'));
        }
        testSuite.addTestCase(testCase);
    });

    if (testSuites.hasFailures()) {
        testSuites.getFailures().forEach((failure) => console.log(failure));
    } else {
        console.log(`All modules (${results.length}) passed size validation.`);
    }

    if (isCI) {
        testSuites.writeJunitReport(path.resolve(__dirname, '../../reports/ag-grid-module-size.xml'));
    }

    // testSuites.print();
    process.exit(testSuites.hasFailures() ? 1 : 0); // Return a non-zero exit code
}

validateSizes();
