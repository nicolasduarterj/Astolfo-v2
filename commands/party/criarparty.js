const { SlashCommandBuilder } = require("discord.js")
const Party = require("../../models/party.js")
const bcrypt = require("bcrypt")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("novaparty")
        .setDescription("Cria uma nova party vinculada à sua conta")
        .addStringOption(option => 
            option.setName("senha")
                .setDescription("Senha que os players usarão para entrar")
                .setRequired(true)
                .setMinLength(3)
        ),
    async execute(interaction) {
        await interaction.reply({content: "Processando...", ephemeral: true})
        const found = await Party.exists({dm: interaction.user.id})
        console.log(found)
        if (found) {
            await interaction.editReply("```diff\n-Você já tem uma party!\n```")
            return
        }
        const pass = interaction.options.getString("senha")
        const passHash = await bcrypt.hash(pass, 10)
        const newparty = new Party({dm: interaction.user.id, members: [], pass: passHash})
        await newparty.save()
        interaction.editReply("```ini\n[Party criada]\n```")
    }
}