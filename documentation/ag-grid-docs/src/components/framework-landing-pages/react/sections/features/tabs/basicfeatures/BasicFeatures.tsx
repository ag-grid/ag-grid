import { Icon } from '@ag-website-shared/components/icon/Icon';
import { Snippet } from '@ag-website-shared/components/snippet/Snippet';
import React from 'react';

import styles from './BasicFeatures.module.scss';

const BasicFeatures: React.FC = () => {
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
                        <h3 className={styles.title}>Build</h3>
                        <div className={styles.feature}>
                            <h5 className={styles.featureHeading}>Get Started in Minutes</h5>
                            <span className={styles.featureDetail}>
                                Add a React Table with less than 20 lines of code. Choose a <a>theme</a>, add your data,
                                and define your column structure. View the <a>Quick Start</a> to learn more.
                            </span>
                        </div>
                        <div className={styles.feature}>
                            <h5 className={styles.featureHeading}>Handle Millions of Cells</h5>
                            <span className={styles.featureDetail}>
                                Easily handle millions of rows with our <a>Client-Side Row Model</a> or upgrade to
                                enterprise for <a>Infinite Scrolling</a> with our <a>Server-Side Row Model</a>.
                            </span>
                        </div>
                        <div className={styles.feature}>
                            <h5 className={styles.featureHeading}>100s of Features</h5>
                            <span className={styles.featureDetail}>
                                Every feature your can imagine, all in one place: <a>Sorting</a>, <a>filtering</a>,{' '}
                                <a>pagination</a>, and more. Upgrade to enterprise for Advanced Features, like{' '}
                                <a>Integrated Charting</a>, <a>Pivoting</a>, and more.
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
            <div className={styles.buttonContainer}>
                <button className={styles.featureNavButton}>
                    <Icon svgClasses={styles.featureNavIcon} name="arrowLeft" />
                </button>
                <button className={styles.featureNavButton}>
                    <Icon svgClasses={styles.featureNavIcon} name="arrowRight" />
                </button>
            </div>
        </div>
    );
};

export default BasicFeatures;
