const express = require("express");
const multer = require("multer");
const crypto = require("crypto");
const cors = require("cors");
const path = require("path");
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Validate the file mimetype and extension
function validateFile(file, cb) {
	const allowedTypes = /jpeg|jpg|png|webp/;
	const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
	const mimetype = allowedTypes.test(file.mimetype);

	if (extname && mimetype) {
		return cb(null, true);
	} else {
		cb("Invalid file type");
	}
}

// Set storage properties for mutlter
const storage = multer.diskStorage({
	destination: "./uploads/",
	filename: (_, file, cb) => {
		cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
	}
})

const upload = multer({ dest: 'uploads/', fileFilter: (_, file, cb) => validateFile(file, cb), storage })

// TODO: Remove this on db integration
var users = []
var tokens = []

// Returns true if user in database
function validateUser(user) {
	if (!users.find((u) => u.username === user.username)){
		throw new Error(`User not found with name ${user.username}`);
	}

	return true;
}

// Creates token for password recovery
function createRecoveryToken(user) {
	try {
		validateUser(user);

		var token = crypto.randomBytes(16).toString('hex');

		tokens.push({ username: user.username, token: token })

		return token;
	} catch (err) {
		throw err;
	}
}

// Retrieves token for password recovery
function retrieveToken(token) {
	var tokenObj = tokens.find((e) => e.token === token);

	if (tokenObj === undefined) {
		return false
	}

	var tkIndex = tokens.indexOf(tokenObj);
	tokens.splice(tkIndex, 1)
	return true
}

// Tries to authenticate the user using the username and password
function authenticateUser(user) {
	try {
		validateUser(user)

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

// Creates user
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

// Creates hash for password
function hashPassword(passwd, salt) {
	if (!salt) {
		var salt = crypto.randomBytes(32).toString('hex');
	}
	return [crypto.pbkdf2Sync(passwd, salt, 2000, 64, 'sha512').toString('hex'), salt];
}

app.post("/upload", upload.single("test"), (req, res) => {
	try {
		res.status(200).send("Uploaded");	
	} catch (err) {
		res.send(400).send({error: err.message })
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

app.post("/register", (req,res) => {
	try {
		var {user} = req.body;

		createUser(user);

		res.status(201).send();
	} catch (err) {
		res.status(400).send({error: err.message});
	}
});

app.get("/recover/:token", (req, res) => {
	try {
		var {token} = req.params;

		if(retrieveToken(token)) {
			res.status(200).send("Token valid");
		} else {
			res.status(400).send("Token not found or expired");
		}
	} catch (err) {
		res.status(400).send({error: err.message});
	}
});

app.post("/recover", (req,res) => {
	try {
		var {user} = req.body;

		var token = createRecoveryToken(user);

		if (token) {
			res.status(201).send({token: token});
		} else {
			res.status(400).send();
		}
	} catch (err) {
		res.status(400).send({error: err.message});
	}
});

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});

module.exports = app;
