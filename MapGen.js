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
 
function drawMap(worldMap, canvasId, drawDebug) {
	
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
	
	var worldMapDiameter = worldMap.getRadius() * 2;
	
	var cities = worldMap.getCities();
		
	for(var cityIndex in cities) {
		
		var city = cities[cityIndex];
		
		var coordinate = convertWorldToCanvasCoordinate(city.getPosition(), worldMap, width, height);
	
		map.beginPath();
		
		map.arc(coordinate.getX() + (widthOffset / 2), coordinate.getY() + (heightOffset / 2), 1, 0, 2 * Math.PI, true);
		
		map.fill();
		
		map.closePath();
	}
	
	if(drawDebug) {
	
		var levels = worldMap.getLevels();
		
		for(var levelIndex in levels) {
			
			var level = levels[levelIndex];
			
			var radius = level / worldMap.getRadius();

			map.beginPath();
		
			map.arc((width + widthOffset) / 2, (height + heightOffset) / 2, radius * (width / 2), 0, 2 * Math.PI, true);
		
			map.closePath();
			
			map.stroke();
		}
		
		var sections = worldMap.getSections();
		
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
}

function generateMap(steps) {

	var cities = new Array();
	
	cities.push(new City(new Point(0,0)));
	
	var levels = new Array();
	
	var sections = new Array();

	var angleSteps = 6;

	for(var step = 0; step < steps; step++) {
		
		var angleIncrement = angleSteps / (2 * Math.PI);
		
		for(var angleStep = 0; angleStep < angleSteps; angleStep++) {
			
			var angleStart = angleIncrement * angleStep;
			
			var angle = angleStart + (Math.random() * angleIncrement);
			
			var distance = 10 + (50 * step) + (40 * Math.random());
			
			var xVal = distance * Math.cos(angle);
			
			var yVal = distance * Math.sin(angle);
			
			cities.push(new City(new Point(xVal, yVal)));
			
			sections.push(generateLine(angleStart, 10 + (50 * step), 50 * (step + 1)));			
		}
		
		levels.push((step * 50) + 10);
		
		levels.push((step + 1) * 50);
		
		angleSteps = angleSteps * 2;
	}
	
	return new WorldMap(cities, steps * 50, levels, sections);
}

function generateLine(angle, startRadius, endRadius) {
	
	var x1Val = startRadius * Math.cos(angle);
	
	var y1Val = startRadius * Math.sin(angle);
	
	var x2Val = endRadius * Math.cos(angle);
	
	var y2Val = endRadius * Math.sin(angle);
	
	return new Line(new Point(x1Val, y1Val), new Point(x2Val, y2Val));
}

function convertWorldToCanvasCoordinate(coordinate, worldMap, width, height) {
		
	var worldMapDiameter = worldMap.getRadius() * 2;
	
	var xFactor = (coordinate.getX() + worldMap.getRadius()) / worldMapDiameter;
		
	var yFactor = (coordinate.getY() + worldMap.getRadius()) / worldMapDiameter;
	
	return new Point(width * xFactor, height * yFactor);		
}

function WorldMap(citiesParam, radiusParam, levelsParam, sectionsParam) {
	
	var cities = citiesParam;
	
	var radius = radiusParam;
	
	var levels = levelsParam;
	
	var sections = sectionsParam;
	
	this.getCities = function() {

		return cities;
	}
	
	this.getRadius = function() {

		return radius;
	}
	
	this.getLevels = function() {

		return levels;
	}
	
	this.getSections = function() {
	
		return sections;
	}
}

function City(positionParam) {
	
	var position = positionParam;
	
	this.getPosition = function() {
		
		return position;
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
