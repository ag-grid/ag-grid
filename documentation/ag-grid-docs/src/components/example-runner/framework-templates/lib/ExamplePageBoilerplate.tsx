import { exampleRunnerAsset } from '@utils/exampleModules/exampleRunnerAsset';

interface Props {
    nonce?: string;
}

/**
 * The scaffolding every example page carries, none of which is part of the example itself --
 * see `public/example-runner/example-page.js`. Served rather than inlined, so that what a
 * reader sees in `index.html` is the example.
 */
export const ExamplePageBoilerplate = ({ nonce }: Props) => (
    <script nonce={nonce} src={exampleRunnerAsset('example-page.js')} />
);
