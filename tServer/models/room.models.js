import mongoose from "mongoose";

const moveSchema = new mongoose.Schema({
    row: { type: Number, required: true }, 
    col: { type: Number, required: true },
    player: { type: String, enum: ["X", "O"], required: true },
    time: { type: Date, default: Date.now }
})


const roomSchema = new mongoose.Schema({

    roomId: { type: String, unique: true, required: true },
    players: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        userName: String,
        symbol: { type: String, enum: ["X", "O"] }
      }
    ],
    board: {
      type: [[String]],
      default: [
        [null, null, null],
        [null, null, null],
        [null, null, null],
      ],
    },
    winner: {
    type: String,
    enum: ["X", "O", "draw", null],
    default: null
    },
    moves: [moveSchema],
    status: {
      type: String,
      enum: ["waiting", "in_progress", "finished"],
      default: "waiting"
    }},{timestamps : true});

export const Room = mongoose.model("Room" , roomSchema);