<?php
    require_once "errorHandler.php";
    require_once "connect.php";
    require_once "validation.php";

    // Definiuje funkcję do REST API i zarządza wlidacją argumentów, zwracaniem wyników i błędów.
    function defineApiFunction($function, $functionName, $requiredPost, $requiredGet){
        $connection = null;
    
        try {
            // Sprawdzenie czy podano wszystkie niezbędne dane.
            checkFields($_GET, $requiredGet, 'GET');
            checkFields($_POST, $requiredPost, 'POST');
    
            // Połączenie z bazą danych.
            $connection = connectToDatabase();

            // To naprawia polskie znaki i pozwala na emotki.
		    $connection->query("SET NAMES 'utf8mb4'");
    
            // Wywołanie funkcji i zwrócenie wyniku.
            $result = $function($connection, $_POST, $_GET);
            if(isset($result))
                print json_encode($result);
            else
                print json_encode(array());
    
            // Zamknięcie połączenia z bazą danych.
            $connection->close();
        } catch (Exception $e) {
            // Zakończenie połączenia jeśli takie otwarto.
            if($connection instanceof mysqli){
                $connection->close();
            }
            // Przygotowanie błędu i zwrócenie JSONA.
            $error = [
                "message" => $functionName . ' - ' . $e->getMessage(),
                "code" => $e->getCode()
            ];
            print json_encode(["error" => $error]);
        }
    }
?>