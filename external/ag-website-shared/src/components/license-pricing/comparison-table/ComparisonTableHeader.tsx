import classnames from 'classnames';
import type { CSSProperties, FunctionComponent } from 'react';

import styles from './ComparisonTable.module.scss';

export interface ComparisonTableColumn {
    name: string;
    subHeading: string;
}

/**
 * Column headings for the feature-comparison table. The table is rendered as one
 * `ComparisonTable` per feature group, so the headings live here — above all of them —
 * rather than repeating for every group. Cells reuse `ComparisonTable`'s own row and cell
 * classes so their widths stay locked to the body rows.
 */
export const ComparisonTableHeader: FunctionComponent<{ columns: ComparisonTableColumn[] }> = ({ columns }) => {
    // The leading column is the feature-label column, which has no heading.
    const numColumns = { '--num-columns': columns.length + 1 } as CSSProperties;

    // No table/row/columnheader roles: `ComparisonTable` itself is plain divs, so a row role here
    // would have no table to belong to and would be reported wrongly rather than not at all.
    return (
        <div className={styles.headerRow} style={numColumns}>
            <div className={styles.cell} />

            {columns.map(({ name, subHeading }) => (
                <div className={classnames(styles.cell, styles.headerCell)} key={name}>
                    <span className={styles.headerName}>{name}</span>
                    <span className={styles.headerSubHeading}>{subHeading}</span>
                </div>
            ))}
        </div>
    );
};
