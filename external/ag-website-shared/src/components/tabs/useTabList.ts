import type { KeyboardEvent } from 'react';
import { useEffect, useRef } from 'react';

import { getTabIndexForKey } from './tabKeyboard';

interface Options {
    count: number;
    selectedIndex: number;
    onSelect: (index: number) => void;
    getTabId: (index: number) => string;
    /** A single panel whose content changes with the tab can return the same id for every index. */
    getPanelId: (index: number) => string;
    /** The panels are rendered outside React (e.g. by Astro), so the hook shows and labels them by id. */
    externalPanels?: boolean;
}

/**
 * ARIA tabs behaviour (roving tabindex, arrow/Home/End selection) for a tablist the caller
 * styles: spread `getTabProps` onto each tab `<button>` and `getPanelProps` onto each panel.
 */
export function useTabList({ count, selectedIndex, onSelect, getTabId, getPanelId, externalPanels }: Options) {
    const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

    // No dependency list: the id getters are new functions each render, and this is a few lookups
    useEffect(() => {
        if (!externalPanels) {
            return;
        }
        const selectedPanelId = getPanelId(selectedIndex);
        for (let index = 0; index < count; index++) {
            const panel = document.getElementById(getPanelId(index));
            if (panel) {
                panel.hidden = panel.id !== selectedPanelId;
            }
        }
        document.getElementById(selectedPanelId)?.setAttribute('aria-labelledby', getTabId(selectedIndex));
    });

    const select = (index: number) => {
        if (index !== selectedIndex) {
            onSelect(index);
        }
    };

    const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
        const next = getTabIndexForKey(event.key, index, count);
        if (next === undefined) {
            return;
        }
        event.preventDefault();
        select(next);
        tabRefs.current[next]?.focus();
    };

    return {
        tablistProps: { role: 'tablist' },
        getTabProps: (index: number) => {
            const selected = index === selectedIndex;
            return {
                ref: (el: HTMLButtonElement | null) => {
                    tabRefs.current[index] = el;
                },
                id: getTabId(index),
                type: 'button' as const,
                role: 'tab',
                'aria-selected': selected,
                'aria-controls': getPanelId(index),
                tabIndex: selected ? 0 : -1,
                onClick: () => select(index),
                onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => onKeyDown(event, index),
            };
        },
        getPanelProps: (index: number) => ({
            id: getPanelId(index),
            role: 'tabpanel',
            'aria-labelledby': getTabId(index),
        }),
    };
}
