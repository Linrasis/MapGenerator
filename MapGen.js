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
	
	var centerCity = new City(new Point(0,0));
	
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
	
	var city = new City(new Point(xVal, yVal));
			
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
	
	this.getCities = function() {

		return cities;
	}
	
	this.getRadius = function() {

		return radius;
	}
	
	this.setRadius = function(radiusParam) {
	
		radius = radiusParam;
	}

	this.getSections = function() {
	
		return sections;
	}
}

function City(positionParam) {
	
	var position = positionParam;
	
	var childCities = new Array();
	
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
	
		var c1 = c1Param;
		
		var c2 = c2Param;
		
		var items = new Array(itemLimitParam);
		
		var quads = null;
		
		this.inRange = function(pointParam) {
		
			if(pointParam.getX() >= c1.getX() && pointParam.getX() < c2.getX()) {
			
				if(pointParam.getY() >= c1.getY() && pointParam.getY() < c2.getY()) {
				
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
					
					var midX = c1.getX() + ((c2.getX() - c1.getX()) / 2);
					
					var midY = c1.getY() + ((c2.getY() - c1.getY()) / 2);
					
					quads[0] = new Quad(c1, new Point(midX, midY), itemLimitParam);
					
					quads[1] = new Quad(new Point(midX, c1.getY()), new Point(c2.getX(), midY), itemLimitParam);
					
					quads[2] = new Quad(new Point(c1.getX(), midY), new Point(midX, c2.getY()), itemLimitParam);
					
					quads[3] = new Quad(new Point(midX, midY), c2, itemLimitParam);
					
					for(var itemIndex in items) {
					
						for(var quadIndex in quads) {
					
							var addResult = quads[quadIndex].addItem(items[itemIndex]);
							
							if(addResult == true) {
							
								break;
							}				
						}
					}
					
					items.length = 0;
					
					items = null;
				}
				
				for(var quadIndex in quads) {
				
					var addResult = quads[quadIndex].addItem(itemParam);
					
					if(addResult == true) {
					
						return true;
					}				
				}
			}
			
			return false;
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
}

function Rectangle(topLeftCornerParam, bottomRightCornerParam) {
	
	var topLeftCorner = topLeftCornerParam;
	
	var bottomRightCorner = bottomRightCornerParam;
	
	this.getTopLeftCorner = function() {
		
		return topLeftCorner;
	}
	
	this.getBottomRightCorner = function() {
		
		return bottomRightCorner;
	}
	
	this.intersects = function(shape) {
	
		if(shape instanceof Circle) {
		
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

	var centerPoint = centerPointParam;
	
	var radius = radiusParam;
	
	this.getCenterPoint = function() {
		
		return centerPoint;
	}
	
	this.getRadius = function() {
		
		return radius;
	}
}

function Line(firstPointParam, secondPointParam) {
	
	var firstPoint = firstPointParam;
	
	var secondPoint = secondPointParam;
	
	this.getFirstPoint = function() {
		
		return firstPoint;
	}
	
	this.getSecondPoint = function() {
		
		return secondPoint;
	}
}

function Point(xVal, yVal) {
	
	var x = xVal;
	
	var y = yVal;
	
	this.getX = function() {
		
		return x;
	}
	
	this.getY = function() {
		
		return y;
	}
}
