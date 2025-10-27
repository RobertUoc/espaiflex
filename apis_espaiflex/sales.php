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
                $stmt = $pdo->prepare("SELECT sal.id, sal.descripcio, sal.id_edifici, sal.preu, sal.actiu, sal.color, sal.missatge, sal.max_ocupacio, sal.horari, sal.imatge,
                                          edi.nom as nom_edifici
                                     FROM _t_sales sal 
                                     LEFT JOIN _t_edificis edi ON (sal.id_edifici = edi.id)
                                     WHERE sal.id = ?");
                $stmt->execute([$id]);
                $dades = $stmt->fetch(PDO::FETCH_ASSOC);
                echo json_encode($dades ?: ['error' => 'No encontrado']);
                $tots = 1;
            }
            if (isset($_GET['edifici'])) {
                $id = intval($_GET['edifici']);
                $stmt = $pdo->prepare("SELECT sal.id, sal.descripcio, sal.id_edifici, sal.preu, sal.actiu, sal.color, sal.missatge, sal.max_ocupacio, sal.horari, sal.imatge,
                                          edi.nom as nom_edifici
                                     FROM _t_sales sal
                                     LEFT JOIN _t_edificis edi ON (sal.id_edifici = edi.id)
                                     WHERE sal.id_edifici = ?");
                $stmt->execute([$id]);
                $dades = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($dades);
                $tots = 1;
            }
            if (isset($_GET['disponibles'])) {
                $id = intval($_GET['disponibles']);
                $stmt = $pdo->prepare("SELECT com.id, com.descripcio, com.preu, com.actiu 
                                         FROM _t_complements com
                                        WHERE com.actiu = 'SI'
                                          AND com.id NOT IN (SELECT sic.id_complements FROM _t_sales_in_complements sic WHERE sic.id_sales = ?)
                ");
                $stmt->execute([$id]);
                $dades = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($dades);
                $tots = 1;
            }
            if (isset($_GET['seleccionats'])) {
                $id = intval($_GET['seleccionats']);
                $stmt = $pdo->prepare("SELECT com.id, com.descripcio, com.preu, com.actiu
                                         FROM _t_complements com
                                        WHERE com.id IN (SELECT sic.id_complements FROM _t_sales_in_complements sic WHERE sic.id_sales = ?)
                ");
                $stmt->execute([$id]);
                $dades = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($dades);
                $tots = 1;
            }
            
            if ($tots == 0) {        
                $stmt = $pdo->query("SELECT sal.id, sal.descripcio, sal.id_edifici, sal.preu, sal.actiu, sal.color, sal.missatge, sal.max_ocupacio, sal.horari,
                                          edi.nom as nom_edifici
                                     FROM _t_sales sal 
                                     LEFT JOIN _t_edificis edi ON (sal.id_edifici = edi.id)");
                $dades = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($dades);
            }
        break;

    // Insert
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['descripcio'], $data['idedifici'], $data['preu'], $data['actiu'], $data['color'], $data['missatge'], $data['complement'], $data['max_ocupacio'], $data['horari'], $data['imatge'])) {
            echo json_encode(['error' => 'Faltan campos']);
            exit;
        }
        $stmt = $pdo->prepare("INSERT INTO _t_sales (descripcio, id_edifici, preu, color, missatge, actiu, max_ocupacio, horari, imatge ) VALUES (?, ?, ?, ?, ? ,? ,? ,?, ?)");
        $success = $stmt->execute([                                  
            $data['descripcio'],
            $data['idedifici'],            
            $data['preu'],
            $data['color'],
            $data['missatge'],
            $data['actiu'],    
            $data['max_ocupacio'],
            $data['horari'],
            $data['imatge']
        ]);
        // Insert Complements
                    
        
//        $stmt = $pdo->prepare("SELECT LAST_INSERT_ID() as id");
//        $dades = $stmt->fetch(PDO::FETCH_ASSOC);
//        $lastId = $dades['id'];
        
        $lastId = $pdo->lastInsertId();
        
        $ids = explode('#', $data['complement']);
        $stmt = $pdo->prepare("INSERT INTO _t_sales_in_complements (id_sales, id_complements) VALUES (:id_sales, :id_complements)");        
        // Insertar cada id_complementos
        foreach ($ids as $id_complemento) {
            if ($id_complemento>0) {
                $stmt->execute([
                    ':id_sales' => $lastId,
                    ':id_complements' => $id_complemento
                ]);
            }
        }                

        echo json_encode(['success' => $success, 'id' => $lastId]);
        break;

    // Update
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['descripcio'], $data['idedifici'], $data['preu'], $data['actiu'], $data['color'], $data['missatge'], $data['max_ocupacio'], $data['horari'], $data['imatge'])) {
            echo json_encode(['error' => 'Faltan campos Update ']);
            exit;
        }

        $stmt = $pdo->prepare("UPDATE _t_sales SET descripcio = ?, id_edifici = ?, preu = ?, color = ?, missatge = ?, max_ocupacio = ?, actiu = ?, horari = ?, imatge = ? WHERE id = ?");
        $success = $stmt->execute([                                 
            $data['descripcio'],
            $data['idedifici'],            
            $data['preu'],
            $data['color'],
            $data['missatge'],
            $data['max_ocupacio'],
            $data['actiu'],
            $data['horari'],
            $data['imatge'],
            $data['id']            
        ]);

        // Insert Complements
        $lastId = $data['id'];
        $delete = $pdo->prepare("DELETE FROM _t_sales_in_complements WHERE id_sales = :id_sales");
        $delete->execute([':id_sales' => $lastId]);
        //        
        $ids = explode('#', $data['complement']);
        $stmt = $pdo->prepare("INSERT INTO _t_sales_in_complements (id_sales, id_complements) VALUES (:id_sales, :id_complements)");
        // Insertar cada id_complementos
        foreach ($ids as $id_complemento) {
            $stmt->execute([
                ':id_sales' => $lastId,
                ':id_complements' => $id_complemento
            ]);
        }
        
        echo json_encode(['success' => $success]);
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
            $tots = 0;
            if (isset($_GET['id'])) {                
                $id = intval($_GET['id']);
                $stmt = $pdo->prepare("SELECT sal.id, sal.descripcio, sal.id_edifici, sal.preu, sal.actiu, sal.color, sal.missatge, sal.max_ocupacio, sal.horari,
                                          edi.nom as nom_edifici, sal.latitud, sal.longitud
                                     FROM _t_sales sal 
                                     LEFT JOIN _t_edificis edi ON (sal.id_edifici = edi.id)
                                     WHERE sal.id = ?");
                $stmt->execute([$id]);
                $dades = $stmt->fetch(PDO::FETCH_ASSOC);
                echo json_encode($dades ?: ['error' => 'No encontrado']);
                $tots = 1;
            }
            if (isset($_GET['edifici'])) {
                $id = intval($_GET['edifici']);
                $stmt = $pdo->prepare("SELECT sal.id, sal.descripcio, sal.id_edifici, sal.preu, sal.actiu, sal.color, sal.missatge, sal.max_ocupacio, sal.horari,
                                          edi.nom as nom_edifici, sal.latitud, sal.longitud
                                     FROM _t_sales sal
                                     LEFT JOIN _t_edificis edi ON (sal.id_edifici = edi.id)
                                     WHERE sal.id_edifici = ?");
                $stmt->execute([$id]);
                $dades = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($dades);
                $tots = 1;
            }
            if (isset($_GET['disponibles'])) {
                $id = intval($_GET['disponibles']);
                $stmt = $pdo->prepare("SELECT com.id, com.descripcio, com.preu, com.actiu 
                                         FROM _t_complements com
                                        WHERE com.actiu = 'SI'
                                          AND com.id NOT IN (SELECT sic.id_complements FROM _t_sales_in_complements sic WHERE sic.id_sales = ?)
                ");
                $stmt->execute([$id]);
                $dades = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($dades);
                $tots = 1;
            }
            if (isset($_GET['seleccionats'])) {
                $id = intval($_GET['seleccionats']);
                $stmt = $pdo->prepare("SELECT com.id, com.descripcio, com.preu, com.actiu
                                         FROM _t_complements com
                                        WHERE com.id IN (SELECT sic.id_complements FROM _t_sales_in_complements sic WHERE sic.id_sales = ?)
                ");
                $stmt->execute([$id]);
                $dades = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($dades);
                $tots = 1;
            }
            
            if ($tots == 0) {        
                $stmt = $pdo->query("SELECT sal.id, sal.descripcio, sal.id_edifici, sal.preu, sal.actiu, sal.color, sal.missatge, sal.max_ocupacio, sal.horari,
                                          edi.nom as nom_edifici, sal.latitud, sal.longitud
                                     FROM _t_sales sal 
                                     LEFT JOIN _t_edificis edi ON (sal.id_edifici = edi.id)");
                $dades = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($dades);
            }
        break;

    // Insert
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['descripcio'], $data['idedifici'], $data['preu'], $data['actiu'], $data['color'], $data['missatge'], $data['complement'], $data['max_ocupacio'], $data['horari'], $data['latitud'], $data['longitud'])) {
            echo json_encode(['error' => 'Faltan campos']);
            exit;
        }
        $stmt = $pdo->prepare("INSERT INTO _t_sales (descripcio, id_edifici, preu, color, missatge, actiu, max_ocupacio, horari, latitud, longitud) VALUES (?, ?, ?, ?, ? ,? ,? ,?, ?, ?)");
        $success = $stmt->execute([                                  
            $data['descripcio'],
            $data['idedifici'],            
            $data['preu'],
            $data['color'],
            $data['missatge'],
            $data['actiu'],    
            $data['max_ocupacio'],
            $data['horari'],   
            $data['latitud'],
            $data['longitud'],
        ]);
        // Insert Complements
                    
        
//        $stmt = $pdo->prepare("SELECT LAST_INSERT_ID() as id");
//        $dades = $stmt->fetch(PDO::FETCH_ASSOC);
//        $lastId = $dades['id'];
        
        $lastId = $pdo->lastInsertId();
        
        $ids = explode('#', $data['complement']);
        $stmt = $pdo->prepare("INSERT INTO _t_sales_in_complements (id_sales, id_complements) VALUES (:id_sales, :id_complements)");        
        // Insertar cada id_complementos
        foreach ($ids as $id_complemento) {
            if ($id_complemento>0) {
                $stmt->execute([
                    ':id_sales' => $lastId,
                    ':id_complements' => $id_complemento
                ]);
            }
        }                

        echo json_encode(['success' => $success, 'id' => $lastId]);
        break;

    // Update
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['descripcio'], $data['idedifici'], $data['preu'], $data['actiu'], $data['color'], $data['missatge'], $data['max_ocupacio'], $data['horari'], $data['latitud'], $data['longitud'])) {
            echo json_encode(['error' => 'Faltan campos Update ']);
            exit;
        }

        $stmt = $pdo->prepare("UPDATE _t_sales SET descripcio = ?, id_edifici = ?, preu = ?, color = ?, missatge = ?, max_ocupacio = ?, actiu = ?, horari = ?, latitud = ?, longitud = ? WHERE id = ?");
        $success = $stmt->execute([                                 
            $data['descripcio'],
            $data['idedifici'],            
            $data['preu'],
            $data['color'],
            $data['missatge'],
            $data['max_ocupacio'],
            $data['actiu'],
            $data['horari'],
            $data['latitud'],
            $data['longitud'],
            $data['id']            
        ]);

        // Insert Complements
        $lastId = $data['id'];
        $delete = $pdo->prepare("DELETE FROM _t_sales_in_complements WHERE id_sales = :id_sales");
        $delete->execute([':id_sales' => $lastId]);
        //        
        $ids = explode('#', $data['complement']);
        $stmt = $pdo->prepare("INSERT INTO _t_sales_in_complements (id_sales, id_complements) VALUES (:id_sales, :id_complements)");
        // Insertar cada id_complementos
        foreach ($ids as $id_complemento) {
            $stmt->execute([
                ':id_sales' => $lastId,
                ':id_complements' => $id_complemento
            ]);
        }
        
        echo json_encode(['success' => $success]);
        break;

    default:
        echo json_encode(['error' => 'Método no soportado']);
        break;
}

>>>>>>> 5d247d428903589ab1a72f1318fa8a1d33ec70ba
?>