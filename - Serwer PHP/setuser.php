<?php	
	// Funkcja zmiany danych użytkownika.

    header("Access-Control-Allow-Origin: *");
    
	require_once "restAPI.php";
	require_once "sqlQuery.php";
    require_once "imageConverter.php";

	// ---------------- DEFINICJA CALLBACKU --------------- //

	$functionName = 'setuser';
	$requiredPost = array('userPass', 'userName', 'userAvatar');
	$requiredGet  = array();

	$function = function($connection, $post, $get){
        // Sprawdzenie czy user z takim hasłem (tokenem) istnieje.
        $sql = sprintf("SELECT userId FROM users WHERE userPass = '%s'",
            $connection->real_escape_string($post['userPass']));
		$result = sqlQuery($connection, $sql);

        // Sprawdzenie czy podano poprawny token.
        if($row = $result->fetch_assoc())
        {
            $userAvatarUrl = '';
            if(substr($post['userAvatar'], 0, 4) == 'data'){
                // Przekonwertowanie stringa z obrazem na plik na serwerze.
                $userAvatarUrl = 'userAvatars/user_'.$row['userId'].'_'.date("Ymd_His").'.jpg';
                $userAvatarUrl = base64_to_jpeg($post['userAvatar'], $userAvatarUrl);
            }
            else
                $userAvatarUrl = $post['userAvatar'];

            // Aktualizacja dnaych w tabeli.
            $sql = sprintf("UPDATE users SET userName = '%s', userAvatar = '%s' WHERE userId = '%s'",
                $connection->real_escape_string(htmlspecialchars($post['userName'])),
                $connection->real_escape_string($userAvatarUrl),
                $row['userId']
            );
            $result->free();
            if(!sqlQuery($connection, $sql)){
                throw new Exception('Failed to update user data.');
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