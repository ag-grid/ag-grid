import '@testing-library/jest-dom/vitest';
import { AgPromise } from 'ag-stack';
import { TestGridsManager, fakeElementAttribute, getVisibleTooltips } from 'ag-test-utils';

import { AllCommunityModule, getGridElement } from 'ag-grid-community';
import type { GridOptions, ITooltipComp, ITooltipParams } from 'ag-grid-community';

class InteractiveTooltip implements ITooltipComp {
    private readonly eGui = document.createElement('div');

    public init(params: ITooltipParams): void {
        const input = document.createElement('input');
        const button = document.createElement('button');
        button.textContent = String(params.value);
        this.eGui.append(input, button);
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }
}

describe('Tooltip lifecycle', () => {
    const gridMgr = new TestGridsManager({ modules: [AllCommunityModule] });

    afterEach(() => {
        gridMgr.reset();
        vi.clearAllTimers();
        vi.useRealTimers();
    });

    async function createGrid(options: GridOptions = {}) {
        const api = await gridMgr.createGridAndWait('tooltip-lifecycle', {
            columnDefs: [{ field: 'value', tooltip: true }],
            rowData: [{ value: 'First' }, { value: 'Second' }],
            tooltipShowDelay: 0,
            tooltipSwitchShowDelay: 0,
            ...options,
        });
        const grid = getGridElement(api)!;
        const cells = grid.querySelectorAll<HTMLElement>('.ag-cell');
        vi.useFakeTimers();
        return { api, first: cells[0], second: cells[1] };
    }

    const enter = (element: HTMLElement) => element.dispatchEvent(new MouseEvent('mouseenter'));
    const leave = (element: HTMLElement) => element.dispatchEvent(new MouseEvent('mouseleave'));
    const visibleText = () => getVisibleTooltips().map((element) => element.textContent);

    test('has no default timeout and remains open while the tooltip is hovered', async () => {
        const { first } = await createGrid();
        enter(first);
        await vi.advanceTimersByTimeAsync(0);
        expect(visibleText()).toEqual(['First']);
        await vi.advanceTimersByTimeAsync(15000);
        expect(visibleText()).toEqual(['First']);

        const tooltip = getVisibleTooltips()[0];
        expect(tooltip).toHaveAttribute('role', 'tooltip');
        leave(first);
        enter(tooltip);
        await vi.advanceTimersByTimeAsync(200);
        expect(getVisibleTooltips()).toEqual([tooltip]);
        leave(tooltip);
        await vi.advanceTimersByTimeAsync(200);
        expect(visibleText()).toEqual([]);
    });

    test.each(['hover', 'hoverOrFocus'] as const)(
        'crossing another source preserves the %s tooltip',
        async (trigger) => {
            const { first, second } = await createGrid({ tooltipTrigger: trigger });
            enter(first);
            if (trigger === 'hoverOrFocus') {
                first.focus();
            }
            await vi.advanceTimersByTimeAsync(0);
            const tooltip = getVisibleTooltips()[0];

            leave(first);
            enter(second);
            await vi.advanceTimersByTimeAsync(50);
            expect(getVisibleTooltips()).toEqual([tooltip]);
            leave(second);
            enter(tooltip);
            await vi.advanceTimersByTimeAsync(200);
            expect(getVisibleTooltips()).toEqual([tooltip]);

            leave(tooltip);
            enter(second);
            await vi.advanceTimersByTimeAsync(200);
            expect(visibleText()).toEqual(['Second']);
        }
    );

    test('crossing a focused source does not replace the hovered tooltip', async () => {
        const { first, second } = await createGrid({ tooltipTrigger: 'hoverOrFocus' });
        second.focus();
        await vi.advanceTimersByTimeAsync(0);
        enter(first);
        await vi.advanceTimersByTimeAsync(0);
        const tooltip = getVisibleTooltips()[0];
        expect(tooltip).toHaveTextContent('First');

        leave(first);
        enter(second);
        await vi.advanceTimersByTimeAsync(50);
        leave(second);
        enter(tooltip);
        await vi.advanceTimersByTimeAsync(200);
        expect(second).toHaveFocus();
        expect(getVisibleTooltips()).toEqual([tooltip]);

        leave(tooltip);
        enter(second);
        await vi.advanceTimersByTimeAsync(200);
        expect(visibleText()).toEqual(['Second']);
    });

    test('Escape outside the grid dismisses without moving focus or reaching other handlers', async () => {
        const { first } = await createGrid();
        const button = document.createElement('button');
        const onKeyDown = vi.fn();
        button.addEventListener('keydown', onKeyDown);
        document.body.appendChild(button);
        try {
            button.focus();
            enter(first);
            await vi.advanceTimersByTimeAsync(0);
            button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
            expect(visibleText()).toEqual([]);
            expect(button).toHaveFocus();
            expect(onKeyDown).not.toHaveBeenCalled();
            first.dispatchEvent(new MouseEvent('mousemove'));
            await vi.advanceTimersByTimeAsync(500);
            expect(visibleText()).toEqual([]);
            leave(first);
            enter(first);
            await vi.advanceTimersByTimeAsync(0);
            expect(visibleText()).toEqual(['First']);
        } finally {
            button.remove();
        }
    });

    test('combined triggers retain the tooltip until both hover and focus leave', async () => {
        const { first } = await createGrid({ tooltipTrigger: 'hoverOrFocus' });
        enter(first);
        first.focus();
        await vi.advanceTimersByTimeAsync(0);
        expect(visibleText()).toEqual(['First']);
        leave(first);
        await vi.advanceTimersByTimeAsync(200);
        expect(visibleText()).toEqual(['First']);
        enter(first);
        first.blur();
        await vi.advanceTimersByTimeAsync(200);
        expect(visibleText()).toEqual(['First']);
        leave(first);
        await vi.advanceTimersByTimeAsync(200);
        expect(visibleText()).toEqual([]);
    });

    test.each(['focus', 'hover'] as const)(
        'latest %s activation wins without restoring an older source',
        async (last) => {
            const { first, second } = await createGrid({ tooltipTrigger: 'hoverOrFocus' });
            if (last === 'focus') {
                enter(first);
            } else {
                first.focus();
            }
            await vi.advanceTimersByTimeAsync(0);
            expect(visibleText()).toEqual(['First']);
            if (last === 'focus') {
                second.focus();
            } else {
                enter(second);
            }
            await vi.advanceTimersByTimeAsync(200);
            expect(visibleText()).toEqual(['Second']);
            first.dispatchEvent(new MouseEvent('mousemove'));
            expect(visibleText()).toEqual(['Second']);
            if (last === 'focus') {
                second.blur();
            } else {
                leave(second);
            }
            await vi.advanceTimersByTimeAsync(200);
            expect(visibleText()).toEqual([]);
        }
    );

    test('exposes the description immediately but waits for settled keyboard focus before rendering', async () => {
        const { first, second } = await createGrid({ tooltipTrigger: 'hoverOrFocus', tooltipShowDelay: 200 });
        first.setAttribute('aria-describedby', 'customer-description');
        first.focus();
        const ids = first.getAttribute('aria-describedby')!.split(/\s+/);
        expect(ids).toContain('customer-description');
        expect(ids.map((id) => document.getElementById(id)?.textContent)).toContain('First');
        expect(visibleText()).toEqual([]);
        await vi.advanceTimersByTimeAsync(100);
        second.focus();
        await vi.advanceTimersByTimeAsync(100);
        expect(visibleText()).toEqual([]);
        await vi.advanceTimersByTimeAsync(100);
        expect(visibleText()).toEqual(['Second']);
        expect(first).toHaveAttribute('aria-describedby', 'customer-description');
    });

    test('Escape on a focused source does not immediately reopen the tooltip', async () => {
        const { first } = await createGrid({ tooltipTrigger: 'hoverOrFocus' });
        enter(first);
        first.focus();
        await vi.advanceTimersByTimeAsync(0);
        first.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await vi.advanceTimersByTimeAsync(1000);
        expect(visibleText()).toEqual([]);
        expect(first).toHaveFocus();
        first.blur();
        first.focus();
        await vi.advanceTimersByTimeAsync(0);
        expect(visibleText()).toEqual(['First']);
    });

    test('interactive focus protects the tooltip from timeouts and competing hover', async () => {
        const { first, second } = await createGrid({
            columnDefs: [{ field: 'value', tooltip: true, tooltipComponent: InteractiveTooltip }],
            tooltipTrigger: 'hoverOrFocus',
            tooltipInteraction: true,
            tooltipHideDelay: 50,
        });
        first.focus();
        await vi.advanceTimersByTimeAsync(0);
        const tooltip = getVisibleTooltips()[0];
        first.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
        const input = tooltip.querySelector('input')!;
        expect(input).toHaveFocus();
        enter(second);
        await vi.advanceTimersByTimeAsync(1000);
        expect(getVisibleTooltips()).toEqual([tooltip]);
        expect(input).toHaveFocus();
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        expect(first).toHaveFocus();
        expect(visibleText()).toEqual([]);
    });

    test('leaving interactive content closes the tooltip without stealing focus', async () => {
        const { first } = await createGrid({
            columnDefs: [{ field: 'value', tooltip: true, tooltipComponent: InteractiveTooltip }],
            tooltipTrigger: 'focus',
            tooltipInteraction: true,
        });
        const button = document.createElement('button');
        document.body.appendChild(button);
        try {
            first.focus();
            await vi.advanceTimersByTimeAsync(0);
            getVisibleTooltips()[0].querySelector('input')!.focus();
            button.focus();
            await vi.advanceTimersByTimeAsync(200);
            expect(visibleText()).toEqual([]);
            expect(button).toHaveFocus();
        } finally {
            button.remove();
        }
    });

    test.each([
        { hover: 'source', hideDelay: 300 },
        { hover: 'tooltip', hideDelay: 300 },
        { hover: 'tooltip', hideDelay: undefined },
    ])(
        'respects the hide delay after focus leaves (hover: $hover, delay: $hideDelay)',
        async ({ hover, hideDelay }) => {
            const { first } = await createGrid({
                columnDefs: [{ field: 'value', tooltip: true, tooltipComponent: InteractiveTooltip }],
                tooltipTrigger: 'hoverOrFocus',
                tooltipInteraction: true,
                tooltipHideDelay: hideDelay,
            });
            const button = document.createElement('button');
            document.body.appendChild(button);
            try {
                enter(first);
                await vi.advanceTimersByTimeAsync(0);
                const tooltip = getVisibleTooltips()[0];
                tooltip.querySelector('input')!.focus();
                if (hover === 'tooltip') {
                    leave(first);
                    enter(tooltip);
                }
                await vi.advanceTimersByTimeAsync(1000);
                expect(getVisibleTooltips()).toEqual([tooltip]);

                button.focus();
                await vi.advanceTimersByTimeAsync(299);
                expect(getVisibleTooltips()).toEqual([tooltip]);
                await vi.advanceTimersByTimeAsync(1);
                expect(getVisibleTooltips()).toEqual(hideDelay == null ? [tooltip] : []);
                expect(button).toHaveFocus();

                leave(hover === 'tooltip' ? tooltip : first);
                await vi.advanceTimersByTimeAsync(200);
                expect(getVisibleTooltips()).toHaveLength(0);
            } finally {
                button.remove();
            }
        }
    );

    test('uses an explicit description for structured custom values before creating the component', async () => {
        const description = vi.fn((params: ITooltipParams) => `Description: ${params.value.text}`);
        const { first } = await createGrid({
            columnDefs: [
                { field: 'value', tooltip: (params) => ({ text: params.value }), tooltipComponent: InteractiveTooltip },
            ],
            tooltipTrigger: 'hoverOrFocus',
            tooltipShowDelay: 200,
            getTooltipAriaDescription: description,
        });
        first.focus();
        expect(first).toHaveAccessibleDescription('Description: First');
        expect(description).toHaveBeenCalledWith(
            expect.objectContaining({ value: { text: 'First' }, location: 'cell' })
        );
        expect(visibleText()).toEqual([]);
        const describedBy = first.getAttribute('aria-describedby');
        await vi.advanceTimersByTimeAsync(200);
        expect(getVisibleTooltips()).toHaveLength(1);
        expect(first).toHaveAttribute('aria-describedby', describedBy);
        expect(first).toHaveAccessibleDescription('Description: First');
    });

    test('refreshes focused descriptions and removes them when the grid is destroyed', async () => {
        const { api, first } = await createGrid({ tooltipTrigger: 'hoverOrFocus' });
        first.focus();
        await vi.advanceTimersByTimeAsync(0);
        expect(first).toHaveAccessibleDescription('First');
        api.getDisplayedRowAtIndex(0)!.setDataValue('value', 'Updated');
        await vi.advanceTimersByTimeAsync(0);
        expect(first).toHaveAccessibleDescription('Updated');
        expect(visibleText()).toEqual([]);
        const id = first.getAttribute('aria-describedby')!;
        api.destroy();
        expect(document.getElementById(id)).toBeNull();
        await vi.advanceTimersByTimeAsync(2000);
        expect(visibleText()).toEqual([]);
    });

    test.each(['hover', 'hoverOrFocus'] as const)(
        'refreshing a pending %s tooltip preserves its show delay and uses the latest value',
        async (tooltipTrigger) => {
            const { api, first } = await createGrid({ tooltipTrigger, tooltipShowDelay: 200 });
            if (tooltipTrigger === 'hoverOrFocus') {
                first.focus();
            } else {
                enter(first);
            }
            await vi.advanceTimersByTimeAsync(100);
            api.getDisplayedRowAtIndex(0)!.setDataValue('value', 'Updated');
            if (tooltipTrigger === 'hoverOrFocus') {
                expect(first).toHaveAccessibleDescription('Updated');
            }
            await vi.advanceTimersByTimeAsync(99);
            expect(visibleText()).toEqual([]);
            await vi.advanceTimersByTimeAsync(1);
            expect(visibleText()).toEqual(['Updated']);
        }
    );

    test.each([null, ''])('allows an explicit empty focus description (%s)', async (description) => {
        const { first } = await createGrid({
            tooltipTrigger: 'hoverOrFocus',
            getTooltipAriaDescription: () => description,
        });
        first.focus();
        await vi.advanceTimersByTimeAsync(0);
        expect(first).not.toHaveAttribute('aria-describedby');
        expect(visibleText()).toEqual(['First']);
    });

    test('cancels a pending tooltip when its source is removed', async () => {
        const { api, first } = await createGrid({ tooltipTrigger: 'hoverOrFocus', tooltipShowDelay: 200 });
        first.focus();
        const id = first.getAttribute('aria-describedby')!;
        api.setGridOption('rowData', []);
        await vi.advanceTimersByTimeAsync(1000);
        expect(document.getElementById(id)).toBeNull();
        expect(visibleText()).toEqual([]);
    });

    test.each([false, true])('focus respects whenTruncated (truncated: %s)', async (truncated) => {
        const { first } = await createGrid({ tooltipTrigger: 'hoverOrFocus', tooltipShowMode: 'whenTruncated' });
        fakeElementAttribute('clientWidth', 100, '.ag-cell, .ag-cell-value');
        fakeElementAttribute('scrollWidth', truncated ? 200 : 100, '.ag-cell, .ag-cell-value');
        fakeElementAttribute('clientHeight', 100, '.ag-cell, .ag-cell-value');
        fakeElementAttribute('scrollHeight', 100, '.ag-cell, .ag-cell-value');
        first.focus();
        await vi.advanceTimersByTimeAsync(0);
        expect(visibleText()).toEqual(truncated ? ['First'] : []);
        expect(first.hasAttribute('aria-describedby')).toBe(truncated);
    });

    test('discards an asynchronous tooltip component after its source is removed', async () => {
        const destroy = vi.fn();
        class DelayedTooltip implements ITooltipComp {
            private readonly gui = document.createElement('div');
            public init(params: ITooltipParams): AgPromise<void> {
                return new AgPromise((resolve) =>
                    window.setTimeout(() => {
                        this.gui.textContent = String(params.value);
                        resolve();
                    }, 50)
                );
            }
            public getGui(): HTMLElement {
                return this.gui;
            }
            public destroy = destroy;
        }
        const { api, first } = await createGrid({
            columnDefs: [{ field: 'value', tooltip: true, tooltipComponent: DelayedTooltip }],
        });
        enter(first);
        await vi.advanceTimersByTimeAsync(0);
        api.setGridOption('rowData', []);
        await vi.advanceTimersByTimeAsync(100);
        expect(visibleText()).toEqual([]);
        expect(destroy).toHaveBeenCalledTimes(1);
    });

    test.each(['hover', 'focus'] as const)('preserves the existing %s-only trigger', async (tooltipTrigger) => {
        const { first } = await createGrid({ tooltipTrigger, tooltipShowDelay: 200 });
        if (tooltipTrigger === 'hover') {
            first.focus();
            await vi.advanceTimersByTimeAsync(300);
            expect(visibleText()).toEqual([]);
            expect(first).not.toHaveAttribute('aria-describedby');
            enter(first);
            await vi.advanceTimersByTimeAsync(200);
        } else {
            enter(first);
            await vi.advanceTimersByTimeAsync(300);
            expect(visibleText()).toEqual([]);
            first.focus();
            await vi.advanceTimersByTimeAsync(0);
        }
        expect(visibleText()).toEqual(['First']);
    });
});
