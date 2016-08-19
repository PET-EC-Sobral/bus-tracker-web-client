var SERVER_PREFIX = "http://santana.azurewebsites.net/BusTrackerSecureAPI/index.php";
var map;
function initMap() {
	map = new google.maps.Map($("#map")[0], {
	  center: {lat: -3.693760, lng: -40.355086},
	  zoom: 16
	});

	jQuery.support.cors = true;
	$.ajax( {
		type: "GET",
		url: SERVER_PREFIX+"/routes/86",
		dataType: 'json',
		headers: {'Content-Type': 'text/plain', 'Token': 'JpURojQBMP7fD5gYC6t26jb9A40FPae2JNjRBzJpo4NoBgpkRKOW6U8b8naLPa+dEvR0Z0+tHcHEnp8Wxjj4MGfVYarqY73d2j9cF5cCAuEpus2Oj9bmuCVQjbxF7wPIViWRi99yO0YZOGF4EEpaZGRiTJCMaAV+CcyHa15soT5AY+qOJgHEsqK2irem9TYuPZP0DKipQK0sWYNoDGyszYPo0x71W8H7uVT69GFzgJQ=' },
	})
     .done(function(data) {
     	//draw route from response
        var pathEncoded = data.googleRoute.routes[0].overview_polyline.points;
        var path = google.maps.geometry.encoding.decodePath(pathEncoded);
        var poly = new google.maps.Polyline({
		    strokeColor: '#000000',
		    strokeOpacity: 0.7,
		    strokeWeight: 5,
		    path: path
		});
		poly.setMap(map);

		//Make buses
		var busesId = data.id_buses;
		var buses = [];
		for(var i = 0; i < busesId.length; i++){
			console.log(busesId[i]);
			buses[i] = new Bus({map: map, id_route: 86, id_buses:busesId[i]});
		}

		//Draw markes on map
		var updatePosition = function(){
			for(var i = 0; i < buses.length; i++)
				buses[i].updatePosition();
		};

		setInterval(updatePosition, 3000);

		//update route in panel
		$("#route-name").text(data.name);
	 	$("#route-description").text(data.description);
	 })
	 .fail(function(data) {
	    console.log("error:\n", data);
	 });

	 //request messages
 	$.ajax( {
		type: "GET",
		url: SERVER_PREFIX+"/routes/86/messages",
		dataType: 'json',
		headers: {'Content-Type': 'text/plain', 'Token': 'JpURojQBMP7fD5gYC6t26jb9A40FPae2JNjRBzJpo4NoBgpkRKOW6U8b8naLPa+dEvR0Z0+tHcHEnp8Wxjj4MGfVYarqY73d2j9cF5cCAuEpus2Oj9bmuCVQjbxF7wPIViWRi99yO0YZOGF4EEpaZGRiTJCMaAV+CcyHa15soT5AY+qOJgHEsqK2irem9TYuPZP0DKipQK0sWYNoDGyszYPo0x71W8H7uVT69GFzgJQ=' },
	})
     .done(function(data) {
     	console.log(data);
     	var panel = new Panel({
     		el:"messages",
     		messages: data
     	});
	 })
	 .fail(function(data) {
	    console.log("error:\n", data);
	 });
}

function Bus(op){
	op = op || {};
	
	if(!op.id_buses)
		throw new {message:"id_buses not defined"};
	this.id_buses = op.id_buses;
	this.id_route = op.id_route || 0;

	if(op.map === undefined)
		throw new {message:"map not defined"};
	var map = op.map
	this.marker = new google.maps.Marker({
            map: map
    });
}
Bus.prototype = {
	updatePosition: function(){
		$.ajax( {
			type: "GET",
			url: SERVER_PREFIX+"/routes/"+this.id_route+"/buses/"+this.id_buses+"/positions?length=1",
			dataType: 'json',
			headers: {'Content-Type': 'text/plain', 'Token': 'JpURojQBMP7fD5gYC6t26jb9A40FPae2JNjRBzJpo4NoBgpkRKOW6U8b8naLPa+dEvR0Z0+tHcHEnp8Wxjj4MGfVYarqY73d2j9cF5cCAuEpus2Oj9bmuCVQjbxF7wPIViWRi99yO0YZOGF4EEpaZGRiTJCMaAV+CcyHa15soT5AY+qOJgHEsqK2irem9TYuPZP0DKipQK0sWYNoDGyszYPo0x71W8H7uVT69GFzgJQ=' },
		})
	     .done(function(data) {
	     	if(data[0])
		     	this.marker.setPosition({lat: data[0].latitude, lng: data[0].longitude});
	        
		 }.bind(this))
		 .fail(function(data) {
		    console.log("error:\n", data);
		 });
	}
}

function Panel(op){
	this.op = op || {};

	this.$el = $(op.el);
	this.el = op.el;
	this.messages = op.messages || [];
	this.init();
}
Panel.prototype = {
	init: function(){
		var options = {
		  valueNames: [ 'title', 'message', 'date' ],
		  item: '<li>'+
		            '<h3 class="title">Jonny Stromberg</h3>'+
		            '<p class="message">1986</p>'+
		            '<p class="date">dklsajd</p>'+
		        '</li>'
		};

		var values = [];
		for(var i = 0; i < this.messages.length; i++){
			values[i] = {
				title: this.messages[i].title,
				message: this.messages[i].message,
				date:this.messages[i].date
			};
		}

		var messageList = new List(this.el, options, values);
	}
}