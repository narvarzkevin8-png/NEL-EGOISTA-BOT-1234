require('dotenv').config();
const { Client, Collection, GatewayIntentBits, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();

const commands = [];
const commandsPath = path.join(__dirname, 'commands');

// 📂 Cargar comandos
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        if (!command.data || !command.execute) continue;

        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
    }
}

// 🔥 Registrar comandos cuando el bot esté listo
client.once('ready', async () => {

    console.log(`✅ Bot listo como ${client.user.tag}`);

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    try {

        console.log("🔄 Registrando comandos...");

        const guildId = "1477429513565503541"; // 👈 PON TU ID AQUÍ

        await rest.put(
            Routes.applicationGuildCommands(client.application.id, guildId),
            { body: commands }
        );

        console.log("✅ Comandos registrados correctamente");

    } catch (error) {
        console.error("❌ Error registrando comandos:", error);
    }
});

// 🎯 Ejecutar comandos (CON SISTEMA DE DEFER)
client.on('interactionCreate', async interaction => {

    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {

        // 🔥 Si el comando tarda más de 3 segundos
        await interaction.deferReply().catch(() => {});

        await command.execute(interaction);

    } catch (error) {
        console.error("❌ Error ejecutando comando:", error);

        if (!interaction.replied) {
            await interaction.reply({
                content: "❌ Error ejecutando el comando",
                ephemeral: true
            }).catch(() => {});
        }
    }
});

client.login(process.env.TOKEN);