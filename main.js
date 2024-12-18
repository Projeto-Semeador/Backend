require("dotenv").config();
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const Logger = require("logosaurus");
const UserHandler = require("./util/userHandler");
const EventHandler = require("./util/eventHandler");
const LocalStorageHandler = require("./util/localStorageHandler");
const DatabaseHandler = require("./util/databaseHandler");
const MailHandler = require("./util/mailHandler");

const logger = new Logger(false, true);
const app = express();
const port = 3000;
const serverURL = `http://localhost:${port}`;

var userHandler;
var eventHandler;
var mailHandler;

// Initializes all the handlers
async function init() {
	try {
		mailHandler = new MailHandler();
		// Database handler is initialized with the production environment
		const dbHandler = new DatabaseHandler();
		await dbHandler.connect({ prod: true });

		// User handler is initialized with the database connection
		userHandler = new UserHandler(dbHandler.connection);

		// Event handler is initialized with the local storage handler
		const localStorageHandler = new LocalStorageHandler("./uploads/");
		eventHandler = new EventHandler(localStorageHandler, dbHandler.connection);
	} catch (err) {
		logger.error(err);
	}
}

init();

app.use(
	cors({
		credentials: true,
		origin: true,
		exposedHeaders: ["Set-Cookie"],
	})
);
app.use(
	session({
		secret: process.env.SECRET_TOKEN,
		resave: false,
		saveUninitialized: true,
		cookie: { secure: false },
	})
);
app.use(express.json());
app.use(cookieParser());

if (process.env.LOGGING === "true") {
	app.use(logger.logRequest.bind(logger));
}

// Middleware to check if the user is authenticated
function authenticationMiddleware(req, res, next) {
	try {
		var token;
		
		// Check if the user is authenticated by checking the session or the cookie
		if (req.session.auth) {
			token = req.session.auth;
		} else {
			token = req.cookies.jwtToken;
		}
		// Validates the JWT token
		userHandler.validateJWT(token);
		next();
	} catch (err) {
		res.status(401).redirect("/login");
	}
}

// Validate the file mimetype and extension
function validateFile(file, cb) {
	const allowedTypes = /jpeg|jpg|png|webp/;
	const extname = allowedTypes.test(
		path.extname(file.originalname).toLowerCase()
	);
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
		cb(
			null,
			file.fieldname + "-" + Date.now() + path.extname(file.originalname)
		);
	},
});

const upload = multer({
	dest: "uploads/",
	fileFilter: (_, file, cb) => validateFile(file, cb),
	storage,
});

app.get("/analytics", authenticationMiddleware, async (req, res) => {
	var events = await eventHandler.getEvents();
	var users = await userHandler.getUsers();

	var mostLiked = events.sort((a, b) => b.likeCount - a.likeCount)[0];
	var top5 = events.sort((a, b) => b.likeCount - a.likeCount).slice(0, 5);

	var top5Chart = top5.map((e) => {
		return { name: e.name, value: e.likeCount };
	});

	var analytics = [
		{
			metric: "Users",
			value: users.length,
			name: "Usuários",
			description: "Total de usuarios cadastrados",
		},
		{
			metric: "Events",
			value: events.length,
			name: "Eventos",
			description: "Total de eventos cadastrados",
		},
		{
			metric: "Likes",
			value: events.reduce((acc, e) => acc + e.likeCount, 0),
			name: "Likes",
			description: "Total de likes em eventos",
		},
		{
			metric: "MostLiked",
			value: mostLiked === undefined ? "N/A" : mostLiked.name,
			name: "Evento mais curtido",
			description: "Evento com mais likes",
		},
		{
			metric: "Top5",
			value: top5Chart,
			name: "Top 5",
			type: "chart",
			description: "Top 5 eventos",
		},
	];

	res.status(200).json(analytics);
});

app.get("/events", async (req, res) => {
	res.status(200).json(await eventHandler.getEvents());
});

app.get("/events/:id", async (req, res) => {
  try {
    var eventID = req.params.id;
    res.status(200).json(await eventHandler.getEvent(eventID));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/uploads/:file", (req, res) => {
  try {
    res.sendFile(path.join(__dirname, "uploads", req.params.file));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post(
	"/events",
	authenticationMiddleware,
	upload.single("event"),
	async (req, res) => {
		try {
			var event = req.body;
			event = { imageURL: `${serverURL}/${req.file.path}`, ...event };
			res.status(201).json(await eventHandler.createEvent(event));
		} catch (err) {
			res.status(500).json({ error: err.message });
		}
	}
);

app.delete("/events/:id", authenticationMiddleware, async (req, res) => {
	try {
		var eventID = req.params.id;
		await eventHandler.deleteEvent(eventID);
		res.status(200).json(await eventHandler.getEvents());
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.patch("/events/:id", authenticationMiddleware, async (req, res) => {
	try {
		var eventID = req.params.id;
		res.status(200).json(await eventHandler.updateEvent(eventID, req.body));
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.patch(
	"/events/image/:id",
	authenticationMiddleware,
	upload.single("image"),
	(req, res) => {
		try {
			var eventID = req.params.id;
			res
				.status(200)
				.json(
					eventHandler.updateEventImage(
						eventID,
						`${serverURL}/${req.file.path}`
					)
				);
		} catch (err) {
			res.status(500).json({ error: err.message });
		}
	}
);

app.patch("/events/like/:id", async (req, res) => {
	try {
		var eventID = req.params.id;
		res.status(200).json(await eventHandler.likeEvent(eventID));
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Check if the user is authenticated
app.get("/auth", authenticationMiddleware, (req, res) => {
	try {
		res.status(200).send();
	} catch (err) {
		res.status(401).send();
	}
});

// Destroy the session and the cookie
app.delete("/logout", (req, res) => {
	req.session.destroy();
	res.clearCookie("jwtToken");
	res.status(200).send();
});

app.post("/login", async (req, res) => {
	try {
		var user = req.body;
		var token = await userHandler.authenticateUser(user);

		// Check if user agreed to save the session
		// If so, set the cookie to expire in 1 year
		// Otherwise, create a session and set the cookie to expire in 2 hours
		
		if (user.remember) {
			res.cookie("jwtToken", token, {
				maxAge: 7 * 24 * 60 * 60 * 60 * 1000,
				expires: 7 * 24 * 60 * 60 * 60 * 1000,
				httpOnly: true,
				secure: false,
			});
		} else {
			req.session.auth = token;
		}

		res.status(200).send();
	} catch (err) {
		res.status(401).json({ error: "Invalid credentials" });
	}
});

app.post("/register", (req, res) => {
	try {
		var { user } = req.body;

		userHandler.createUser(user);

		res.status(201).json();
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

app.get("/recover/:token", (req, res) => {
	try {
		var { token } = req.params;

		if (userHandler.retrieveToken(token)) {
			res.status(200).json("Token valid");
		} else {
			res.status(400).json("Token not found or expired");
		}
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

app.post("/recover", async (req, res) => {
	try {
		var { user } = req.body;

		var token = await userHandler.createRecoveryToken(user);
		// TODO: Change the email to the user email
		mailHandler.sendRecoveryEmail("projetoosemeador2024@gmail.com", token);

		if (token) {
			res.status(201).json({ token: token });
		} else {
			res.status(400).json();
		}
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

app.get("/users", authenticationMiddleware, async (req, res) => {
	res.status(200).json(await userHandler.getUsers());
});

app.delete("/users/:username", authenticationMiddleware, async (req, res) => {
	try {
		var { username } = req.params;
		await userHandler.deleteUser({ username: username });
		res.status(200).json();
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

app.post("/changePassword/:token", async (req, res) => {
	try {
		var { password } = req.body;
		var { token } = req.params;
		await userHandler.changePassword(password, token);
		res.status(200).json();
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

app.listen(port, () => {
	logger.info(`Backend listening at ${serverURL}`);
});

module.exports = app;
