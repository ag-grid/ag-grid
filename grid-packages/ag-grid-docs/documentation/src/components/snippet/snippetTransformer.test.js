import supportedFrameworks from "../../utils/supported-frameworks";
import { Snippet } from "./Snippet";
import React from "react";
import { transform } from './snippetTransformer';

// Utility method to verify snippets match saved snapshots for all frameworks and options
const runSnippetFrameworkTests = snippetToTest => {
    // with framework context (suppressFrameworkContext = false)
    it.each(supportedFrameworks)(`it should create '%s' snippets`, framework => {
        const generatedSnippet = transform(snippetToTest, framework, {suppressFrameworkContext: false});
        expect(generatedSnippet).toMatchSnapshot();
    });

    // without framework context (suppressFrameworkContext = true)
    it.each(supportedFrameworks)(`it should create '%s' snippets without framework context`, framework => {
        const generatedSnippet = transform(snippetToTest, framework, {suppressFrameworkContext: true});
        expect(generatedSnippet).toMatchSnapshot();
    });
}

// These tests are run for each framework!
describe('Snippet', () => {
    describe('given simple column definitions', () => {
        runSnippetFrameworkTests(
            `const gridOptions = {
                // define 3 columns
                columnDefs: [
                    { headerName: 'A', field: 'a' },
                    { headerName: 'B', field: 'b' },
                    { headerName: 'C', field: 'c' },
                ]
            }`
        );
    });
    describe('given column definitions with group columns', () => {
        runSnippetFrameworkTests(
            `const gridOptions = {
                // 2 levels of grouping
                columnDefs: [
                    {
                        headerName: 'G1',
                        children: [
                            { headerName: 'C1', field: 'c1' },
                            {
                                headerName: 'G2',
                                children: [
                                    { headerName: 'C2', field: 'c2' },
                                    { headerName: 'C3', field: 'c3' },
                                ],
                            },
                            { headerName: 'C4', field: 'c4' },
                        ]
                    },
                ]
            }`
        );
    });
    describe('given a mix of different properties', () => {
        runSnippetFrameworkTests(
            `const gridOptions = {
                // columnDefs property (special)
                columnDefs: [
                    { headerName: 'A', field: 'a' },
                    { headerName: 'B', field: 'b' },
                    { headerName: 'C', field: 'c' },
                ],
                // object property
                defaultColDef: {
                    // set every column width
                    width: 100
                },
                // numeric property
                rowHeight: 50,
                // boolean property
                rowDragManaged: true,
                // string property
                rowSelection: 'single',
            }`
        );
    });
});