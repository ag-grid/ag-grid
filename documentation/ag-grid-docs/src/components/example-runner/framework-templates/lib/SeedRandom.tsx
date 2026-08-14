import { EXAMPLE_RANDOM_SEED, NPM_CDN } from '@constants';
import { exampleRunnerAsset } from '@utils/exampleModules/exampleRunnerAsset';

const SEEDRANDOM_CDN_URL = `${NPM_CDN}/seedrandom@3.0.5/seedrandom.min.js`;

/**
 * Loads the seedrandom library and initialises the generator with the shared seed, so that an
 * example generating its own data is predictable -- see `public/example-runner/seed-random.js`.
 * The seed travels as an attribute, since it is the site's constant rather than the script's.
 */
export const SeedRandom = ({ nonce }: { nonce?: string }) => (
    <>
        <script nonce={nonce} src={SEEDRANDOM_CDN_URL} />
        <script nonce={nonce} src={exampleRunnerAsset('seed-random.js')} data-seed={EXAMPLE_RANDOM_SEED} />
    </>
);
