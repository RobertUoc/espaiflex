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
                $stmt = $pdo->prepare("SELECT res.id, res.sala, res.hora_inici, res.actiu                                          
                                     FROM _t_reserves res                                     
                                     WHERE res.id = ?");
                $stmt->execute([$id]);
                $dades = $stmt->fetch(PDO::FETCH_ASSOC);
                echo json_encode($dades ?: ['error' => 'No encontrado']);
                $tots = 1;
            }    
            // Get Mira
            if ((isset($_GET['dia']))&&(isset($_GET['edifici']))) {                
                $dia = $_GET['dia'];
                $edifici = $_GET['edifici'];
                
                $sql = sprintf("SELECT sal.id, sal.descripcio, h.hora AS hora_inici, COALESCE(r.hora_fi, 'No informado') AS estado, h.tipus
                                FROM _t_hores h
                          INNER JOIN _t_sales sal On sal.id_edifici = %s And sal.actiu = 'SI' And h.tipus = sal.horari
                          LEFT JOIN (SELECT hora_inici,hora_fi,sala FROM _t_reserves res WHERE res.dia_inici <= '%s' and res.dia_fi >= '%s' GROUP BY sala,hora_inici) r ON h.hora = r.hora_inici and r.sala = sal.id
                         WHERE h.activa = 'SI'
                          ORDER BY sal.descripcio,h.hora",$edifici,$dia,$dia);                
                                 
                
                $stmt = $pdo->query($sql);
                $dades = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($dades);
                $tots = 1;
            }
            if ((isset($_GET['dia']))&&(isset($_GET['sala']))&&(isset($_GET['reserva']))) {
                $dia = $_GET['dia'];
                $sala = $_GET['sala'];
                $reserva = $_GET['reserva'];
                
                $sql = sprintf("SELECT sal.id, sal.descripcio, h.hora AS hora_inici, COALESCE(r.hora_fi, 'No informado') AS estado, h.tipus
                                FROM _t_hores h                          
                          INNER JOIN _t_sales sal On sal.id = %s And sal.actiu = 'SI' And h.tipus = sal.horari
                          LEFT JOIN (SELECT hora_inici,hora_fi,sala FROM _t_reserves res WHERE res.dia_inici = '%s' AND res.id = %s GROUP BY sala,hora_inici) r ON h.hora = r.hora_inici and r.sala = sal.id
                         WHERE h.activa = 'SI'
                          ORDER BY sal.descripcio,h.hora",$sala,$dia,$reserva);
                                               
                $stmt = $pdo->query($sql);
                $dades = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($dades);
                $tots = 1;
            }           
            if (($tots == 0)&&(isset($_GET['dia']))&&(isset($_GET['sala']))) {
                $dia = $_GET['dia'];
                $sala = $_GET['sala'];                
                $sql = sprintf("SELECT sal.id, sal.descripcio, h.hora AS hora_inici, COALESCE(r.hora_fi, 'No informado') AS estado, h.tipus
                                FROM _t_hores h
                          INNER JOIN _t_sales sal On sal.id = %s And sal.actiu = 'SI' And h.tipus = sal.horari
                          LEFT JOIN (SELECT hora_inici,hora_fi,sala FROM _t_reserves res WHERE res.dia_inici = '%s' GROUP BY sala,hora_inici) r ON h.hora = r.hora_inici and r.sala = sal.id
                         WHERE h.activa = 'SI'
                          ORDER BY sal.descripcio,h.hora",$sala,$dia);                               
                
                $stmt = $pdo->query($sql);
                $dades = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($dades);
                $tots = 1;
            }
            if ((isset($_GET['any']))&&(isset($_GET['edifici']))) {
                $any = $_GET['any'];
                $edifici = $_GET['edifici'];
                $stmt = $pdo->prepare("SELECT res.id,res.dia_inici,res.dia_fi,res.hora_inici,res.hora_fi,sal.color, sal.descripcio, res.sala
                                   FROM _t_reserves res
                                    LEFT JOIN _t_sales sal ON (res.sala = sal.id)
                                   WHERE res.actiu = 'SI'
                                     AND year(res.dia_inici) = ?
                                     and sal.id_edifici = ?
                                ");
                $stmt->execute([$any,$edifici]);
                $dades = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($dades);
            }
            if (($tots == 0)&&(isset($_GET['reserva']))) {                
                $id = intval($_GET['reserva']);
                
                $stmt = $pdo->prepare("SELECT res.id, res.dia_inici, res.dia_fi, res.hora_inici, res.hora_fi, res.import as import_sala, res.id_user, 
                                              ric.id_complements, com.descripcio, com.preu, 
                                              sal.descripcio, sal.id_edifici, sal.preu, sal.max_ocupacio, sal.missatge, sal.horari
                                        FROM db_espaiflex._t_reserves res
                                        LEFT JOIN _t_reserves_in_complements ric ON  res.id = ric.id_reserves
                                        LEFT JOIN _t_complements com ON ric.id_complements = com.id
                                        LEFT JOIN _t_sales sal ON res.sala = sal.id
                                        WHERE res.id = ?");                
                $stmt->execute([$id]);
                $dades = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($dades);
                $tots = 1;
            }
        break;
    // Insert
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['sala'], $data['dia_inici'], $data['dia_fi'], $data['hora_inici'], $data['hora_fi'], $data['import'], $data['id_user'], $data['complements'])) {
            echo json_encode(['error' => 'Faltan campos']);
            exit;
        }
        $stmt = $pdo->prepare("INSERT INTO _t_reserves (sala, dia_inici, dia_fi, hora_inici, hora_fi, import, id_user, actiu) VALUES (?, ?, ?, ?, ? ,?, ?, ?)");
        $success = $stmt->execute([                                  
            $data['sala'],
            $data['dia_inici'], 
            $data['dia_fi'],
            $data['hora_inici'],
            $data['hora_fi'],
            $data['import'],
            $data['id_user'],
            'SI'
        ]);
        // Insert Complements
        $lastId = $dpo->lastInsertId();
        
        $ids = explode('#', $data['complement']);
        $stmt = $pdo->prepare("INSERT INTO _t_reserves_in_complements (id_reserves, id_complements) VALUES (:id_reserves, :id_complements)");        
        // Insertar cada id_complementos
        foreach ($ids as $id_complemento) {
            $stmt->execute([
                ':id_sales' => $lastId,
                ':id_complements' => $id_complemento
            ]);
        }                
        echo json_encode(['success' => $success, 'id' => $lastId]);
        break;
    // Update
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['descripcio'], $data['idedifici'], $data['preu'], $data['actiu'], $data['color'], $data['missatge'])) {
            echo json_encode(['error' => 'Faltan campos Update ']);
            exit;
        }

        $stmt = $pdo->prepare("UPDATE _t_sales SET descripcio = ?, id_edifici = ?, preu = ?, color = ?, missatge = ?, actiu = ?  WHERE id = ?");
        $success = $stmt->execute([                                 
            $data['descripcio'],
            $data['idedifici'],            
            $data['preu'],
            $data['color'],
            $data['missatge'],
            $data['actiu'],
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

?>