import type { Framework } from '@ag-grid-types';

export interface FrameworkConfig {
    framework: Framework;
    /** The URL path prefix for docs (e.g., 'react-data-grid', 'angular-data-grid') */
    docsPath: string;
    /** The product name (e.g., 'React Table', 'Angular Data Grid') */
    productName: string;
    /** The package name for npm install (e.g., 'ag-grid-react', 'ag-grid-angular') */
    packageName: string;
    /** The analytics event name prefix (e.g., 'react-table', 'angular-data-grid') */
    analyticsPrefix: string;
    /** Hero section content */
    hero: {
        tag: string;
        heading: string;
        subHeading: string;
    };
    /** Section content configuration */
    sections: {
        features: {
            tag: string;
            subHeading: string;
        };
        showcase: {
            tag: string;
        };
        customers: {
            tag: string;
            subHeadingHtml: string;
        };
        examples: {
            tag: string;
            heading: string;
            subHeading: string;
        };
        faq: {
            tag: string;
            subHeading: string;
        };
    };
    /** Contact section feature list */
    contactFeatures: string[];
}

export const FRAMEWORK_CONFIGS: Record<'react' | 'reactDataGrid' | 'angular' | 'javascript' | 'vue', FrameworkConfig> = {
    react: {
        framework: 'react',
        docsPath: 'react-data-grid',
        productName: 'React Table',
        packageName: 'ag-grid-react',
        analyticsPrefix: 'react-table',
        hero: {
            tag: 'React Table',
            heading: 'Fast, Powerful and Flexible React Tables',
            subHeading: 'React Data Tables',
        },
        sections: {
            features: {
                tag: 'Why Use AG Grid to Build React Tables?',
                subHeading:
                    'Get started in minutes and access 1000s of features without compromising on performance. Customise your React Table with your own styles and components or upgrade to enterprise to use our advanced features.',
            },
            showcase: {
                tag: 'Where Can I See AG Grid React Tables Being Used?',
            },
            customers: {
                tag: 'Who Builds React Tables with AG Grid?',
                subHeadingHtml: `<span>Over <b>90% of the Fortune 500</b> build React Tables using AG Grid, with <a href="https://www.npmjs.com/package/ag-grid-community" target="_blank"> 1,000,000+</a> npm downloads per week and over <a href="https://github.com/ag-grid/ag-grid/tree/latest" target="_blank"> 12,000</a> Stars on GitHub.</span>`,
            },
            examples: {
                tag: 'How Do I Build a React Table with AG Grid?',
                heading: 'Get Started with React Table Examples',
                subHeading:
                    'We have a range of examples, tutorials and documentation to help you start building your first React Table with AG Grid.',
            },
            faq: {
                tag: 'React Table FAQs',
                subHeading: 'Answers to some commonly asked questions when building React Tables with AG Grid',
            },
        },
        contactFeatures: [
            'Expert technical guidance',
            'Demos & technical walkthroughs',
            'Licencing and pricing information',
            'Response within 24 hours',
        ],
    },
    reactDataGrid: {
        framework: 'react',
        docsPath: 'react-data-grid',
        productName: 'React Data Grid',
        packageName: 'ag-grid-react',
        analyticsPrefix: 'react-data-grid',
        hero: {
            tag: 'React Data Grid',
            heading: 'Fast, Powerful and Flexible React Data Grids',
            subHeading: 'React Data Grids',
        },
        sections: {
            features: {
                tag: 'Why Use AG Grid to Build React Data Grids?',
                subHeading:
                    'Get started in minutes and access 1000s of features without compromising on performance. Customise your React Data Grid with your own styles and components or upgrade to enterprise to use our advanced features.',
            },
            showcase: {
                tag: 'Where Can I See AG Grid React Data Grids Being Used?',
            },
            customers: {
                tag: 'Who Builds React Data Grids with AG Grid?',
                subHeadingHtml: `<span>Over <b>90% of the Fortune 500</b> build React Data Grids using AG Grid, with <a href="https://www.npmjs.com/package/ag-grid-community" target="_blank"> 1,000,000+</a> npm downloads per week and over <a href="https://github.com/ag-grid/ag-grid/tree/latest" target="_blank"> 12,000</a> Stars on GitHub.</span>`,
            },
            examples: {
                tag: 'How Do I Build a React Data Grid with AG Grid?',
                heading: 'Get Started with React Data Grid Examples',
                subHeading:
                    'We have a range of examples, tutorials and documentation to help you start building your first React Data Grid with AG Grid.',
            },
            faq: {
                tag: 'React Data Grid FAQs',
                subHeading: 'Answers to some commonly asked questions when building React Data Grids with AG Grid',
            },
        },
        contactFeatures: [
            'Expert technical guidance',
            'Demos & technical walkthroughs',
            'Licencing and pricing information',
            'Response within 24 hours',
        ],
    },
    angular: {
        framework: 'angular',
        docsPath: 'angular-data-grid',
        productName: 'Angular Data Grid',
        packageName: 'ag-grid-angular',
        analyticsPrefix: 'angular-data-grid',
        hero: {
            tag: 'Angular Data Grid',
            heading: 'Fast, Powerful and Flexible Angular Data Grids',
            subHeading: 'Angular Data Grids',
        },
        sections: {
            features: {
                tag: 'Why Use AG Grid to Build Angular Data Grids?',
                subHeading:
                    'Get started in minutes and access 1000s of features without compromising on performance. Customise your Angular Data Grid with your own styles and components or upgrade to enterprise to use our advanced features.',
            },
            showcase: {
                tag: 'Where Can I See AG Grid Angular Data Grids Being Used?',
            },
            customers: {
                tag: 'Who Builds Angular Data Grids with AG Grid?',
                subHeadingHtml: `<span>Over <b>90% of the Fortune 500</b> build Angular Data Grids using AG Grid, with <a href="https://www.npmjs.com/package/ag-grid-community" target="_blank"> 1,000,000+</a> npm downloads per week and over <a href="https://github.com/ag-grid/ag-grid/tree/latest" target="_blank"> 12,000</a> Stars on GitHub.</span>`,
            },
            examples: {
                tag: 'How Do I Build an Angular Data Grid with AG Grid?',
                heading: 'Get Started with Angular Data Grid Examples',
                subHeading:
                    'We have a range of examples, tutorials and documentation to help you start building your first Angular Data Grid with AG Grid.',
            },
            faq: {
                tag: 'Angular Data Grid FAQs',
                subHeading: 'Answers to some commonly asked questions when building Angular Data Grids with AG Grid',
            },
        },
        contactFeatures: [
            'Expert technical guidance',
            'Custom pricing for large teams',
            'Demos & technical walkthroughs',
            'Response within 24 hours',
        ],
    },
    javascript: {
        framework: 'javascript',
        docsPath: 'javascript-data-grid',
        productName: 'JavaScript Data Grid',
        packageName: 'ag-grid-community',
        analyticsPrefix: 'javascript-data-grid',
        hero: {
            tag: 'JavaScript Data Grid',
            heading: 'Fast, Powerful and Flexible JavaScript Data Grids',
            subHeading: 'JavaScript Data Grids',
        },
        sections: {
            features: {
                tag: 'Why Use AG Grid to Build JavaScript Data Grids?',
                subHeading:
                    'Get started in minutes and access 1000s of features without compromising on performance. Customise your JavaScript Data Grid with your own styles and components or upgrade to enterprise to use our advanced features.',
            },
            showcase: {
                tag: 'Where Can I See AG Grid JavaScript Data Grids Being Used?',
            },
            customers: {
                tag: 'Who Builds JavaScript Data Grids with AG Grid?',
                subHeadingHtml: `<span>Over <b>90% of the Fortune 500</b> build JavaScript Data Grids using AG Grid, with <a href="https://www.npmjs.com/package/ag-grid-community" target="_blank"> 1,000,000+</a> npm downloads per week and over <a href="https://github.com/ag-grid/ag-grid/tree/latest" target="_blank"> 12,000</a> Stars on GitHub.</span>`,
            },
            examples: {
                tag: 'How Do I Build a JavaScript Data Grid with AG Grid?',
                heading: 'Get Started with JavaScript Data Grid Examples',
                subHeading:
                    'We have a range of examples, tutorials and documentation to help you start building your first JavaScript Data Grid with AG Grid.',
            },
            faq: {
                tag: 'JavaScript Data Grid FAQs',
                subHeading:
                    'Answers to some commonly asked questions when building JavaScript Data Grids with AG Grid',
            },
        },
        contactFeatures: [
            'Expert technical guidance',
            'Demos & technical walkthroughs',
            'Licencing and pricing information',
            'Response within 24 hours',
        ],
    },
    vue: {
        framework: 'vue',
        docsPath: 'vue-data-grid',
        productName: 'Vue Data Grid',
        packageName: 'ag-grid-vue3',
        analyticsPrefix: 'vue-data-grid',
        hero: {
            tag: 'Vue Data Grid',
            heading: 'Fast, Powerful and Flexible Vue Data Grids',
            subHeading: 'Vue Data Grids',
        },
        sections: {
            features: {
                tag: 'Why Use AG Grid to Build Vue Data Grids?',
                subHeading:
                    'Get started in minutes and access 1000s of features without compromising on performance. Customise your Vue Data Grid with your own styles and components or upgrade to enterprise to use our advanced features.',
            },
            showcase: {
                tag: 'Where Can I See AG Grid Vue Data Grids Being Used?',
            },
            customers: {
                tag: 'Who Builds Vue Data Grids with AG Grid?',
                subHeadingHtml: `<span>Over <b>90% of the Fortune 500</b> build Vue Data Grids using AG Grid, with <a href="https://www.npmjs.com/package/ag-grid-community" target="_blank"> 1,000,000+</a> npm downloads per week and over <a href="https://github.com/ag-grid/ag-grid/tree/latest" target="_blank"> 12,000</a> Stars on GitHub.</span>`,
            },
            examples: {
                tag: 'How Do I Build a Vue Data Grid with AG Grid?',
                heading: 'Get Started with Vue Data Grid Examples',
                subHeading:
                    'We have a range of examples, tutorials and documentation to help you start building your first Vue Data Grid with AG Grid.',
            },
            faq: {
                tag: 'Vue Data Grid FAQs',
                subHeading: 'Answers to some commonly asked questions when building Vue Data Grids with AG Grid',
            },
        },
        contactFeatures: [
            'Expert technical guidance',
            'Demos & technical walkthroughs',
            'Licencing and pricing information',
            'Response within 24 hours',
        ],
    },
};

export interface CodeExamples {
    basic: {
        code: string;
        language: string;
    };
    custom: {
        code: string;
        language: string;
    };
    advanced: {
        code: string;
        language: string;
    };
}

export const CODE_EXAMPLES: Record<'react' | 'reactDataGrid' | 'angular' | 'javascript' | 'vue', CodeExamples> = {
    react: {
        basic: {
            code: `const GridExample = () => {
    const [rowData, setRowData] = getRowDataJson();
    const [colDefs, setColDefs] = useState<ColDef<IRow>[]>([
        { field: "make" },
        { field: "model" },
        { field: "price" }
    ]);

    return (
        <div style={{height: 500}}>
            <AgGridReact rowData={rowData} columnDefs={colDefs}  />
        </div>
    );
}
`,
            language: 'js',
        },
        custom: {
            code: `import { themeQuartz } from "ag-grid-community"; // or themeBalham, themeAlpine

const myTheme = themeQuartz
    // Customise Theme Parameters
    .withParams({
        spacing: 2,
        foregroundColor: 'rgb(14, 68, 145)',
    })
    // Use Material Icons
    .withPart(iconSetMaterial);

return (
    <AgGridReact theme={myTheme} ... />
)
`,
            language: 'js',
        },
        advanced: {
            code: `const [colDefs, setColDefs] = useState<ColDef<IRow>[]>([
    { field: "make", pivot: true, rowGroup: true, aggFunc: 'sum' },
]);

<AgGridReact
    rowData={rowData}
    columnDefs={colDefs}
    enableCharts={true}
    cellSelection={true}
    masterDetail={true}
    enableAdvancedFilter={true}
    rowGroupPanelShow={true}
    sideBar={true}
/>`,
            language: 'jsx',
        },
    },
    reactDataGrid: {
        basic: {
            code: `const GridExample = () => {
    const [rowData, setRowData] = getRowDataJson();
    const [colDefs, setColDefs] = useState<ColDef<IRow>[]>([
        { field: "make" },
        { field: "model" },
        { field: "price" }
    ]);

    return (
        <div style={{height: 500}}>
            <AgGridReact rowData={rowData} columnDefs={colDefs}  />
        </div>
    );
}
`,
            language: 'js',
        },
        custom: {
            code: `import { themeQuartz } from "ag-grid-community"; // or themeBalham, themeAlpine

const myTheme = themeQuartz
    // Customise Theme Parameters
    .withParams({
        spacing: 2,
        foregroundColor: 'rgb(14, 68, 145)',
    })
    // Use Material Icons
    .withPart(iconSetMaterial);

return (
    <AgGridReact theme={myTheme} ... />
)
`,
            language: 'js',
        },
        advanced: {
            code: `const [colDefs, setColDefs] = useState<ColDef<IRow>[]>([
    { field: "make", pivot: true, rowGroup: true, aggFunc: 'sum' },
]);

<AgGridReact
    rowData={rowData}
    columnDefs={colDefs}
    enableCharts={true}
    cellSelection={true}
    masterDetail={true}
    enableAdvancedFilter={true}
    rowGroupPanelShow={true}
    sideBar={true}
/>`,
            language: 'jsx',
        },
    },
    angular: {
        basic: {
            code: `@Component({
    selector: 'app-grid',
    template: \`<ag-grid-angular
        [rowData]="rowData"
        [columnDefs]="colDefs" />\`
})
export class GridComponent {
    rowData = getRowData();
    colDefs: ColDef[] = [
        { field: "make" },
        { field: "model" },
        { field: "price" }
    ];
}
`,
            language: 'ts',
        },
        custom: {
            code: `import { themeQuartz } from "ag-grid-community"; // or themeBalham, themeAlpine

const myTheme = themeQuartz
    // Customise Theme Parameters
    .withParams({
        spacing: 2,
        foregroundColor: 'rgb(14, 68, 145)',
    })
    // Use Material Icons
    .withPart(iconSetMaterial);

@Component({
    template: \`<ag-grid-angular [theme]="myTheme" ... />\`
})
`,
            language: 'ts',
        },
        advanced: {
            code: `colDefs: ColDef[] = [
    { field: "make", pivot: true, rowGroup: true, aggFunc: 'sum' },
];

<ag-grid-angular
    [rowData]="rowData"
    [columnDefs]="colDefs"
    [enableCharts]="true"
    [cellSelection]="true"
    [masterDetail]="true"
    [enableAdvancedFilter]="true"
    [rowGroupPanelShow]="'always'"
    [sideBar]="true"
/>`,
            language: 'html',
        },
    },
    javascript: {
        basic: {
            code: `const gridOptions = {
    rowData: getRowData(),
    columnDefs: [
        { field: "make" },
        { field: "model" },
        { field: "price" }
    ],
};

const gridDiv = document.querySelector('#myGrid');
createGrid(gridDiv, gridOptions);
`,
            language: 'js',
        },
        custom: {
            code: `import { themeQuartz } from "ag-grid-community"; // or themeBalham, themeAlpine

const myTheme = themeQuartz
    // Customise Theme Parameters
    .withParams({
        spacing: 2,
        foregroundColor: 'rgb(14, 68, 145)',
    })
    // Use Material Icons
    .withPart(iconSetMaterial);

const gridOptions = {
    theme: myTheme,
    // ...
};
`,
            language: 'js',
        },
        advanced: {
            code: `const gridOptions = {
    columnDefs: [
        { field: "make", pivot: true, rowGroup: true, aggFunc: 'sum' },
    ],
    rowData: rowData,
    enableCharts: true,
    cellSelection: true,
    masterDetail: true,
    enableAdvancedFilter: true,
    rowGroupPanelShow: 'always',
    sideBar: true,
};`,
            language: 'js',
        },
    },
    vue: {
        basic: {
            code: `<template>
    <ag-grid-vue
        :rowData="rowData"
        :columnDefs="colDefs"
        style="height: 500px"
    />
</template>

<script setup>
import { ref } from "vue";
import { AgGridVue } from "ag-grid-vue3";

const rowData = ref(getRowData());
const colDefs = ref([
    { field: "make" },
    { field: "model" },
    { field: "price" }
]);
</script>
`,
            language: 'html',
        },
        custom: {
            code: `import { themeQuartz } from "ag-grid-community"; // or themeBalham, themeAlpine

const myTheme = themeQuartz
    // Customise Theme Parameters
    .withParams({
        spacing: 2,
        foregroundColor: 'rgb(14, 68, 145)',
    })
    // Use Material Icons
    .withPart(iconSetMaterial);

<template>
    <ag-grid-vue :theme="myTheme" ... />
</template>
`,
            language: 'js',
        },
        advanced: {
            code: `<template>
    <ag-grid-vue
        :rowData="rowData"
        :columnDefs="colDefs"
        :enableCharts="true"
        :cellSelection="true"
        :masterDetail="true"
        :enableAdvancedFilter="true"
        rowGroupPanelShow="always"
        :sideBar="true"
    />
</template>

<script setup>
const colDefs = ref([
    { field: "make", pivot: true, rowGroup: true, aggFunc: 'sum' },
]);
</script>`,
            language: 'html',
        },
    },
};
