# Astro Page Patterns

All pages go in `packages/<website-package>/src/pages/`. The file path determines the URL:

| File Path | URL |
|-----------|-----|
| `pages/index.astro` | `/` |
| `pages/pricing.astro` | `/pricing` |
| `pages/community.astro` | `/community` |
| `pages/community/events.astro` | `/community/events` |

---

## Pattern 1: Full Custom Page with Layout

Use this for pages that need custom content and styling.

```astro
---
import Layout from '@layouts/Layout.astro';
import styles from '@pages-styles/my-page.module.scss';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';

// Optional: Fetch data from content collections
import { getEntry, type CollectionEntry } from 'astro:content';
const { data: navData } = (await getEntry('docsNav', 'nav')) as CollectionEntry<'docsNav'>;
---

<Layout
    title="Page Title | <Product Name>"
    description="SEO description for the page"
    showSearchBar={true}
    showDocsNav={false}
>
    <div class={styles.pageContainer}>
        <h1>My Page</h1>
        <p>Content goes here</p>
    </div>
</Layout>
```

---

## Pattern 2: Wrapper Page (Delegates to Shared Component)

Use this when a shared component handles all the page logic.

```astro
---
import { getEntry, type CollectionEntry } from 'astro:content';
import WhatsNew from '@ag-website-shared/components/whats-new/pages/whats-new.astro';

// Note: version entry keys are product-specific (e.g. 'ag-grid-versions', 'ag-charts-versions')
const { data: versionsData } = (await getEntry('versions', '<product>-versions')) as CollectionEntry<'versions'>;
const { data: docsNavData } = (await getEntry('docsNav', 'nav')) as CollectionEntry<'docsNav'>;
---

<!-- Note: site prop is product-specific (e.g. 'grid', 'charts', 'dash') -->
<WhatsNew site="<product-site>" versionsData={versionsData} menuData={docsNavData} />
```

---

## Pattern 3: Minimal Wrapper (Simplest)

For pages that just render a shared component with no data.

```astro
---
import Home from '@ag-website-shared/components/community/pages/home.astro';
---

<Home />
```

---

## Pattern 4: Page with React Components

Use this for interactive pages with client-side functionality.

```astro
---
import { LicensePricing } from '@ag-website-shared/components/license-pricing/LicensePricing';
import Layout from '@layouts/Layout.astro';
---

<Layout
    title="<Product Name>: License and Pricing"
    description="View license and pricing details."
    showSearchBar={true}
    showDocsNav={false}
>
    <LicensePricing client:load />
</Layout>
```

---

## Pattern 5: Page with Docs Navigation

Use this for pages that should show the documentation sidebar.

```astro
---
import { getEntry, type CollectionEntry } from 'astro:content';
import Layout from '@layouts/Layout.astro';
import { getFrameworkFromPath } from '@components/docs/utils/urlPaths';
import { Pipeline } from '@ag-website-shared/components/changelog/Pipeline';
import { DocsNavFromLocalStorage } from '@ag-website-shared/components/docs-navigation/DocsNavFromLocalStorage';
import styles from '@ag-website-shared/components/changelog/changelog.module.scss';
import classnames from 'classnames';

const path = Astro.url.pathname;
const framework = getFrameworkFromPath(path);
const { data: docsNavData } = (await getEntry('docsNav', 'nav')) as CollectionEntry<'docsNav'>;
---

<Layout
    title="Pipeline | <Product Name>"
    description="Lists feature requests and bugs in our backlog."
    showSearchBar={true}
    showDocsNav={true}
>
    <div class="layout-grid">
        <DocsNavFromLocalStorage client:load menuData={docsNavData} framework={framework} />

        <div className={classnames('page-margin', styles.container)}>
            <h1>Pipeline</h1>
            <!-- Note: library prop is product-specific (e.g. 'grid', 'charts', 'dash') -->
            <Pipeline client:load library="<product-library>" />
        </div>
    </div>
</Layout>
```

---

## Pattern 6: Standalone Page (No Layout)

For special pages like demos that need full control.

```astro
---
import HeroDashboard from '@components/hero-dashboard/HeroDashboard.astro';
import '@pages-styles/scratchpad.scss';
import '@pages-styles/example-controls.css';
---

<!doctype html>
<html lang="en" translate="no">
    <head>
        <title><Product Name></title>
    </head>
    <body class="scratchpad-outer">
        <HeroDashboard />
    </body>
</html>
```
