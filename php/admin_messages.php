<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/util.php';

require_get();
require_admin();

$estado = clean($_GET['status'] ?? ''); // nuevo|en_proceso|respondido|cerrado

$pdo = db();

$sql = "
SELECT cm.id_message, cm.folio, cm.asunto, cm.mensaje, cm.canal, cm.status, cm.creado_en,
       u.nombre, u.apellido, u.email, u.telefono
FROM contact_messages cm
JOIN users u ON u.id_user = cm.id_user
";

$params = [];
if (in_array($estado, ['nuevo','en_proceso','respondido','cerrado'], true)) {
  $sql .= " WHERE cm.status=? ";
  $params[] = $estado;
}

$sql .= " ORDER BY cm.id_message DESC";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);

json_response(['ok'=>true,'messages'=>$stmt->fetchAll()]);
