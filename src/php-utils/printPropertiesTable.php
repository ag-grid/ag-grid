<?php
    function printPropertiesTable ($properties){
        print "<table class='table'>";
        printPropertiesRows($properties);
        print "</table>";
    }

    function printPropertiesRows ($properties){
        foreach ($properties as list($a, $b)) {
            // $a contains the first element of the nested array,
            // and $b contains the second element.
            print "     
                    <tr>
                        <th>$a</th>
                        <td>
                            $b
                        </td>
                    </tr>
                ";
        }
    }
?>
