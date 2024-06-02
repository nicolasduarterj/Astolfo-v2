const PlayerCharacter = require("../../models/playercharacter.js")
const Party = require("../../models/party.js")
const { SlashCommandBuilder } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder().setName("excluirchar").setDescription("Exclui um personagem e o remove de sua party")
        .addStringOption(option => option.setName("char").setDescription("Personagem a ser excluído").setRequired(true).setAutocomplete(true)),
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused()
        const playerchars = await PlayerCharacter.find({owner: interaction.user.id})
        const filteredchars = playerchars.map(char => char.name).filter(char => char.startsWith(focusedValue))
        await interaction.respond(filteredchars.map(char => ({name: char, value: char})))
    },
    async execute(interaction) {
        await interaction.reply({content:"Processando...", ephemeral:true})
        const name = interaction.options.getString("char")
        const char = await PlayerCharacter.findOne({owner:interaction.user.id, name})
        if (char === null) {
            await interaction.editReply("```diff\n-Não consegui achar esse personagem.\n```")
            return
        }
        if (char.party) {
            const party = await Party.findById(char.party)
            party.members = party.members.filter(id => id != char._id)
            await party.save()
        }
        await PlayerCharacter.findOneAndDelete({name, owner:interaction.user.id})
        await interaction.editReply("```ini\n[Personagem deletado]\n```")
    }
}