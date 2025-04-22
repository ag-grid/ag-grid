import type { Framework } from '@ag-grid-types';
import fwLogos from '@ag-website-shared/images/fw-logos';

import type { CustomCellRendererProps } from 'ag-grid-react';

import styles from '../DocsExamples.module.scss';

type Props = CustomCellRendererProps & {
    framework: Framework;
};

export function FrameworkLogoCellRenderer({ framework }: Props) {
    return <img src={fwLogos[framework]} alt={framework} className={styles.frameworkLogo} />;
}
