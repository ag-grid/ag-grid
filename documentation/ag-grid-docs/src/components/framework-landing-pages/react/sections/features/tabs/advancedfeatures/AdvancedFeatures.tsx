import { Icon } from '@ag-website-shared/components/icon/Icon';
import { Snippet } from '@ag-website-shared/components/snippet/Snippet';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import React from 'react';

import styles from './AdvancedFeatures.module.scss';

const AdvancedFeatures: React.FC = () => {
    const codeExample = `const [colDefs, setColDefs] = useState<ColDef<IRow>[]>([
    { field: "make", pivot: true, rowGroup: true, aggFunc: 'sum' },
]);

<AgGridReact 
    rowData={rowData}
    columnDefs={colDefs}
    enableCharts={true}
    enableRangeSelection={true}
    masterDetail={true}
    enableAdvancedFilter={true}
    rowGroupPanelShow={true}
    sideBar={true}
/>`;

    return (
        <div className={styles.columnContainer}>
            <div className={styles.column}>
                <div className={styles.featureContainer}>
                    <h3 className={styles.title}>Expand</h3>
                    <div className={styles.feature}>
                        <h5 className={styles.featureHeading}>Advanced Features</h5>
                        <span className={styles.featureDetail}>
                            <a href={urlWithBaseUrl('./react-data-grid/integrated-charts/')}>Build charts</a> directly
                            from your react table. Perform data analysis with{' '}
                            <a href={urlWithBaseUrl('./react-data-grid/grouping/')}>row grouping</a>,{' '}
                            <a href={urlWithBaseUrl('./react-data-grid/pivoting/')}>pivoting</a> and{' '}
                            <a href={urlWithBaseUrl('./react-data-grid/master-detail/')}>master/detail</a> features.
                            Access all features from our{' '}
                            <a href={urlWithBaseUrl('./react-data-grid/side-bar/')}>accessory panels</a>.
                        </span>
                    </div>
                    <div className={styles.feature}>
                        <h5 className={styles.featureHeading}>Dedicated Support</h5>
                        <span className={styles.featureDetail}>
                            Access dedicated support via{' '}
                            <a href={urlWithBaseUrl('https://ag-grid.zendesk.com/hc/en-us')}>Zendesk</a>, monitored by
                            our support teams 365 days a year, to help build your perfect React Table.
                        </span>
                    </div>
                    <div className={styles.feature}>
                        <h5 className={styles.featureHeading}>AG Charts</h5>
                        <span className={styles.featureDetail}>
                            Purchase a discounted bundle licence to access all of the advanced features and additional
                            series types available in{' '}
                            <a href={urlWithBaseUrl('https://ag-grid.com/charts/')}>AG Charts</a> Enterprise.
                        </span>
                    </div>
                </div>
            </div>
            <div className={styles.column}>
                <div className={styles.gridContainer}>
                    <Snippet
                        framework={'react'}
                        language={'jsx'}
                        content={codeExample}
                        transform={false}
                        copyToClipboard
                    />
                </div>
            </div>
        </div>
    );
};

export default AdvancedFeatures;
