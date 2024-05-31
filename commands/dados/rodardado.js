const { SlashCommandBuilder } = require("discord.js")

/*
@param syntax: String
@returns: array
last item is the sum of all dice results with the bonus
*/
async function roladado(syntax) {
    const dicesyntax = /^([0-9])*d([0-9]+)([+-]?[0-9]+)*$/i
    const substrings = syntax.match(dicesyntax)
    if (substrings == null) 
        return null
    const numberofdice = parseInt(substrings[1])
    const typeofdice = parseInt(substrings[2])
    let bonus = parseInt(substrings[3])
    if (isNaN(bonus))
        bonus = 0
    const resultarr = []
    for (i = 0; i < numberofdice; i++)
        resultarr[i] = Math.floor(Math.random() * typeofdice) + 1
    resultarr[numberofdice] = resultarr.reduce((acc, num) => acc + num) + bonus
    return resultarr
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rolar")
        .setDescription("Formato: [N de dados]d[tipo de dado][+/-bonus]")
        .addStringOption(option => 
            option.setName("dados")
                .setRequired(true)
                .setDescription("input do comando")
        ),
    async execute(interaction) {
        await interaction.reply("```\nRolando dados...\n```")
        const input = interaction.options.getString("dados")
        const resultarr = await roladado(input)
        if (resultarr == null) {
            await interaction.editReply("```elm\nErro de sintaxe\n```")
            return
        }
        let syntax = "```ini\nRolagem de " + interaction.user.username + "\n\nDados: ["
        for (i = 0; i < resultarr.length - 1; i++) {
            syntax = syntax + resultarr[i]
            if (i != resultarr.length - 2)
                syntax += " "
        }
        syntax += `]\nTotal com bônus: [${resultarr[resultarr.length - 1]}]\nSintáxe: ${input}\n`
        syntax += "```"
        await interaction.editReply(syntax)
    }
}