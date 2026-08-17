/**
 * Scaffolding every example page carries, none of it part of the example. Served, so `index.html`
 * carries no machinery; classic, so it runs before the deferred module scripts.
 */
(function () {
    // Examples guard dev-only validations on `process.env.NODE_ENV`, which no browser defines.
    // NOTE: exports inline the same definition -- keep `ExamplePageBoilerplate`'s copy in step
    window.process = { env: { NODE_ENV: 'development' } };

    // Reported with the file that threw, which a module stack trace does not name
    window.addEventListener('error', function (e) {
        console.error('ERROR', e.message, e.filename);
    });
})();
