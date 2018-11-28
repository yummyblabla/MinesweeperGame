const config = {
	apiKey: "AIzaSyBbDB1gk-Ue7G90UxdxQA22G1_EAGTQdHY",
	authDomain: "minesweeper-50f64.firebaseapp.com",
	databaseURL: "https://minesweeper-50f64.firebaseio.com",
	projectId: "minesweeper-50f64",
	storageBucket: "minesweeper-50f64.appspot.com",
	messagingSenderId: "206237431770"
};

firebase.initializeApp(config);

const database = firebase.database();

const readScores = (difficulty) => {
	let scoreLocation = document.getElementById(difficulty);

	let expertRef = database.ref(`highscores/${difficulty}`);
	expertRef.orderByChild('score').limitToFirst(5).once('value', (snapshot) => {
		let newDiv = document.createElement("div");
		snapshot.forEach((child) => {
			let data = child.val();
			let score = document.createElement("p");
			score.innerHTML = `${ data["user"] }: ${ data["score"] }`;
			newDiv.appendChild(score);
		});
		while (scoreLocation.firstChild) {
			scoreLocation.removeChild(scoreLocation.firstChild);
		};
		scoreLocation.appendChild(newDiv);
	});
};

// readScores('expert');
// readScores('intermediate');
// readScores('beginner');