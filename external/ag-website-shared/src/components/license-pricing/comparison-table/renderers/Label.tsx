import { Icon } from '@ag-website-shared/components/icon/Icon';
import type { IconName } from '@ag-website-shared/components/icon/Icon';
import { resolveSharedUrl } from '@ag-website-shared/utils/resolveSharedUrl';
import { useFrameworkFromStore } from '@utils/hooks/useFrameworkFromStore';
import { urlWithPrefix } from '@utils/urlWithPrefix';

import styles from './ComparisonTableRenderers.module.scss';

export function Label({ value }: { value: { name: string; icon?: IconName; link: string } }) {
    const iconName = value.icon;
    const framework = useFrameworkFromStore();
    const url = urlWithPrefix({ url: resolveSharedUrl({ url: value.link, framework }), framework });

    return (
        <div className={styles.label}>
            <a href={url} target="_blank" rel="noopener noreferrer">
                {iconName && <Icon name={iconName} />}
                {value.name}
            </a>
        </div>
    );
}
