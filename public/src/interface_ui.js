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
	overlayOff();

	let username = document.getElementById("usernameSubmit").value;
	let newScore = {};
	newScore["user"] = username;
	newScore["score"] = Number(timeElapsed.toFixed(1));

	let currentGameMode = currentGameParameters.difficulty;

	if (currentGameMode != 'custom') {
		database.ref(`highscores/${currentGameMode.toLowerCase()}/`).push(newScore, function(error) {
			if (error) {
				console.log("Failed");
			} else {
				readScores(currentGameMode.toLowerCase());
				console.log("success");
			}
		});
	}
	

	// submit score to database based on username, score, and difficulty
};