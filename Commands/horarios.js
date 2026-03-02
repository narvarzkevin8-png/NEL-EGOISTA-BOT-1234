const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('horario')
        .setDescription('Crea un mensaje de partido')
        .addStringOption(option =>
            option.setName('equipo_rival')
                .setDescription('Nombre del equipo rival')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('liga')
                .setDescription('Nombre de la liga')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('hora')
                .setDescription('Hora del partido')
                .setRequired(true)),

    async execute(interaction) {

        const rival = interaction.options.getString('equipo_rival');
        const liga = interaction.options.getString('liga');
        const hora = interaction.options.getString('hora');

        const mensaje = `
# **__PARTIDO__**

- 🔱 **EQUIPO RIVAL:** \`${rival}\`
- 🪩 **LIGA:** \`${liga}\`
- 🏟️ **HORA:** \`${hora}\`
`;

        // 🔥 Evita que falle si tarda
        if (!interaction.replied) {
            await interaction.reply({
                content: mensaje
            });
        }

    }
};