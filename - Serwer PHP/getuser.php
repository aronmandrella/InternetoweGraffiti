<?php	
	// Funkcja pobierania danych użytkownika.

    header("Access-Control-Allow-Origin: *");
    
	require_once "restAPI.php";
	require_once "sqlQuery.php";

	// ---------------- DEFINICJA CALLBACKU --------------- //

	$functionName = 'getuser';
	$requiredPost = array('userPass');
	$requiredGet  = array();

	$function = function($connection, $post, $get){
        // Sprawdzenie czy user z takim hasłem (tokenem) istnieje.
        $sql = sprintf("SELECT * FROM users WHERE userPass = '%s'",
            $connection->real_escape_string($post['userPass']));
		$result = sqlQuery($connection, $sql);

        // Sprawdzenie czy podano poprawny token.
        if($row = $result->fetch_assoc())
        {
            // Zwrócenie danych usera.
            return [
                'userId' => $row['userId'],
                'userName' => $row['userName'],
                'userAvatar' => $row['userAvatar'],
            ];
        }
        else{
            $result->free();
            throw new Exception('Unknown userPass.', 1);
        }
	};

	// --------- OBSŁUGA ZDEFINIOWANEGO CALLBACKA --------- //

	defineApiFunction(
		$function, $functionName,
		$requiredPost, $requiredGet
	);
?>