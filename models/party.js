const mongoose = require("mongoose")

const partySchema = new mongoose.Schema({
    dm: String,
    members: [{type: mongoose.Schema.Types.ObjectId, ref: "PlayerCharacter"}],
    pass: String
})

const Party = mongoose.model("Party", partySchema)

module.exports = Party