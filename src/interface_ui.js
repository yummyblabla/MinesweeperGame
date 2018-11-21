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