import { EXAMPLE_RANDOM_SEED, NPM_CDN } from '@constants';

const SEEDRANDOM_CDN_URL = `${NPM_CDN}/seedrandom@3.0.5/seedrandom.min.js`;

const INIT_RANDOM_SEED = () => `
// Seed random number generator for predictable tests and examples
window.agRandom = new Math.seedrandom('${EXAMPLE_RANDOM_SEED}');
// Maintain consistency with previous Versions of the Docs by "warming up" the generator with a few calls
window.agRandom();
window.agRandom();
`;

/**
 * Inject the seedrandom library and initialise the random number generator with a seed.
 */
export const SeedRandom = ({ nonce }: { nonce?: string }) => {
    return (
        <>
            <script nonce={nonce} src={SEEDRANDOM_CDN_URL} />
            <script
                nonce={nonce}
                dangerouslySetInnerHTML={{
                    __html: INIT_RANDOM_SEED(),
                }}
            />
        </>
    );
};
