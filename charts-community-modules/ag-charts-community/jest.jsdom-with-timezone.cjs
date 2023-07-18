const { TestEnvironment } = require('jest-environment-jsdom');
const timezoneMock = require('timezone-mock');

/**
 * Timezone-aware jsdom Jest environment. Supports `@timezone` JSDoc
 * pragma within test suites to set timezone.
 */
module.exports = class TimezoneAwareJSDOMEnvironment extends TestEnvironment {
    constructor(config, context) {
        const tz = context.docblockPragmas.timezone ?? 'Europe/London';
        process.env.TZ = tz;
        timezoneMock.register(tz);

        super(config, context);
    }

    async teardown() {
        timezoneMock.unregister();

        return super.setup();
    }
};
