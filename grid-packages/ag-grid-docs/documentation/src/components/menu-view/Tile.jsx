import React, { Fragment, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import classnames from 'classnames';
import icons from './icons';
import DocumentationLink from 'components/DocumentationLink';
import styles from './Tile.module.scss';

const recursiveRender = (items, framework, collapsed, level = 0, isLast, forceTopLevel) => items.map((item, idx) => {
    if (item.frameworks && item.frameworks.indexOf(framework) === - 1) { return null; }

    const className = `menu-view-tile__list__${level === 0 || forceTopLevel ? 'block' : 'inline'}`;
    const hideComma = level === 0 || forceTopLevel;

    const title = item.url && (!collapsed || item.showInCollapsed) && (
        <span className={styles[className]}>
            <DocumentationLink href={item.url} framework={framework}>{item.title}{item.enterprise && <enterprise-icon />}</DocumentationLink>
            {!hideComma && <span className={styles['menu-view-tile__item-split']} style={{ marginRight: 2 }}>,</span>}
        </span>
    );

    let content = null;
    const nextItems = item.items;

    if (nextItems && nextItems.length) {
        content = recursiveRender(
            nextItems,
            framework,
            collapsed,
            level + 1,
            level === 0 || (isLast && idx === items.length - 1),
            !!item.forceTopLevelSubItems
        );

        if (level === 0) {
            content = (
                <div className={classnames(styles['menu-view-tile__sub_list'], { [styles['menu-view-tile--force_toplevel']]: !!item.forceTopLevelSubItems })}>
                    { content}
                </div>
            );
        }
    }

    if (!title && !content) { return null; }

    return (
        <Fragment key={item.title}>
            {title}
            {content}
        </Fragment>
    );
});

const Tile = ({ data, framework }) => {
    const tileEl = useRef(null);
    const [collapsed, setCollapsed] = useState(true);

    if (!data.icon) { return null; }

    const renderedItems = recursiveRender(data.items, framework, collapsed);

    if (renderedItems === null || renderedItems.every(child => child === null)) { return null; }

    const iconName = data.icon.replace('icon-', '');
    const iconAlt = iconName.replace(/-/g, ' ');

    const toggleCollapse = (shouldCollapse) => {
        if (typeof shouldCollapse !== 'boolean') {
            shouldCollapse = !collapsed;
        }

        if (document.body.clientWidth < 768) {
            setCollapsed(shouldCollapse);
        }
    };

    const onKeyDown = (e) => {
        const key = e.key;
        const wrapperFocused = tileEl.current === document.activeElement;

        if (key !== 'Enter' && key !== ' ') { return; }

        if (key === ' ' || wrapperFocused) {
            e.preventDefault();
            toggleCollapse();
        }
    };

    const onBlur = (e) => {
        if (tileEl.current && tileEl.current.contains(e.relatedTarget)) { return; }

        toggleCollapse(true);
    };

    return (
        <div
            ref={tileEl}
            className={classnames(styles['menu-view-tile'], { [styles['menu-view-tile--collapsed']]: collapsed })}
            role="button"
            tabIndex={0}
            aria-expanded={!collapsed}
            onClick={() => toggleCollapse()}
            onKeyDown={e => onKeyDown(e)}
            onMouseLeave={() => toggleCollapse(true)}
            onBlur={e => onBlur(e)}>
            <div className={styles['menu-view-tile__icon']}><img alt={iconAlt} src={icons[iconName]}></img></div>
            <h3 className={styles['menu-view-tile__title']}>{data.title}</h3>
            <div className={styles['menu-view-tile__list']}>
                {renderedItems}
            </div>
            <FontAwesomeIcon icon={collapsed ? faChevronDown : faChevronUp} fixedWidth className={styles['menu-view-tile__expander']} />
        </div>
    );
};

export default Tile;