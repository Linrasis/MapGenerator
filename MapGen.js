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
			
	var distance = minDistance + ( (maxDistance - minDistance) * Math.random() );
			
	var xVal = distance * Math.cos(angle);
			
	var yVal = distance * Math.sin(angle);
	
	var city = new City(new Point(xVal, yVal));
			
	worldMap.getCities().push(city);
	
	var sectionLine = generateLine(angleStart, minDistance, maxDistance);
	
	var sectionBottomLine = new Line(sectionLine.getFirstPoint(), generatePoint(angleStart + angleSize, minDistance));
	
	var sectionTopLine = new Line(sectionLine.getSecondPoint(), generatePoint(angleStart + angleSize, maxDistance));
			
	worldMap.getSections().push(sectionLine);
	
	worldMap.getSections().push(sectionBottomLine);
	
	worldMap.getSections().push(sectionTopLine);
	
	if(steps > 0) {
	
		var angleIncrement = angleSize / childCities;
	
		for(var childCityIndex = 0; childCityIndex < childCities; childCityIndex++) {
			
			var childCity = generateCity(worldMap, steps - 1, angleStart + (angleIncrement * childCityIndex), angleIncrement, maxDistance + 10, maxDistance + 50, childCities);
			
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
	
	this.getCities = function() {

		return cities;
	}
	
	this.getRadius = function() {

		return radius;
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
