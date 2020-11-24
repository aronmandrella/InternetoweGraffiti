<?php	
	// Funkcja pobierania danych użytkownika.

    header("Access-Control-Allow-Origin: *");
    
	require_once "restAPI.php";
	require_once "sqlQuery.php";

	// ---------------- DEFINICJA CALLBACKU --------------- //

	$functionName = 'getposts';
	$requiredPost = array('lastId', 'lat', 'lon', 'radius');
	$requiredGet  = array();

	$function = function($connection, $post, $get){
        // Pobranie współrzędnych.
        $lat = $connection->real_escape_string($post['lat']);
        $lon = $connection->real_escape_string($post['lon']);

        // Określenie ostatniego id.
        $lastId = 4294967295; // Teoretyczny maksymalny indeks.
        if(strlen($post['lastId']) != 0) $lastId = $post['lastId'];

        // Poszukiwanie postów spełniających kryteria dystansu i id.
        $sql = sprintf("SELECT
            postId as id, lat, lon, date, text, image, 
            users.userId, userAvatar, userName, (
                6371 * acos (
                    cos(radians(%s))
                    * cos(radians(lat))
                    * cos(radians(lon) - radians(%s))
                    + sin(radians(%s))
                    * sin(radians(lat))
                )
            ) AS distance
            FROM users, posts
            WHERE users.userId = posts.userId and postId < %s
            HAVING distance < %s
            ORDER BY postId DESC
            LIMIT 20",
            $lat, $lon, $lat,
            $connection->real_escape_string($lastId),
            $connection->real_escape_string($post['radius'] / 1000)
        );
		$result = sqlQuery($connection, $sql);
        
        // Zapisanie postów.
        $posts = array();
        while($row = $result->fetch_assoc())
            array_push($posts, $row);
        $result->free();

        return $posts;
	};

	// --------- OBSŁUGA ZDEFINIOWANEGO CALLBACKA --------- //

	defineApiFunction(
		$function, $functionName,
		$requiredPost, $requiredGet
	);
?>