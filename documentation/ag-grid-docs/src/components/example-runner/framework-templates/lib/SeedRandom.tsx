import { ExampleRunnerCall } from '@ag-website-shared/components/example-runner/components/ExampleRunnerClient';
import { EXAMPLE_RANDOM_SEED, NPM_CDN } from '@constants';

const SEEDRANDOM_CDN_URL = `${NPM_CDN}/seedrandom@3.0.5/seedrandom.min.js`;

export const SeedRandom = ({ nonce }: { nonce?: string }) => (
    <>
        <script nonce={nonce} src={SEEDRANDOM_CDN_URL} />
        <ExampleRunnerCall fn="seedRandom" args={[EXAMPLE_RANDOM_SEED]} nonce={nonce} />
    </>
);
