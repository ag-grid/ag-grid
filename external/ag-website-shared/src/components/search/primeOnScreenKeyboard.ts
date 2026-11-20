/**
 * Call from a tap handler to raise the iOS keyboard for an input that mounts after the tap. iOS only
 * shows it for a focus made during the gesture, then keeps it up as focus moves to the real input.
 */
export function primeOnScreenKeyboard(label: string): void {
    const proxy = document.createElement('input');
    proxy.tabIndex = -1;
    proxy.setAttribute('aria-label', label);
    Object.assign(proxy.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '1px',
        height: '1px',
        opacity: '0',
        pointerEvents: 'none',
        // iOS zooms the page into any input focused with a font size under 16px
        fontSize: '16px',
    });

    proxy.addEventListener('blur', () => proxy.remove(), { once: true });
    document.body.appendChild(proxy);
    proxy.focus({ preventScroll: true });
}
