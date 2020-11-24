<?php
    // Sprawdza czy podany obiekt posiada wszystkie wskazane niezbędne pola,
    // jeśli nie, to rzucony zostanie wyjatek z informacją o tych brakujących.
    function checkFields($obj, $required, $objName){
        // Sprawdzenie czy tablica POST zawiera wszystkie potrzebne pola.
        $missing = [];
        foreach($required as $property)
            if(!isset($obj[$property]))
                array_push($missing, $property);
        if(count($missing) > 0){
            throw new Exception("Necessary ".$objName." fields missing: ".join(", ", $missing));
        }
    }
?>