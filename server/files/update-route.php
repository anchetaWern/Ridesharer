<?php 
require 'loader.php';

$data = json_decode(file_get_contents("php://input"), true);

$params['index'] = 'places';
$params['type'] = 'location';
$params['id'] = $data['id']; 

$lat = $data['lat']; 
$lon = $data['lon']; 

$result = $client->get($params);
$result['_source']['current_coords'] = [
  'lat' => $lat,
  'lon' => $lon
];

$params['body']['doc'] = $result['_source'];
$result = $client->update($params);

echo json_encode($result);
