import { Icon } from '@ag-website-shared/components/icon/Icon';
import classnames from 'classnames';
import type { AllHTMLAttributes } from 'react';

import styles from './LinkIcon.module.scss';

export function LinkIcon({ className, ...props }: AllHTMLAttributes<HTMLAnchorElement> & { children?: never }) {
    return (
        <a {...props} className={classnames(styles.docsHeaderIcon, className)} aria-label="Heading link">
            <Icon name="link" />
        </a>
    );
}
