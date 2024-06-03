const { SlashCommandBuilder } = require("discord.js");
const PlayerCharacter = require("../../models/playercharacter.js");
const Party = require("../../models/party.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("cura")
        .setDescription("Cura um personagem seu ou da sua party")
        .addStringOption(option =>
            option
                .setName("char")
                .setDescription("Personagem a curar")
                .setAutocomplete(true)
                .setRequired(true))
        .addNumberOption(option =>
            option
                .setName("pontos")
                .setDescription("Pontos de cura")
                .setRequired(true)
                .setMinValue(1)),

    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused()
        const playerchars = await PlayerCharacter.find({owner: interaction.user.id})
        const filteredplayerchars = playerchars.filter(char => char.name.startsWith(focusedValue))
        const party = await Party.findOne({dm:interaction.user.id})
        let result = []
        if (party != null) {
            const members = await Promise.all(party.members.map(id => PlayerCharacter.findById(id)))
            result = members.filter(char => char.name.startsWith(focusedValue))
                .map(char => ({name:`${char.name} (membro da sua party)`, value:char.name}))
        }
        result = result.concat(filteredplayerchars.map(char => ({name:char.name, value:char.name})))
        await interaction.respond(result)
    },

    async execute(interaction) {
        await interaction.reply("Processando...")
        let name = interaction.options.getString("char")
        const dano = interaction.options.getNumber("pontos")
        const playerchar = await PlayerCharacter.findOne({owner:interaction.user.id, name})
        let char = playerchar
        const party = await Party.findOne({dm:interaction.user.id})
        if (party !== null) {
            const members = await Promise.all(party.members.map(id => PlayerCharacter.findById(id)))
            const partychar = members.find(char => (char.name == name)) 
            char = partychar === undefined ? playerchar : partychar
        }
        
        if (char === null) {
            await interaction.editReply("```diff\n-Não consegui achar esse personagem\n```")
            return
        }
        playerchar.hp = (char.hp + dano) > char.basehp ? char.basehp : char.hp + dano
        await char.save()
        await interaction.editReply("```elm\n" + name + " curou " + dano + " de vida\n```")
    }
}