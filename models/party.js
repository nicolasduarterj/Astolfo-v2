const mongoose = require("mongoose")

const partySchema = new mongoose.Schema({
    dm: String,
    members: [],
    pass: String
})

const Party = mongoose.model("party", partySchema)

module.exports = Party