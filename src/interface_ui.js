let gameUsername;

// Turn overlay message on
const overlayOn = () => {
	document.getElementById("overlay").style.display = 'block';
};

// Turn overlay message off
const overlayOff = () => {
	document.getElementById("endGame").style.visibility = "hidden";
	document.getElementById("overlay").style.display = 'none';
};

// When user wins, update the overlay message with time and difficulty played
const updateOverlayMessage = () => {
	document.getElementById("difficulty").innerHTML = `Difficulty: ${ currentGameParameters.difficulty }`;
	document.getElementById("timeNeeded").innerHTML = `Time: ${ timeElapsed.toFixed(1) }`
};

// Submit score to database
const submitScore = () => {
	document.getElementById("endGame").style.visibility = "hidden";
	overlayOff();

	// submit score to database based on username, score, and difficulty
};

const goToStart = () => {
	document.getElementById("userOptions").style.visibility = "visible";
	document.getElementById("userLogin").style.visibility = "hidden";
};

const goToLogin = () => {
	document.getElementById("userOptions").style.visibility = "hidden";
	document.getElementById("userLogin").style.visibility = "visible";
};

const goToGame = () => {
	document.getElementById("userOptions").style.visibility = "hidden";
	overlayOff();
};

const login = () => {
	document.getElementById("userLogin").style.visibility = "hidden";
	let features = document.getElementsByClassName("userOnlyFeature");
	for (let i = 0; i < features.length; i++) {
		features[i].style.display = "block";
	};
	overlayOff();

	// Set username on page
	let username = document.getElementById("usernameInput").value;
	gameUsername = username;
	document.getElementById("username").innerHTML = username;

	// database query with username

	// if username exists and has saved game, make load button appear
	// otherwise, do nothing
};