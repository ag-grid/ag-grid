import { Icon } from '@ag-website-shared/components/icon/Icon';

import styles from '../DocsExamples.module.scss';

export function EnterpriseHeaderComponent() {
    return (
        <span title="Enterprise">
            <Icon name="enterprise" svgClasses={styles.icon} />
        </span>
    );
}
