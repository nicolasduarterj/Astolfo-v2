const { Client, Collection, Events, GatewayIntentBits } = require("discord.js");
require("dotenv").config();
const fs = require("node:fs")
const path = require("node:path")
const mongoose = require("mongoose")

mongoose.set("strictQuery", false)

mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log("Connected to MongoDB")
}).catch((error) => {
    console.error("Error connecting to mongodb")    
})

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.commands = new Collection()

const foldersPath = path.join(__dirname, 'commands')
const commandFolders = fs.readdirSync(foldersPath)

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder)
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"))

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file)
        const command = require(filePath)

        if ("data" in command && "execute" in command) {
            client.commands.set(command.data.name, command)
        } else {
            console.log(`[WARNING!] the command at ${filePath} is missing a data or execute property!`)
        }
    }
}


client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return
    console.log(interaction)

    const command = interaction.client.commands.get(interaction.commandName)
    if (!command) return
    
    try {
        await command.execute(interaction)
    } 
    catch (error) {
        console.error(error)
        if (interaction.replied || interaction.deferred)
            await interaction.followUp({ content: "Algo deu errado ao executar esse comando. Peço perdão.", ephemeral: true})
        else
            await interaction.reply({ content: "Algo deu errado ao executar esse comando. Peço perdão.", ephemeral: true })        
    } 
})

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isAutocomplete()) return
    const command = interaction.client.commands.get(interaction.commandName)
    if (!command) return
    await command.autocomplete(interaction)
})

client.on('guildCreate', async (guild) => {
    await guild.commands.set(client.commands.map(command => command.data))
    console.log("comandos salvos")
})

client.login(process.env.TOKEN)