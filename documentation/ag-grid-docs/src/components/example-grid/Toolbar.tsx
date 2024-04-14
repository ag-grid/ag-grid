import { Icon } from '@ag-website-shared/components/icon/Icon';
import styles from '@legacy-design-system/modules/Toolbar.module.scss';
import { trackDemoToolbar, trackOnceDemoToolbar } from '@utils/analytics';
import React, { useDeferredValue, useEffect, useState } from 'react';

import { createDataSizeValue } from './utils';

const IS_SSR = typeof window === 'undefined';

const options: Record<string, string> = {
    quartz: 'Quartz',
    balham: 'Balham',
    material: 'Material',
    alpine: 'Alpine',
};

export const Toolbar = ({
    gridRef,
    dataSize,
    setDataSize,
    rowCols,
    gridTheme,
    setGridTheme,
    setCountryColumnPopupEditor,
}) => {
    function onDataSizeChanged(event) {
        const value = event.target.value;
        setDataSize(value);
        trackDemoToolbar({
            type: 'dataSize',
            value,
        });
    }

    function onThemeChanged(event) {
        const newTheme = event.target.value || 'ag-theme-none';
        setCountryColumnPopupEditor(newTheme, gridRef.current.api);
        setGridTheme(newTheme);
        trackDemoToolbar({
            type: 'theme',
            value: newTheme,
        });

        if (!IS_SSR) {
            let url = window.location.href;
            if (url.indexOf('?theme=') !== -1) {
                url = url.replace(/\?theme=[\w:-]+/, `?theme=${newTheme}`);
            } else {
                const sep = url.indexOf('?') === -1 ? '?' : '&';
                url += `${sep}theme=${newTheme}`;
            }
            history.replaceState({}, '', url);
        }
    }

    const [quickFilterText, setQuickFilterText] = useState('');
    const deferredQuickFilterText = useDeferredValue(quickFilterText);

    useEffect(() => {
        if (!gridRef.current?.api) {
            return;
        }
        gridRef.current.api.setGridOption('quickFilterText', deferredQuickFilterText);
        trackOnceDemoToolbar({
            type: 'filterChange',
        });
    }, [deferredQuickFilterText]);

    function onFilterChanged(event) {
        setQuickFilterText(event.target.value);
    }

    return (
        <div className={styles.toolbar}>
            <div className={styles.controlsContainer}>
                <div className={styles.controls}>
                    <label htmlFor="data-size">Data Size:</label>
                    <select id="data-size" onChange={onDataSizeChanged} value={dataSize}>
                        {rowCols.map((rowCol) => {
                            const rows = rowCol[0];
                            const cols = rowCol[1];

                            const value = createDataSizeValue(rows, cols);
                            const text = `${rows} Rows, ${cols} Cols`;
                            return (
                                <option key={value} value={value}>
                                    {text}
                                </option>
                            );
                        })}
                    </select>

                    <label htmlFor="grid-theme">Theme:</label>
                    <select id="grid-theme" onChange={onThemeChanged} value={gridTheme || ''}>
                        {Object.entries(options).map(([themeName, label]) => (
                            <option key={themeName} value={themeName}>
                                {label}
                            </option>
                        ))}
                        {gridTheme && options[gridTheme] == null && <option value={gridTheme}>{gridTheme}</option>}
                    </select>

                    <label htmlFor="global-filter">Filter:</label>
                    <input
                        placeholder="Filter any column..."
                        type="text"
                        onInput={onFilterChanged}
                        id="global-filter"
                        style={{ flex: 1 }}
                    />

                    <a
                        className={styles.videoTour}
                        href="https://youtu.be/bcMvTUVbMvI"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <Icon name="youtube" />
                        Take a video tour
                    </a>
                </div>
            </div>
            <div className={styles.scrollIndicator}></div>
        </div>
    );
};
