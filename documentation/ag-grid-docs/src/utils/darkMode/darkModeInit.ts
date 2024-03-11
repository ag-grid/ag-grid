export function darkModeInit() {
    const htmlEl = document.querySelector('html');
    const localDarkmode = localStorage['documentation:darkmode'];
    const isOSDarkmode = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches).toString();

    if (localDarkmode === undefined) {
        localStorage.setItem('documentation:darkmode', isOSDarkmode);
    }

    htmlEl.classList.add('no-transitions');
    htmlEl.dataset.darkMode = localDarkmode !== undefined ? localDarkmode : isOSDarkmode;
    htmlEl.offsetHeight; // Trigger a reflow, flushing the CSS changes
    htmlEl.classList.remove('no-transitions');
}
