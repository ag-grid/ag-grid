import { EXAMPLE_RANDOM_SEED, NPM_CDN } from '@constants';
import { exampleRunnerAsset } from '@utils/exampleModules/exampleRunnerAsset';

const SEEDRANDOM_CDN_URL = `${NPM_CDN}/seedrandom@3.0.5/seedrandom.min.js`;

/**
 * Loads seedrandom and initialises the generator with the shared seed, so an example generating its own
 * data is predictable. The seed travels as an attribute, being the site's constant. See
 * `public/example-runner/seed-random.js`.
 */
export const SeedRandom = ({ nonce }: { nonce?: string }) => (
    <>
        <script nonce={nonce} src={SEEDRANDOM_CDN_URL} />
        <script nonce={nonce} src={exampleRunnerAsset('seed-random.js')} data-seed={EXAMPLE_RANDOM_SEED} />
    </>
);
