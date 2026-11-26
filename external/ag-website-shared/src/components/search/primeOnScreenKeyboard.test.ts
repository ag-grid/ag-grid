// @vitest-environment jsdom
import { primeOnScreenKeyboard } from './primeOnScreenKeyboard';

describe('primeOnScreenKeyboard', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('focuses a labelled input synchronously', () => {
        primeOnScreenKeyboard('Search');

        const proxy = document.activeElement;
        expect(proxy).toBeInstanceOf(HTMLInputElement);
        expect(proxy?.isConnected).toBe(true);
        expect(proxy?.getAttribute('aria-label')).toBe('Search');
    });

    it('removes the input once focus moves to the real one', () => {
        const realInput = document.createElement('input');
        document.body.appendChild(realInput);

        primeOnScreenKeyboard('Search');
        const proxy = document.activeElement;
        realInput.focus();

        expect(document.activeElement).toBe(realInput);
        expect(proxy?.isConnected).toBe(false);
    });
});
