<?php 
require 'loader.php';

$dotenv = new Dotenv\Dotenv(__DIR__);
$dotenv->load();

$google_api_key = getenv('GOOGLE_API_KEY');

$params['index'] = 'places';
$params['type'] = 'location';

$data = json_decode(file_get_contents("php://input"), true);

$hiker_origin_lat = $data['origin']['latitude'];
$hiker_origin_lon = $data['origin']['longitude'];

$hiker_dest_lat = $data['dest']['latitude'];
$hiker_dest_lon = $data['dest']['longitude'];


$hiker_directions_contents = file_get_contents("https://maps.googleapis.com/maps/api/directions/json?origin={$hiker_origin_lat},{$hiker_origin_lon}&destination={$hiker_dest_lat},{$hiker_dest_lon}&key={$google_api_key}");

$hiker_directions_data = json_decode($hiker_directions_contents, true);
$hikers_steps = [];

$steps = $hiker_directions_data['routes'][0]['legs'][0]['steps'];
foreach($steps as $index => $s){
  if($index == 0){
    $hikers_steps[] = [
      'lat' => $s['start_location']['lat'],
      'lng' => $s['start_location']['lng']
    ];  
  }

  $hikers_steps[] = [
    'lat' => $s['end_location']['lat'],
    'lng' => $s['end_location']['lng']
  ];
}

$params['body'] = [
  "min_score" => 0.5,
  'query' => [
    'function_score' => [
      'gauss' => [
        'current_coords' => [
          "origin" => ["lat" => $hiker_origin_lat, "lon" => $hiker_origin_lon],
          "offset" => "100m",
          "scale" => "5km"
        ]
      ]
    ]
  ]
];


function isCoordsOnPath($lat, $lon, $path) {
  $response = \GeometryLibrary\PolyUtil::isLocationOnPath(['lat' => $lat, 'lng' => $lon], $path, 350); 
  return $response;
}


function canDropoff($hikers_origin, $hikers_dest, $riders_origin, $riders_dest, $hikers_steps, $riders_steps) {
 
  $hiker_origin_to_hiker_dest = \GeometryLibrary\SphericalUtil::computeDistanceBetween($hikers_origin, $hikers_dest);
  $hiker_origin_to_rider_dest = \GeometryLibrary\SphericalUtil::computeDistanceBetween($hikers_origin, $riders_dest);

  $is_on_path = false;

  if($hiker_origin_to_hiker_dest > $hiker_origin_to_rider_dest){

    $is_on_path = isCoordsOnPath($riders_dest['lat'], $riders_dest['lng'], $hikers_steps); 

  }else if($hiker_origin_to_rider_dest > $hiker_origin_to_hiker_dest){

    $is_on_path = isCoordsOnPath($hikers_dest['lat'], $hikers_dest['lng'], $riders_steps);

  }else{
    $is_on_path = isCoordsOnPath($hikers_dest['lat'], $hikers_dest['lng'], $riders_steps) || isCoordsOnPath($riders_dest['lat'], $riders_dest['lng'], $hikers_steps);
  }

  return $is_on_path;

}

$hikers_origin = ['lat' => $hiker_origin_lat, 'lng' => $hiker_origin_lon];
$hikers_dest = ['lat' => $hiker_dest_lat, 'lng' => $hiker_dest_lon];

try {
  $response = $client->search($params);
  
  if(!empty($response['hits']) && $response['hits']['total'] > 0){
    foreach($response['hits']['hits'] as $hit){
      
      $source = $hit['_source'];
      $riders_steps = $source['steps'];

      $current_coords = $source['current_coords'];
      $to_coords = $source['to_coords'];

      $riders_origin = [
        'lat' => $current_coords['lat'],
        'lng' => $current_coords['lon']
      ];

      $riders_dest = [
        'lat' => $to_coords['lat'],
        'lng' => $to_coords['lon']
      ];

      if(isCoordsOnPath($hiker_origin_lat, $hiker_origin_lon, $riders_steps) && canDropoff($hikers_origin, $hikers_dest, $riders_origin, $riders_dest, $hikers_steps, $riders_steps)){

        $rider_details = [
          'username' => $source['username'],
          'from' => $source['from'],
          'to' => $source['to']
        ];

        echo json_encode($rider_details);
        
        break;
        
      }

    }
  }

} catch(\Exception $e) {
  echo 'err: ' . $e->getMessage();
}