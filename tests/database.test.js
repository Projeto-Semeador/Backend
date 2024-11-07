const DatabaseHandler = require('../util/databaseHandler');
const UserHandler = require('../util/userHandler');
const EventHandler = require('../util/eventHandler');
const LocalStorageHandler = require('../util/localStorageHandler')

describe('Database', () => {
    let dbHandler;

    beforeEach(async () => {
        dbHandler = new DatabaseHandler();
        await dbHandler.connect();
    });

    describe('connection', () => {
        it('should connect to the database', async () => {
            expect(dbHandler.connectionStatus()).toBe(true);
        });

        it('should disconnect from the database', async () => {
            await dbHandler.disconnect();
            expect(dbHandler.connectionStatus()).toBe(false);
        });
    });
});

describe('User', () => {
    let dbHandler;
    let userHandler;

    beforeAll(async () => {
        dbHandler = new DatabaseHandler();
        await dbHandler.connect();
        await dbHandler.dropDatabase();

        userHandler = new UserHandler(dbHandler.connection);
    });

    afterAll(async () => {
        await dbHandler.dropDatabase();
        await dbHandler.disconnect();
    });

    it('should create a user', async () => {
        const user = {
            username: 'testuser',
            password: 'password',
            role: 'user',
        };

        await userHandler.createUser(user);

        const users = await userHandler.getUsers();
        expect(users.length).toBe(1);
    });

    it('should return bad request', async () => {
        try {
            await userHandler.createUser({ username: 'testuser', password: 'password', role: 'user' });
        } catch (error) {
            expect(error.message).toBe('User already exists with name testuser');
        }
    });

    it('should delete a user', async () => {
        await userHandler.deleteUser({ username: 'testuser' });

        const users = await userHandler.getUsers();
        expect(users.length).toBe(0);
    });

    it('should return bad request', async () => {
        try {
            await userHandler.deleteUser({ username: 'testuser' });
        } catch (error) {
            expect(error.message).toBe('User not found with name testuser');
        }
    });

    it('should not delete an admin user', async () => {
        try {
            await userHandler.createUser({ username: 'admin', password: 'password', role: 'admin' });
            await userHandler.deleteUser({ username: 'admin' });
        } catch (error) {
            expect(error.message).toBe('Cannot delete admin user');
        }
    });

    it('should create a recovery token', async () => {
        const user = {
            username: 'testuser',
            password: 'password',
            role: 'user',
        };

        await userHandler.createUser(user);

        const token = await userHandler.createRecoveryToken(user);

        expect(token).toBeTruthy();
    });

    it('should return bad request', async () => {
        try {
            await userHandler.createRecoveryToken({ username: 'teste123', password: 'password', role: 'user' });
        } catch (error) {
            expect(error.message).toBe('User not found with name teste123');
        }
    });

    it('should delete a token', async () => {
        const user = {
            username: 'testuser',
            password: 'password',
            role: 'user',
        };

        const token = await userHandler.createRecoveryToken(user);

        const deletedToken = await userHandler.validateToken(token);
				
				expect(deletedToken).toBeTruthy();
    });
});

describe('Event', () => {
    let dbHandler;
    let eventHandler;

    beforeAll(async () => {
        dbHandler = new DatabaseHandler();
        await dbHandler.connect();
        await dbHandler.dropDatabase();
        const localStorageHandler = new LocalStorageHandler();

        eventHandler = new EventHandler(localStorageHandler, dbHandler.connection);
    });

    afterAll(async () => {
        await dbHandler.dropDatabase();
        await dbHandler.disconnect();
    });
    
    it('Should create an event', async() => {
        var newEvent = await eventHandler.createEvent({
            name: "a",
            description: 'b',
						date: new Date(),
            imageURL: 'c',
        })
        expect(newEvent).toBeDefined()
    })

    it('Should get one event', async() => {
        var newEvent = await eventHandler.createEvent({
            name: "d",
            description: 'e',
						date: new Date(),
            imageURL: 'f',
        })

        var event = await eventHandler.getEvent(newEvent._id);
        expect(event).toBeDefined();
    })

    it('Should get all events', async() => {
        var events = await eventHandler.getEvents();
        expect(events.length).toBe(2)
    })

    it('Should delete an event', async() => {
        var newEvent = await eventHandler.createEvent({
            name: "x",
            description: 'y',
						date: new Date(),
            imageURL: 'z',
        })
        
        await eventHandler.deleteEvent(newEvent._id);

        var events = await eventHandler.getEvents();
        expect(events.length).toBe(2);
    })
})
