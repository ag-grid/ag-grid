import { Icon } from '@ag-website-shared/components/icon/Icon';
import classnames from 'classnames';
import { type AllHTMLAttributes, useEffect, useRef, useState } from 'react';

import ctaStyles from '../open-in-cta/OpenInCTA.module.scss';
import linkStyles from './LinkIcon.module.scss';

export function LinkIcon({
    className,
    exampleLink,
    ...props
}: AllHTMLAttributes<HTMLAnchorElement> & { children?: never; exampleLink?: boolean }) {
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

    const aStyles = exampleLink ? ctaStyles.cta : [linkStyles.docsHeaderIcon, 'button-secondary'];
    const tooltipStyles = exampleLink ? ctaStyles.tooltip : linkStyles.tooltip;

    return (
        <a
            aria-label="Heading link"
            {...props}
            className={classnames(linkStyles.linkIcon, aStyles, { [linkStyles.active]: linkActive }, className)}
            onClick={onClick}
        >
            <span className={tooltipStyles}>{linkCopied ? 'Link copied!' : 'Copy'}</span>
            <Icon name="link" />
        </a>
    );
}
