import { $copyFrameworkAgnosticLinks } from '@ag-website-shared/components/dev-tools/stores/devToolsStore';
import { Icon } from '@ag-website-shared/components/icon/Icon';
import { getFrameworkRedirectUrl } from '@ag-website-shared/utils/getFrameworkRedirectUrl';
import { replaceHistoryUrl } from '@ag-website-shared/utils/historyUrl';
import { useStoreSsr } from '@utils/hooks/useStoreSsr';
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
    const copyFrameworkAgnosticLinks = useStoreSsr($copyFrameworkAgnosticLinks, false);

    const onClick = (event) => {
        event.preventDefault();

        const { href, hash } = event.currentTarget;
        const redirectUrl = copyFrameworkAgnosticLinks ? getFrameworkRedirectUrl(href) : undefined;

        navigator.clipboard.writeText(redirectUrl ?? href);

        replaceHistoryUrl(hash);

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
    const copyLabel = copyFrameworkAgnosticLinks ? 'Copy Redirect Link' : 'Copy Link';

    return (
        <a
            aria-label="Heading link"
            tabIndex={0}
            {...props}
            className={classnames(linkStyles.linkIcon, aStyles, { [linkStyles.active]: linkActive }, className)}
            onClick={onClick}
        >
            <span className={tooltipStyles}>{linkCopied ? 'Link copied!' : copyLabel}</span>
            <Icon name="link" />
        </a>
    );
}
