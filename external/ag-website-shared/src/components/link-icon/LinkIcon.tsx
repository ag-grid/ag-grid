import { Icon } from '@ag-website-shared/components/icon/Icon';
import classnames from 'classnames';
import { type AllHTMLAttributes, useEffect, useRef, useState } from 'react';

import styles from './LinkIcon.module.scss';

export function LinkIcon({ className, ...props }: AllHTMLAttributes<HTMLAnchorElement> & { children?: never }) {
    const [linkCopied, setLinkCopied] = useState(false);
    const [linkActive, setlinkActive] = useState(false);
    const copiedTimeoutRef = useRef(null);
    const activeTimeoutRef = useRef(null);

    const onclick = (event) => {
        event.preventDefault();

        const href = event.target.href;

        navigator.clipboard.writeText(href);

        setLinkCopied(true);
        setlinkActive(true);

        if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
        if (activeTimeoutRef.current) clearTimeout(activeTimeoutRef.current);

        copiedTimeoutRef.current = setTimeout(() => {
            setLinkCopied(false);
        }, 2250);

        activeTimeoutRef.current = setTimeout(() => {
            setlinkActive(false);
        }, 2000);
    };

    useEffect(() => {
        return () => {
            clearTimeout(copiedTimeoutRef.current);
            clearTimeout(activeTimeoutRef.current);
        };
    }, []);

    return (
        <a
            aria-label="Heading link"
            {...props}
            className={classnames(
                styles.docsHeaderIcon,
                { [styles.active]: linkActive },
                'button-secondary',
                className
            )}
            onClick={onclick}
        >
            <span className={styles.tooltip}>{linkCopied ? 'Link copied!' : 'Copy'}</span>
            <Icon name="link" />
        </a>
    );
}
