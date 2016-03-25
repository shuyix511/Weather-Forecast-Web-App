var facebook_summary='';
var facebook_temperature='';
var facebook_pic='';
$().ready(function() {
		// validate the form when it is submitted
	
		$("#Form").validate({
			rules: {
				Address: "required",
				City: "required",
                State:"required"
			},
			messages: {
				Address: "Please enter your address",
				City: "Please enter your city"
			},
            submitHandler:function(form){
                
                var mydata = $("#Form").serialize();

                $.ajax({
                    url  : "http://shuyixu-env.elasticbeanstalk.com/",
                    type : "GET",
                    data : mydata,
                    dataType : 'jsonp',
                    jsonp : "callback",
                    async: false,
             
                    success:function(output){
                        //console.log(output);
                        display_weather(output);
                    },
                    error:function(){
                        alert('fail');
                    }});
            }
		});

	});
        function Clear(){
            window.location.assign("http://cs-server.usc.edu:28741/demo/index_hw8.html");
            return true;
        }
        
        function display_weather(output){
            var longtitude = output.longitude;
            var latitude   = output.latitude;
            
            //current weather table information
            var summary = output.currently.summary;
            facebook_summary = summary;
            var temperature = Math.round(output.currently.temperature);
           
            var L_Temperature = Math.round(output.daily.data[0].temperatureMin);
            var H_Temperature = Math.round(output.daily.data[0].temperatureMax);
            var icon = output.currently.icon;
            var precipitation = output.currently.precipIntensity;
            var chance_of_rain = output.currently.precipProbability;
            var windspeed = output.currently.windSpeed;
            var dewpoint = output.currently.dewPoint;
            var humidity = output.currently.humidity;
            var visibility = output.currently.visibility;
            var sunrise = output.daily.data[0].sunriseTime;
            var sunset = output.daily.data[0].sunsetTime;
            var timezone = output.timezone;
            var city_display  = $("#City").val();
            var state_display = $("#State").val();
            
            //transform info
            //icon
            var icon_display ='';
            if(icon == "fog" ||icon == "rain" ||icon == "sleet" ||icon == "snow" ||icon == "wind" ||icon == "cloudy")
                icon_display = icon;
            if(icon == "clear-day")
                icon_display = "clear";
            if(icon == "clear-night")
                icon_display = "clear_night";
            if(icon == "partly-cloudy-day")
                icon_display = "cloud_day";
            if(icon == "partly-cloudy-night")
                icon_display = "cloud_night";
            facebook_pic = icon_display;
            //unit decision
             var unit=document.getElementsByName("Degree");
             var unit_display;
   
          
             if($("#Fahrenheit").is(":checked")){
                 unit_display = "F";
                 windspeed_unit = "mph";
                 visibility_unit = "mi";
                 pressure_unit = "mb";
             }
               if($("#Celsius").is(":checked")){
                   unit_display = "C";
                   windspeed_unit = "m/s";
                   visibility_unit = "km";
                   pressure_unit = "hPa";
               }
             facebook_temperature = temperature+"&deg;"+unit_display;
            //console.log(unit_display);console.log(windspeed_unit);console.log(visibility_unit);console.log(pressure_unit);

            //precipitation
            var precipitation_display;
            if(unit_display == "C")
                precipitation/=25.4;
            if(precipitation >= 0 && precipitation < 0.002)
                precipitation_display = "None";
            if(precipitation >= 0.002 && precipitation < 0.017)
                precipitation_display = "Very Light";
            if(precipitation >= 0.017 && precipitation < 0.1)
                precipitation_display = "Light";
            if(precipitation >= 0.1 && precipitation < 0.4)
                precipitation_display = "Moderate";
            if(precipitation >= 0.4)
                precipitation_display = "Heavy";
           
            
            //chance_of_rain
            var chance_of_rain_display = Math.floor(chance_of_rain * 100) + "%";
            
            //humidity
            var humidity_display = Math.floor(humidity * 100) + "%";
            
            //windspeed
            var windspeed_display = windspeed.toFixed(2);
            
            //dewpoint
            var dewpoint_display = dewpoint.toFixed(2);
            
            //visibility
            var visibility_display = visibility.toFixed(2);
            
            //sunrise && sunset
            
            var sunrise_date = new Date(sunrise*1000);
            var sunset_date = new Date(sunset*1000);
            var sunrise_time = moment.tz(sunrise_date, timezone).format('hh:mm A');
            var sunset_time = moment.tz(sunset_date, timezone).format('hh:mm A');
            
            //initilize map info
            function map_ready(){
                var map = new OpenLayers.Map("basicMap",
                    {
                        units: 'm',
                        projection: new OpenLayers.Projection("EPSG:900913"),
                        displayProjection: new OpenLayers.Projection("EPSG:4326")
                    }
                );

                var mapnik = new OpenLayers.Layer.OSM();
                var opencyclemap = new OpenLayers.Layer.XYZ(
                    "opencyclemap",
                    "http://a.tile3.opencyclemap.org/landscape/${z}/${x}/${y}.png",
                    {
                        numZoomLevels: 18, 
                        sphericalMercator: true
                    }
                );
                //cloud && precipitation layers
                var layer_cloud = new OpenLayers.Layer.XYZ(
                    "clouds",
                    "http://${s}.tile.openweathermap.org/map/clouds/${z}/${x}/${y}.png",
                    {
                        isBaseLayer: false,
                        opacity: 0.7,
                        sphericalMercator: true
                    }
                );

                var layer_precipitation = new OpenLayers.Layer.XYZ(
                    "precipitation",
                    "http://${s}.tile.openweathermap.org/map/precipitation/${z}/${x}/${y}.png",
                    {
                        isBaseLayer: false,
                        opacity: 0.7,
                        sphericalMercator: true
                    }
                );

                map.addLayers([mapnik, layer_precipitation, layer_cloud]);        
                
                 var args = OpenLayers.Util.getParameters();
                if (args.lat && args.lon && args.zoom) {
                    var position = new OpenLayers.LonLat(parseFloat(args.lon), parseFloat(args.lat));
                    if(args.lon< 181 && args.lat < 181)
                        position.transform(
                            new OpenLayers.Projection("EPSG:4326"),
                            new OpenLayers.Projection("EPSG:900913")
                        );

                    map.setCenter(position, parseFloat(args.zoom));
                } else {
                    var zoom = 9;
                    var lat = latitude;
                    var lon = longtitude;
                    var centre = new OpenLayers.LonLat(lon, lat);
                    centre.transform(new OpenLayers.Projection("EPSG:4326"),new OpenLayers.Projection("EPSG:900913"));
                    map.setCenter( centre, zoom);
                    
                }
                
                var ls = new OpenLayers.Control.LayerSwitcher({'ascending':false});
	            map.addControl(ls);
	            ls.maximizeControl();
            }
            
           
 
            //Display Right_Now_table
            var Right_Now_table = "";
           
            Right_Now_table +=
                
                   //Left_table(weather info)
                   "<div class='col-md-6' id='Right_Now_Left'>"+
                        //Icon and temperature
                        "<div class='row' id='Right_Now_Summary_Info'>"+
                            "<div class='col-md-6' id='Icon'>"+
                                "<img id='Icon_Image' src='http://cs-server.usc.edu:45678/hw/hw8/images/"+icon_display+".png'>"+
                            "</div>"+
                            "<div class='col-md-6' id='Summary_info'>"+
                                "<div id='Summary_Weather_Info'>"+
                                    "<p>"+summary+" in "+city_display+", "+state_display+"</p>"+
                                "</div>"+
                                "<div>"+
                                    "<p><b><span style='font-size:80px;color:white;'>"+temperature+"</span></b><span style='color:white;margin-top:-30px;'>"+"&deg"+unit_display+"</span></p>"+
                                "</div>"+
                                "<div id='L_H_Temperature'>"+
                                    "<span style='font-weight:bold'>"+"<span style='color: blue'>"+"L: "+L_Temperature+"&deg"+"</span> | "+"<span style='color: green'>"+"H: "+H_Temperature+"&deg"+"</span>"+"</span>" +
                                    "<button class='btn' id='facebookButton' onclick='FB_Post()'>" +
                                        "<img id='facebook' src='http://cs-server.usc.edu:45678/hw/hw8/images/fb_icon.png'>" +
                                    "</button>"+

                                "</div>"+
                            "</div>"+
                        "</div>"+
                        //table(detailed info)
                        "<table class='table table-striped col-md-6 Right_Now_table_info'>"+
                             "<tr>"+
                                 "<td class='left_set'>"+
                                    "Precipitation" +
                                 "</td>" +
                                 "<td>" +
                                    precipitation_display +
                                 "</td>" +
                             "</tr>"+
                             "<tr class='pink'>"+
                                 "<td class='left_set'>"+
                                    "Chance of Rain" +
                                 "</td>" +
                                 "<td>" +
                                    chance_of_rain_display +
                                 "</td>" +
                             "</tr>"+
                             "<tr>"+
                                 "<td class='left_set'>"+
                                    "Wind Speed" +
                                 "</td>" +
                                 "<td>" +
                                    windspeed_display + " " + windspeed_unit +
                                 "</td>" +
                             "</tr>"+
                             "<tr class='pink'>"+
                                 "<td class='left_set'>"+
                                    "Dew Point" +
                                 "</td>" +
                                 "<td>" +
                                    dewpoint_display + "&deg " + unit_display +
                                 "</td>" +
                             "</tr>"+
                             "<tr>"+
                                 "<td class='left_set'>"+
                                    "Humidity" +
                                 "</td>" +
                                 "<td>" +
                                    humidity_display +
                                 "</td>" +
                             "</tr>"+
                             "<tr class='pink'>"+
                                 "<td class='left_set'>"+
                                    "Visibility" +
                                 "</td>" +
                                 "<td>" +
                                    visibility_display + " " + visibility_unit +
                                 "</td>" +
                             "</tr>"+
                             "<tr>"+
                                 "<td class='left_set'>"+
                                    "Sunrise" +
                                 "</td>" +
                                 "<td>" +
                                    sunrise_time +
                                 "</td>" +
                             "</tr>"+
                             "<tr class='pink'>"+
                                 "<td class='left_set'>"+
                                    "Sunset" +
                                 "</td>" +
                                 "<td>" +
                                    sunset_time +
                                 "</td>" +
                             "</tr>" +
                           "</table>" +
                    "</div>"+
                   
                    "<div class='col-md-6' id='Right_Map'>" +
                        "<div id='basicMap'>" +
                        "</div>" +
                    "</div>";
                

            
            //Next 24 Hours table information
            var time_24 = new Array(24);
            var summary_24 = new Array(24);
            var Cloud_Cover_24 = new Array(24);
            var Temp_24 = new Array(24);
            var view_details = "<span class='glyphicon glyphicon-plus'></span>";
            var WindSpeed_24 = new Array(24); 
            var Humidity_24 = new Array(24);
            var Visibility_24 = new Array(24);
            var Pressure_24 = new Array(24);
            var time_24_unix = new Array(24);
            var time_24_normal = new Array(24);
            var summary_24_display = new Array(24);
            var Next_24_Hours_table = new Array(24);
            
            for(var i=0; i<24; i++){
                time_24[i] = output.hourly.data[i+1].time;
                time_24_unix[i] = new Date(time_24[i]*1000);
                time_24_normal[i] = moment.tz(time_24_unix[i], timezone).format('hh:mm A');
                
                summary_24[i] = output.hourly.data[i+1].icon;
                if(summary_24[i] == "fog" ||summary_24[i] == "rain" ||summary_24[i] == "sleet" ||summary_24[i] == "snow" ||summary_24[i] == "wind" ||summary_24[i] == "cloudy")
                    summary_24_display[i] = summary_24[i];
                if(summary_24[i] == "clear-day")
                    summary_24_display[i] = "clear";
                if(summary_24[i] == "clear-night")
                    summary_24_display[i] = "clear_night";
                if(summary_24[i] == "partly-cloudy-day")
                    summary_24_display[i] = "cloud_day";
                if(summary_24[i] == "partly-cloudy-night")
                    summary_24_display[i] = "cloud_night";
                Cloud_Cover_24[i] = Math.round(output.hourly.data[i+1].cloudCover*100) + "%";
                Temp_24[i] = (output.hourly.data[i+1].temperature).toFixed(2);
                WindSpeed_24[i] = (output.hourly.data[i+1].windSpeed).toFixed(2);
                Humidity_24[i] = Math.round(output.hourly.data[i+1].humidity*100) + "%";
                Visibility_24[i] = (output.hourly.data[i+1].visibility).toFixed(2);
                Pressure_24[i] = output.hourly.data[i+1].pressure;
                
                 Next_24_Hours_table[i]= 
                "<tr class='set_margin_value_24'>"+
                   "<td>"+
                      time_24_normal[i] +
                   "</td>" +
                   "<td>"+
                      "<img id='Icon_Image_24' src='http://cs-server.usc.edu:45678/hw/hw8/images/"+summary_24_display[i]+".png'>" +
                   "</td>" +
                   "<td>"+
                      Cloud_Cover_24[i] +
                   "</td>" +
                   "<td>"+
                      Temp_24[i] +
                   "</td>" +
                   "<td>"+
                        "<a href='#collapse" + i + "' data-toggle='collapse' aria-expanded='false'>" + 
                            view_details +
                        "</a>" +
                   "</td>" +
                "</tr>"+
               
                    "<tr id='collapse" +i+ "' class='collapse out'>" +
                        "<td colspan='5'>" +
                        "<table class='table table-responsive' id='table_collapse_24'>" +
                            "<thead id='table_header_info_24'>"+
                                    "<th>" +
                                       "Wind" +
                                    "</th>" +
                                    "<th>" +
                                       "Humidity" +
                                    "</th>" +
                                    "<th>" +
                                       "Visibility" +
                                    "</th>" +
                                    "<th>" +
                                       "Pressure" +
                                    "</th>" +
                             "</thead>" +
                             "<tbody id='table_content_info_24'>" +
                                "<td>" +
                                    WindSpeed_24[i] + " " + windspeed_unit +
                                "</td>" +
                                "<td>" +
                                    Humidity_24[i] +
                                "</td>" +
                                "<td>" +
                                    Visibility_24[i] + " " + visibility_unit +
                                "</td>" +
                                "<td>" +
                                    Pressure_24[i] + " " + pressure_unit +
                                "</td>" +
                              "</tbody>" +
                        "</table>" +
                    "</div>";
                
            } 
            
            //Display table 2
            var Next_24_Hours_table_display="";
            
            Next_24_Hours_table_display +=
                 "<div class='tab-content set_margin_24'>" +
                    "<div class='tab-pane fade in active' id='Next_24_Hours'>" +
                        "<table class='table table-responsive'>" +
                            "<thead>" +
                                "<tr id='background_set_24'>" +
                                   "<th>"+ "Time" +"</th>" +
                                   "<th>"+ "Summary" +"</th>" +
                                   "<th>"+ "Cloud Cover" +"</th>" +
                                   "<th>"+ "Temp" + "(" + "&deg" + unit_display + ")" + "</th>" +
                                   "<th>"+ "View Details" +"</th>" +
                                "</tr>" +
                                "<tr>" +
                                   "<td>" +
                                      "<div id='blank'>" + "</div>" +
                                   "</td>" +
                                "</tr>" +
                            "</thead>" +
                            "<tbody>" + 
                               Next_24_Hours_table +
                            "</tbody>" +
                          "</table>" +
                      "</div>" +
                  "</div>";
            //$("#right_now_left_Info").html(Next_24_Hours_table_display);
                       
            
            var Next_7_days_table = new Array(7);
            var time_7 = new Array(7);
            var month_date_7 = new Array(7);
            var icon_image_7 = new Array(7);
            var min_temp_7 = new Array(7);
            var max_temp_7 = new Array(7);
            var header_7 = new Array(7);
            var summary_line_7 = new Array(7);
            var sunrise_7 = new Array(7);
            var sunset_7 = new Array(7);
            var humidity_7 = new Array(7);
            var windspeed_7 = new Array(7);
            var visibility_7 = new Array(7);
            var pressure_7 = new Array(7);
            
            var time_7_unix = new Array(7);
            var time_7_day = new Array(7);
            var sunrise_7_unix = new Array(7);
            var sunset_7_unix = new Array(7);
            var sunrise_7_display = new Array(7);
            var sunset_7_display = new Array(7);
            var icon_image_7_display = new Array(7);
             
            for(var j=1; j<=7; j++){
                time_7[j] = output.daily.data[j].time;
                time_7_unix[j] = new Date(time_7[j]*1000);
                time_7_day[j] = moment.tz(time_7_unix[j], timezone).format('dddd');
                month_date_7[j] = moment.tz(time_7_unix[j], timezone).format('MMM D');
                
                icon_image_7[j] = output.daily.data[j].icon;

                if(icon_image_7[j] == "fog" ||icon_image_7[j] == "rain" ||icon_image_7[j] == "sleet" ||icon_image_7[j] == "snow" ||icon_image_7[j] == "wind" ||icon_image_7[j] == "cloudy")
                    icon_image_7_display[j] = icon_image_7[j];
                if(icon_image_7[j] == "clear-day")
                    icon_image_7_display[j] = "clear";
                if(icon_image_7[j] == "clear-night")
                    icon_image_7_display[j] = "clear_night";
                if(icon_image_7[j] == "partly-cloudy-day")
                    icon_image_7_display[j] = "cloud_day";
                if(icon_image_7[j] == "partly-cloudy-night")
                    icon_image_7_display[j] = "cloud_night";
                
                min_temp_7[j] = Math.round(output.daily.data[j].temperatureMin) + "&deg";
                max_temp_7[j] = Math.round(output.daily.data[j].temperatureMax) + "&deg";
                
                header_7[j] = "Weather in "+ city_display + " on " + month_date_7[j];
                summary_line_7[j] = output.daily.data[j].summary;
                sunrise_7[j] = output.daily.data[j].sunriseTime;
                sunset_7[j] = output.daily.data[j].sunsetTime;
                sunrise_7_unix[j] = new Date(sunrise_7[j]*1000);
                sunrise_7_display[j] = moment.tz(sunrise_7_unix[j], timezone).format('hh:mm A');
                sunset_7_unix[j] = new Date(sunset_7[j]*1000);
                sunset_7_display[j] = moment.tz(sunset_7_unix[j], timezone).format('hh:mm A');
                
                humidity_7[j] = Math.round(output.daily.data[j].humidity) + "%";
                windspeed_7[j] = (output.daily.data[j].windSpeed).toFixed(2);
                visibility_7[j] = output.daily.data[j].visibility;
                if(visibility_7[j] == null){
                    visibility_7[j] = "NA";
                }
                else{
                    visibility_7[j] = (output.daily.data[j].visibility).toFixed(2) + visibility_unit;
                }
                pressure_7[j] = (output.daily.data[j].pressure).toFixed(2);
                
                Next_7_days_table[j]=
                    "<div class='col-md-1 day_7_trigger_modal' style='text-align: center; color:white'>"+
                        "<div class='img-rounded' id='modal_" + j +"' data-toggle='modal' data-target='#myModal" + j +"'>" +
                             "<div id='day_date' style='font-weight: bold'>"+
                                    "<p>"+time_7_day[j]+"</p>" +"<p>" + month_date_7[j] + "</p>"+
                             "</div>"+
                             "<div id='icon_7'>"+
                                    "<img id='Icon_Image_7' src='http://cs-server.usc.edu:45678/hw/hw8/images/"+icon_image_7_display[j]+".png'>"+
                             "</div>"+
                             "<div id='Min_Temp_7'>"+
                                    "<p id='Temp_keyword_7'>" + "Min"+"</br>" + "Temp"+ "</p>"+
                                    "<p id='Temp_Value_7'>" + min_temp_7[j] +"</p>" +
                             "</div>"+
                             "<div id='Max_Temp_7'>"+
                                    "<p id='Temp_keyword_7'>" + "Max"+"</br>" + "Temp"+ "</p>"+
                                    "<p id='Temp_Value_7'>" + max_temp_7[j] +"</p>" +
                             "</div>"+    
                        "</div>" +
                    "</div>";
                Next_7_days_table[j]+=
                    "<div class='modal fade' id='myModal"+j+"' tabindex='-1' role='dialog' aria-labelledby='myModalLabel' aria-hidden='true'>" +
                    "<div class='modal-dialog'>" +
                        "<div class='modal-content'>" +
                            "<div class='modal-header'>" +   
                                "<button type='button' class='close' data-dismiss='modal'><span aria-hidden='true'>&times;</span><span class='sr-only'>Close</span></button>"  +
                                "<h1 class='modal-title' id='myModalLabel"+j+"' style='font-size:22px'>" +
                                        "Weather in " + city_display + " on " + month_date_7[j] +
                                "</h1>" +
                            "</div>" +
                            "<div class='modal-body'>" +
                                "<div class='row' style='text-align: center'>" +
                                    "<div class='col-md-12'>"+
                                        "<img class='modal_image' src='http://cs-server.usc.edu:45678/hw/hw8/images/"+icon_image_7_display[j]+".png'>"+
                                    "</div>"+
                                    "<div class='col-md-12 day_summary_7'>" +
                                        "<p>" + time_7_day[j] + ": " + "<span style='color: orange'>" + summary_line_7[j] +"</span>" +"</p>" +
                                    "</div>"+
                                    "<div class='col-md-4'>" +
                                        "<p class='modal_info_adjust'>" + "Sunrise Time" + "</p><p class='modal_info_value_adjust'>" + sunrise_7_display[j] +"</p>" +
                                    "</div>"+
                                    "<div class='col-md-4'>" +
                                        "<p class='modal_info_adjust'>" + "Sunset Time" + "</p><p class='modal_info_value_adjust'>" + sunset_7_display[j] +"</p>" +
                                    "</div>"+
                                    "<div class='col-md-4'>" +
                                        "<p class='modal_info_adjust'>" + "Humidity" + "</p><p class='modal_info_value_adjust'>" + humidity_7[j] +"</p>" +
                                    "</div>"+
                                    "<div class='col-md-4'>" +
                                        "<p class='modal_info_adjust'>" + "Wind Speed" + "</p><p class='modal_info_value_adjust'>" + windspeed_7[j] +  windspeed_unit +"</p>" +
                                    "</div>"+
                                    "<div class='col-md-4'>" +
                                        "<p class='modal_info_adjust'>" + "Visibility" + "</p><p class='modal_info_value_adjust'>" + visibility_7[j] +"</p>" +
                                    "</div>"+
                                    "<div class='col-md-4'>" +
                                        "<p class='modal_info_adjust'>" + "Pressure" + "</p><p class='modal_info_value_adjust'>" + pressure_7[j] + pressure_unit +"</p>" +
                                    "</div>"+
                                "</div>" +
                            "</div>" +
                            "<div class='modal-footer'>" +
                                "<button type='button' class='btn btn-default' data-dismiss='modal'>close</button>" +
                            "</div>" +
                        "</div>" +
                    "</div>" +
                    "</div>";
            }
            var Next_7_days_table_display="";
            Next_7_days_table_display = 
               "<div id='myTabContent_modal' class='tab-content'>" +
                    "<div class='tab-pane fade in active' id='Next_7_days'>" +
                        "<div class='row' id='Next_7_days_info'>" +
                             "<div class='col-md-2'></div>" +
                                Next_7_days_table +
                        "</div>" +
                    "</div>" +
                "</div>";
            
             //Display navigation bar
            var navigation_bar;
            navigation_bar = 
                "<ul id='myTab' class='container nav nav-tabs'>" +
                    "<li class='active set_background_li img-rounded'><a href='#Right_Now' data-toggle='tab' class='set_background'>Right Now</a></li>" +
                    "<li class='set_background_li img-rounded'><a href='#Next_24_Hours' data-toggle='tab' class='set_background'>Next 24 Hours</a></li>" +
                    "<li class='set_background_li img-rounded'><a href='#Next_7_days' data-toggle='tab' class='set_background'>Next 7 days</a></li>" +
                "</ul>" +
                "<div  id='nav_content'>" +
                    "<div id='myTabContent' class='container tab-content'>" +
                         "<div class='tab-pane fade in active' id='Right_Now'>" +
                              Right_Now_table +
                         "</div>" +
                         "<div class='tab-pane fade' id='Next_24_Hours'>" +
                              Next_24_Hours_table_display +
                         "</div>" +
                         "<div class='tab-pane fade' id='Next_7_days'>" +
                              Next_7_days_table_display +
                         "</div>" +
                     "</div>" + 
                 "</div>";
            $("#final_display").html(navigation_bar);
            $("body").attr('onload',map_ready());

        }
        
        