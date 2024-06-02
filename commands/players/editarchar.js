const { SlashCommandBuilder } = require("discord.js")
const PlayerCharacter = require("../../models/playercharacter.js")
const XRegExp = require("xregexp")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("editarchar")
        .setDescription("Altera um atributo do seu personagem")
        .addStringOption(option => 
            option
                .setName("char")
                .setRequired(true)
                .setAutocomplete(true)
                .setDescription("Nome do personagem"))
        .addStringOption(option => 
            option
                .setName("atributo")
                .setDescription("Atributo a ser mudado")
                .setRequired(true)
                .addChoices({name:"Nome", value:"name"}, 
                            {name:"Vida", value:"basehp"}, 
                            {name:"Bônus de iniciativa", value:"initiative"}, 
                            {name:"Vantagem na iniciativa", value:"initiativeAdvantage"}))
        .addStringOption(option => 
            option
                .setName("novovalor")
                .setDescription("Novo valor do atributo")
                .setRequired(true)),

    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused()
        const playerchars = await PlayerCharacter.find({owner: interaction.user.id})
        const filteredchars = playerchars.map(char => char.name).filter(char => char.startsWith(focusedValue))
        await interaction.respond(filteredchars.map(char => ({name: char, value: char})))
    },

    async execute(interaction) {
        await interaction.reply({content: "Processando...", ephemeral:true})
        const atribute = interaction.options.getString("atributo")
        const name = interaction.options.getString("char")
        let novovalor = interaction.options.getString("novovalor")
        const char = await PlayerCharacter.findOne({owner:interaction.user.id, name})
        const nameregex = XRegExp("^[\\pL][\\pL -]{2,18}$", 'u')
        if (char === null) {
            await interaction.editReply("```diff\n-Não consegui achar esse personagem\n```")
            return
        }
        switch(atribute) { //validação
            case "name":
                if (!XRegExp.exec(novovalor, nameregex)) {
                    await interaction.editReply("```diff\n-Esse nome é inválido.\n```")
                    return
                }
                break
            case "basehp":
                novovalor = Number(novovalor)
                if (isNaN(novovalor) || novovalor < 1) {
                    await interaction.editReply("```diff\n-Valor inválido para a vida do personagem.\n```")
                    return
                }
                break
            case "initiative":
                novovalor = Number(novovalor)
                if (isNaN(novovalor)) {
                    await interaction.editReply("```diff\n-Valor inválido para o bônus de iniciativa.\n```")
                    return
                }
                break
            case "initiativeAdvantage":
                if (!novovalor.match(/[sn]/i)) {
                    await interaction.editReply("```diff\n-Valor inválido! Use s ou n.\n```")
                    return
                }
                novovalor = novovalor.toLowerCase() == 's'
                break
        }
        char[atribute] = novovalor
        await char.save()
        await interaction.editReply("```ini\n[Valor alterado com sucesso]\n```")
    }
    
}