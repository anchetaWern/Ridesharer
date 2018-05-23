<?php 
require 'vendor/autoload.php';

$app_id = 'YOUR PUSHER APP ID';
$app_key = 'YOUR PUSHER APP KEY';
$app_secret = 'YOUR PUSHER APP SECRET';
$app_cluster = 'YOUR PUSHER APP CLUSTER';


header('Content-Type: application/json');

$pusher = new Pusher\Pusher($app_key, $app_secret, $app_id, ['cluster' => $app_cluster, 'encrypted' => true]);

$channel = $_POST['channel_name'];
$socket_id = $_POST['socket_id'];

echo $pusher->socket_auth($channel, $socket_id);