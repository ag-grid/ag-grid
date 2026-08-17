(function () {
    window.process = { env: { NODE_ENV: 'development' } };

    window.addEventListener('error', function (e) {
        console.error('ERROR', e.message, e.filename);
    });
})();
