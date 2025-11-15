<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Conexio a la base de dades.
require_once "dbconnect.php";

class UsersAPI {
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
     * Lectura de la tabla
     * 
     */
    public function get() {
        if (isset($_GET['email'], $_GET['password'], $_GET['usuari'])) {
            $email    = $this->limpiarString($_GET['email'], 120);
            $password = $this->limpiarString($_GET['password'], 120);
            $usuari   = $this->limpiarString($_GET['usuari'], 30);
            $stmt     = $this->db->prepare("SELECT * FROM _t_users WHERE tipus = ? AND email = ? AND password = ?");
            $stmt->execute([$usuari, $email, $password]);
            $row      = $stmt->fetch(PDO::FETCH_ASSOC);
            return $this->json($row ?: ["error" => "No encontrado"]);
        }

        $stmt = $this->db->query("SELECT * FROM _t_users");
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return $this->json($data);
    }

    /**
     * INSERT post.
     * @return json con el ID
     * 
     */
    public function post() {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['nom'], $data['email'], $data['password'])) {
            return $this->json(["error" => "Faltan campos"]);
        }
        $nom      = $this->limpiarString($data['nom'], 120);
        $email    = $this->limpiarString($data['email'], 120);
        $password = $this->limpiarString($data['password'], 120);
        $stmt = $this->db->prepare("INSERT INTO _t_users (nom, email, password) VALUES (?, ?, ?)");
        $ok   = $stmt->execute([$nom, $email, $password]);
        return $this->json(["success" => $ok, "id" => $this->db->lastInsertId()]);
    }

    /**
     * UPDATE put
     * @return success o error
     * 
     */
    public function put() {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['nom'], $data['email'], $data['password'], $data['id'])) {
            return $this->json(["error" => "Faltan campos Update"]);
        }
        $nom      = $this->limpiarString($data['nom'], 120);
        $email    = $this->limpiarString($data['email'], 120);
        $password = $this->limpiarString($data['password'], 120);
        $id       = filter_var($data['id'], FILTER_VALIDATE_INT);
        if (!$id) return $this->json(["error" => "ID inválido"]);        
        $stmt = $this->db->prepare("UPDATE _t_users SET nom = ?, email = ?, password = ? WHERE id = ?");
        $ok   = $stmt->execute([$nom, $email, $password, $id]);
        return $this->json(["success" => $ok]);
    }
}

// Ejecutar
$api = new UsersAPI($pdo);
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
