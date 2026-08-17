import { exampleRunnerAsset } from '@utils/exampleModules/exampleRunnerAsset';

interface Props {
    isExported?: boolean;
    nonce?: string;
}

const PROCESS_SHIM = `window.process = { env: { NODE_ENV: 'development' } };`;

export const ExamplePageBoilerplate = ({ isExported, nonce }: Props) => (
    <>
        {isExported && <script nonce={nonce} dangerouslySetInnerHTML={{ __html: PROCESS_SHIM }} />}
        <script nonce={nonce} src={exampleRunnerAsset('example-page.js')} crossOrigin="anonymous" />
    </>
);
