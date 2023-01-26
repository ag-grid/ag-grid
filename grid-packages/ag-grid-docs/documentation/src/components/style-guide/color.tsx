import classnames from 'classnames';
import React from 'react';
import designSystemColors from '../../design-system/color.module.scss';
import styles from './color.module.scss';
import { formatName, hexToHSL, isLight } from './utils';

const getAbstractColorId = (key) => `abstract-color-${key}`;
const getSemanticColorId = (key) => `semantic-color-${key}`;

const getAbstractColor = (key) => designSystemColors[getAbstractColorId(key)];
const getAbstractColorOfSemanticColor = (key) => designSystemColors[getSemanticColorId(key)];

const ABSTRACT_COLOR_GROUPS = {
    Brand: ['ag-grid-dark-blue', 'ag-grid-aqua', 'ag-grid-orange', 'ag-grid-red', 'ag-grid-grey'],
    Blues: ['dark-cerulean-blue', 'medium-electric-blue', 'azure-blue', 'sky-blue', 'water-blue', 'ghost-blue'],
    Grays: [
        'black',
        'dark-gunmetal-gray',
        'auro-metal',
        'dull-light-gray',
        'light-gray',
        'platinum-gray',
        'ghost-white',
        'white',
    ],
    Other: ['cerise-pink'],
};

/**
 * Semantic colors as CSS Variable names
 *
 * NOTE: **Without** the `--` prefix
 */
const SEMANTIC_COLOR_GROUPS = {
    Text: ['text-color', 'secondary-text-color'],
    Border: ['border-color'],
    Link: ['link-color', 'link-hover-color'],
    Button: ['button-text-color', 'button-color', 'button-hover-color', 'button-active-color'],
    Inline: ['inline-element-background-color'],
    Code: ['code-text-color'],
    Input: [
        'input-background-color',
        'input-secondary-background-color',
        'input-secondary-border-color',
        'input-primary-color',
        'input-focus-border-color',
        'input-focus-box-shadow-color',
    ],
    Table: ['table-odd-row-background-color'],
    'Site Header': ['site-header-background', 'site-nav-background'],
};

const AbstractColorSwatch = ({ id, hexColor }) => {
    return (
        <li id={getAbstractColorId(id)} className={styles.swatch}>
            <div
                className={classnames(styles.color, isLight(hexColor) ? styles['color--light'] : '')}
                style={{
                    backgroundColor: hexColor,
                }}
            ></div>
            <p className={styles.name}>{formatName(id)}</p>
            <p className={styles.cssName}>
                <code>--{id}</code>
            </p>

            <p className={styles.colorValue}>
                {hexColor} <span>|</span> {hexToHSL(hexColor)}
            </p>
        </li>
    );
};

const SemanticColorSwatch = ({ cssVarName }) => {
    const abstractColor = getAbstractColorOfSemanticColor(cssVarName);
    const hexColor = getAbstractColor(abstractColor);

    return (
        <li className={styles.swatch}>
            <div
                className={classnames(styles.color, isLight(hexColor) ? styles['color--light'] : '')}
                style={{
                    backgroundColor: `var(--${cssVarName})`,
                }}
            ></div>
            <p className={styles.name}>{formatName(cssVarName)}</p>
            <p className={styles.cssName}>
                <code>--{cssVarName}</code>
            </p>
            <p className={styles.colorValue}>
                <a href={`#${getAbstractColorId(abstractColor)}`}>--{abstractColor}</a>
            </p>
        </li>
    );
};

const AbstractColors = () => {
    const colors = ABSTRACT_COLOR_GROUPS;
    return (
        <div className={styles.swatches}>
            <h3>Abstract Colors</h3>
            {Object.keys(colors).map((groupName) => {
                const groupColors = colors[groupName];

                return (
                    <React.Fragment key={groupName}>
                        <h4>{groupName}</h4>
                        <ul className={classnames('list-style-none', styles.colorGroup)}>
                            {groupColors.map((key) => {
                                return <AbstractColorSwatch key={key} id={key} hexColor={getAbstractColor(key)} />;
                            })}
                        </ul>
                    </React.Fragment>
                );
            })}
        </div>
    );
};

const SemanticColors = () => {
    const colors = SEMANTIC_COLOR_GROUPS;
    return (
        <div className={styles.swatches}>
            <h3>Semantic Colors</h3>
            {Object.keys(colors).map((groupName) => {
                const groupColors = colors[groupName];

                return (
                    <React.Fragment key={groupName}>
                        <h4>{groupName}</h4>
                        <ul className={classnames('list-style-none', styles.colorGroup)}>
                            {groupColors.map((cssVarName) => {
                                return <SemanticColorSwatch key={cssVarName} cssVarName={cssVarName} />;
                            })}
                        </ul>
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export const Color = () => {
    return (
        <div className={styles.colorSubsections}>
            <AbstractColors />
            <SemanticColors />
        </div>
    );
};
