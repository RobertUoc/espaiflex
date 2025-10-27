<<<<<<< HEAD
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
            $stmt = $pdo->prepare("SELECT * FROM _t_provincies WHERE id = ?");
            $stmt->execute([$id]);
            $dades = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode($dades ?: ['error' => 'No encontrado']);
        } else {
            $stmt = $pdo->query("SELECT * FROM _t_provincies");
            $dades = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($dades);
        }
        break;

    default:
        echo json_encode(['error' => 'Método no soportado']);
        break;
}

=======
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
            $stmt = $pdo->prepare("SELECT * FROM _t_provincies WHERE id = ?");
            $stmt->execute([$id]);
            $dades = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode($dades ?: ['error' => 'No encontrado']);
        } else {
            $stmt = $pdo->query("SELECT * FROM _t_provincies");
            $dades = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($dades);
        }
        break;

    default:
        echo json_encode(['error' => 'Método no soportado']);
        break;
}

>>>>>>> 5d247d428903589ab1a72f1318fa8a1d33ec70ba
?>