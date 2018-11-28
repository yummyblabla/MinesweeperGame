/* -----------------------------------------------------*/
/* -----------------------------------------------------*/
/* ------------------Global Variables------------------ */
/* -----------------------------------------------------*/
/* -----------------------------------------------------*/

// Canvas Variables
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');

let then = Date.now();

canvas.width = 1000;
canvas.height = 600;

// Image Paths and Image Loading Variables
const cell0Path = "./assets/MINESWEEPER_0.png"; // 0
const cell1Path = "./assets/MINESWEEPER_1.png"; // 1
const cell2Path = "./assets/MINESWEEPER_2.png"; // 2
const cell3Path = "./assets/MINESWEEPER_3.png"; // 3
const cell4Path = "./assets/MINESWEEPER_4.png"; // 4
const cell5Path = "./assets/MINESWEEPER_5.png"; // 5
const cell6Path = "./assets/MINESWEEPER_6.png"; // 6
const cell7Path = "./assets/MINESWEEPER_7.png"; // 7
const cell8Path = "./assets/MINESWEEPER_8.png"; // 8
const cellXPath = "./assets/MINESWEEPER_X.png"; // 9
const minePath = "./assets/MINESWEEPER_M.png"; // 10
const flagPath = "./assets/MINESWEEPER_F.png"; // 11
const clockPath = "./assets/MINESWEEPER_C.png"; // 12
const trayPath = "./assets/MINESWEEPER_tray.png"; // 13
const resetPath = "./assets/reset.png"; // 14
const imageURLs = [cell0Path, cell1Path, cell2Path, cell3Path, cell4Path, cell5Path, cell6Path, cell7Path, cell8Path, cellXPath, minePath, flagPath, clockPath, trayPath, resetPath];
const images = [];
let imageCount = 0;
let allLoaded = false;

// Audio
const sounds = [];
const bombSound = "./assets/sounds/bomb.mp3";
let soundToPlay = 0;

// UI Controls
const heightForUI = 100;

// UI Parameters
const uiSettings = {
	colour: 'black',
	fontSize: 30,
	fontStyle: "Comic Sans MS"
};

// Reset Button Parameters
const resetObject = {
	canvasX: 50,
	canvasY: 18,
	width: 213, // 71
	height: 63 // 21
}

// Booleans required for click listeners and chording
let rightHeld = false;
let leftHeld = false;

// Game Settings (e.g. cellSize)
const gameSettings = {
	cellSize: 100,
	iconSize: 40
};

// Current Game Parameters (rows, cols, mines)
const currentGameParameters = {
	rows: 8,
	cols: 8,
	mines: 10,
	difficulty: 'Beginner'
};

// Time
let timeElapsed = 0;

// Cell Class
const Cell = function Cell(row, col, isMine) {
	this.row = row;
	this.col = col;
	this.isMine = isMine;
	// Number of mines around the Cell
	this.activeNeighbours = 0;
	// Array of Cells that are around the cell
	this.neighbours = [];
	this.revealed = false;
	this.flagged = false;
};

// Neighbour Setter for Cell
Cell.prototype.setNeighbours = function(neighbour) {
	this.neighbours.push(neighbour);
	// If neighbour is bomb, add 1 to its activeNeighbour number
	this.activeNeighbours += (neighbour.isMine ? 1 : 0);
};

// Neighbour getter for Cell
Cell.prototype.getNeighbours = function() {
	return this.neighbours;
};

// Method used to determine if game is ended. If all cells are either revealed or a mine, game ends
Cell.prototype.isRevealed = function() {
	return this.revealed || this.isMine;
}

// Reveal cell if it has been clicked
Cell.prototype.reveal = function() {

	// If mine is revealed, Game is over and stop function
	if (this.isMine) {
		this.revealed = true;
		Game.over = true;
		Game.complete(false);
		playBombSound();
		return;
	};

	// Proceed as normal and propagate other nearby cell if current cell has 0 mines nearby
	this.revealed = true;
	if (this.activeNeighbours === 0) {
		let neighbours = this.getNeighbours();
		for (let i = 0; i < neighbours.length; i++) {
			// if neighbour is not revealed and it isn't flagged, then reveal it
			if (!neighbours[i].isRevealed() && !neighbours[i].flagged) {
				neighbours[i].reveal();
				
			};
		};
	};
	// Check if game is completed with every reveal
	Board.validate();
	
};

// Flag cell only if it hasn't been revealed
Cell.prototype.flag = function() {
	// Can only flag if cell is not revealed
	if (!this.revealed) {
		// For Game Mode (No Mistakes)
		if (Game.noMistakes) {
			// Once flagged, you cannot unflag
			if (!this.flagged) {
				this.flagged = !this.flagged;
			};
		} else {
			// Other game modes, you can go back and forth
			this.flagged = !this.flagged;
		};
	};
};

// Chord the cell if number of flags around cell is same number as activeNeighbours
Cell.prototype.chord = function() {
	if (!this.isMine) {
		let neighbours = this.getNeighbours();
		let flagged = 0;
		for (let i = 0; i < neighbours.length; i++) {
			if (neighbours[i].flagged) {
				flagged++;
			};
		};
		let data = [];
		if (flagged == this.activeNeighbours) {
			for (let i = 0; i < neighbours.length; i++) {
				if (!neighbours[i].revealed && !neighbours[i].flagged) {
					neighbours[i].reveal();
				};
			};
		};
	};
};

// Board object
const Board = {
	board: [],
	mineLocations: {},
	// Resets board properties with rows, cols, and number of mines
	reset: function(rows, cols, numMines) {
		this.cols = cols;
		this.rows = rows;
		this.board = [];
		this.mineLocations = {};

		// Invoke generateMines method to add mines to mineLocations
		this.generateMines(numMines);

		// Update canvas size for different number of rows and cols
		updateCanvasSize(rows, cols);

		// Build board structure by pushing Cell class to board indices
		for (let row = 0; row < this.rows; row++) {
			rowArray = [];
			this.board.push(rowArray);
			for (let col = 0; col < this.cols; col++) {
				let isMine = this.mineLocations[row] && this.mineLocations[row][col];
				if (isMine == undefined) {
					isMine = false;
				};
				rowArray.push(new Cell(row, col, isMine));
			};
		};

		// Assign neighbour reference for each cell
		this.iterateCells((cell) => {
			let neighbours = this.calculateNeighbours(cell);
			for (let i = 0; i < neighbours.length; i++) {
				cell.setNeighbours(neighbours[i]);
			}
		});
	},
	// Calls generateMine method for every mine preset
	generateMines: function(numMines) {
		// For number of mines, generate numBombs of mines
		for (let i = 0; i < numMines; i++) {
			this.generateMine();
		};
	},
	// Generate mine at a random location
	generateMine: function() {
		// Generates random col and row for mine
		let col = Math.floor(Math.random() * this.cols);
		let row = Math.floor(Math.random() * this.rows);

		// If duplicate exists, run function again
		// If statement checks if object for row exists first, then checks for row and col for bomb
		if (this.mineLocations[row] && this.mineLocations[row][col]) {
			return this.generateMine();
		};

		// Creates an object in mine location with value col if key does not exist, or uses existing key
		this.mineLocations[row] = this.mineLocations[row] || {};
		this.mineLocations[row][col] = true;
	},
	// Run a callback on each cell in the board
	iterateCells: function(callback) {
		for (let row = 0; row < this.rows; row++) {
			for (let col = 0; col < this.cols; col++) {
				callback(this.getCell(row, col));
			};
		};
	},
	// Cell getter for an index on the board
	getCell: function(row, col) {
		return this.board[row][col];
	},
	// Returns an array of neighbours (cells) that the current cell is touching
	calculateNeighbours: function(cell) {
		data = [];
		let row = cell.row;
		let col = cell.col;
		for (let i = row - 1; i <= row + 1; i++) {
			// Checks beyond upper and lower edge cases, if invalid index, move on to next iteration
			if (i < 0 || i >= this.rows) {
				continue;
			};
			for (let j = col - 1; j <= col + 1; j++) {
				// Checks beyond side cases, if invalid index, move on to next iteration
				if (j < 0 || j >= this.cols) {
					continue;
				};
				// Checks same indices, if same, move on to next iteration
				if (row == i && col == j) {
					continue;
				};
				// Append Cell to data array
				data.push(this.getCell(i, j));
			};
		};
		return data;
	},
	// Checks all cells on the board if either revealed or a mine.
	validate: function() {
		let numActive = 0;
		// Add 1 to numActive if cell isn't revealed or a mine
		this.iterateCells((cell) => {
			numActive += cell.isRevealed() ? 0 : 1;
		});
		// if numActive == 0, game is complete
		if (!numActive) {
			Game.complete(true);
		};
	},
	// Check how many cells are flagged
	checkFlags: function() {
		let numFlags = 0;
		// Add 1 to numFlags if cell is flagged
		this.iterateCells((cell) => {
			numFlags += cell.flagged ? 1 : 0;
		});
		return numFlags;
	}
};

// Game Object
const Game = {
	over: false,
	started: false,
	// Game Mode (No Flags)
	noFlags: false,
	// Game Mode (No Mistakes when flagging)
	noMistakes: false,
	wonGame: false,
	// Method when game is completed by winning or losing
	complete: function(win) {
		this.over = true;
		this.started = false;
		this.wonGame = win;
		// If won, run code
		if (win) {
			updateOverlayMessage();
			overlayOn();
			document.getElementById("endGame").style.visibility = "visible";
		};
	},
	// Starts game
	start: function() {
		leftHeld = false;
		rightHeld = false;
		// Gets parameters for board reset
		let rows = currentGameParameters.rows;
		let cols = currentGameParameters.cols;
		let numMines = currentGameParameters.mines;

		// Resets board
		Board.reset(rows, cols, numMines);
		// Resets variables
		this.over = false;
		this.started = false;
		this.wonGame = false;
		timeElapsed = 0;
		// Draw the board, but don't run main() for performance
		render();
	}
};


/* -----------------------------------------------------*/
/* -----------------------------------------------------*/
/* --------------------Functions------------------------*/
/* -----------------------------------------------------*/
/* -----------------------------------------------------*/

// Restricts width and height parameter to being between 8 and 40
const minMaxParameter = (parameter) => {
	if (parameter < 8) {
		return 8;
	} else if (parameter > 40) {
		return 40;
	} else {
		return parameter;
	};
};

// Restricts number of mines to being between 8 and maximum
const minMaxMines = (mines, width, height) => {
	if (mines < 10) {
		return 10;
	} else if (mines > width * height / 2) {
		// credits to Kevin Mark for finding a bug here because I forgot to add Divide by 2
		return width * height / 2;
	} else {
		return mines;
	};
};

// Checks difficulty if custom settings are set (matches custom settings with default difficulties)
const checkDifficulty = (width, height, mines) => {
	if (width == 8 && height == 8 && mines == 10) {
		// Beginner Mode (Width: 8, Height: 8, Mines: 10)
		return 'Beginner';
	} else if (width == 16 && height == 16 && mines == 40) {
		// Intermediate Mode (Width: 16, Height: 16, Mines: 40)
		return 'Intermediate';
	} else if (width = 30 && height == 16 && mines == 99) {
		// Expert Mode (Width: 30, Height: 16, Mines: 99)
		return 'Expert';
	} else {
		return 'Custom';
	};
};

// Set level from predefined difficulty levels
const setLevel = (col, row, mines, difficulty) => {
	document.getElementById("width").value = col;
	document.getElementById("height").value = row;
	document.getElementById("mines").value = mines;

	changeGameParameters(difficulty);
};

// Change game parameters based on user input
const changeGameParameters = (difficulty) => {
	// Get values from input
	let width = document.getElementById("width").value;
	let height = document.getElementById("height").value;
	let mines = document.getElementById("mines").value;

	// Checks if parameters are within limits
	width = minMaxParameter(width);
	height = minMaxParameter(height);
	mines = minMaxMines(mines, width, height);

	// Double check if parameters are custom, parameters may be the same as predefined difficulty
	if (difficulty == 'Custom') {
		currentGameParameters.difficulty = checkDifficulty(width, height, mines);
	} else {
		currentGameParameters.difficulty = difficulty;
	};
	changeCellSize(currentGameParameters.difficulty);
	changeButtonColour(currentGameParameters.difficulty);

	// Change game parameter properties
	currentGameParameters.rows = height;
	currentGameParameters.cols = width;
	currentGameParameters.mines = mines;

	// Change DOM input values
	document.getElementById("width").value = width;
	document.getElementById("height").value = height;
	document.getElementById("mines").value = mines;

	// Reset board and game properties
	Game.start();
};

const changeCellSize = (difficulty) => {
	if (difficulty == "Expert") {
		gameSettings.cellSize = 35;
	} else if (difficulty == "Intermediate") {
		gameSettings.cellSize = 50;
	} else if (difficulty == "Beginner") {
		gameSettings.cellSize = 100;
	}
}


const changeButtonColour = (difficulty) => {
	let beginner = document.getElementById("Beginner");
	let intermediate = document.getElementById("Intermediate");
	let expert = document.getElementById("Expert");
	let buttonArray = [beginner, intermediate, expert];

	for (let i = 0; i < buttonArray.length; i++) {
		if (difficulty != buttonArray[i].id) {
			buttonArray[i].className = "h4 notSelected";
		} else {
			buttonArray[i].className = "h4 selected";
		};
	};
};

const playBombSound = () => {
	let sound = sounds[soundToPlay % sounds.length];
	sound.play();
	soundToPlay++;
}

// Load sounds to the page to play
const soundInit = () => {
	for (let i = 0; i < 2; i++) {
		let sound = new Audio();
		sound.src = bombSound;
		sounds.push(sound);
	};
};

// Load all images used to image array for drawing
const imageInit = () => {
	// Loop through each URL in imageURLs
	imageURLs.forEach(src => {
		const image = new Image();
		image.src = src;
		imageCount++;
		image.onload = () => {
			if (imageCount == imageURLs.length) {
				// When all images have loaded
				allLoaded = true;
				// Render canvas when images are done loading
				render();
			};
		};
		images.push(image);
	});
};


// Get mouse position on Canvas
const getMousePos = (canvas, event) => {
	let rect = canvas.getBoundingClientRect();
	// Return mouse click position based on canvas location on browser
	return {
		x: event.clientX - rect.left,
		y: event.clientY - rect.top
	};
};

// Checks the state if game has started
const checkToStartGame = (cell) => {
	let row = cell.row;
	let col = cell.col;
	// Keep changing board if the starting reveal's cell activeNeighbours isn't 0 or is mine
	while (Board.getCell(row, col).activeNeighbours != 0 || Board.getCell(row, col).isMine) {
		Board.reset(currentGameParameters.rows, currentGameParameters.cols, currentGameParameters.mines);
	};
	// Start game
	Game.started = !Game.started;
	// Initiates the start of the game time
	then = Date.now();
	// Once a cell is revealed, start game loop
	main();
};

// Add Event Listeners to the Page
const addEventListeners = () => {
	// Event Listeners
	canvas.addEventListener("mousedown", (event) => {
		event.preventDefault();

		let leftClick = (event.button != 2) ? true : false;
		if (leftClick) {
			leftHeld = true;
		} else {
			rightHeld = true;
		};
		let mousePos = getMousePos(canvas, event);

		if (!leftClick) {
			click(event, mousePos.x, mousePos.y);
		};
	});
	canvas.addEventListener("mouseup", (event) => {
		event.preventDefault();
		let leftClick = (event.button != 2) ? true : false;
		if (leftClick) {
			leftHeld = false;
		} else {
			rightHeld = false;
		};
		let mousePos = getMousePos(canvas, event);

		if (leftClick) {
			click(event, mousePos.x, mousePos.y);
		};
	});

	// Remove Right Click from opening context menu
	window.addEventListener("contextmenu", (event) => {
		event.preventDefault();
	}, false);
};

const click = (event, x, y) => {
	let leftClick = (event.button != 2) ? true : false;

	let cellRow = parseInt((y  - heightForUI) / gameSettings.cellSize);
	let cellCol = parseInt(x / gameSettings.cellSize);

	// Left click handler
	if (leftClick && !leftHeld) {
		// UI Interaction
		if (x >= resetObject.canvasX && x <= resetObject.canvasX + resetObject.width && 
			y >= resetObject.canvasY && y <= resetObject.canvasY + resetObject.height) {
			Game.start();
			return;
		};
		// Check if click is on board
		if (1 / cellRow > 0 && 0 <= cellRow && cellRow < Board.rows && 0 <= cellCol && cellCol <= Board.cols) {
			let cell = Board.getCell(cellRow, cellCol);

			// If right click is held
			if (rightHeld) {
				cell.chord();
			} else {
				// If game has not started, start game
				if (!Game.started && !Game.over) {
					checkToStartGame(cell);
					// Get new board's cell in case the board was changed while starting game
					Board.getCell(cellRow, cellCol).reveal();
				} else {
					if (!cell.flagged && !Game.over) {
						// If cell isn't revealed or game isn't over
						cell.reveal();
					};
				};
				
			};
		};
	}
	// Right click handler
	if (!leftClick && rightHeld && Game.started) {
		if (1 / cellRow > 0 && 0 <= cellRow && cellRow < Board.rows && 0 <= cellCol && cellCol <= Board.cols) {
			let cell = Board.getCell(cellRow, cellCol);
			if (leftHeld) {
				cell.chord();
			} else if (!Game.noFlags) {
				// Check if game isn't no flagged mode
				cell.flag();
			};
		};
	};
}

// Update Canvas Size when size of the board changes
const updateCanvasSize = (rows, cols) => {
	canvas.height = rows * gameSettings.cellSize + heightForUI;
	canvas.width = cols * gameSettings.cellSize;
};

// Draw tray above board for UI
const drawTray = () => {
	ctx.drawImage(images[13], 0, 0, canvas.width, heightForUI);
};

// Draw clock icon for amount of time taken to play
const drawClock = () => {
	ctx.drawImage(images[12], canvas.width - 125, heightForUI - 87, gameSettings.iconSize, gameSettings.iconSize);

	// Draw text of time elapsed
	ctx.fillStyle = uiSettings.colour;
	ctx.font = `${uiSettings.fontSize}px ${uiSettings.fontStyle}`;
	ctx.textAlign = "center";
	ctx.textBaseline = "top";
	ctx.fillText(`${timeElapsed.toFixed(1)}` , canvas.width - 45, heightForUI - 84);
};

// Draw mine icon for number of mines left
const drawMinesLeft = () => {
	ctx.drawImage(images[10], canvas.width - 125, heightForUI - 48, gameSettings.iconSize, gameSettings.iconSize);

	// Draw text of number of mines left
	ctx.fillStyle = uiSettings.colour;
	ctx.font = `${uiSettings.fontSize}px ${uiSettings.fontStyle}`;
	ctx.textAlign = "center";
	ctx.textBaseline = "top";
	ctx.fillText(`${currentGameParameters.mines - Board.checkFlags()}` , canvas.width - 50, heightForUI - 45);
};

// Draw Restart button on UI tray
const drawRestartButton = () => {
	ctx.drawImage(images[14], resetObject.canvasX, resetObject.canvasY, resetObject.width, resetObject.height);
};

// Render function that draws on canvas
const render = () => {
	// Clear canvas everytime you draw
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Draw UI Elements
	drawTray();
	drawClock();
	drawMinesLeft();
	drawRestartButton();

	// Draw cells of the board
	for (let col = 0; col < Board.cols; col++) {
		for (let row = 0; row < Board.rows; row++) {

			let cellNumber = Board.getCell(row, col);
			if (allLoaded) {
				if (cellNumber.flagged) {
					// Image instance, x, y, width, height
					// Draw flag if cell is flagged
					ctx.drawImage(images[11], col * gameSettings.cellSize, heightForUI + row * gameSettings.cellSize, gameSettings.cellSize, gameSettings.cellSize);
				} else {
					if (!cellNumber.revealed) {
						// Draw default cell if cell is not revealed
						ctx.drawImage(images[9], col * gameSettings.cellSize, heightForUI + row * gameSettings.cellSize, gameSettings.cellSize, gameSettings.cellSize);
					}
					if (cellNumber.revealed) {
						if (cellNumber.isMine) {
							// Draw mine if revealed
							ctx.drawImage(images[10], col * gameSettings.cellSize, heightForUI + row * gameSettings.cellSize, gameSettings.cellSize, gameSettings.cellSize);
						} else {
							// Draw number when revealed and not mine
							ctx.drawImage(images[cellNumber.activeNeighbours], col * gameSettings.cellSize, heightForUI + row * gameSettings.cellSize, gameSettings.cellSize, gameSettings.cellSize);
						};
					};
				};
			};
		};
	};
};

// Update function that updates variables as game is played
const update = (modifier) => {
	// Update Time Elapsed when Game has started and when Game isn't over
	if (Game.started && !Game.over) {
		if (timeElapsed >= 999) {
			timeElapsed = 999;
		} else {
			timeElapsed += modifier;
		};
	};
};

// Main game loop
const main = () => {

	let now = Date.now();
	// Time elapsed in milliseconds
	let delta = now - then;

	then = now;

	update(delta / 1000);
	render();
	// If game has started, keep running game loop. Otherwise, don't keep running game loop for performance
	if (Game.started) {
		requestAnimationFrame(main);
	};
};

// Initialize game
const initialize = () => {
	// Load Images
	imageInit();
	// Load Sounds
	soundInit();

	// Add Event Listeners (click)
	addEventListeners();

	Game.start();
	main();
};

initialize();

