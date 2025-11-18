<?php
    header("Access-Control-Allow-Origin: *");
   
    $host = '168.231.77.239';
    $db = 'db_espaiflex';
    $user = 'user_espaiflex';
    $pass = 'user_admin';

    try {
        $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    } catch (PDOException $e) {
        echo json_encode(['error' => $e->getMessage()]);
        exit;
    }
?>
