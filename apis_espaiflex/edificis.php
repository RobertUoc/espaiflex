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
        $tots = 0;
        if (isset($_GET['id'])) {
            $id = intval($_GET['id']);
            $stmt = $pdo->prepare("SELECT * FROM _t_edificis WHERE id = ?");
            $stmt->execute([$id]);
            $dades = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode($dades ?: ['error' => 'No encontrado']);
            $tots = 1;
        }
        if (isset($_GET['provincia'])) {
            $id = '%'.strtoupper($_GET['provincia']).'%';
            $stmt = $pdo->query("SELECT pro.nom as provincia, edi.id, edi.nom, edi.imatge, edi.latitud, edi.longitud
                                     FROM _t_edificis edi
                                LEFT JOIN _t_provincies pro ON (edi.id_provincia = pro.id)
                                    WHERE edi.actiu = 'SI'
                                        AND pro.nom like('" . $id . "')");
            $dades = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($dades ?: ['error' => 'No encontrado']);
            $tots = 1;            
        }            
        if ($tots == 0) {
            $stmt = $pdo->query("SELECT edi.id, edi.nom, edi.id_provincia, edi.descripcio, edi.actiu, edi.imatge, edi.latitud, edi.longitud
                                   FROM _t_edificis edi                                   
                                ");
            $dades = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($dades);
        }
        break;

    // Insert
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['nom'], $data['idprovincia'], $data['imatge'], $data['descripcio'], $data['actiu'], $data['latitud'], $data['longitud'])) {
            echo json_encode(['error' => 'Faltan campos']);
            exit;
        }
        $stmt = $pdo->prepare("INSERT INTO _t_edificis (nom, id_provincia, imatge, descripcio, actiu, latitud, longitud) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $success = $stmt->execute([
            $data['nom'],
            $data['idprovincia'],
            $data['imatge'],
            $data['descripcio'],
            $data['actiu']
        ]);

        echo json_encode(['success' => $success, 'id' => $pdo->lastInsertId()]);
        break;

    // Update
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['id'], $data['nom'], $data['idprovincia'], $data['imatge'], $data['descripcio'], $data['actiu'], $data['latitud'], $data['longitud'])) {
            echo json_encode(['error' => 'Faltan campos Update ']);
            exit;
        }

        $stmt = $pdo->prepare("UPDATE _t_edificis SET nom = ?, id_provincia = ?, imatge = ?, descripcio = ?, actiu = ?, latitud = ?, longitud = ? WHERE id = ?");
        $success = $stmt->execute([
            $data['nom'],
            $data['idprovincia'],
            $data['imatge'],
            $data['descripcio'],
            $data['actiu'],
            $data['latitud'],
            $data['longitud'],
            $data['id']            
        ]);

        echo json_encode(['success' => $success]);
        break;

    default:
        echo json_encode(['error' => 'Metodo no soportado']);
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
        $tots = 0;
        if (isset($_GET['id'])) {
            $id = intval($_GET['id']);
            $stmt = $pdo->prepare("SELECT * FROM _t_edificis WHERE id = ?");
            $stmt->execute([$id]);
            $dades = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode($dades ?: ['error' => 'No encontrado']);
            $tots = 1;
        }
        if (isset($_GET['provincia'])) {
            $id = '%'.strtoupper($_GET['provincia']).'%';
            $stmt = $pdo->query("SELECT pro.nom as provincia, edi.id, edi.nom, edi.imatge, edi.latitud, edi.longitud
                                     FROM _t_edificis edi
                                LEFT JOIN _t_provincies pro ON (edi.id_provincia = pro.id)
                                    WHERE edi.actiu = 'SI'
                                        AND pro.nom like('" . $id . "')");
            $dades = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($dades ?: ['error' => 'No encontrado']);
            $tots = 1;            
        }            
        if ($tots == 0) {
            $stmt = $pdo->query("SELECT edi.id, edi.nom, edi.id_provincia, edi.descripcio, edi.actiu, edi.imatge, edi.latitud, edi.longitud
                                   FROM _t_edificis edi                                   
                                ");
            $dades = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($dades);
        }
        break;

    // Insert
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['nom'], $data['idprovincia'], $data['imatge'], $data['descripcio'], $data['actiu'], $data['latitud'], $data['longitud'])) {
            echo json_encode(['error' => 'Faltan campos']);
            exit;
        }
        $stmt = $pdo->prepare("INSERT INTO _t_edificis (nom, id_provincia, imatge, descripcio, actiu, latitud, longitud) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $success = $stmt->execute([
            $data['nom'],
            $data['idprovincia'],
            $data['imatge'],
            $data['descripcio'],
            $data['actiu']
        ]);

        echo json_encode(['success' => $success, 'id' => $pdo->lastInsertId()]);
        break;

    // Update
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['id'], $data['nom'], $data['idprovincia'], $data['imatge'], $data['descripcio'], $data['actiu'], $data['latitud'], $data['longitud'])) {
            echo json_encode(['error' => 'Faltan campos Update ']);
            exit;
        }

        $stmt = $pdo->prepare("UPDATE _t_edificis SET nom = ?, id_provincia = ?, imatge = ?, descripcio = ?, actiu = ?, latitud = ?, longitud = ? WHERE id = ?");
        $success = $stmt->execute([
            $data['nom'],
            $data['idprovincia'],
            $data['imatge'],
            $data['descripcio'],
            $data['actiu'],
            $data['latitud'],
            $data['longitud'],
            $data['id']            
        ]);

        echo json_encode(['success' => $success]);
        break;

    default:
        echo json_encode(['error' => 'Metodo no soportado']);
        break;
}

>>>>>>> 5d247d428903589ab1a72f1318fa8a1d33ec70ba
?>