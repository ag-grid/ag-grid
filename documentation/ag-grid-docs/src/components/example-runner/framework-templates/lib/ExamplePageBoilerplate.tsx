import { exampleRunnerAsset } from '@utils/exampleModules/exampleRunnerAsset';

interface Props {
    /**
     * Whether the page is exported to Plunker or CodeSandbox, and so cannot rely on the served
     * scaffolding being reachable
     */
    isExported?: boolean;
    nonce?: string;
}

/**
 * Examples guard their dev-only validations on `process.env.NODE_ENV`, which nothing in a browser
 * defines. Inlined for exported pages so that the guard resolves without a request to us: it runs
 * at the example's top level, so failing to define it stops the example loading at all.
 *
 * Kept in step with `public/example-runner/example-page.js`, which defines the same thing for
 * pages served by the site.
 */
const PROCESS_SHIM = `window.process = { env: { NODE_ENV: 'development' } };`;

/**
 * The scaffolding every example page carries, none of which is part of the example itself --
 * see `public/example-runner/example-page.js`. Served rather than inlined, so that what a
 * reader sees in `index.html` is the example.
 */
export const ExamplePageBoilerplate = ({ isExported, nonce }: Props) => (
    <>
        {isExported && <script nonce={nonce} dangerouslySetInnerHTML={{ __html: PROCESS_SHIM }} />}
        <script nonce={nonce} src={exampleRunnerAsset('example-page.js')} />
    </>
);
