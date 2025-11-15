<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Conexio a la base de dades.
require_once "dbconnect.php";

class ComplementsAPI {
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
        if (isset($_GET['id'])) {
            $id = $this->limpiarInt($_GET['id']);
            if (!$id) return $this->json(["error" => "ID inválido"]);
            $stmt = $this->db->prepare("SELECT * FROM _t_complements WHERE id = ?");
            $stmt->execute([$id]);            
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            return $this->json($row ?: ["error" => "No encontrado"]);
        }
        else {
            $stmt = $this->db->query("SELECT * FROM _t_complements");
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
        if (!isset($data['descripcio'], $data['actiu'], $data['preu'])) {
            echo json_encode(['error' => 'Faltan campos']);
            exit;
        }
        $descripcio = $this->limpiarString($data['descripcio']);
        $actiu      = $this->limpiarString($data['actiu']);
        $preu       = $this->limpiarFloat($data['preu']);        
        $stmt       = $this->db->prepare("INSERT INTO _t_complements (descripcio, preu, actiu) VALUES (?, ?, ?)");
        $ok         = $stmt->execute([ $descripcio, $preu, $actiu ]);        
        return $this->json(["success" => $ok, "id" => $this->db->lastInsertId()]);
    }

    /**
     * UPDATE put
     * @return success o error
     * 
     */
    public function put() {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['descripcio'], $data['actiu'], $data['preu'], $data['id'])) {
            echo json_encode(['error' => 'Faltan campos']);
            exit;
        }
        $descripcio = $this->limpiarString($data['descripcio']);
        $actiu      = $this->limpiarString($data['actiu']);
        $preu       = $this->limpiarFloat($data['preu']);
        $id         = $this->limpiarInt($data['id']);                
        if (!$id) return $this->json(["error" => "ID inválido"]);
        $stmt       = $this->db->prepare("UPDATE _t_complements SET descripcio = ?, preu = ?, actiu = ?  WHERE id = ?");
        $ok         = $stmt->execute([ $descripcio,  $preu, $actiu, $id ]);
        return $this->json(["success" => $ok]);
    }
}

// Ejecutar
$api = new ComplementsAPI($pdo);
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
