import { Icon } from '@ag-website-shared/components/icon/Icon';
import { Snippet } from '@ag-website-shared/components/snippet/Snippet';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import React, { useState } from 'react';

import styles from './EnterpriseFeatures.module.scss';

interface FeatureData {
    id: string;
    title: string;
    features: {
        heading: string;
        detail: React.ReactNode;
    }[];
    codeExample: string;
}

const ENTERPRISE_FEATURES: FeatureData[] = [
    {
        id: 'ai-toolkit',
        title: 'AI Toolkit',
        features: [
            {
                heading: 'Natural Language Control',
                detail: (
                    <>
                        Integrate your LLM with AG Grid to let users{' '}
                        <a href={urlWithBaseUrl('./react-data-grid/ai-toolkit/')}>control grid state via natural language</a>.
                        Filter, sort, group, and manipulate data using conversational queries.
                    </>
                ),
            },
            {
                heading: 'Structured Schema Generation',
                detail: (
                    <>
                        Use <code>getStructuredSchema()</code> to generate LLM-compatible schemas. Works with ChatGPT, Gemini,
                        and any LLM supporting structured outputs.
                    </>
                ),
            },
            {
                heading: 'Full State Manipulation',
                detail: (
                    <>
                        Apply LLM responses directly to the grid with <code>setState()</code>. Supports filtering, sorting,
                        aggregation, pivoting, row grouping, and column visibility.
                    </>
                ),
            },
        ],
        codeExample: `// Get structured schema for your LLM
const schema = gridApi.getStructuredSchema();

// Send user query to LLM with schema
const response = await callLLM(userQuery, gridState, schema);

// Apply LLM response to grid
gridApi.setState(response.gridState, response.propertiesToIgnore);`,
    },
    {
        id: 'ssrm',
        title: 'Server-Side Row Model',
        features: [
            {
                heading: 'Lazy Loading',
                detail: (
                    <>
                        Handle millions of rows by{' '}
                        <a href={urlWithBaseUrl('./react-data-grid/server-side-model/')}>loading data on-demand</a> as users
                        scroll. Perfect for large datasets that cannot fit in browser memory.
                    </>
                ),
            },
            {
                heading: 'Server-Side Operations',
                detail: (
                    <>
                        Perform <a href={urlWithBaseUrl('./react-data-grid/server-side-model-sorting/')}>sorting</a>,{' '}
                        <a href={urlWithBaseUrl('./react-data-grid/server-side-model-filtering/')}>filtering</a>, and{' '}
                        <a href={urlWithBaseUrl('./react-data-grid/server-side-model-grouping/')}>grouping</a> on your server
                        for optimal performance.
                    </>
                ),
            },
            {
                heading: 'Infinite Scrolling',
                detail: (
                    <>
                        Combine with <a href={urlWithBaseUrl('./react-data-grid/infinite-scrolling/')}>infinite scrolling</a>{' '}
                        for seamless data loading. Reduces memory footprint and improves initial load times.
                    </>
                ),
            },
        ],
        codeExample: `<AgGridReact
    rowModelType="serverSide"
    serverSideDatasource={{
        getRows: async (params) => {
            const response = await fetch('/api/data', {
                method: 'POST',
                body: JSON.stringify({
                    startRow: params.request.startRow,
                    endRow: params.request.endRow,
                    sortModel: params.request.sortModel,
                    filterModel: params.request.filterModel,
                }),
            });
            const data = await response.json();
            params.success({ rowData: data.rows, rowCount: data.total });
        },
    }}
/>`,
    },
    {
        id: 'row-grouping',
        title: 'Row Grouping',
        features: [
            {
                heading: 'Multi-Level Grouping',
                detail: (
                    <>
                        <a href={urlWithBaseUrl('./react-data-grid/grouping/')}>Group rows</a> by one or more columns to create
                        hierarchical data views. Users can expand and collapse groups interactively.
                    </>
                ),
            },
            {
                heading: 'Automatic Aggregations',
                detail: (
                    <>
                        Calculate <a href={urlWithBaseUrl('./react-data-grid/aggregation/')}>aggregations</a> automatically
                        with built-in functions (sum, avg, count, min, max) or create custom aggregation functions.
                    </>
                ),
            },
            {
                heading: 'Drag & Drop Grouping',
                detail: (
                    <>
                        Enable <a href={urlWithBaseUrl('./react-data-grid/grouping-group-panel/')}>row group panel</a> to let
                        users drag columns to group data dynamically without code changes.
                    </>
                ),
            },
        ],
        codeExample: `const [columnDefs] = useState([
    { field: 'country', rowGroup: true, hide: true },
    { field: 'sport', rowGroup: true, hide: true },
    { field: 'athlete' },
    { field: 'gold', aggFunc: 'sum' },
    { field: 'silver', aggFunc: 'sum' },
    { field: 'bronze', aggFunc: 'sum' },
]);

<AgGridReact
    columnDefs={columnDefs}
    rowData={rowData}
    groupDefaultExpanded={1}
    rowGroupPanelShow="always"
/>`,
    },
    {
        id: 'master-detail',
        title: 'Master/Detail',
        features: [
            {
                heading: 'Nested Grids',
                detail: (
                    <>
                        Display <a href={urlWithBaseUrl('./react-data-grid/master-detail/')}>hierarchical data</a> with
                        expandable rows. Each detail row contains a fully featured grid with its own columns and features.
                    </>
                ),
            },
            {
                heading: 'Custom Detail Panels',
                detail: (
                    <>
                        Use{' '}
                        <a href={urlWithBaseUrl('./react-data-grid/master-detail-custom-detail/')}>custom detail renderers</a>{' '}
                        to display any content in the detail section - forms, charts, or custom components.
                    </>
                ),
            },
            {
                heading: 'Lazy Loading Details',
                detail: (
                    <>
                        Load detail data on-demand when rows are expanded. Independent configuration for each detail grid
                        including columns, sorting, and filtering.
                    </>
                ),
            },
        ],
        codeExample: `const detailCellRendererParams = {
    detailGridOptions: {
        columnDefs: [
            { field: 'callId' },
            { field: 'direction' },
            { field: 'duration' },
        ],
    },
    getDetailRowData: (params) => {
        params.successCallback(params.data.callRecords);
    },
};

<AgGridReact
    masterDetail={true}
    detailCellRendererParams={detailCellRendererParams}
    columnDefs={columnDefs}
    rowData={rowData}
/>`,
    },
    {
        id: 'integrated-charts',
        title: 'Integrated Charts',
        features: [
            {
                heading: 'User-Created Charts',
                detail: (
                    <>
                        Let users create <a href={urlWithBaseUrl('./react-data-grid/integrated-charts/')}>charts</a> directly
                        from grid data with right-click or cell selection. Powered by AG Charts.
                    </>
                ),
            },
            {
                heading: 'Programmatic Charts',
                detail: (
                    <>
                        Create charts via API with{' '}
                        <a href={urlWithBaseUrl('./react-data-grid/integrated-charts-api/')}>createRangeChart()</a>. Full
                        control over chart type, data range, and customisation.
                    </>
                ),
            },
            {
                heading: 'Chart Customisation',
                detail: (
                    <>
                        Built-in <a href={urlWithBaseUrl('./react-data-grid/integrated-charts-customisation/')}>chart menus</a>{' '}
                        let users change chart types, colors, labels, and more without code changes.
                    </>
                ),
            },
        ],
        codeExample: `<AgGridReact
    enableCharts={true}
    cellSelection={true}
    columnDefs={[
        { field: 'country', chartDataType: 'category' },
        { field: 'gold', chartDataType: 'series' },
        { field: 'silver', chartDataType: 'series' },
    ]}
    rowData={rowData}
/>

// Or create charts programmatically
gridApi.createRangeChart({
    chartType: 'groupedColumn',
    cellRange: {
        columns: ['country', 'gold', 'silver'],
    },
});`,
    },
];

const EnterpriseFeatures: React.FC = () => {
    const [activeTab, setActiveTab] = useState(0);

    const handleTabClick = (index: number) => {
        if (index >= ENTERPRISE_FEATURES.length) {
            setActiveTab(0);
        } else if (index < 0) {
            setActiveTab(ENTERPRISE_FEATURES.length - 1);
        } else {
            setActiveTab(index);
        }
    };

    const activeFeature = ENTERPRISE_FEATURES[activeTab];

    return (
        <div className={styles.container}>
            <div className={styles.tabContainer}>
                {ENTERPRISE_FEATURES.map((feature, index) => (
                    <button
                        key={feature.id}
                        className={`${activeTab === index ? styles.activeTab : styles.tab} plausible-event-name=enterprise-${feature.id}-tab`}
                        onClick={() => handleTabClick(index)}
                    >
                        {feature.title}
                    </button>
                ))}
            </div>
            <div className={styles.contentContainer}>
                <div className={styles.columnContainer}>
                    <div className={styles.column}>
                        <div className={styles.featureContainer}>
                            <h3 className={styles.title}>{activeFeature.title}</h3>
                            {activeFeature.features.map((feature, index) => (
                                <div key={index} className={styles.feature}>
                                    <h5 className={styles.featureHeading}>{feature.heading}</h5>
                                    <span className={styles.featureDetail}>{feature.detail}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={styles.column}>
                        <Snippet
                            framework={'react'}
                            language={'jsx'}
                            content={activeFeature.codeExample}
                            transform={false}
                            copyToClipboard
                        />
                    </div>
                </div>
            </div>
            <div className={styles.buttonContainer}>
                <span
                    onClick={() => handleTabClick(activeTab - 1)}
                    onMouseDown={(e) => e.preventDefault()}
                    role="button"
                    className="icon-button"
                >
                    <Icon svgClasses={styles.featureNavIcon} name="arrowLeft" />
                </span>
                <span
                    onClick={() => handleTabClick(activeTab + 1)}
                    onMouseDown={(e) => e.preventDefault()}
                    role="button"
                    className="icon-button"
                >
                    <Icon svgClasses={styles.featureNavIcon} name="arrowRight" />
                </span>
            </div>
        </div>
    );
};

export default EnterpriseFeatures;
