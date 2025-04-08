const iconNameToSvgFragment: Record<string, string | undefined> = {
    aggregation: '<path d="M18 7V4H6l6 8-6 8h12v-3"/>',
    arrows: '<polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/><line x1="2" x2="22" y1="12" y2="12"/><line x1="12" x2="12" y1="2" y2="22"/>',
    asc: '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
    cancel: '<path d="m18 6-12 12"/><path d="m6 6 12 12"/>',
    chart: '<line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/>',
    'color-picker':
        '<path d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z"/><path d="m5 2 5 5"/><path d="M2 13h15"/><path d="M22 20a2 2 0 1 1-4 0c0-1.6 1.7-2.4 2-4 .3 1.6 2 2.4 2 4Z"/>',
    columns:
        '<path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>',
    contracted: '<path d="m9 18 6-6-6-6"/>',
    copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    cross: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    csv: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h2"/><path d="M8 17h2"/><path d="M14 13h2"/><path d="M14 17h2"/>',
    cut: '<circle cx="6" cy="6" r="3"/><path d="M8.12 8.12 12 12"/><path d="M20 4 8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8 20 20"/>',
    desc: '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
    down: '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
    excel: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h2"/><path d="M8 17h2"/><path d="M14 13h2"/><path d="M14 17h2"/>',
    expanded: '<path d="m15 18-6-6 6-6"/>',
    'eye-slash':
        '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/>',
    eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    filter: '<path d="M3 6h18"/><path d="M7 12h10"/><path d="M10 18h4"/>',
    first: '<path d="m17 18-6-6 6-6"/><path d="M7 6v12"/>',
    group: '<path d="M16 12H3"/><path d="M16 18H3"/><path d="M10 6H3"/><path d="M21 18V8a2 2 0 0 0-2-2h-5"/><path d="m16 8-2-2 2-2"/>',
    last: '<path d="m7 18 6-6-6-6"/><path d="M17 6v12"/>',
    left: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    linked: '<path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><line x1="8" x2="16" y1="12" y2="12"/>',
    loading:
        '<line x1="12" x2="12" y1="2" y2="6"/><line x1="12" x2="12" y1="18" y2="22"/><line x1="4.93" x2="7.76" y1="4.93" y2="7.76"/><line x1="16.24" x2="19.07" y1="16.24" y2="19.07"/><line x1="2" x2="6" y1="12" y2="12"/><line x1="18" x2="22" y1="12" y2="12"/><line x1="4.93" x2="7.76" y1="19.07" y2="16.24"/><line x1="16.24" x2="19.07" y1="7.76" y2="4.93"/>',
    maximize:
        '<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" x2="14" y1="3" y2="10"/><line x1="3" x2="10" y1="21" y2="14"/>',
    menu: '<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>',
    'menu-alt':
        '<circle cx="12" cy="5" r="0.75" fill="#D9D9D9"/><circle cx="12" cy="12" r="0.75" fill="#D9D9D9"/><circle cx="12" cy="19" r="0.75" fill="#D9D9D9"/>',
    minimize:
        '<polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" x2="21" y1="10" y2="3"/><line x1="3" x2="10" y1="21" y2="14"/>',
    minus: '<circle cx="12" cy="12" r="10"/><path d="M8 12h8"/>',
    next: '<path d="m9 18 6-6-6-6"/>',
    none: '<path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/>',
    'not-allowed': '<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',
    paste: '<path d="M15 2H9a1 1 0 0 0-1 1v2c0 .6.4 1 1 1h6c.6 0 1-.4 1-1V3c0-.6-.4-1-1-1Z"/><path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2M16 4h2a2 2 0 0 1 2 2v2M11 14h10"/><path d="m17 10 4 4-4 4"/>',
    pin: '<line x1="12" x2="12" y1="17" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>',
    pivot: '<path d="M15 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M21 9H3"/><path d="M21 15H3"/>',
    plus: '<circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/>',
    previous: '<path d="m15 18-6-6 6-6"/>',
    right: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    save: '<path d="M12 17V3"/><path d="m6 11 6 6 6-6"/><path d="M19 21H5"/>',
    'small-left': '<path d="m15 18-6-6 6-6"/>',
    'small-right': '<path d="m9 18 6-6-6-6"/>',
    tick: '<path d="M20 6 9 17l-5-5"/>',
    'tree-closed': '<path d="m9 18 6-6-6-6"/>',
    'tree-indeterminate': '<path d="M5 12h14"/>',
    'tree-open': '<path d="m6 9 6 6 6-6"/>',
    unlinked:
        '<path d="M9 17H7A5 5 0 0 1 7 7"/><path d="M15 7h2a5 5 0 0 1 4 8"/><line x1="8" x2="12" y1="12" y2="12"/><line x1="2" x2="22" y1="2" y2="22"/>',
    up: '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
    grip:
        '<circle cx="5" cy="8" r="0.5"/><circle cx="12" cy="8" r="0.5"/><circle cx="19" cy="8" r="0.5"/><circle cx="5" cy="16" r="0.5"/><circle cx="12" cy="16" r="0.5"/><circle cx="19" cy="16" r="0.5"/>' +
        '<g stroke="none" fill="currentColor"><circle cx="5" cy="8" r="1"/><circle cx="12" cy="8" r="1"/><circle cx="19" cy="8" r="1"/><circle cx="5" cy="16" r="1"/><circle cx="12" cy="16" r="1"/><circle cx="19" cy="16" r="1"/></g>',
    settings: '<path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/>',
};

const iconNameToFullSvg: Record<string, string | undefined> = {
    'column-arrow':
        '<svg xmlns="http://www.w3.org/2000/svg" class="ag-icon" fill="none" viewBox="0 0 32 32"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 26C0 28.2092 1.79086 30 4 30H14C16.2091 30 18 28.2092 18 26V15H25.8786L24.4394 16.4393C23.8536 17.0251 23.8536 17.9749 24.4394 18.5607C25.0252 19.1464 25.9748 19.1464 26.5606 18.5607L30.5606 14.5607C31.1464 13.9749 31.1464 13.0251 30.5606 12.4393L26.5606 8.43934C25.9748 7.85356 25.0252 7.85356 24.4394 8.43934C23.8536 9.02512 23.8536 9.97488 24.4394 10.5607L25.8786 12H18V6C18 3.79086 16.2091 2 14 2H4C1.79086 2 0 3.79086 0 6V26ZM14 5H10.5V12H15V6C15 5.44772 14.5523 5 14 5ZM4 5H7.5V12H3V6C3 5.44772 3.44772 5 4 5ZM10.5 15H15V26C15 26.5522 14.5523 27 14 27H10.5V15ZM4 27H7.5V15H3V26C3 26.5522 3.44772 27 4 27Z" fill="currentColor"/></svg>',
    'small-down':
        '<svg xmlns="http://www.w3.org/2000/svg" class="ag-icon" fill="black" stroke="none" viewBox="0 0 32 32"><path d="M7.334 10.667 16 21.334l8.667-10.667H7.334Z"/></svg>',
    'small-up':
        '<svg xmlns="http://www.w3.org/2000/svg" class="ag-icon" fill="black" stroke="none" viewBox="0 0 32 32"><path d="M7.334 21.333 16 10.666l8.667 10.667H7.334Z"/></svg>',
    'un-pin':
        '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 11C7.80109 11 7.61032 11.079 7.46967 11.2197C7.32902 11.3603 7.25 11.5511 7.25 11.75V15.083C7.25 15.2819 7.32902 15.4727 7.46967 15.6133C7.61032 15.754 7.80109 15.833 8 15.833C8.19891 15.833 8.38968 15.754 8.53033 15.6133C8.67098 15.4727 8.75 15.2819 8.75 15.083V11.75C8.75 11.5511 8.67098 11.3603 8.53033 11.2197C8.38968 11.079 8.19891 11 8 11Z" fill="currentColor"/><path d="M13.11 1.436C13.2202 1.27403 13.2626 1.07537 13.2282 0.882523C13.1938 0.689672 13.0853 0.51793 12.926 0.40402C12.7666 0.29011 12.569 0.243074 12.3754 0.27297C12.1818 0.302867 12.0076 0.407322 11.89 0.564L1.89 14.564C1.83 14.6439 1.78659 14.7351 1.76231 14.8321C1.73804 14.929 1.73339 15.0299 1.74865 15.1286C1.7639 15.2274 1.79875 15.3222 1.85115 15.4073C1.90354 15.4924 1.97242 15.5662 2.05374 15.6243C2.13507 15.6825 2.22719 15.7238 2.32469 15.7458C2.4222 15.7678 2.52312 15.7701 2.62152 15.7525C2.71993 15.735 2.81384 15.6979 2.89772 15.6436C2.98161 15.5892 3.05378 15.5187 3.11 15.436L5.207 12.5H12.583C12.7819 12.5 12.9727 12.421 13.1133 12.2803C13.254 12.1397 13.333 11.9489 13.333 11.75V10.576C13.3332 10.1889 13.2254 9.80951 13.0217 9.48039C12.818 9.15126 12.5265 8.8855 12.18 8.713L10.995 8.114L10.99 8.112C10.8927 8.06392 10.8109 7.98951 10.7538 7.89723C10.6967 7.80496 10.6666 7.69851 10.667 7.59V5.165C11.0066 5.15521 11.3387 5.06251 11.6342 4.89496C11.9298 4.72742 12.1799 4.49012 12.3627 4.20376C12.5455 3.91739 12.6555 3.59066 12.6831 3.25204C12.7107 2.91341 12.655 2.57318 12.521 2.261L13.11 1.436ZM9.167 6.956V7.59C9.16681 7.97706 9.27463 8.35649 9.47833 8.68561C9.68202 9.01474 9.97351 9.2805 10.32 9.453L11.505 10.053L11.51 10.055C11.6073 10.1031 11.6891 10.1775 11.7462 10.2698C11.8033 10.362 11.8334 10.4685 11.833 10.577V11H6.28L9.167 6.956ZM9.277 1H5.25C4.70898 1.00669 4.19177 1.22353 3.80774 1.60467C3.42371 1.98581 3.20297 2.50137 3.19219 3.04232C3.18141 3.58327 3.38144 4.10721 3.74998 4.50335C4.11852 4.89948 4.62668 5.13676 5.167 5.165V6.841L6.667 4.709V4.417C6.667 4.21809 6.58798 4.02732 6.44733 3.88667C6.30668 3.74602 6.11591 3.667 5.917 3.667H5.25C5.09525 3.667 4.94683 3.60552 4.8374 3.4961C4.72798 3.38667 4.6665 3.23825 4.6665 3.0835C4.6665 2.92875 4.72798 2.78033 4.8374 2.6709C4.94683 2.56148 5.09525 2.5 5.25 2.5H8.222L9.277 1Z" fill="currentColor"/></svg>',
};

export const getQuartzIconsCss = (args: { strokeWidth?: number } = {}) => {
    let result = '';
    for (const iconName of [...Object.keys(iconNameToSvgFragment), ...Object.keys(iconNameToFullSvg)]) {
        const iconSvg = quartzIconSvg(iconName, args.strokeWidth);
        result += `.ag-icon-${iconName}::before { mask-image: url('data:image/svg+xml,${encodeURIComponent(iconSvg)}'); }\n`;
    }
    return result;
};

const quartzIconSvg = (name: string, strokeWidth = 1.5): string => {
    const fullSVG = iconNameToFullSvg[name];
    if (fullSVG) return fullSVG;
    const svgFragment = iconNameToSvgFragment[name];
    if (!svgFragment) throw new Error(`Missing icon data for ${name}`);
    return (
        `<svg xmlns="http://www.w3.org/2000/svg" class="ag-icon" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke="black" stroke-width="${strokeWidth}" viewBox="0 0 24 24">` +
        '<style>* { vector-effect: non-scaling-stroke; }</style>' +
        svgFragment +
        '</svg>'
    );
};
