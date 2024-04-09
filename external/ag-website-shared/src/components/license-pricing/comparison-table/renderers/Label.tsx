import { Icon } from '@ag-website-shared/components/icon/Icon';

import styles from './ComparisonTableRenderers.module.scss';

export function Label({ value }: { value: { name: string; icon?: string; link: string } }) {
    const iconName: IconName = value.icon;

    return (
        <div className={styles.label}>
            <a href={value.link}>
                {iconName && <Icon name={iconName} />}
                {value.name}
            </a>
        </div>
    );
}
