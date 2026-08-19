import { waitFor } from '@testing-library/dom';

const TOOLTIP_SELECTOR = '.ag-tooltip, .ag-tooltip-custom';

/** Every tooltip element still attached, including one mid-fade that the user can no longer see. */
export const getAttachedTooltips = (): HTMLElement[] =>
    Array.from(document.querySelectorAll<HTMLElement>(TOOLTIP_SELECTOR));

/**
 * Tooltips on screen. Hiding marks `ag-tooltip-hiding` synchronously and destroys a second later, for a
 * CSS transition happy-dom never runs, so visible-count is what a user sees without waiting that second out.
 */
export const getVisibleTooltips = (): HTMLElement[] =>
    getAttachedTooltips().filter((el) => !el.classList.contains('ag-tooltip-hiding'));

/** Polls until exactly `count` tooltips are visible. */
export const waitForTooltips = async (count: number): Promise<void> =>
    await waitFor(() => expect(getVisibleTooltips().length).toBe(count), { timeout: 2000 });

/**
 * Polls until no tooltip element is left attached, i.e. past the grid's fade-out window. Costs that full
 * second, so assert the visible count instead unless destruction is the point of the test.
 */
export const waitForTooltipsDestroyed = async (): Promise<void> =>
    await waitFor(() => expect(getAttachedTooltips()).toEqual([]), { timeout: 4000 });
