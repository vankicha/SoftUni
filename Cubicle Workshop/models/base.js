const fs = require('fs');
const { promisify } = require('util');

const writeFile = promisify(fs.writeFile);

module.exports = class BaseModel {
    constructor(filePath) {
        this._filePath = filePath;
        this.entries = require(filePath);
        const lastEntry = this.entries[this.entries.length - 1];
        this._lastEntryId = lastEntry ? lastEntry.id : 0;
    }

    insert(entry) {
        const newEntry = { ...entry, id: this._lastEntryId + 1 };
        let newEntries = [...this.entries, newEntry];

        return writeFile(this._filePath, JSON.stringify(newEntries))
            .then(() => { this.entries = newEntries });
    }

    findById(id) {
        const entry = this.entries.find((ent) => ent.id === Number(id));
        return Promise.resolve(entry);
    }

    getAll() {
        return this.entries;
    }

    filter(search, from, to) {
        return this.entries.filter((e) =>
            (search ? e.name.includes(search) : true) &&
            (from ? e.difficultyLevel >= Number(from) : true) &&
            (to ? e.difficultyLevel <= Number(to): true))
    }
}