<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/util.php';

require_post();
$admin = require_admin();

$id_message = (int)($_POST['id_message'] ?? 0);
$asunto     = clean($_POST['asunto'] ?? '');
$respuesta  = clean($_POST['respuesta'] ?? '');

if ($id_message <= 0 || $respuesta === '' || $asunto === '') {
  json_response(['ok'=>false,'error'=>'Faltan campos: id_message, asunto, respuesta.'], 400);
}

$pdo = db();
$pdo->beginTransaction();

try {
  // asegurar que existe mensaje
  $q = $pdo->prepare("SELECT id_message FROM contact_messages WHERE id_message=? LIMIT 1");
  $q->execute([$id_message]);
  if (!$q->fetch()) json_response(['ok'=>false,'error'=>'Solicitud no encontrada.'], 404);

  // insertar reply
  $ins = $pdo->prepare("
    INSERT INTO admin_replies (id_message, id_admin, asunto, respuesta, enviado_a_correo)
    VALUES (?, ?, ?, ?, 0)
  ");
  $ins->execute([$id_message, $admin['id_admin'], $asunto, $respuesta]);

  // actualizar status del mensaje
  $upd = $pdo->prepare("UPDATE contact_messages SET status='respondido' WHERE id_message=?");
  $upd->execute([$id_message]);

  $pdo->commit();
  json_response(['ok'=>true,'msg'=>'Respuesta guardada.']);

} catch (Throwable $e) {
  $pdo->rollBack();
  json_response(['ok'=>false,'error'=>'Error al responder.'], 500);
}
