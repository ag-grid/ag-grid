const socket = new WebSocket(`ws://${location.host}`);
socket.addEventListener('message', (e) => {
    const message = JSON.parse(e.data);
    if (message.type === 'reload-full') {
        location.reload();
    }
    if (message.type === 'reload-css') {
        /** @type {NodeListOf<HTMLLinkElement>} */
        const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
        stylesheets.forEach((style) => {
            const query = `?livereload=${Date.now()}`;
            /** @type {HTMLLinkElement} */
            const newStyle = /** @type {any} */(style.cloneNode());
            newStyle.href = `${style.href.replace(/\?.*$/, '')}${query}`;
            style.replaceWith(newStyle);
        });
    }
});
