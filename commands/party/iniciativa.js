const PlayerCharacter = require("../../models/playercharacter.js")
const Party = require("../../models/party.js")
const { SlashCommandBuilder } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("iniciativa")
        .setDescription("Rola a iniciativa da sua party"),

    async execute(interaction) {
        await interaction.reply("Processando...")
        const party = await Party.findOne({dm:interaction.user.id})
        if (party === null || party.members.length === 0) {
            await interaction.editReply("```diff\n-Você não possui uma party, ou sua party não possui membros.\n```")
            return
        }
        let members = await Promise.all(party.members.map(id => PlayerCharacter.findById(id)))
        let response = "```elm\nIniciativa:\n\n"
        for (const member of members) {
            let roll = Math.floor(Math.random() * 20) + 1
            if (member.initiativeAdvantage == true) {
                const die2 = Math.floor(Math.random() * 20) + 1
                roll = roll > die2 ? roll : die2
            }
            member.roll = roll + member.initiative
        }
        members = members.toSorted((member1, member2) => member2.roll - member1.roll).map(member => `${member.name}:${member.roll}`)
        response += members.join("\n")
        response += "```"
        await interaction.editReply(response)
    }
}