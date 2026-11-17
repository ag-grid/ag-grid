import { convertFunctionalTemplate, convertTemplate, getCallbackTypeArgument, getImport } from './react-utils';

describe('convertTemplate', () => {
    it('converts event handlers', () => {
        const template = '<button onclick="foo(true)">Hello!</button>';
        const converted = convertTemplate(template);

        expect(converted).toBe('<button onClick={() => this.foo(true)}>Hello!</button>');
    });

    it('removes trailing event parameter from handler calls', () => {
        const converted = convertTemplate('<button onchange="foo(true, event)">Hello!</button>');

        expect(converted).toBe('<button onChange={() => this.foo(true)}>Hello!</button>');
    });

    it('removes non-first event parameter from handler calls', () => {
        const converted = convertTemplate('<button oninput="foo(true, event, false)">Hello!</button>');

        expect(converted).toBe('<button onInput={() => this.foo(true, false)}>Hello!</button>');
    });

    it('leaves first event parameter from handler calls', () => {
        const converted = convertTemplate('<button onclick="foo(event)">Hello!</button>');

        expect(converted).toBe('<button onClick={() => this.foo(event)}>Hello!</button>');
    });

    it('handles multiple event handlers', () => {
        const template = '<div onclick="foo(true)" ondrop="bar(false)">Hello!</div>';
        const converted = convertTemplate(template);

        expect(converted).toBe('<div onClick={() => this.foo(true)} onDrop={() => this.bar(false)}>Hello!</div>');
    });

    it('fixes casing for dragover', () => {
        const template = '<div ondragover="foo(true)">Hello!</div>';
        const converted = convertTemplate(template);

        expect(converted).toBe('<div onDragOver={() => this.foo(true)}>Hello!</div>');
    });

    it('fixes casing for dragstart', () => {
        const template = '<div ondragstart="foo(true)">Hello!</div>';
        const converted = convertTemplate(template);

        expect(converted).toBe('<div onDragStart={() => this.foo(true)}>Hello!</div>');
    });

    it('ensures input tags are closed', () => {
        const template = '<input type="checkbox">';
        const converted = convertTemplate(template);

        expect(converted).toBe('<input type="checkbox" />');
    });

    it('ensures input value attributes are renamed', () => {
        const template = '<input type="text" value="foo" maxLength="20">';
        const converted = convertTemplate(template);

        expect(converted).toBe('<input type="text" defaultValue="foo" maxLength="20" />');
    });

    it('ensures the checked attribute becomes uncontrolled', () => {
        const template = '<input type="checkbox" checked="">';
        const converted = convertTemplate(template);

        expect(converted).toBe('<input type="checkbox" defaultChecked />');
    });

    it('ensures a valued checked attribute becomes uncontrolled', () => {
        const template = '<input type="checkbox" checked="checked">';
        const converted = convertTemplate(template);

        expect(converted).toBe('<input type="checkbox" defaultChecked />');
    });

    it('does not rewrite attributes that merely end in checked', () => {
        const template = '<input type="checkbox" aria-checked="true" data-checked="">';
        const converted = convertTemplate(template);

        expect(converted).toBe('<input type="checkbox" aria-checked="true" data-checked="" />');
    });

    it('does not rewrite checked appearing in an attribute value', () => {
        const template = '<input type="text" title="checked">';
        const converted = convertTemplate(template);

        expect(converted).toBe('<input type="text" title="checked" />');
    });

    it('makes an empty disabled attribute bare, since React treats disabled="" as false', () => {
        const template =
            '<button disabled="">Go</button><input type="radio" disabled=""><fieldset disabled=""></fieldset>';
        const converted = convertTemplate(template);

        expect(converted).toBe(
            '<button disabled>Go</button><input type="radio" disabled /><fieldset disabled></fieldset>'
        );
    });

    it('does not rewrite attributes that merely end in disabled', () => {
        const template = '<button aria-disabled="">Go</button>';
        const converted = convertTemplate(template);

        expect(converted).toBe('<button aria-disabled="">Go</button>');
    });

    it('does not change value attributes for other elements', () => {
        const template = '<option value="bob">';
        const converted = convertTemplate(template);

        expect(converted).toBe('<option value="bob">');
    });

    it('replaces class with className', () => {
        const template = '<div class="foo">Hello!</div>';
        const converted = convertTemplate(template);

        expect(converted).toBe('<div className="foo">Hello!</div>');
    });

    it('converts styles', () => {
        const template = '<div style="background-color: #ff0000; height: 80%">Hello!</div>';
        const converted = convertTemplate(template);

        expect(converted).toBe('<div style={{"backgroundColor":"#ff0000","height":"80%"}}>Hello!</div>');
    });
});

describe('getImport', () => {
    it('returns import statement', () => {
        const name = 'myComponent.jsx';
        const importStatement = getImport(name);

        expect(importStatement).toBe("import MyComponent from './myComponent.jsx';");
    });
});

describe('getCallbackTypeArgument', () => {
    it('returns the callback type of a grid option', () => {
        expect(getCallbackTypeArgument({ typeName: 'GetRowIdFunc<TData>', typesToInclude: ['GetRowIdFunc'] })).toBe(
            '<GetRowIdFunc<TData>>'
        );
        expect(
            getCallbackTypeArgument({
                typeName: '(params: ProcessFileInputParams<TData>) => void',
                typesToInclude: ['ProcessFileInputParams'],
            })
        ).toBe('<(params: ProcessFileInputParams<TData>) => void>');
    });

    it('returns nothing for options that are not only a callback', () => {
        expect(getCallbackTypeArgument({ typeName: 'any', typesToInclude: [] })).toBe('');
        expect(
            getCallbackTypeArgument({
                typeName: "'top' | 'bottom' | UseGroupTotalRow<TData>",
                typesToInclude: ['UseGroupTotalRow'],
            })
        ).toBe('');
        expect(getCallbackTypeArgument(undefined)).toBe('');
    });
});

describe('convertFunctionalTemplate', () => {
    it('passes a handler that takes no arguments directly', () => {
        expect(convertFunctionalTemplate('<button onclick="onBtExport()">Export</button>')).toBe(
            '<button onClick={onBtExport}>Export</button>'
        );
    });

    it('keeps the call of a handler that has parameters, so it is not given the DOM event', () => {
        expect(convertFunctionalTemplate('<button onclick="startEditing()">Edit</button>', ['startEditing'])).toBe(
            '<button onClick={() => startEditing()}>Edit</button>'
        );
    });

    it("passes React's event to a handler that reads the event, using its current target", () => {
        expect(convertFunctionalTemplate('<input oninput="onSizeChanged(event.target.valueAsNumber)">')).toBe(
            '<input onInput={(event) => onSizeChanged(event.currentTarget.valueAsNumber)} />'
        );
    });
});

describe('convertTemplate numeric attributes', () => {
    it('passes numeric attributes as numbers', () => {
        expect(convertTemplate('<textarea id="note" rows="3" cols="40"></textarea>')).toBe(
            '<textarea id="note" rows={3} cols={40}></textarea>'
        );
    });
});
