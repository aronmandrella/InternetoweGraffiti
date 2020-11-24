<?php	
	// Funkcja publikowania wpisów.

    header("Access-Control-Allow-Origin: *");
    
	require_once "restAPI.php";
    require_once "sqlQuery.php";
    require_once "imageConverter.php";

	// ---------------- DEFINICJA CALLBACKU --------------- //

	$functionName = 'publish';
	$requiredPost = array('userPass', 'lat', 'lon');
	$requiredGet  = array();

	$function = function($connection, $post, $get){
        // Sprawdzenie czy user z takim hasłem (tokenem) istnieje.
        $sql = sprintf("SELECT userId FROM users WHERE userPass = '%s'",
            $connection->real_escape_string($post['userPass']));
		$result = sqlQuery($connection, $sql);

        // Sprawdzenie czy podano poprawny token.
        if($row = $result->fetch_assoc())
        {
            // Zapisanie id usera.
            $userId = $row['userId'];
            $result->free();

            // Określenie kontentu.
            $text = ''; $image = '';
            if(strlen($post['text']) != 0 ) $text = htmlspecialchars($post['text']);
            if(strlen($post['image']) != 0){
                // Określenie id dla kolejengo obrazu.
                $nextFileId = 1;
                $sql = "SELECT (max(postId) + 1) as nextId FROM posts";
                $result = sqlQuery($connection, $sql);
                if($row = $result->fetch_assoc())
                    $nextFileId = $row['nextId'];
                $result->free();
                
                // PRzekonwertowanie stringa z obrazem na plik na serwerze.
                $image = 'postImages/img_'.$nextFileId.'.jpg';
                $image = base64_to_jpeg($post['image'], $image);
            }

            // Wrzucenie wpsiu do bazy danych.
            $sql = sprintf("INSERT INTO posts (userId, lat, lon, text, image) VALUES ('%s', '%s', '%s', '%s', '%s')",
                $userId,
                $connection->real_escape_string($post['lat']),
                $connection->real_escape_string($post['lon']),
                $connection->real_escape_string($text),
                $connection->real_escape_string($image)
            );
            if(!sqlQuery($connection, $sql)){
                throw new Exception('Failed to publish post.');
            }
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