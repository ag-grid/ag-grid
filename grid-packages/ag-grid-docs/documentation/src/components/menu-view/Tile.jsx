import classnames from 'classnames';
import DocumentationLink from 'components/DocumentationLink';
import React, { Fragment, useRef, useState } from 'react';
import { Icon } from '../Icon';
import styles from './Tile.module.scss';

const recursiveRender = (items, framework, collapsed, level = 0, isLast, forceTopLevel) =>
    items.map((item, idx) => {
        if (item.frameworks && item.frameworks.indexOf(framework) === -1) {
            return null;
        }

        const isTopLevel = level === 0 || forceTopLevel;

        const title = item.url && (!collapsed || item.showInCollapsed) && (
            <span className={isTopLevel || item.forceTopLevelSubItems ? styles.topLevel : styles.lowerLevel}>
                <DocumentationLink href={item.url} framework={framework}>
                    {item.title}
                    {item.enterprise && <Icon name="enterprise" svgClasses={styles.enterpriseIcon} />}
                </DocumentationLink>
                {!isTopLevel && <span className={styles.subListComma}>,</span>}
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
                    <div className={classnames({ [styles.subList]: !item.forceTopLevelSubItems })}>{content}</div>
                );
            }
        }

        if (!title && !content) {
            return null;
        }

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

    if (!data.icon) {
        return null;
    }

    const renderedItems = recursiveRender(data.items, framework, collapsed);

    if (renderedItems === null || renderedItems.every((child) => child === null)) {
        return null;
    }

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

        if (key !== 'Enter' && key !== ' ') {
            return;
        }

        if (key === ' ' || wrapperFocused) {
            e.preventDefault();
            toggleCollapse();
        }
    };

    return (
        <div
            ref={tileEl}
            className={classnames(styles.tile, styles.docsSectionTile)}
            role="button"
            tabIndex={0}
            aria-expanded={!collapsed}
            onClick={() => toggleCollapse()}
            onKeyDown={(e) => onKeyDown(e)}
        >
            <h3 className={'normal-weight-text text-secondary'}>
                <Icon name={data.icon} svgClasses={styles.sectionIcon} />
                <span>{data.title}</span>
                <Icon name={collapsed ? 'chevronDown' : 'chevronUp'} svgClasses={styles.collapseIndicator} />
            </h3>
            <div
                className={classnames(styles.renderedItems, {
                    [styles.collapsed]: collapsed,
                })}
            >
                {renderedItems}
            </div>
        </div>
    );
};

export default Tile;
