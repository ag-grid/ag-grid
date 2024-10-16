import { Snippet } from '@ag-website-shared/components/snippet/Snippet';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import React from 'react';

import styles from '../FeatureTabs.module.scss';

const BasicFeatures: React.FC = () => {
    const codeExample = `const GridExample = () => {
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
`;

    return (
        <div className={styles.columnContainer}>
            <div className={styles.column}>
                <div className={styles.featureContainer}>
                    <h3 className={styles.title}>Build</h3>
                    <div className={styles.feature}>
                        <h5 className={styles.featureHeading}>Get Started in Minutes</h5>
                        <span className={styles.featureDetail}>
                            Add a React Table with less than 20 lines of code. Choose a{' '}
                            <a href={urlWithBaseUrl('./react-data-grid/themes/')}>theme</a>, add your data, and define
                            your column structure. View the{' '}
                            <a href={urlWithBaseUrl('./react-data-grid/getting-started/')}>Quick Start</a> to learn
                            more.
                        </span>
                    </div>
                    <div className={styles.feature}>
                        <h5 className={styles.featureHeading}>Handle Millions of Cells</h5>
                        <span className={styles.featureDetail}>
                            Easily handle millions of rows with our{' '}
                            <a href={urlWithBaseUrl('./react-data-grid/row-models/#client-side')}>
                                Client-Side Row Model
                            </a>{' '}
                            or upgrade to enterprise for{' '}
                            <a href={urlWithBaseUrl('./react-data-grid/infinite-scrolling/')}>Infinite Scrolling</a>{' '}
                            with our{' '}
                            <a href={urlWithBaseUrl('./react-data-grid/server-side-model/')}>Server-Side Row Model</a>.
                        </span>
                    </div>
                    <div className={styles.feature}>
                        <h5 className={styles.featureHeading}>100s of Features</h5>
                        <span className={styles.featureDetail}>
                            Enable complex features with single properties, including:{' '}
                            <a href={urlWithBaseUrl('./react-data-grid/row-sorting/#sorting')}>Sorting</a>,{' '}
                            <a href={urlWithBaseUrl('./react-data-grid/filtering/')}>Filtering</a>,{' '}
                            <a href={urlWithBaseUrl('./react-data-grid/cell-editing/')}>Cell Editing</a>,{' '}
                            <a href={urlWithBaseUrl('./react-data-grid/csv-export/')}>CSV Export</a>,{' '}
                            <a href={urlWithBaseUrl('./react-data-grid/row-pagination/')}>Pagination</a>,{' '}
                            <a href={urlWithBaseUrl('./react-data-grid/row-selection/')}>Row Selection</a>, and{' '}
                            <a href={urlWithBaseUrl('./react-data-grid/accessibility/')}>Accessibility</a>.
                        </span>
                    </div>
                </div>
            </div>
            <div className={styles.column}>
                <Snippet framework={'react'} language={'js'} content={codeExample} transform={false} copyToClipboard />
            </div>
        </div>
    );
};

export default BasicFeatures;
