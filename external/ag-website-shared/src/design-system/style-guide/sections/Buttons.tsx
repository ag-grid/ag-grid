import { Icon } from '@ag-website-shared/components/icon/Icon';
import classnames from 'classnames';
import type { FunctionComponent } from 'react';

import styles from '../StyleGuide.module.scss';
import { CopyButton } from '../chrome/CopyButton';
import { Block, Guidance, KnownIssue, Section } from '../chrome/Section';
import { Specimen, Variant } from '../chrome/Specimen';

const VARIANTS = [
    {
        className: undefined,
        label: 'Primary',
        use: 'The one action you want on the page. A bare <button> is already primary - no class needed.',
    },
    { className: 'button-secondary', label: 'Secondary', use: 'Neutral alternatives beside a primary action.' },
    {
        className: 'button-tertiary',
        label: 'Tertiary',
        use: 'Low-emphasis actions, and brand-tinted actions in dense UI.',
    },
    { className: 'button-as-link', label: 'As link', use: 'An action that should read as a link. Still a button.' },
    {
        className: 'button-style-none',
        label: 'Unstyled',
        use: 'Strips all button chrome. For wrapping custom content in a real button.',
    },
];

/**
 * States rendered as a matrix. Hover, focus and active have `.hover` / `.focus` class equivalents in
 * `elements/_button.scss` precisely so a guide can show them all at once.
 */
const STATES: { label: string; className?: string; disabled?: boolean; ariaDisabled?: boolean }[] = [
    { label: 'Default' },
    { label: 'Hover', className: 'hover' },
    { label: 'Focus', className: 'focus' },
    { label: 'Disabled', disabled: true },
    { label: 'Aria disabled', ariaDisabled: true },
];

/** Buttons: variants, every state, and the disabled-versus-aria-disabled distinction. */
export const Buttons: FunctionComponent = () => (
    <Section
        id="buttons"
        title="Buttons"
        source="elements/_button.scss"
        lede={
            <>
                <p>
                    Buttons are styled by element, so <code>&lt;button&gt;</code> with no class is the primary variant.
                    Variants are single classes on top of that. <code>input[type=submit]</code> and{' '}
                    <code>input[type=reset]</code> get the same treatment, and <code>.button</code> lets a link adopt
                    it.
                </p>
                <p>
                    Every variant carries the full state set: hover, active, focus ring and two kinds of disabled. The
                    focus ring is a 4px <code>box-shadow</code> rather than an outline, which is why it follows the
                    border radius.
                </p>
            </>
        }
    >
        <Block title="Variants and states">
            <div className={styles.tableScroll}>
                <table className={styles.tokenTable}>
                    <thead>
                        <tr>
                            <th scope="col">Variant</th>
                            {STATES.map(({ label }) => (
                                <th key={label} scope="col">
                                    {label}
                                </th>
                            ))}
                            <th scope="col">Use for</th>
                        </tr>
                    </thead>
                    <tbody>
                        {VARIANTS.map(({ className, label, use }) => (
                            <tr key={label}>
                                <td data-column="Variant">
                                    <CopyButton
                                        value={className ?? '<button>'}
                                        label={className ? `.${className}` : '<button>'}
                                        inline
                                    />
                                </td>
                                {STATES.map((state) => (
                                    <td key={state.label} data-column={state.label}>
                                        <button
                                            type="button"
                                            className={classnames(className, state.className)}
                                            disabled={state.disabled}
                                            aria-disabled={state.ariaDisabled}
                                        >
                                            Button
                                        </button>
                                    </td>
                                ))}
                                <td data-column="Use for">{use}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Block>

        <Block
            title="disabled or aria-disabled"
            note={
                <p>
                    Both look the same. They behave differently on purpose: <code>disabled</code> also sets{' '}
                    <code>pointer-events: none</code> and removes the button from the tab order, whereas{' '}
                    <code>aria-disabled</code> leaves it focusable and hoverable while still announcing it as disabled.
                </p>
            }
        >
            <Specimen
                row
                code={`<!-- Removed from the tab order. Nobody can reach it to find out why. -->
<button disabled>Submit</button>

<!-- Focusable and hoverable, announced as disabled. Pair with an
     explanation of what would enable it. -->
<button aria-disabled="true">Submit</button>`}
            >
                <Variant name="disabled">
                    <button type="button" disabled>
                        Submit
                    </button>
                </Variant>
                <Variant name="aria-disabled">
                    <button type="button" aria-disabled>
                        Submit
                    </button>
                </Variant>
            </Specimen>
            <p>
                Prefer <code>aria-disabled</code> for a form submit that is blocked by validation: a keyboard user can
                still reach the button, and you can explain what is missing. Use <code>disabled</code> only when the
                control is genuinely inert and its state is obvious from context.
            </p>
        </Block>

        <Block
            title="With icons"
            note={
                <p>
                    Each variant sets <code>--icon-color</code> to its own foreground, so an <code>Icon</code> inside a
                    button follows the variant and its hover state without extra styling. Icons in buttons are sized at{' '}
                    <code>2em</code> and negatively margined so they do not increase the button&rsquo;s height.
                </p>
            }
        >
            <Specimen
                row
                code={`<button>
    Run example <Icon name="play" />
</button>`}
            >
                <Variant name="Primary">
                    <button type="button">
                        Run example <Icon name="play" />
                    </button>
                </Variant>
                <Variant name="Secondary">
                    <button type="button" className="button-secondary">
                        Copy <Icon name="copy" />
                    </button>
                </Variant>
                <Variant name="Tertiary">
                    <button type="button" className="button-tertiary">
                        Open <Icon name="newTab" />
                    </button>
                </Variant>
                <Variant name="As link">
                    <button type="button" className="button-as-link">
                        Show more <Icon name="chevronDown" />
                    </button>
                </Variant>
            </Specimen>
        </Block>

        <Block
            title="Links styled as buttons"
            note={
                <p>
                    Add <code>.button</code>, <code>.button-secondary</code> or <code>.button-tertiary</code> to an{' '}
                    <code>&lt;a&gt;</code> when a navigation target should carry a button&rsquo;s visual weight. It
                    stays a link, so it keeps middle-click, right-click and open-in-new-tab.
                </p>
            }
        >
            <Specimen row code={`<a href="/pricing" class="button">See pricing</a>`}>
                <Variant name=".button">
                    <a href="#buttons" className="button">
                        See pricing
                    </a>
                </Variant>
                <Variant name=".button-secondary">
                    <a href="#buttons" className="button-secondary">
                        Documentation
                    </a>
                </Variant>
                <Variant name=".button-tertiary">
                    <a href="#buttons" className="button-tertiary">
                        Examples
                    </a>
                </Variant>
            </Specimen>
        </Block>

        <Block title="Using buttons">
            <Guidance
                dos={[
                    <>
                        Use one primary button per view. Two primaries side by side leave no indication of which action
                        is expected.
                    </>,
                    <>
                        Label with the action, not the mechanism: &ldquo;Download trial&rdquo; rather than
                        &ldquo;Submit&rdquo;.
                    </>,
                    <>
                        Set <code>type=&quot;button&quot;</code> on any button inside a form that is not the submit
                        control - the default is <code>submit</code>.
                    </>,
                    <>
                        Use <code>.button-style-none</code> when you need a real button for accessibility but none of
                        its appearance.
                    </>,
                ]}
                donts={[
                    <>
                        Don&rsquo;t use a <code>&lt;div&gt;</code> with a click handler. A button gives you keyboard
                        activation, focus and the correct role for free.
                    </>,
                    <>
                        Don&rsquo;t remove the focus ring. It is a <code>box-shadow</code>, so overriding{' '}
                        <code>box-shadow</code> on a button will remove it by accident - re-declare it if you must
                        restyle.
                    </>,
                    <>
                        Don&rsquo;t use <code>disabled</code> for a submit blocked by validation; the user cannot focus
                        it to discover why.
                    </>,
                ]}
            />
        </Block>

        <KnownIssue>
            <p>
                <strong>
                    A <code>.button-style-none</code> label disappears on hover.
                </strong>{' '}
                Look at the Hover cell of its row in the matrix above - it is blank. The base button rule sets{' '}
                <code>color: var(--color-button-primary-fg)</code> on <code>:hover</code>, and{' '}
                <code>.button-style-none</code> resets only <code>background-color</code> and <code>border</code>, not{' '}
                <code>color</code>. The label therefore becomes white on a transparent background: measured, it goes
                from <code>rgb(16, 24, 40)</code> to <code>rgb(255, 255, 255)</code> while the background stays{' '}
                <code>rgba(0, 0, 0, 0)</code>.
            </p>
            <p>
                <code>.button-as-link</code> is unaffected because it declares its own hover colour. The fix is for{' '}
                <code>.button-style-none</code> to do the same in <code>elements/_button.scss</code>. Until then, any
                usage that does not set its own colour has an invisible hover state - there are around a dozen, in the
                docs navigation, the tab strip, the video player and the example runner&rsquo;s code viewer.
            </p>
        </KnownIssue>
    </Section>
);
