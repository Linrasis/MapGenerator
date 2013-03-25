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

function generateMap(mapWidth, mapResolution, mapDistanceUnit, terrainLod) {
	
	var worldMap = new WorldMap(mapWidth, mapResolution, mapDistanceUnit, terrainLod);
	
	var regionList = worldMap.getRegions().getRegionList();
	
	for(var regionIndex in regionList) {
	
		var region = regionList[regionIndex];
		
		if(region.isLand()) {

			var centerCity = new City(getRandomCityName(), region.getCenter());
		
			worldMap.addCity(centerCity);
		}
	}
	
	return worldMap;
}

function generateLine(angle, startRadius, endRadius) {
	
	return new Line(generatePoint(angle, startRadius), generatePoint(angle, endRadius));
}

function generatePoint(angle, distance) {

	var x = distance * Math.cos(angle);
	
	var y = distance * Math.sin(angle);
	
	return new Point(x, y);	
}

 var cityNames = ["Abingdon","Accrington","Acle","Acton","Adlington","Alcester",
				  "Aldeburgh","Aldershot","Alford","Alfreton","Alnwick","Alsager",
				  "Alston","Alton","Altrincham","Amble","Ambleside","Amersham",
				  "Amesbury","Ampthill","Andover","Arlesey","Arundel"];
 
 function getRandomCityName() {
	 
	 var randomIndex = Math.random() * cityNames.length;
	 
	 return cityNames[Math.floor(randomIndex)];
 }

function WorldMap(mapWidth, mapResolution, mapDistanceUnit, terrainLod) {
	
	var cities = [];
	
	var quadTree = new QuadTree(new Point(0,0), new Point(mapWidth + 1, mapWidth + 1));
	
	var terrain = new Terrain(terrainLod);
	
	var regions = new Regions(terrain, mapWidth, mapResolution);
	
	var id = 1;
	
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
	
	this.getMapWidth = function() {
	
		return mapWidth;
	}
	
	this.getMapResolution = function() {
	
		return mapResolution;
	}
	
	this.getMapDistanceUnit = function() {
	
		return mapDistanceUnit;
	}

	this.getTerrain = function() {
		
		return terrain;
	}
	
	this.getRegions = function() {
	
		return regions;
	}
	
	this.getVersion = function() {
		
		return "0.7";
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

function Terrain(lodParam) {
	
	var terrain = new Array(Math.pow(2, lodParam) + 1);
	
	// Constructor
	(function(){
	
		for(var i = 0; i < terrain.length; i++) {

			terrain[i] = new Array(terrain.length);
		}
		
		terrain[0][0] = (Math.random() * 2000) - 500;
		
		terrain[0][terrain.length - 1] = (Math.random() * 2000) - 500;
		
		terrain[terrain.length - 1][0] = (Math.random() * 2000) - 500;
		
		terrain[terrain.length - 1][terrain.length - 1] = (Math.random() * 2000) - 500;
		
		var width = terrain.length - 1;
		
		while(width >= 1) {
			
			for(var x = 0; x + width < terrain.length; x += width) {
		
				for(var y = 0; y + width < terrain.length; y += width) {
					
					generateTerrain(terrain, x, y, x + width, y + width);
				}
			}
			
			width = width / 2;
		}
		
		for(var x = 1; x < terrain.length - 1; x += 1) {
			
			for(var y = 1; y < terrain.length - 1; y += 1) {
				
				var value = terrain[x-1][y-1] * 1 + terrain[x][y-1] * 2;
				
				value = value + terrain[x+1][y-1] * 1 + terrain[x-1][y] * 2;
				
				value = value + terrain[x][y] * 4 + terrain[x+1][y] * 2;
				
				value = value + terrain[x-1][y+1] * 1 + terrain[x][y+1] * 2;
				
				value = value + terrain[x+1][y+1];
				
				value = value / 16;
				
				terrain[x][y] = value;
			}
		}		
	})();
	
	this.getHeightArray = function() {
		
		return terrain;
	}
	
	this.getHeight = function(xParam, yParam, doNotInterpolate) {
			
		var terrainWidth = terrain.length - 1;
			
		var minX = Math.floor(xParam * terrainWidth), maxX = minX + 1;
		
		var minY = Math.floor(yParam * terrainWidth), maxY = minY + 1;

		var xVal = xParam * terrainWidth, yVal = yParam * terrainWidth;
		
		if (doNotInterpolate) {
		
			if(xVal - minX >= 0.5) {
			
				xVal = maxX;
				
			} else {
			
				xVal = minX;
			}
			
			if(yVal - minY >= 0.5) {
			
				yVal = maxY;
				
			} else {
			
				yVal = minY;
			}
			
			return terrain[xVal][yVal];
		
		} else {

			var value = ((maxX - xVal)*(maxY - yVal))*terrain[minX][minY];
					
			value = value + ((xVal - minX)*(maxY - yVal))*terrain[maxX][minY];
			
			value = value + ((maxX - xVal)*(yVal - minY))*terrain[minX][maxY];
					
			value = value + ((xVal - minX)*(yVal - minY))*terrain[maxX][maxY];
				
			return value;
		}
 	}
	
	function generateTerrain(terrain, minX, minY, maxX, maxY) {
		
		var smoothingConst = 1.0;
				
		var average = (terrain[minX][minY] + terrain[minX][maxY] + terrain[maxX][minY] + terrain[maxX][maxY]) / 4;
		
		var random = (Math.random() * 300) - 200;
		
		var halfDistance = (maxX - minX) / 2;
		
		if (halfDistance >= 1) {
						
			var midX = minX + halfDistance;
			
			var midY = minY + halfDistance;
			
			terrain[midX][midY] = average + random * smoothingConst;
						
			var negMinX = minX - halfDistance;
			
			var negMinY = minY - halfDistance;
			
			var negMaxX = maxX + halfDistance;
			
			var negMaxY = maxY + halfDistance;
			
			// Left Midpoint
			
			average = terrain[minX][minY] + terrain [minX][maxY] + terrain[midX][midY];
			
			if(negMinX >= 0) {
				
				average = (average + terrain[negMinX][midY]) / 4; 
				
			} else {
				
				average = average / 3;
			}
			
			random = (Math.random() * 300) - 200;
			
			terrain[minX][midY] = average + random * smoothingConst;
			
			// Top Midpoint
			
			average = terrain[minX][minY] + terrain [maxX][minY] + terrain[midX][midY];
			
			if(negMinY >= 0) {
				
				average = (average + terrain[midX][negMinY]) / 4; 
				
			} else {
				
				average = average / 3;
			}
			
			random = (Math.random() * 300) - 200;
			
			terrain[midX][minY] = average + random * smoothingConst;
			
			// Right Midpoint
			
			average = terrain[maxX][minY] + terrain [maxX][maxY] + terrain[midX][midY];
			
			if(negMaxX < terrain.length) {
				
				average = (average + terrain[negMaxX][midY]) / 4; 
				
			} else {
				
				average = average / 3;
			}
			
			random = (Math.random() * 300) - 200;
			
			terrain[maxX][midY] = average + random * smoothingConst;
			
			// Bottom Midpoint
			
			average = terrain[minX][maxY] + terrain [maxX][maxY] + terrain[midX][midY];
			
			if(negMaxY < terrain.length) {
				
				average = (average + terrain[midX][negMaxY]) / 4; 
				
			} else {
				
				average = average / 3;
			}
			
			random = (Math.random() * 300) - 200;
			
			terrain[midX][maxY] = average + random * smoothingConst;
		}
	}
}

function Regions(terrain, mapWidth, mapWidthResolution) {

	var regionMap = new Array(mapWidth / mapWidthResolution);
	
	var regions = [];

	// Constructor
	(function(){
		
		for(var i = 0; i < regionMap.length; i++) {

			regionMap[i] = new Array(regionMap.length);
		}
			
		var areaIndex = 0;
		
		for(var x = 0; x < regionMap.length; x += 1) {
			
			for(var y = 0; y < regionMap.length; y += 1) {
							
				if(regionMap[x][y] === undefined) {
					
					var region = fillArea(x, y, areaIndex, convertRegionCoordinateToTerrainHeight(x, y) >= 0);
					
					regions.push(region);
									
					areaIndex += 1;
				}
			}
		}
	})();
	
	this.getRegionMap = function() {
	
		return regionMap;
	}
	
	this.getRegionList = function() {
	
		return regions;
	}
	
	function convertRegionCoordinateToTerrainHeight(x, y) {
	
		var terrainWidth = terrain.getHeightArray().length;
	
		return terrain.getHeight(x / regionMap.length, y / regionMap.length);
	}
	
	function fillArea(xStart, yStart, value, aboveZero) {
		
		var queue = new Array();
		
		queue.push({x: xStart, y: yStart});
		
		var squares = 0;
		
		while(queue.length > 0) {
			
			var position = queue.shift();
			
			if(position.x >= 0 && position.x < regionMap.length && position.y >= 0 && position.y < regionMap.length) {
				
				if(regionMap[position.x][position.y] === undefined) {
				
					var terrainHeight = convertRegionCoordinateToTerrainHeight(position.x, position.y);

					if((aboveZero && terrainHeight >= 0) || (!aboveZero && terrainHeight < 0)) {

						regionMap[position.x][position.y] = value;
						
						squares += 1;
						
						queue.push({x: position.x - 1, y: position.y});
						
						queue.push({x: position.x + 1, y: position.y});
						
						queue.push({x: position.x, y: position.y - 1});
						
						queue.push({x: position.x, y: position.y + 1});
						
						queue.push({x: position.x - 1, y: position.y - 1});
						
						queue.push({x: position.x + 1, y: position.y + 1});
						
						queue.push({x: position.x + 1, y: position.y - 1});
						
						queue.push({x: position.x - 1, y: position.y + 1});
					}
				}
			}			
		}
		
		var color = { 	r: Math.random()*255, 
						g: Math.random()*255, 
						b: Math.random()*255};
						
		return new Region(value, aboveZero, squares, new Point(xStart, yStart), color);
	}

	function Region(id, isLand, totalArea, point, color) {
		
		var center = null;
		
		this.getId = function() {
		
			return id;
		}
		
		this.getColor = function() {
		
			return color;
		}
		
		this.isLand = function() {
		
			return isLand;
		}
		
		this.getCenter = function() {
		
			if (center == null) {
			
				var markers = new Array(regionMap.length);
				
				for(var i = 0; i < regionMap.length; i++) {

					markers[i] = new Array(regionMap.length);
				}		
			
				var queue = new Array();
		
				queue.push(point);
				
				var squares = 0;
				
				var xTotal = 0;
				
				var yTotal = 0;
				
				while(queue.length > 0) {
					
					var position = queue.shift();
					
					if (position.getX() >= 0 && position.getX() < regionMap.length && position.getY() >= 0 && position.getY() < regionMap.length) {
						
						if (regionMap[position.getX()][position.getY()] == id && markers[position.getX()][position.getY()] === undefined) {
						
							markers[position.getX()][position.getY()] = true;
							
							xTotal += position.getX();
							
							yTotal += position.getY();
								
							squares += 1;
								
							queue.push(new Point(position.getX() - 1, position.getY()));
							
							queue.push(new Point(position.getX() + 1, position.getY()));
								
							queue.push(new Point(position.getX(), position.getY() - 1));
								
							queue.push(new Point(position.getX(), position.getY() + 1));
								
							queue.push(new Point(position.getX() - 1, position.getY() - 1));
								
							queue.push(new Point(position.getX() + 1, position.getY() + 1));
								
							queue.push(new Point(position.getX() + 1, position.getY() - 1));
								
							queue.push(new Point(position.getX() - 1, position.getY() + 1));
						}
					}			
				}
				
				var averagePoint = new Point(xTotal/squares, yTotal/squares);
				
				if (regionMap[Math.floor(averagePoint.getX())][Math.floor(averagePoint.getY())] == id) {
				
					center = new Point((averagePoint.getX() / (regionMap.length - 1)) * mapWidth, (averagePoint.getY() / (regionMap.length - 1)) * mapWidth);
					
				} else {
					
					for(var i = 0; i < regionMap.length; i++) {

						markers[i] = new Array(regionMap.length);
					}
				
					var closestPoint = point;
					
					var closestDistance = averagePoint.distance(point);
				
					queue = new Array();
			
					queue.push(point);
					
					while(queue.length > 0) {
						
						var position = queue.shift();
						
						if(position.getX() >= 0 && position.getX() < regionMap.length && position.getY() >= 0 && position.getY() < regionMap.length) {
							
							if(regionMap[position.getX()][position.getY()] == id && markers[position.getX()][position.getY()] === undefined) {
							
								markers[position.getX()][position.getY()] = true;
									
								var distance = averagePoint.distance(position);
								
								if(distance < closestDistance) {
								
									closestDistance = distance;
									
									closestPoint = position;
								}
									
								queue.push(new Point(position.getX() - 1, position.getY()));
									
								queue.push(new Point(position.getX() + 1, position.getY()));
									
								queue.push(new Point(position.getX(), position.getY() - 1));
									
								queue.push(new Point(position.getX(), position.getY() + 1));
									
								queue.push(new Point(position.getX() - 1, position.getY() - 1));
									
								queue.push(new Point(position.getX() + 1, position.getY() + 1));
									
								queue.push(new Point(position.getX() + 1, position.getY() - 1));
									
								queue.push(new Point(position.getX() - 1, position.getY() + 1));
							}
						}
					}

					center = new Point((closestPoint.getX() / (regionMap.length - 1)) * mapWidth, (closestPoint.getY() / (regionMap.length - 1)) * mapWidth);
				}
			}
		
			return center;
		}
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
	
	var magnitude = null;
	
	// Constructor
	(function(){
	
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
	})();
	
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
	
	// Constructor
	(function(){
	
		if(firstParam instanceof Point && secondParam instanceof Vector) {
			
			x = firstParam.getX() + secondParam.getI();
			
			y = firstParam.getY() + secondParam.getJ();
			
		} else {
			
			x = firstParam;
			
			y = secondParam;
		}
	})();
	
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
