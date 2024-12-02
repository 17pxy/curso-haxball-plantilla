const { MessageEmbed, Client, Collection } = require('discord.js');
const fs = require("fs");
const yaml = require("js-yaml");
const statsModel = require('./Models/statsModel.js')

const client = new Client({
    intents: 32767,
});

module.exports = (client)

client.commands = new Collection();
client.slashCommands = new Collection();
client.config = yaml.load(fs.readFileSync('settings/config.yml', 'utf8', 2));

require("./handler")(client);
require('events').EventEmitter.defaultMaxListeners = 0;

process.on('unhandledRejection', error => {
  console.error(error);
});

client.on('shardError', error => {
  console.error(error);
});


const HaxballJS = require("haxball.js");

HaxballJS.then((HBInit) => {

  let lastKickerId;
  let lastKickerName;
  let lastKickerTeam;
  let secondLastKickerId;
  let secondLastKickerName;
  let secondLastKickerTeam;
  let players;

  const room = HBInit({
    roomName: "Curso haxball rana",
    maxPlayers: 16,
    public: true,
    noPlayer: true,
    token: "thr1.AAAAAGdNAaCsinwkhnJ60g.SyCGqio7nBE", 
  });

  room.setDefaultStadium("Big");
  room.setScoreLimit(5);
  room.setTimeLimit(0);

  // client.channels.cache.get("1145139741377970236").send({ content: `La sala se encuentra on, ya pueden ingresar @here`})

  room.onRoomLink = function (link) {
    console.log(link);
  };
  
  
  room.onPlayerJoin = async function(player) {

    room.setPlayerAdmin(player.id, true);

    const isRegistered = await statsModel.findOne({ name: player.name });
    if(!isRegistered){

    const stats = statsModel.create({
      name: player.name,
      auth: player.auth,
      conexion: player.conn,
      id: player.id,
    })

    console.log(stats)
  } else {

  isRegistered.id = player.id;
  await isRegistered.save();

  console.log(isRegistered);
  }

    client.channels.cache.get("1145139741377970236").send({ content: `${player.name} ingresó a la sala!` })
  }
  
  room.onPlayerBallKick = async function (player) {

    secondLastKickerId = lastKickerId;
    secondLastKickerName = lastKickerName;
    secondLastKickerTeam = lastKickerTeam;
   
    lastKickerId = player.id;
    lastKickerName = player.name;
    lastKickerTeam = player.team;
  
    players = room.getPlayerList();
  }

  room.onTeamGoal = async function(team){

    const userStats = await statsModel.findOne({ name: lastKickerName });
    const assistStats = await statsModel.findOne({ name: secondLastKickerName });
    
    if(team == 1){
      if(lastKickerTeam == 2) {


        room.sendAnnouncement(`NOO Hiciste gol en contra! - ${lastKickerName} - 🟥 ${room.getScores().red} - ${room.getScores().blue} 🟦`, null, 0xFFF38, "bold", 1);
      } else if(lastKickerId === secondLastKickerId || lastKickerTeam != secondLastKickerTeam){
        room.sendAnnouncement(`GOOOOL! - ${lastKickerName} - 🟥 ${room.getScores().red} - ${room.getScores().blue} 🟦`, null, 0xFFF38, "bold", 1);

        await statsModel.findOneAndUpdate({ name: lastKickerName }, { $inc: { goles: 1 }});
      } else if(lastKickerId != secondLastKickerId || lastKickerTeam == secondLastKickerTeam){

        room.sendAnnouncement(`GOOOOL! - ${lastKickerName} [⚽] ${secondLastKickerName} [👟] - 🟥 ${room.getScores().red} - ${room.getScores().blue} 🟦`, null, 0xFFF38, "bold", 1);

        await statsModel.findOneAndUpdate({ name: lastKickerName }, { $inc: { goles: 1 }});
        await statsModel.findOneAndUpdate({ name: secondLastKickerName }, { $inc: { asistencias: 1 }});

      }

    } else if(team == 2){

      if(lastKickerTeam == 1) {

        room.sendAnnouncement(`NOO Hiciste gol en contra! - ${lastKickerName} - 🟥 ${room.getScores().red} - ${room.getScores().blue} 🟦`, null, 0xFFF38, "bold", 1);
      } else if(lastKickerId === secondLastKickerId || lastKickerTeam != secondLastKickerTeam){
        room.sendAnnouncement(`GOOOOL! - ${lastKickerName} - 🟥 ${room.getScores().red} - ${room.getScores().blue} 🟦`, null, 0xFFF38, "bold", 1);

        await statsModel.findOneAndUpdate({ name: lastKickerName }, { $inc: { goles: 1 }});
      } else if(lastKickerId != secondLastKickerId || lastKickerTeam == secondLastKickerTeam){

        room.sendAnnouncement(`GOOOOL! - ${lastKickerName} [⚽] ${secondLastKickerName} [👟] - 🟥 ${room.getScores().red} - ${room.getScores().blue} 🟦`, null, 0xFFF38, "bold", 1);

        await statsModel.findOneAndUpdate({ name: lastKickerName }, { $inc: { goles: 1 }});
        await statsModel.findOneAndUpdate({ name: secondLastKickerName }, { $inc: { asistencias: 1 }});

      }

    }
  }

  room.onPlayerChat = function(player, msg) {
    
    client.channels.cache.get("1312945163911430164").send({ content: `**${player.name}**: ${msg}`})

    if(msg.startsWith("-")){
      msg = msg.substr(1);
      let args = msg.split(" ");
      args[0] = args[0].toLowerCase();

      if(args[0] == "stats"){
        async function comandoStats(){

          const userStats = await statsModel.findOne({ user: player.name });

          room.sendAnnouncement(`ESTADISTICAS DEL USUARIO`, player.id, null, "bold", 1);
          room.sendAnnouncement(`⚽ Goles ${userStats.goles}`, player.id, null, "bold", 1);
          room.sendAnnouncement(`👟 Asistencias ${userStats.asistencias}`, player.id, null, "bold", 1);
        }
        comandoStats()
      }
    }

  }

  client.on("messageCreate", async (message) => {

    if(message.author.bot) return;
    if(message.channelId != "1312945163911430164") return;
    room.sendAnnouncement(`${message.member.user.username} envió un mensaje desde discord: ${message.content}`, null, null, "bold", 1);
    console.log(message.content)

    const allStats = await statsModel.find();
     console.log(allStats)

  })

});



client.login(client.config.TOKEN);