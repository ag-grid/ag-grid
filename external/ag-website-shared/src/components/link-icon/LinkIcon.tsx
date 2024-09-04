import { Icon } from '@ag-website-shared/components/icon/Icon';
import classnames from 'classnames';
import type { AllHTMLAttributes } from 'react';

import styles from './LinkIcon.module.scss';

export function LinkIcon({ className, ...props }: AllHTMLAttributes<HTMLAnchorElement> & { children?: never }) {
    return (
        <a aria-label="Heading link" {...props} className={classnames(styles.docsHeaderIcon, className)}>
            <Icon name="link" />
        </a>
    );
}
