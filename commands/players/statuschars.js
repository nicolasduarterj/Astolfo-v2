const { SlashCommandBuilder } = require("discord.js")
const PlayerCharacter = require("../../models/playercharacter.js")
const Party = require("../../models/party.js")

async function charandpartystatus(char) {
    const charstatus = `${char.name}: ${char.hp}\n`
    if (!char.party)
        return charstatus
    const party = await Party.findById(char.party).populate("members", {name: 1, hp: 1})
    const partymemtext = party.members.filter(member => member.name !== char.name)
        .map(member => `|- ${member.name}: ${member.hp} (Membro da party)\n`).join("")
    return charstatus + partymemtext + "\n"
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("statuschars")
        .setDescription("Mostra o status dos seus personagens"),

    async execute(interaction) {
        await interaction.reply({content:"Processando...", ephemeral:true})
        const chars = await PlayerCharacter.find({owner:interaction.user.id})
        if (chars.length === 0) {
            await interaction.editReply("```diff\n-Você não tem nenhum personagem\n```")
            return
        }
        const chartransformpromisearray = chars.map(char => charandpartystatus(char))
        const charstextarray = await Promise.all(chartransformpromisearray)
        const response = "```elm\n" + charstextarray.join("") + "```"
        await interaction.editReply(response)
    }
}