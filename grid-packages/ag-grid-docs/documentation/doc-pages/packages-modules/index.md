---
title: "AG Grid Packages vs Modules"
---

There are two main ways to add AG Grid to your application depending on your requirements and priorities with respect to bundle size / developer effort. You can install AG Grid by either using our feature complete `packages`, or by cherry picking the feature `modules` specific to your application's grid requirements. 

## Which to use?

[Packages](/packages/) are the easiest way to use AG Grid as every feature is implicitly available. However, this will mean that your application bundle includes every grid feature, some of which are not required by your application and so bloat your bundle size.

[Modules](/modules) are suitable if bundle size is critical to your application. They enable you to only include the functionality you need resulting in a minimal bundle size at the cost of additional config required to register modules in your application.

If you're unsure whether to use `packages` or `modules` then we'd recommend starting with `packages` as every grid feature is available and you do not have to worry about registering modules.

### Minimize Bundle Size

If you want to minimize your bundle size then you should definitely use `modules` to only include features that your application requires. 


<style>
    .pm-outer {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 1.5rem;
    }

    .pm-outer .tile {
        display:flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 14rem;
        height: 18rem;
        padding: 1rem;
        background-color: var(--ghost-blue);
        border-radius: var(--border-radius);
        border: 2px solid var(--bright-blue-gray);
        transition: border-color .25s ease-in-out;
    }

    .pm-outer .tile:hover {
        border-color: var(--link-hover-color);
    } 

    .pm-outer img {
        width: 100%;
        max-width: 6rem;
        margin-top: 3rem;
        margin-bottom: 3rem;
    }
</style>

<div class="pm-outer">
    <a href="../packages/" class="tile">
        <image-caption src="packages-modules/resources/packages.svg" alt="Grid Packages Overview" constrained="true" centered="true"></image-caption>
        <span class="button">Packages Overview</span>
    </a>
    <a href="../modules/" class="tile">
        <image-caption src="packages-modules/resources/modules.svg" alt="Grid Modules Overview" constrained="true" centered="true"></image-caption>
        <span class="button">Modules Overview</span>
    </a>
</div>