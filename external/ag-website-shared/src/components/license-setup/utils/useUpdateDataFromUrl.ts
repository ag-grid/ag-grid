import type { ImportType } from '@ag-grid-types';
import { useEffect } from 'react';

import { DEFAULT_USER_PRODUCTS } from '../constants';
import type { Products } from '../types';
import { updateSearchParams } from './updateSearchParams';

export const useUpdateDataFromUrl = ({
    setUserProducts,
    setImportType,
}: {
    setUserProducts: React.Dispatch<Products>;
    setImportType: React.Dispatch<ImportType>;
}) => {
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const productsParam = searchParams.get('products');
        const importTypeParam = searchParams.get('importType');
        const newSearchParams = {} as { products: Products; importType: ImportType };

        if (productsParam) {
            const validProductKeys = Object.keys(DEFAULT_USER_PRODUCTS);
            const productsList = productsParam
                .split(',')
                .map((p) => p.trim())
                .filter((p) => validProductKeys.includes(p));

            if (productsList.length) {
                const productsObj = {} as Products;
                validProductKeys.forEach((key) => {
                    productsObj[key as keyof Products] = productsList.includes(key);
                });
                setUserProducts(productsObj);
                newSearchParams.products = productsObj;
            }
        }

        const importType = importTypeParam?.trim();
        if (['modules', 'packages'].includes(importType as ImportType)) {
            setImportType(importType);
            newSearchParams.importType = importType;
        }

        if (Object.keys(newSearchParams).length) {
            updateSearchParams(newSearchParams);
        }
    }, []);
};
