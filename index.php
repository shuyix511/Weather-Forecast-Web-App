
<?php
$callback = isset($_GET['callback']) ? trim($_GET['callback']) : ''; 




                  if(isset($_GET['Address'])){
                     $address_1 = $_GET['Address'];
                  }
                  if(isset($_GET['City'])){
                      $city_1 =  $_GET['City'];
                  }
                  if(isset($_GET['State'])){
                      $state_1 = $_GET['State'];
                  }
                  if(isset($_GET['Degree'])){
                      $degree_1 = $_GET['Degree'];
                  }
                  

                  //construct a web service URL to query the Google Geocode API
                  $google_api = "AIzaSyBX_i3tzQV0OgPWkLZ5ZtjvZdeUJhEIoi4";
                  $xml=simplexml_load_file("https://maps.googleapis.com/maps/api/geocode/xml?address=".$address_1.",".$city_1.",".$state_1."&key=".$google_api);
                  
    
                  if(isset($xml->result[0]->geometry->location) && !empty($xml->result[0]->geometry->location))
                  {
                    $lng = $xml->result[0]->geometry->location->lng;
                    $lat = $xml->result[0]->geometry->location->lat;
                  }


                  $api_key = "059e36a89b21624022308c8b4024a9f5";
                  
                  if($degree_1 == "Celsius")
                      $units = "si";
                  if($degree_1 == "Fahrenheit")
                      $units = "us";
        
                  //constructed web service URL to query the Forecast.io API
                  $json=file_get_contents("https://api.forecast.io/forecast/".$api_key."/".$lat.",".$lng."?units=".$units."&exclude=flags");     
                 echo $callback.$json; 
                  

?>