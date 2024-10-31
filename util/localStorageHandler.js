const {rmSync, writeFileSync} = require("fs");

class LocalStorageHandler {
    #storageLocation;

    removeItem(key) {
        try {
            rmSync(this.#storageLocation + key)
        } catch (err) {
            throw err
        }
    }

    setItem(key, value) {
        try {
            writeFileSync(this.#storageLocation + key, value)
        } catch (err) {
            throw err
        }
    }

    getItem(key) {
        try {
            return readFileSync(this.#storageLocation + key)
        } catch (err) {
            throw err
        }
    }

    constructor(storageLocation) {
        this.#storageLocation = storageLocation
    }
}

module.exports = LocalStorageHandler;