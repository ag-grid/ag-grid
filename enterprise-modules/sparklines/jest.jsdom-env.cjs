const { TestEnvironment } = require('jest-environment-jsdom');
const { Canvas } = require('canvas');

/**
 * Timezone-aware jsdom Jest environment. Supports `@timezone` JSDoc
 * pragma within test suites to set timezone.
 */
module.exports = class TimezoneAwareJSDOMEnvironment extends TestEnvironment {
    constructor(config, context) {
        super(config, context);

        this.global.OffscreenCanvas = Canvas;
    }
};
