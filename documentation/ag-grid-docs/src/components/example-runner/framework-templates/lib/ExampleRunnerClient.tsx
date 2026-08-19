import { exampleRunnerAsset } from '@utils/exampleModules/exampleRunnerAsset';

export const EXAMPLE_RUNNER_SCRIPT_FILE_NAME = 'example-runner.js';

const NAMESPACE = 'agExampleRunner';

export const exampleRunnerScriptSrc = (isExported?: boolean) =>
    isExported ? `./${EXAMPLE_RUNNER_SCRIPT_FILE_NAME}` : exampleRunnerAsset(EXAMPLE_RUNNER_SCRIPT_FILE_NAME);

interface ClientProps {
    isExported?: boolean;
    nonce?: string;
}

export const ExampleRunnerClient = ({ isExported, nonce }: ClientProps) => (
    <script nonce={nonce} src={exampleRunnerScriptSrc(isExported)} crossOrigin={isExported ? undefined : 'anonymous'} />
);

const toScriptLiteral = (value: unknown) => JSON.stringify(value).replaceAll('<', '\\u003c');

interface CallProps {
    fn: string;
    args?: unknown[];
    nonce?: string;
}

export const ExampleRunnerCall = ({ fn, args = [], nonce }: CallProps) => (
    <script
        nonce={nonce}
        dangerouslySetInnerHTML={{
            __html: `${NAMESPACE}.${fn}(${args.map(toScriptLiteral).join(', ')});`,
        }}
    />
);
