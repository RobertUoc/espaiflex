<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Conexio a la base de dades.
require_once "dbconnect.php";

class ProvinciesAPI {
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
            $stmt = $this->db->prepare("SELECT * FROM _t_provincies WHERE id = ?");
            $stmt->execute([$id]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            return $this->json($row ?: ["error" => "No encontrado"]);
        }
        else {
            $stmt = $this->db->query("SELECT * FROM _t_provincies");
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $this->json($data);
        }
    }
    
}

// Ejecutar
$api = new ProvinciesAPI($pdo);
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $api->get();
        break;
    default:
        echo json_encode(["error" => "Método no soportado"]);
}
?>
