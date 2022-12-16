import React from 'react';
import footerItems from './footer-items.json';
import DocumentationLink from 'components/DocumentationLink';
import styles from './Footer.module.scss';


const MenuColumns = ({ framework }) => footerItems.map(({ title, links }) => (
    <div key={title} className={styles['footer__links']}>
        <h4>{title}</h4>
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
            </div>
            <div className={styles['footer__row']}>
                <p>AG Grid Ltd registered in the United Kingdom. Company&nbsp;No.&nbsp;07318192.</p>
                <p>&copy; AG Grid Ltd. 2015-{new Date().getFullYear()}</p>
            </div>
        </div>
    </footer>
);

export default Footer;
