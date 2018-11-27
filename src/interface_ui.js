// No flagging mines allowed
const noFlagMode = () => {
	// Can only change mode if game hasn't started
	if (!Game.started) {
		Game.noFlags = !Game.noFlags;
	};

	// Change class of the button depending on truthiness of mode
	if (Game.noFlags) {
		document.getElementById("noFlags").className = "h4 selected";
	} else {
		document.getElementById("noFlags").className = "h4 notSelected";
	};
};

// No mistakes with Flagging allowed
const noMistakesMode = () => {
	// Can only change mode if games hasn't started
	if (!Game.started) {
		Game.noMistakes = !Game.noMistakes;
	};

	// Change class of the button depending on truthiness of mode
	if (Game.noMistakes) {
		document.getElementById("noMistakes").className = "h4 selected";
	} else {
		document.getElementById("noMistakes").className = "h4 notSelected";
	};
};

// Turn overlay message on
const overlayOn = () => {
	document.getElementById("overlay").style.display = 'block';
	if (currentGameParameters.difficulty == 'Custom') {
		document.getElementById("noCustom").style.display = "none";
	} else {
		document.getElementById("noCustom").style.display = "block";
	}
};

// Turn overlay message off
const overlayOff = () => {
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
	if (Game.wonGame) {
		let username = document.getElementById("usernameSubmit").value;
		let newScore = {};
		newScore["user"] = username;
		newScore["score"] = Number(timeElapsed.toFixed(1));

		let currentGameMode = currentGameParameters.difficulty;

		if (currentGameMode != 'Custom') {
			database.ref(`highscores/${currentGameMode.toLowerCase()}/`).push(newScore, function(error) {
				if (error) {
					console.log("Failed");
				} else {
					readScores(currentGameMode.toLowerCase());
					console.log("success");
				}
			});
		};
	};
	// submit score to database based on username, score, and difficulty
};