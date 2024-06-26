const bcrypt = require("bcrypt")
const { SlashCommandBuilder } = require("discord.js")
const PlayerCharacter = require("../../models/playercharacter")
const Party = require("../../models/party")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("entrar")
        .setDescription("Entrar na party de um dm")
        .addStringOption(option =>
            option.setName("char")
                .setDescription("Personagem a ser inserido na party")
                .setRequired(true)
                .setAutocomplete(true)
        )
        .addUserOption(option => 
            option.setName("dm").setRequired(true)
                .setDescription("@ do dm da party")
        ).addStringOption(option =>
            option.setName("senha")
                .setDescription("Senha para entrar na party")
                .setRequired(true)
        ),

    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused()
        const playerchars = await PlayerCharacter.find({owner: interaction.user.id})
        const filteredchars = playerchars.map(char => char.name).filter(char => char.startsWith(focusedValue))
        await interaction.respond(filteredchars.map(char => ({name: char, value: char})))
    },
    async execute(interaction) {
        await interaction.reply({content: "Processando...", ephemeral: true})
        const name = interaction.options.getString("char")
        const dm = interaction.options.getUser("dm")
        const pass = interaction.options.getString("senha")
        const char = await PlayerCharacter.findOne({name, owner:interaction.user.id})
        const party = await Party.findOne({dm:dm.id})
        if (char === null) {
            await interaction.editReply("```diff\n-Não consegui achar esse personagem.\n```")
            return
        }
        if (party === null) {
            await interaction.editReply("```diff\n-Esse usuário não é mestre de uma party.\n```")
            return
        }
        if (char.party) {
            await interaction.editReply("```diff\n-Esse Personagem já está em uma party.\n```")
            return
        }
        console.log(party.pass)
        const matches = await bcrypt.compare(pass, party.pass)
        if (!matches) {
            await interaction.editReply("```diff\n-Erro! Verifique sua senha.\n```")
            return
        }
        party.members = party.members.concat(char._id)
        await party.save()
        char.party = party._id
        await char.save()
        interaction.editReply("```ini\n[" + name + " foi adicionado à party!\n```")
    }
}