import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'gatsby';
import classnames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import Announcements from '../components/Announcements';
import menuData from '../pages/licensing/menu.json';
import styles from './Menu.module.scss';

const MenuSection = ({ title, items, currentFramework, isActive, toggleActive }) => {
    return <li key={title} className={styles['menu__section']}>
        <div
            onClick={() => toggleActive()}
            onKeyDown={() => toggleActive()}
            role="button"
            tabIndex="0"
            className={styles['menu__section__heading']}>
            <FontAwesomeIcon
                icon={faChevronRight}
                fixedWidth
                rotation={isActive ? 90 : 0}
                className={styles['menu__arrow']}
            />
            {title}
        </div>
        {isActive && <MenuGroup isTopLevel={true} group={{ group: title, items }} currentFramework={currentFramework} />}
    </li>;
};

const MenuGroup = ({ group, currentFramework, isTopLevel = false }) =>
    <ul className={classnames(styles['menu__group'], { [styles['menu__group--top-level']]: isTopLevel })}>
        {group.items
            .filter(item => !item.frameworks || item.frameworks.includes(currentFramework))
            .map(item => <MenuItem key={item.title} item={item} currentFramework={currentFramework} />)
        }
    </ul>;

const MenuItem = ({ item, currentFramework }) => {
    const enterpriseIcon = item.enterprise && <div className={styles['menu__enterprise-icon']}>(e)</div>;
    const title = <>{item.title}{enterpriseIcon}</>;

    return (
        <li key={item.title} className={styles['menu__item']}>
            {item.url
                ? <Link
                    to={item.url.replace('../', `/${currentFramework}/`)}
                    className={styles['menu__item__link']}
                    activeClassName={styles['menu__item__link--active']}>{title}</Link>
                : title
            }
            {item.items && !item.hideChildren && <MenuGroup group={{ group: item.title, items: item.items }} currentFramework={currentFramework} />}
        </li>
    );
};

const Menu = ({ currentFramework, currentPage }) => {
    const [activeSection, setActiveSection] = useState(null);
    const listEl = useRef(null);
    const combinedMenuItems = menuData.reduce((combined, group) => [...combined, ...group.items], []);
    const containsPage = (items, frameworks) => items.reduce(
        (hasPage, item) => {
            const availableFrameworks = item.frameworks || frameworks;

            return hasPage ||
                (item.url === `../${currentPage}/` && (!availableFrameworks || availableFrameworks.includes(currentFramework))) ||
                (item.items && containsPage(item.items, availableFrameworks));
        },
        false);

    useEffect(() => {
        const sectionContainingPage = combinedMenuItems.filter(item => containsPage(item.items))[0];

        // closes the menu when page reloads
        if (listEl.current) {
            listEl.current.classList.remove('show');
        }

        if (sectionContainingPage) {
            setActiveSection(sectionContainingPage.title);
        }
    }, [currentPage, currentFramework]); // eslint-disable-line react-hooks/exhaustive-deps

    return <div className={styles['menu']}>
        <ul id="side-nav" ref={listEl} className={styles['menu__sections']}>
            {combinedMenuItems.map(item => {
                const { title } = item;
                const isActive = title === activeSection;

                return (
                    <MenuSection
                        key={title}
                        title={title}
                        items={item.items}
                        currentFramework={currentFramework}
                        isActive={isActive}
                        toggleActive={() => setActiveSection(isActive ? null : title)}
                    />
                );
            })}
            <Announcements />
        </ul>
    </div>;
};

export default Menu;