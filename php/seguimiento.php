<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/util.php';

require_post();

$folio = clean($_POST['folio'] ?? '');
$email = clean($_POST['email'] ?? '');

if ($folio === '' || $email === '') {
  json_response(['ok'=>false,'error'=>'Folio y email son obligatorios.'], 400);
}

$pdo = db();

// obtener el mensaje del usuario por folio+email
$stmt = $pdo->prepare("
  SELECT cm.id_message, cm.folio, cm.asunto, cm.mensaje, cm.status, cm.creado_en,
         u.email, u.nombre, u.apellido
  FROM contact_messages cm
  JOIN users u ON u.id_user = cm.id_user
  WHERE cm.folio=? AND u.email=?
  LIMIT 1
");
$stmt->execute([$folio, $email]);
$msg = $stmt->fetch();

if (!$msg) {
  json_response(['ok'=>false,'error'=>'No se encontró esa solicitud con esos datos.'], 404);
}

// última respuesta del admin (si existe)
$rep = $pdo->prepare("
  SELECT asunto, respuesta, creado_en
  FROM admin_replies
  WHERE id_message=?
  ORDER BY id_reply DESC
  LIMIT 1
");
$rep->execute([(int)$msg['id_message']]);
$reply = $rep->fetch();

json_response(['ok'=>true,'message'=>$msg,'reply'=>$reply ?: null]);
