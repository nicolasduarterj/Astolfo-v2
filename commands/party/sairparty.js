const { SlashCommandBuilder } = require("discord.js");
const PlayerCharacter = require("../../models/playercharacter.js");
const Party = require("../../models/party");


module.exports = {
    data: new SlashCommandBuilder()
        .setName("sairparty")
        .setDescription("Sai de uma party")
        .addStringOption(option => 
            option
                .setName("char")
                .setDescription("personagem a sair da party")
                .setRequired(true)
                .setAutocomplete(true)
        ),

        async autocomplete(interaction) {
            const focusedValue = interaction.options.getFocused()
            const playerchars = await PlayerCharacter.find({owner: interaction.user.id})
            const filteredchars = playerchars.map(char => char.name).filter(char => char.startsWith(focusedValue))
            await interaction.respond(filteredchars.map(char => ({name: char, value: char})))
        },

        async execute(interaction) {
            await interaction.reply("Processando...")
            const name = interaction.options.getString("char")
            const playerchar = await PlayerCharacter.findOne({name, owner:interaction.user.id})
            if (playerchar == null) {
                await interaction.editReply("```diff\n-Não consegui achar esse personagem\n```")
                return
            }
            const party = await Party.findById(playerchar.party).populate("members")
            await PlayerCharacter.findOneAndUpdate({name, owner:interaction.user.id}, {$unset: {party:""}})
            if (party == undefined) {
                await interaction.editReply("```diff\n-Esse personagem não está em uma party\n```")
                return
            }
            party.members = party.members.filter(member => (member.name != name || member.owner != interaction.user.id))
            await party.save()
            await interaction.editReply("```elm\n" + name + " foi removido da party.\n```")
        }
}