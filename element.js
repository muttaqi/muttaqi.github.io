/*
Muttaqi Islam
03/06/2018
A match-three game involving three elements, hence "Element"
*/

//colours
var pink = "#e27ed4";
var backColour = "#0b2025";

//types and its colours
var types = ["fire", "grass", "water"];
var typeColours = ["#f65e37", "#54bc59", "#2b9ed4"];

//used to ensure no animations are occuring during click function
var inputReady = true;
//state used in many ways
var state = "nothing";

//canvas
var canvas = document.querySelector('canvas');

//window dimensions
var wWidth = window.innerWidth;
var wHeight = window.innerHeight;

//set canvas dimensions to window
canvas.width = wWidth;
canvas.height = wHeight;

//get canvas context
var c = canvas.getContext('2d');

//line width for grid
c.lineWidth = 2;
//line colour
c.strokeStyle = pink;

//array stores coordinates of each tile
var tileCoords = [];
//dimension of tiles
var tileSize = 75;
//fill the array
for(var i = 0; i < 8; i ++) {
	
	for(var j = 0; j < 8; j ++) {
		
		var tX = tileSize*j + wWidth/2 - 4*tileSize;
		var tY = tileSize*i + wHeight*0.05 + 129;
		
		var tC = {};
		tC['id'] = i.toString() + j.toString();
		tC['x'] = tX;
		tC['y'] = tY;
		
		tileCoords.push(tC);
		
		c.strokeRect(tX, tY, tileSize, tileSize);
	}
}

//get title png
var title = new Image();
title.src="title.png";

//draw score text
c.font = "40px Georgia";
c.fillStyle = pink;
c.fillText("Score: 0", wWidth/50, wHeight * 0.15);
//stores score
var score = 0;

//stores time
var time = 30;

//draws background
function drawBackground() {
	
	//draw all grid lines
	for(var i = 0; i < 8; i ++) {
		
		for(var j = 0; j < 8; j ++) {
			
			var tX = tileSize*i + wWidth/2 - 4*tileSize;
			var tY = tileSize*j + wHeight*0.05 + 129;
			
			c.strokeRect(tX, tY, tileSize, tileSize);
		}
	}
	
	//draw title
	c.drawImage(title, wWidth/2 - 189, wHeight * 0.05);
}

//glows a tile
//params: x and y index of tile desired
function tileGlow(xIndex, yIndex, item) {
	
	var typeID = item.typeID;
	
	//get coordinates of tile
	var index = 8 * yIndex + xIndex;
	var x = tileCoords[index].x + 37,
    y = tileCoords[index].y + 37,
    // Radii of the glow.
    innerRadius = 5,
    outerRadius = 60,
    // Radius of the entire circle.
    radius = 50;

	//create gradient
	var gradient = c.createRadialGradient(x, y, innerRadius, x, y, outerRadius);
	//gradient from background colour to corresponding type's colour
	gradient.addColorStop(0, backColour);
	gradient.addColorStop(1, typeColours[typeID]);

	//draw gradient
	c.fillStyle = gradient;
	c.fillRect(x - 36, y - 36, 73, 73);

	//redraw the image
	var img = item.img;
	img.src = item.type.toString() + ".png"
	img.addEventListener(

		"load", 
		
		function(){
			
			c.drawImage(img, tileCoords[index].x, tileCoords[index].y);
		},
		
		false
	);
}

//clear the glow
//params: x and y index of tile desired
function clearGlow(glowX, glowY) {
	
	//get index
	var index = 8 * glowY + glowX;

	//clear the tile
	c.fillStyle = backColour;
	c.fillRect(tileCoords[index].x + 2, tileCoords[index].y + 2, tileSize - 3, tileSize - 3);
	
	//redraw image
	var x = items[7 - glowY][glowX].xPos;
	var y = items[7 - glowY][glowX].yPos;
	
	items[7 - glowY][glowX].glow = false;

	var img = new Image();
	
	img.src = items[7 - glowY][glowX].type + ".png";
	
	c.drawImage(img, x, y);
}

var speed;
class Item {
	
	//set up all item vars
	//params: x and y position of tile desired
	constructor(xPos, yPos) {
		
		this.draw = true;
		this.glow = false;
		
		this.soonToDelete = false;
		
		this.xPos = xPos;
		this.yPos = yPos;
		this.typeID = Math.floor(Math.random() * types.length);
		this.type = types[this.typeID];

		var img = new Image();
		img.src = this.type.toString() + ".png"
		
		this.img = img;
	}
	
	//redraws the item
	reDraw (xIndex, yIndex) {
		
		var index = 8 * yIndex + xIndex;
		
		this.xPos = tileCoords[index].x;
		this.yPos = tileCoords[index].y;
		
		var xPos = this.xPos;
		var yPos = this.yPos;
		
		c.fillStyle = backColour;
		c.fillRect(xPos + 2, yPos + 2, 69, 69);

		var img = new Image();
		img.src = this.type.toString() + ".png"
		img.addEventListener(

			"load", 
			
			function(){
			
				c.drawImage(img, xPos, yPos)
			},
			
			false
		);
		
		drawBackground();
		
		this.img = img;
	}
	
	//gives item a new type
	newType () {
		
		var xPos = this.xPos;
		var yPos = this.yPos;
		this.typeID = Math.floor(Math.random() * types.length);
		this.type = types[this.typeID];
	}
	
	//used in the beginning for initial items, executed row by row
	/*params: 
	items to drop in array
	yIndex of tile to drop top
	*/
	static dropEight(items, yIndex) {
		
		var currentI = 7 - yIndex
		
		var img = new Image();
		
		speed = 0.3;
		
		//set interval for drop animation
		var dEI;
		img.onload = new function () {
		
			dEI = setInterval(function() {dropEightActive(items, yIndex, currentI)}, 1000/500);
		};

		function dropEightActive(items, yIndex, currentI) {
						
			//gives acceleration effect
			if(speed < 50) {
					
				speed += 0.025;
			}
			
			//for each item, 
			for (let i of items ) {

				var x = i.xPos, y = i.yPos;
				var img = i.img;
				
				//if past desired y,
				if (y > tileCoords[8 * yIndex].y) {
					
					//stop interval and execute next row
					if (currentI != 7) {
						
						initRow(currentI + 1);
						
						clearInterval(dEI);
						
						break;
					}
					
					//unless last row
					else {
					
						inputReady = true;
					
						clearInterval(dEI);

						c.fillText("Timer: 30", wWidth/50, wHeight * 0.18 + 80);

						//after last row, set timer interval
						var interval = setInterval ( function() {
							return function() {
								
								//subtract from time and redraw text
								if (time > 0) {
									
									time --;
									
									c.fillStyle = backColour;
									c.fillRect(wWidth/50, wHeight * 0.18, 180, 100);
									
									c.fillStyle = pink;
									c.fillText("Timer: " + time, wWidth/50, wHeight * 0.18 + 80);
								}
								
								//if out of time, inform user of score and then reload page
								else {
									
									alert("You scored " + score + " points");
									location.reload();
								}
								
						};}(), 1000);
						
						break;
					}
				}
				
				//if not at desired y, add to y
				else {
					
					c.fillStyle = backColour;
					c.fillRect(x + 7, y + 8, 60, 60);
					drawBackground();
					
					y += speed;
					
					i.yPos = y;
				}
			}
			
			//draw all items in the array (with new y's)
			Item.drawAllItems(items);
		}
	}
	
	//draws items in an array
	//param: array of items, always 8 items
	static drawAllItems(items) {
	
		//for each item in the array
		for(var i = 0; i < 8; i ++) {
			
			//draw each item
			var x = items[i].xPos;
			var y = items[i].yPos;
		
			var img = new Image();
			
			img.src = items[i].type + ".png";
			
			c.fillStyle = backColour;
			
			if (!items[i].glow) {
				
				c.fillRect(x + 2, y + 2, 71, 71);
			}
			drawBackground();
			
			c.drawImage(img, x, y);
		}
	}
	
	//swaps items vertically
	/*params:
	lower item
	upper item
	boolean swap back (true if called within this method)
	*/
	static swapUpDown (downItem, upItem, swapBack) {
		
		var topLimit = upItem.yPos;
		var bottomLimit = downItem.yPos;
			
		var img1 = new Image();
		img1.src = upItem.type.toString() + ".png";
		var x1 = upItem.xPos;
		var img2 = downItem.img;
		img2.src = downItem.type.toString() + ".png";
		var x2 = downItem.xPos;
		
		var hasMatch = false;
		//swap animation
		var swapInterval = setInterval (function () {
				
			return function () {
				
				//represents end points for each item
				var y1 = upItem.yPos;
				var y2 = downItem.yPos;

				//if end points reached
				if (y1 >= bottomLimit && y2 <= topLimit) {
		
					//stop interval
					state = "nothing";
					
					clearInterval(swapInterval);
					
					//check all delete, store in var
					hasMatch = Item.checkAllDelete();
					
					//if no match found, swap back (match found handles in checkalldelete())
					if (!hasMatch && !swapBack) {
						
						Item.swapUpDown(upItem, downItem, true);
					}
				}
				
				//if either item hasn't reached its end point, add to y
				if (y1 < bottomLimit) {
					
					c.fillStyle = backColour;
					c.fillRect(x1, y1, 60, 60);
					
					y1 ++;
					
					upItem.yPos = y1;
				}
				
				if (y2 > topLimit) {
					
					c.fillStyle = backColour;
					c.fillRect(x2, y2, 60, 60);
					
					y2 --;
					
					downItem.yPos = y2;
				}
				
				drawBackground();
				
				//draw each image
				c.drawImage(img1, x1, y1);
				c.drawImage(img2, x2, y2);
			};
			}(),
			
			1000/500
		)
	}
	
	//SAME AS ABOVE BUT HORIZONTALLY
	static swapLeftRight(leftItem, rightItem, swapBack) {

		leftItem.draw = false;
		rightItem.draw = false;
		
		var leftLimit = leftItem.xPos;
		var rightLimit = rightItem.xPos;
			
		var img1 = new Image();
		img1.src = leftItem.type.toString() + ".png";
		var y1 = leftItem.yPos;
		var img2 = new Image();
		img2.src = rightItem.type.toString() + ".png";
		var y2 = rightItem.yPos;
		
		var hasMatch = false;
		
		var swapInterval = setInterval (function () {
				
			return function () {
				
				var x1 = leftItem.xPos;
				var x2 = rightItem.xPos;
				
				c.fillStyle = backColour;
				
				if (x1 >= rightLimit && x2 <= leftLimit) {

					leftItem.draw = true;
					rightItem.draw = true;
				
					state = "nothing";
					
					clearInterval(swapInterval);
					
					hasMatch = Item.checkAllDelete();
					
					if (!hasMatch && !swapBack) {
						
						Item.swapLeftRight(rightItem, leftItem, true);
					}
				}
				
				if (x1 < rightLimit) {
					
					c.fillRect(x1, y1, 60, 60);
					
					x1 ++;
					
					leftItem.xPos = x1;
				}
				
				if (x2 > leftLimit) {
					
					c.fillRect(x2, y2, 60, 60);
					
					x2 --;
					
					rightItem.xPos = x2;
				}
					
				drawBackground();
				
				c.globalAlpha = 1;
				
				c.drawImage(img1, x1, y1);
				c.drawImage(img2, x2, y2);
			};
		}(), 1000/500)
	}
	
	//check a column on grid
	//param: xIndex of column
	//returns whether or not a match found
	static checkVertical(xIndex) {
		
		var tempTypeArray = [];
		var sameIndex;
		var num = 2;
		
		var hasMatch = false;
		
		//for each item
		for (var i = 7; i >= 0; i --) {
			
			var type = items[i][xIndex].type;
			
			tempTypeArray.push(type);
			
			//if not last couple items
			if (i < 6) {
				
				//if same type as last 2/more items before it
				if ((tempTypeArray[7 - i] == tempTypeArray[6 - i]) &&
				(tempTypeArray[6 - i] == tempTypeArray[5 - i])) {
					
					//(has match is what is returned)
					hasMatch = true;
					
					//if same index hasn't been set
					if (sameIndex == null) {
						
						//set it
						sameIndex = i + 2;
					}
					
					//this holds how long the match is, 2 - 5
					num ++;
				}
			}
		}

		//if three or more match types
		if (num > 2) {
			
			//set corresponding soontodelete var to true
			if (num == 3) {
				
					items[sameIndex][xIndex].soonToDelete = true;
					items[sameIndex - 1][xIndex].soonToDelete = true;
					items[sameIndex - 2][xIndex].soonToDelete = true;
					
			} else if (num == 4) {
				
					items[sameIndex][xIndex].soonToDelete = true;
					items[sameIndex - 1][xIndex].soonToDelete = true;
					items[sameIndex - 2][xIndex].soonToDelete = true;
					items[sameIndex - 3][xIndex].soonToDelete = true;
			} else if (num == 5) {
				
					items[sameIndex][xIndex].soonToDelete = true;
					items[sameIndex - 1][xIndex].soonToDelete = true;
					items[sameIndex - 2][xIndex].soonToDelete = true;
					items[sameIndex - 3][xIndex].soonToDelete = true;
					items[sameIndex - 4][xIndex].soonToDelete = true;
			}
		}
		
		//return hasMatch
		return hasMatch;
	}
	
	//SAME AS ABOVE, BUT FOR ROWS
	static checkHorizontal(yIndex) {
		
		var tempTypeArray = [];
		var sameIndex;
		var num = 2;
		
		var hasMatch = false;
		
		for (var i = 0; i < 8; i ++) {
			
			var type = items[7 - yIndex][i].type;
			
			tempTypeArray.push(type);
			
			if (i > 1) {
				
				if ((tempTypeArray[i] == tempTypeArray[i - 1]) &&
				(tempTypeArray[i - 1] == tempTypeArray[i - 2])) {
					
					hasMatch = true;
					
					if (sameIndex == null) {
						
						sameIndex = i - 2;
					}
					
					num++;
				}
			}
		}
		
		if (num > 2) {
			
			if (num == 3) {
				
					items[7 - yIndex][sameIndex].soonToDelete = true;
					items[7 - yIndex][sameIndex + 1].soonToDelete = true;
					items[7 - yIndex][sameIndex + 2].soonToDelete = true;
			} else if (num == 4) {
				
					items[7 - yIndex][sameIndex].soonToDelete = true;
					items[7 - yIndex][sameIndex + 1].soonToDelete = true;
					items[7 - yIndex][sameIndex + 2].soonToDelete = true;
					items[7 - yIndex][sameIndex + 3].soonToDelete = true;
			} else if (num == 5) {
				
					items[7 - yIndex][sameIndex].soonToDelete = true;
					items[7 - yIndex][sameIndex + 1].soonToDelete = true;
					items[7 - yIndex][sameIndex + 2].soonToDelete = true;
					items[7 - yIndex][sameIndex + 3].soonToDelete = true;
					items[7 - yIndex][sameIndex + 4].soonToDelete = true;
			}
		}
		
		return hasMatch;
	}
	
	//checks all items and "deletes" desired items, and creates new items above
	//returns whether a match is found
	static checkAllDelete() {

		//stores number of new items to create per x
		var howManyToDropPerX = [0, 0, 0, 0, 0, 0, 0, 0];
		//stores number of items above deleted items per x
		var howManyAbovePerX = [-1, -1, -1, -1, -1, -1, -1, -1];
		//stores items to be deleted
		var toBeDeleted = [];
		
		var hasMatch = false;
		
		//for each item
		for (var j = 0; j < 8; j ++) {
			
			for (var i = 7; i >= 0; i --) {
				
				//if soontodelete = true
				if (items[i][j].soonToDelete) {
					
					hasMatch = true;
					
					//add to how many to drop
					howManyToDropPerX[j] ++;
					
					//if items above hasn't been set
					if (howManyAbovePerX[j] == -1) {
						
						//set
						howManyAbovePerX[j] = 7 - i;
					}
					toBeDeleted.push(items[i][j]);
					
					//for each item above
					for (var k = i; k < 8 - howManyToDropPerX[j]; k ++) {
						
						//set to item above
						items[k][j] = items[k + 1][j];
					}
				}
			}
		}
		
		var brighter = true;
		
		var transp = 0.01;
		
		state = "moving";
		inputReady = false;
		
		score += toBeDeleted.length;
		
		//if a match is found
		if (hasMatch) {
			
			//delete animation 
			var deleteInterval = setInterval (function () {
		
				return function () {
					
					c.fillStyle = backColour;
					//variant tranparency gives fading effect
					c.globalAlpha = transp;
					
					//draw over the item
					for (let i of toBeDeleted) {
						
						c.fillRect(i.xPos + 1, i.yPos, 73, 73);
					}
					
					//if transparency is past threshold
					if (c.globalAlpha >= 0.5) {
						
						//end interval
						clearInterval(deleteInterval);
						
						state = "nothing";
						inputReady = true;

						//for each column
						for (var j = 0; j < 8; j ++) {
							
							//create specified number of new items
							for (var i = 0; i < howManyToDropPerX[j]; i ++) {
								
								var index = 8 * i + j;
								
								var newItem = new Item(tileCoords[index].x, tileCoords[index].y);
								var type = newItem.type;
								
								items[7 - i][j] = newItem;
							}
						}
						
						c.globalAlpha = 1;
						
						drawBackground();
						
						//redraw all items
						for (var i = 0; i < 8; i ++) {
							
							for (var j = 0; j < 8; j ++) {
								
								items[7 - i][j].reDraw(j, i);
								
								items[7 - i][j].soonToDelete = false;
							}
						}
						
						//update score
						c.fillStyle = backColour;
						c.fillRect(wWidth/50, wHeight * 0.10, 200, 80);
						
						c.font = "40px Georgia";
						c.fillStyle = pink;
						c.fillText("Score: " + score.toString(), wWidth/50, wHeight * 0.15);
					
						//wait a bit, then re check all items
						setTimeout(function(){
							
							Item.checkAll();
							
							console.log(state);
						}, 500);
					}
					
					//otherwise, increase transparency
					else {
						
						transp += 0.01
					}
				};
			}(), 1000/500)
		}
		
		state = "nothing";
		inputReady = true;
		
		return hasMatch;
	}
	
	//checks all items
	//returns whether a match is found
	static checkAll() {
		
		var hasMatch = false;
		//for each row and column, check for matches
		for (var i = 0; i < 8; i ++) {
			
			if (Item.checkVertical(i)) {
				
				hasMatch = true;
			}
			
			if (Item.checkHorizontal(i)) {
				
				hasMatch = true;
			}
		}
		
		//if match is found, delete items
		if (hasMatch) {
			
			Item.checkAllDelete();
		}
		
		return hasMatch;
	}
}

//items[y][x], y from bottom to top
var items = [];

//initialize a row
function initRow(i) {
	
	var tempItems = [];

	//create 8 items
	for(var j = 0; j < 8; j ++) {
		
		var index = 8 * i + j;
		
		var item = new Item(tileCoords[index].x, 0);
		
		var type = item.type;
		
		//make sure the item doesn't create an immediate match
		if(i >= 2 && j >= 2) {
			
			while((type == (items[i - 1][j].type) && type == (items[i - 2][j].type)) ||
			(type == (tempItems[j - 1].type) && type == (tempItems[j - 2].type))) {
				
				item.newType();
				
				type = item.type;
			}
		}
		
		else if(i >= 2) {
			
			while(type == (items[i - 1][j].type) && type == (items[i - 2][j].type)) {
				
				item.newType();
				
				type = item.type;
			}
		}
		
		else if(j >= 2) {
			
			while(type == (tempItems[j - 1].type) && type == (tempItems[j - 2].type)) {
				
				item.newType();
				
				type = item.type;
			}
		}

		tempItems.push(item);
	}

	//add to 'items' array
	var dropEightInterval;
	//within dropeight, next row is initialized
	Item.dropEight(tempItems, 7 - i, dropEightInterval);
	
	items.push(tempItems);
}

//draw background and initialize rows
drawBackground();
initRow(0);

//handles click 
canvas.addEventListener('click', function(evt) {
	
	//if input ready
	if(inputReady) {
		
		var xIndex, yIndex;
	
		//if within the grid, get tile index
		if(!(evt.pageX <= (wWidth/2 - 4*tileSize) || evt.pageX >= (7*tileSize + wWidth/2 - 4*tileSize + tileSize)
			|| evt.pageY <= (wHeight*0.05 + 129) || evt.pageY >= (tileSize*7 + wHeight*0.05 + 129 + tileSize))) {
		
			for (let t of tileCoords) {
				
				if(evt.pageX >= t.x && evt.pageX <= t.x + 75 && 
				evt.pageY >= t.y && evt.pageY <= t.y + 75) {
					
					yIndex = Number(t.id.substring(0, 1));
					xIndex = Number(t.id.substring(1, 2));
					
					break;
				}
			}
		}
		
		//glow selected tile if no item already selected (stored in state)
		if(state.length >= 7 && state.substring(0, 7) == "nothing") {
			
			items[7 - yIndex][xIndex].glow = true;
			
			tileGlow(xIndex, yIndex, items[7 - yIndex][xIndex]);
			
			state = "selected" + xIndex.toString() + yIndex.toString();
		}
		
		//if an item already selected
		else if (state.length >= 8 && state.substring(0, 8) == "selected") {
			
			var selX = Number(state.substring(8, 9));
			var selY = Number(state.substring(9, 10));
			
			var xDif = xIndex - selX;
			var yDif = yIndex - selY;
			
			//if within grid
			if(yIndex != null) {
				
				//swap relevant items based on the clicked items position relative to the already selected item
				if (xDif == 1 && yDif == 0) {
					
					clearGlow(selX, selY);
					
					state = "animated";
					
					//swap animation
					Item.swapLeftRight(items[7 - yIndex][xIndex - 1], items[7 - yIndex][xIndex], false);
					
					//swap their positions in 'items' array
					var i1 = items[7 - yIndex][xIndex - 1];
					var i2 = items[7 - yIndex][xIndex];
					
					items[7 - yIndex][xIndex - 1] = i2;
					items[7 - yIndex][xIndex] = i1;
					
					var hasMatch = false;
					
					//check relevant rows and columns
					if (Item.checkHorizontal(yIndex)) {
						
						hasMatch = true;
					}
					
					if (Item.checkVertical(xIndex - 1)) {
						
						hasMatch = true;
					}
					
					if (Item.checkVertical(xIndex)) {
						
						hasMatch = true;
					}
					
					//if no match found swap back positions in 'items' (animation is called in swapleftright method)
					if (!hasMatch) {
						
						var i1 = items[7 - yIndex][xIndex - 1];
						var i2 = items[7 - yIndex][xIndex];
						
						items[7 - yIndex][xIndex - 1] = i2;
						items[7 - yIndex][xIndex] = i1;
					}
				}
				
				//same as above
				else if (xDif == -1 && yDif == 0) {
					
					clearGlow(selX, selY);
					
					state = "animated";
					
					Item.swapLeftRight(items[7 - yIndex][xIndex], items[7 - yIndex][xIndex + 1], false);
					
					var i1 = items[7 - yIndex][xIndex];
					var i2 = items[7 - yIndex][xIndex + 1];
					
					items[7 - yIndex][xIndex] = i2;
					items[7 - yIndex][xIndex + 1] = i1;
					
					var hasMatch = false;
					
					if (Item.checkHorizontal(yIndex)) {
						
						hasMatch = true;
					}
					
					if (Item.checkVertical(xIndex)) {
						
						hasMatch = true;
					}
					
					if (Item.checkVertical(xIndex + 1)) {
						
						hasMatch = true;
					}
					
					if (!hasMatch) {
						
						//Item.swapLeftRight(items[7 - yIndex][xIndex], items[7 - yIndex][xIndex + 1]);
						
						var i1 = items[7 - yIndex][xIndex];
						var i2 = items[7 - yIndex][xIndex + 1];
						
						items[7 - yIndex][xIndex] = i2;
						items[7 - yIndex][xIndex + 1] = i1;
					}
				}
				
				//same as above
				else if (yDif == 1 && xDif == 0) {
					
					clearGlow(selX, selY);
					
					state = "animated";
					
					Item.swapUpDown(items[7 - yIndex][xIndex], items[8 - yIndex][xIndex], false);
					
					var i1 = items[7 - yIndex][xIndex];
					var i2 = items[8 - yIndex][xIndex];
					
					items[7 - yIndex][xIndex] = i2;
					items[8 - yIndex][xIndex] = i1;
					
					var hasMatch = false;
					
					if (Item.checkHorizontal(yIndex)) {
						
						hasMatch = true;
					}
					
					if (Item.checkHorizontal(yIndex - 1)) {
						
						hasMatch = true;
					}
					
					if (Item.checkVertical(xIndex)) {
						
						hasMatch = true;
					}
					
					if (!hasMatch) {
					
						//Item.swapUpDown(items[7 - yIndex][xIndex], items[8 - yIndex][xIndex]);
						
						var i1 = items[7 - yIndex][xIndex];
						var i2 = items[8 - yIndex][xIndex];
						
						items[7 - yIndex][xIndex] = i2;
						items[8 - yIndex][xIndex] = i1;
					}
				}
				
				//same as above
				else if (yDif == -1 && xDif == 0) {
					
					clearGlow(selX, selY);
					
					state = "animated";
					
					Item.swapUpDown(items[6 - yIndex][xIndex], items[7 - yIndex][xIndex], false);
					
					var i1 = items[6 - yIndex][xIndex];
					var i2 = items[7 - yIndex][xIndex];
					
					items[6 - yIndex][xIndex] = i2;
					items[7 - yIndex][xIndex] = i1;
					
					var hasMatch = false;
					
					if (Item.checkHorizontal(yIndex)) {
						
						hasMatch = true;
					}
					
					if (Item.checkHorizontal(yIndex + 1)) {
						
						hasMatch = true;
					}
					
					if (Item.checkVertical(xIndex)) {
						
						hasMatch = true;
					}
					
					if (!hasMatch) {
					
						//Item.swapUpDown(items[6 - yIndex][xIndex], items[7 - yIndex][xIndex]);
						
						var i1 = items[6 - yIndex][xIndex];
						var i2 = items[7 - yIndex][xIndex];
						
						items[6 - yIndex][xIndex] = i2;
						items[7 - yIndex][xIndex] = i1;
					}
				}
				
				//if not adjacent items, just clear glow
				else {
					
					clearGlow(selX, selY);
					
					state = "nothing";
				}
			}
			
			//if not within grid, just clear glow
			else {
				
				clearGlow(selX, selY);
				
				state = "nothing";
			}
		}
	}
}
)

