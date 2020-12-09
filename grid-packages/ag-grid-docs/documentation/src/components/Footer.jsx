import React from 'react';
import { Helmet } from 'react-helmet';
import styles from './Footer.module.scss';

const Footer = ({ framework }) => (
    <div className={styles.footer}>
        <div className={styles.footer__links}>
            <h3>Documentation</h3>
            <ul className={styles.footer__links__list}>
                <li><a href={`/${framework}/getting-started/`}>Getting Started</a></li>
                <li><a href="/ag-grid-changelog/">Changelog</a></li>
                <li><a href="/ag-grid-pipeline/">Pipeline</a></li>
                <li><a href="/archive/">Documentation Archive</a></li>
            </ul>
        </div>
        <div className={styles.footer__links}>
            <h3>SUPPORT & COMMUNITY</h3>
            <ul className={styles.footer__links__list}>
                <li><a href="https://stackoverflow.com/questions/tagged/ag-grid" target="_blank">Stackoverflow</a></li>
                <li><a href="/license-pricing.php">License & Pricing</a></li>
                <li><a href="https://ag-grid.zendesk.com/" tartget="_blank">Support via Zendesk</a></li>
            </ul>
        </div>
        <div className={styles.footer__links}>
            <h3>THE COMPANY</h3>
            <ul className={styles.footer__links__list}>
                <li><a href="/about.php">About</a></li>
                <li><a href="https://blog.ag-grid.com/?_ga=2.213149716.106872681.1607518091-965402545.1605286673">Blog</a></li>
                <li><a href="/privacy.php">Privacy Policy</a></li>
                <li><a href="/cookies.php">Cookies Policy</a></li>
            </ul>
        </div>
        <div className={styles.footer__buttons}>
            <div>
                <Helmet>
                    <script async defer src="https://buttons.github.io/buttons.js"></script>
                </Helmet>
                <a class="github-button" href="https://github.com/ntkme/github-buttons" data-show-count="true" aria-label="Star ntkme/github-buttons on GitHub">Star</a>
            </div>
            <div>
                <Helmet>
                    <script async src="https://platform.twitter.com/widgets.js"></script>
                </Helmet>
                <a href="https://twitter.com/ag_grid?ref_src=twsrc%5Etfw" class="twitter-follow-button" data-lang="en" data-show-count="true">Follow @ag_grid</a>
            </div>
        </div>
    </div>
);

export default Footer;