<?php 
require 'loader.php';

$data = json_decode(file_get_contents("php://input"), true);

$params['index'] = 'places';
$params['type'] = 'location';
$params['body']['query']['match']['username'] = $data['username'];
 
$result = $client->search($params);
$id = $result['hits']['hits'][0]['_id'];

unset($params['body']);
$params['id'] = $id;
$result = $client->delete($params);

echo json_encode($result);
