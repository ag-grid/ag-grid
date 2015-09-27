<?php
include('../newsHeader.php');
?>

<h2>The implications of AngularJS 2.0 on Web Components and ag-Grid</h2>

<p>
    The first release of ag-Grid (www.ag-grid.com) broke the ‘usual thinking’ in the world of AngularJS. It provided a high performance grid to the AngularJS community, but it didn’t use AngularJS underneath the hood. Instead it used AngularJS where appropriate, and then native Javascript and DOM manipulation at all other times. A wolf-fast grid in AngularJS clothing! This approach was novel, building a bridge between native Javascript and AngularJS without the client AngularJS application realising it was using a non-AngularJS component.
</p>

<p>
    AngularJS 1.x had some shortcomings, which is understandable given its evolutionary development. What AngularJS is been used for today is probably beyond the intentions of Misko when he wrote those first lines of code, which is probably why the guys at Google decided to do a complete redesign for Angular 2. One of the shortcomings that particularly bothered me was the closed nature of the platform: AngularJS applications could not seamlessly use non-AngularJS components. For AngularJS to use a non-AngularJS component, it had to wrap the component with AngularJS code. This led to a sea of non-functional components who’s only purpose was to wrap non-AngularJS components – a component wrapping a component.
</p>

<p>

</p>
In ag-Grid, ag-Grid did this wrapping code for you, thus the AngularJS application had no idea it was talking to a non-AngularJS component.

<p>
    AngularJS 2 turns this problem right around. Rather than having a closed system for modularising AngularJS applications, AngularJS 2’s foundations lie on the emerging Web Components standard. What this means is that AngularJS will be able to directly use, without any wrapper coding, any component written as a Web Component. That is easy to understand, when I first heard it I understood technically what it meant, but it took me some time to really appreciate the implications of what it meant. I have come to the following logical conclusions:
</p>

<ul>
    <li>
        Right now AngularJS 1.x has a large following. It is probable that a large majority of that following will migrate onto AngularJS 2 when it is ready.
    </li>
    <li>
        This migration of followers will start hunting for Web Components to include in their AngularJS applications.
    </li>
    <li>
        Web Components will receive a significant wave of interest from these followers.
    </li>
    <li>
        Web Component developers will not have to worry that it’s AngularJS 2 is their client, no wrapper code will be needed.
    </li>
    <li>
        The sea of non-functional wrapper components for AngularJS 1.x won’t have a role in the new world and will be washed away.
    </li>
    <li>
        Some reusable components will be better suited to AngularJS 2 over Web Components. Components that solve business functions to be reused within an organisation probably fit here.
    </li>
    <li>
        Some reusable components will be better suited to Web Components over AngularJS 2 Components. Low level UI widgets (date pickers, grids etc) probably fit here.
    </li>
    <li>
        Low level components that are currently implemented in AngularJS 1.x probably won’t have a place in the new world as Web Components are more suited here. These will also wash away.
    </li>
</ul>

<p>
    This is excellent news for Web Component developers, regardless of whether you are an AngularJS advocate or not. This added surge of interest will provide Web Components with additional traction.
</p>

<p>
    So in the future, when AngularJS 2 is out, it will bring more choice. Component developers will have the choice to provide Web Components that work with AngularJS as well as with other platforms. AngularJS developers will have wider choice when selecting components for their application, not been restricted with ‘only AngularJS’ components. The binding between application technology choice and component technology choice will dissolve. This choice will allow the community of developers to experiment and influence the future of things.
</p>

<p>
    So where does this leave components like ag-Grid? ag-Grid has worked with AngularJS 1.x and native Javascript since version 1. Now in version 2 it has extended to AngularJS 2 and Web Components (these are two separate things, one depends on AngularJS 2, one depends on Web Components, however an AngularJS 2 application can talk to both). The positioning of ag-Grid, to support this new technology choice, was evolutionary. Google and the Web Components community laid the breadcrumbs.
</p>

<p>
    So the questions are: Will the AngularJS community become a significant client for Web Components? Will Web Components start developing with AngularJS in mind? Has ag-Grid positioned itself right to be part of all this?
</p>

<p>
    The options are all available. The community will drive what happens.
</p>

<?php
include('../newsFooter.php');
?>
