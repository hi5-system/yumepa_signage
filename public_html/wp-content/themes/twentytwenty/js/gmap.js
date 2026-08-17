document.write('<sc'+'ript src="http://maps.google.com/maps/api/js?key=AIzaSyD24oFbTmbdjDQ5dpCQ2Gtk75mKma2pVKE&sensor=false"></sc'+'ript>');
var map;
function addEventSet(elm, listener, fn) {
	try {
		elm.addEventListener(listener, fn, false);
	}
	catch(e) {
		elm.attachEvent("on"+listener, fn);
	}
}

var gmaps = new Array();
function gmaps_init() {
	var tagObj = document.getElementsByTagName("div");
	for(var i=0;i<tagObj.length;i++){
		if(tagObj[i].className == "gmap")
			gmaps[tagObj[i].id] = new gmap(tagObj[i]);
	}
}

function gmap_move(map,maker,zoom) {
	gmaps[map].move(maker,zoom);
}

function gmap(obj) {
	this.init = function(obj) {
		this.Default = {"width": 944,"height": 520,"mobile-width": null,"mobile-height": null,"lat": null,"lng": null,"zoom": 5,"title": "Map","type": "ROADMAP","icon": null,"window": false,'multiwindow': false};
		this.Width = Number(this.att(obj,"data-width"));
		this.Height = Number(this.att(obj,"data-height"));
		this.MobileWidth = this.att(obj,"data-mobile-width");
		this.MobileHeight = this.att(obj,"data-mobile-height");
		this.Lat = Number(this.att(obj,"data-lat"));
		this.Lng = Number(this.att(obj,"data-lng"));
		this.Zoom = Number(this.att(obj,"data-zoom"));
		this.Type = this.att(obj,"data-type");
		this.Title = this.att(obj,"data-title");
		this.Icon = this.att(obj,"data-icon");
		this.Window = this.att(obj,"data-window");
		this.MultiWindow = this.att(obj,"data-multiwindow");
		this.mobile();
		this.container = obj;
		this.HTML = this.container.innerHTML;
		this.Makers = new Array();
		this.MakerLat = 0;
		this.MakerLng = 0;
		this.Infowindow = new Array();
		this.MakerIndex = new Array();
		this.CurrentInfowindow = null;
		var childs = this.container.childNodes;
		for(var i=0;i<childs.length;i++) {
			if(childs[i].className == "gmaker") {
				this.Makers[this.Makers.length] = new Object();
				this.Makers[this.Makers.length-1].Title = this.att(childs[i],"data-title");
				this.Makers[this.Makers.length-1].Lat = Number(this.att(childs[i],"data-lat"));
				this.Makers[this.Makers.length-1].Lng = Number(this.att(childs[i],"data-lng"));
				this.Makers[this.Makers.length-1].HTML = childs[i].innerHTML;
				this.Makers[this.Makers.length-1].Icon = this.att(childs[i],"data-icon");
				this.Makers[this.Makers.length-1].Window = this.att(childs[i],"data-window");
				this.Makers[this.Makers.length-1].Id = childs[i].id;
				this.MakerLat += this.Makers[this.Makers.length-1].Lat;
				this.MakerLng += this.Makers[this.Makers.length-1].Lng;
			}
		}

		if(this.Makers.length > 0) {
			this.Lat = this.MakerLat / this.Makers.length;
			this.Lng = this.MakerLng / this.Makers.length;
		}
		else {
			this.Makers[0] = new Object();
			this.Makers[0].Title = this.Title;
			this.Makers[0].Lat = this.Lat;
			this.Makers[0].Lng = this.Lng;
			this.Makers[0].HTML = this.container.innerHTML;
			this.Makers[0].Icon = this.Icon;
			this.Makers[0].Window = this.Window;
		}

		this.container.style.width = this.Width + "px";
		this.container.style.height = this.Height + "px";

		var myLatlng = new google.maps.LatLng(this.Lat, this.Lng);
		var myOptions = {
			zoom: this.Zoom,
			center: myLatlng,
			mapTypeId: google.maps.MapTypeId[this.Type],
			streetViewControl: false,
			scrollwheel: false
		}
		map = new google.maps.Map(obj,myOptions);

		for(var i=0;i<this.Makers.length;i++) {
			var myLatlng = new google.maps.LatLng(this.Makers[i].Lat,this.Makers[i].Lng);
			if(this.Makers[i].Id)
				this.MakerIndex[this.Makers[i].Id] = i;
			this.Makers[i].maker = new google.maps.Marker({
					position: myLatlng,
					map: map,
					title: this.Makers[i].Title,
					num: i,
					icon: this.Makers[i].Icon
			});
			this.Infowindow[i] = new google.maps.InfoWindow({
				content: this.Makers[i].HTML
			});
			google.maps.event.addListener(this.Makers[i].maker, 'click', function() {
				if(gmaps[obj.id].CurrentInfowindow != null && !this.MultiWindow)
					gmaps[obj.id].Infowindow[gmaps[obj.id].CurrentInfowindow].close();
				gmaps[obj.id].CurrentInfowindow = this["num"];
				gmaps[obj.id].Infowindow[this["num"]].open(gmaps[obj.id].map,gmaps[obj.id].Makers[this["num"]].maker);
			});
			if(this.Makers[i].Window)
				this.Infowindow[i].open(map,this.Makers[i].maker);
		}
	}

	this.move = function(maker,zoom) {
		if(this.CurrentInfowindow != null && !this.MultiWindow)
			this.Infowindow[this.CurrentInfowindow].close();
		var myLatlng = new google.maps.LatLng(this.Makers[this.MakerIndex[maker]].Lat,this.Makers[this.MakerIndex[maker]].Lng);
		this.Infowindow[this.MakerIndex[maker]].open(map,this.Makers[this.MakerIndex[maker]].maker);
		map.setCenter(myLatlng);
		this.CurrentInfowindow = this.MakerIndex[maker];
		if(zoom > 0 && zoom <= 20)
			map.setZoom(zoom);
	}

	this.att = function(obj,att) {
		if(obj.getAttribute(att)!=undefined)
			return obj.getAttribute(att);
		else
			return this.Default[att.replace("data-","")];
	}

	this.mobile = function() {
		var n = navigator.userAgent;
		if(n.indexOf('Mobile') > -1 && n.indexOf('iPad') == -1) {
			if(this.MobileWidth != null)
				this.Width = this.MobileWidth;
			if(this.MobileHeight != null)
				this.Height = this.MobileHeight;
		}
	}
	this.init(obj);
}
addEventSet(window,"load",function(){gmaps_init();});

