<?php
	header("Access-Control-Allow-Origin: *");
	
	//Nawiązywanie połączenia z bazą danych.
	function connectToDatabase(){
		$host 		= "localhost";
		$db_user 	= "username";
		$db_pass 	= "userpass";
		$db_name 	= "dbname";

		$connection = @new mysqli($host, $db_user, $db_pass, $db_name);					
		if($connection->connect_errno != 0){
			// echo $connection->connect_error;
			throw new Exception("Database connection failed. E".$connection->connect_errno);
		}
		return $connection;
	}
?>