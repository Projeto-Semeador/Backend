require("dotenv").config();
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

class UserHandler {
    #users = [
        {
            "username": 'admin@admin.com',
            "password": '0a9ea0783f64c6a7392b5e71eaeeb21feb9862919122af39c5fb9cff294052357586ba1371a3dcd29b061308de5d9618e697545e09a85c1a01c29ae3a9a10325',
            "salt": '7669ea8e988dbe140ef08a86aaee0e875179f9274d3a0689253431bb971c5cbe',
            "role": "admin"
        }
    ];
    #tokens = [];

    validateJWT(token) {
        try {
            jwt.verify(token, process.env.SECRET_TOKEN)
        } catch (err) {
            throw err
        }
    }

    createJWT(username, role) {
        var token = jwt.sign({username: username, role: role}, process.env.SECRET_TOKEN, {expiresIn: '1d'});
        return token
    }

    hashPassword(passwd, salt) {
        if (!salt) {
            var salt = crypto.randomBytes(32).toString('hex');
        }
        return [crypto.pbkdf2Sync(passwd, salt, 2000, 64, 'sha512').toString('hex'), salt];
    }

    createUser(user) {
        var [hashedPasswd, salt] = this.hashPassword(user.password);
    
        try {
            if (this.#users.find((u) => u.username === user.username)){
                throw new Error("User already exists");
            }
    
            this.#users.push({ username: user.username, password: hashedPasswd, salt: salt, role: user.role });
    
            return this.#users;
        } catch(error) {
            throw error;
        }
    };

    getUsers() {
        return this.#users;
    }

    validateUser(user) {
        if (!this.#users.find((u) => u.username === user.username)){
            throw new Error(`User not found with name ${user.username}`);
        }
    
        return true;
    }    

    deleteUser(user) {
        try {
            this.validateUser(user);
    
            var selUser = this.#users.find((u) => u.username === user.username);
            
            if (selUser.role === "admin") {
                throw new Error("Cannot delete admin user");
            }
            
            this.#users.splice(this.#users.indexOf(selUser), 1)
        } catch (err) {
            throw err;
        }
    }

    createRecoveryToken(user) {
        try {
            this.validateUser(user);
    
            var token = crypto.randomBytes(16).toString('hex');
    
            this.#tokens.push({ username: user.username, token: token })
    
            return token;
        } catch (err) {
            throw err;
        }
    }

    retrieveToken(token) {
        var tokenObj = this.#tokens.find((e) => e.token === token);
    
        if (tokenObj === undefined) {
            return false
        }
    
        var tkIndex = this.#tokens.indexOf(tokenObj);
        this.#tokens.splice(tkIndex, 1)
        return true
    }

    authenticateUser(user) {
        try {
            this.validateUser(user)
    
            var selUser = this.#users.find((u) => u.username === user.username);
            var hashedPasswd = this.hashPassword(user.password, selUser.salt);
    
            if (hashedPasswd[0] === selUser.password) {
                return this.createJWT(user.username, user.role);
            } else {
                throw new Error("Invalid password");
            }
    
        } catch (err) {
            throw err;
        }
    }

    constructor(conn) {
        this.databaseConnection = conn;
    }
}

module.exports = UserHandler;