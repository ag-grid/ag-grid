/**
 * Single place to enable/disable the site-wide announcement banner and set its content.
 * Flip `enabled` to `true` to show the banner above the header on every page (archived
 * doc versions never show it, and individual pages can still opt out via
 * `showAnnouncementBanner={false}` on `<Layout>`).
 */
export const announcementBannerConfig = {
    enabled: true,
    href: 'https://app.livestorm.co/ag-grid/whats-new-in-ag-grid-36-and-ag-charts-14?s=bb9ec924-9814-49ad-bafb-9e8e65492caa',
    title: 'AG Grid & AG Charts webinar',
    description: 'Join us for an AG Grid & AG Charts webinar DAY TIME TIMEZONE',
    ctaLabel: 'Register',
    external: true,
};
