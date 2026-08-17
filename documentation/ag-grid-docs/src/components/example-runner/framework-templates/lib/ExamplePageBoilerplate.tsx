import { exampleRunnerAsset } from '@utils/exampleModules/exampleRunnerAsset';

interface Props {
    /** Whether the page is exported, and so cannot rely on reaching the served scaffolding */
    isExported?: boolean;
    nonce?: string;
}

/**
 * Examples guard their dev-only validations on `process.env.NODE_ENV`, which no browser defines.
 * Inlined for exports so the guard resolves without a request to us: it runs at the example's top
 * level, so a failed request would stop the example loading at all. Kept in step with
 * `public/example-runner/example-page.js`, which defines the same for served pages.
 */
const PROCESS_SHIM = `window.process = { env: { NODE_ENV: 'development' } };`;

/**
 * The scaffolding every example page carries, none of it part of the example itself. Served, so what a
 * reader sees in `index.html` is the example. See `public/example-runner/example-page.js`.
 *
 * Requested with CORS because an export fetches it cross-origin: a classic script tag otherwise sends
 * no `Origin`, which the dev server rejects as a cross-site request.
 */
export const ExamplePageBoilerplate = ({ isExported, nonce }: Props) => (
    <>
        {isExported && <script nonce={nonce} dangerouslySetInnerHTML={{ __html: PROCESS_SHIM }} />}
        <script nonce={nonce} src={exampleRunnerAsset('example-page.js')} crossOrigin="anonymous" />
    </>
);
