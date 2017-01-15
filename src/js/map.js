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
	}, BusTracker.UPDATE_TIME_MESSAGE);

	selecteRoute(BusTracker.ROUTE);

	showUserLocation();
}
function showUserLocation(){

	if(!("geolocation" in navigator)){
		return;
	}

	var MARKER_USER_ICON = "assets/img/marker_smile.png";
	var icon = {
	    url: MARKER_USER_ICON, // url
	    scaledSize: new google.maps.Size(30, 35), // scaled size
	    origin: new google.maps.Point(0,0), // origin
	    anchor: new google.maps.Point(30/2, 35) // anchor
	};

	var marker = new google.maps.Marker({
            map: map,
            icon: icon,
            animation: google.maps.Animation.DROP
    });

    var options = {
	  enableHighAccuracy: true,
	  timeout: 5000,
	  maximumAge: 0
	};

	var onPosition = function(position) {
		marker.setMap(map);
		var position = {lat: position.coords.latitude, lng: position.coords.longitude};
  		marker.setPosition(position);
	};

	var onPositionError = function(){
		marker.setMap(null);
	}

	var watchID = navigator.geolocation.watchPosition(onPosition, onPositionError, options);
}
function selecteRoute(id){
	if(route && route.clearDrawing)
		route.clearDrawing();
	
	var onCreate = function(){
		if(timerId)
			clearInterval(timerId);

		timerId = setInterval(function(){
			if(route.update)
				route.update(false);
		}, BusTracker.UPDATE_TIME_POSITION);

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

	this.referencePoints;
	this.__initReferencePoints();
	
}
$.extend(Route, {
	COLOR: "#0092CC",
	ARROW_ICON_URL: "assets/img/arrow.png"
});
Route.prototype = {
	__getRouteFromApi: function(callback){
		$.ajax( {
			type: "GET",
			url: BusTracker.SERVER_PREFIX+"/routes/"+this.id_route,
			dataType: 'json',
			headers: {'Content-Type': 'text/plain', 'Token': BusTracker.TOKEN },
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
	__initReferencePoints: function(){
		$.ajax( {
			type: "GET",
			url: BusTracker.SERVER_PREFIX+"/routes/"+this.id_route+"/referencepoints",
			dataType: 'json',
			headers: {'Content-Type': 'text/plain', 'Token': BusTracker.TOKEN },
		})
	     .done(function(data) {
	     	//put reference points on map
	     	if(data instanceof Array){
	     		this.referencePoints = [];
	     		data.forEach(function(e, i, a){
	     			var reference = new ReferencePoint({
	     				name: e.name,
	     				image: e.image,
	     				id_routes: e.id_routes,
	     				description: e.description,
	     				position: {lat: e.latitude, lng: e.longitude},
	     				map: this.map
	     			});
	     		}.bind(this));
	     	}
		 }.bind(this))
		 .fail(function(data) {
		    console.log("error:\n", data);
		 });	
	},
	__drawRoute: function(){
		var iconsetngs = {
			path: "M -1.6058721,2.4184373 0.00299209,0.01667308 1.529614,2.4067857",
    		strokeOpacity: 1,
    		scale: 4,
    		strokeWeight: 4
    	}

		//draw route from response
        var pathEncoded = this.routeAPI.googleRoute.routes[0].overview_polyline.points;
        var path = google.maps.geometry.encoding.decodePath(pathEncoded);
        this.poly = new google.maps.Polyline({
		    strokeColor: Route.COLOR,
		    strokeOpacity: 0.9,
		    strokeWeight: 5,
		    path: path,
		    icons: [{
	            icon: iconsetngs,
	            repeat:'63px',
	            offset: '100%'
	        }]
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

function Marker(op){
	op = op || {};

	if(op.map === undefined)
		throw new {message:"map not defined"};
	this.map = op.map;


	var icon = {
	    url: Marker.MARKER_ICON, // url
	    scaledSize: new google.maps.Size(Marker.ICON_SIZE.w, Marker.ICON_SIZE.h), // scaled size
	    origin: new google.maps.Point(0,0), // origin
	    anchor: new google.maps.Point(Marker.ICON_SIZE.w/2, Marker.ICON_SIZE.h) // anchor
	};

	this.marker = new google.maps.Marker({
            map: this.map,
            icon: icon,
            animation: google.maps.Animation.DROP
    });

    this.tooltip = new google.maps.InfoWindow({
    	content: this.tooltipMakeup()
  	});

 	this.setPosition(op.position || {lat: 0, lng: 0});
 	this.visibilityTooltip = false;
 	this.formattedAddress;

    //events marker tooltip
    var hasClicked = false;
  	this.marker.addListener('click', function() {
    	hasClicked = true;
    	this.setVisibityTooltip(true);
  	}.bind(this));
  	this.marker.addListener('mouseover', function() {
    	this.setVisibityTooltip(true);
  	}.bind(this));
  	this.marker.addListener('mouseout', function() {
    	if(!hasClicked)
    		this.setVisibityTooltip(false);
  	}.bind(this));

  	this.tooltip.addListener('closeclick', function() {
    	hasClicked = false;
  	}.bind(this));
}
$.extend(Marker, {
	MARKER_ICON: "assets/img/marker.png",
	ICON_SIZE: {
		w: 30,
	 	h: 30
	}
})
Marker.prototype = {
	show: function(value){
		if(value)
			this.marker.setMap(this.map);
		else
			this.marker.setMap(null);
	},
	setIcon: function(icon){
		icon.size = icon.scaledSize;
		this.marker.setIcon($.extend({}, this.marker.icon, icon));
	},
	tooltipMakeup: function(){
		return "<b>Tooltip</b>";
	},
	setPosition: function(position){
 		this.marker.setPosition(position);
	},
	getPosition: function(){
		var position = this.marker.getPosition();
		return {lat: position.lat(), lng: position.lng()};
	},
	update: function(){
		this.tooltip.setContent(this.tooltipMakeup());
	},
	isVisibleTooltip: function(){
		return this.visibilityTooltip;
	},
	setVisibityTooltip: function(value){
		if(value)
			this.tooltip.open(this.map, this.marker);
		else
			this.tooltip.close();

		this.visibilityTooltip = value; 
		this.onChangeTooltipVisibility(this, value);	
	},
	updateFormattedAddress: function(){
		var position = this.getPosition();
		if(position)
			$.ajax( {
				type: "GET",
				url: "https://maps.googleapis.com/maps/api/geocode/json?latlng="+position.lat+","+position.lng,
				dataType: 'json',
				headers: {'Content-Type': 'text/plain'},
			})
		     .done(function(data) {
		     	if(data.results[0].formatted_address)
		     		this.formattedAddress = data.results[0].formatted_address;
			 }.bind(this))
			 .fail(function(data) {
			    console.log("error:\n", data);
			 });
	},
	onChangeTooltipVisibility: function(marker, visibility){}//event
}

function Bus(op){
	Marker.call(this, op);
	op = op || {};

	 if(!op.id_buses)
		throw new {message:"id_buses not defined"};
	this.id_buses = op.id_buses;
	this.id_route = op.id_route || 0;

	this.position;
	this.lastUpdate;
	this.stopTime = 2*60*1000;
	this.status = "";

	this.setIcon({
		scaledSize: new google.maps.Size(Bus.ICON_SIZE.w, Bus.ICON_SIZE.h),
		url: Bus.MARKER_ICON
	});
}
$.extend(Bus, {
	MARKER_ICON: "assets/img/marker.png",
	MARKER_ICON_STOP: "assets/img/marker-stop.png",
	ICON_SIZE: {w: 30, h: 35}
});
Bus.prototype = {
	updatePosition: function(){
		$.ajax( {
			type: "GET",
			url: BusTracker.SERVER_PREFIX+"/routes/"+this.id_route+"/buses/"+this.id_buses+"/positions?length=1",
			dataType: 'json',
			headers: {'Content-Type': 'text/plain', 'Token': BusTracker.TOKEN },
		})
	     .done(function(data) {
	     	if(data[0]){
		     	this.lastUpdate = data[0].date;
		     	this.setPosition({lat: data[0].latitude, lng: data[0].longitude})
		     	this.updateFormattedAddress();
		     	
		     	if(this.isStoped())
		     		this.setStatus("stop");
		     	else
		     		this.setStatus("");

		     }
		 }.bind(this))
		 .fail(function(data) {
		    console.log("error:\n", data);
		 });

		 this.update();
	},
	clearDrawing: function(){//deprecated, see Marker.show();
		this.show(false);
	},
	tooltipMakeup: function(){//@override
		var tooltipContent = "<center><b>Ônibus "+this.id_buses+"</b></center>";
		tooltipContent += "<p>"+(this.formattedAddress || "")+"</p>";
		if(this.lastUpdate)
			tooltipContent += "<p style='text-align:right;font-size:10px'> "+this.timeAgoText+" "+this.getTimeAgo()+"</p>";
		
		return tooltipContent;
	},
	getTimeAgo: function(){
		var time = Date.parse(this.lastUpdate);
		return jQuery.timeago(new Date(time));
	},
	setIcon: function(icon){//@override
		if(typeof icon === 'string')
			if(icon == 'stop')
				this.marker.icon.url = Bus.MARKER_ICON_STOP;
			else
				this.marker.icon.url = Bus.MARKER_ICON;
		else
			Marker.prototype.setIcon.call(this, icon);
	},
	isStoped: function(){
		var last = Date.parse(this.lastUpdate);
		return Date.parse(new Date()) - last > this.stopTime;
	},
	setPosition: function(position){//@override
		this.position = position;
		Marker.prototype.setPosition.call(this, position);
	},
	setStatus: function(status){
		this.setIcon(status);
		this.status = status;
		if (status == 'stop') {
			this.timeAgoText = "O ônibus está parado";
		}
		else{
			this.timeAgoText = "Ultima atualização";
		}
	}
}
Bus.prototype = $.extend({}, Object.create(Marker.prototype), Object.create(Bus.prototype));
Bus.prototype.constructor = Bus;

function ReferencePoint(op){
	Marker.call(this, op);
	op = op || {};

	 if(!op.id_routes)
		throw new {message:"id_routes not defined"};
	this.id_route = op.id_route;

	this.name = op.name || "";
	this.image = op.image || ReferencePoint.IMAGE;
	this.description = op.description || "";

	this.setIcon({
		scaledSize: new google.maps.Size(ReferencePoint.ICON_SIZE.w, ReferencePoint.ICON_SIZE.h),
		url: ReferencePoint.MARKER_HIGHLIGHT_ICON,//for load to cache
		anchor: new google.maps.Point(Marker.ICON_SIZE.w/2, Marker.ICON_SIZE.h/2)
	});

	this.setIcon({url: ReferencePoint.MARKER_ICON});

	this.update();
}
$.extend(ReferencePoint, {
	MARKER_ICON: "assets/img/reference_marker.png",
	MARKER_HIGHLIGHT_ICON: "assets/img/reference_highlight_marker.png",
	ICON_SIZE: {w: 30, h: 30},
	IMAGE: 'assets/img/marker.png',
	IMAGE_SIZE: {w: 200, h: 110}
});
ReferencePoint.prototype = {
	tooltipMakeup: function(){//@override
		var tooltipContent = "<center><b>"+this.name+"</b></center>";
		tooltipContent += "<center><img src='{1}' height='{2}' width='{3}' ></center>";
		tooltipContent = tooltipContent.format(this.image, ReferencePoint.IMAGE_SIZE.h, ReferencePoint.IMAGE_SIZE.w);
		tooltipContent += "<p>"+this.description+"</p>"
		return tooltipContent;
	},
	setIcon: function(icon){//@override
		if(typeof icon === 'string')
			if(icon == 'stop')
				this.marker.icon.url = Bus.MARKER_ICON_STOP;
			else
				this.marker.icon.url = Bus.MARKER_ICON;
		else
			Marker.prototype.setIcon.call(this, icon);
	},
	isStoped: function(){
		var last = Date.parse(this.lastUpdate);
		return Date.parse(new Date()) - last > this.stopTime;
	},
	setPosition: function(position){//@override
		this.position = position;
		Marker.prototype.setPosition.call(this, position);
	},
	onChangeTooltipVisibility: function(marker, visibility){
		if(visibility)
			this.setIcon({url: ReferencePoint.MARKER_HIGHLIGHT_ICON});
		else
			this.setIcon({url: ReferencePoint.MARKER_ICON});
		this.update();
	}
}
ReferencePoint.prototype = $.extend({}, Object.create(Marker.prototype), Object.create(ReferencePoint.prototype));
ReferencePoint.prototype.constructor = ReferencePoint;

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

	$("#app-info").on("click", function(){
		var win = window.open(Panel.LINK_BUSTRACKER_PAGE, '_blank');
  		win.focus();
	});

	this.update(this.__init.bind(this));
}
$.extend(Panel, {
	LINK_BUSTRACKER_PAGE: "http://www.pet.ec.ufc.br/bustracker/"
});
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
			url: BusTracker.SERVER_PREFIX+"/routes",
			dataType: 'json',
			headers: {'Content-Type': 'text/plain', 'Token': BusTracker.TOKEN },
		})
	     .done(function(routes) {
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
				url: BusTracker.SERVER_PREFIX+"/routes/"+this.route.id_route+"/messages?buses=true",
				dataType: 'json',
				headers: {'Content-Type': 'text/plain', 'Token': BusTracker.TOKEN },
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

String.prototype.format = function() {
	var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number-1] != 'undefined'? args[number-1] : match;
    });
};
