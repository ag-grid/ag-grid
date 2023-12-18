import React from 'react';
import type { FunctionComponent } from 'react';

import styles from './StyleGuide.module.scss';
import { getCssVarValue } from './getCssVarValue';

const colors = {
    base: ['white', 'black'],
    gray: ['25', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
    brand: ['25', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
    warning: ['25', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
    background: ['bg-primary', 'bg-secondary', 'bg-brand-solid', 'bg-disabled_subtle'],
    foreground: [
        'fg-primary',
        'fg-secondary',
        'fg-tertiary',
        'fg-quinary',
        'fg-disabled',
        'fg-placeholder',
        'fg-white',
    ],
    border: ['border-primary', 'border-secondary', 'border-tertiary', 'border-disabled_subtle'],
    button: [
        'button-primary-bg',
        'button-primary-bg-hover',
        'button-primary-bg-active',
        'button-primary-shadow-focus',
        'button-primary-fg',
        'button-primary-border',

        'button-secondary-bg',
        'button-secondary-bg-hover',
        'button-secondary-bg-active',
        'button-secondary-shadow-focus',
        'button-secondary-fg',
        'button-secondary-border',

        'button-tertiary-bg',
        'button-tertiary-bg-hover',
        'button-tertiary-bg-active',
        'button-tertiary-shadow-focus',
        'button-tertiary-fg',
        'button-tertiary-border',

        'button-disabled-bg',
        'button-disabled-fg',
        'button-disabled-border',
    ],
    input: ['input-border', 'input-border-hover', 'input-shadow-focus', 'input-disabled-bg', 'input-disabled-fg'],
    utilWarning: [
        'util-warning-50',
        'util-warning-100',
        'util-warning-200',
        'util-warning-300',
        'util-warning-400',
        'util-warning-500',
        'util-warning-600',
        'util-warning-700',
    ],
    utilBrand: [
        'util-brand-50',
        'util-brand-100',
        'util-brand-200',
        'util-brand-300',
        'util-brand-400',
        'util-brand-500',
        'util-brand-600',
        'util-brand-700',
    ],
    utilGray: [
        'util-gray-50',
        'util-gray-100',
        'util-gray-200',
        'util-gray-300',
        'util-gray-400',
        'util-gray-500',
        'util-gray-600',
        'util-gray-700',
    ],
};

const Color: FunctionComponent = ({ colorName, showValue = false }) => {
    const cssVar = `--color-${colorName}`;

    return (
        <div className={styles.swatch}>
            <div className={styles.swatchTop} style={{ backgroundColor: `var(${cssVar})` }}></div>
            <div className={styles.swatchBottom}>
                {showValue && (
                    <span>
                        <b>{getCssVarValue(cssVar)}</b>
                    </span>
                )}

                <code>{cssVar}</code>
            </div>
        </div>
    );
};

export const Colors: FunctionComponent = () => {
    return (
        <>
            <h2>Abstract Colors</h2>

            <h4>Base</h4>
            <div className={styles.colorsList}>
                {colors.base.map((clr) => {
                    return <Color key={clr} colorName={`${clr}`} showValue={true} />;
                })}
            </div>

            <h4>Gray</h4>
            <div className={styles.colorsList}>
                {colors.gray.map((clr) => {
                    return <Color key={`gray-${clr}`} colorName={`gray-${clr}`} showValue={true} />;
                })}
            </div>

            <h4>Brand</h4>
            <div className={styles.colorsList}>
                {colors.brand.map((clr) => {
                    return <Color key={`brand-${clr}`} colorName={`brand-${clr}`} showValue={true} />;
                })}
            </div>

            <h4>Warning</h4>
            <div className={styles.colorsList}>
                {colors.warning.map((clr) => {
                    return <Color key={`warning-${clr}`} colorName={`warning-${clr}`} showValue={true} />;
                })}
            </div>

            <h2>Semantic Colors</h2>

            <h4>Background</h4>
            <div className={styles.colorsList}>
                {colors.background.map((clr) => {
                    return <Color key={clr} colorName={`${clr}`} />;
                })}
            </div>

            <h4>Foreground</h4>
            <div className={styles.colorsList}>
                {colors.foreground.map((clr) => {
                    return <Color key={clr} colorName={`${clr}`} />;
                })}
            </div>

            <h4>Border</h4>
            <div className={styles.colorsList}>
                {colors.border.map((clr) => {
                    return <Color key={clr} colorName={`${clr}`} />;
                })}
            </div>

            <h4>Button</h4>
            <div className={styles.colorsList}>
                {colors.button.map((clr) => {
                    return <Color key={clr} colorName={`${clr}`} />;
                })}
            </div>

            <h4>Input</h4>
            <div className={styles.colorsList}>
                {colors.input.map((clr) => {
                    return <Color key={clr} colorName={`${clr}`} />;
                })}
            </div>

            <h4>Utility Gray</h4>
            <div className={styles.colorsList}>
                {colors.utilGray.map((clr) => {
                    return <Color key={clr} colorName={`${clr}`} />;
                })}
            </div>

            <h4>Utility Brand</h4>
            <div className={styles.colorsList}>
                {colors.utilBrand.map((clr) => {
                    return <Color key={clr} colorName={`${clr}`} />;
                })}
            </div>

            <h4>Utility Warning</h4>
            <div className={styles.colorsList}>
                {colors.utilWarning.map((clr) => {
                    return <Color key={clr} colorName={`${clr}`} />;
                })}
            </div>
        </>
    );
};
