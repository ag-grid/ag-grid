import fs from 'fs';
import { dirname } from 'path';
import { json2xml } from 'xml-js';

export class TestCase {
    classname: string;
    name: string;
    time: number;
    failure?: string;

    constructor(classname: string, name: string, time: number) {
        this.classname = classname;
        this.name = name;
        this.time = time;
    }

    setFailure(failure: string) {
        this.failure = failure;
    }

    hasFailure() {
        return this.failure !== undefined;
    }

    print() {
        console.log(`Testcase: ${this.name}`);
    }
}

export class TestSuite {
    name: string;
    testCases: TestCase[] = [];

    constructor(name: string) {
        this.name = name;
    }

    public addTestCase(testCase: TestCase) {
        this.testCases.push(testCase);
    }

    hasFailure() {
        return this.testCases.some((testCase) => testCase.hasFailure());
    }
}

export class TestSuites {
    private name: string;

    private testSuites: TestSuite[] = [];

    constructor(name: string) {
        this.name = name;
    }

    public addTestSuite(testSuite: TestSuite) {
        this.testSuites.push(testSuite);
    }

    public hasFailures() {
        return this.testSuites.some((testSuite) => {
            return testSuite.testCases.some((testCase) => {
                return testCase.failure !== undefined;
            });
        });
    }

    public getFailures() {
        const failures: string[] = [];
        this.testSuites.forEach((testSuite) => {
            testSuite.testCases
                .filter((testCase) => testCase.failure)
                .forEach((testCase) => {
                    failures.push(testCase.failure!);
                });
        });
        return failures;
    }

    toJson(onlyFailures: boolean) {
        const result = {
            _declaration: {
                _attributes: {
                    version: '1.0',
                    encoding: 'utf-8',
                },
            },
            testsuites: {
                _attributes: {
                    name: this.name,
                    tests: this.testSuites.reduce((acc, testSuite) => acc + testSuite.testCases.length, 0),
                    time: this.testSuites.reduce(
                        (acc, testSuite) => acc + testSuite.testCases.reduce((acc, testCase) => acc + testCase.time, 0),
                        0
                    ),
                    failures: this.testSuites.reduce(
                        (acc, testSuite) =>
                            acc + testSuite.testCases.filter((testCase) => testCase.hasFailure()).length,
                        0
                    ),
                },
                testsuite: this.testSuites
                    .filter((testSuite) => (onlyFailures ? testSuite.hasFailure() : true))
                    .map((testSuite) => ({
                        _attributes: {
                            name: testSuite.name,
                            failures: testSuite.testCases.filter((testCase) => testCase.hasFailure()).length,
                            tests: testSuite.testCases.length,
                            time: testSuite.testCases.reduce((acc, testCase) => acc + testCase.time, 0),
                        },
                        testcase: testSuite.testCases
                            .filter((testCase) => (onlyFailures ? testCase.hasFailure() : true))
                            .map((testCase) => ({
                                _attributes: {
                                    classname: testCase.classname,
                                    name: testCase.name,
                                    time: testCase.time,
                                },
                                [testCase.hasFailure() ? 'failure' : '']: testCase.failure,
                            })),
                    })),
            },
        };

        // if onlyFailures is set it could be there aren't - we ensure that the expected
        // testsuites >testsuite > testcase hierarchy is maintained and some useful context added
        if (result.testsuites.testsuite.length === 0) {
            result.testsuites.testsuite.push(<any>{
                _attributes: {
                    name: `${result.testsuites._attributes.name}: (${result.testsuites._attributes.tests} tests run and passed)`,
                    failures: result.testsuites._attributes.failures,
                    tests: result.testsuites._attributes.tests,
                    time: result.testsuites._attributes.time,
                },
                testcase: [
                    {
                        _attributes: {
                            classname: result.testsuites._attributes.name,
                            name: result.testsuites._attributes.name,
                            time: 0,
                        },
                    },
                ],
            });
        }

        return result;
    }

    writeJunitReport(outputPath: string, onlyFailures = false) {
        const result = json2xml(JSON.stringify(this.toJson(onlyFailures)).replace('<></>', ''), {
            compact: true,
            ignoreComment: true,
            spaces: 4,
            fullTagEmptyElement: true,
        });
        fs.mkdirSync(dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, result, 'utf8');
    }

    print() {
        console.log(JSON.stringify(this.toJson(false)));
    }
}
