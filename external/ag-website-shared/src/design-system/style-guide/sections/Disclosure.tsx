import { Collapsible } from '@ag-website-shared/components/collapsible/Collapsible';
import { Icon } from '@ag-website-shared/components/icon/Icon';
import type { FunctionComponent } from 'react';
import { useState } from 'react';

import styles from '../StyleGuide.module.scss';
import { Block, Guidance, Section } from '../chrome/Section';
import { Specimen } from '../chrome/Specimen';

/**
 * Live `Collapsible`, driven by a real button.
 *
 * A static screenshot of a disclosure is close to useless - the whole component is the transition -
 * so this one is worth the local state.
 */
const CollapsibleDemo: FunctionComponent = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={styles.disclosureDemo}>
            <button
                type="button"
                className="button-secondary"
                aria-expanded={isOpen}
                aria-controls="sg-collapsible"
                onClick={() => setIsOpen((open) => !open)}
            >
                {isOpen ? 'Hide' : 'Show'} details
                <Icon name={isOpen ? 'chevronUp' : 'chevronDown'} />
            </button>

            <Collapsible id="sg-collapsible" isOpen={isOpen}>
                <div className={styles.disclosurePanel}>
                    <p>
                        Height is animated from <code>0</code> to <code>auto</code>, so the panel does not need a known
                        height and can hold anything.
                    </p>
                </div>
            </Collapsible>
        </div>
    );
};

/**
 * Disclosure: the two ways the sites hide and reveal a block of content.
 *
 * Documented together because the choice between them is the whole decision - they are not
 * interchangeable, and the deciding factor (React vs Astro) is not obvious from either name.
 */
export const Disclosure: FunctionComponent = () => (
    <Section
        id="disclosure"
        title="Disclosure"
        source={['components/collapsible/Collapsible.tsx', 'components/expanding-section/ExpandingSection.astro']}
        lede={
            <p>
                Two components for hiding content behind a toggle. <code>Collapsible</code> animates a panel you supply
                the trigger for; <code>ExpandingSection</code> is a self-contained header-plus-panel for markdoc pages.
            </p>
        }
    >
        <Block
            title="Collapsible"
            note={
                <p>
                    An animated panel you supply the trigger for. The trigger carries <code>aria-expanded</code> and
                    points <code>aria-controls</code> at the panel.
                </p>
            }
        >
            <Specimen
                label="Wire the trigger to the panel yourself"
                code={`const [isOpen, setIsOpen] = useState(false);

<button
    aria-expanded={isOpen}
    aria-controls="details"
    onClick={() => setIsOpen((open) => !open)}
>
    {isOpen ? 'Hide' : 'Show'} details
</button>

<Collapsible id="details" isOpen={isOpen}>
    <div>…</div>
</Collapsible>`}
            >
                <CollapsibleDemo />
            </Specimen>
        </Block>

        <Block
            title="Expanding section"
            note={
                <p>
                    A header and panel in one, for markdoc pages. It is an Astro component, so it is not rendered on
                    this page.
                </p>
            }
        >
            <Specimen
                label={
                    <>
                        Markdoc: <code>{'{% expandingSection %}'}</code>
                    </>
                }
                code={`{% expandingSection headerText="Advanced configuration" %}
Content, including other markdoc tags.
{% /expandingSection %}

{% expandingSection headerText="Open by default" isOpen=true %}
…
{% /expandingSection %}`}
            />
            <Specimen
                label="Astro"
                code={`---
import ExpandingSection from '@ag-website-shared/components/expanding-section/ExpandingSection.astro';
---

<ExpandingSection headerText="Advanced configuration" isOpen={false}>
    <p>…</p>
</ExpandingSection>`}
            />
        </Block>

        <Block title="Usage">
            <Guidance
                dos={[
                    <>
                        Use <code>ExpandingSection</code> in markdoc content.
                    </>,
                    <>
                        Use <code>Collapsible</code> when the trigger is not a plain header, such as a nav item, a table
                        row or a filter panel.
                    </>,
                ]}
                donts={[
                    <>
                        Don&rsquo;t hide anything a reader needs to complete the task. Readers rarely open collapsed
                        content.
                    </>,
                    <>Don&rsquo;t build a third disclosure pattern.</>,
                    <>Don&rsquo;t nest them. Two levels of collapsed content reads as a broken page.</>,
                ]}
            />
        </Block>
    </Section>
);
