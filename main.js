function initialize(string){ 
		window.XC = {};
		
		XC.nodes = new nodes($nodes);
		XC.nodes.gates = {};
		XC.nodes.analyze();
	
		XC.edges = new edges($edges);
		XC.edges.analyze();
	
		XC.canvasBox = new Box(string);
		XC.canvasBox.getDim().reCalcViewPort();
	
		XC.canvasNodes = new canvasElement("canvasNode");
		XC.canvasNodes.elements = XC.nodes.elements;
		XC.canvasEdges = new canvasElement("canvasEdge");
		XC.canvasEdges.elements = XC.edges.elements;
		XC.canvasRoute = new canvasElement("canvasRoute");	
		
		XC.canvasNodes.drawPoints();
		XC.canvasEdges.drawLines();
		/*
		var path = new AStern();
			path.from('tG27');
			path.to('R2r');
			path.findRoute();
			console.log(path);
			return;
		*/
		XC.simulation = [];
		XC.simulation.push(new simulation());
		XC.simulation[0].start();
}

function Box($string){
	this.id = $string;
	this.width = 0;
	this.height = 0;
	
	this.origin    = {'x':null,'y':null};
	this.oldOrigin = {'x':null,'y':null};
	
	this.faktor = 0;
	this.dimX = 0;
	
	this.getDim = function() {
		$('#'+this.id).width($('#'+this.id).width() - 310);
		$('#infoContainer').width(320);
		var subH = ($('#'+this.id).height() - 6 - 20 - 200 - 10 - 20) / 2 + 1;
		$('#SurfaceStatus').height(subH);
		$('#PlaneStatus').height(subH);
		
		this.width = $('#'+this.id).width();
		this.height = $('#'+this.id).height();
		
		return(this);
	};
	
	this.reCalcViewPort = function(){
		if(this.origin.x === null || this.origin.x != this.oldOrigin.x || this.origin.y != this.oldOrigin.y){
			var deltaX = (XC.nodes.max.x - XC.nodes.min.x);
			var deltaY = (XC.nodes.max.y - XC.nodes.min.y);
			
			var subX = deltaX  * 0.1;
			var subY = deltaY  * 0.1;
			
			this.origin.x = XC.nodes.min.x - subX;
			this.origin.y = XC.nodes.min.y - subY;
			
			this.oldOrigin.x = this.origin.x;
			this.oldOrigin.y = this.origin.y;

			var scaleX = this.width / (deltaX + 2 * subX);
			var scaleY = this.height / (deltaY + 2 * subY);

			this.faktor = Math.min(scaleX,scaleY);
			this.dimX = deltaX + 2 * subX;
		}
		return(this);
	};
}

function canvasElement($string) {
	this.routeIng = {};
	this.init = {
		'dimX' : $('#'+$string).attr('width',XC.canvasBox.width),
		'dimY' : $('#'+$string).attr('height',XC.canvasBox.height)
	};
	
	this.id = $string;
	this.canvas = document.getElementById($string);
	this.ctx = this.canvas.getContext('2d');

	this.elements = {};
	this.radius = 5;
	this.color = '#444';
	
	this.erase = function(){
		this.ctx.save();

		// Use the identity matrix while clearing the canvas
		this.ctx.setTransform(1, 0, 0, 1, 0, 0);
		this.ctx.clearRect(0, 0, XC.canvasBox.width, XC.canvasBox.height);

		// Restore the transform
		this.ctx.restore();
	};
	
	this.drawStoppLineOfPoint = function(propN){
		var point = this.elements[propN];
		if(Object.keys(point.linkTo).length == 1)
			return;
		
		var points = [];
		for(var prop in point.linkTo){
			points.push({
				'x' : point.linkTo[prop].edgeStopp.x,
				'y' : point.linkTo[prop].edgeStopp.y,
				'angle' : point.linkTo[prop].degree
			});
		}
			
		points.sort(function(a,b){
			return(a.angle - b.angle);
		});	
			
		this.ctx.fillStyle = 'rgba(255,220,220,1)';
		this.ctx.beginPath();
		
		var start = null;

		for(prop in points){
			if(start === null){
				this.ctx.moveTo(this.getPixelX(points[prop].x), this.getPixelY(points[prop].y));
				start = true;
				continue;
			}
			this.ctx.lineTo(this.getPixelX(points[prop].x), this.getPixelY(points[prop].y));
		}
		
		this.ctx.closePath();
		this.ctx.fill();
		
		var ID = propN;
		if(!document.getElementById(ID)){
			var minX = null, maxX = null, minY = null, maxY = null;
			for(prop in points){
				if(minX === null){
					minX = points[prop].x;
					maxX = points[prop].x;
					minY = points[prop].y;
					maxY = points[prop].y;
				} else {
					if(points[prop].x < minX)
						minX = points[prop].x;
					if(points[prop].x > maxX)
						maxX = points[prop].x;
					if(points[prop].y < minY)
						minY = points[prop].y;
					if(points[prop].y > maxY)
						maxY = points[prop].y;
				}
			}
			var wrapObj = document.createElement("div");
				wrapObj.id = ID;
				wrapObj.className = 'clickableObj';
				
				wrapObj.setAttribute('data-type','node');
				
				wrapObj.style.left = this.getPixelX(minX)+'px';
				wrapObj.style.top = this.getPixelY(minY)+'px';
				wrapObj.style.width = XC.canvasBox.faktor * (maxX - minX)+'px';
				wrapObj.style.height = XC.canvasBox.faktor * (maxY - minY)+'px';
				
				document.getElementById('clickableObj').appendChild(wrapObj);	
		}
	};
	
	this.drawWithStoppLine = function(){
		this.erase();
		for(var prop in this.elements){
			this.drawStoppLineOfPoint(prop);
			this.drawPoint(this.elements[prop].x,this.elements[prop].y,this.radius);
			this.drawLabel(this.elements[prop].x,this.elements[prop].y,prop);
		}
	};
	
	this.drawWithTriggerLine = function(){
		this.erase();
	};
	
	this.drawWithStoppAndTriggerLine = function(){
		this.erase();
		for(var prop in this.elements){
			this.drawPoint(this.elements[prop].x,this.elements[prop].y,this.radius);
			this.drawCircle(this.elements[prop].x,this.elements[prop].y,15);
			this.drawLabel(this.elements[prop].x,this.elements[prop].y,prop);
		}
	};
	
	this.drawPoints = function(){
		this.erase();
		for(var prop in this.elements){
			this.drawPoint(this.elements[prop].x,this.elements[prop].y,this.radius);
			this.drawLabel(this.elements[prop].x,this.elements[prop].y,prop);
		}
	};
		
	this.drawPoint = function(x1,y1,r1){
      this.ctx.beginPath();
      this.ctx.arc((x1 - XC.canvasBox.origin.x) * XC.canvasBox.faktor, (y1 - XC.canvasBox.origin.y) * XC.canvasBox.faktor, r1, 0, 2 * Math.PI, false);
      this.ctx.fillStyle = '#FFF';
      this.ctx.fill();
      this.ctx.lineWidth = 1;
      this.ctx.strokeStyle = this.color;
      this.ctx.stroke();
	};
	
	this.drawCircle = function(x1,y1,r1){
	  var nX1 = this.getPixelX(x1), nY1 = this.getPixelY(y1);
	  r1 = 0.18 * XC.simulation[0].lengthInPixelFaktor;
	  this.ctx.beginPath();
      this.ctx.arc(nX1, nY1, r1, 0, 2 * Math.PI, false);
      this.ctx.fillStyle = 'rgba(255,255,255,0)';
      this.ctx.fill();
      this.ctx.lineWidth = 1;
      this.ctx.strokeStyle = 'rgba(200,50,75,1)';
      this.ctx.stroke();
	};
	
	this.drawLabel = function(x1,y1,label){
		this.ctx.fillStyle = '#AAA';
		this.ctx.font = 'italic 11px sans-serif';
		this.ctx.textBaseline = 'bottom';
		this.ctx.fillText(label, (x1 - XC.canvasBox.origin.x) * XC.canvasBox.faktor + 10, (y1 - XC.canvasBox.origin.y) * XC.canvasBox.faktor - 5);
	};
	
	this.drawLines = function(){
		var x1 = 0;
		var x2 = 0;
		var y1 = 0;
		var y2 = 0;
		
		for(var prop in this.elements){
			x1 = XC.nodes.elements[this.elements[prop].a].x;
			y1 = XC.nodes.elements[this.elements[prop].a].y;
			x2 = XC.nodes.elements[this.elements[prop].b].x;
			y2 = XC.nodes.elements[this.elements[prop].b].y;
			
			this.drawLine(x1,y1,x2,y2);
		}
	};
	
	this.drawLine = function(x1,y1,x2,y2,color,width){
		if(typeof color === 'undefined')
			color = 'rgba(80,80,80,1)';
			
		this.ctx.beginPath();
      	this.ctx.strokeStyle = color;
      	if(typeof width === 'undefined')
      		this.ctx.lineWidth = 1;
      	else
      		this.ctx.lineWidth = width;
      	this.ctx.moveTo((x1 - XC.canvasBox.origin.x) * XC.canvasBox.faktor, (y1 - XC.canvasBox.origin.y) * XC.canvasBox.faktor);
      	this.ctx.lineTo((x2 - XC.canvasBox.origin.x) * XC.canvasBox.faktor, (y2 - XC.canvasBox.origin.y) * XC.canvasBox.faktor);
      	this.ctx.stroke();
	};
	
	this.getPixelX = function(x1){
		return((x1 - XC.canvasBox.origin.x) * XC.canvasBox.faktor);
	};
	this.getPixelY = function(y1){
		return((y1 - XC.canvasBox.origin.y) * XC.canvasBox.faktor);
	};
	
	this.margin = 5;
	
	this.plotRoutes = function(){
		delete this.routeIng;
		this.routeIng = {};
		this.erase();
		var plotStart = {
			'x':0,'y':0
		};
		
		var plotStopp = {
			'x':0,'y':0
		};
		
		var afterOne = {'angle':0,'x':0,'y':0};
		var plane = null;
		var offsetAdd = 0;
		
		var add = {'x':0,'y':0};
		var temp = {'x':0,'y':0};
		var temp2= {'x':0,'y':0};
		var newLoc = {'x':0,'y':0};
		
		var plotArray = []; // -> {'x':0,'y':0}
		
		var headingThisEdge = 0;
		
		for(var prop in XC.simulation[0].planes.planeArray){
			plane = XC.simulation[0].planes.planeArray[prop];
			if(plane.route === null || plane.residualRoute === null || plane.off)
				continue;
			
			plotArray = [];
			
			for(var i = plane.residualRoute.length-1; i >= 0; i--){
				if(i > 0){
					if(typeof this.routeIng[plane.residualRoute[i-1]+'_'+plane.residualRoute[i]] === 'undefined')
						this.routeIng[plane.residualRoute[i-1]+'_'+plane.residualRoute[i]] = 1;
					else
						this.routeIng[plane.residualRoute[i-1]+'_'+plane.residualRoute[i]]++;
					
					offsetAdd = this.routeIng[plane.residualRoute[i-1]+'_'+plane.residualRoute[i]] * this.margin / XC.canvasBox.faktor;
					headingThisEdge = XC.nodes.elements[plane.residualRoute[i-1]].linkTo[plane.residualRoute[i]].angle;

					temp = this.getOffset(offsetAdd,headingThisEdge);
					
					plotArray.push({
						'x': XC.nodes.elements[plane.residualRoute[i]].x + temp.x,
						'y': XC.nodes.elements[plane.residualRoute[i]].y + temp.y
					});
					plotArray.push({
						'x': XC.nodes.elements[plane.residualRoute[i-1]].x + temp.x,
						'y': XC.nodes.elements[plane.residualRoute[i-1]].y + temp.y
					});
				
				} else {
					if(typeof this.routeIng[plane.lastNode+'_'+plane.residualRoute[0]] === 'undefined')
						this.routeIng[plane.lastNode+'_'+plane.residualRoute[0]] = 1;
					else
						this.routeIng[plane.lastNode+'_'+plane.residualRoute[0]]++;
					
					offsetAdd = this.routeIng[plane.lastNode+'_'+plane.residualRoute[0]] * this.margin / XC.canvasBox.faktor;
					headingThisEdge = XC.nodes.elements[plane.lastNode].linkTo[plane.residualRoute[0]].angle;

					temp = this.getOffset(offsetAdd,headingThisEdge);
					
					plotArray.push({
						'x': XC.nodes.elements[plane.residualRoute[0]].x + temp.x,
						'y': XC.nodes.elements[plane.residualRoute[0]].y + temp.y
					});
					plotArray.push({
						'x': plane.location.x + temp.x,
						'y': plane.location.y + temp.y
					});
				}
			}
			
			if(plotArray.length > 1){
				this.drawSegment(plotArray,plane.color,1);
			}
		}
	};
	
	this.drawSegment = function(array,color,width){
		if(typeof color === 'undefined')
			color = '80,80,80';
		
		this.ctx.strokeStyle = 'rgba('+color+',1)';
      	
      	if(typeof width === 'undefined')
      		this.ctx.lineWidth = 1;
      	else
      		this.ctx.lineWidth = width;
		
		this.ctx.beginPath();
		this.ctx.moveTo((array[0].x - XC.canvasBox.origin.x) * XC.canvasBox.faktor, (array[0].y - XC.canvasBox.origin.y) * XC.canvasBox.faktor);
		for(var i = 1; i < array.length; i++){
			if(i == array.length - 1){
				this.ctx.lineJoin = 'round';
				this.ctx.stroke();
				this.ctx.beginPath();
				this.ctx.strokeStyle = 'rgba('+color+',1)';
				this.ctx.lineWidth += 4;
				this.ctx.moveTo((array[i-1].x - XC.canvasBox.origin.x) * XC.canvasBox.faktor, (array[i-1].y - XC.canvasBox.origin.y) * XC.canvasBox.faktor);
			}
			this.ctx.lineTo((array[i].x - XC.canvasBox.origin.x) * XC.canvasBox.faktor, ((array[i].y - XC.canvasBox.origin.y) * XC.canvasBox.faktor));
		}
		this.ctx.lineJoin = 'round';
		this.ctx.stroke();
	};
	
	this.getOffset = function(length, angle){
		var loc = {'x':0,'y':0};
		
		if(angle <= 0.5 * Math.PI){ // <= 90°
			loc.x = Math.cos(angle) * length;
			loc.y = Math.sin(angle) * length;
		} else if(angle <= Math.PI){
			angle = Math.PI - angle; // 180 - 179 -> 1
			loc.x = -Math.cos(angle) * length;
			loc.y = -Math.sin(angle) * length;
		} else if(angle <= 1.5 * Math.PI){
			angle = 1.5 * Math.PI - angle;
			loc.x = -Math.sin(angle) * length;
			loc.y = -Math.cos(angle) * length;
		} else {
			angle = 2 * Math.PI - angle;
			loc.x = Math.cos(angle) * length;
			loc.y = -Math.sin(angle) * length;
		}

		return(loc);
	};
}
function nodes($nodes){
	this.elements = $nodes;
	this.listenTo = null;
	this.min = {'x':null,'y':null};
	this.max = {'x':null,'y':null};
	
	this.analyze = function() {
		for(var prop in this.elements){
			if(this.min.x === null){
				this.min.x = this.elements[prop].x;
				this.min.y = this.elements[prop].y;
				this.max.x = this.elements[prop].x;
				this.max.y = this.elements[prop].y;
			} else {
				if(this.min.x > this.elements[prop].x)
					this.min.x = this.elements[prop].x;
				if(this.min.y > this.elements[prop].y)
					this.min.y = this.elements[prop].y;
				if(this.max.x < this.elements[prop].x)
					this.max.x = this.elements[prop].x;
				if(this.max.y < this.elements[prop].y)
					this.max.y = this.elements[prop].y;
			}
		}
		
		return(this);
	};
}
function edges($edges){
	this.elements = $edges;
	
	this.analyze = function(){
		// Grundwerte für die einzelnen Nodes berechnen
		for(prop in this.elements){
			this.elements[prop].direction = 1;
			this.elements[prop].hasObjects = false;
			this.elements[prop].speed = {
				'values' : {},
				'objects' : 0
			};
			this.elements[prop].freeAtTick = 0;
			this.elements[prop].nextNumber = 1;
			this.elements[prop].IDByNumber = {};
			
			// Zuordnen der Nachbarn
			if(typeof XC.nodes.elements[this.elements[prop].a].linkTo === 'undefined'){
				XC.nodes.elements[this.elements[prop].a].linkTo = {};
				XC.nodes.elements[this.elements[prop].a].headingTo = {};
				XC.nodes.elements[this.elements[prop].a].leavingFrom = {};
				XC.nodes.elements[this.elements[prop].a].sittingOn = {
					'status' : false,
					'values' : {}
				};
				XC.nodes.elements[this.elements[prop].a].type = 'gate';
				XC.nodes.gates[this.elements[prop].a] = {
					'status' : 1,
					'maxType' : 4,
					'maxSpeed' : 0,
					'typ':XC.nodes.elements[this.elements[prop].a].typ
				};
			}
			if(typeof XC.nodes.elements[this.elements[prop].b].linkTo === 'undefined'){
				XC.nodes.elements[this.elements[prop].b].linkTo = {};
				XC.nodes.elements[this.elements[prop].b].headingTo = {};
				XC.nodes.elements[this.elements[prop].b].leavingFrom = {};
				XC.nodes.elements[this.elements[prop].b].sittingOn = {
					'status' : false,
					'values' : {}
				};
				XC.nodes.elements[this.elements[prop].b].type = 'gate';
				XC.nodes.gates[this.elements[prop].b] = {
					'status' : 1,
					'maxType' : 4,
					'maxSpeed' : 0,
					'typ':XC.nodes.elements[this.elements[prop].b].typ
				};
			}
			
			var x1 = XC.nodes.elements[this.elements[prop].a].x;
			var y1 = XC.nodes.elements[this.elements[prop].a].y;
			var x2 = XC.nodes.elements[this.elements[prop].b].x;
			var y2 = XC.nodes.elements[this.elements[prop].b].y;
			
			var $length = Math.beeLineDistance(x1,y1,x2,y2);
			var $angle  = Math.angle(x1,y1,x2,y2);
			var $angle2 = $angle;
			
			if($angle + Math.PI >= 2 * Math.PI)
				$angle2 -= Math.PI;
			else
				$angle2 += Math.PI;
			
			if(typeof XC.nodes.elements[this.elements[prop].a].linkTo[this.elements[prop].b] === 'undefined'){
				XC.nodes.elements[this.elements[prop].a].linkTo[this.elements[prop].b] = {
					'length' : $length,
					'angle' : $angle,
					'degree' : $angle * 360 / (2 * Math.PI),
					'edge' : prop,
					'edgeStopp' : { 
						'length' : 0,
						'x' : 0,
						'y' : 0
					},
					'hard' : {},
					'soft' : {
						'objects' : 0
					}
				};
			}
			if(typeof XC.nodes.elements[this.elements[prop].b].linkTo[this.elements[prop].a] === 'undefined'){
				XC.nodes.elements[this.elements[prop].b].linkTo[this.elements[prop].a] = {
					'length' : $length,
					'angle' : $angle2,
					'degree' : $angle2 * 360 / (2 * Math.PI),
					'edge' : prop,
					'edgeStopp' : {
						'length' : 0,
						'x' : 0,
						'y' : 0
					},
					'hard' : {},
					'soft' : {'objects' : 0}
				};
			}
			
			if(Object.keys(XC.nodes.elements[this.elements[prop].a].linkTo).length > 1 && XC.nodes.elements[this.elements[prop].a].type == 'gate'){
				XC.nodes.elements[this.elements[prop].a].type = 'normal';
				delete XC.nodes.gates[this.elements[prop].a];
			}
			if(Object.keys(XC.nodes.elements[this.elements[prop].b].linkTo).length > 1 && XC.nodes.elements[this.elements[prop].b].type == 'gate'){
				XC.nodes.elements[this.elements[prop].b].type = 'normal';
				delete XC.nodes.gates[this.elements[prop].b];
			}
		}
	};
}

function AStern(){
	this.start = null;
	this.stopp = null;
	this.lastPath = {};
	
	this.path = {};
	this.nodeList = {};
	this.openNodeList = {};
	
	this.checkContraFlow = false;
	
	this.hardOnes = [];
	
	this.from = function($obj){
		this.start = $obj;
		return(this);
	};
	
	this.to = function($obj){
		this.stopp = $obj;
		return(this);
	};
	
	this.findRouteWithoutHardOnes = function(){
		this.checkContraFlow = true;
		this.findRouteAlg();
	};
	
	this.findRoute = function(){
		this.checkContraFlow = false;
		this.findRouteAlg();
	};
	
	this.findRouteAlg = function(){
		var speed = 10, pathSpeed = 9;
		this.hardOnes = [];
		this.path = {};
		this.nodeList = {};
		this.nodeList[this.start] = {
			'path' : [],
			'timeCost' : 0,
			'speed' : speed
		};
		
		var go = true, i = 0, xStart = 0, x1 = 0, yStart = 0, y1 = 0, xDest = 0, yDest = 0;
		var dista = 0, distaDest = 0, newDista = 0, estCost = null, nextNode = null, aNeighbour = null, newPath = [];
		var time = 0, timeDest = 0, newTime = 0;
		
		xDest = XC.nodes.elements[this.stopp].x;
		yDest = XC.nodes.elements[this.stopp].y;

		xStart = XC.nodes.elements[this.start].x;
		yStart = XC.nodes.elements[this.start].y;
		
		distaDest = Math.beeLineDistance(xDest,yDest,xStart,yStart);
		this.openNodeList[this.start] = {
			'estDistanceToDestination' : distaDest, 
			'estSpeed' : speed,
			'estTimeCost' : distaDest / speed,
			'path' : [],
			'realTimeCostToStart' : 0,
			'realDistanceToStart' : 0,
			'status' : 1
		};
		
		while(go && i < 20000){
			// kürzeste Kante in OpenNode finden
			estCost = null; 

			for(var prop in this.openNodeList){
				if(this.openNodeList[prop].status == 1 && (estCost === null || this.openNodeList[prop].estTimeCost < estCost)){
					nextNode = prop;
					estCost = this.openNodeList[prop].estTimeCost;
				}
			}
			// kürzester Knoten in nextNode zugewiesen
			
			// Wenn estCost null gibt es keine Route
			if(estCost === null){
				go = false;
				this.openNodeList[this.stopp] = {'path' : null};
				break;
			}
			
			// Setze die x / y Werte des Vorgängerknoten
			x1 = XC.nodes.elements[nextNode].x;
			y1 = XC.nodes.elements[nextNode].y;
			/*
			if(this.start == 'tG27'){
				console.log(nextNode);
				console.log(this.openNodeList);
			}*/
			// Loop durch die Nachbarn des neuen Knoten
			for(var prop in XC.nodes.elements[nextNode].linkTo){
				// Wenn Harte Kanten nicht ignoriert werden sollen
					if(this.checkContraFlow){
						// Prüfe ob Kante in die Richtung befahrbar ist
							if(Object.keys(XC.nodes.elements[prop].linkTo[nextNode].hard).length > 0){
								// Wenn ein Object in gegenrichtung drauf fährt, dann gibt es keine freie Route
									var objs = [];
									for(var frt in XC.nodes.elements[prop].linkTo[nextNode].hard){
										objs.push(frt);
									}
									this.hardOnes.push([prop,nextNode,objs]);
									continue;
							}
					}
					console.log('nachbarn von '+nextNode+' -> '+prop);
				// Wenn Knoten noch undefinert in der openNodeList ist
				if(typeof this.openNodeList[prop] === 'undefined'){
					// Lege x / y Werte für Knoten fest
					x2 = XC.nodes.elements[prop].x;
					y2 = XC.nodes.elements[prop].y;
					
					// Berechne KantenLänge
					dista = Math.beeLineDistance(x1,y1,x2,y2);
					time = dista / speed; // !!! WICHTIG -> hier später die Geschwindigkeit der Staukante einfügen !!!
					
					// Berechne LuftEntfernung von diesem Knoten zum Ziuel
					distaDest = Math.beeLineDistance(xDest,yDest,x2,y2);
					timeDest = distaDest / speed;
					
					newDista = this.openNodeList[nextNode].realDistanceToStart + distaDest + dista;
					newTime = this.openNodeList[nextNode].realTimeCostToStart + timeDest + time;
					
					// Lese Pfad aus
					newPath = [].concat(this.openNodeList[nextNode].path);
					newPath.push(nextNode);
					
					// Weiße alles dem neuen Objekt zu
					this.openNodeList[prop] = {
						'estDistanceToDestination' : newDista,
						'estSpeed' : speed,
						'estTimeCost' : newTime,
						'path' : newPath,
						'realTimeCostToStart' : this.openNodeList[nextNode].realTimeCostToStart + time,
						'realDistanceToStart' : this.openNodeList[nextNode].realDistanceToStart + dista,
						'status' : 1
					};
				} else {
					// Schaue ob der neu gefundene Weg kürzer ist dort hin zu kommen
					
					// Wenn Status  === 0 --> Break
					if(this.openNodeList[nextNode].status === 0)
						continue;
						
					// Lege x / y Werte für Knoten fest
					x2 = XC.nodes.elements[prop].x;
					y2 = XC.nodes.elements[prop].y;
					
					dista = Math.beeLineDistance(x1,y1,x2,y2);
					time = dista / speed; // !!! WICHTIG -> hier später die Geschwindigkeit der Staukante einfügen !!!
					
					if(this.openNodeList[nextNode].realTimeCostToStart + time < this.openNodeList[prop].realTimeCostToStart){
						// Berechne LuftEntfernung von diesem Knoten zum Ziuel
						distaDest = Math.beeLineDistance(xDest,yDest,x2,y2);
						timeDest = distaDest / speed;
						
						newDista = this.openNodeList[nextNode].realDistanceToStart + distaDest + dista;
						newTime = this.openNodeList[nextNode].realTimeCostToStart + timeDest + time;
						
						// Lese Pfad aus
						newPath = [].concat(this.openNodeList[nextNode].path);
						newPath.push(nextNode);
						
						// Weiße alles dem neuen Objekt zu
						this.openNodeList[prop] = {
							'estDistanceToDestination' : newDista,
							'estSpeed' : speed,
							'estTimeCost' : newTime,
							'path' : newPath,
							'realTimeCostToStart' : this.openNodeList[nextNode].realTimeCostToStart + time,
							'realDistanceToStart' : this.openNodeList[nextNode].realDistanceToStart + dista,
							'status' : 1
						};
					}
				}
			}
			
			// Knoten aus der openNodeListe löschen
			
			this.openNodeList[nextNode].status = 0;
			/*
			* Block wenn nächster Knoten === ZielKnoten 
			*
			*/
			
			if(nextNode == this.stopp){
				go = false;				
				this.openNodeList[this.stopp].path.push(this.stopp);
				break;
			}
			i++;
		}
	};
}

function simulation(){
	this.timePerTick = 1;
	this.waitBetweenTick = 2;
	this.lengthFaktor = 250; // 1 kartesische Einheit = 250m
	this.lengthInPixelFaktor = 0; // Wieviele Pixel sind ein 1m
	
	this.play = true;
	this.counter = 0;
	this.timeElapsed = 0;
	
	this.box = null;
	this.planes = null;
	
	this.simSpeed = 500; // 500ms je Loop
	
	this.surfaceField = {
		'status' : false,
		'type' : null,
		'ID' : null
	};
	this.planeField = {
		'status' : false,
		'type' : null,
		'ID' : null
	};
	
	this.simDuration = 90000;
	this.plotRoutes = true;
	
	
	this.init = function(){
		// nachfolgend in --> px / kart.Einheit
		this.lengthInPixelFaktor = XC.canvasBox.width / XC.canvasBox.dimX; // Weite der Canvas-box / Abbild der kartesichen einheiten in Box (dimX)
		
		this.calculateNodeStoppPoints();
		
		this.planes = new planeList();
	};
	
	this.calculateNodeStoppPoints = function(){
		// Stoppmarken für den einzelnen Node berechen
		for(prop in XC.nodes.elements){						
			var from = XC.nodes.elements[prop];
			// From.LinkTo iterieren, um von einzelnen edges länge zu bestimmen
			var actOne = null;
			var angleDiff = 0;
			var length = 0;
			var tempPoint = {};

			if(Object.keys(from.linkTo).length == 1){
				// Wenn das "Gate" nur einen Link besitzt, setze maximal mögliches bis l,1
				
				for(var edg in from.linkTo){
					from.linkTo[edg].edgeStopp.length = 0;
					from.linkTo[edg].edgeStopp.x = XC.nodes.elements[prop].x;
					from.linkTo[edg].edgeStopp.y = XC.nodes.elements[prop].y;
				}
			} else {
				for(var edg in from.linkTo){
					// Setze diese Kante als aktuell, und schaue bei allen anderen nach StoppLänge
					actOne = {
						'name' : edg,
						'angle' : from.linkTo[edg].angle // Richtungswinkel Kante
						}; 
					// loop durch restlichen kanten
					for(var secEdg in from.linkTo){
						if(secEdg == edg)
							continue; // vermeidet doppelberechnung

						angleDiff = Math.abs(actOne.angle - from.linkTo[secEdg].angle);
						
						if(angleDiff > Math.PI)
							angleDiff = 2 * Math.PI - angleDiff;
	
						if(angleDiff < Math.PI * 0.5)
							length = 60 / Math.tan(angleDiff/2); 
						else 
							length = 60; // Set 52m als 0.5 -> An-225 Mriya -> 0.6*85m + 1
							
						length = length / this.lengthFaktor; // 45 / 250 === 0.18 in kart. Einheiten	
							
						if(length > from.linkTo[edg].length){
							// Setze StoppPunkt auf Knotenpunkt der Kante
							from.linkTo[edg].edgeStopp.length = -1;
							from.linkTo[edg].edgeStopp.x = XC.nodes.elements[edg].x;
							from.linkTo[edg].edgeStopp.y = XC.nodes.elements[edg].y;
						} else if(from.linkTo[edg].edgeStopp.length == -1){
							// null
						} else if(length > from.linkTo[edg].edgeStopp.length){
							from.linkTo[edg].edgeStopp.length = length;
							tempPoint = Math.getNewPointByAngle(XC.nodes.elements[prop].x,XC.nodes.elements[prop].y,actOne.angle,length);
							from.linkTo[edg].edgeStopp.x = tempPoint.x;
							from.linkTo[edg].edgeStopp.y = tempPoint.y;
						}
					}
				}
			}
		}
	};
	
	this.start = function(){
		this.init();
		
		this.box = window.setInterval(loopThroughSimObjects,this.simSpeed);
	};

	this.reStart = function(){
		this.simSpeed = this.inNextTickNewSpeed;	
		this.box = window.setInterval(loopThroughSimObjects,this.simSpeed);
	};

	this.stoppLoop = function(){
		if(!this.play || this.counter > this.simDuration){
			window.clearInterval(this.box);
			
			return(true);
		}
		return(false);
	};
	
	this.forceReStart = function(){
		this.setNextLoopSpeed();
	};
	
	this.changeLoopSpeed = function(i){
		this.inNextTickNewSpeed = i * 1000;
		if(this.simSpeed > 3000){
			this.onNextTickBreak = false;
			this.forceReStart();
		} else {
			this.onNextTickBreak = true;
		}
	};
	
	this.setNextLoopSpeed = function(){
		window.clearInterval(this.box);
		this.reStart();
	};
	
	this.writeSurfaceInfo = function(){
		if(this.surfaceField.type == 'node'){
			if(XC.nodes.elements[this.surfaceField.ID].sittingOn.status)
				$('#sittingOn span').text('belegt');
			else
				$('#sittingOn span').text('frei');
		}
	};
	
	this.loop = function(){
		if(this.stoppLoop())
			return;
			
		// Vielleicht Plane erzeugen
		this.planes.mayNewOne();
		
		// Bewege Flugzeuge
		this.planes.move();
		
		// Zeichne Routen
		if(this.plotRoutes){
			XC.canvasRoute.plotRoutes();
		}
		
		// Zeichne Sachen ins Surface-Feld
		if(this.surfaceField.status){
			this.writeSurfaceInfo();
		}
		
		if(this.planeField.status){
			this.writePlaneInfo();
		}	
		// Zeichne Zeit in Infofield
		this.printTime();
		
		// für debug... gebe alle Knoten und deren zustand aus
		$('#allNodes').html(this.printAll(XC.nodes));
			
		this.counter++;
		this.timeElapsed += this.timePerTick;
		
		if(this.onNextTickBreak){
			this.setNextLoopSpeed();
			this.onNextTickBreak = false;
		}
	};

	this.printAll = function(obj){
		var text = '';
		if(typeof obj === 'function')
			return(text);
			
		if(typeof obj === 'object'){
			text += '<ul>';
			for(var prop in obj){
				if(typeof obj[prop] === 'function')
					continue;
					
				text += '<li>';
				if(typeof obj[prop] === 'object')
					text += '<span class="bold">'+prop+'</span>' + this.printAll(obj[prop]);
				else
					text += '<span class="italic">'+prop+':</span>'+obj[prop];
				text += '</li>';
			}
			text += '</ul>';
		} else {
			text += '<li>'+obj+'</li>';			
		}
		return(text);
	};

	this.writePlaneInfo = function(){
		var plane = this.planes.planeArray[this.planeField.ID - 1];
		var subText = '';
		
		$('#planeName span').text('Plane '+plane.name);
		
		if(plane.moving == 1)
			subText = 'rollin';
		else {
			if(plane.waitingForFreeCrossing){
				subText = 'waiting - cross';
			} else if(plane.waitingForPrePlane){
				subText = 'waiting - other plane';
			} else if(plane.nextTickMayBeRolling)
				subText = 'waiting to accelerate';
			else if(plane.waitingForFreeRoute)
				subText = 'waiting to get new route';
			else
				subText = 'waiting - don\' know why ...';
		}
		$('#planeStatus span').text(subText);
		
		$('#planeSpeed span').text(plane.speed);
		$('#planeHeading span').text(plane.nextNode+' - '+plane.nextRouteNode);
		$('#planeType span').text(plane.typeName);
		$('#planeRoute span').text(plane.route);
		$('#planeRoute2 span').text(plane.myWay);
	};

	this.printTime = function(){
		var sec = 0, min = 0, h = 0;
		var fTime = this.timeElapsed;
		
		h = parseInt(fTime / 3600);
		fTime = fTime - h * 3600;
		
		min = parseInt(fTime / 60);
		fTime = fTime - min * 60;
		
		sec = fTime;
		
		if(h < 10)
			h = '0' + h;
		if(min < 10)
			min = '0' + min;
		if(sec < 10)
			sec = '0' + sec;
		
		$('#theTime').text(h+':'+min+':'+sec);
		
	};
}

function Plane(){
	this.ID = null;
	this.name = 'abc';
	this.typ = 0;
	this.span = 40;
	this.length = 45;
	this.kartLength = this.length / XC.simulation[0].lengthFaktor;
	this.cockpitPixelFix = 0;
	this.color = '0,0,0';
	
	this.off = false;
	this.offTick = 0;
	this.away = false;
	
	this.start = null;
	this.location = null;
	this.headingRad = null;
	this.headingDeg = null;
	this.destination = null;
	
	this.status = 0;
	this.moving = 0;
	
	this.residualRoute = null;
	this.route = null;
	this.plotted = 0;
	this.maxSpeed = 10;
	
	this.lastNode = '';
	this.nextNode = '';
	this.nextNextNode = '';
	
	this.nextRouteNode = '';
	this.lastRouteNode = '';
	this.lastWay = {
		'from' : null, 'to' : null	
	};

	this.lastEdge = '';
	this.edge = '';
	this.nextEdge = '';
	
	this.routeNodeInt = 1;
	this.logOffTriggerCoord = {
		'x':null,'y':null
	};
	
	this.nextTriggerCoord = {
		'x':0,'y':0
	};
	this.safetyZone = {
		'x':0,'y':0
	};
	this.lastSafetyZone = {
		'x':0,'y':0
	};
	
	this.speed = 0;
	this.pixel = 0; // Breite des Lfz in Pixel
	
	this.penalty = 0;
	
	this.logOffStartNode = true;
	
	this.waitingForFreeCrossing = false;
	this.waitingForPrePlane = false;
	this.myPositionOnHardEdge = 0;
	
	this.pic = 'default.jpg';
	this.svg = '';
	
	this.myWay = [];
	
	this.nextWayPoint = {
		'x':0,'y':0, 'set': false, 'length' : 0
	};
	
	this.checkHardEdges = function(start){
		var isStart = true;
		if(typeof start === 'undefined'){
			start = this.nextRouteNode;
			isStart = false;
		}

		// Prüfe ob freier GesamtWeg existiert
		var route = new AStern();
			route.from(start);
			route.to(this.destination);
			route.findRouteWithoutHardOnes();
			
		var	hardPath = route.openNodeList[this.destination].path; 

		// Wenn kein neuer Pfad gefunden, behalte alten Pfad und warte
			if(hardPath === null){
				this.waitingForFreeRoute = true;
				// nächstes Lfz
				if(this.status == 0);
					//console.log(route.hardOnes);

				this.hardOnes = route.hardOnes;
				
				//console.log(this.ID);
				//console.log(route.hardOnes);
				// Wenn man nicht am Gate steht
				if(this.status == 1){
					// Prüfe die Routen der Lfz, die eine Harte Kante auf der eigenen haben
					
					// 1. Erstelle Object mit Kanten der aktuellen Route seiner selbst
						var checkRoute = {};
						
						for(var i = 1; i < this.residualRoute.length; i++){
							checkRoute[this.residualRoute[i-1]+'_'+this.residualRoute[i]] = 0;
						}
					
					// 2.Loop durch die harten Kante
						for(var i = 0; i < this.hardOnes.length; i++){
							// Wenn eine Harte Kante mit der Route des Lfz übereinstimmt
							if(typeof checkRoute[this.hardOnes[i][1]+'_'+this.hardOnes[i][0]] !== 'undefined'){
								
								// erstelle CheckObjkt des entgegenkommenden Lfz
									var checkRouteEn = {};
									
									var checkPlane = XC.simulation[0].planes.planeArray[this.hardOnes[i][2][0]-1];
									if(typeof checkPlane.residualRoute === 'undefined')
										console.log(this.hardOnes[i][2][0]);
									for(var j = 1; j < checkPlane.residualRoute.length; j++){
										checkRouteEn[checkPlane.residualRoute[j]+'_'+checkPlane.residualRoute[j-1]] = 0;
									}
								
								// Prüfe erste gemeinsame Kante der beiden Routen
									// iteriere dafür über eigene route
										for(var vp in checkRoute){
											
											// Wenn es diese Kante auch im anderen Lfz gibt, dann erste gmeinsame Kante gefunden
											if(typeof checkRouteEn[vp] !== 'undefined'){
												//console.log('erste: '+vp+' von '+this.hardOnes[i][2][0]);
												break;
											}						
										}
							}
						}
					
					//console.log(checkRoute);
				}
				
				return(false);
			}
			
			// leere alte Routen (weich)
				if(!isStart){
					this.deleteSoftEdges();
				} 
					
			// Weiße neuen Pfad zu
				this.route = [].concat(hardPath);
				this.newRoute();
				this.residualRoute = [];
				for(var i = 1; i < this.route.length; i++){
					this.residualRoute.push(this.route[i]);
				}
				
			
			// Setze komplette Route weich
				this.setSoftEdges();

			this.waitingForFreeRoute = false;

			return(true);
	};
	
	this.doCrossingStuff = function(){

			this.lastWay.from = this.lastRouteNode;
			this.lastWay.to = this.nextRouteNode;

		// Nun den Routenzähler erhöhen
			this.routeNodeInt++;
		
		// da Weg weiter frei ist, lege neuen Trigger fest
			this.setNewRouteNodes();
			this.setNewTrigger();
			
		// gib gummi
			this.moving = 1;
		
		// setze selber kreuzung blockiert
			XC.nodes.elements[this.nextNode].sittingOn.status = true;
			XC.nodes.elements[this.nextNode].sittingOn.values[this.ID] = {
				'destination' : this.destination, 
				'nextRouteNode' : this.nextRouteNode,
				'status' : 1
			};
		
		// entferne Flugzeugobjekt von dieser Kante
			this.deleteHardEdge();
		
		// setze flugzeug auf nächste Kante
			this.setHardEdge();
			
		// lösche flugzeug aus soft-Liste für kante
			this.deleteSoftEdge();
		
		// ändere den status, das Lfz an Kreuzung wartet
			this.waitingForFreeCrossing = false;
	};
	
	this.setNewRouteNodes = function(){
		this.lastRouteNode = this.nextRouteNode;
		this.nextRouteNode = this.route[this.routeNodeInt];
	};
	
	this.leavePlot = function(){
		if (document.getElementById('wrapDivPlane_'+this.ID)) {
			var plot = document.getElementById("divPlanes");
			var remove = document.getElementById('wrapDivPlane_'+this.ID);
				plot.removeChild(remove);
		}
		XC.nodes.gates[this.start].status = 1;
		this.status = 0;
	};
	
	this.setLogOffTrigger = function(){
		if(this.logOffTriggerCoord.x == XC.nodes.elements[this.lastRouteNode].linkTo[this.nextRouteNode].edgeStopp.x){
			this.logOffTriggerCoord.x = XC.nodes.elements[this.nextRouteNode].x;
			this.logOffTriggerCoord.y = XC.nodes.elements[this.nextRouteNode].y;
		} else {
			this.logOffTriggerCoord.x = XC.nodes.elements[this.lastRouteNode].linkTo[this.nextRouteNode].edgeStopp.x;
			this.logOffTriggerCoord.y = XC.nodes.elements[this.lastRouteNode].linkTo[this.nextRouteNode].edgeStopp.y;
		}
		this.nextWayPoint = {
			'x':this.logOffTriggerCoord.x,'y':this.logOffTriggerCoord.y, 'set': true, 'length': Math.beeLineDistance(this.logOffTriggerCoord.x,this.logOffTriggerCoord.y,this.location.x,this.location.y)
		};
	};
	
	this.setNewHeadingNodes = function(){
		this.lastNode = this.nextNode;
		this.nextNode = this.nextRouteNode;
		
		if(typeof this.route[this.routeNodeInt+1] !== 'undefined')
			this.nextNextNode = this.route[this.routeNodeInt+1];
		else
			this.nextNextNode = null;
		
		this.setNewHeading();
		
		this.residualRoute = [];
		
		for(var i = this.routeNodeInt; i < this.route.length;i++){
			this.residualRoute.push(this.route[i]);
		}
	};
	
	this.setNodeOffTrigger = function(){	
		this.nextWayPoint = {
			'x':XC.nodes.elements[this.lastRouteNode].linkTo[this.nextRouteNode].edgeStopp.x,
			'y':XC.nodes.elements[this.lastRouteNode].linkTo[this.nextRouteNode].edgeStopp.y, 
			'set': true, 
			'length': 0
		};
		
		this.logOffTriggerCoord.x = this.nextWayPoint.x;
		this.logOffTriggerCoord.y = this.nextWayPoint.y;
		
		this.nextWayPoint.length = Math.beeLineDistance(this.nextWayPoint.x,this.nextWayPoint.y,this.location.x,this.location.y);
	};
	
	this.setNewHeading = function(){
		this.headingRad = XC.nodes.elements[this.lastNode].linkTo[this.nextNode].angle;
		this.headingDeg = XC.nodes.elements[this.lastNode].linkTo[this.nextNode].degree;

		if(this.logOffTriggerCoord.x === null){
			this.logOffTriggerCoord.x = XC.nodes.elements[this.nextRouteNode].x;
			this.logOffTriggerCoord.y = XC.nodes.elements[this.nextRouteNode].y;
		}
	};
	
	this.setNewTrigger = function(){		
		this.nextTriggerCoord.x = XC.nodes.elements[this.nextRouteNode].linkTo[this.lastRouteNode].edgeStopp.x;
		this.nextTriggerCoord.y = XC.nodes.elements[this.nextRouteNode].linkTo[this.lastRouteNode].edgeStopp.y;
	};
	
	this.setNewLogOffTrigger = function(){
		this.nextWayPoint = {
			'x':XC.nodes.elements[this.lastRouteNode].linkTo[this.nextRouteNode].edgeStopp.x,
			'y':XC.nodes.elements[this.lastRouteNode].linkTo[this.nextRouteNode].edgeStopp.x, 
			'set': true, 
			'length': 0
		};
		this.nextWayPoint.length = Math.beeLineDistance(this.nextWayPoint.x,this.nextWayPoint.y,this.location.x,this.location.y);
	};
	
	this.accelerate = function(real){
		if(this.speed < this.maxSpeed){
			this.raiseSpeed(real);
		} else if(this.speed > this.maxSpeed)
			this.speed = this.maxSpeed;
	};
	
	this.getLengthInPixel = function(){
		var faktorPix = XC.simulation[0].lengthInPixelFaktor; // 1 kart. Einheit in Pixel
		var faktorLen = XC.simulation[0].lengthFaktor; // 1 kart. Einheit in meter === Standard 250m
		
		var planePixel = this.length / faktorLen; // Länge des Lfz in kart. Einheiten
			planePixel *= faktorPix;	// Länge nun auf Pixel berechnet
		
		this.pixel = planePixel;	
		
		return(planePixel);
	};
	
	this.addPenalty = function($int){
		this.penalty = XC.simulation[0].counter + $int;
	};
	
	this.deleteSoftEdge = function(){
		delete XC.nodes.elements[this.lastRouteNode].linkTo[this.nextRouteNode].soft[this.ID];
		XC.nodes.elements[this.lastRouteNode].linkTo[this.nextRouteNode].soft.objects--;
	};
	
	this.deleteHardEdge = function(){
		delete XC.nodes.elements[this.lastWay.from].linkTo[this.lastWay.to].hard[this.ID];
		delete XC.edges.elements[XC.nodes.elements[this.lastWay.from].linkTo[this.lastWay.to].edge].speed.values[this.ID];
		delete XC.edges.elements[XC.nodes.elements[this.lastWay.from].linkTo[this.lastWay.to].edge].IDByNumber[this.myPositionOnHardEdge];
		
		XC.edges.elements[XC.nodes.elements[this.lastWay.from].linkTo[this.lastWay.to].edge].speed.objects--;
		
		// setze, wenn möglich, kante leer
			if(XC.edges.elements[XC.nodes.elements[this.lastWay.from].linkTo[this.lastWay.to].edge].objects == 0)
				XC.edges.elements[XC.nodes.elements[this.lastWay.from].linkTo[this.lastWay.to].edge].hasObjects = false;
			
	};
	
	this.logOffSystem = function(){
		var multi = 1;
		this.location.x = XC.nodes.elements[this.destination].x;
		this.location.y = XC.nodes.elements[this.destination].y;
		
		this.roll();
		
		this.moving = 0;
		
		if(XC.nodes.elements[this.destination].typ == 2){
			// Bedienfeld, da kann man nicht einfach weg
			this.status = 1;
			multi = 13;
		} else
			this.status = 0;
		
		this.off = true;
		this.offTick = XC.simulation[0].counter + 10 + parseInt(Math.random() * 30)*multi;
		
		this.deleteHardEdge();
		this.deleteSoftEdge();
		
		this.blink();
	};
	
	this.blink = function(){
		$('#plane_'+this.ID).fadeOut(500);
    	$('#plane_'+this.ID).fadeIn(500);
	};
	
	this.roll = function(){
		nX = XC.canvasNodes.getPixelX(this.location.x);
		nY = XC.canvasNodes.getPixelY(this.location.y);
		
		$('#wrapDivPlane_'+this.ID).css('left',nX - 0.5*(this.pixel));
		$('#wrapDivPlane_'+this.ID).css('top',nY - 0.5*(this.pixel));
	};
	
	this.hasHardEdges = function(){
		var from = null;
		var to = null;

		for(var prop in this.route){
			if(from === null){
				from = this.route[prop];
				continue;
			}
			
			to = this.route[prop];
			if(Object.keys(XC.nodes.elements[to].linkTo[from].hard).length > 0){
				return(true);
			}
			from = to;	
		}
		
		return(false);
	};
	
	this.deleteSoftEdges = function(){
		var from = null;
		var to = null;
		var i = 1;
		for(var prop in this.route){
			if(from === null){
				from = this.route[prop];
				continue;
			}
			
			to = this.route[prop];
			
			if(typeof XC.nodes.elements[from].linkTo[to].soft[this.ID] !== 'undefined'){
				delete XC.nodes.elements[from].linkTo[to].soft[this.ID];
				XC.nodes.elements[from].linkTo[to].soft.objects--;
			}

			i++;
			from = to;
		}
	};
	
	this.setSoftEdges = function(){
		var from = null;
		var to = null;
		var i = 1;
		for(var prop in this.route){
			if(from === null){
				from = this.route[prop];
				continue;
			}
			
			to = this.route[prop];

			XC.nodes.elements[from].linkTo[to].soft[this.ID] = {'segment':i};
			XC.nodes.elements[from].linkTo[to].soft.objects++;

			i++;
			from = to;
		}
	};
	
	this.setNewWorkingLevels = function(){
		var edge = XC.nodes.elements[this.lastRouteNode].linkTo[this.nextRouteNode].edge;
		
		XC.edges.elements[edge].speed.values[this.ID].speed = this.speed;
		XC.edges.elements[edge].speed.values[this.ID].xBlock = this.safetyZone.x;
		XC.edges.elements[edge].speed.values[this.ID].yBlock = this.safetyZone.y;
	};
	
	this.hasPrePlane = function(){
		var edge = XC.nodes.elements[this.lastRouteNode].linkTo[this.nextRouteNode].edge;
		if(typeof XC.edges.elements[edge].IDByNumber[XC.edges.elements[edge].nextNumber-1] === 'undefined')
			return(false);
		else
			return(true);
	};
	
	this.getPrePlaneX = function(){
		var edge = XC.nodes.elements[this.lastRouteNode].linkTo[this.nextRouteNode].edge;
		var ID = XC.edges.elements[edge].IDByNumber[XC.edges.elements[edge].nextNumber-1];
		
		return(XC.edges.elements[edge].speed.values[ID].xBlock);
	};
	
	this.getPrePlaneY = function(){
		var edge = XC.nodes.elements[this.lastRouteNode].linkTo[this.nextRouteNode].edge;
		var ID = XC.edges.elements[edge].IDByNumber[XC.edges.elements[edge].nextNumber-1];
		
		return(XC.edges.elements[edge].speed.values[ID].yBlock);
	};
	
	this.setHardEdge = function(){
		this.myWay.push(this.lastRouteNode);
		var edge = XC.nodes.elements[this.lastRouteNode].linkTo[this.nextRouteNode].edge;
		
		XC.nodes.elements[this.lastRouteNode].linkTo[this.nextRouteNode].hard[this.ID] = {'speed':this.speed,'headingTo':this.nextRouteNode};
		
		XC.edges.elements[edge].hasObjects = true;
		XC.edges.elements[edge].speed.objects++;
		XC.edges.elements[edge].speed.values[this.ID] = {
			'speed' : this.speed,
			'xBlock' : this.location.x,
			'yBlock' : this.location.y
		};
		
		if(XC.edges.elements[edge].a == this.lastNode)
			XC.edges.elements[edge].direction = 1;
		else
			XC.edges.elements[edge].direction = -1;
	
		this.myPositionOnHardEdge = XC.edges.elements[edge].nextNumber;
		XC.edges.elements[edge].IDByNumber[XC.edges.elements[edge].nextNumber] = this.ID;
		XC.edges.elements[edge].nextNumber++;
		
		// free @ tick ~ 4D-Trajektorie	
	};
	
	this.setAktiv = function(){
		this.status = 1;
		this.moving = 1;
	};
	
	this.getHeading = function(){
		var start = {'x':XC.nodes.elements[this.route[this.nextRouteNode-1]].x,'y':XC.nodes.elements[this.route[this.nextRouteNode-1]].y};
		var dest  = {'x':XC.nodes.elements[this.route[this.nextRouteNode]].x,  'y':XC.nodes.elements[this.route[this.nextRouteNode]].y};
		var delta = {'x':dest.x - start.x,'y':start.y - dest.y};
		
		var tan = Math.atan(delta.x / delta.y);
			if(delta.x >= 0 && delta.y < 0)
				tan += Math.PI;
			else if(delta.x < 0 && delta.y < 0)
				tan += 1.5 * Math.PI;
			else if(delta.x < 0 && delta.y > 0)
				tan += 2 * Math.PI;
		
		var grad = 360 * tan / 2 / Math.PI;		
			
			return(grad);
	};
	
	this.raiseSpeed = function($int){
		this.speed += $int;
		if(this.speed > this.maxSpeed)
			this.speed = this.maxSpeed;
		
		XC.nodes.elements[this.lastRouteNode].linkTo[this.nextRouteNode].hard[this.ID].speed = this.speed;
		XC.edges.elements[XC.nodes.elements[this.lastNode].linkTo[this.nextNode].edge].speed.values[this.ID] = this.speed;
	};
	
	this.newRoute = function(){
		this.routeNodeInt = 1;
		this.residualRoute = [];
							
		for(var i = 2; i < this.route.length; i++){	
			this.residualRoute.push(this.route[i]);
		}
		
		if(this.lastNode !== ''){
			this.route = [this.lastNode].concat(this.route);
			
			this.nextRouteNode = this.route[this.routeNodeInt];
			this.lastRouteNode = this.lastNode;
		} else{
			this.lastRouteNode = this.route[0];
			this.nextRouteNode = this.route[1];
			this.lastNode = this.route[0];
			this.nextNode = this.route[1];
			
			if(typeof this.route[2] !== 'undefined')
				this.nextNextNode = this.route[2];
			else
				this.nextNextNode = null;
		}
	};
	
	this.reCalcWorkingSpecs = function(){
		if(this.typ <= 20){ // DC 10
			this.length = 55;
			this.kartLength = this.length / XC.simulation[0].lengthFaktor;
			this.maxAccelerateRate = 2;
			this.maxSpeed = 20;
			this.span = 47;
			this.svg = 'DC10';
			this.typeName = 'DC 10';
		} else if(this.typ <= 40){ // A321-100
			this.length = 44;
			this.kartLength = this.length / XC.simulation[0].lengthFaktor;
			this.maxAccelerateRate = 3;
			this.maxSpeed = 25;
			this.span = 34;
			this.svg = 'A320';
			this.typeName = 'A321-100';
		} else if(this.typ <= 50){ // A340-300
			this.length = 63;
			this.kartLength = this.length / XC.simulation[0].lengthFaktor;
			this.maxAccelerateRate = 1.5;
			this.maxSpeed = 15;
			this.span = 60;
			this.svg = 'A380';
			this.typeName = 'A340-300';
		} else if(this.typ <= 65){ // A318-100
			this.length = 31;
			this.kartLength = this.length / XC.simulation[0].lengthFaktor;
			this.maxAccelerateRate = 2.2;
			this.maxSpeed = 22;
			this.span = 34;
			this.svg = 'A320';
			this.typeName = 'A318-100';
		} else if(this.typ <= 70){ // A380-800
			this.length = 72;
			this.kartLength = this.length / XC.simulation[0].lengthFaktor;
			this.maxAccelerateRate = 1.8;
			this.maxSpeed = 25;
			this.span = 80;
			this.svg = 'A380';
			this.typeName = 'A380-800';
		} else if(this.typ <= 80){ // Embraer Legacy 600
			this.length = 26;
			this.kartLength = this.length / XC.simulation[0].lengthFaktor;
			this.maxAccelerateRate = 2;
			this.maxSpeed = 20;
			this.span = 22;
			this.typeName = 'Embraer Legacy 600';
		} else if(this.typ <= 82){ // Antonow Mrija
			this.length = 84;
			this.kartLength = this.length / XC.simulation[0].lengthFaktor;
			this.maxAccelerateRate = 2;
			this.maxSpeed = 20;
			this.span = 88;
			this.svg = 'AN225';
			this.typeName = 'Antonow Mrija';
		} else if(this.typ <= 91){ // TU-155
			this.length = 48;
			this.kartLength = this.length / XC.simulation[0].lengthFaktor;
			this.maxAccelerateRate = 2;
			this.maxSpeed = 20;
			this.span = 38;
			this.typeName = 'TU-155';
		} else if(this.typ <= 100){ // Global 5000
			this.length = 28;
			this.kartLength = this.length / XC.simulation[0].lengthFaktor;
			this.maxAccelerateRate = 2;
			this.maxSpeed = 20;
			this.span = 28;
			this.typeName = 'Global 5000';
		}
	};
};

function planeList(){
	this.nextID = 1;
	this.planeArray = [];
	this.activeOnes = 0;
	this.lastStart = '';
	this.lastDest = '';
	
	this.random = 0.75;
	
	this.buildPlane = function(){
		this.lastStart = this.getPlaneStart();
		this.lastDest = this.getPlaneDestination();
		
		if(this.lastStart == 0 || this.lastDest == 0)
			return;
			
		var aPlane = new Plane();

		this.planeArray.push(aPlane);
		
		var l = this.planeArray.length;
		var plane = this.planeArray[(l-1)];
		
		plane.ID = this.nextID;
		this.nextID++;
		
		plane.name = 'XC 0' + plane.ID;
		plane.typ = this.getPlaneTyp();
		plane.pixel = 90;
		
		plane.start = this.lastStart;
		plane.location = {'x' : null,'y' : null};
		plane.destination = this.lastDest;
		
		plane.reCalcWorkingSpecs();
		
		plane.status = 0;
		plane.moving = 0;
		
		plane.color = Math.floor(Math.random()*255)+','+Math.floor(Math.random()*255)+','+Math.floor(Math.random()*255);
		
		this.activeOnes++;
	};
	
	this.getPlaneStart = function(){
		var rand = 0, len = 0;
		var GateList = [];
		
		for(var prop in XC.nodes.gates){
			GateList.push(prop);
		}

		while(GateList.length > 0){
			rand = Math.floor((Math.random() * GateList.length) + 1) - 1;
			if(XC.nodes.gates[GateList[rand]].status == 1 && XC.nodes.gates[GateList[rand]].typ != 2){
				XC.nodes.gates[GateList[rand]].status = 0;
				
				return(GateList[rand]);
			}
			delete GateList[rand];
			GateList = this.reIndex(GateList);
		}
		
		return(0);
	};
	
	this.reIndex = function(array){
		var temp = [];
		for(var prop in array){
			if(typeof array[prop] !== 'undefined')
				temp.push(array[prop]);
		}
		return(temp);
	};
	
	this.getPlaneDestination = function(){
		var rand = 0, len = 0;
		var GateList = [];
		
		for(var prop in XC.nodes.gates){
			GateList.push(prop);
		}

		while(GateList.length > 0){
			rand = Math.floor((Math.random() * GateList.length) + 1) - 1;
			if(GateList[rand] != this.lastStart){				
				return(GateList[rand]);
			}
			delete GateList[rand];
			GateList = this.reIndex(GateList);
		}
		
		return(0);
	};
	
	this.getPlaneTyp = function(){
		return(Math.floor(Math.random() * 100)) + 1;
	};
	
	this.mayNewOne = function(){
		if(this.activeOnes > 10){
			this.random = 0.25;
			return;
		}
		if(Math.random() > this.random)
			this.buildPlane();
		
		return;
	};
	
	this.move = function(){
		var temp = {};
		for(var prop in this.planeArray){
			temp = this.planeArray[prop];
			// Lfz hat Penalty
			if(temp.penalty > XC.simulation[0].counter || temp.away)
				continue;
			
			// Lfz bereits aus System
			if(temp.off){
				if(temp.offTick > XC.simulation[0].counter){
					temp.blink();
				} else {
					temp.away = true;
					
					temp.lastWay.from = temp.lastWay.to;
					temp.lastWay.to = temp.destination;
					
					temp.deleteHardEdge();
					temp.leavePlot();
					this.activeOnes--;
				}
				continue;
			}
			
			// Hat Plane Route?
			if(temp.route === null){
				// lege Route fest
				temp.cockpitPixelFix = temp.length / 2 / XC.simulation[0].lengthFaktor;
				
				var route = new AStern();
					route.from(temp.start);
					route.to(temp.destination);
					route.findRoute();
				var path = route.openNodeList[temp.destination].path;
				var hardPath = null;
					if(path === null)
						temp.addPenalty(5);
					else {
						// Checke, ob es harte Kanten enthält, Wenn ja, lösche diese Kanten und prüfe auf neuen Weg
							path = [].concat(path);
						
						// lege route fest
							temp.route = path;

						// harte kanten
						if(temp.hasHardEdges()){
							route.findRouteWithoutHardOnes();
							hardPath = route.openNodeList[temp.destination].path; 
							
							// Wenn kein neuer Pfad gefunden, behalte alten Pfad und warte
								if(hardPath === null){
									temp.waitingForFreeRoute = true;
									// nächstes Lfz
									continue;
								}
							
							// Weiße neuen Pfad zu
								path = [].concat(hardPath);
						} 
						
						// lege route fest
							temp.route = path;	
							temp.residualRoute = [];
							
							for(var i = 1; i < temp.route.length; i++){	
								temp.residualRoute.push(temp.route[i]);
							}					
						
						// Setze komplette Route weich
							temp.setSoftEdges();
							
						// Stelle KnotenPunkte ein
							temp.lastRouteNode = temp.route[0];
							temp.nextRouteNode = temp.route[1];
							temp.lastNode = temp.route[0];
							temp.nextNode = temp.route[1];
							
							if(typeof temp.route[2] !== 'undefined')
								temp.nextNextNode = temp.route[2];
							else 
								temp.nextNextNode = null;
							
						// setze erstes routen Segement hart
							temp.setHardEdge();
							
							temp.setNewHeading();
							temp.setNewTrigger();

						//gebe rollfreigabe
						//
						// -> status = 1
						// -> moving = 1
							
							temp.setAktiv();
					}
			}
			// Setze erstmals die location
			var nX = 0;
			var nY = 0;
			
			if(temp.location.x === null){
				var obj = document.createElement("img");
					obj.src = 'plane'+temp.svg+'.svg';
					obj.id = "plane_"+temp.ID;
					obj.style.height = temp.getLengthInPixel()+"px";
				
				// Berechnen des Stretch-Faktors um Flügelspannweite zu simulieren
				// Verhältnis von Flügelspannweite zu Länge-Lfz
					var stretch = temp.span / temp.length;
					
					
				var wrapObj = document.createElement("div");
					wrapObj.id = "wrapDivPlane_"+temp.ID;
					wrapObj.style.height = temp.getLengthInPixel()+"px";
					wrapObj.setAttribute('data-id',temp.ID);

					document.getElementById('divPlanes').appendChild(wrapObj);
					document.getElementById('wrapDivPlane_'+temp.ID).appendChild(obj);
					
				temp.location.x = XC.nodes.elements[temp.start].x;
				temp.location.y = XC.nodes.elements[temp.start].y;
				
				$('#wrapDivPlane_'+temp.ID).addClass('airplane');
				$('#plane_'+temp.ID).css('transform','scaleX('+stretch+')');
				
				// Melde an Knoten an
					if(temp.status == 1)
						XC.nodes.elements[temp.start].sittingOn.status = true;
					else
						XC.nodes.elements[temp.start].sittingOn.status = false;
						
					XC.nodes.elements[temp.start].sittingOn.values[temp.ID] = {'status' : 0, 'destination' : temp.destination, 'nextRouteNode' : temp.nextRouteNode};
					
					temp.logOffStartNode = true;
				
				nX = XC.canvasNodes.getPixelX(temp.location.x);
				nY = XC.canvasNodes.getPixelY(temp.location.y);
				
				$('#wrapDivPlane_'+temp.ID).css('left',nX - 0.5*(temp.pixel));
				$('#wrapDivPlane_'+temp.ID).css('top',nY - 0.5*(temp.pixel));
				
				continue;
			}
			
			// Ist Plane inaktiv ?
			if(temp.status == 0){
				if(!temp.checkHardEdges(temp.start)){
					// Lfz verharrt durchfahrbar an seiner Stelle --- ist transparent
					if($('#plane_'+temp.ID).css('opacity') != 0.3)
						$('#plane_'+temp.ID).css('opacity',0.3);
					
					temp.addPenalty(5);
					continue;
				} else {
					temp.setNewHeading();
					temp.setNewTrigger();
					temp.setAktiv();
					
					temp.residualRoute = [];
							
					for(var i = 1; i < temp.route.length; i++){	
						temp.residualRoute.push(temp.route[i]);
					}
							
					$('#plane_'+temp.ID).css('opacity',1);
				}
			}
			
			// status ist 1 --- Plane ist aktiv
			if($('#plane_'+temp.ID).css('opacity') != 1)
				$('#plane_'+temp.ID).css('opacity',1);
			
			// ist heading richtig?
			
			$('#wrapDivPlane_'+temp.ID).css('transform','rotate('+temp.headingDeg+'deg)');
			
			// darf es sich bewegen
			if(temp.moving == 1){
				// wenn das Lfz sich noch nicht vom Startknoten verabschiedet hat
					if(temp.logOffStartNode){
						delete XC.nodes.elements[temp.lastRouteNode].sittingOn.values[temp.ID];
						if(Object.keys(XC.nodes.elements[temp.lastRouteNode].sittingOn.values).length == 0)
							XC.nodes.elements[temp.lastRouteNode].sittingOn.status = false;
						
						if(typeof XC.nodes.elements[temp.lastRouteNode].linkTo[temp.nextRouteNode].hard[temp.ID] === 'undefined')
							XC.nodes.elements[temp.lastRouteNode].linkTo[temp.nextRouteNode].hard[temp.ID] = {'speed':temp.speed};
							
						temp.logOffStartNode = false;
					}
					
				// beschleunigt es
					temp.accelerate(2);
					
				// Wie weit könnte es kommen
					var dist = temp.speed * XC.simulation[0].timePerTick / XC.simulation[0].lengthFaktor;
					
				// Wie weit kann es kommen
				 // ---> Kreuzungscheck
					var distTrigger = Math.beeLineDistance(temp.location.x,temp.location.y,temp.nextTriggerCoord.x,temp.nextTriggerCoord.y);
					var distNode = Math.beeLineDistance(temp.location.x,temp.location.y,XC.nodes.elements[temp.nextNode].x,XC.nodes.elements[temp.nextNode].y);
					var distLogOffTrigger = Math.beeLineDistance(temp.location.x,temp.location.y,temp.logOffTriggerCoord.x,temp.logOffTriggerCoord.y);
					
					var tTan = temp.headingRad;
					var geg = 0, an = 0, loc = {'x':0,'y':0}, safetyTrigger = {'x':0,'y':0,'dist':null,'add':0}, newLoc = {'x':0,'y':0}, planeL = {'x':0,'y':0};
					var tempDist = 0, newTempDist = 0, tempDistP = 0;
					
					var freeWay = true, newDistCalc = false, distCheck = 0;
					
					// entfernug auf x und y aufsplitten
						loc = Math.getStretchByAngle(tTan,dist);
					
					// Berechne den Abstand zum safety-Punkt des aller Lfz auf Kante (wenn vorhanden) - umgeht das schauen on kanten 
						for(var pl in this.planeArray){
							tempPlane = this.planeArray[pl];
							if(tempPlane.ID == temp.ID || tempPlane.status == 0)
								continue;
							
							safetyTrigger.add = 0.6 * (temp.kartLength + tempPlane.kartLength); 
							
							tempDist = Math.beeLineDistance(temp.location.x,temp.location.y,tempPlane.location.x,tempPlane.location.y);
							newTempDist = Math.beeLineDistance(temp.location.x + loc.x,temp.location.y + loc.y,tempPlane.location.x,tempPlane.location.y);
							
							if(newTempDist > tempDist){
								// Lfz bewegt sich von anderem Lfz weg, alles gut und die maximale dist die aktuell vom lfz zurück gelegt werden kann, darf gefahen werden
								if(safetyTrigger.dist === null)
									safetyTrigger.dist = dist;
							} else {
								// es ist eine verkürzung zu sehen
								
								// ist die newTempDistance groß genug, um sicherheitsabstand einzuhalten?
									if(newTempDist < safetyTrigger.add){
										// safetyTrigger.add wird unterschritten und als maximal zurücklegbare distance gesetzt
										tempDistP = (newTempDist - safetyTrigger.add + dist);
										if(tempDistP < 0){
											tempDistP = 0;
											temp.moving = 0;
											temp.waitingForPrePlane = true;
											
											break;
										}	
										if(safetyTrigger.dist === null || safetyTrigger.dist > tempDistP){
											safetyTrigger.dist = tempDistP;
											newDistCalc = true;
										}
									} else {
										// zwar fahren die Lfz aufeiander zu, jedoch sit der Sicherheitsabstand gewährt
										if(safetyTrigger.dist === null)
											safetyTrigger.dist = dist;
									}
							}
						}
						
						// Wenn Lfz warten muss, müssen keine neuen Positionsänderungen analysiert werden
						if(temp.waitingForPrePlane)
							continue;
						
						if(newDistCalc){
							loc = Math.getStretchByAngle(tTan,safetyTrigger.dist);
							dist = safetyTrigger.dist;
						}
							
					
					// Prüfe ob nächster Trigger näher ist, als dist die zurück gelegt werden kann

						if((dist + temp.cockpitPixelFix) < distTrigger && dist < distNode){								
							// neue position (befahren)
								newLoc.x = temp.location.x + loc.x;
								newLoc.y = temp.location.y + loc.y;
						} else if((dist + temp.cockpitPixelFix) >= distTrigger) {
							if(temp.nextRouteNode == temp.destination){
								temp.logOffSystem();
								continue;
							}
							
							// entfernug auf x und y aufsplitten
								loc = Math.getStretchByAngle(tTan,temp.cockpitPixelFix);
							
							dist = distTrigger;
							
							// neue position (gesprungen)
								newLoc.x = temp.nextTriggerCoord.x - loc.x;
								newLoc.y = temp.nextTriggerCoord.y - loc.y;
								
								temp.moving = 0;
							
							// Wenn Kreuzung frei ist	 // Prüfe auf freie Wege
								if(XC.nodes.elements[temp.nextNode].sittingOn.status === false && temp.checkHardEdges()){
									temp.doCrossingStuff();	
								} else {
									temp.waitingForFreeCrossing = true;
									temp.waitingForFreeRoute = true;
									temp.speed = 0;
								}
								
						} else {
							dist = distNode;
							
							// neue position (gesprungen)

							newLoc.x = XC.nodes.elements[temp.nextNode].x;
							newLoc.y = XC.nodes.elements[temp.nextNode].y;
							
							temp.setNewHeadingNodes();
							temp.setNodeOffTrigger();
						}
						
						temp.nextWayPoint.length -= dist;
						if(temp.nextWayPoint.set && (temp.nextWayPoint.length) <= 0){
							// entferne Lfz von Knoten
								delete XC.nodes.elements[temp.lastNode].sittingOn.values[temp.ID];
								if(Object.keys(XC.nodes.elements[temp.lastNode].sittingOn.values).length == 0)
									XC.nodes.elements[temp.lastNode].sittingOn.status = false;	
							
							// setze neuen logOffTrigger zum Knoten -> heading
								temp.setLogOffTrigger();							
						}

						temp.location.x = newLoc.x;
						temp.location.y = newLoc.y;
						temp.speed = dist / XC.simulation[0].timePerTick * XC.simulation[0].lengthFaktor;
	
						if(temp.speed > temp.maxSpeed)
							temp.speed = temp.maxSpeed;
	
						temp.setNewWorkingLevels();		
								
						temp.roll();
						temp.nextTickMayBeRolling = false;
			} else if(temp.waitingForFreeCrossing){
				temp.speed = 0;
				// ----> wartet Lfz auf freie Kreuzung...
				
				if(XC.nodes.elements[temp.nextNode].sittingOn.status === false){
					// Prüfe auf freie Wege
						
						if(temp.checkHardEdges()){
							temp.doCrossingStuff();	
							temp.waitingForFreeRoute = false;
							temp.moving = 1;
						} else {
							//console.log(temp.name+' '+temp.nextNode);
							//console.log(temp.hardOnes);
						}
				}

				continue;
			} else if(temp.waitingForPrePlane){
				var safetyTrigger = {'x':0,'y':0,'dist':null,'add':0};
				var tempDist = 0, newTempDist = 0, tempDistP = 0, maxAccelerateSpeed = 2;
				temp.speed = 0;
				// Wie weit würde Lfz beim anfahren kommen
					dist = maxAccelerateSpeed * XC.simulation[0].timePerTick / XC.simulation[0].lengthFaktor;
				
				// entfernug auf x und y aufsplitten
					loc = Math.getStretchByAngle(tTan,dist);
				
				// Berechne den Abstand zum safety-Punkt aller Lfz auf Kante (wenn vorhanden) - umgeht das schauen on kanten 
					for(var pl in this.planeArray){
						tempPlane = this.planeArray[pl];
						if(tempPlane.ID == temp.ID || tempPlane.status == 0)
							continue;
						
						safetyTrigger.add = 0.6 * (temp.kartLength + tempPlane.kartLength); 
						
						tempDist = Math.beeLineDistance(temp.location.x,temp.location.y,tempPlane.location.x,tempPlane.location.y);
						newTempDist = Math.beeLineDistance(temp.location.x + loc.x,temp.location.y + loc.y,tempPlane.location.x,tempPlane.location.y);
						
						if(newTempDist > tempDist){
							// Lfz bewegt sich von anderem Lfz weg, alles gut und die maximale dist die aktuell vom lfz zurück gelegt werden kann, darf gefahen werden
							if(safetyTrigger.dist === null)
								safetyTrigger.dist = dist;
						} else {
							// es ist eine verkürzung zu sehen
							
							// ist die newTempDistance groß genug, um sicherheitsabstand einzuhalten?
								if(newTempDist < safetyTrigger.add){
									// safetyTrigger.add wird unterschritten und als maximal zurücklegbare distance gesetzt
									tempDistP = (newTempDist - safetyTrigger.add + dist);
									if(tempDistP < 0){
										tempDistP = 0;
										temp.moving = 0;
										temp.waitingForPrePlane = true;
										
										break;
									}	
									if(safetyTrigger.dist === null || safetyTrigger.dist > tempDistP){
										safetyTrigger.dist = tempDistP;
										newDistCalc = true;
									}
								} else {
									// zwar fahren die Lfz aufeiander zu, jedoch sit der Sicherheitsabstand gewährt
									if(safetyTrigger.dist === null)
										safetyTrigger.dist = dist;
								}
						}
					}
					temp.nextTickMayBeRolling = true;
					temp.moving = 1;
					temp.waitingForPrePlane = false;
			}
		}
	};
}

function loopThroughSimObjects(){
	for(var prop in XC.simulation){
		XC.simulation[prop].loop();
	}
}
// Mathe-Object-Erweiterung

Math.beeLineDistance = function(x1,y1,x2,y2){
	var sum = Math.pow((x2 - x1),2) + Math.pow((y2 - y1),2);
	var solv = Math.sqrt(sum);
	
	return(solv);
};
Math.angle = function(x1,y1,x2,y2){
	var div = 0;
	var ang = 0;
	if(x1 == x2 && y1 > y2){
		ang = 0;
	} else if(x1 == x2 && y2 > y1){
		ang = Math.PI;
	} else if(x2 > x1 && y2 <= y1){
		// 1. quadrant
		div = (x2 - x1) / (y1 - y2);
		ang = Math.atan(div); // y aufsteigend von oben nach unten 
	} else if(x2 > x1 && y2 > y1){
		// 2.quadrant
		div = (x2 - x1) / (y2 - y1);
		ang = Math.PI - Math.atan(div);
	} else if(x2 < x1 && y2 >= y1){
		// 3. quadrant
		div = (x1 - x2) / (y2 - y1);
		ang = Math.PI + Math.atan(div);
	} else if(x2 < x1 && y2 < y1){
		// 4. quadrant
		div = (x1 - x2) / (y1 - y2);
		ang = 2 * Math.PI - Math.atan(div);
	}
	
	return(ang);
};

Math.getNewPointByAngle = function(x1,y1,angle, length){
	var resAngle = 0;
	var addX = 0;
	var addY = 0;
	
	if(angle < 0)
		angle = 2 * Math.PI + angle;
		
	if(angle <= 0.5 * Math.PI){
		// 1. quadrant
		addX = Math.sin(angle) * length;
		addY = -Math.cos(angle) * length; // Minus, da canvas y von oben anch unten aufsteigt
	} else if(angle <= Math.PI){
		// 2.quadrant
		addX = Math.sin(Math.PI - angle) * length;
		addY = Math.cos(Math.PI - angle) * length; // Positiv, da canvas y von oben anch unten aufsteigt
	} else if(angle <= 1.5 * Math.PI){
		// 3. quadrant
		addX = - Math.sin(angle - Math.PI) * length;
		addY = Math.cos(angle - Math.PI) * length; // Positiv, da canvas y von oben anch unten aufsteigt
	} else {
		// 4. quadrant
		addX = -Math.sin(2*Math.PI - angle) * length;
		addY = -Math.cos(2*Math.PI - angle) * length; // Minus, da canvas y von oben anch unten aufsteigt
	}
	
	return({'x':x1+addX,'y':y1+addY});
};

Math.getStretchByAngle = function(angle,length){
	var loc = {'x':0,'y':0};
	
	if(angle < 0.5 * Math.PI){
		geg = Math.sin(angle) * length;
		an  = Math.cos(angle) * length;
		
		loc.x = geg;
		loc.y = -an;
	} else if(angle < Math.PI){
		geg = Math.sin(Math.PI - angle) * length;
		an  = Math.cos(Math.PI - angle) * length;
		
		loc.x = geg;
		loc.y = an;
	} else if(angle < 1.5 * Math.PI){
		geg = Math.sin(angle - Math.PI) * length;
		an  = Math.cos(angle - Math.PI) * length;
		loc.x = -geg;
		loc.y = an;
	} else {
		geg = Math.sin(2 * Math.PI - angle) * length;
		an  = Math.cos(2 * Math.PI - angle) * length;
		loc.x = -geg;
		loc.y = -an;
	}
	return(loc);
};
