import { EXAMPLE_RANDOM_SEED, NPM_CDN } from '@constants';
import { exampleRunnerAsset } from '@utils/exampleModules/exampleRunnerAsset';

const SEEDRANDOM_CDN_URL = `${NPM_CDN}/seedrandom@3.0.5/seedrandom.min.js`;

export const SeedRandom = ({ nonce }: { nonce?: string }) => (
    <>
        <script nonce={nonce} src={SEEDRANDOM_CDN_URL} />
        <script nonce={nonce} src={exampleRunnerAsset('seed-random.js')} data-seed={EXAMPLE_RANDOM_SEED} />
    </>
);
