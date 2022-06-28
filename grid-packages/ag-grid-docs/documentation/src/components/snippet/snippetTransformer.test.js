import supportedFrameworks from "../../utils/supported-frameworks";
import React from "react";
import { transform } from './snippetTransformer';

// Utility method to verify snippets match saved snapshots for all frameworks and options
const runSnippetFrameworkTests = snippetToTest => {
    // no options supplied
    it.each(supportedFrameworks)
    (`it should create '%s' snippets`, framework => {
        const options = {};
        const generatedSnippet = transform(snippetToTest, framework, options);
        expect(generatedSnippet).toMatchSnapshot();
    });

    // (suppressFrameworkContext = true)
    it.each(supportedFrameworks)
    (`it should create '%s' snippets without framework context`, framework => {
        const options = { suppressFrameworkContext: true };
        const generatedSnippet = transform(snippetToTest, framework, options);
        expect(generatedSnippet).toMatchSnapshot();
    });

    // (spaceBetweenProperties = true)
    it.each(supportedFrameworks)
    (`it should create '%s' snippets with space between properties`, framework => {
        const options = { spaceBetweenProperties: true };
        const generatedSnippet = transform(snippetToTest, framework, options);
        expect(generatedSnippet).toMatchSnapshot();
    });

    // (suppressFrameworkContext = true, spaceBetweenProperties = true)
    it.each(supportedFrameworks)
    (`it should create '%s' snippets without framework context and space between properties`, framework => {
        const options = { suppressFrameworkContext: true, spaceBetweenProperties: true };
        const generatedSnippet = transform(snippetToTest, framework, options);
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
            ],
        },
    ]
}`
        );
    });

    describe('given col defs with arrow function properties', () => {
        runSnippetFrameworkTests(
`const gridOptions = {
    columnDefs: [
        {
            field: 'country',
            // col span is 2 for rows with Russia, but 1 for everything else
            colSpan: params => params.data.country === 'Russia' ? 2 : 1,
        },        
    ],
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
        width: 100,
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

    describe('given function declaration', () => {
        runSnippetFrameworkTests(
            `// some value handler
const myValueFormatter = params => {
    return '(' + params.value + ')';
}`
        );
    });

    describe('given api statements', () => {
        runSnippetFrameworkTests(
`// save the columns state
const savedState = gridOptions.columnApi.getColumnState();

// restore the column state
gridOptions.columnApi.applyColumnState({ state: savedState });

// get the row node with ID 55
const rowNode = gridOptions.api.getRowNode('55');`
        );
    });

    describe('given column definitions with functions', () => {
        runSnippetFrameworkTests(
`const gridOptions = {
    columnDefs: [
        {
            field: 'age',
            // simple number comparator
            comparator: (valueA, valueB, nodeA, nodeB, isDescending) => valueA - valueB
        },
        {
            field: 'name',
            // simple string comparator
            comparator: (valueA, valueB, nodeA, nodeB, isDescending) => {
                if (valueA == valueB) return 0;
                return (valueA > valueB) ? 1 : -1;
            }
        }
    ]    
}`
        );
    });

    describe('given complex column definition with array property', () => {
        runSnippetFrameworkTests(
`const gridOptions = {
    columnDefs: [
        {
            filterType: 'multi',
            filterModels: [
                null,
                { filterType: 'set', values: ['A', 'B', 'C'] }
            ]
        }
    ]
}`
        );
    });

});