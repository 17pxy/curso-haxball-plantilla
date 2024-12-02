const { glob } = require("glob");
const { promisify } = require("util");
const { Client } = require("discord.js");
const mongoose = require("mongoose");
const yaml = require('js-yaml');
const fs = require('fs');
const config = yaml.load(fs.readFileSync('settings/config.yml', 'utf8', 2))
const chalk = require('chalk');
const globPromise = promisify(glob);

/**
 * @param {Client} client
 */
module.exports = async (client) => {

    client.on("ready", () => {
    
        console.log(chalk.magenta.bold(' ╔━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╗'));
        console.log(chalk.magenta.bold(` ┃   Curso haxball scripts por 17pxy          ┃`))
        console.log(chalk.magenta.bold(` ╚━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╝`))

    })

    // Commands
    const commandFiles = await globPromise(`${process.cwd()}/prefixCommands/**/*.js`);
    commandFiles.map((value) => {
        const file = require(value);
        const splitted = value.split("/");
        const directory = splitted[splitted.length - 2];

        if (file.name) {
            const properties = { directory, ...file };
            client.commands.set(file.name, properties);
        }
    });

    // Events
    const eventFiles = await globPromise(`${process.cwd()}/events/*/*.js`);
    eventFiles.map((value) => require(value));

    // Slash Commands

    const slashCommands = await globPromise(
        `${process.cwd()}/commands/*/*.js`
    );

    const arrayOfSlashCommands = [];
    slashCommands.map((value) => {
        const file = require(value);
        if (!file?.name) return;
        client.slashCommands.set(file.name, file);

        if (["MESSAGE", "USER"].includes(file.type)) delete file.description;
        arrayOfSlashCommands.push(file);
    });

    client.on("ready", async () => {

        await client.application.commands.set(arrayOfSlashCommands);
   });

   if (!client.config.mongooseConnectionString) return;

   mongoose.connect(client.config.mongooseConnectionString).then(() => console.log('Conectado mongodb'));
};

