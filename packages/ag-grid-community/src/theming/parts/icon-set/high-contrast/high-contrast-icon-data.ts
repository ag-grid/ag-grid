// Pixel-fitted icons for the high contrast theme, drawn on an 18x18 grid -
// the size the theme shows its icons (iconSize: 18) - instead of the Quartz
// set's 24-unit drawings scaled to 0.75, so their edges land on whole pixels:
// straight parts are 2px bars, dots are 3x3 squares, arrowheads are filled
// carets, shapes are filled with their detail knocked out, and chevrons and
// other diagonals use a 2.83px stroke (whole pixels at 45 degrees). As in
// Quartz, only the dropdown arrows (small-down, small-up) are triangles. They read as solid at 1x and 2x where
// the Quartz strokes are mostly antialiased edge. Every other icon comes from
// the Quartz set.
export const highContrastIconSvgs: Record<string, string> = {
    aggregation:
        '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><path d="M4 2h10v2H7.4L12 9l-4.6 5H14v2H4v-2l5-5-5-5z"/></svg>',
    arrows: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><rect x="8" y="4" width="2" height="10"/><rect x="4" y="8" width="10" height="2"/><path d="M6 4l3-3 3 3zM6 14l3 3 3-3zM4 6 1 9l3 3zM14 6l3 3-3 3z"/></svg>',
    asc: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><rect x="8" y="8" width="2" height="7"/><path d="M4 9l5-5 5 5z"/></svg>',
    cancel: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><path d="M5 5l8 8M13 5l-8 8" fill="none" stroke="currentColor" stroke-width="2.83"/></svg>',
    chart: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><rect x="1" y="10" width="4" height="6"/><rect x="7" y="2" width="4" height="14"/><rect x="13" y="6" width="4" height="10"/></svg>',
    'chevron-down':
        '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><path d="M4 6l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2.83"/></svg>',
    'chevron-left':
        '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><path d="M12 4 7 9l5 5" fill="none" stroke="currentColor" stroke-width="2.83"/></svg>',
    'chevron-right':
        '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><path d="M6 4l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2.83"/></svg>',
    'chevron-up':
        '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><path d="M4 12l5-5 5 5" fill="none" stroke="currentColor" stroke-width="2.83"/></svg>',
    'color-picker':
        '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><path d="M7 3 0 10l6 6 4-4h6v-2h-2l-1-1z"/><path d="M15 13c-.8 1.3-1.6 2.1-1.6 3.2a1.6 1.6 0 0 0 3.2 0c0-1.1-.8-1.9-1.6-3.2z"/></svg>',
    columns:
        '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><path fill-rule="evenodd" d="M2 3h14v12H2zM4 5v8h4V5zm6 0v8h4V5z"/></svg>',
    contracted:
        '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><path d="M6 4l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2.83"/></svg>',
    copy: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><path d="M2 2h10v2H4v8H2z"/><rect x="6" y="6" width="10" height="10"/></svg>',
    cross: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><path d="M5 5l8 8M13 5l-8 8" fill="none" stroke="currentColor" stroke-width="2.83"/></svg>',
    csv: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><path fill-rule="evenodd" d="M3 1h7v6h6v10H3zM12 1l4 4h-4zM5 9h3v2H5zM10 9h3v2h-3zM5 13h3v2H5zM10 13h3v2h-3z"/></svg>',
    cut: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><circle cx="4.5" cy="13.5" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="13.5" cy="13.5" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M6.5 10.5 13 1.5M11.5 10.5 5 1.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    desc: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><rect x="8" y="3" width="2" height="7"/><path d="M4 9l5 5 5-5z"/></svg>',
    document:
        '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><path d="M3 1h7v6h6v10H3zM12 1l4 4h-4z"/></svg>',
    down: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><rect x="8" y="3" width="2" height="7"/><path d="M4 9l5 5 5-5z"/></svg>',
    excel: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><path fill-rule="evenodd" d="M3 1h7v6h6v10H3zM12 1l4 4h-4zM5 9h3v2H5zM10 9h3v2h-3zM5 13h3v2H5zM10 13h3v2h-3z"/></svg>',
    expanded:
        '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><path d="M12 4 7 9l5 5" fill="none" stroke="currentColor" stroke-width="2.83"/></svg>',
    eye: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><path fill-rule="evenodd" d="M1 9c2-4 5-6 8-6s6 2 8 6c-2 4-5 6-8 6s-6-2-8-6zM9 5.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 1 0 0-7z"/><circle cx="9" cy="9" r="1.75"/></svg>',
    'eye-slash':
        '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><defs><mask id="gap"><rect width="18" height="18" fill="#fff"/><path d="M1 1l16 16" stroke="#000" stroke-width="5.66"/></mask></defs><g mask="url(#gap)"><path fill-rule="evenodd" d="M1 9c2-4 5-6 8-6s6 2 8 6c-2 4-5 6-8 6s-6-2-8-6zM9 5.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 1 0 0-7z"/><circle cx="9" cy="9" r="1.75"/></g><path d="M2 2l14 14" fill="none" stroke="currentColor" stroke-width="2.83"/></svg>',
    filter: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><rect x="2" y="4" width="14" height="2"/><rect x="5" y="8" width="8" height="2"/><rect x="7" y="12" width="4" height="2"/></svg>',
    'filter-add':
        '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><rect x="1" y="4" width="9" height="2"/><path d="M13 2h2v2h2v2h-2v2h-2V6h-2V4h2z"/><rect x="5" y="9" width="8" height="2"/><rect x="7" y="14" width="4" height="2"/></svg>',
    first: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><rect x="3" y="3" width="2" height="12"/><path d="M13 4 8 9l5 5" fill="none" stroke="currentColor" stroke-width="2.83"/></svg>',
    grip: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><rect x="2" y="5" width="3" height="3"/><rect x="7" y="5" width="3" height="3"/><rect x="12" y="5" width="3" height="3"/><rect x="2" y="10" width="3" height="3"/><rect x="7" y="10" width="3" height="3"/><rect x="12" y="10" width="3" height="3"/></svg>',
    group: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><rect x="2" y="3" width="4" height="2"/><rect x="2" y="8" width="10" height="2"/><rect x="2" y="13" width="10" height="2"/><path d="M16 15h-2V6a1 1 0 0 0-1-1h-2V3h2a3 3 0 0 1 3 3z"/><path d="M11 1 8 4l3 3z"/></svg>',
    last: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><rect x="13" y="3" width="2" height="12"/><path d="M5 4l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2.83"/></svg>',
    left: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><rect x="8" y="8" width="7" height="2"/><path d="M9 4 4 9l5 5z"/></svg>',
    linked: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><path d="M7 5H5a4 4 0 0 0 0 8h2v-2H5a2 2 0 0 1 0-4h2zM11 5h2a4 4 0 0 1 0 8h-2v-2h2a2 2 0 0 0 0-4h-2z"/><rect x="6" y="8" width="6" height="2"/></svg>',
    loading:
        '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><rect x="8" y="1" width="2" height="4"/><rect x="8" y="13" width="2" height="4"/><rect x="1" y="8" width="4" height="2"/><rect x="13" y="8" width="4" height="2"/><path d="M3.7 3.7l2.1 2.1M12.2 12.2l2.1 2.1M3.7 14.3l2.1-2.1M12.2 5.8l2.1-2.1" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    maximize:
        '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><path d="M10 2h6v6zM2 10v6h6z"/><path d="M14 4l-4 4M4 14l4-4" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    menu: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><rect x="2" y="4" width="14" height="2"/><rect x="2" y="8" width="14" height="2"/><rect x="2" y="12" width="14" height="2"/></svg>',
    'menu-alt':
        '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><rect x="7" y="2" width="3" height="3"/><rect x="7" y="7" width="3" height="3"/><rect x="7" y="12" width="3" height="3"/></svg>',
    minimize:
        '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><path d="M10 2v6h6zM2 10h6v6z"/><path d="M16 2l-4 4M2 16l4-4" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    minus: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><path fill-rule="evenodd" d="M9 2a7 7 0 1 0 0 14A7 7 0 1 0 9 2zM5 8h8v2H5z"/></svg>',
    next: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><path d="M6 4l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2.83"/></svg>',
    none: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><path d="M5 7l4-4 4 4M5 11l4 4 4-4" fill="none" stroke="currentColor" stroke-width="2.83"/></svg>',
    'not-allowed':
        '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4.5 4.5l9 9" fill="none" stroke="currentColor" stroke-width="2.83"/></svg>',
    paste: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><rect x="6" y="1" width="6" height="3"/><path d="M3 3h2v2h8V3h2v14H3z"/></svg>',
    pdf: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><path fill-rule="evenodd" d="M3 1h7v6h6v10H3zM12 1l4 4h-4zM5 9h8v2H5zM5 13h5v2H5z"/></svg>',
    pin: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><path d="M5 2h8v2h-2v5l3 3v2H4v-2l3-3V4H5z"/><rect x="8" y="14" width="2" height="3"/></svg>',
    pivot: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><path fill-rule="evenodd" d="M2 2h14v14H2zM4 6h3v3H4zM9 6h3v3H9zM4 11h3v3H4zM9 11h3v3H9z"/></svg>',
    plus: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><path fill-rule="evenodd" d="M9 2a7 7 0 1 0 0 14A7 7 0 1 0 9 2zM8 5h2v3h3v2h-3v3H8v-3H5V8h3z"/></svg>',
    previous:
        '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><path d="M12 4 7 9l5 5" fill="none" stroke="currentColor" stroke-width="2.83"/></svg>',
    right: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><rect x="3" y="8" width="7" height="2"/><path d="M9 4l5 5-5 5z"/></svg>',
    save: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><rect x="8" y="2" width="2" height="6"/><path d="M4 7h10l-5 5z"/><rect x="2" y="14" width="14" height="2"/></svg>',
    search: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><circle cx="8" cy="8" r="5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 12l4 4" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    settings:
        '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><rect x="7" y="4" width="9" height="2"/><circle cx="5" cy="5" r="3"/><rect x="2" y="12" width="9" height="2"/><circle cx="13" cy="13" r="3"/></svg>',
    'small-down':
        '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><path d="M3 6h12l-6 6z"/></svg>',
    'small-left':
        '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><path d="M12 4 7 9l5 5" fill="none" stroke="currentColor" stroke-width="2.83"/></svg>',
    'small-right':
        '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><path d="M6 4l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2.83"/></svg>',
    'small-up':
        '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><path d="M3 12h12l-6-6z"/></svg>',
    tick: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><path d="M3 9l4 4 8-8" fill="none" stroke="currentColor" stroke-width="2.83"/></svg>',
    'tree-closed':
        '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><path d="M6 4l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2.83"/></svg>',
    'tree-indeterminate':
        '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><rect x="4" y="8" width="10" height="2"/></svg>',
    'tree-open':
        '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><path d="M4 6l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2.83"/></svg>',
    'un-pin':
        '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><defs><mask id="gap"><rect width="18" height="18" fill="#fff"/><path d="M1 1l16 16" stroke="#000" stroke-width="5.66"/></mask></defs><g mask="url(#gap)"><path d="M5 2h8v2h-2v5l3 3v2H4v-2l3-3V4H5z"/><rect x="8" y="14" width="2" height="3"/></g><path d="M2 2l14 14" fill="none" stroke="currentColor" stroke-width="2.83"/></svg>',
    unlinked:
        '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><defs><mask id="gap"><rect width="18" height="18" fill="#fff"/><path d="M1 1l16 16" stroke="#000" stroke-width="5.66"/></mask></defs><g mask="url(#gap)"><path d="M7 5H5a4 4 0 0 0 0 8h2v-2H5a2 2 0 0 1 0-4h2zM11 5h2a4 4 0 0 1 0 8h-2v-2h2a2 2 0 0 0 0-4h-2z"/></g><path d="M2 2l14 14" fill="none" stroke="currentColor" stroke-width="2.83"/></svg>',
    up: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><rect x="8" y="8" width="2" height="7"/><path d="M4 9l5-5 5 5z"/></svg>',
};
