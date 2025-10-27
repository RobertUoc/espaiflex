<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Conexión a la base de datos
include("dbconnect.php");

// Detectar método HTTP
$method = $_SERVER['REQUEST_METHOD'];

// Lectura
switch ($method) {
    case 'GET':
        $tots = 0;
        if ((isset($_GET['email'], $_GET['password'], $_GET['usuari']))) {   
            $email = $_GET['email'];
            $password = $_GET['password'];
            $usuari = $_GET['usuari'];
            $stmt = $pdo->prepare("SELECT *
                                     FROM _t_users 
                                     WHERE tipus = ?
                                       AND email = ?
                                       AND password = ?");
            $stmt->execute([$usuari, $email, $password]);
            $dades = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode($dades ?: ['error' => 'No encontrado']);
            $tots = 1;
        } 
        if ($tots == 0) {
            $stmt = $pdo->query("SELECT *
                                     FROM _t_users");
            $dades = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($dades);
        }
        break;        
    // Insert
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['nom'], $data['email'], $data['password'])) {
            echo json_encode(['error' => 'Faltan campos']);
            exit;
        }
        $stmt = $pdo->prepare("INSERT INTO _t_users (nom, email, password) VALUES (?, ?, ?)");
        $success = $stmt->execute([                                  
            $data['nom'],
            $data['email'],            
            $data['password']
        ]);

        echo json_encode(['success' => $success, 'id' => $pdo->lastInsertId()]);
        break;

    // Update
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['nom'], $data['email'], $data['password'], $data['id'])) {
            echo json_encode(['error' => 'Faltan campos Update ']);
            exit;
        }

        $stmt = $pdo->prepare("UPDATE _t_users SET nom = ?, email = ?, password = ?  WHERE id = ?");
        $success = $stmt->execute([                                 
            $data['nom'],
            $data['email'],                        
            $data['password'],
            $data['id']            
        ]);

        echo json_encode(['success' => $success]);
        break;

    default:
        echo json_encode(['error' => 'Método no soportado']);
        break;
}

?>