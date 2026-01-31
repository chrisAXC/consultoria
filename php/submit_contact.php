<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/util.php';

require_post();

$nombre   = clean($_POST['nombre'] ?? '');
$apellido = clean($_POST['apellido'] ?? '');
$telefono = clean($_POST['telefono'] ?? '');
$email    = clean($_POST['email'] ?? '');
$asunto   = clean($_POST['asunto'] ?? '');
$mensaje  = clean($_POST['mensaje'] ?? '');

if ($email === '' || $mensaje === '' || $asunto === '') {
  json_response(['ok'=>false,'error'=>'Faltan campos: email, asunto y mensaje.'], 400);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  json_response(['ok'=>false,'error'=>'Email inválido.'], 400);
}

$pdo = db();
$pdo->beginTransaction();

try {
  // 1) asegurar usuario en users
  $q = $pdo->prepare("SELECT id_user FROM users WHERE email=? LIMIT 1");
  $q->execute([$email]);
  $u = $q->fetch();

  if ($u) {
    $id_user = (int)$u['id_user'];
    // opcional: actualiza nombre/telefono si venían
    $upd = $pdo->prepare("UPDATE users SET nombre=COALESCE(NULLIF(?,''),nombre), apellido=COALESCE(NULLIF(?,''),apellido), telefono=COALESCE(NULLIF(?,''),telefono), origen='contacto' WHERE id_user=?");
    $upd->execute([$nombre, $apellido, $telefono, $id_user]);
  } else {
    $ins = $pdo->prepare("INSERT INTO users (nombre, apellido, email, telefono, origen) VALUES (?,?,?,?, 'contacto')");
    $ins->execute([$nombre ?: null, $apellido ?: null, $email, $telefono ?: null]);
    $id_user = (int)$pdo->lastInsertId();
  }

  // 2) generar folio único
  $folio = '';
  for ($i=0; $i<6; $i++) {
    $tmp = make_folio(10);
    $c = $pdo->prepare("SELECT id_message FROM contact_messages WHERE folio=? LIMIT 1");
    $c->execute([$tmp]);
    if (!$c->fetch()) { $folio = $tmp; break; }
  }
  if ($folio === '') $folio = make_folio(12);

  // 3) insertar mensaje
  $insm = $pdo->prepare("
    INSERT INTO contact_messages (folio, id_user, asunto, mensaje, canal, status)
    VALUES (?, ?, ?, ?, 'formulario', 'nuevo')
  ");
  $insm->execute([$folio, $id_user, $asunto, $mensaje]);

  $pdo->commit();

  json_response([
    'ok'=>true,
    'msg'=>'Solicitud enviada. Guarda tu folio para ver la respuesta.',
    'folio'=>$folio
  ]);

} catch (Throwable $e) {
  $pdo->rollBack();
  json_response(['ok'=>false,'error'=>'Error al guardar solicitud.'], 500);
}
