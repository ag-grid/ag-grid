import { exampleRunnerAsset } from '@ag-website-shared/components/example-runner/utils/exampleRunnerAsset';

export const EXAMPLE_RUNNER_SCRIPT_FILE_NAME = 'example-runner.js';

const NAMESPACE = 'agExampleRunner';

/** An export is handed its own copy, so it keeps working with no request back to the site */
export const exampleRunnerScriptSrc = (isExported?: boolean) =>
    isExported ? `./${EXAMPLE_RUNNER_SCRIPT_FILE_NAME}` : exampleRunnerAsset(EXAMPLE_RUNNER_SCRIPT_FILE_NAME);

interface ClientProps {
    isExported?: boolean;
    /** The page's CSP nonce, on the sites that set one */
    nonce?: string;
}

/** A file rather than inline bodies, so an export shows the example, not its machinery */
export const ExampleRunnerClient = ({ isExported, nonce }: ClientProps) => (
    <script nonce={nonce} src={exampleRunnerScriptSrc(isExported)} crossOrigin={isExported ? undefined : 'anonymous'} />
);

/** What survives a round trip through `JSON.stringify`, and so can be passed to the runner */
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

/** `<` is escaped so a value containing `</script>` cannot end the element early */
const toScriptLiteral = (value: JsonValue) => JSON.stringify(value).replaceAll('<', '\\u003c');

interface CallProps {
    fn: string;
    args?: JsonValue[];
    nonce?: string;
}

/** The only inline script left in an example page: the per-example call into the runtime */
export const ExampleRunnerCall = ({ fn, args = [], nonce }: CallProps) => (
    <script
        nonce={nonce}
        dangerouslySetInnerHTML={{
            __html: `${NAMESPACE}.${fn}(${args.map(toScriptLiteral).join(', ')});`,
        }}
    />
);
