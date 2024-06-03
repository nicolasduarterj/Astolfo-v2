const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js")
const PlayerCharacter = require("../../models/playercharacter.js")
const XRegExp = require("xregexp")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("novochar")
        .setDescription("Cria um novo personagem associado à sua conta"),

    async execute(interaction) {
        //Mostra o menu
        const modal = new ModalBuilder().setCustomId(`pcmodal${interaction.user.id}`).setTitle("Novo personagem")
        const nameInput = new TextInputBuilder().setCustomId("name").setLabel("Nome do personagem").setStyle(TextInputStyle.Short)
            .setPlaceholder("Sem acentos, por favor!").setMaxLength(20)
        const basehpInput = new TextInputBuilder().setCustomId("basehp").setLabel("Vida base do personagem").setStyle(TextInputStyle.Short)
        const initiativeInput = new TextInputBuilder().setCustomId("initiative").setLabel("Bônus de iniciativa do personagem")
            .setStyle(TextInputStyle.Short)
        const initiaveAdvantageInput = new TextInputBuilder().setCustomId("initiativeadvantage").setLabel("Possui vantagem na iniciativa?")
            .setStyle(TextInputStyle.Short).setPlaceholder("S ou N").setMaxLength(1)
        const firstactionrow = new ActionRowBuilder().addComponents(nameInput)
        const secondactionrow = new ActionRowBuilder().addComponents(basehpInput)
        const thirdactionrow = new ActionRowBuilder().addComponents(initiativeInput)
        const fourthactionrow = new ActionRowBuilder().addComponents(initiaveAdvantageInput)
        modal.addComponents(firstactionrow, secondactionrow, thirdactionrow, fourthactionrow)
        await interaction.showModal(modal)

        //Lida com o input
        const filter = (interaction) => interaction.customId === `pcmodal${interaction.user.id}`
        const modalresponse = await interaction.awaitModalSubmit({ filter, time: 9000_00 })
        console.log(`${modalresponse.customId} was submitted`)
        await modalresponse.reply("Processando...")
        const name = modalresponse.fields.getTextInputValue("name")
        const basehp = Number(modalresponse.fields.getTextInputValue("basehp"))
        const initiative = Number(modalresponse.fields.getTextInputValue("initiative"))
        let initiativeadvantage = modalresponse.fields.getTextInputValue("initiativeadvantage")
        const nameregex = XRegExp("^[\\pL\\pM][\\pL\\pM -]*$", 'u')
        if (XRegExp.exec(name, nameregex) === null || isNaN(basehp) || isNaN(initiative) || initiativeadvantage.match(/[sn]/i) === null
            || basehp < 1) {
            console.log("Não foi\n");
            await modalresponse.editReply("```elm\nErro de formatação! Verifique suas entradas\n```")
            return
        }
        console.log(`Foi!\nNome:${name}\nHP:${basehp}\nIniciativa:${initiative}\nVantagem:${initiativeadvantage}\n`)
        const found = await PlayerCharacter.exists({name, owner:modalresponse.user.id})
        if (found) {
            modalresponse.editReply("```diff\nJá existe um personagem seu com esse nome```")
            return
        }
        initiativeadvantage = initiativeadvantage.toLowerCase() == 's'
        const newchar = new PlayerCharacter({
            name,
            basehp,
            hp: basehp,
            initiative,
            initiativeadvantage,
            owner:modalresponse.user.id,
        })
        await newchar.save()
        modalresponse.editReply("```ini\n[Personagem criado: " + name + "]\n```")
    }
}