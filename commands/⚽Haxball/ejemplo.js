

module.exports = {
    name: "ejemplo",
    description: "Ejemplo",
    type: 'CHAT_INPUT',

    async run(client, interaction) {

    interaction.reply({ content: "asd"})
    interaction.channel.send({ content: "hola como estas"})


    },
};
