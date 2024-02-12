import React from 'react';

export function Label({ value }: { value: { name: string; link: string } }) {
    return <a href={value.link}>{value.name}</a>;
}