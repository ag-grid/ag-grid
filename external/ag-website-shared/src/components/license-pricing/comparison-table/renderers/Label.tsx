import { Icon, type IconName } from '@ag-website-shared/components/icon/Icon';
import { useFrameworkFromStore } from '@utils/hooks/useFrameworkFromStore';
import { urlWithPrefix } from '@utils/urlWithPrefix';

import styles from './ComparisonTableRenderers.module.scss';

export function Label({ value }: { value: { name: string; icon?: IconName; link: string } }) {
    const iconName = value.icon;
    const framework = useFrameworkFromStore();
    const url = urlWithPrefix({ url: value.link, framework });

    return (
        <div className={styles.label}>
            <a href={url}>
                {iconName && <Icon name={iconName} />}
                {value.name}
            </a>
        </div>
    );
}
