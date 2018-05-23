<?php 
use Elasticsearch\ClientBuilder;

require 'vendor/autoload.php';

$hosts = [
  [
    'host' => 'elasticsearch'  
  ]
];

$client = ClientBuilder::create()->setHosts($hosts)->build();

$params['index'] = 'places';
$params['type'] = 'location';
$params['id'] = $_POST['id']; 

$lat = $_POST['lat']; 
$lon = $_POST['lon']; 

$result = $client->get($params);
$result['_source']['current_coords'] = [
  'lat' => $lat,
  'lon' => $lon
];

$params['body']['doc'] = $result['_source'];
$result = $client->update($params);

echo json_encode($result);
