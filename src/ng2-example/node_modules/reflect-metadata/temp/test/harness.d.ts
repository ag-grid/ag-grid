export interface TestResults {
    passed: string[];
    failed: [string, any][];
}
export declare function runTests(fixture: any): TestResults;
export declare function printResults(results: TestResults): void;
