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

    toJson() {
        return {
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
                        (acc, testSuite) => acc + testSuite.testCases.filter((testCase) => testCase.failure).length,
                        0
                    ),
                },
                testsuite: this.testSuites.map((testSuite) => ({
                    _attributes: {
                        name: testSuite.name,
                        failures: testSuite.testCases.filter((testCase) => testCase.failure).length,
                        tests: testSuite.testCases.length,
                        time: testSuite.testCases.reduce((acc, testCase) => acc + testCase.time, 0),
                    },
                    testcase: testSuite.testCases.map((testCase) => ({
                        _attributes: {
                            classname: testCase.classname,
                            name: testCase.name,
                            time: testCase.time,
                        },
                        [testCase.failure ? 'failure' : '']: testCase.failure,
                    })),
                })),
            },
        };
    }

    writeJunitReport(outputPath: string) {
        const result = json2xml(JSON.stringify(this.toJson()).replace('<></>', ''), {
            compact: true,
            ignoreComment: true,
            spaces: 4,
            fullTagEmptyElement: true,
        });
        fs.mkdirSync(dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, result, 'utf8');
    }

    print() {
        console.log(JSON.stringify(this.toJson()));
    }
}
