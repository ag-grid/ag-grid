import { getByRole, waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom/vitest';
import { act, cleanup, render } from '@testing-library/react';
import { getVisibleTooltips } from 'ag-test-utils';
import React, { StrictMode } from 'react';

import {
    ClientSideRowModelModule,
    GridStateModule,
    ModuleRegistry,
    PaginationModule,
    TextFilterModule,
    TooltipModule,
} from 'ag-grid-community';
import { ColumnMenuModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';
import type { CustomBuiltInTooltipProps } from 'ag-grid-react';

describe('Built-in tooltip components (React)', () => {
    beforeAll(() =>
        ModuleRegistry.registerModules([
            ClientSideRowModelModule,
            GridStateModule,
            PaginationModule,
            TextFilterModule,
            TooltipModule,
            ColumnMenuModule,
        ])
    );
    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    test('read-only floating previews follow the header across strict-mode mounts', async () => {
        for (let mount = 0; mount < 2; mount++) {
            const rendered = render(
                <StrictMode>
                    <AgGridReact
                        columnDefs={[
                            {
                                field: 'value',
                                filter: 'agTextColumnFilter',
                                floatingFilter: true,
                                filterParams: { readOnly: true },
                            },
                        ]}
                        rowData={[{ value: 'A long filter value' }]}
                        initialState={{
                            filter: {
                                filterModel: {
                                    value: { filterType: 'text', type: 'contains', filter: 'A long filter value' },
                                },
                            },
                        }}
                    />
                </StrictMode>
            );
            const input = await waitFor(() => {
                const input = rendered.container.querySelector<HTMLInputElement>('.ag-floating-filter input')!;
                expect(input).toHaveValue('A long filter value');
                return input;
            });
            vi.spyOn(input, 'scrollWidth', 'get').mockReturnValue(2000);
            vi.spyOn(input, 'clientWidth', 'get').mockReturnValue(100);
            const header = input.closest<HTMLElement>('.ag-floating-filter')!;
            act(() => header.focus());
            await waitFor(() => expect(getVisibleTooltips()[0]).toHaveTextContent(input.value));
            expect(header).toHaveAccessibleDescription(input.value);
            rendered.unmount();
            expect(getVisibleTooltips()).toEqual([]);
            expect(header).not.toHaveAttribute('aria-describedby');
        }
    });

    test('floating filter buttons own their tooltip across strict-mode mounts', async () => {
        for (let mount = 0; mount < 2; mount++) {
            const rendered = render(
                <StrictMode>
                    <AgGridReact
                        columnDefs={[{ field: 'value', filter: 'agTextColumnFilter', floatingFilter: true }]}
                        rowData={[{ value: 'One' }]}
                    />
                </StrictMode>
            );
            const button = await waitFor(() =>
                getByRole(rendered.container, 'button', { name: 'Open Value Filter Menu' })
            );
            act(() => button.focus());
            await waitFor(() => expect(getVisibleTooltips()[0]).toHaveTextContent('Open filter'));
            expect(getVisibleTooltips()).toHaveLength(1);
            expect(button).toHaveAccessibleDescription('Open filter');

            rendered.unmount();
            expect(getVisibleTooltips()).toEqual([]);
            expect(button).not.toHaveAttribute('aria-describedby');
        }
    });

    test('passes custom props, dismisses without moving focus, and survives rerender and remount', async () => {
        type Props = CustomBuiltInTooltipProps<{ value: string }, { prefix: string }> & { suffix: string };
        let current: Props | undefined;
        const Tooltip = (props: Props) => {
            current = props;
            return (
                <span>
                    {props.context.prefix}
                    {props.text}
                    {props.suffix}
                </span>
            );
        };
        const columnDefs = [{ field: 'value' as const }];
        const rowData = [{ value: 'One' }, { value: 'Two' }];
        const Grid = ({ suppressed = false }) => (
            <StrictMode>
                <AgGridReact
                    columnDefs={columnDefs}
                    rowData={rowData}
                    context={{ prefix: 'React: ' }}
                    pagination
                    paginationPageSize={1}
                    paginationPageSizeSelector={false}
                    tooltipShowDelay={10000}
                    builtInTooltipComponent={Tooltip}
                    builtInTooltipComponentParams={{ suffix: '!' }}
                    suppressBuiltInTooltips={suppressed}
                />
            </StrictMode>
        );

        for (let mount = 0; mount < 2; mount++) {
            const rendered = render(<Grid />);
            const next = await waitFor(() => getByRole(rendered.container, 'button', { name: 'Next Page' }));
            act(() => next.focus());
            await waitFor(() => expect(getVisibleTooltips()[0]).toHaveTextContent('React: Go to next page!'));
            expect(current).toMatchObject({
                text: 'Go to next page',
                control: 'nextPage',
                location: 'pagination',
                suffix: '!',
            });
            act(() => current!.hideTooltipCallback());
            expect(getVisibleTooltips()).toEqual([]);
            expect(next).toHaveFocus();

            act(() => next.blur());
            act(() => next.focus());
            await waitFor(() => expect(getVisibleTooltips()[0]).toHaveTextContent('React: Go to next page!'));
            rendered.rerender(<Grid suppressed />);
            await waitFor(() => expect(getVisibleTooltips()).toEqual([]));
            rendered.rerender(<Grid />);
            act(() => next.blur());
            act(() => next.focus());
            await waitFor(() => expect(getVisibleTooltips()[0]).toHaveTextContent('React: Go to next page!'));
            rendered.unmount();
            expect(getVisibleTooltips()).toEqual([]);
        }
    });
});
