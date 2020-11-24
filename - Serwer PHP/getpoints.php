<?php	
	// Funkcja pobierania danych użytkownika.

    header("Access-Control-Allow-Origin: *");
    
	require_once "restAPI.php";
	require_once "sqlQuery.php";

	// ---------------- DEFINICJA CALLBACKU --------------- //

	$functionName = 'getpoints';
	$requiredPost = array('southWest', 'northEast');
	$requiredGet  = array();

	$function = function($connection, $post, $get){
        // Poszukiwanie postów spełniających kryteria dystansu i id.
        $sql = sprintf("SELECT postId as id, lat, lon FROM posts
            WHERE lat > '%s' and lat < '%s' and lon > '%s' and lon < '%s'",
            $connection->real_escape_string($post['southWest']['lat']),
            $connection->real_escape_string($post['northEast']['lat']),
            $connection->real_escape_string($post['southWest']['lon']),
            $connection->real_escape_string($post['northEast']['lon'])
        );
		$result = sqlQuery($connection, $sql);
        
        // Zapisanie punktów.
        $points = array();
        while($row = $result->fetch_assoc())
            array_push($points, $row);
        $result->free();

        return $points;
	};

	// --------- OBSŁUGA ZDEFINIOWANEGO CALLBACKA --------- //

	defineApiFunction(
		$function, $functionName,
		$requiredPost, $requiredGet
	);
?>