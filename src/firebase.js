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

const writeUserData = () => {
	database.ref('highscores/' + 'expert/').set({
		scores: [{'yummyblabla': 140}]
	}, function(error) {
		if (error) {
			console.log("Failed");
		} else {
			console.log("success");
		}
	})
}


writeUserData();

const readData = () => {
	let expert = document.getElementById("expert");

	let expertRef = database.ref('highscores/expert/');
	expertRef.on('value', (snapshot) => {
		let data = snapshot.val();
		console.log(data);
		expert.innerHTML = data.scores[0].yummyblabla;
	})
}

// readData();