import type { FooterItem } from '@ag-grid-types';
import { DevToolsToggle } from '@ag-website-shared/components/dev-tools/DevTools';
import { Icon } from '@ag-website-shared/components/icon/Icon';
import { SiteLogo } from '@components/SiteLogo';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import classNames from 'classnames';
import GithubSlugger from 'github-slugger';

import styles from './Footer.module.scss';

interface FooterProps {
    showMicrosoftMessage?: boolean;
    footerItems: FooterItem[];
}

const MenuColumns = ({ footerItems }: { footerItems: FooterItem[] }) => {
    const slugger = new GithubSlugger();

    return footerItems.map(({ title, links }) => {
        // Associate each link list with its (non-heading) title so assistive tech still announces the
        // group label. SE-45 deliberately drops the <h2> to keep these out of the page heading outline.
        const titleId = `footer-${new GithubSlugger().slug(title)}`;
        return (
            <div key={title} className={styles.menuColumn}>
                <span className={styles.menuColumnTitle} id={titleId}>
                    {title}
                </span>
                <ul className="list-style-none" aria-labelledby={titleId}>
                    {links.map(({ name, url, newTab, iconName }: any) => (
                        <li key={`${title}_${name}`}>
                            <a
                                id={`${slugger.slug(name)}-nav`}
                                href={urlWithBaseUrl(url)}
                                {...(newTab ? { target: '_blank', rel: 'noreferrer' } : {})}
                            >
                                {iconName && <Icon name={iconName} />}
                                {name}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        );
    });
};

export const Footer = ({ showMicrosoftMessage, footerItems }: FooterProps) => {
    return (
        <footer className={styles.footer}>
            <div className={classNames(styles.footerColumns, 'layout-grid')}>
                <div className={styles.menuColumn}>
                    <div className={styles.logoContainer}>
                        <SiteLogo />
                    </div>

                    <p className="text-sm">&copy; AG Grid Ltd 2015-{new Date().getFullYear()}</p>

                    <p className="text-sm">
                        <DevToolsToggle>AG Grid Ltd registered</DevToolsToggle> in England&nbsp;&amp;&nbsp;Wales.
                        <br />
                        Company&nbsp;No.&nbsp;07318192.
                        <br />
                        VAT&nbsp;no.&nbsp;GB998360167
                    </p>

                    <p className="text-sm">
                        Registered address
                        <br />
                        AG Grid Ltd
                        <br />
                        70 Wilson Street
                        <br />
                        London
                        <br />
                        EC2A 2DB
                        <br />
                    </p>

                    {showMicrosoftMessage && (
                        <p className="text-sm">
                            The Microsoft logo is a trademark of the Microsoft group of companies.
                        </p>
                    )}
                </div>
                <MenuColumns footerItems={footerItems} />
            </div>
        </footer>
    );
};
