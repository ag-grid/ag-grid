# Content Collections

Fetch data from content collections using Astro's `getEntry`:

```astro
---
import { getEntry, type CollectionEntry } from 'astro:content';

// Navigation data
const { data: docsNavData } = (await getEntry('docsNav', 'nav')) as CollectionEntry<'docsNav'>;
const { data: apiNavData } = (await getEntry('apiNav', 'nav')) as CollectionEntry<'apiNav'>;

// Version data (entry key is product-specific, e.g. 'ag-grid-versions', 'ag-charts-versions')
const { data: versionsData } = (await getEntry('versions', '<product>-versions')) as CollectionEntry<'versions'>;

// Footer data
const { data: footerItems } = (await getEntry('footer', 'footer')) as CollectionEntry<'footer'>;

// Metadata
const { data: metadata } = (await getEntry('metadata', 'metadata')) as CollectionEntry<'metadata'>;
---
```

## Utility Functions

```typescript
// URL utilities
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import { urlWithPrefix } from '@utils/urlWithPrefix';

// Add base URL to paths (base URL is product-specific)
urlWithBaseUrl('/example')  // → '/<product-base>/example' (with configured base)

// Add framework prefix
urlWithPrefix({ framework: 'react', url: './quick-start' })  // → '/react/quick-start'

// Framework detection
import { getFrameworkFromPath } from '@components/docs/utils/urlPaths';
const framework = getFrameworkFromPath(Astro.url.pathname);
```
