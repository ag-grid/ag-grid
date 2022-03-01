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


<div class="d-flex justify-content-around" style="height: 20rem;">
    <div class="d-flex flex-column" style="max-width: 20rem; min-width: 10rem; height: 20rem; border: 1px solid lightgray; border-radius: 5px; overflow: hidden;">
        <div class="flex-grow-1 d-flex justify-content-center p-4" style="background-color: #fffaf0;">
            <a class="d-flex align-items-center" href="../packages/"><img src="resources/packages.svg" style="width: 100%; max-width: 6rem;" alt="Grid Packages Overview" /></a>
        </div>
        <div class="p-2" style="border-top: 1px solid lightgray; background-color: #f8f9fa; text-align: center;">
            <p class="mb-0 btn btn-primary"><a href="../packages/" style="color: white">Packages Overview</a></p>
        </div>
    </div>
    <div class="d-flex flex-column" style="max-width: 20rem; min-width: 10rem; height: 20rem; border: 1px solid lightgray; border-radius: 5px; overflow: hidden;">
        <div class="flex-grow-1 d-flex justify-content-center p-4" style="background-color: #fffaf0;">
            <a class="d-flex align-items-center" href="../modules/"><img src="resources/modules.svg" style="width: 100%; max-width: 6rem;" alt="Grid Modules Overview"/></a>
        </div>
        <div class="p-2" style="border-top: 1px solid lightgray; background-color: #f8f9fa; text-align: center;">
            <p class="mb-0 btn btn-primary"><a href="../modules/" style="color: white">Modules Overview</a></p>
        </div>
    </div>
</div>