<?php
	define("SQL_ERROR", "SQL query error.");

    // Wykonuje zapytanie SQL i rzuca wyjątek w przypadku błedu.
    function sqlQuery($connection, $sql){
        if($result = @$connection->query($sql))
            return $result;
        else
            throw new Exception(SQL_ERROR);
    }
?>