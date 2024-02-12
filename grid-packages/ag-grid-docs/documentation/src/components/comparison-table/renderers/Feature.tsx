import React from 'react';

export function Feature({ value }: { value: boolean | string }) {
    if (value) {
      return <span>+</span>
    } else {
      return <span>-</span>
    }
}