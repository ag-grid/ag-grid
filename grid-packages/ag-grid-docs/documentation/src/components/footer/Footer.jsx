import React from 'react';
import { Helmet } from 'react-helmet';
import footerItems from './footerItems.json';
import styles from './Footer.module.scss';

const replaceFramework = (url, framework) => url.replace('{framework}', framework);

const SocialMediaButtons = () => (
    <div className={ styles.footer__buttons }>
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

const MenuColumns = ({ framework }) => footerItems.map(item => (
    <div key={ item.title.replace(/\s/g,'_').toLocaleLowerCase() } className={ styles.footer__links }>
        <h3>{ item.title }</h3>
        <ul className={ styles.footer__links__list }>
            {item.links.map(link => (
                <li key={`${item.title}_${link.name}`.replace(/\s/g,'_').toLocaleLowerCase()}>
                    <a href={ replaceFramework(link.url, framework) } target={ link.newTab ? '_blank' : ''}>
                        { link.name }
                    </a>
                </li>
            ))}
        </ul>
    </div>
));

const Footer = ({ framework }) => (
    <footer className={ styles.footer }>
        <div className={ styles.footer__wrapper }>
            <div className={ styles.footer__row }>
                <MenuColumns framework={ framework } />
                <SocialMediaButtons />
            </div>
            <div className={ styles.footer__row}>
                <p>ag-Grid Limited registered in the United Kingdom. Company No. 07318192.</p>
                <p>{`\u00A9`} ag-Grid Ltd. 2015-{new Date().getFullYear()}</p>
            </div>
        </div>
    </footer>
);

export default Footer;