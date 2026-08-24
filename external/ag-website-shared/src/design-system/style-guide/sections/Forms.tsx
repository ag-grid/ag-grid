import { ConsentCheckbox } from '@ag-website-shared/components/consent-fields/ConsentCheckbox';
import { Select } from '@ag-website-shared/components/select/Select';
import classnames from 'classnames';
import type { FunctionComponent, ReactNode } from 'react';
import { useState } from 'react';

import styles from '../StyleGuide.module.scss';
import { CopyButton } from '../chrome/CopyButton';
import { Block, Gotcha, KnownIssue, Section } from '../chrome/Section';
import { Specimen } from '../chrome/Specimen';

interface FrameworkOption {
    value: string;
    label: string;
}

const FRAMEWORKS: FrameworkOption[] = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'react', label: 'React' },
    { value: 'angular', label: 'Angular' },
    { value: 'vue', label: 'Vue' },
];

/** Live `Select`, which is controlled and so needs somewhere to keep the value. */
const SelectDemo: FunctionComponent = () => {
    const [framework, setFramework] = useState(FRAMEWORKS[0]);
    const [large, setLarge] = useState(FRAMEWORKS[1]);

    return (
        <div className={styles.formDemo}>
            <Select
                options={FRAMEWORKS}
                value={framework}
                onChange={setFramework}
                triggerAriaLabel="Framework"
                isPopper
            />
            <Select
                options={FRAMEWORKS}
                value={large}
                onChange={setLarge}
                triggerAriaLabel="Framework, large"
                isLarge
                isPopper
            />
        </div>
    );
};

/** Live `ConsentCheckbox`, including the nested and error variants it exists for. */
const ConsentDemo: FunctionComponent = () => {
    const [optIn, setOptIn] = useState(false);
    const [terms, setTerms] = useState(false);

    return (
        <div className={styles.consentDemo}>
            <ConsentCheckbox
                id="sg-consent-terms"
                label={<>I accept the terms of the licence agreement</>}
                error={terms ? undefined : 'You must accept the terms to continue'}
                inputProps={{ checked: terms, onChange: (event) => setTerms(event.target.checked) }}
            />
            <ConsentCheckbox
                id="sg-consent-optin"
                label={<>Email me about new releases</>}
                inputProps={{ checked: optIn, onChange: (event) => setOptIn(event.target.checked) }}
            />
            {optIn && (
                <ConsentCheckbox id="sg-consent-nested" label={<>Include beta releases</>} nested inputProps={{}} />
            )}
        </div>
    );
};

const STATES = ['Default', 'Hover', 'Focus', 'Disabled'] as const;
type State = (typeof STATES)[number];

/** Class the design system uses to force a visual state, so a guide can render all four at once. */
const stateClass = (state: State): string | undefined =>
    state === 'Hover' ? 'hover' : state === 'Focus' ? 'focus' : undefined;

const isDisabled = (state: State) => state === 'Disabled';

/**
 * Compacts a markup string to selector form for display: `<input type="checkbox" class="switch" />`
 * becomes `input[type=checkbox].switch`.
 *
 * The full markup stays on the clipboard - it is only the *displayed* form that is shortened, so
 * the column does not push the states matrix into horizontal scroll.
 */
const toSelector = (markup: string): string => {
    const tag = /^<(\w+)/.exec(markup)?.[1] ?? markup;
    const type = /type="([\w-]+)"/.exec(markup)?.[1];
    const className = /class="([\w\s-]+)"/.exec(markup)?.[1];
    const placeholder = markup.includes('placeholder') ? '[placeholder]' : '';

    return [
        tag,
        type ? `[type=${type}]` : '',
        className ? `.${className.trim().split(/\s+/).join('.')}` : '',
        placeholder,
    ].join('');
};

const CONTROLS: { label: string; markup: string; render: (state: State) => ReactNode }[] = [
    {
        label: 'Text',
        markup: `<input type="text" />`,
        render: (state) => (
            <input
                type="text"
                className={stateClass(state)}
                disabled={isDisabled(state)}
                defaultValue="joe@ag-grid.com"
                aria-label="Text input example"
            />
        ),
    },
    {
        label: 'Text, empty',
        markup: `<input type="text" placeholder="Enter email" />`,
        render: (state) => (
            <input
                type="text"
                className={stateClass(state)}
                disabled={isDisabled(state)}
                placeholder="Enter email"
                aria-label="Placeholder input example"
            />
        ),
    },
    {
        label: 'Textarea',
        markup: `<textarea />`,
        render: (state) => (
            <textarea
                className={stateClass(state)}
                disabled={isDisabled(state)}
                defaultValue="How can we help?"
                rows={2}
                aria-label="Textarea example"
            />
        ),
    },
    {
        label: 'Select',
        markup: `<select>`,
        render: (state) => (
            <select className={stateClass(state)} disabled={isDisabled(state)} aria-label="Select example">
                <option>Community</option>
                <option>Enterprise</option>
            </select>
        ),
    },
    {
        label: 'Checkbox',
        markup: `<input type="checkbox" />`,
        render: (state) => (
            <input
                type="checkbox"
                className={stateClass(state)}
                disabled={isDisabled(state)}
                defaultChecked
                aria-label="Checkbox example"
            />
        ),
    },
    {
        label: 'Radio',
        markup: `<input type="radio" />`,
        render: (state) => (
            <input
                type="radio"
                className={stateClass(state)}
                disabled={isDisabled(state)}
                defaultChecked
                aria-label="Radio example"
            />
        ),
    },
    {
        label: 'Switch',
        markup: `<input type="checkbox" class="switch" />`,
        render: (state) => (
            <input
                type="checkbox"
                className={classnames('switch', stateClass(state))}
                disabled={isDisabled(state)}
                defaultChecked
                aria-label="Switch example"
            />
        ),
    },
    {
        label: 'Range',
        markup: `<input type="range" />`,
        render: (state) => (
            <input
                type="range"
                className={stateClass(state)}
                disabled={isDisabled(state)}
                defaultValue={60}
                aria-label="Range example"
            />
        ),
    },
];

/** Form controls, the `.input-field` layout wrapper, and error presentation. */
export const Forms: FunctionComponent = () => (
    <Section
        id="forms"
        title="Form controls"
        source="elements/_form-elements.scss"
        lede={
            <p>
                Styled by element and type, so plain HTML forms come out correct - checkboxes, radios and switches are
                custom-drawn and need no wrapper markup. Focus is a <code>box-shadow</code> ring on{' '}
                <code>:focus-visible</code> only, so it appears for keyboard users and not on mouse click.
            </p>
        }
    >
        <Block title="Controls and states">
            <div className={styles.tableScroll}>
                <table className={styles.tokenTable}>
                    <thead>
                        <tr>
                            <th scope="col">Control</th>
                            {STATES.map((state) => (
                                <th key={state} scope="col">
                                    {state}
                                </th>
                            ))}
                            <th scope="col">Markup</th>
                        </tr>
                    </thead>
                    <tbody>
                        {CONTROLS.map(({ label, markup, render }) => (
                            <tr key={label}>
                                <td data-column="Control">
                                    <strong>{label}</strong>
                                </td>
                                {STATES.map((state) => (
                                    <td key={state} data-column={state}>
                                        {render(state)}
                                    </td>
                                ))}
                                <td data-column="Markup">
                                    <CopyButton value={markup} label={toSelector(markup)} inline />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Block>

        <Block
            title="Field layout"
            note={
                <p>
                    <code>.input-field</code> stacks label above control. Add <code>.inline</code> for one row instead.
                </p>
            }
        >
            <Specimen
                label="Stacked"
                code={`<div class="input-field">
    <label for="email">Email</label>
    <input id="email" type="text" placeholder="Enter email" />
</div>`}
            >
                <div className={styles.formDemo}>
                    <div className="input-field">
                        <label htmlFor="sg-email">Email</label>
                        <input id="sg-email" type="text" placeholder="Enter email" />
                    </div>
                    <div className="input-field">
                        <label htmlFor="sg-licence">Licence</label>
                        <select id="sg-licence">
                            <option>Community</option>
                            <option>Enterprise</option>
                        </select>
                    </div>
                </div>
            </Specimen>

            <Specimen
                label="Inline"
                code={`<div class="input-field inline">
    <label for="seats">Seats</label>
    <input id="seats" type="number" value="5" />
</div>`}
            >
                <div className={styles.formDemo}>
                    <div className="input-field inline">
                        <label htmlFor="sg-seats">Seats</label>
                        <input id="sg-seats" type="number" defaultValue={5} />
                    </div>
                    <div className="input-field inline">
                        <label htmlFor="sg-newsletter">Send me release notes</label>
                        <input id="sg-newsletter" type="checkbox" className="switch" />
                    </div>
                </div>
            </Specimen>
        </Block>

        <Block
            title="Errors and hints"
            note={
                <p>
                    <code>.input-error</code> on the wrapper reddens the border and fades in <code>.error</code>, which
                    is always in the DOM at zero opacity so adding it does not shift the layout.{' '}
                    <code>.extra-info</code> is non-error help text; <code>.req</code> marks a required label.
                </p>
            }
        >
            <Specimen
                label="Valid, with hint"
                code={`<div class="input-field">
    <label for="key">Licence key <span class="req">*</span></label>
    <input id="key" type="text" />
    <span class="error">Enter a valid licence key</span>
    <span class="extra-info">Found in your order confirmation email</span>
</div>`}
            >
                <div className={styles.formDemo}>
                    <div className="input-field">
                        <label htmlFor="sg-key">
                            Licence key <span className="req">*</span>
                        </label>
                        <input id="sg-key" type="text" defaultValue="AG-0123456789" />
                        <span className="error">Enter a valid licence key</span>
                        <span className="extra-info">Found in your order confirmation email</span>
                    </div>
                </div>
            </Specimen>

            <Specimen label="In error" code={`<div class="input-field input-error">`}>
                <div className={styles.formDemo}>
                    <div className="input-field input-error">
                        <label htmlFor="sg-key-error">
                            Licence key <span className="req">*</span>
                        </label>
                        <input id="sg-key-error" type="text" defaultValue="not-a-key" aria-invalid />
                        <span className="error">Enter a valid licence key</span>
                        <span className="extra-info">Found in your order confirmation email</span>
                    </div>
                </div>
            </Specimen>
        </Block>

        <Block
            title="Select"
            note={
                <p>
                    A Radix-backed listbox, used wherever a native <code>&lt;select&gt;</code> cannot be styled far
                    enough - the framework selector, version pickers, the docs navigation. It is generic over the option
                    type rather than taking <code>{'{ value, label }'}</code> pairs, so it can be driven straight from
                    whatever list you already have.
                </p>
            }
        >
            <Specimen
                label="Controlled, with the default and large sizes"
                code={`const [framework, setFramework] = useState(FRAMEWORKS[0]);

<Select
    options={FRAMEWORKS}
    value={framework}
    onChange={setFramework}
    triggerAriaLabel="Framework"
    isPopper
/>`}
            >
                <SelectDemo />
            </Specimen>

            <Specimen
                label="Props"
                code={`options: O[]                  // required
value: O                      // required; controlled
onChange: (next: O) => void   // required
triggerAriaLabel?: string     // DEFAULTS TO "Framework selector"
getKey?: (item: O) => string  // default: item.value, or the string itself
getLabel?: (item: O) => string        // default: item.label
getGroupLabel?: (item: O) => string   // default: item.groupLabel - groups the list
renderItem?: (item: O) => ReactNode   // full control over the option's contents
placeholder?: string
isPopper?: boolean            // anchor to the trigger rather than align to the item
isLarge?: boolean
constrainHeight?: boolean     // cap the dropdown and scroll inside it
side?: 'top' | 'right' | 'bottom' | 'left'   // isPopper only
className?: string            // on the trigger
contentClassName?: string     // on the dropdown, e.g. to match the trigger width`}
            >
                <p>
                    Returning a <code>groupLabel</code> from <code>getGroupLabel</code> is all it takes to get grouped
                    options with headings - there is no separate group API, and options sharing a label are collected
                    together in first-seen order.
                </p>
            </Specimen>
        </Block>

        <Block
            title="Consent checkbox"
            note={
                <p>
                    A checkbox whose label is a block of prose - licence terms, marketing opt-ins - rather than a word.
                    It wires up <code>aria-invalid</code> and <code>aria-describedby</code> from the <code>error</code>{' '}
                    prop, which is the part hand-rolled consent checkboxes routinely miss.
                </p>
            }
        >
            <Specimen
                label="Tick the opt-in to reveal the nested checkbox"
                code={`<ConsentCheckbox
    id="terms"
    label={<>I accept the <a href="/eula">terms</a></>}
    error={accepted ? undefined : 'You must accept the terms to continue'}
    inputProps={{ checked: accepted, onChange: (e) => setAccepted(e.target.checked) }}
/>

{/* nested indents a checkbox that only the one above it reveals */}
<ConsentCheckbox id="beta" label={<>Include beta releases</>} nested inputProps={{}} />`}
            >
                <ConsentDemo />
            </Specimen>
            <p>
                <code>label</code> is a <code>ReactNode</code>, so it can contain links - which is the point, since
                consent copy almost always has to link to the agreement. The whole label is inside{' '}
                <code>&lt;label&gt;</code> and therefore clickable, so keep it to the sentence being consented to and
                put anything longer beside it.
            </p>
        </Block>

        <Gotcha>
            <code>.input-error</code> and <code>.req</code> are visual only - pair them with <code>aria-invalid</code>,{' '}
            <code>aria-describedby</code> and <code>required</code> so the state is actually announced. Never use a
            placeholder as the label: it disappears on input. And don&rsquo;t restyle the focus ring, since{' '}
            <code>outline</code> is cleared and the ring is the only indicator these controls have.
        </Gotcha>

        <KnownIssue>
            <p>
                <code>--color-input-error</code> is the bare keyword <code>red</code> rather than a palette token, so it
                is the same value in both themes and sits outside the colour system entirely. Its contrast against the
                dark background is poor.
            </p>
            <p>
                <code>Select</code> defaults <code>triggerAriaLabel</code> to the string{' '}
                <code>&quot;Framework selector&quot;</code>. Every caller that does not pass one - and the prop is
                optional, so it is easy to miss - announces itself as a framework selector regardless of what it
                actually selects.
            </p>
            <p>
                <code>Select</code> wraps <code>getOptionContent</code> in a <code>useCallback</code> with an empty
                dependency array while it closes over the <code>getKey</code>, <code>getLabel</code> and{' '}
                <code>renderItem</code> props. A caller that passes an inline arrow - the normal way to pass these -
                gets the first render&rsquo;s version pinned for the component&rsquo;s lifetime, so an option renderer
                that depends on anything outside <code>options</code> silently goes stale.
            </p>
            <p>
                Disabled text inputs set <code>cursor: pointer</code> alongside <code>pointer-events: none</code> in{' '}
                <code>elements/_form-elements.scss</code>, which reads as a copy-paste slip - a disabled control should
                not suggest it is clickable.
            </p>
        </KnownIssue>
    </Section>
);
