/**
 * The scaffolding every example page carries, none of which is part of the example itself.
 *
 * Served as a classic script rather than inlined, so that an example's `index.html` carries no
 * machinery. Classic scripts run before deferred module scripts, so both of these are in place
 * by the time the example's own code runs.
 */
(function () {
    // Examples read `process.env.NODE_ENV` to guard dev-only validations, and nothing in a
    // browser defines it.
    // NOTE: exported pages cannot depend on this file being reachable, so they inline the same
    // definition -- keep `ExamplePageBoilerplate`'s copy in step with this one
    window.process = { env: { NODE_ENV: 'development' } };

    // Uncaught errors are reported with the file that threw, which a module stack trace does
    // not name
    window.addEventListener('error', function (e) {
        console.error('ERROR', e.message, e.filename);
    });
})();
