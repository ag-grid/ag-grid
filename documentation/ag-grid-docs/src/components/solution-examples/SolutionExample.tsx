import { useDarkmode } from '@utils/hooks/useDarkmode';
import { type FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';

import type { GridApi, GridReadyEvent } from 'ag-grid-community';
import { colorSchemeDark, themeQuartz } from 'ag-grid-community';
import { AgGridProvider, AgGridReact } from 'ag-grid-react';

import styles from './SolutionExample.module.scss';
import { SOLUTION_EXAMPLES } from './solutionExamples';

const lightTheme = themeQuartz;
const darkTheme = themeQuartz.withPart(colorSchemeDark);

interface Props {
    /** A key of `SOLUTION_EXAMPLES`, from the solution page's `example.id`. */
    id: string;
}

/** A solution page's live example: the grid, with its toolbar when it has one. */
export const SolutionExample: FunctionComponent<Props> = ({ id }) => {
    const [isDarkMode] = useDarkmode();
    const example = useMemo(() => SOLUTION_EXAMPLES[id]?.(), [id]);
    const [api, setApi] = useState<GridApi>();
    const onGridReady = useCallback(({ api }: GridReadyEvent) => setApi(api), []);

    useEffect(() => (api && example?.start ? example.start(api) : undefined), [api, example]);

    if (!example) {
        throw new Error(`No solution example named ${id}: add it to SOLUTION_EXAMPLES`);
    }

    return (
        <AgGridProvider modules={example.modules}>
            {example.toolbar && (
                <div className={styles.toolbar}>
                    {example.toolbar.map((control) =>
                        control.kind === 'button' ? (
                            <button
                                key={control.label}
                                type="button"
                                className="button-secondary"
                                disabled={!api}
                                onClick={() => api && control.onClick(api)}
                            >
                                {control.label}
                            </button>
                        ) : (
                            <input
                                key={control.placeholder}
                                type="search"
                                className={styles.search}
                                placeholder={control.placeholder}
                                aria-label={control.placeholder}
                                onInput={(event) => api && control.onInput(api, event.currentTarget.value)}
                            />
                        )
                    )}
                </div>
            )}
            <div className={styles.grid}>
                <AgGridReact
                    {...example.gridOptions}
                    theme={isDarkMode ? darkTheme : lightTheme}
                    onGridReady={onGridReady}
                />
            </div>
        </AgGridProvider>
    );
};
