// @vitest-environment jsdom
import { useState } from 'react';
import { type Root, createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { vi } from 'vitest';

import { useTabList } from './useTabList';

const NAMES = ['a', 'b', 'c'];

function Harness({ onSelect, sharedPanel }: { onSelect: (index: number) => void; sharedPanel?: boolean }) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const { tablistProps, getTabProps } = useTabList({
        count: NAMES.length,
        selectedIndex,
        onSelect: (index) => {
            onSelect(index);
            setSelectedIndex(index);
        },
        getTabId: (index) => `tab-${NAMES[index]}`,
        getPanelId: (index) => (sharedPanel ? 'panel' : `panel-${NAMES[index]}`),
        externalPanels: true,
    });
    return (
        <div {...tablistProps}>
            {NAMES.map((name, index) => (
                <button key={name} {...getTabProps(index)}>
                    {name}
                </button>
            ))}
        </div>
    );
}

describe('useTabList', () => {
    let container: HTMLElement;
    let root: Root;
    const onSelect = vi.fn();

    beforeAll(() => {
        (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    });

    beforeEach(() => {
        onSelect.mockClear();
        container = document.createElement('div');
        document.body.append(container);
    });

    afterEach(() => {
        act(() => root.unmount());
        document.body.replaceChildren();
    });

    function render({ sharedPanel = false } = {}) {
        const panels = sharedPanel ? ['panel'] : NAMES.map((name) => `panel-${name}`);
        for (const id of panels) {
            const panel = document.createElement('div');
            panel.id = id;
            document.body.append(panel);
        }
        root = createRoot(container);
        act(() => root.render(<Harness onSelect={onSelect} sharedPanel={sharedPanel} />));
        return Array.from(container.querySelectorAll('button'));
    }

    const selectedState = (tabs: HTMLButtonElement[]) =>
        tabs.map((tab) => [tab.getAttribute('aria-selected'), tab.tabIndex]);
    const visiblePanelIds = () =>
        Array.from(document.querySelectorAll<HTMLElement>('[id^="panel"]'))
            .filter((panel) => !panel.hidden)
            .map((panel) => panel.id);

    function pressKey(tab: HTMLButtonElement, key: string) {
        const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
        act(() => {
            tab.dispatchEvent(event);
        });
        return event;
    }

    it('selects a clicked tab, keeps one tab in the tab order and shows its panel', () => {
        const tabs = render();
        expect(visiblePanelIds()).toEqual(['panel-a']);

        act(() => tabs[1].click());

        expect(onSelect).toHaveBeenCalledWith(1);
        expect(selectedState(tabs)).toEqual([
            ['false', -1],
            ['true', 0],
            ['false', -1],
        ]);
        expect(tabs[1].getAttribute('aria-controls')).toBe('panel-b');
        expect(visiblePanelIds()).toEqual(['panel-b']);
    });

    it('ignores a click on the selected tab', () => {
        const tabs = render();

        act(() => tabs[0].click());

        expect(onSelect).not.toHaveBeenCalled();
    });

    it('selects and focuses the tab a key moves to, and leaves other keys alone', () => {
        const tabs = render();

        expect(pressKey(tabs[0], 'ArrowLeft').defaultPrevented).toBe(true);
        expect(onSelect).toHaveBeenCalledWith(2);
        expect(document.activeElement).toBe(tabs[2]);

        expect(pressKey(tabs[2], 'Enter').defaultPrevented).toBe(false);
        expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it('labels a shared panel with the selected tab and keeps it shown', () => {
        const tabs = render({ sharedPanel: true });

        act(() => tabs[2].click());

        const panel = document.getElementById('panel')!;
        expect(panel.hidden).toBe(false);
        expect(panel.getAttribute('aria-labelledby')).toBe('tab-c');
    });
});
