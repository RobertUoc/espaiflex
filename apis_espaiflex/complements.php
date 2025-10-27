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
        if (isset($_GET['id'])) {
            $id = intval($_GET['id']);
            $stmt = $pdo->prepare("SELECT * FROM _t_complements WHERE id = ?");
            $stmt->execute([$id]);
            $dades = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode($dades ?: ['error' => 'No encontrado']);
        } else {
            $stmt = $pdo->query("SELECT * FROM _t_complements");
            $dades = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($dades);
        }
        break;

    // Insert
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['descripcio'], $data['actiu'], $data['preu'])) {
            echo json_encode(['error' => 'Faltan campos']);
            exit;
        }
        $stmt = $pdo->prepare("INSERT INTO _t_complements (descripcio, preu, actiu) VALUES (?, ?, ?)");
        $success = $stmt->execute([                                  
            $data['descripcio'],
            $data['preu'],
            $data['actiu']
        ]);

        echo json_encode(['success' => $success, 'id' => $pdo->lastInsertId()]);
        break;

    // Update
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['id'], $data['descripcio'], $data['actiu'], $data['preu'])) {
            echo json_encode(['error' => 'Faltan campos Update ']);
            exit;
        }

        $stmt = $pdo->prepare("UPDATE _t_complements SET descripcio = ?, preu = ?, actiu = ?  WHERE id = ?");
        $success = $stmt->execute([                                 
            $data['descripcio'],
            $data['preu'],
            $data['actiu'],
            $data['id']            
        ]);

        echo json_encode(['success' => $success]);
        break;

    default:
        echo json_encode(['error' => 'Método no soportado']);
        break;
}

?>