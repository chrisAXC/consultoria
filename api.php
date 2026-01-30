<?php
header("Content-Type: application/json");

$conn = new mysqli("localhost","root","","consultoria");
if ($conn->connect_error) {
  echo json_encode(["success"=>false,"message"=>"Error BD"]);
  exit;
}

$action = $_GET['action'] ?? "";

// LOGIN ADMIN
if ($action === "login") {
  $email = $_POST['email'];
  $pass  = $_POST['password'];

  if ($email === "arturo@gmail.com" && $pass === "admin12345") {
    echo json_encode(["success"=>true,"message"=>"Acceso concedido"]);
  } else {
    echo json_encode(["success"=>false,"message"=>"Acceso denegado"]);
  }
}

// LISTAR MENSAJES
if ($action === "messages") {
  $q = $conn->query("SELECT * FROM mensajes ORDER BY fecha DESC");
  $data = [];
  while($r = $q->fetch_assoc()) $data[] = $r;
  echo json_encode($data);
}

// MENSAJE
if ($action === "message") {
  $id = intval($_GET['id']);
  $q = $conn->query("SELECT * FROM mensajes WHERE id=$id");
  echo json_encode($q->fetch_assoc());
}

// RESPONDER
if ($action === "reply") {
  $id = intval($_POST['id_message']);
  $asunto = $_POST['asunto'];
  $respuesta = $_POST['respuesta'];
  $status = $_POST['status'];

  $conn->query("UPDATE mensajes SET status='$status' WHERE id=$id");

  $m = $conn->query("SELECT email FROM mensajes WHERE id=$id")->fetch_assoc();
  mail($m['email'], $asunto, $respuesta);

  echo json_encode(["message"=>"Respuesta enviada correctamente"]);
}
