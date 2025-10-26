<?php
    header("Access-Control-Allow-Origin: *");
   
    $host = 'localhost';
    $db = 'db_espaiflex';
    $user = 'root';
    $pass = '';

    try {
        $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    } catch (PDOException $e) {
        echo json_encode(['error' => $e->getMessage()]);
        exit;
    }
?>
