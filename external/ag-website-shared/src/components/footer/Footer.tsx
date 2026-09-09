import type { FooterItem } from '@ag-grid-types';
import { DevToolsToggle } from '@ag-website-shared/components/dev-tools/DevTools';
import { Icon, type IconName } from '@ag-website-shared/components/icon/Icon';
import { SiteLogo } from '@components/SiteLogo';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import classNames from 'classnames';
import GithubSlugger from 'github-slugger';
import type { MouseEvent } from 'react';

import styles from './Footer.module.scss';

/**
 * A footer group renders as a navigation column unless its `placement` moves it into the legal
 * strip or the social icon row. Declared here so a site whose footer type predates `placement`
 * still renders every group as a column.
 */
type FooterGroup = FooterItem & { placement?: 'legal' | 'social' };
type FooterLink = FooterGroup['links'][number];

interface FooterProps {
    showMicrosoftMessage?: boolean;
    footerItems: FooterGroup[];
    /** Short product line shown under the logo. Omit to leave the brand column as logo and socials only. */
    tagline?: string;
}

const toggleCookiesPrefs = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    if (!window.__enzuzoApi) return;

    window.__enzuzoApi.prefCenter.show();
};

const linkAttributes = ({ url, newTab, showCookiesPrefs }: FooterLink) => ({
    href: urlWithBaseUrl(url),
    onClick: showCookiesPrefs ? toggleCookiesPrefs : undefined,
    ...(newTab ? { target: '_blank', rel: 'noreferrer' } : {}),
});

const MenuColumns = ({ columns }: { columns: FooterGroup[] }) => {
    const slugger = new GithubSlugger();

    return columns.map(({ title, links }) => {
        // Associate each link list with its (non-heading) title so assistive tech still announces the
        // group label. SE-45 deliberately drops the <h2> to keep these out of the page heading outline.
        const titleId = `footer-${new GithubSlugger().slug(title)}`;
        return (
            <div key={title} className={styles.menuColumn}>
                <span className={styles.menuColumnTitle} id={titleId}>
                    {title}
                </span>
                <ul className="list-style-none" aria-labelledby={titleId}>
                    {links.map((link) => (
                        <li key={`${title}_${link.name}`}>
                            <a id={`${slugger.slug(link.name)}-nav`} tabIndex={0} {...linkAttributes(link)}>
                                {link.iconName && <Icon name={link.iconName as IconName} />}
                                {link.name}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        );
    });
};

const SocialLinks = ({ group }: { group: FooterGroup }) => {
    const slugger = new GithubSlugger();

    return (
        <ul className={classNames('list-style-none', styles.socialLinks)} aria-label={group.title}>
            {group.links.map((link) => (
                <li key={link.name}>
                    <a
                        id={`${slugger.slug(link.name)}-nav`}
                        tabIndex={0}
                        aria-label={link.name}
                        title={link.name}
                        {...linkAttributes(link)}
                    >
                        {link.iconName ? <Icon name={link.iconName as IconName} /> : link.name}
                    </a>
                </li>
            ))}
        </ul>
    );
};

// Separators between the links are drawn in CSS so they stay out of the accessibility tree.
const LegalLinks = ({ group }: { group: FooterGroup }) => {
    const slugger = new GithubSlugger();

    return (
        <ul className={classNames('list-style-none', styles.legalLinks)} aria-label={group.title}>
            {group.links.map((link) => (
                <li key={link.name}>
                    <a id={`${slugger.slug(link.name)}-nav`} tabIndex={0} {...linkAttributes(link)}>
                        {link.name}
                    </a>
                </li>
            ))}
        </ul>
    );
};

export const Footer = ({ showMicrosoftMessage, footerItems, tagline }: FooterProps) => {
    const columns = footerItems.filter((item) => !item.placement);
    const socialGroup = footerItems.find((item) => item.placement === 'social');
    const legalGroup = footerItems.find((item) => item.placement === 'legal');

    return (
        <footer className={styles.footer}>
            <div className={styles.footerInner}>
                <div className={styles.footerColumns}>
                    <div className={styles.brandColumn}>
                        <div className={styles.logoContainer}>
                            <SiteLogo />
                        </div>
                        {tagline && <p className={classNames('text-sm', styles.tagline)}>{tagline}</p>}
                        {socialGroup && <SocialLinks group={socialGroup} />}
                    </div>
                    <MenuColumns columns={columns} />
                </div>

                <div className={styles.legalBar}>
                    <div className={classNames('text-sm', styles.legalInfo)}>
                        <p>
                            &copy; AG Grid Ltd 2015&ndash;{new Date().getFullYear()}
                            <span className={styles.legalInfoSeparator}> &middot; </span>
                            Company&nbsp;No.&nbsp;07318192
                            <span className={styles.legalInfoSeparator}> &middot; </span>
                            VAT&nbsp;no.&nbsp;GB998360167
                        </p>
                        <p>
                            <DevToolsToggle>AG Grid Ltd registered</DevToolsToggle> in England&nbsp;&amp;&nbsp;Wales
                            <span className={styles.legalInfoSeparator}> &middot; </span>
                            70&nbsp;Wilson&nbsp;Street, London&nbsp;EC2A&nbsp;2DB
                        </p>
                        {showMicrosoftMessage && (
                            <p>The Microsoft logo is a trademark of the Microsoft group of companies.</p>
                        )}
                    </div>
                    {legalGroup && <LegalLinks group={legalGroup} />}
                </div>
            </div>
        </footer>
    );
};
