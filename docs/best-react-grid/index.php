<?php
$key = "Getting Started React";
$pageTitle = "Best React Grid";
$pageDescription = "Shows and example of a data grid for using with React.";
$pageKeyboards = "React Grid";
include '../documentation_header.php';
?>

<div>

    <h2>Getting Started - React</h2>

    <p>
        Webpack and Babel are popular within the React community. So I've
        put together a <a href="https://github.com/ceolter/ag-grid-react-example">
        sample application on Github</a> using these. This page goes through how
        ag-Grid works with React using this example. It is assumed you are
        already familiar with Webpack, Babel and React.

        The example demonstrates:
        <ul>
            <li>ag-Grid as a React component.</li>
            <li>React used for rendering Skills and Proficiency columns.</li>
            <li>React used for Skills and Proficiency custom filters.</li>
        </ul>

    </p>

    <table>
        <style>
            button {
                margin-left: 4px;
                margin-right: 4px;
            }
        </style>
        <tr>
            <td style="background-color: #EEE; width: 10px;">
            </td>
            <td>
                <div style="background-color: #EEE; font-size: 20px; text-align: center;">
                    Example ag-Grid and React
                </div>
                <div id="myAppContainer"></div>
            </td>
        </tr>
    </table>

    <h2>Dependencies</h2>
    <p>
    </p>

    + The child component (cell renderers etc) will be detached from the React virtual dom.
      This means that they will not be rerendered automatically when a state change is
      detected. Need to provide a method that will render children when this happens
      (done with React.Component.forceUpdate method).

</div>

<script type="text/javascript" src="bundle.js" charset="utf-8"></script>
<!-- Example uses font awesome icons -->
<link href="//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css" rel="stylesheet">

<?php include '../documentation_footer.php';?>
