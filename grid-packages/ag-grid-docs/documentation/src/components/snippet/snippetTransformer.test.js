import supportedFrameworks from "../../utils/supported-frameworks";
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
describe('Snippet Component', () => {
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
    describe('given a mix of grid options', () => {
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
                // function property
                postSort: rowNodes => {
                    // here we put Ireland rows on top while preserving the sort order  
                    let nextInsertPos = 0;
                    for (let i = 0; i < rowNodes.length; i++) {
                        const country = rowNodes[i].data.country;      
                        if (country === 'Ireland') {        
                            rowNodes.splice(nextInsertPos, 0, rowNodes.splice(i, 1)[0]);
                            nextInsertPos++;
                        }
                    }
                },
            }`
        );
    });
});