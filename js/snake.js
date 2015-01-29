(function($) {

	var MapContext = Backbone.Model.extend({
		defaults: {
			HEIGHT: 400,
			WIDTH: 400,
			// Represented values on the map
			MAP_VALUE: {
				EMPTY: 0,
				LINE: 1,
				BOMB: 2
			},
			// Keyboard constant values (keyCode || keyIdentifier)
			KEYS: {
				UP: 38 || "Up",
				DOWN: 40 || "Down",
				LEFT: 37 || "Left",
				RIGHT: 39 || "Right",
				SPEED_UP: 65 || "U+0041",
				SPEED_DOWN: 83 || "U+0053"
			},
			MAX_SPEED: 7,
			MIN_SPEED: 1,
			UPDATE_INTERVAL: 50,
			ICON_SIZE: 24
		}
	});
	
	var mapConstants = new MapContext();
		
	var SnakeView = Backbone.View.extend({
		// Attach DOM elements to Backbone.View
		el: $('#snakeContainer')[0].getContext('2d'), // Canvas container
		icons: {
			bomb: $("#bomb")[0] // Image resource
		},
		
		state: {
			up: false,
			down: false,
			left: false,
			right: true,
			speed: 4
		},
		customPoint: {
			x: mapConstants.attributes.WIDTH / 2,
			y: mapConstants.attributes.HEIGHT / 2
		},		
		customMap: new Array(mapConstants.attributes.WIDTH),
		gameTime: 0,
		
		initialize: function() {
			// every function that uses 'this' as the current object should be in here
			_.bindAll(this, 
					'constructorCollisionMap', 
					'renderImage',
					'randomImgEmptyPosition',
					'snakeEvent',
					'renderPath',
					'moveTo',
					'timeCounter',
					'render',
					'keydown');

			$(document).on('keydown', this.keydown);
			this.constructorCollisionMap();
			this.snakeEvent();
			this.render(); 
			this.timeCounter();
			this.moveTo();
		},	
		
		// Initializes the map
		constructorCollisionMap: function() {
			var i, j;
			for (i = 0; i < this.customMap.length; i++) { 
				this.customMap[i] = new Array(mapConstants.attributes.HEIGHT);
				for (j = 0; j < this.customMap[i].length; j++) {
					this.customMap[i][j] = mapConstants.attributes.MAP_VALUE.EMPTY;
				}
			}
		},
		
		// Renders a image on the map
		renderImage: function(coordinates) {
			var i, j;
			
			this.el.drawImage(this.icons.bomb, 
					coordinates.x, 
					coordinates.y, 
					mapConstants.attributes.ICON_SIZE, 
					mapConstants.attributes.ICON_SIZE);
					
			for (i = coordinates.x; i < coordinates.x + mapConstants.attributes.ICON_SIZE; i++) {
				for (j = coordinates.y; j < coordinates.y + mapConstants.attributes.ICON_SIZE; j++) {
					this.customMap[i][j] = mapConstants.attributes.MAP_VALUE.BOMB;
				}
			}
		},
		
		// Calculates a empty position on the map
		randomImgEmptyPosition: function() {	
			var	i, j,
				emptyImgBlock = true,
				coordinates = {
					x: Math.floor((Math.random() * (400 - mapConstants.attributes.ICON_SIZE)) + 1),
					y: Math.floor((Math.random() * (400 - mapConstants.attributes.ICON_SIZE)) + 1)
				};
				
			// Checks for a empty map space ICON_SIZE x ICON_SIZE
			for (i = coordinates.x; i < coordinates.x + mapConstants.attributes.ICON_SIZE; i++) {
				for (j = coordinates.y; j < coordinates.y + mapConstants.attributes.ICON_SIZE; j++) {
					if (this.customMap[i][j] !== mapConstants.attributes.MAP_VALUE.EMPTY) {
						emptyImgBlock = false;
						break;
					}
				}
			}
			
			if (!emptyImgBlock) {
				// Return coordinates callback
				return this.randomImgEmptyPosition();
			} else {
				return coordinates;
			}
		},
		
		// Renders a new object on the map
		snakeEvent: function() {
			var that = this; 
			window.setTimeout(function(){
				// Render an image
				that.renderImage(that.randomImgEmptyPosition());
				// Call me again 
				that.snakeEvent();
			}, 500);
		},
		
		// Renders the custom point of the canvas line
		renderPath: function() {
			// Checks for collisions
			try {
				if (this.customMap[this.customPoint.x][this.customPoint.y] !== 
						mapConstants.attributes.MAP_VALUE.EMPTY) {
					alert("COLLISION - YOU LOOSE IN " + this.gameTime + " seconds");
					window.location = "index.html";
				}
			// Handle possible values out of range
			} catch(e) {
				alert("COLLISION - YOU LOOSE IN " + this.gameTime + " seconds");
				window.location = "index.html";
			}
		
			this.el.lineTo(this.customPoint.x, this.customPoint.y);
			// Map point is now occupy by a line
			this.customMap[this.customPoint.x][this.customPoint.y] = mapConstants.attributes.MAP_VALUE.LINE;
			this.el.stroke();
		},
		
		// Calculates the next point of the canvas line
		moveTo: function() {
			var that = this;
			window.setTimeout(function(){
				if (that.state.up) {
					that.customPoint.y--;
				} else if (that.state.down) {
					that.customPoint.y++;
				} else if (that.state.left) {
					that.customPoint.x--;
				} else if (that.state.right) {
					that.customPoint.x++;
				}
				
				// Render next point of the line
				that.renderPath(that.customPoint.x, that.customPoint.y);
				// Call me again to refresh update interval (speed)
				that.moveTo(that.customPoint);
			}, mapConstants.attributes.UPDATE_INTERVAL / this.state.speed);
		},
		
		// Calculates the played time
		timeCounter: function() {
			var that = this; 
            window.setInterval(function() {
                that.gameTime++;
        	}, 1000);
        },
		
		// Render maps border
		render: function() {
			this.el.beginPath();
			this.el.lineWidth = 1;
			this.el.strokeStyle = "#4e4e4e";
			this.el.moveTo(0, 0);
			this.el.lineTo(0, mapConstants.attributes.WIDTH);
			this.el.lineTo(mapConstants.attributes.HEIGHT, mapConstants.attributes.WIDTH);
			this.el.lineTo(mapConstants.attributes.HEIGHT, 0);
			this.el.lineTo(0, 0);
			this.el.moveTo(this.customPoint.x, this.customPoint.y);
			this.el.stroke();
			this.el.strokeStyle = "#f00";
		},
		
		// Keydown event
		keydown: function(event) {
			switch (event.keyCode) {
				case mapConstants.attributes.KEYS.UP:
					if (!this.state.down) {
						this.state.up = true;
						this.state.down = false;
						this.state.left = false;
						this.state.right = false;
						console.log("UP");
					}
					break;
				case mapConstants.attributes.KEYS.DOWN:
					if (!this.state.up) {
						this.state.up = false;
						this.state.down = true;
						this.state.left = false;
						this.state.right = false;
						console.log("DOWN");
					}
					break;
				case mapConstants.attributes.KEYS.LEFT:
					if (!this.state.right) {
						this.state.up = false;
						this.state.down = false;
						this.state.left = true;
						this.state.right = false;
						console.log("LEFT");
					}
					break;
				case mapConstants.attributes.KEYS.RIGHT:
					if (!this.state.left) {
						this.state.up = false;
						this.state.down = false;
						this.state.left = false;
						this.state.right = true;
						console.log("RIGHT");
					}
					break;
				case mapConstants.attributes.KEYS.SPEED_UP:
					if (this.state.speed >= mapConstants.attributes.MIN_SPEED && 
							this.state.speed < mapConstants.attributes.MAX_SPEED) {					
						this.state.speed++;
						console.log("SPEED UP");
					}
					break;
				case mapConstants.attributes.KEYS.SPEED_DOWN:
					if (this.state.speed > mapConstants.attributes.MIN_SPEED && 
							this.state.speed <= mapConstants.attributes.MAX_SPEED) {					
						this.state.speed--;
						console.log("SPEED DOWN");
					}
					break;
			}
		}
	});

	// Instantiate main app view.
	var snakeView = new SnakeView();
		
})(jQuery);

