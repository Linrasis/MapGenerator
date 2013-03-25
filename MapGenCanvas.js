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
 
 function drawMap(worldMap, canvasId, drawRoadsParam, doNotInterpolate, drawDebug) {
	
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
	
	var imageData = map.createImageData(width, height);
	
	for(var x = 0; x < width; x++) {
		
		for(var y = 0; y < height; y++) {
			
			var index = (x + y * imageData.width) * 4;
			
			var xRatio = x / width;
			
			var yRatio = y / height;
			
			var value = worldMap.getTerrain().getHeight(xRatio, yRatio, doNotInterpolate);
			
			if(value < 0) {
				
				imageData.data[index+2] = 255 - (((value+500)/500) * 55);
				
			} else { 
			
				imageData.data[index+1] = 255 - ((value/1500) * 55);
			}
			
			imageData.data[index+3] = 255;
		}
	}
	
	map.putImageData(imageData, 0, 0);
	
	if(drawDebug) {
	
		var regionMapImage = map.createImageData(width, height);
		
		var regionList = worldMap.getRegions().getRegionList();
		
		var regionMap = worldMap.getRegions().getRegionMap();
		
		for(var x = 0; x < width; x++) {
			
			for(var y = 0; y < height; y++) {
				
				var index = (x + y * regionMapImage.width) * 4;
				
				var xRatio = (x / width) * (regionMap.length - 1);
				
				var xIndex = Math.floor(xRatio);
				
				if((xRatio - xIndex) >= 0.5) {

					xIndex += 1;
				}
				
				var yRatio = (y / height) * (regionMap.length - 1);
				
				var yIndex = Math.floor(yRatio);
				
				if((yRatio - yIndex) >= 0.5) {
					
					yIndex += 1;
				}
				
				var regionIndex = regionMap[xIndex][yIndex];
				
				regionMapImage.data[index] = regionList[regionIndex].getColor().r;
				regionMapImage.data[index + 1] = regionList[regionIndex].getColor().g;
				regionMapImage.data[index + 2] = regionList[regionIndex].getColor().b;
				regionMapImage.data[index + 3] = 255;
			}
		}
		
		map.putImageData(regionMapImage, 0, 0);
		
		map.strokeStyle = 'black';
	
		map.fillStyle = 'red';
		
		for(var regionIndex in regionList) {
		
			var region = regionList[regionIndex];
			
			var coordinate = convertWorldToCanvasCoordinate(region.getCenter(), worldMap, width, height);
	
			map.beginPath();
			
			map.arc(coordinate.getX() + (widthOffset / 2), coordinate.getY() + (heightOffset / 2), 3, 0, 2 * Math.PI, true);
			
			map.fill();
			
			map.stroke();
			
			map.closePath();
		}
	}

	var cities = worldMap.getCities();
	
	map.strokeStyle = 'brown';
	
	if (drawRoadsParam) {

		drawRoads(worldMap, map, worldMap.getCities()[0]);
	}
	
	map.strokeStyle = 'black';
	
	map.fillStyle = 'white';
		
	for (var cityIndex in cities) {
		
		var city = cities[cityIndex];
		
		var coordinate = convertWorldToCanvasCoordinate(city.getPosition(), worldMap, width, height);
	
		map.beginPath();
		
		map.arc(coordinate.getX() + (widthOffset / 2), coordinate.getY() + (heightOffset / 2), 3, 0, 2 * Math.PI, true);
		
		map.fill();
		
		map.stroke();
		
		map.closePath();
	}
}

function drawRoads(worldMap, map, city) {

	var width = map.canvas.width;
	
	var widthOffset = 0;
	
	var height = map.canvas.height;
	
	var heightOffset = 0;
	
	if (width > height) {
		
		widthOffset = width - height;
		
		width = height;
		
	} else if (height > width) {
		
		heightOffset = height - width;
		
		height = width;
	}

	var childCities = city.getChildCities();
	
	for (var childCityIndex in childCities) {
		
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

function convertWorldToCanvasCoordinate(coordinate, worldMap, width, height) {
	
	var xFactor = coordinate.getX() / worldMap.getMapWidth();
		
	var yFactor = coordinate.getY() / worldMap.getMapWidth();
	
	return new Point(width * xFactor, height * yFactor);		
}

function convertCanvasToWorldCoordinate(coordinate, worldMap, width, height) {
	
	var xFactor = coordinate.getX() / width;
	
	var yFactor = coordinate.getY() / height;
		
	return new Point(worldMap.getMapWidth() * xFactor, worldMap.getMapWidth() * yFactor);		
}