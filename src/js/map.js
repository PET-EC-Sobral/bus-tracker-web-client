var SERVER_PREFIX = "http://santana.azurewebsites.net/BusTrackerSecureAPI/index.php";
var ROUTE = 86;
var UPDATE_TIME_POSITION = 3000;
var UPDATE_TIME_MESSAGE = 5000;
var TOKEN = "JpURojQBMP7fD5gYC6t26jb9A40FPae2JNjRBzJpo4NoBgpkRKOW6U8b8naLPa+dEvR0Z0+tHcHEnp8Wxjj4MGfVYarqY73d2j9cF5cCAuEpus2Oj9bmuCVQjbxF7wPIViWRi99yO0YZOGF4EEpaZGRiTJCMaAV+CcyHa15soT5AY+qOJgHEsqK2irem9TYuPZP0DKipQK0sWYNoDGyszYPo0x71W8H7uVT69GFzgJQ=";
var MARKER_ICON = "../../assets/img/marker.png"
var map;
var route;
var timerId;
var panel;
function initMap() {
	map = new google.maps.Map($("#map")[0], {
	  center: {lat: -3.683868, lng: -40.350334},
	  zoom: 15
	});

	jQuery.support.cors = true;
	
	panel = new Panel({
		el: "messages",
		route: route
	});

	//check messages
	setInterval(function(){
		panel.update();
	}, UPDATE_TIME_MESSAGE);

	selecteRoute(ROUTE);
}
function selecteRoute(id){
	if(route)
		route.clearDrawing();
	
	var onCreate = function(){
		if(timerId)
			clearInterval(timerId);

		timerId = setInterval(function(){
			if(route.update)
				route.update(false);
		}, UPDATE_TIME_POSITION);

		panel.setRoute(route);
	}

	route = new Route({
		id_route: id,
		map: map
	}, onCreate);

	
}
function Route(op, onCreate){
	op = op || {};

	if(op.map === undefined)
		throw new {message:"map not defined"};

	this.map = op.map;

	if(!op.id_route)
		throw new {message:"id_buses not defined"};
	this.id_route = op.id_route || 0;

	this.routeAPI;
	this.__getRouteFromApi(function(){
		this.__drawRoute();
		this.__initBuses();
		this.update();
		if(typeof onCreate === 'function')
			onCreate(this);
	}.bind(this));
	
}
Route.prototype = {
	__getRouteFromApi: function(callback){
		$.ajax( {
			type: "GET",
			url: SERVER_PREFIX+"/routes/"+this.id_route,
			dataType: 'json',
			headers: {'Content-Type': 'text/plain', 'Token': TOKEN },
		})
	     .done(function(data) {
	     	this.routeAPI = data;
	     	if(typeof callback === 'function')
	     		callback(this);
	     	if(typeof this.onUpdateRouteAPI === 'function')
	     		this.onUpdateRouteAPI(this);
		 }.bind(this))
		 .fail(function(data) {
		    console.log("error:\n", data);
		 });
	},
	__initBuses: function(){
		//Make buses
		var busesId = this.routeAPI.id_buses;
		this.buses = [];
		for(var i = 0; i < busesId.length; i++){
			this.buses[i] = new Bus({map: this.map, id_route: this.id_route, id_buses:busesId[i]});
		}
	},
	__drawRoute: function(){
		//draw route from response
        var pathEncoded = this.routeAPI.googleRoute.routes[0].overview_polyline.points;
        var path = google.maps.geometry.encoding.decodePath(pathEncoded);
        this.poly = new google.maps.Polyline({
		    strokeColor: '#000000',
		    strokeOpacity: 0.7,
		    strokeWeight: 5,
		    path: path
		});
		this.poly.setMap(this.map);
	},
	update: function(data){
		if(data)
			this.__getRouteFromApi();

		//Draw markes on map
		if(this.buses instanceof Array)
			for(var i = 0; i < this.buses.length; i++)
				this.buses[i].updatePosition();
	},
	clearDrawing: function(){
		if(this.buses instanceof Array)
			for(var i = 0; i < this.buses.length; i++)
				this.buses[i].clearDrawing();

		this.poly.setMap(null);
	},
	onUpdateRouteAPI: function(){}
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
            map: map,
            icon: MARKER_ICON,
            animation: google.maps.Animation.DROP
    });

    this.tooltip = new google.maps.InfoWindow({
    	content: "<b>ônibus "+this.id_buses+"</b>"
  	});

    //events marker tooltip
    var hasClicked = false;
  	this.marker.addListener('click', function() {
    	hasClicked = true;
    	this.tooltip.open(map, this.marker);
  	}.bind(this));
  	this.marker.addListener('mouseover', function() {
    	this.tooltip.open(map, this.marker);
  	}.bind(this));
  	this.marker.addListener('mouseout', function() {
    	if(!hasClicked)
    		this.tooltip.close(map, this.marker);
  	}.bind(this));

  	this.tooltip.addListener('closeclick', function() {
    	hasClicked = false;
  	}.bind(this));
}
Bus.prototype = {
	updatePosition: function(){
		$.ajax( {
			type: "GET",
			url: SERVER_PREFIX+"/routes/"+this.id_route+"/buses/"+this.id_buses+"/positions?length=1",
			dataType: 'json',
			headers: {'Content-Type': 'text/plain', 'Token': TOKEN },
		})
	     .done(function(data) {
	     	if(data[0])
		     	this.marker.setPosition({lat: data[0].latitude, lng: data[0].longitude});
	        
		 }.bind(this))
		 .fail(function(data) {
		    console.log("error:\n", data);
		 });
	},
	clearDrawing: function(){
		this.marker.setMap(null);
	}
}

function Panel(op){
	this.op = op || {};

	this.$el = $(op.el);
	this.el = op.el;
	this.messages;
	this.messageList = {};
	
	this.routesEl = 'routes';
	this.route = op.route || {};
	this.routeList = {};
	
	$("#route").on("click", function(){
		$("#select-route-modal").modal("show");	
	});

	this.update(this.__init.bind(this));
}
Panel.prototype = {
	__init: function(){
		this.__updateMessagesList;
		this.setRoute(this.route, false);
		
		if(!this.routes)
			this.__makeRoutesList();

	},
	__makeRoutesList: function(){
		$.ajax( {
			type: "GET",
			url: SERVER_PREFIX+"/routes",
			dataType: 'json',
			headers: {'Content-Type': 'text/plain', 'Token': TOKEN },
		})
	     .done(function(routes) {
	     	console.log(routes);
	     	this.routes = routes;
	     	var options = {
			  valueNames: [ 'title', 'description', 'id_route'],
			  item: '<li class="clickable-item">'+
			            '<h3 class="title"></h3>'+
			            '<p class="description"></p>'+
			        '</li>'
			};

			var values = [];
			for(var i = 0; i < this.routes.length; i++){
				values[i] = {
					title: this.routes[i].name,
					description: this.routes[i].description,
					id_route: this.routes[i].id_routes
				};
			}

			if(typeof this.routeList.clear === 'function')
				this.routeList.clear();
			this.routeList = new List(this.routesEl, options, values);

			var items = this.routeList.items;
			for(var i = 0; i < items.length; i++){

				$(items[i].elm).on("click", function(){
					console.log(items[this.index].values().id_route);
					selecteRoute(items[this.index].values().id_route);
					$("#select-route-modal").modal("hide");
				}.bind({index: i+0}));
			}

		 }.bind(this))
		 .fail(function(data) {
		    console.log("error:\n", data);
		 });
	},
	__updateMessagesList: function(){
		var options = {
		  valueNames: [ 'title', 'message', 'date' ],
		  item: '<li>'+
		            '<h3 class="title"></h3>'+
		            '<p class="message"></p>'+
		            '<p class="date"></p>'+
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

		if(typeof this.messageList.clear === 'function')
			this.messageList.clear();
		this.messageList = new List(this.el, options, values);
	},
	update: function(callback){
		if(this.route.id_route){
			//request messages
		 	$.ajax( {
				type: "GET",
				url: SERVER_PREFIX+"/routes/"+this.route.id_route+"/messages?buses=true",
				dataType: 'json',
				headers: {'Content-Type': 'text/plain', 'Token': TOKEN },
			})
		     .done(function(data) {
		     	this.messages = data;
		     	this.__updateMessagesList();
		     	if(typeof callback === 'function')
		     		callback(this);
			 }.bind(this))
			 .fail(function(data) {
			    console.log("error:\n", data);
			 });

			 this.__updateInfoRoute();
		}
	},
	__updateInfoRoute: function(){
		//update route in panel
		if(this.route.routeAPI){
			$("#route-name").text(this.route.routeAPI.name);
			$("#route-description").text(this.route.routeAPI.description);
		}
	},
	setRoute: function(route, update){
		update = update === undefined ? true : update;

		this.route = route;
		this.route.onUpdateRouteAPI = this.__updateInfoRoute.bind(this);
		if(update)
			this.update(this.__init.bind(this));
	}
}