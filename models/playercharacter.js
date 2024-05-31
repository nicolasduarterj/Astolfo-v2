const mongoose = require("mongoose")

const playerCharacterSchema = mongoose.Schema({
    name: String,
    basehp: Number,
    initiative: Number,
    initiativeAdvantage: Boolean,
    owner: String,
    party : String
})

const PlayerCharacter = mongoose.model('PlayerCharacter', playerCharacterSchema)

module.exports = PlayerCharacter