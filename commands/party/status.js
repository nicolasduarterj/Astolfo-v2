const { SlashCommandBuilder } = require("discord.js");
const Party = require("../../models/party.js")

module.exports = {
    data: new SlashCommandBuilder()
            .setName("statusparty")
            .setDescription("Mostra o status da sua party"),

    async execute(interaction) {
        await interaction.reply("Processando...")
        const party = await Party.findOne({dm:interaction.user.id}).populate("members", {name:1, hp:1})
        if (party == null || party.members.length === 0) {
            await interaction.editReply("```diff\n-Você não tem uma party, ou ela não tem nenhum personagem.\n```")
            return
        }
        let response = "```elm\nStatus da party:\n\n"
        for (const member of party.members)
            response += `${member.name}: ${member.hp}\n`
        response += "```"
        await interaction.editReply(response)
    } 
}