import { Icon } from '@ag-website-shared/components/icon/Icon';
import { Snippet } from '@ag-website-shared/components/snippet/Snippet';
import React from 'react';

import styles from './CustomFeatures.module.scss';

const CustomFeatures: React.FC = () => {
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
                        <h3 className={styles.title}>Customise</h3>
                        <div className={styles.feature}>
                            <h5 className={styles.featureHeading}>100+ CSS Variables</h5>
                            <span className={styles.featureDetail}>
                                Customise every part of your react table with over <a>100 CSS variables</a> or create
                                your own theme entirely with our <a>Theme Builder</a> or <a>Figma Design System</a>.
                            </span>
                        </div>
                        <div className={styles.feature}>
                            <h5 className={styles.featureHeading}>4 Default Themes</h5>
                            <span className={styles.featureDetail}>
                                Choose from four themes, each available in light and dark modes, including our new{' '}
                                <a>Quartz</a> and <a>Material Dark</a> themes.
                            </span>
                        </div>
                        <div className={styles.feature}>
                            <h5 className={styles.featureHeading}>Custom Components</h5>
                            <span className={styles.featureDetail}>
                                Override the default rendering of any part of the grid with your own{' '}
                                <a>React Components</a>. Add buttons to cells, define your own filtering logic, and add
                                custom functionality.
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

export default CustomFeatures;
