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
