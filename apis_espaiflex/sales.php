<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Conexio a la base de dades.
require_once "dbconnect.php";

class SalesAPI {
    private PDO $db;
    
    public function __construct(PDO $pdo) {
        $this->db = $pdo;
        // Activem Errors SQL.
        $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }
    
    /**
     *
     * Devolber los valores en formato JSON
     *
     */
    private function json($data) {
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
    }
    
    /**
     *
     * Limpir string
     * Entrada string y longitud maxima del string (Resto fuera)
     * Retorno string limpio.
     *
     */
    private function limpiarString($s, $max = 200) {
        $s = trim(strip_tags($s));
        return substr($s, 0, $max);
    }
    
    /**
     *
     * Limpir string
     * Entrada float
     * Retorno string limpio.
     *
     */
    private function limpiarFloat($num) {
        return filter_var($num, FILTER_VALIDATE_FLOAT);
    }
    
    /**
     *
     * Limpir string
     * Entrada int
     * Retorno string limpio.
     *
     */
    private function limpiarInt($num) {
        return filter_var($num, FILTER_VALIDATE_INT);
    }
    
    /**
     *
     * Lectura de la tabla
     *
     */
    public function get() {
        $tots = 0;
        if (isset($_GET['id'])) {
            $tots = 1;
            $id = $this->limpiarInt($_GET['id']);
            if (!$id) return $this->json(["error" => "ID inválido"]);
            $stmt = $this->db->prepare("SELECT sal.id, sal.descripcio, sal.id_edifici, sal.preu, sal.actiu, sal.color, sal.missatge, sal.max_ocupacio, sal.horari, sal.imatge,
                                          edi.nom as nom_edifici
                                     FROM _t_sales sal
                                     LEFT JOIN _t_edificis edi ON (sal.id_edifici = edi.id)
                                     WHERE sal.id = ?");
            $stmt->execute([$id]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            return $this->json($row ?: ["error" => "No encontrado"]);
        }
        if (isset($_GET['edifici'])) {
            $tots = 1;
            $id = $this->limpiarInt($_GET['edifici']);            
            $stmt = $this->db->prepare("SELECT sal.id, sal.descripcio, sal.id_edifici, sal.preu, sal.actiu, sal.color, sal.missatge, sal.max_ocupacio, sal.horari, sal.imatge,
                                          edi.nom as nom_edifici
                                     FROM _t_sales sal
                                     LEFT JOIN _t_edificis edi ON (sal.id_edifici = edi.id)
                                     WHERE sal.id_edifici = ?");
            $stmt->execute([$id]);
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $this->json($data);
        }
        if (isset($_GET['disponibles'])) {
            $tots = 1;
            $id = $this->limpiarInt($_GET['disponibles']);            
            $stmt = $this->db->prepare("SELECT com.id, com.descripcio, com.preu, com.actiu
                                         FROM _t_complements com
                                        WHERE com.actiu = 'SI'
                                          AND com.id NOT IN (SELECT sic.id_complements FROM _t_sales_in_complements sic WHERE sic.id_sales = ?)
                ");
            $stmt->execute([$id]);
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $this->json($data);
        }
        if (isset($_GET['seleccionats'])) {
            $tots = 1;
            $id = $this->limpiarInt($_GET['seleccionats']);
            $stmt = $this->db->prepare("SELECT com.id, com.descripcio, com.preu, com.actiu
                                         FROM _t_complements com
                                        WHERE com.id IN (SELECT sic.id_complements FROM _t_sales_in_complements sic WHERE sic.id_sales = ?)
                ");
            $stmt->execute([$id]);
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $this->json($data);
        }       
        if ($tots == 0) {
            $stmt = $this->db->query("SELECT * FROM _t_sales");
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $this->json($data);
        }
    }
    
    /**
     * INSERT post.
     * @return json con el ID
     *
     */
    public function post() {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['descripcio'], $data['idedifici'], $data['preu'], $data['actiu'], $data['color'], $data['missatge'], $data['max_ocupacio'], $data['horari'], $data['imatge'])) {
            echo json_encode(['error' => 'Faltan campos Update ']);
            exit;
        }
        $descripcio   = $this->limpiarString($data['descripcio']);
        $idedifici    = $this->limpiarInt($data['idedifici']);
        $preu         = $this->limpiarFloat($data['preu']);
        $color        = $this->limpiarString($data['color']);
        $missatge     = $this->limpiarString($data['missatge']);
        $actiu        = $this->limpiarString($data['actiu']);
        $max_ocupacio = $this->limpiarInt($data['max_ocupacio']);
        $horari       = $this->limpiarString($data['horari']);
        $imatge       = $data['imatge'];
        // Insert Taula sales.
        $stmt         = $this->db->prepare("INSERT INTO _t_sales (descripcio, id_edifici, preu, color, missatge, actiu, max_ocupacio, horari, imatge ) VALUES (?, ?, ?, ?, ? ,? ,? ,?, ?)");
        $ok           = $stmt->execute([ $descripcio, $idedifici, $preu, $color, $missatge, $max_ocupacio, $actiu, $horari, $imatge ]);
        $lastId = $this->db->lastInsertId();
        // Inserto els Nous Complements
        $ids = explode('#', $data['complement']);
        $validos = [];
        foreach ($ids as $id) {
            $id = $this->limpiarInt($id);
            if ($id !== false) { $validos[] = $id; }
        }
        $stmt = $this->db->prepare("INSERT INTO _t_sales_in_complements (id_sales, id_complements) VALUES (:id_sales, :id_complements)");
        // Insertar cada id_complementos
        foreach ($validos as $id_complemento) {
            $stmt->execute([':id_sales' => $lastId,':id_complements' => $id_complemento]);
        }
        return $this->json(["success" => $ok, "id" => $lastId]);
    }
    
    /**
     * UPDATE put
     * @return success o error
     *
     */
    public function put() {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['descripcio'], $data['idedifici'], $data['preu'], $data['actiu'], $data['color'], $data['missatge'], $data['max_ocupacio'], $data['horari'], $data['imatge'], $data['id'])) {
            echo json_encode(['error' => 'Faltan campos Update ']);
            exit;
        }
        $descripcio   = $this->limpiarString($data['descripcio']);
        $idedifici    = $this->limpiarInt($data['idedifici']);
        $preu         = $this->limpiarFloat($data['preu']);
        $color        = $this->limpiarString($data['color']);
        $missatge     = $this->limpiarString($data['missatge']);
        $actiu        = $this->limpiarString($data['actiu']);
        $max_ocupacio = $this->limpiarInt($data['max_ocupacio']);
        $horari       = $this->limpiarString($data['horari']);
        $imatge       = $data['imatge'];
        $id           = $this->limpiarInt($data['id']);
        // Update Taula sales.
        $stmt         = $this->db->prepare("UPDATE _t_sales SET descripcio = ?, id_edifici = ?, preu = ?, color = ?, missatge = ?, max_ocupacio = ?, actiu = ?, horari = ?, imatge = ? WHERE id = ?");
        $ok           = $stmt->execute([ $descripcio, $idedifici, $preu, $color, $missatge, $max_ocupacio, $actiu, $horari, $imatge, $id ]);        
        // Insert Complements
        $lastId = $id;
        // Esborro Complements
        $delete = $this->db->prepare("DELETE FROM _t_sales_in_complements WHERE id_sales = :id_sales");
        $delete->execute([':id_sales' => $lastId]);
        // Inserto els Nous Complements
        $ids = explode('#', $data['complement']);
        $validos = [];
        foreach ($ids as $id) {
            $id = $this->limpiarInt($id);
            if ($id !== false) { $validos[] = $id; }
        }
        $stmt = $this->db->prepare("INSERT INTO _t_sales_in_complements (id_sales, id_complements) VALUES (:id_sales, :id_complements)");
        // Insertar cada id_complementos
        foreach ($validos as $id_complemento) {
            $stmt->execute([':id_sales' => $lastId,':id_complements' => $id_complemento]);
        }        
        return $this->json(["success" => $ok]);
    }
}

// Ejecutar
$api = new SalesAPI($pdo);
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $api->get();
        break;
    case 'POST':
        $api->post();
        break;
    case 'PUT':
        $api->put();
        break;
    default:
        echo json_encode(["error" => "Método no soportado"]);
}
?>
