import { Icon } from '@ag-website-shared/components/icon/Icon';
import classnames from 'classnames';
import { type AllHTMLAttributes, useEffect, useRef, useState } from 'react';

import styles from './LinkIcon.module.scss';

export function LinkIcon({ className, ...props }: AllHTMLAttributes<HTMLAnchorElement> & { children?: never }) {
    const [linkCopied, setLinkCopied] = useState(false);
    const timeoutRef = useRef(null);

    const onclick = (event) => {
        event.preventDefault();

        const href = event.target.href;

        navigator.clipboard.writeText(href);

        setLinkCopied(true);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            setLinkCopied(false);
        }, 2000);
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return (
        <a
            aria-label="Heading link"
            {...props}
            className={classnames(
                styles.docsHeaderIcon,
                { [styles.active]: linkCopied },
                'button-secondary',
                className
            )}
            onClick={onclick}
        >
            <span className={styles.tooltip}>{linkCopied ? 'Link copied' : 'Copy'}</span>
            <Icon name="link" />
        </a>
    );
}
