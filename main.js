require("dotenv").config()
const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const crypto = require("crypto");
const cors = require("cors");
const path = require("path");
const { readFileSync, rmSync } = require("fs");
const Logger = require("logosaurus");

const logger = new Logger();
const app = express();
const port = 3000;
const serverURL = `http://localhost:${port}`

app.use(cors(
	{
		credentials: true, origin: true, exposedHeaders: ["Set-Cookie"]
	}
));
app.use(express.json());
app.use(cookieParser());

if (process.env.LOGGING === "true") {
	app.use(logger.logRequest.bind(logger));
}

// TODO: Remove this on db integration
var users = [
	{
		"username": 'admin@admin.com',
		"password": '0a9ea0783f64c6a7392b5e71eaeeb21feb9862919122af39c5fb9cff294052357586ba1371a3dcd29b061308de5d9618e697545e09a85c1a01c29ae3a9a10325',
		"salt": '7669ea8e988dbe140ef08a86aaee0e875179f9274d3a0689253431bb971c5cbe'
	}
]
var tokens = []
var events = []

// Creates event
function createEvent(event) {
	var newEvent = {id: events.length + 1, ...event, likeCount: 0}
	events.push(newEvent)
	return newEvent
}

// Deletes event
function deleteEvent(eventID) {
	var event = events.find((e) => e.id == eventID); 

	if (event !== undefined) {
		// Convert network path to local and delete image
		rmSync(event.imageURL.replace(serverURL, "."))
		events.splice(events.indexOf(event), 1);
	} else {
		throw new Error("Event not found")
	}
}

// Updates event
function updateEvent(eventID, changes) {
	var event = events.find((e) => e.id == eventID);

	if (event !== undefined) {
		var updatedEvent = {...event, ...changes}
		events[events.indexOf(event)] = updatedEvent;
		return updatedEvent
	} else {
		throw new Error("Event not found");
	}
}

// Updates event image
function updateEventImage(eventID, newImage) {
	var event = events.find((e) => e.id == eventID);
	
	if (event !== undefined) {
		// Delete old image
		rmSync(event.imageURL.replace(serverURL, "."))
		var updatedEvent = {...event, imageURL: newImage}
		events[events.indexOf(event)] = updatedEvent;
		return updatedEvent
	} else {
		throw new Error("Event not found");
	}
}

// Likes the event
function likeEvent(eventID) {
	var event = events.find((e) => e.id == eventID);

	if (event !== undefined) {
		var updatedEvent = {...event, likeCount: event.likeCount + 1}
		events[events.indexOf(event)] = updatedEvent;
	} else {
		throw new Error("Event not found");
	}
}

// Validates the JWT token
function validateJWT(token) {
	try {
		jwt.verify(token, process.env.SECRET_TOKEN)
	} catch (err) {
		throw err
	}
}

// Creates JWT token using the user's username
function createJWT(username) {
	var token = jwt.sign({username: username}, process.env.SECRET_TOKEN, {expiresIn: '1d'});
	return token
}

// Middleware to check if the user is authenticated
function authenticationMiddleware(req, res, next) {
	try {
		// Retrieves the JWT token from the cookie
		var token = req.cookies.jwtToken;
		// Validates the JWT token
		validateJWT(token);
		next();
	} catch (err) {
		res.status(401).redirect('/login');
	}
}

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
			return createJWT(user.username) 
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

app.post("/upload", authenticationMiddleware, upload.single("test"), (req, res) => {
	try {
		// Check if file was actually uploaded to the server
		if (readFileSync(req.file.path)) {
			res.status(200).json("Uploaded");		
		} else {
			throw new Error("File was not uploaded successfully")
		}
	} catch (err) {
		res.status(400).send({error: err.message })
	}
});

app.get("/secure", authenticationMiddleware, (req, res) => {
	res.status(200).json("Authorized");
});

app.get("/events", (req, res) => {
	res.status(200).json(events);
});

app.post("/events", authenticationMiddleware, upload.single("image"), (req, res) => {
	try {
		var event = req.body
		event = {imageURL: `${serverURL}/${req.file.path}`, ...event}
		res.status(201).json(createEvent(event))
	} catch (err) {
		res.status(500).json({error: err.message})
	}
});

app.delete("/events/:id", authenticationMiddleware, (req, res) => {
	try {
		var eventID = req.params.id
		deleteEvent(eventID)
		res.status(200).json(events)
	} catch (err) {
		res.status(500).json({error: err.message})
	}
});

app.patch("/events/:id", authenticationMiddleware, (req, res) => {
	try {
		var eventID = req.params.id
		res.status(200).json(updateEvent(eventID, req.body))
	} catch (err) {
		res.status(500).json({error: err.message})
	}
});

app.patch("/events/image/:id", authenticationMiddleware, upload.single("event"), (req, res) => {
	try {
		var eventID = req.params.id
		res.status(200).json(updateEventImage(eventID, `${serverURL}/${req.file.path}`))
	} catch (err) {
		res.status(500).json({error: err.message})
	}
});

app.patch("/events/like/:id", authenticationMiddleware, (req, res) => {
	try {
		var eventID = req.params.id
		likeEvent(eventID)
		res.status(200).send()
	} catch (err) {
		res.status(500).json({error: err.message})
	}
});

app.post("/login", (req, res) => {
	try {
		var user = req.body;
		var token = authenticateUser(user)

		if (req.body.remember) {
			res.cookie('jwtToken', token, { maxAge: 7 * 24 * 60 * 60 * 60 * 1000, expires: 7 * 24 * 60 * 60 * 60 * 1000, httpOnly: true, secure: false });
		}

		res.status(200).send();
	} catch (err) {
		res.status(401).json({error: "Invalid credentials"});
	}
});

app.post("/register", (req,res) => {
	try {
		var {user} = req.body;

		createUser(user);

		res.status(201).json();
	} catch (err) {
		res.status(400).json({error: err.message});
	}
});

app.get("/recover/:token", (req, res) => {
	try {
		var {token} = req.params;

		if(retrieveToken(token)) {
			res.status(200).json("Token valid");
		} else {
			res.status(400).json("Token not found or expired");
		}
	} catch (err) {
		res.status(400).json({error: err.message});
	}
});

app.post("/recover", (req,res) => {
	try {
		var {user} = req.body;

		var token = createRecoveryToken(user);

		if (token) {
			res.status(201).json({token: token});
		} else {
			res.status(400).json();
		}
	} catch (err) {
		res.status(400).json({error: err.message});
	}
});

app.listen(port, () => {
	logger.info(`Backend listening at ${serverURL}`);
});

module.exports = app;
