import React from 'react';
import { Helmet } from 'react-helmet';
import footerItems from './footer-items.json';
import DocumentationLink from 'components/DocumentationLink';
import styles from './Footer.module.scss';

const SocialMediaButtons = () => (
    <div className={styles.footer__buttons}>
        <div>
            <Helmet>
                <script async defer src="https://buttons.github.io/buttons.js"></script>
            </Helmet>
            <a className="github-button" href="https://github.com/ag-grid/ag-grid" data-show-count="true" aria-label="Star ag-grid on GitHub">Star</a>
        </div>
        <div>
            <Helmet>
                <script async src="https://platform.twitter.com/widgets.js"></script>
            </Helmet>
            <a href="https://twitter.com/ag_grid?ref_src=twsrc%5Etfw" className="twitter-follow-button" data-lang="en" data-show-count="true">Follow @ag_grid</a>
        </div>
    </div>
);

const MenuColumns = ({ framework }) => footerItems.map(({ title, links }) => (
    <div key={title} className={styles['footer__links']}>
        <h3>{title}</h3>
        <ul className={styles['footer__links__list']}>
            {links.map(({ name, url, newTab }) => (
                <li key={`${title}_${name}`}>
                    {url.indexOf('../') === 0 ?
                        <DocumentationLink framework={framework} href={url.replace('../', '/')}>{name}</DocumentationLink> :
                        <a href={url} {...newTab ? { target: '_blank', rel: 'noreferrer' } : {}}>{name}</a>
                    }
                </li>
            ))}
        </ul>
    </div>
));

const Footer = ({ framework }) => (
    <footer className={styles['footer']}>
        <div className={styles['footer__wrapper']}>
            <div className={styles['footer__row']}>
                <MenuColumns framework={framework} />
                <SocialMediaButtons />
            </div>
            <div className={styles['footer__row']}>
                <p>AG Grid Limited registered in the United Kingdom. Company No. 07318192.</p>
                <p>{`\u00A9`} AG Grid Ltd. 2015-{new Date().getFullYear()}</p>
            </div>
        </div>
    </footer>
);

export default Footer;