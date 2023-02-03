import classnames from 'classnames';
import DocumentationLink from 'components/DocumentationLink';
import React from 'react';
import footerItems from './footer-items.json';
import styles from './Footer.module.scss';
import {hostPrefix} from "../../utils/consts";

const MenuColumns = ({ framework = 'javascript' }) =>
    footerItems.map(({ title, links }) => (
        <div key={title} className={styles['menu-column']}>
            <h4 className="thin-text">{title}</h4>
            <ul className="list-style-none">
                {links.map(({ name, url, newTab, iconUrl }) => (
                    <li key={`${title}_${name}`}>
                        {url.indexOf('../') === 0 ? (
                            <DocumentationLink framework={framework} href={url.replace('../', '/')}>
                                {name}
                            </DocumentationLink>
                        ) : (
                            <a href={url} {...(newTab ? { target: '_blank', rel: 'noreferrer' } : {})}>
                                {iconUrl && <img src={`${hostPrefix}/${iconUrl}`} alt={name} />}
                                {name}
                            </a>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    ));

const Footer = ({ framework }) => (
    <footer className={classnames(styles.footer, 'ag-styles')}>
        <div className="page-margin">
            <div className={styles['row']}>
                <MenuColumns framework={framework} />
            </div>
            <div className={styles['row']}>
                <p className="font-size-small thin-text">
                    AG Grid Ltd registered in the United Kingdom. Company&nbsp;No.&nbsp;07318192.
                </p>
                <p className="font-size-small thin-text">&copy; AG Grid Ltd. 2015-{new Date().getFullYear()}</p>
            </div>
        </div>
    </footer>
);

export default Footer;
