<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Conexio a la base de dades.
require_once "dbconnect.php";

class CalendariAPI {
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
     * Lectura per ID
     *
     */
    public function get_id() {
            $id = $this->limpiarInt($_GET['id']);
            if (!$id) return $this->json(["error" => "ID inválido"]);            
            $stmt = $this->db->prepare("SELECT id, sala, hora_inici, actiu FROM _t_reserves WHERE id = ?");
            $stmt->execute([$id]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            return $this->json($row ?: ["error" => "No encontrado"]);
    }
    
    /**
     *
     * Lectura per sala
     *
     */
    public function get_buscarSala() {
           $sala      = $this->limpiarInt($_GET['buscarSala']);
           $diainici  = $this->limpiarString($_GET['diaInici']);
           $diafi     = $this->limpiarString($_GET['diaFi']);
           $horainici = $this->limpiarString($_GET['horaInici']);
           $horafi    = $this->limpiarString($_GET['horaFi']);        
           if ($diainici == $diafi) {
               $stmt = $this->db->prepare("
                                SELECT res.dia_inici,res.dia_fi,res.sala,res.hora_inici,res.hora_fi
			                      FROM _t_reserves res
			                      LEFT JOIN _t_sales sal ON (sal.id = res.sala)
			                      WHERE res.sala = :sala
			                     AND (
			                        (res.hora_inici > :horainici1 AND res.hora_inici < :horafi1 OR res.hora_fi > :horainici2 AND res.hora_fi < :horafi2)
				                        or res.hora_inici = :horainici3
                                        or res.hora_fi = :horafi3
                                    )
				                AND (res.dia_inici <= :diainici and res.dia_fi >= :diafi
               ");
               $stmt->execute([':sala' => $sala,
                            ':horainici1' => $horainici,':horafi1' => $horafi,
                            ':horainici2' => $horainici,':horafi2' => $horafi,
                            ':horainici3' => $horainici,':horafi3' => $horafi,
                            ':diainici'   => $diainici,':diafi'   => $diafi
                           ]);            
               $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
               return $this->json($data);
          }
          else {
               $stmt = $this->db->prepare("
                                SELECT res.dia_inici,res.dia_fi,res.sala,res.hora_inici,res.hora_fi
			                      FROM _t_reserves res
			                      LEFT JOIN _t_sales sal ON (sal.id = res.sala)
			                      WHERE res.sala = :sala
			                     AND (
			                        (res.hora_inici > :horainici1 AND res.hora_inici < :horafi1 OR res.hora_fi > :horainici2 AND res.hora_fi < :horafi2)
				                        or res.hora_inici = :horainici3
                                        or res.hora_fi = :horafi3
                                    )
				                AND ((res.dia_inici <= :diainici1 and res.dia_fi >= :diafi1) OR (res.dia_fi >= :diainici2 AND res.dia_fi <= :diafi2))
               ");
               $stmt->execute([':sala' => $sala,
                ':horainici1' => $horainici,':horafi1' => $horafi,
                ':horainici2' => $horainici,':horafi2' => $horafi,
                ':horainici3' => $horainici,':horafi3' => $horafi,
                ':diainici1'   => $diainici,':diafi1'   => $diafi,
                ':diainici2'   => $diainici,':diafi2'   => $diafi
               ]);
               $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
               return $this->json($data);
           }
    }
    
    
    /**
     *
     * Lectura per dia x edifici
     *
     */
    public function get_dia_edifici() {
            $dia     = $this->limpiarString($_GET['dia']);
            $edifici = $this->limpiarInt($_GET['edifici']);        
            $stmt = $this->db->prepare("        
                           SELECT sal.id, sal.descripcio, h.hora AS hora_inici, COALESCE(r.hora_fi, 'No informado') AS estado, h.tipus
                                FROM _t_hores h
                           INNER JOIN _t_sales sal On sal.id_edifici = :edifici And sal.actiu = 'SI' And h.tipus = sal.horari
                           LEFT JOIN (SELECT hora_inici,hora_fi,sala FROM _t_reserves res WHERE res.dia_inici <= :dia1 and res.dia_fi >= :dia2 GROUP BY sala,hora_inici) r ON h.hora = r.hora_inici and r.sala = sal.id
                           WHERE h.activa = 'SI'
                           ORDER BY sal.descripcio,h.hora");
            $stmt->execute([':edifici' => $edifici, 'dia1' => $dia, 'dia2' => $dia]);                               
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $this->json($data);        
    }

    /**
     *
     * Lectura per dia x sala y reserva
     *
     */
    public function get_dia_reserva() {
        $dia     = $this->limpiarString($_GET['dia']);
        $sala    = $this->limpiarInt($_GET['sala']);
        $reserva = $this->limpiarInt($_GET['reserva']);
        $stmt = $this->db->prepare("       
                              SELECT sal.id, sal.descripcio, h.hora AS hora_inici, COALESCE(r.hora_fi, 'No informado') AS estado, h.tipus
                                FROM _t_hores h
                          INNER JOIN _t_sales sal On sal.id = :sala And sal.actiu = 'SI' And h.tipus = sal.horari
                          LEFT JOIN (SELECT hora_inici,hora_fi,sala FROM _t_reserves res WHERE res.dia_inici = :dia AND res.id = :reserva GROUP BY sala,hora_inici) r ON h.hora = r.hora_inici and r.sala = sal.id
                         WHERE h.activa = 'SI'
                          ORDER BY sal.descripcio,h.hora");
        $stmt->execute([':sala' => $sala, 'dia' => $dia, 'reserva' => $reserva]);
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return $this->json($data);
    }
        
        
    /**
     *
     * Lectura per dia x sala
     *
     */
    public function get_dia_sala() {
        $dia     = $this->limpiarString($_GET['dia']);
        $sala    = $this->limpiarInt($_GET['sala']);
        $stmt = $this->db->prepare("        
                              SELECT sal.id, sal.descripcio, h.hora AS hora_inici, COALESCE(r.hora_fi, 'No informado') AS estado, h.tipus
                                FROM _t_hores h
                          INNER JOIN _t_sales sal On sal.id = :sala And sal.actiu = 'SI' And h.tipus = sal.horari
                          LEFT JOIN (SELECT hora_inici,hora_fi,sala FROM _t_reserves res WHERE res.dia_inici = :dia GROUP BY sala,hora_inici,hora_fi) r ON h.hora = r.hora_inici and r.sala = sal.id
                         WHERE h.activa = 'SI'
                          ORDER BY sal.descripcio,h.hora");
        $stmt->execute([':sala' => $sala, 'dia' => $dia]);
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return $this->json($data);
    }
        
    /**
     *
     * Lectura per dia x sala
     *
     */
    public function get_any_edifici() {
        $any     = $this->limpiarInt($_GET['any']);
        $edifici = $this->limpiarInt($_GET['edifici']);
        $stmt = $this->db->prepare("        
                                  SELECT res.id,res.dia_inici,res.dia_fi,res.hora_inici,res.hora_fi,sal.color, sal.descripcio, res.sala
                                   FROM _t_reserves res
                                    LEFT JOIN _t_sales sal ON (res.sala = sal.id)
                                   WHERE res.actiu = 'SI'
                                     AND year(res.dia_inici) = :any
                                     and sal.id_edifici = :edifici");
        $stmt->execute([':any' => $any, 'edifici' => $edifici]);
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return $this->json($data);
    }
        
    /**
     *
     * Lectura per dia x sala
     *
     */
    public function get_reserva() {
        $reserva = $this->limpiarInt($_GET['reserva']);
        $stmt = $this->db->prepare("                
                                       SELECT res.id, res.dia_inici, res.dia_fi, res.hora_inici, res.hora_fi, res.import as preu_sala, res.id_user,
                                              ric.id_complements, com.descripcio, com.preu, res.sala, res.frequencia,
                                              res.dilluns, res.dimarts, res.dimecres, res.dijous, res.divendres, res.dissabte, res.diumenge, res.tipo, res.dia_mes, res.el_semana, res.el_dia,
                                              sal.descripcio, sal.id_edifici, sal.preu, sal.max_ocupacio, sal.missatge, sal.horari
                                        FROM db_espaiflex._t_reserves res
                                        LEFT JOIN _t_reserves_in_complements ric ON  res.id = ric.id_reserves
                                        LEFT JOIN _t_complements com ON ric.id_complements = com.id
                                        LEFT JOIN _t_sales sal ON res.sala = sal.id
                                        WHERE res.id = :reserva");
        $stmt->execute([':reserva' => $reserva]);
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
        if (!isset($data['sala'], $data['dia_inici'], $data['dia_fi'], $data['hora_inici'], $data['hora_fi'], $data['import'], $data['id_user'], $data['frecuencia'],
            $data['dom'], $data['lun'], $data['mar'], $data['mie'], $data['jue'], $data['vie'], $data['sab'], $data['tipo'], $data['dia_mes'], $data['el_semana'], $data['el_dia'],
            $data['complements'])) {
                echo json_encode(['error' => 'Faltan campos']);
                exit;
        }
        
        $sala       = $this->limpiarString($data['sala']);
        $dia_inici  = $this->limpiarString($data['dia_inici']);
        $dia_fi     = $this->limpiarString($data['dia_fi']);
        $hora_inici = $this->limpiarString($data['hora_inici']);
        $hora_fi    = $this->limpiarString($data['hora_fi']);
        $import     = $this->limpiarFloat($data['import']);
        $id_user    = $this->limpiarInt($data['id_user']);
        $frecuencia = $this->limpiarInt($data['frecuencia']);
        $dom        = $this->limpiarInt($data['dom']);
        $lun        = $this->limpiarInt($data['lun']);
        $mar        = $this->limpiarInt($data['mar']);
        $mie        = $this->limpiarInt($data['mie']);
        $jue        = $this->limpiarInt($data['jue']);
        $vie        = $this->limpiarInt($data['vie']);
        $sab        = $this->limpiarInt($data['sab']);
        $tipo       = $this->limpiarInt($data['tipo']);
        $dia_mes    = $this->limpiarInt($data['dia_mes']);
        $el_semana  = $this->limpiarInt($data['el_semana']);
        $el_dia     = $this->limpiarInt($data['el_dia']);        
        // Update Taula sales.
        $stmt       = $this->db->prepare("INSERT INTO _t_reserves (sala, dia_inici, dia_fi, hora_inici, hora_fi, import, id_user, actiu, frequencia,
                                                                   diumenge, dilluns, dimarts, dimecres, dijous, divendres, dissabte, tipo, dia_mes, el_semana, el_dia)
                                          VALUES (?, ?, ?, ?, ? ,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )");
        $ok         = $stmt->execute([ $sala, $dia_inici, $dia_fi, $hora_inici, $hora_fi, $import, $id_user, $frecuencia, $dom, $lun, $mar, $mie, $jue, $vie, $sab, $tipo, $dia_mes, $el_semana, $el_dia]);
        $lastId = $this->db->lastInsertId();
        // Inserto els Nous Complements
        $ids = explode('#', $data['complement']);
        $validos = [];
        foreach ($ids as $id) {
            $id = $this->limpiarInt($id);
            if ($id !== false) { $validos[] = $id; }
        }
        $stmt = $this->db->prepare("INSERT INTO _t_reserves_in_complements (id_reserves, id_complements) VALUES (:id_reserves, :id_complements)");
        // Insertar cada id_complementos
        foreach ($validos as $id_complemento) {
            $stmt->execute([':id_reserves' => $lastId,':id_complements' => $id_complemento]);
        }
        return $this->json(["success" => $ok, "id" => $lastId]);
    }
    
    /**
     * UPDATE put
     * @return success o error
     *
     */
    public function put() {
        
    }
}

// Ejecutar
$api = new CalendariAPI($pdo);
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $tots = 0;
        if (($tots == 0)&&(isset($_GET['buscarSala']))&&(isset($_GET['diaInici']))&&(isset($_GET['diaFi']))&&(isset($_GET['horaInici']))&&(isset($_GET['horaFi']))) { $api->get_buscarSala(); $tots = 1;}
        if (($tots == 0)&&(isset($_GET['id'])))                                                     { $api->get_id(); $tots = 1;}
        if (($tots == 0)&&(isset($_GET['dia']))&&(isset($_GET['edifici'])))                         { $api->get_dia_edifici(); $tots = 1;}
        if (($tots == 0)&&(isset($_GET['dia']))&&(isset($_GET['sala']))&&(isset($_GET['reserva']))) { $api->get_dia_reserva(); $tots = 1; }
        if (($tots == 0)&&(isset($_GET['dia']))&&(isset($_GET['sala'])))                            { $api->get_dia_sala(); $tots = 1;}        
        if (($tots == 0)&&(isset($_GET['any']))&&(isset($_GET['edifici'])))                         { $api->get_any_edifici(); $tots = 1;}
        if (($tots == 0)&&(isset($_GET['reserva'])))                                                { $api->get_reserva(); $tots = 1;}
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
