import classnames from 'classnames';
import React from 'react';
import styles from './Toolbar.module.scss';
import { createDataSizeValue } from './utils';

const IS_SSR = typeof window === 'undefined';

export const Toolbar = ({ gridRef, dataSize, setDataSize, rowCols, gridTheme, setGridTheme }) => {
    function onDataSizeChanged(event) {
        setDataSize(event.target.value);
    }

    function onThemeChanged(event) {
        const newTheme = event.target.value || 'ag-theme-none';
        setGridTheme(newTheme);

        if (!IS_SSR) {
            let url = window.location.href;
            if (url.indexOf('?theme=') !== -1) {
                url = url.replace(/\?theme=[\w-]+/, `?theme=${newTheme}`);
            } else {
                const sep = url.indexOf('?') === -1 ? '?' : '&';
                url += `${sep}theme=${newTheme}`;
            }
            history.replaceState({}, '', url);
        }
    }

    function onFilterChanged(event) {
        gridRef.current.api.setQuickFilter(event.target.value);
    }

    return (
        <div className={classnames('ag-styles', styles.toolbar)}>
            <div className={classnames('page-margin', styles.controlsContainer)}>
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
                        <option value="ag-theme-none">-none-</option>
                        <option value="ag-theme-alpine">Alpine</option>
                        <option value="ag-theme-alpine-dark">Alpine Dark</option>
                        <option value="ag-theme-balham">Balham</option>
                        <option value="ag-theme-balham-dark">Balham Dark</option>
                        <option value="ag-theme-material">Material</option>
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
                        href="https://youtu.be/29ja0liMuv4"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Take a video tour
                    </a>
                </div>
            </div>
            <div className={styles.scrollIndicator}></div>
        </div>
    );
};
