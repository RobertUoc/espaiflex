<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Conexio a la base de dades.
require_once "dbconnect.php";

class ComentarisAPI {
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
        if (isset($_GET['id_reserva'])) {
            $id_reserva  = $this->limpiarInt($_GET['id_reserva']);
            $stmt        = $this->db->prepare("SELECT usu.nom, sal.descripcio, res.dia_inici, res.dia_fi, res.hora_inici, res.hora_fi, com.comentari, com.puntuacio,  com.creat
                FROM _t_reserves_comentaris com
                LEFT JOIN  _t_reserves res on res.id = com.id_reserves
                LEFT JOIN _t_sales sal on res.sala = sal.id
                LEFT JOIN _t_users usu on res.id_user = usu.id
                WHERE com.id_reserves = ?
                ORDER BY nom,creat");
            $stmt->execute([$id_reserva]);
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $this->json($data);
        }
        if (isset($_GET['id_sala'])) {
            $id_sala  = $this->limpiarInt($_GET['id_sala']);
            $stmt     = $this->db->prepare("SELECT usu.nom, sal.descripcio, res.dia_inici, res.dia_fi, res.hora_inici, res.hora_fi, com.comentari, com.puntuacio,  com.creat
                FROM _t_reserves_comentaris com
                LEFT JOIN  _t_reserves res on res.id = com.id_reserves
                LEFT JOIN _t_sales sal on res.sala = sal.id
                LEFT JOIN _t_users usu on res.id_user = usu.id
                WHERE res.sala = ?
                ORDER BY nom,creat");
            $stmt->execute([$id_sala]);
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $this->json($data);
        }
        $stmt     = $this->db->prepare("SELECT usu.nom, sal.descripcio, res.dia_inici, res.dia_fi, res.hora_inici, res.hora_fi, com.comentari, com.puntuacio,  com.creat
                FROM _t_reserves_comentaris com
                LEFT JOIN  _t_reserves res on res.id = com.id_reserves
                LEFT JOIN _t_sales sal on res.sala = sal.id
                LEFT JOIN _t_users usu on res.id_user = usu.id
                ORDER BY nom,creat");
        $stmt->execute();
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
        if (!isset($data['id_reserves'], $data['id_user'], $data['comentari'], $data['puntacio'])) {
            return $this->json(["error" => "Faltan campos"]);
        }
        $id_reserva = $this->limpiarInt($data['id_reserves']);
        $id_user    = $this->limpiarInt($data['id_user']);
        $comentari   = $data['comentari'];
        $puntuacio  = $this->limpiarInt($data['puntacio']);
        $stmt = $this->db->prepare("INSERT INTO _t_reserves_comentaris (id_reserves, id_user, comentari, puntuacio) VALUES (?, ?, ?, ?)");
        $ok   = $stmt->execute([$id_reserva, $id_user, $comentari, $puntuacio]);
        return $this->json(["success" => $ok, "id" => $this->db->lastInsertId()]);
    }

}

// Ejecutar
$api = new ComentarisAPI($pdo);
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $api->get();
        break;
    case 'POST':
        $api->post();
        break;
    default:
        echo json_encode(["error" => "Método no soportado"]);
}
?>
