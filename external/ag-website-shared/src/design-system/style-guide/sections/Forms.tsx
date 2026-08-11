import classnames from 'classnames';
import type { FunctionComponent, ReactNode } from 'react';

import styles from '../StyleGuide.module.scss';
import { CopyButton } from '../chrome/CopyButton';
import { Block, Gotcha, KnownIssue, Section } from '../chrome/Section';
import { Specimen } from '../chrome/Specimen';

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
                Disabled text inputs set <code>cursor: pointer</code> alongside <code>pointer-events: none</code> in{' '}
                <code>elements/_form-elements.scss</code>, which reads as a copy-paste slip - a disabled control should
                not suggest it is clickable.
            </p>
        </KnownIssue>
    </Section>
);
