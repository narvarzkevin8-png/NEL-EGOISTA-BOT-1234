const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('formación')
        .setDescription('team'),

    async execute(interaction) {

        let posiciones = {
            CF: null,
            RW: null,
            LW: null,
            CM: null,
            GK: null
        };

        let estilos = {};
        let rarezaTemporal = {};

        const rarezas = {

            "🔵 Raro": ["Isagi", "Chigiri", "Hiori"],

            "🟣 Épico": ["Otoya", "Kurona", "Gagamaru", "Raichi"],

            "🟡 Legendario": ["Kunigami", "Bachira", "Karasu", "Nagi"],

            "🔴 Mítico": ["Rey", "Rin", "Aiku", "Yukimiya", "Shidou", "Ness"],

            "⚪ Clase Mundial": ["NEL Isagi", "NEL Nagi", "Charles"],

            "🟢 Generacional": [ "Michael Kaiser","Sae Itoshi","Don Lorenzo",],

            "🌈 Maestro": ["Lavinho", "Loki"],

            "⭐ Limitado": ["McNagi Fryshiro","Easter Kaiser","Reaper Sae","Demon Shidou","Bloodmoon Rin","Skeleton Nagi","Phantom Isagi","Elf Emperor","Krampus Barou","Subzero Loki","Gingerbread Charles"]
        };

        const actualizar = () => {
            return `**__FORMACIÓN__**

CF : ${posiciones.CF ? `<@${posiciones.CF}> (${estilos[posiciones.CF] ?? "Sin estilo"})` : "*nadie*"}
LW : ${posiciones.LW ? `<@${posiciones.LW}> (${estilos[posiciones.LW] ?? "Sin estilo"})` : "*nadie*"}
RW : ${posiciones.RW ? `<@${posiciones.RW}> (${estilos[posiciones.RW] ?? "Sin estilo"})` : "*nadie*"}
CM : ${posiciones.CM ? `<@${posiciones.CM}> (${estilos[posiciones.CM] ?? "Sin estilo"})` : "*nadie*"}
GK : ${posiciones.GK ? `<@${posiciones.GK}> (${estilos[posiciones.GK] ?? "Sin estilo"})` : "*nadie*"}
`;
        };

        const menuPosiciones = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("select_posicion")
                .setPlaceholder("⚽ Selecciona tu posición")
                .addOptions([
                    { label: "CF", value: "CF" },
                    { label: "LW", value: "LW" },
                    { label: "RW", value: "RW" },
                    { label: "CM", value: "CM" },
                    { label: "GK", value: "GK" }
                ])
        );

        const botonSalir = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("SALIR")
                .setLabel("❌ Salir posición")
                .setStyle(ButtonStyle.Danger)
        );

        const msg = await interaction.reply({
            content: actualizar(),
            components: [menuPosiciones, botonSalir],
            fetchReply: true
        });

        const collector = 
        interaction.channel.createMessageComponentCollector({
             time: 600000 
        });

        collector.on("collect", async i => {

            // SELECCIONAR POSICIÓN
            if (i.customId === "select_posicion") {

                const posicion = i.values[0];

                if (posiciones[posicion]) {
                    return i.reply({
                        content: "❌ Esa posición ya está ocupada.",
                        ephemeral: true
                    });
                }

                Object.keys(posiciones).forEach(p => {
                    if (posiciones[p] === i.user.id) {
                        posiciones[p] = null;
                    }
                });

                posiciones[posicion] = i.user.id;

                await i.update({
                    content: actualizar(),
                    components: [menuPosiciones, botonSalir]
                });

                const selectRareza = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId("select_rareza")
                        .setPlaceholder("🎭 Selecciona una rareza")
                        .addOptions(
                            Object.keys(rarezas).map(r => ({
                                label: r,
                                value: r
                            }))
                        )
                );

                return i.followUp({
                    content: "🎭 Ahora selecciona una rareza:",
                    components: [selectRareza],
                    ephemeral: true
                });
            }

            // SELECCIONAR RAREZA
            if (i.customId === "select_rareza") {

                const rareza = i.values[0];
                rarezaTemporal[i.user.id] = rareza;

                const selectPersonaje = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId("select_personaje")
                        .setPlaceholder("👤 Selecciona un personaje")
                        .addOptions(
                            rarezas[rareza].map(p => ({
                                label: p,
                                value: p
                            }))
                        )
                );

                return i.update({
                    content: `🎭 Rareza: ${rareza}\nElige personaje:`,
                    components: [selectPersonaje]
                });
            }

            // SELECCIONAR PERSONAJE
            if (i.customId === "select_personaje") {

                const personaje = i.values[0];
                estilos[i.user.id] = personaje;
                delete rarezaTemporal[i.user.id];

                await i.update({
                    content: "✅ Estilo seleccionado correctamente.",
                    components: []
                });

                await msg.edit({
                    content: actualizar(),
                    components: [menuPosiciones, botonSalir]
                });
            }

            // SALIR
            if (i.customId === "SALIR") {

                Object.keys(posiciones).forEach(p => {
                    if (posiciones[p] === i.user.id) {
                        posiciones[p] = null;
                    }
                });

                delete estilos[i.user.id];

                await i.reply({
                    content: "❌ Saliste de tu posición.",
                    ephemeral: true
                });

                await msg.edit({
                    content: actualizar(),
                    components: [menuPosiciones, botonSalir]
                });
            }

        });

        collector.on("end", async () => {
            await msg.edit({ components: [] }).catch(() => {});
        });
    }
};