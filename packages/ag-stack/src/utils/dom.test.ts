import { _isFocusableFormField } from './dom';

describe('_isFocusableFormField', () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => container.remove());

    /** Creates an element inside the container, so the visibility check sees it in the document. */
    function render(tag: string, cssClass?: string): HTMLElement {
        const element = document.createElement(tag);
        if (cssClass) {
            element.className = cssClass;
        }
        container.appendChild(element);
        return element;
    }

    /** Creates a form field nested inside a wrapper carrying `wrapperClass`. */
    function renderNested(wrapperClass: string): HTMLElement {
        const input = document.createElement('input');
        render('div', wrapperClass).appendChild(input);
        return input;
    }

    test('accepts a visible form field', () => {
        expect(_isFocusableFormField(render('input'))).toBe(true);
        expect(_isFocusableFormField(render('select'))).toBe(true);
        expect(_isFocusableFormField(render('button'))).toBe(true);
        expect(_isFocusableFormField(render('textarea'))).toBe(true);
    });

    test.each(['true', 'plaintext-only'])('accepts contenteditable="%s" and its descendants', (value) => {
        const editor = render('div');
        editor.setAttribute('contenteditable', value);
        const child = document.createElement('span');
        editor.appendChild(child);

        expect(_isFocusableFormField(editor)).toBe(true);
        expect(_isFocusableFormField(child)).toBe(true);
    });

    test('respects editable inheritance, explicit opt-outs and re-enabled descendants', () => {
        const editor = render('div');
        editor.contentEditable = 'true';
        const child = document.createElement('span');
        child.contentEditable = 'false';
        const descendant = document.createElement('span');
        child.appendChild(descendant);
        editor.appendChild(child);

        expect(_isFocusableFormField(child)).toBe(false);
        expect(_isFocusableFormField(descendant)).toBe(false);
        descendant.contentEditable = 'true';
        expect(_isFocusableFormField(descendant)).toBe(true);
        descendant.removeAttribute('contenteditable');
        child.removeAttribute('contenteditable');
        expect(_isFocusableFormField(descendant)).toBe(true);
        editor.contentEditable = 'false';
        expect(_isFocusableFormField(descendant)).toBe(false);
    });

    test('an invalid contenteditable value inherits editability', () => {
        const editor = render('div');
        const child = document.createElement('span');
        child.setAttribute('contenteditable', 'invalid');
        editor.appendChild(child);

        expect(_isFocusableFormField(child)).toBe(false);
        editor.contentEditable = 'true';
        expect(_isFocusableFormField(child)).toBe(true);
    });

    test.each(['ag-hidden', 'ag-disabled'])('rejects editable content inside %s', (cssClass) => {
        const editor = render('div', cssClass);
        editor.contentEditable = 'true';
        const child = document.createElement('span');
        editor.appendChild(child);

        expect(_isFocusableFormField(editor)).toBe(false);
        expect(_isFocusableFormField(child)).toBe(false);
    });

    test('rejects disabled or detached editable content', () => {
        const editor = render('div');
        editor.contentEditable = 'true';
        editor.setAttribute('disabled', '');
        expect(_isFocusableFormField(editor)).toBe(false);

        editor.removeAttribute('disabled');
        editor.remove();
        expect(_isFocusableFormField(editor)).toBe(false);
    });

    test('rejects an element without an isContentEditable property', () => {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        container.appendChild(svg);
        expect(_isFocusableFormField(svg)).toBe(false);
    });

    test('rejects a missing element or anything that is not a form field', () => {
        expect(_isFocusableFormField(null)).toBe(false);

        // focusable in the tab-order sense, but not a form field the browser should keep focus on
        const div = render('div');
        div.tabIndex = 0;
        expect(_isFocusableFormField(div)).toBe(false);

        const anchor = render('a');
        anchor.setAttribute('href', '#');
        expect(_isFocusableFormField(anchor)).toBe(false);
    });

    test('rejects disabled fields and fields inside a disabled subtree', () => {
        const disabled = render('input') as HTMLInputElement;
        disabled.disabled = true;
        expect(_isFocusableFormField(disabled)).toBe(false);

        expect(_isFocusableFormField(render('input', 'ag-disabled'))).toBe(false);
        expect(_isFocusableFormField(renderNested('ag-disabled'))).toBe(false);
    });

    test('accepts a disabled-styled button, which opts out of the ag-disabled exclusion', () => {
        expect(_isFocusableFormField(render('button', 'ag-disabled ag-button'))).toBe(true);
    });

    test('rejects fields hidden by ag-hidden, even without the CSS that hides them', () => {
        // no stylesheet here, so these are "visible" to the visibility check — the class alone must exclude them
        expect(_isFocusableFormField(render('input', 'ag-hidden'))).toBe(false);
        expect(_isFocusableFormField(renderNested('ag-hidden'))).toBe(false);
    });

    test('rejects a field that is not in the document', () => {
        expect(_isFocusableFormField(document.createElement('input'))).toBe(false);
    });
});
