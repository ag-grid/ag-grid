import classnames from 'classnames';
import React, {useState, useEffect, useMemo, useCallback} from 'react';
import {Link} from 'gatsby';
import {Icon} from 'components/Icon';
import convertToFrameworkUrl from 'utils/convert-to-framework-url';
import {Collapsible} from './Collapsible';
import styles from './Menu.module.scss';
import {toElementId, getActiveParentItems, getFilteredMenuData} from './menuUtils';

const useDocsButtonState = () => {
    const [isDocsButtonOpen, setIsDocsButtonOpen] = useState(true);
    return [isDocsButtonOpen, setIsDocsButtonOpen];
};

const Menu = ({ currentFramework, path, menuData, expandAllGroups = false, hideChevrons = false }) => {
    const [isDocsButtonOpen, setIsDocsButtonOpen] = useDocsButtonState();

    const defaultActiveSections = expandAllGroups
        ? new Set(menuData.map(group => group.items.map(item => item.title)).flat())
        : new Set();

    const whatsNewLink = menuData.find(item => item.whatsNewLink);
    menuData = menuData.filter(item => !item.whatsNewLink);

    const [activeSections, setActiveSections] = useState(defaultActiveSections);
    const activeParentItems = getActiveParentItems(menuData, path);
    const filteredMenuData = getFilteredMenuData(menuData, currentFramework, path);

    const toggleActive = (title) => {
        setActiveSections((prev) => prev.has(title) ? new Set() : new Set([title]));
    };

    const collapseAllGroups = useCallback(() => {
        setActiveSections(new Set());
    }, []);

    return (
        <nav className={classnames(styles.menu, 'font-size-responsive')}>
            {whatsNewLink && (
                <div className={styles.whatsNewLink}>
                    <Link
                        to={convertToFrameworkUrl(whatsNewLink.url, currentFramework)}
                        onClick={collapseAllGroups}
                    >
                        {whatsNewLink.title}
                    </Link>
                </div>
            )}

            <ul id="side-nav" className={classnames(styles.menuInner, 'list-style-none', 'collapse')}>
                {filteredMenuData.map(({group, items}, index) => (
                    <React.Fragment key={group}>

                        <h5>{group}</h5>
                        {items.map(({title, items: childItems}) => (
                            <MenuSection
                                key={`${title}-menu`}
                                title={title}
                                items={childItems}
                                currentFramework={currentFramework}
                                toggleActive={() => toggleActive(title)}
                                activeParentItems={activeParentItems}
                                setActiveSections={setActiveSections}
                                activeSections={activeSections}
                                isDocsButtonOpen={isDocsButtonOpen}
                                setIsDocsButtonOpen={setIsDocsButtonOpen}
                                hideChevrons={hideChevrons}
                            />
                        ))}
                        {index < filteredMenuData.length - 1 && <hr/>}
                    </React.Fragment>
                ))}
            </ul>
        </nav>
    );
};

const MenuSection = ({title, items, currentFramework, activeParentItems, toggleActive, activeSections, setActiveSections, hideChevrons}) => {
    const [shouldAutoExpand, setShouldAutoExpand] = useState(false);
    const [isDocsButtonOpen, setIsDocsButtonOpen] = useDocsButtonState();

    const isActive = activeSections.has(title);

    const buttonClasses = classnames(styles.sectionHeader, 'button-style-none', {[styles.active]: isActive});
    const iconClasses = classnames(styles.sectionIcon, {[styles.active]: isActive});
    const elementId = toElementId(title);

    useEffect(() => {
        const isParentActive = activeParentItems.some(item => item.title === title);
        setShouldAutoExpand(isParentActive);
    }, [activeParentItems, title]);

    useEffect(() => {
        if (shouldAutoExpand) {
            setActiveSections((prev) => {
                const newSet = new Set(prev);
                newSet.add(title);
                return newSet;
            });
        }
    }, [shouldAutoExpand]);

    const handleToggle = () => {
        if (!hideChevrons) {
            toggleActive(title);
        }
    };

    return (
        <li className={styles.menuSection}>
            <button onClick={handleToggle} tabIndex="0" className={buttonClasses} aria-expanded={isActive}
                    aria-controls={`#${elementId}`}>
                {!hideChevrons && <Icon name="chevronRight" svgClasses={iconClasses}/>}
                {title}
            </button>
            <MenuGroup
                group={{group: title, items}}
                currentFramework={currentFramework}
                isTopLevel={true}
                isActive={isActive}
                activeParentItems={activeParentItems}
                isDocsButtonOpen={isDocsButtonOpen}
                setIsDocsButtonOpen={setIsDocsButtonOpen}
            />
        </li>
    );
}

const MenuGroup = ({group, currentFramework, isTopLevel, isActive, activeParentItems}) => {
    const [isDocsButtonOpen, setIsDocsButtonOpen] = useDocsButtonState();

    const {items} = group;

    // `useMemo` is worth it here as filtered items only change when switching frameworks.
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
                        isDocsButtonOpen={isDocsButtonOpen}
                        setIsDocsButtonOpen={setIsDocsButtonOpen}
                    />
                ))}
            </ul>
        </Collapsible>
    );
}

const MenuItem = ({item, currentFramework, activeParentItems}) => {
    const [isDocsButtonOpen, setIsDocsButtonOpen] = useDocsButtonState();

    const isActiveParent = useMemo(() => activeParentItems.some(parentItem => {
        return parentItem.url ? parentItem.url === item.url : parentItem.title === item.title;
    }), [item, activeParentItems]);

    return (
        <li>
            {item.url ? (
                <Link
                    to={convertToFrameworkUrl(item.url, currentFramework)}
                    activeClassName={styles.activeMenuItem}
                    className={isActiveParent ? styles.activeItemParent : undefined}
                    onClick={() => isDocsButtonOpen && setIsDocsButtonOpen(false)}
                >
                    {item.title}
                    {item.enterprise && (
                        <span className={styles.enterpriseIcon}>
                            (e)
                            <Icon name="enterprise"/>
                        </span>
                    )}
                </Link>
            ) : (
                <span
                    className={classnames(styles.groupLabel, isActiveParent && styles.activeItemParent, 'text-secondary')}>
                    {item.title}
                </span>
            )}
            {item.items && !item.hideChildren && (
                <MenuGroup
                    group={{group: item.title, items: item.items}}
                    currentFramework={currentFramework}
                    activeParentItems={activeParentItems}
                    isDocsButtonOpen={isDocsButtonOpen}
                    setIsDocsButtonOpen={setIsDocsButtonOpen}
                />
            )}
        </li>
    );
};

export default Menu;