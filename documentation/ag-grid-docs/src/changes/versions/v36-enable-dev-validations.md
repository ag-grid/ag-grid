To restore full development-time diagnostics, call `enableDevValidations()` before any grid is created:

```js
import { enableDevValidations } from 'ag-grid-community';

if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}
```

### UMD bundle / CDN apps

ValidationModule continues to be auto-registered for apps using the UMD bundle, no change is required for these apps
