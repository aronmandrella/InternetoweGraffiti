<?php	
	// Funkcja rejestracji użytkowników.
	
    header("Access-Control-Allow-Origin: *");
	
	require_once "restAPI.php";
	require_once "sqlQuery.php";

	// ---------------- DEFINICJA CALLBACKU --------------- //

	$functionName = 'register';
	$requiredPost = array();
	$requiredGet  = array();

	$function = function($connection, $post, $get){
		while(true){
			// Wygenerowanie losowego hasła (tokenu).
			$userPass = bin2hex(openssl_random_pseudo_bytes(128));
			$userPass = $connection->real_escape_string($userPass);

			// Sprawdzenie czy user z takim hasłem (tokenem) już nie istnieje.
			$sql = sprintf("SELECT userId FROM users WHERE userPass = '%s'", $userPass);
			$result = sqlQuery($connection, $sql);

			// Jeśli token zajęty to ponowna próba generowania hasła.
			if($row = $result->fetch_assoc()) continue;
			$result->free();

			// Dodanie do bazy nowego usera.
			$sql = sprintf("INSERT INTO users (userPass) VALUES ('%s')", $userPass);
			sqlQuery($connection, $sql);
			$result->free();

			// Zwrócenie hasła / tokenu.
			return [
				"userPass" => $userPass
			];
		}
	};

	// --------- OBSŁUGA ZDEFINIOWANEGO CALLBACKA --------- //

	defineApiFunction(
		$function, $functionName,
		$requiredPost, $requiredGet
	);
?>