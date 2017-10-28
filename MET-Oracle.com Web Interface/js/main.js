$(function () { 
	/*
		- Pull data from server and place it on website (done)
		- Has to be able to contact server (ajax?)
		- finish unit conversions
	*/

	/* ##FUTURE REQUESTS
		https://api.darksky.net/forecast/[key]/[latitude],[longitude]
		https://api.darksky.net/forecast/8fdce496afe1eee3cadc4ee65ff291bc/10.536421,-61.311951
		API Key: 8fdce496afe1eee3cadc4ee65ff291bc

	##FOR TRAINING
		https://api.darksky.net/forecast/[key]/[latitude],[longitude],[time]

	##EXCLUSIONS
		https://api.darksky.net/forecast/0123456789abcdef9876543210fedcba/10.641607,-61.397792,1483250400?exclude=currently,flags,minutely,alerts,flags
	*/

	// --------------- DOM CACHING -----------------------
	$gmap = $("#gmap");
	$sensorarea = $("#sensorarea");
	$reset = $sensorarea.find("#close");
	$sensorinfo = $sensorarea.eq(0);
	$snsrinfotitle = $sensorinfo.find("h2");
	$snsrli = $sensorinfo.find("li");
	$snsrliVal = $snsrli.find(":first-child");
	$menu = $("#menu");
	
	// --------------- UI EVENT LISTENERS ----------------


	$snsrli.on("click", function () {
		var clicked_id = $(this).attr("id"); // Capture id of clicked element and passed into function
		convertUnits($(this), clicked_id); });  // Clicking on list items changes the units
		
	$reset.prev().on("click", function () {
		$("html,body").animate({ scrollTop: $gmap.offset().top }, "slow");
	})
	$reset.on("click", function () { $sensorarea.slideUp(300); }); // Event listener for sliding back up info area
});

function setZoom() {// Set Zoom automatically for any screen for comfortable viewing
	screen_width = $(window).width();
	if (screen_width <= 425) { return 8; }
	if (screen_width > 425 && screen_width <= 1024 ) { return 9; }
	if (screen_width > 1024 && screen_width <= 2200) { return 10; }
	if (screen_width > 2200 && screen_width < 3000 ) {return 11;}
}

function convertUnits(item, item_id) {
	
	// data-unit attribute will define whether or not units are default or changed
	// item.find(":last-child") references the <span> holding the units
	// item.find(":first-child") references the <span> holding the value
	// Get the units -> Get the value -> Convert units -> return values into appropriate span tags

	var data = item.find(":first-child");
	var item_unit_attr = item.find(":last-child").attr("data-unit");
	var datastring = data.text();
	if (item_id == "temp") {
		if ( item_unit_attr == "default" ) { // From Fahrenheit to Celcius

			datastring = parseFloat(datastring.slice(12, datastring.length));
			datastring = ((datastring - 32) * (5/9)).toPrecision(4);
			data.text("Temperature: " + datastring);
			data.next().attr("data-unit", "changed").html("&deg;C");
		}
		else if ( item_unit_attr == "changed" ){ // Celcius to Fahrenheit
			datastring = parseFloat(datastring.slice(12, datastring.length));
			datastring = ((datastring * 9/5) + 32).toPrecision(4);
			data.text("Temperature: " + datastring);
			data.next().attr("data-unit", "default").html("&deg;F");
		}
	}
	else if (item_id == "hum") {

		if (item_unit_attr == "default" ) { // Percentage to Index
			datastring = parseFloat(datastring.slice(10, datastring.length));
			datastring /= 100;
			data.text("Humidity Index: " + datastring);
			data.next().attr("data-unit", "changed").html("");
		}
		else if ( item_unit_attr == "changed" ){ // Index to Percentage
			datastring = parseFloat(datastring.slice(16, datastring.length));
			datastring *= 100;
			data.text("Humidity: " + datastring);
			data.next().attr("data-unit", "default").html("%");
		}
	}
	else if (item_id == "pres") {
		if (item_unit_attr == "default" ) { // Millibar to Millimetres of Mercury
			datastring = parseFloat(datastring.slice(10, datastring.length));
			datastring = (datastring * 0.75006156130264).toPrecision(6);
			data.text("Pressure: " + datastring);
			data.next().attr("data-unit", "changed").html("mmHg");
		}
		else if ( item_unit_attr == "changed" ){ // Millimetres of Mercury to Millibar
			datastring = parseFloat(datastring.slice(10, datastring.length));
			datastring = (datastring / 0.75006156130264).toPrecision(6);
			data.text("Humidity: " + datastring);
			data.next().attr("data-unit", "default").html("millibar");
		}
	}
	else if (item_id == "cloud") {
		if (item_unit_attr == "default" ) { // Index to Okta
			datastring = parseFloat(datastring.slice(19, datastring.length));
			datastring *= 8;
			data.text("Cloud Cover: " + datastring);
			data.next().attr("data-unit", "changed").html("oktas");
		}
		else if ( item_unit_attr == "changed" ){ // Okta to Index
			datastring = parseFloat(datastring.slice(13, datastring.length));
			datastring /= 8;
			data.text("Cloud Cover Index: " + datastring);
			data.next().attr("data-unit", "default").html("");
		}
	}
}

snsrinfo = {}; // Each sensor is given the values called from API

function updatesnsr (snsr) { // Makes a call to forecast.io to request weather information. Updates a single sensor
	$.ajax({
		  type: "GET",
		  dataType: "jsonp", // dataType: "json" was blocked by the API, was not allowed access
		  url: "https://api.darksky.net/forecast/8fdce496afe1eee3cadc4ee65ff291bc/" + snsr.position.lat + "," + snsr.position.lng,
		  
		  crossDomain: true,
		  success: function (data) {
		  	snsrinfo["Temperature"] = (data.currently.temperature);
		  	snsrinfo["Humidity"]  = (data.currently.humidity * 100);
		  	snsrinfo["Pressure"] = data.currently.pressure;
		  	snsrinfo["Cloud Cover Index"] = data.currently.cloudCover;
		  	snsrinfo["Precipitation Index"] =  data.currently.precipIntensity
		  }
	});
}

// WRITE HANDLER FUNCTION TO GET DATA OUT OF SUCCESS FUNCTION OF AJAX CALL

function update (snsr_array, loc_array) { // Updates all sensors
	loc_array.forEach(function (snsr) {
		updatesnsr(snsr);
		snsr_array[loc_array.indexOf(snsr)].stats = snsrinfo;
	});
}

function initMap() { // Initialize Google Map Function

	// ------------------------------ DECLARATIONS -----------------------------
	var ttloc = {lat: 10.536421, lng:  -61.311951};
	var sensor_markers = [];
	var sensor_locs = [
		{ areaname: "Arima", position: {lat: 10.6172, lng:  -61.2744} }, 
		{ areaname: "Toco",  position: {lat: 10.8311, lng:  -60.9496} },
		{ areaname: "San Fernando", position: {lat: 10.2906, lng:  -61.4494} },
		{ areaname: "Mayaro", position: {lat: 10.2803, lng:  -61.0297} },
	 	{ areaname: "Diego Martin", position: {lat: 10.7362, lng:  -61.5545} }
	];
    // -------------------------------------------------------------------------

    var map = new google.maps.Map(document.getElementById("gmap"), { // Declare Map
        zoom: setZoom(),
        center: ttloc
    });

    for (var i = 0; i < sensor_locs.length; i++) { // Pushing each marker object into an array
    	sensor_markers.push(new google.maps.Marker ({
    			position: sensor_locs[i].position,
    			map: map,
    			areaname: sensor_locs[i].areaname,
    			stats: {} // Will hold the data called from API
    	}));
	};

	sensor_markers.forEach(function (snsr) { // Adding event listeners to each marker
		snsr.addListener("click", function () {
			$sensorarea.fadeOut(500, function () { // Slides up list items, updates items and then slides back down list items
    			$snsrinfotitle.text("Sensor " + (sensor_markers.indexOf(snsr) + 1) + ": " + snsr.areaname);
    			var tempobj = snsr.stats;
    			var licount = 0;
    			Object.keys(tempobj).forEach(function (key) { // Populating each list item with data
    				$snsrliVal.eq(licount).text(key + ": " + tempobj[key]);
    				licount++;
    			})
    			$sensorarea.fadeIn(500);
    		});
    		$("html,body").animate({ scrollTop: $sensorarea.offset().top }, "slow");
		});
	});

	update(sensor_markers, sensor_locs); // Calls API and updates list items instantly
	setInterval( update, 1800000, sensor_markers, sensor_locs); // Calls API and updates list items every 30 mins
}

/*
	1013 millibars
	However, conversion is easy. 1000 hPa are equal to 1000 mbar, which is equal to 750 mm of mercury in a barometric column, which is 0.987 of the average atmospheric pressure, which on global average is 1013 millibars or hectopascals.
	In meteorology, an okta is a unit of measurement used to describe the amount of cloud cover at any given location such as a weather station. Sky conditions are estimated in terms of how many eighths of the sky are covered in cloud, ranging from 0 oktas (completely clear sky) through to 8 oktas (completely overcast).

*/

