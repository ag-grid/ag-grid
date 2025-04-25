import { Icon } from '@ag-website-shared/components/icon/Icon';

import styles from '../DocsExamples.module.scss';

export function ChartsHeaderComponent() {
    return (
        <span title="Integrated Charts">
            <Icon name="chartsColumn" svgClasses={styles.icon} />
        </span>
    );
}
