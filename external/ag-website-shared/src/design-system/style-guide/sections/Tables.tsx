import type { FunctionComponent } from 'react';

import styles from '../StyleGuide.module.scss';
import { Block, Guidance, Section } from '../chrome/Section';
import { Specimen } from '../chrome/Specimen';

const ROWS = [
    { feature: 'Row grouping', community: false, enterprise: true, since: 'v18' },
    { feature: 'Sorting', community: true, enterprise: true, since: 'v1' },
    { feature: 'Pivoting', community: false, enterprise: true, since: 'v18' },
    { feature: 'CSV export', community: true, enterprise: true, since: 'v8' },
];

const Cells: FunctionComponent = () => (
    <>
        {ROWS.map((row) => (
            <tr key={row.feature}>
                <th scope="row" data-column="Feature">
                    {row.feature}
                </th>
                <td data-column="Community">{row.community ? 'Yes' : 'No'}</td>
                <td data-column="Enterprise">{row.enterprise ? 'Yes' : 'No'}</td>
                <td data-column="Since">{row.since}</td>
            </tr>
        ))}
    </>
);

const Header: FunctionComponent = () => (
    <thead>
        <tr>
            <th scope="col">Feature</th>
            <th scope="col">Community</th>
            <th scope="col">Enterprise</th>
            <th scope="col">Since</th>
        </tr>
    </thead>
);

/** Tables: the default treatment, the compact header, and the stacking behaviour for narrow widths. */
export const Tables: FunctionComponent = () => (
    <Section
        id="tables"
        title="Tables"
        source={['elements/_table.scss', 'core/_mixins.scss']}
        lede={
            <p>
                Full width, left aligned, horizontal rules between rows and no zebra striping. There is no built-in
                horizontal scrolling, so a wide table needs a scroll container or the stacking treatment below.
            </p>
        }
    >
        <Block title="Default">
            <Specimen code={`<table>`}>
                <table>
                    <Header />
                    <tbody>
                        <Cells />
                    </tbody>
                </table>
            </Specimen>
        </Block>

        <Block
            title="Compact header"
            note={<p>Regular weight and tighter padding, for when the header is a label rather than a heading.</p>}
        >
            <Specimen code={`<table class="small-header">`}>
                <table className="small-header">
                    <Header />
                    <tbody>
                        <Cells />
                    </tbody>
                </table>
            </Specimen>
        </Block>

        <Block
            title="Stacking on narrow widths"
            note={
                <p>
                    Collapses each row into a block and relabels every cell from its <code>data-column</code> attribute
                    - so cells must carry it, or they lose their meaning. Available as the <code>stack-table()</code>{' '}
                    mixin too, for stacking at a component&rsquo;s own breakpoint rather than always.
                </p>
            }
        >
            <Specimen
                label="Always stacked"
                code={`<table class="stack">
    <tbody>
        <tr>
            <th scope="row" data-column="Feature">Row grouping</th>
            <td data-column="Community">No</td>
        </tr>
    </tbody>
</table>`}
            >
                <div className={styles.narrowDemo}>
                    <table className="stack">
                        <Header />
                        <tbody>
                            <Cells />
                        </tbody>
                    </table>
                </div>
            </Specimen>

            <Specimen
                label="Stacked below a breakpoint"
                code={`@use 'design-system' as *;

.myTable {
    @media (max-width: $breakpoint-table-small) {
        @include stack-table();
    }
}`}
            />
        </Block>

        <Block title="Usage">
            <Guidance
                dos={[
                    <>
                        Mark header cells with <code>&lt;th scope&gt;</code>.
                    </>,
                    <>
                        Wrap a wide table in a scrolling container with <code>tabindex=&quot;0&quot;</code>, so it can
                        be scrolled by keyboard.
                    </>,
                ]}
                donts={[
                    <>
                        Don&rsquo;t put <code>role=&quot;grid&quot;</code> on a static table.
                    </>,
                ]}
            />
        </Block>
    </Section>
);
