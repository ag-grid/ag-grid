<?php
    function printPropertiesTable ($properties){
        print "<table class='table'>";
        printPropertiesRows($properties);
        print "</table>";
    }

    function printPropertiesRows ($properties){
        foreach ($properties as $property) {
            print "     
                    <tr>
                        <th>$property[0]</th>
                        <td>
                            $property[1]
                        </td>
                    </tr>
                ";
        }
    }
?>
