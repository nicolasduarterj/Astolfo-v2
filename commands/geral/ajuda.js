const { SlashCommandBuilder } = require("discord.js");


module.exports = {
    data: new SlashCommandBuilder()
        .setName("ajuda")
        .setDescription("Mostra os comandos do Astolfo."),

    async execute(interaction) {
        let response = "```ini\n"
        response += "Oi! Esse são meus comandos:\n\n"
        response +=" --Dados--\n"
        response += "[rolar] --> rola um ou mais dados\n"
        response += "\n--Personagens--\n"
        response += "[novochar] --> cria um personagem\n"
        response += "[editarchar] --> edita os atributos de um personagem\n"
        response += "[excluirchar] --> exclui um personagem e o remove da sua party\n"
        response += "[statuschars] --> mostra o hp dos seus personagens\n"
        response += "[cura] e [dano] --> cura ou causa dano a um personagem seu ou da sua party\n"
        response += "\n--Party--\n"
        response += "[criarparty] --> cria uma party vinculada à sua conta\n"
        response += "[entrar] --> insere um personagem na party de alguém\n"
        response += "[sair] --> remove um personagem de uma party\n"
        response += "[iniciativa] --> rola a iniciativa da party\n"
        response += "[statusparty] --> mostra o hp da sua party\n```"
        await interaction.reply(response)
    }
}