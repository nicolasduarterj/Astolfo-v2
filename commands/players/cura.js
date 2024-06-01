const { SlashCommandBuilder } = require("discord.js");
const PlayerCharacter = require("../../models/playercharacter.js");
const Party = require("../../models/party.js");
const { default: mongoose } = require("mongoose");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("cura")
        .setDescription("[SELECIONE DO AUTOCOMPLETE] Cura um personagem seu ou da sua party")
        .addStringOption(option =>
            option.setName("char").setDescription("Personagem a curar")
                .setAutocomplete(true).setRequired(true))
        .addNumberOption(option =>
            option.setName("pontos").setDescription("Pontos de cura")
                .setRequired(true).setMinValue(1)),
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused()
        const playerchars = await PlayerCharacter.find({owner: interaction.user.id})
        const populatedparty = await Party.findOne({dm:interaction.user.id}).populate("members", {name: 1, _id: 1})
        const filteredpartymembers = populatedparty?.members.filter(char => char.name.startsWith(focusedValue))
            .map(char => ({name: `${char.name} (party)`, value:`${char.name}(p)`}))
        console.log(filteredpartymembers)
        const filteredchars = playerchars.map(char => char.name).filter(char => char.startsWith(focusedValue))
        let result = []
        if (filteredpartymembers != undefined){
            result = filteredpartymembers
        }
        await interaction.respond(result.concat(filteredchars.map(char => ({name: char, value: char}))))
    },
    async execute(interaction) {
        await interaction.reply("Processando...")
        let name = interaction.options.getString("char")
        const dano = interaction.options.getNumber("pontos")
        let char
        if (name.endsWith("(p)")) {
            name = name.slice(0, -3)
            const party = await Party.findOne({dm:interaction.user.id}).populate("members", {name: 1, _id: 1})
            const charmeta = party?.members.find(char => char.name == name)
            if (charmeta == undefined) {
                await interaction.editReply("```diff\n-Não consegui achar esse personagem\n```")
                return
            }
            char = await PlayerCharacter.findById(charmeta._id)
        }
        else 
            char = await PlayerCharacter.findOne({owner:interaction.user.id, name})
        if (char == null) {
                await interaction.editReply("```diff\n-Não consegui achar esse personagem\n```")
                return
        }
        char.hp = (char.hp + dano) > char.basehp ? char.basehp : char.hp + dano
        await char.save()
        await interaction.editReply("```elm\n" + name + " curou " + dano + " de vida\n```")
    }
}