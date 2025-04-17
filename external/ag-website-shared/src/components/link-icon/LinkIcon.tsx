import { Icon } from '@ag-website-shared/components/icon/Icon';
import classnames from 'classnames';
import { type AllHTMLAttributes, useEffect, useRef, useState } from 'react';

import styles from './LinkIcon.module.scss';

// TODO bring in styles from OpenIn CTA

export function LinkIcon({
    className,
    exampleLink,
    ...props
}: AllHTMLAttributes<HTMLAnchorElement> & { children?: never; exampleLink?: Boolean }) {
    const [linkCopied, setLinkCopied] = useState(false);
    const [linkActive, setlinkActive] = useState(false);
    const copiedTimeoutRef = useRef(null);
    const activeTimeoutRef = useRef(null);

    const onClick = (event) => {
        event.preventDefault();

        const href = event.target.href;
        const hash = event.target.hash;

        navigator.clipboard.writeText(href);

        history.replaceState({}, '', hash);

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
                styles.linkIcon,
                { [styles.docsHeaderIcon]: !exampleLink, ['button-secondary']: !exampleLink },
                { [styles.exampleIcon]: exampleLink },
                { [styles.active]: linkActive },
                className
            )}
            onClick={onClick}
        >
            <span className={styles.tooltip}>{linkCopied ? 'Link copied!' : 'Copy'}</span>
            <Icon name="link" />
        </a>
    );
}
