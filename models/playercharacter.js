const mongoose = require("mongoose")

const playerCharacterSchema = mongoose.Schema({
    name: String,
    basehp: Number,
    hp: Number,
    initiative: Number,
    initiativeAdvantage: Boolean,
    owner: String,
    party : {type: mongoose.Schema.Types.ObjectId, ref: "party"}
})

const PlayerCharacter = mongoose.model('PlayerCharacter', playerCharacterSchema)

module.exports = PlayerCharacter