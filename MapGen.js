/*
 * Copyright (c) 2013, Jon Leonard
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met: 
 * 
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer. 
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution. 
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
 
function drawMap(worldMap, canvasId, drawRoadsParam, drawDebug) {
	
	var map = document.getElementById(canvasId).getContext("2d");
	
	var width = map.canvas.width;
	
	var widthOffset = 0;
	
	var height = map.canvas.height;
	
	var heightOffset = 0;
	
	if(width > height) {
		
		widthOffset = width - height;
		
		width = height;
		
	} else if (height > width) {
		
		heightOffset = height - width;
		
		height = width;
	}
	
	map.save();
	
	if(drawDebug) {

		var sections = worldMap.getSections();
		
		map.strokeStyle = '#c2c2c2';
		
		for(var sectionIndex in sections) {
				
			var section = sections[sectionIndex];
			
			map.beginPath();
			
			var firstCoordinate = convertWorldToCanvasCoordinate(section.getFirstPoint(), worldMap, width, height);
			
			var secondCoordinate = convertWorldToCanvasCoordinate(section.getSecondPoint(), worldMap, width, height);
						
			map.moveTo(firstCoordinate.getX(), firstCoordinate.getY());
			
			map.lineTo(secondCoordinate.getX(), secondCoordinate.getY());
			
			map.stroke();
			
			map.closePath();
		}
	}
	
	map.restore();
	
	var cities = worldMap.getCities();	
		
	for(var cityIndex in cities) {
		
		var city = cities[cityIndex];
		
		var coordinate = convertWorldToCanvasCoordinate(city.getPosition(), worldMap, width, height);
	
		map.beginPath();
		
		map.arc(coordinate.getX() + (widthOffset / 2), coordinate.getY() + (heightOffset / 2), 3, 0, 2 * Math.PI, true);
		
		map.fill();
		
		map.closePath();
	}
	
	if(drawRoadsParam) {

		drawRoads(worldMap, map, worldMap.getCities()[0]);
	}
}

function drawRoads(worldMap, map, city) {

	var width = map.canvas.width;
	
	var widthOffset = 0;
	
	var height = map.canvas.height;
	
	var heightOffset = 0;
	
	if(width > height) {
		
		widthOffset = width - height;
		
		width = height;
		
	} else if (height > width) {
		
		heightOffset = height - width;
		
		height = width;
	}

	var childCities = city.getChildCities();
	
	for(var childCityIndex in childCities) {
		
		var childCity = childCities[childCityIndex];
		
		map.beginPath();
			
		var firstCoordinate = convertWorldToCanvasCoordinate(city.getPosition(), worldMap, width, height);
		
		var secondCoordinate = convertWorldToCanvasCoordinate(childCity.getPosition(), worldMap, width, height);
		
		map.lineWidth = 1;
					
		map.moveTo(firstCoordinate.getX(), firstCoordinate.getY());
		
		map.lineTo(secondCoordinate.getX(), secondCoordinate.getY());
		
		map.stroke();
			
		map.closePath();
		
		drawRoads(worldMap, map, childCity);
	}
}

function generateMap(steps, angleSteps, angleStepIncrease) {

	var cities = new Array();
	
	var centerCity = new City(getRandomCityName(), new Point(0,0));
	
	cities.push(centerCity);
	
	var sections = new Array();
	
	var worldMap = new WorldMap(cities, steps * 50, sections);
	
	if(steps > 0) {
	
		var angleIncrement = (2.0 * Math.PI) / angleSteps;
		
		for(var angleStep = 0; angleStep < angleSteps; angleStep++) {
		
			var childCity = generateCity(worldMap, steps - 1, angleIncrement * angleStep, angleIncrement, 10, 50, angleStepIncrease);
			
			centerCity.getChildCities().push(childCity);
		}
	}
	
	return worldMap;
}

function generateCity(worldMap, steps, angleStart, angleSize, minDistance, maxDistance, childCities) {

	var angle = angleStart + (Math.random() * angleSize);
	
	if(worldMap.getRadius() < maxDistance) {
	
		worldMap.setRadius(maxDistance);
	}
			
	var distance = minDistance + ( (maxDistance - minDistance) * Math.random() );
			
	var xVal = distance * Math.cos(angle);
			
	var yVal = distance * Math.sin(angle);
	
	var city = new City(getRandomCityName(), new Point(xVal, yVal));
			
	worldMap.addCity(city);
	
	var sectionLine = generateLine(angleStart, minDistance, maxDistance);
	
	var sectionBottomLine = new Line(sectionLine.getFirstPoint(), generatePoint(angleStart + angleSize, minDistance));
	
	var sectionTopLine = new Line(sectionLine.getSecondPoint(), generatePoint(angleStart + angleSize, maxDistance));
			
	worldMap.getSections().push(sectionLine);
	
	worldMap.getSections().push(sectionBottomLine);
	
	worldMap.getSections().push(sectionTopLine);
	
	if(steps > 0) {
	
		var angleIncrement = angleSize / childCities;
	
		for(var childCityIndex = 0; childCityIndex < childCities; childCityIndex++) {
			
			var childCity = generateCity(worldMap, steps - 1, angleStart + (angleIncrement * childCityIndex), angleIncrement, maxDistance * 1.1, maxDistance * 1.75, childCities);
			
			city.getChildCities().push(childCity);
		}
	}
	
	return city;
}

function generateLine(angle, startRadius, endRadius) {
	
	return new Line(generatePoint(angle, startRadius), generatePoint(angle, endRadius));
}

function generatePoint(angle, distance) {

	var x = distance * Math.cos(angle);
	
	var y = distance * Math.sin(angle);
	
	return new Point(x, y);	
}

function convertWorldToCanvasCoordinate(coordinate, worldMap, width, height) {
		
	var worldMapDiameter = worldMap.getRadius() * 2;
	
	var xFactor = (coordinate.getX() + worldMap.getRadius()) / worldMapDiameter;
		
	var yFactor = (coordinate.getY() + worldMap.getRadius()) / worldMapDiameter;
	
	return new Point(width * xFactor, height * yFactor);		
}

function convertCanvasToWorldCoordinate(coordinate, worldMap, width, height) {
		
	var worldMapDiameter = worldMap.getRadius() * 2;
	
	var xFactor = coordinate.getX() / width;
	
	var yFactor = coordinate.getY() / height;
		
	return new Point((worldMapDiameter * xFactor) - worldMap.getRadius(), (worldMapDiameter * yFactor) - worldMap.getRadius());		
}

 var cityNames = ["Abingdon","Accrington","Acle","Acton","Adlington","Alcester",
				  "Aldeburgh","Aldershot","Alford","Alfreton","Alnwick","Alsager",
				  "Alston","Alton","Altrincham","Amble","Ambleside","Amersham",
				  "Amesbury","Ampthill","Andover","Arlesey","Arundel"];
 
 function getRandomCityName() {
	 
	 var randomIndex = Math.random() * cityNames.length;
	 
	 return cityNames[Math.floor(randomIndex)];
 }

function WorldMap(citiesParam, radiusParam, sectionsParam) {
	
	var cities = citiesParam;
	
	var radius = radiusParam;
	
	var sections = sectionsParam;
	
	var quadTree = new QuadTree(new Point(-radius,-radius), new Point(radius,radius));
	
	var id = 1;

	for(var cityIndex in cities) {
	
		var city = cities[cityIndex];
		
		quadTree.addItem(city, id, city.getPosition());
		
		id += 1;
	}
	
	this.addCity = function(cityParam) {
	
		cities.push(cityParam);
		
		quadTree.addItem(cityParam, id, cityParam.getPosition());
		
		id += 1;
	}
	
	this.getCities = function(shape) {
		
		if(typeof shape === 'undefined' || shape === null) {

			return cities;
			
		} else {
			
			return quadTree.getItems(shape);			
		}
	}
		
	this.getRadius = function() {

		return radius;
	}
	
	this.setRadius = function(radiusParam) {
	
		radius = radiusParam;
		
		quadTree = new QuadTree(new Point(-radius,-radius), new Point(radius,radius));
		
		id = 1;

		for(var cityIndex in cities) {
		
			var city = cities[cityIndex];
			
			quadTree.addItem(city, id, city.getPosition());
			
			id += 1;
		}
	}

	this.getSections = function() {
	
		return sections;
	}
}

function City(nameParam, positionParam) {
	
	var name = nameParam;
	
	var position = positionParam;
	
	var childCities = new Array();
	
	this.getName = function() {
		
		return name;
	}
	
	this.getPosition = function() {
		
		return position;
	}
	
	this.getChildCities = function() {
	
		return childCities;
	}
}

function QuadTree(c1Param, c2Param) {

	var root = new Quad(c1Param, c2Param, 3);
	
	function Item(itemValueParam, idParam, positionParam) {
	
		var itemValue = itemValueParam;
		
		var id = idParam;
		
		var position = positionParam;
		
		this.getItemValue = function() {
		
			return itemValue;
		}
		
		this.getId = function() {
			
			return id;
		}
		
		this.getPosition = function() {
		
			return position;
		}	
	}
	
	function Quad(c1Param, c2Param, itemLimitParam) {
	
		var quadRect = new Rectangle(c1Param, c2Param);
		
		var items = new Array(itemLimitParam);
		
		var quads = null;
		
		this.inRange = function(pointParam) {
		
			if(pointParam.getX() >= quadRect.getTopLeftCorner().getX() && pointParam.getX() < quadRect.getBottomRightCorner().getX()) {
			
				if(pointParam.getY() >= quadRect.getTopLeftCorner().getY() && pointParam.getY() < quadRect.getBottomRightCorner().getY()) {
				
					return true;
				}
			}
			
			return false;
		}
	
		this.addItem = function(itemParam) {
		
			if(this.inRange(itemParam.getPosition())) {
				
				if(items !== null) {
				
					for(var itemIndex = 0; itemIndex < items.length; itemIndex++) {
					
						if (typeof items[itemIndex] === 'undefined' || items[itemIndex] === null) {
						
							items[itemIndex] = itemParam;
														
							return true;
						}
					}
					
					quads = new Array(4);
					
					var midX = quadRect.getTopLeftCorner().getX() + ((quadRect.getBottomRightCorner().getX() - quadRect.getTopLeftCorner().getX()) / 2);
					
					var midY = quadRect.getTopLeftCorner().getY() + ((quadRect.getBottomRightCorner().getY() - quadRect.getTopLeftCorner().getY()) / 2);
					
					quads[0] = new Quad(quadRect.getTopLeftCorner(), new Point(midX, midY), itemLimitParam);
					
					quads[1] = new Quad(new Point(midX, quadRect.getTopLeftCorner().getY()), new Point(quadRect.getBottomRightCorner().getX(), midY), itemLimitParam);
					
					quads[2] = new Quad(new Point(quadRect.getTopLeftCorner().getX(), midY), new Point(midX, quadRect.getBottomRightCorner().getY()), itemLimitParam);
					
					quads[3] = new Quad(new Point(midX, midY), quadRect.getBottomRightCorner(), itemLimitParam);
					
					for(var itemIndex in items) {
					
						var addResult;
					
						for(var quadIndex in quads) {
					
							addResult = quads[quadIndex].addItem(items[itemIndex]);
							
							if(addResult == true) {
							
								break;
							}				
						}
						
						if(!addResult) {
						
							throw new Error("Could not split quad, item could not be added");
						}
					}
					
					items.length = 0;
					
					items = null;
				}
				
				var addResult;
				
				for(var quadIndex in quads) {
				
					addResult = quads[quadIndex].addItem(itemParam);
					
					if(addResult == true) {
					
						return true;
					}				
				}
				
				if(!addResult) {
						
					throw new Error("Could not add item, was in parent quad but does not fit in to child quad");
				}
			}
			
			return false;
		}
		
		this.getItems = function(shape) {
			
			var returnItems = new Array();
						
			if(items !== null && items.length > 0) {

				for(var itemIndex = 0; itemIndex < items.length; itemIndex++) {

					if (typeof items[itemIndex] !== 'undefined' && items[itemIndex] !== null) {
						
						var item = items[itemIndex];
						
						if(shape.intersects(item.getPosition())) {
							
							returnItems.push(item.getItemValue());
						}
					}
				}
				
			} else if (quads !== null && quads.length > 0) {
				
				for (var quadIndex = 0; quadIndex < quads.length; quadIndex++) {
					
					var quad = quads[quadIndex];
					
					var array = quad.getItems(shape);
					
					returnItems = returnItems.concat(array);
				}
			}
			
			return returnItems;
		}
	}
	
	this.addItem = function(itemValueParam, idParam, positionParam) {
	
		var newItem = new Item(itemValueParam, idParam, positionParam);
		
		var returnResult = root.addItem(newItem);
		
		if(!returnResult) {
		
			throw new Error("Item could not be added to quadtree: " + itemValueParam + ", " + idParam + ", (" + positionParam.getX() + ", " + positionParam.getY() + ")");
		}
	}
	
	function removeItem(idParam, positionParam) {
	
	}
	
	this.getItems = function(shape) {
		
		return root.getItems(shape);
	}
}

function Rectangle(topLeftCornerParam, bottomRightCornerParam) {
	
	var topLeftCorner = topLeftCornerParam;

	var bottomRightCorner = bottomRightCornerParam;

	var topRightCorner = null, bottomLeftCorner = null;
	
	var lines = null;
	
	this.getTopLeftCorner = function() {
		
		return topLeftCorner;
	}
	
	this.getBottomRightCorner = function() {
		
		return bottomRightCorner;
	}
	
	var getTopRightCorner = function() {
		
		if(topRightCorner === null) {
			
			topRightCorner = new Point(getBottomRightCorner().getX(), getTopLeftCorner().getY());
		}
		
		return topRightCorner;
	}
	
	var getBottomLeftCorner = function() {
		
		if(bottomLeftCorner === null) {
			
			bottomLeftCorner = new Point(getTopLeftCorner().getX(), getBottomRightCorner().getY());
		}
		
		return bottomLeftCorner;
	}
	
	var getLines = function() {
		
		if(lines === null) {
			
			lines = new Array(4);
			
			lines[0] = new Line(getTopLeftCorner(), getTopRightCorner());
					
			lines[1] = new Line(getTopRightCorner(), getBottomRightCorner());
					
			lines[2] = new Line(getBottomRightCorner(), getBottomLeftCorner());
					
			lines[3] = new Line(getBottomLeftCorner(), getTopLeftCorner());
		}
		
		return lines;
	}
	
	this.intersects = function(shape) {
	
		if(shape instanceof Circle) {
			
			if (this.intersects(shape.getCenter())) {
				
				return true;
				
			} else {
				
				var lines = getLines();
				
				for(var lineIndex in lines) {
					
					var line = lines[lineIndex];
					
					var point = line.projectPoint(shape.getCenter());
					
					if(point != null) {
						
						if(shape.intersects(point)) {
							
							return true;
						}					
					}
				}			
			}
					
			return false;
		
		} else if (shape instanceof Point) {
		
			if(pointParam.getX() >= topLeftCorner.getX() && pointParam.getX() < bottomRightCorner.getX()) {
			
				if(pointParam.getY() >= topLeftCorner.getY() && pointparam.getY() < bottomRightCorner.getY()) {
				
					return true;
				}
			}
			
			return false;
		}
		
		throw new Error("Unknown shape object");
	}
}

function Circle(centerPointParam, radiusParam) {

	var center = centerPointParam;
	
	var radius = radiusParam;
	
	this.getCenter = function() {
		
		return center;
	}
	
	this.getRadius = function() {
		
		return radius;
	}
	
	this.intersects = function(shape) {
		
		if(shape instanceof Point) {
			
			var distance = shape.distance(this.getCenter());
			
			if(distance <= this.getRadius()) {
				
				return true;
				
			} else {
				
				return false;
			}
			
		} else if (shape instanceof Rectangle) {
			
			return shape.intersects(this);
		}
		
		throw new Error("Unknown shape object");
	}
}

function Line(firstPointParam, secondPointParam) {
	
	var firstPoint = firstPointParam;
	
	var secondPoint = secondPointParam;
	
	var vector = null;
	
	this.getFirstPoint = function() {
		
		return firstPoint;
	}
	
	this.getSecondPoint = function() {
		
		return secondPoint;
	}
	
	var getVector = function() {
		
		if(vector === null) {
			
			vector = new Vector(firstPoint, secondPoint);
		}
		
		return vector;
	}
	
	this.projectPoint = function(point) {
		
		var pointVector = new Vector(firstPoint, point);
		
		var lineVector = getVector();
		
		var projectVector = lineVector.projectVector(pointVector);
		
		if(lineVector.getUnitVector().getI() == projectVector.getUnitVector().getI()) {
			
			if(lineVector.getUnitVector().getJ() == projectVector.getUnitVector().getJ()) {
			
				if(projectVector.getMagnitude() <= lineVector.getMagnitude()) {
					
					return new Point(firstPoint, projectVector);
				}
			}
		}
		
		return null;	
	}
}

function Vector(firstParam, secondParam) {
	
	var i, j;
		
	if(firstParam instanceof Point && secondParam instanceof Point) {

		i = secondParam.getX() - firstParam.getX();
		
		j = secondParam.getY() - firstParam.getY();
		
	} else if (secondParam instanceof Vector) {
		
		i = firstParam * secondParam.getI();
		
		j = firstParam * secondParam.getJ();
		
	} else {
		
		i = firstParam;
		
		j = secondParam;
	}
	
	var magnitude = null;
	
	this.getI = function() {
		
		return i;
	}
	
	this.getJ = function() {
		
		return j;
	}
	
	this.getMagnitude = function() {
		
		if(magnitude === null) {
			
			magnitude = Math.sqrt(Math.pow(i, 2) + Math.pow(j, 2));
		}
		
		return magnitude;
	}
	
	this.getUnitVector = function() {
		
		var magnitude = getMagnitude();
		
		if(magnitude == 1) {
			
			return this;
			
		} else {
			
			return new Vector(i / magnitude, j / magnitude);
		}		
	}
	
	this.dotProduct = function(secondVector) {
		
		return i * secondVector.getI() + j * secondVector.getJ();
	}
	
	this.projectVector = function(vector) {
				
		var unitVector = getUnitVector();
		
		var scalar = unitVector.dotProduct(vector);
		
		return new Vector(scalar, unitVector);
	}
}

function Point(firstParam, secondParam) {
	
	var x, y;
	
	if(firstParam instanceof Point && secondParam instanceof Vector) {
		
		x = firstParam.getX() + secondParam.getI();
		
		y = firstParam.getY() + secondParam.getJ();
		
	} else {
		
		x = firstParam;
		
		y = secondParam;
	}
	
	this.getX = function() {
		
		return x;
	}
	
	this.getY = function() {
		
		return y;
	}
	
	this.distance = function(secondPoint) {
		
		var xDiff = secondPoint.getX() - this.getX();
		
		var yDiff = secondPoint.getY() - this.getY();
		
		return Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));
	}
}
