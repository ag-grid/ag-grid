import type { ImportType } from '@ag-grid-types';

import type { Products } from '../types';

export const updateSearchParams = ({
    products = {} as Products,
    importType,
}: {
    products: Products;
    importType: ImportType;
}) => {
    const url = new URL(window.location);
    const productsParam = url.searchParams.get('products');
    const productsStr = Object.entries(products)
        .map(([key, selectedProduct]) => {
            return selectedProduct ? key : undefined;
        })
        .filter(Boolean)
        .toString();
    const importTypeParam = url.searchParams.get('importType');

    if (productsParam !== productsStr) {
        if (productsStr) {
            url.searchParams.set('products', productsStr);
        } else {
            url.searchParams.delete('products');
        }
    }

    if (importTypeParam !== importType) {
        if (importType) {
            url.searchParams.set('importType', importType);
        } else {
            url.searchParams.delete('importType');
        }
    }

    history.pushState(null, '', url);
};
