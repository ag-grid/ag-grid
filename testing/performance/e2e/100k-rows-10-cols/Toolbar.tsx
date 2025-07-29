import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import React from 'react';

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
    toggle,
    show,
    setGridTheme,
    setCountryColumnPopupEditor,
}) => {
    const [cols, setCols] = useState(18);
    const [rows, setRows] = useState(0.01);
    useEffect(() => setDataSize(`${rows}x${cols}`), [cols, rows]);

    function onThemeChanged(newValue) {
        const newTheme = newValue.value || 'ag-theme-none';
        setCountryColumnPopupEditor(newTheme, gridRef.current.api);
        setGridTheme(newTheme);

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
    }, [deferredQuickFilterText]);

    function onFilterChanged(event) {
        setQuickFilterText(event.target.value);
    }

    const dataSizeOptions = useMemo(
        () =>
            rowCols.map((rowCol) => {
                const rows = rowCol[0];
                const cols = rowCol[1];

                const value = createDataSizeValue(rows, cols);
                const text = `${rows} Rows, ${cols} Cols`;
                return {
                    label: text,
                    value,
                };
            }),
        [rowCols]
    );
    const dataSizeOption = useMemo(
        () => dataSizeOptions.find((o: { value: string }) => o.value === dataSize) || dataSizeOptions[0],
        [dataSizeOptions, dataSize]
    );

    const themeOptions = useMemo(() => {
        return Object.entries(options).map(([themeName, label]) => ({
            label,
            value: themeName,
        }));
    }, [options]);
    const themeOption = useMemo(
        () => themeOptions.find((o: { value: string }) => gridTheme.includes(o.value)) || dataSizeOptions[0],
        [themeOptions, gridTheme]
    );

    return (
        <div className={'toolbar'}>
            <div className={'controlsContainer'}>
                <div className={'controls'}>
                    <label htmlFor="show">Show grid</label>
                    <input id="show" type="checkbox" checked={show} onChange={() => toggle(!show)} />

                    <label htmlFor="cols">Manual cols:</label>
                    <input
                        id="cols"
                        type="number"
                        min="1"
                        max="1000"
                        name="cols"
                        value={cols}
                        onChange={(e) => setCols(e.target.value)}
                    />
                    <label htmlFor="rows">Manual rows (x1000):</label>
                    {dataSizeOption && (
                        <input
                            id="rows"
                            type="number"
                            min="0"
                            max="100000"
                            name="rows"
                            value={rows}
                            onChange={(e) => setRows(e.target.value)}
                            step="1"
                        />
                    )}

                    <span className={'filterLabel'}>Theme:</span>
                    <select
                        value={themeOptions.indexOf(themeOption)}
                        onChange={(i) => onThemeChanged(themeOptions[i.target.value])}
                    >
                        {themeOptions.map((o, i) => (
                            <option value={i} selected={i === themeOptions.indexOf(o)}>
                                {o.label}
                            </option>
                        ))}
                    </select>

                    <label htmlFor="global-filter" className={'filterLabel'}>
                        Filter:
                    </label>
                    <input
                        className={'filterInput'}
                        placeholder="Filter any column..."
                        type="text"
                        onInput={onFilterChanged}
                        id="global-filter"
                        style={{ flex: 1 }}
                    />

                    <button
                        id="reset"
                        style={{ marginLeft: '20px' }}
                        onClick={() => {
                            setCols(1);
                            setRows(0.001);
                        }}
                    >
                        Reset row cols
                    </button>
                </div>
            </div>
            <div className={'scrollIndicator'}></div>
        </div>
    );
};
