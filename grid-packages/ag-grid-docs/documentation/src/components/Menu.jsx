import classnames from 'classnames';
import React, { useState, useMemo, useCallback } from 'react';
import { Link } from 'gatsby';
import { Icon } from 'components/Icon';
import convertToFrameworkUrl from 'utils/convert-to-framework-url';
import { Collapsible } from './Collapsible';
import menuData from '../../doc-pages/licensing/menu.json';
import styles from './Menu.module.scss';

const DOCS_BUTTON_ID = 'top-bar-docs-button';

const sectionHasPath = (sec, urlPath) => urlPath === sec.url || (sec.items || []).some(item => sectionHasPath(item, urlPath));

const toElementId = str => {
    return 'menu-' + str.toLowerCase()
        .replace(/[&/]/g, '')  // Remove & and / characters
        .replace(/\s+/g, '-')  // Replace spaces with hyphens
};

const MenuSection = ({ title, items, currentFramework, isActive, toggleActive, activeParentItems }) => {
    const buttonClasses = classnames(styles.sectionHeader, 'button-style-none', { [styles.active]: isActive });
    const iconClasses = classnames(styles.sectionIcon, { [styles.active]: isActive });

    const elementId = useMemo(() => toElementId(title), [title]);

    return (
        <li className={styles.menuSection}>
            <button onClick={toggleActive} tabIndex="0" className={buttonClasses} aria-expanded={isActive} aria-controls={`#${elementId}`}>
                <Icon name="chevronRight" svgClasses={iconClasses} />
                {title}
            </button>
            <MenuGroup group={{ group: title, items }} currentFramework={currentFramework} isTopLevel={true} isActive={isActive} activeParentItems={activeParentItems} />
        </li>
    );
}

const MenuGroup = React.memo(({ group, currentFramework, isTopLevel, isActive, activeParentItems }) => {
    const { items } = group;

    // using memo here as filtered items only change when switching frameworks.
    const filteredItems = useMemo(() => {
        return items.filter(item => !item.menuHide && (!item.frameworks || item.frameworks.includes(currentFramework)));
    }, [items, currentFramework]);

    const topLevelElementId = isTopLevel ? toElementId(group.group) : null;

    return (
        <Collapsible id={topLevelElementId} isDisabled={!isTopLevel} isOpen={isTopLevel && isActive}>
            <ul id={topLevelElementId} className={classnames(styles.menuGroup, 'list-style-none')}>
                {filteredItems.map(item => (
                    <MenuItem
                        key={item.title}
                        item={item}
                        currentFramework={currentFramework}
                        activeParentItems={activeParentItems}
                    />
                ))}
            </ul>
        </Collapsible>
    );
});

const MenuItem = ({ item, currentFramework, activeParentItems }) => {
    const enterpriseIcon = item.enterprise && (
        <span className={styles.enterpriseIcon}>
            (e)
            <Icon name="enterprise" />
        </span>
    );
    const title = (
        <>
            {item.title}&nbsp;{enterpriseIcon}
        </>
    );

    const isActiveParent = useMemo(() => activeParentItems.some((parentItem) => {
        const hasUrl = Boolean(parentItem.url);
        return hasUrl ? parentItem.url === item.url : parentItem.title === item.title;
    }), [item, activeParentItems]);

    const handleClick = () => {
        const docsButton = document.getElementById(DOCS_BUTTON_ID);
        const docsButtonIsVisible = Boolean(
            docsButton.offsetWidth || docsButton.offsetHeight || docsButton.getClientRects().length
        );
        const isOpen = !docsButton.classList.contains('collapsed');
        if (isOpen && docsButtonIsVisible) {
            docsButton.click();
        }
    };

    return (
        <li key={item.title}>
            {item.url ? (
                <Link
                    to={convertToFrameworkUrl(item.url, currentFramework)}
                    activeClassName={styles.activeMenuItem}
                    className={isActiveParent ? styles.activeItemParent : undefined}
                    onClick={handleClick}  // Added handleClick function here
                >
                    {title}
                </Link>
            ) : (
                <span
                    className={classnames(
                        styles.groupLabel,
                        isActiveParent ? styles.activeItemParent : undefined,
                        'text-secondary'
                    )}
                >
                    {title}
                </span>
            )}
            {item.items && !item.hideChildren && (
                <MenuGroup
                    group={{ group: item.title, items: item.items }}
                    currentFramework={currentFramework}
                    activeParentItems={activeParentItems}
                />
            )}
        </li>
    );
};

const Menu = ({ currentFramework, path }) => {
    const [activeSection, setActiveSection] = useState(null);

    const pathSegment = `/${path.split('/').reverse()[1]}/`;
    const activeParentItems = useMemo(() => {
        return menuData.flatMap(section => {
            const getFullPath = (sec, urlPath) =>
                (sec.items || []).flatMap(item =>
                    sectionHasPath(item, urlPath) ? [item, ...getFullPath(item, urlPath)] : []
                );

            return sectionHasPath(section, pathSegment) ? [section, ...getFullPath(section, pathSegment)] : [];
        }).filter(Boolean);
    }, [path]);

    return (
        <nav className={classnames(styles.menu, 'font-size-responsive')}>
            <ul id="side-nav" className={classnames(styles.menuInner, 'list-style-none', 'collapse')}>
                {menuData.map((sectionItem, index) => (
                    <React.Fragment key={sectionItem.group}>
                        <h4>{sectionItem.group}</h4>
                        {sectionItem.items.map((item) => {
                            const { title, items } = item;
                            const isActive = title === activeSection;

                            const toggleActive = useCallback(() => {
                                setActiveSection(prevActive => (prevActive === title ? null : title));
                            }, [title]);

                            return (
                                <MenuSection
                                    key={`${title}-menu`}
                                    title={title}
                                    items={items}
                                    currentFramework={currentFramework}
                                    isActive={isActive}
                                    toggleActive={toggleActive.bind(null, title, isActive)}
                                    activeParentItems={activeParentItems}
                                />
                            );
                        })}
                        {index < menuData.length - 1 && <hr />}
                    </React.Fragment>
                ))}
            </ul>
        </nav>
    );
};

export default Menu;
