const { SlashCommandBuilder } = require("discord.js");
const Party = require("../../models/party.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("statusparty").setDescription("Mostra o status da sua party"),
    async execute(interaction) {
        await interaction.reply("Processando...")
        const party = await Party.findOne({dm:interaction.user.id}).populate("members", {name:1, hp:1})
        if (party == null) {
            await interaction.editReply("```diff\n-Você não tem uma party.\n```")
            return
        }
        let response = "```elm\n"
        for (member of party.members)
            response += `${member.name}: ${member.hp}\n`
        response += "```"
        await interaction.editReply(response)
    } 
}