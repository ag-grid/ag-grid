interface Props {
    nonce?: string;
}

/**
 * Examples read `process.env.NODE_ENV` to guard dev-only validations, and nothing in a browser
 * defines it.
 */
const PROCESS_ENV_SHIM = `window.process = { env: { NODE_ENV: 'development' } };`;

/** Uncaught errors are reported with the file that threw, which a module stack trace does not name */
const ERROR_REPORTER = `window.addEventListener('error', function (e) { console.error('ERROR', e.message, e.filename); });`;

/**
 * The scaffolding every example page carries, none of which is part of the example itself. It is a
 * classic script rather than a module, so the parser runs it before it reaches the deferred module
 * scripts the example is loaded through.
 */
export const ExamplePageBoilerplate = ({ nonce }: Props) => (
    <script nonce={nonce} dangerouslySetInnerHTML={{ __html: `${PROCESS_ENV_SHIM}\n${ERROR_REPORTER}` }} />
);
