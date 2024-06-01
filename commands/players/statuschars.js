const { SlashCommandBuilder } = require("discord.js")
const PlayerCharacter = require("../../models/playercharacter.js")

module.exports = {
    data: new SlashCommandBuilder().setName("statuschars").setDescription("Mostra o status dos seus personagens"),
    async execute(interaction) {
        await interaction.reply({content:"Processando...", ephemeral:true})
        const chars = await PlayerCharacter.find({owner:interaction.user.id})
        if (chars.length === 0) {
            await interaction.editReply("```diff\n-Você não tem nenhum personagem\n```")
            return
        }
        let response = "```elm\n"
        for (char of chars) {
            response += `${char.name}: ${char.hp}\n`
        }
        response += "```"
        await interaction.editReply(response)
    }
}