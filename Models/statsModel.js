const mongoose = require("mongoose");

const stats = new mongoose.Schema({
    name: String,
    auth: String,
    conexion: String,
    id: Number,
    discordID: String,
    isAdmin: { type: Boolean, default: false },
    isVip: { type: Boolean, default: false },
    isBlacklisted: { type: Boolean, default: false },
    goles: { type: Number, default: 0 },
    asistencias: { type: Number, default: 0},
})

module.exports = mongoose.model('stats', stats)