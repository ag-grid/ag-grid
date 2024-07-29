import { Icon } from '@ag-website-shared/components/icon/Icon';
import { Snippet } from '@ag-website-shared/components/snippet/Snippet';
import React from 'react';

import styles from './AdvancedFeatures.module.scss';

const AdvancedFeatures: React.FC = () => {
    const codeExample = `const GridExample = () => {
    const [rowData, setRowData] = getRowDataJson();
    const [colDefs, setColDefs] = useState<ColDef<IRow>[]>([
        { field: "make" }, { field: "model" },
        { field: "price" }, { field: "electric" }
    ]);
    
    return (
        <div className={"ag-theme-quartz-dark"}>
            <AgGridReact 
                rowData={rowData}
                columnDefs={colDefs}
            />
        </div>
    );`;

    return (
        <div className={styles.container}>
            <div className={styles.columnContainer}>
                <div className={styles.column}>
                    <div className={styles.featureContainer}>
                        <h3 className={styles.title}>Expand</h3>
                        <div className={styles.feature}>
                            <h5 className={styles.featureHeading}>Advanced Features</h5>
                            <span className={styles.featureDetail}>
                                Build charts directly from your react table. Perform intensive data analysis with row
                                grouping, pivoting and master/detail. Easily access all features with our accessory
                                panels.
                            </span>
                        </div>
                        <div className={styles.feature}>
                            <h5 className={styles.featureHeading}>Dedicated Support</h5>
                            <span className={styles.featureDetail}>
                                Access dedicated support via Zendesk, monitored by our support teams 365 days a year, to
                                help build your perfect react table.
                            </span>
                        </div>
                        <div className={styles.feature}>
                            <h5 className={styles.featureHeading}>AG Charts</h5>
                            <span className={styles.featureDetail}>
                                Purchase a discounted bundle licence to access all of the advanced features and
                                additional series types available in <a>AG Charts Enterprise</a>
                            </span>
                        </div>
                    </div>
                </div>
                <div className={styles.column}>
                    <div className={styles.gridContainer}>
                        <Snippet framework={'react'} language={'js'} content={codeExample} transform={false} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdvancedFeatures;
