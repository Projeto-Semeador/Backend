const express = require("express");
const crypto = require("crypto");
const cors = require("cors");
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

var users = []

function authenticateUser(user) {
	try {
		if (!users.find((u) => u.username === user.username)){
			throw new Error(`User not found with name ${user.username}`);
		}

		var selUser = users.find((u) => u.username === user.username);
		var hashedPasswd = hashPassword(user.password, selUser.salt);


		if (hashedPasswd[0] === selUser.password) {
			return true
		} else {
			throw new Error("Invalid password");
		}

	} catch (err) {
		throw err;
	}
}

function createUser(user) {
	var [hashedPasswd, salt] = hashPassword(user.password);

	try {
		if (users.find((u) => u.username === user.username)){
			throw new Error("User already exists");
		}

		users.push({ username: user.username, password: hashedPasswd, salt: salt });

		return users;
	} catch(error) {
		throw error;
	};
}

function hashPassword(passwd, salt) {
	if (!salt) {
		var salt = crypto.randomBytes(32).toString('hex');
	}
	return [crypto.pbkdf2Sync(passwd, salt, 2000, 64, 'sha512').toString('hex'), salt];
}

app.post("/login/create", (req,res) => {
	try {
		var {user} = req.body;

		var users = createUser(user);

		res.status(201).send();
	} catch (err) {
		res.status(400).send({error: err.message});
	}
});

app.post("/login", (req, res) => {
	try {
		var {user} = req.body 

		if (authenticateUser(user)) {
			res.status(200).send("Validated");
		} else {
			res.status(500).send("Unauthorized");
		}
	} catch (err) {
		res.status(400).send({error: err.message});
	}
});

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});

module.exports = app;
