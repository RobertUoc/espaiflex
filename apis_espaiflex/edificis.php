<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Conexio a la base de dades.
require_once "dbconnect.php";

class EdificisAPI {
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
            $stmt = $this->db->prepare("SELECT * FROM _t_edificis WHERE id = ?");
            $stmt->execute([$id]);            
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            return $this->json($row ?: ["error" => "No encontrado"]);
        }
        if (isset($_GET['provincia'])) {
            $tots = 1;
            $id = '%'.strtoupper($this->limpiarString($_GET['provincia'])).'%';            
            $stmt = $this->db->prepare("SELECT pro.nom as provincia, edi.id, edi.nom, edi.imatge, edi.latitud, edi.longitud FROM _t_edificis edi LEFT JOIN _t_provincies pro ON (edi.id_provincia = pro.id) WHERE edi.actiu = 'SI' AND pro.nom like(?)");
            $stmt->execute([$id]);
            $row = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $this->json($row ?: ["error" => "No encontrado"]);
        }
        if ($tots == 0) {
            $stmt = $this->db->query("SELECT * FROM _t_edificis");
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
        if (!isset($data['nom'], $data['idprovincia'], $data['imatge'], $data['descripcio'], $data['actiu'], $data['latitud'], $data['longitud'])) {
            echo json_encode(['error' => 'Faltan campos']);
            exit;
        }
        $nom         = $this->limpiarString($data['nom']);
        $idprovincia = $this->limpiarString($data['idprovincia']);
        $imatge      = $data['imatge'];
        $descripcio  = $this->limpiarString($data['descripcio']);
        $actiu       = $this->limpiarString($data['actiu']);
        $latitud     = $this->limpiarFloat($data['latitud']);
        $longitud    = $this->limpiarFloat($data['longitud']);        
        $stmt        = $this->db->prepare("INSERT INTO _t_edificis (nom, id_provincia, imatge, descripcio, actiu, latitud, longitud) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $ok          = $stmt->execute([ $nom, $idprovincia, $imatge, $descripcio, $actiu,  $latitud, $longitud ]);
        return $this->json(["success" => $ok, "id" => $this->db->lastInsertId()]);
    }

    /**
     * UPDATE put
     * @return success o error
     * 
     */
    public function put() {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['id'], $data['nom'], $data['idprovincia'], $data['imatge'], $data['descripcio'], $data['actiu'], $data['latitud'], $data['longitud'])) {
            echo json_encode(['error' => 'Faltan campos']);
            exit;
        }
        $nom         = $this->limpiarString($data['nom']);
        $idprovincia = $this->limpiarString($data['idprovincia']);
        $imatge      = $data['imatge'];
        $descripcio  = $this->limpiarString($data['descripcio']);
        $actiu       = $this->limpiarString($data['actiu']);
        $latitud     = $this->limpiarFloat($data['latitud']);
        $longitud    = $this->limpiarFloat($data['longitud']);        
        $id          = $this->limpiarInt($data['id']);                
        if (!$id) return $this->json(["error" => "ID inválido"]);        
        $stmt        = $this->db->prepare("UPDATE _t_edificis SET nom = ?, id_provincia = ?, imatge = ?, descripcio = ?, actiu = ?, latitud = ?, longitud = ? WHERE id = ?");
        $ok          = $stmt->execute([ $nom, $idprovincia, $imatge, $descripcio, $actiu,  $latitud, $longitud, $id ]);
        return $this->json(["success" => $ok]);
    }
}

// Ejecutar
$api = new EdificisAPI($pdo);
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
