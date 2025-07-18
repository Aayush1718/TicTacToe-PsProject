import { Room } from "../models/room.models.js";
import { nanoid } from "nanoid";
import { User } from "../models/user.models.js";

const activeConnections = new Map();

export const handleWSMessage = async (ws, user, data) => {
  try {
    const message = JSON.parse(data);

    switch (message.type) {
      case "create_room":
        await handleCreateRoom(ws, user);
        break;

      case "join_room":
        await handleJoinRoom(ws, user, message.roomId);
        break;

      case "make_move":
        await handleMakeMove(ws, user, message.roomId, message.row, message.col);
        break;

      default:
        ws.send(JSON.stringify({ type: "error", message: "Unknown action" }));
    }
  } catch (err) {
    console.error("WS Handler Error:", err.message);
    ws.send(JSON.stringify({ type: "error", message: "Server error" }));
  }
};

const handleCreateRoom = async (ws, user) => {
  const roomId = nanoid(6);
  const newRoom = await Room.create({
    roomId,
    players: [{ userId: user._id, userName: user.userName, symbol: "X" }],
    status: "waiting",
  });
  ws.send(
    JSON.stringify({
      type: "room_created",
      room: newRoom,
      symbol: "X",
      nextTurn: "X", // ADD THIS
    })
  );

};

const handleJoinRoom = async (ws, user, roomId) => {
  const room = await Room.findOne({ roomId });
  if (!room) {
    ws.send(JSON.stringify({ type: "error", message: "Room not found" }));
    return;
  }

  if (room.players.length >= 2) {
    ws.send(JSON.stringify({ type: "error", message: "Room is full" }));
    return;
  }

  room.players.push({
    userId: user._id,
    userName: user.userName,
    symbol: "O",
  });
  room.status = "in_progress";
  await room.save();

  broadcastToRoom(roomId, {
  type: "player_joined",
  room,
  nextTurn: "X", // ADD THIS
});

};

const handleMakeMove = async (ws, user, roomId, row, col) => {
  const room = await Room.findOne({ roomId });
  if (!room) {
    ws.send(JSON.stringify({ type: "error", message: "Room not found" }));
    return;
  }

  if (room.status !== "in_progress") {
    return ws.send(JSON.stringify({
      type: "error",
      message: "Game is already finished"
    }));
  }

  const lastMove = room.moves.at(-1);
  const currentPlayer = room.players.find(
    (p) => p.userId.toString() === user._id.toString()
  );

  if (!currentPlayer) {
    ws.send(JSON.stringify({ type: "error", message: "Not in room" }));
    return;
  }

  if (!lastMove && currentPlayer.symbol !== "X") {
    ws.send(JSON.stringify({ type: "error", message: "X plays first" }));
    return;
  }

  if (lastMove && lastMove.player === currentPlayer.symbol) {
    ws.send(JSON.stringify({ type: "error", message: "Not your turn" }));
    return;
  }
  
  const board = room.board;

  if (board[row][col]) {
    ws.send(JSON.stringify({ type: "error", message: "Cell occupied" }));
    return;
  }

  room.moves.push({ row, col, player: currentPlayer.symbol });

  board[row][col] = currentPlayer.symbol;

  const result = checkWinner(board, row, col, currentPlayer.symbol);

  if (result.winner && result.winner !== "draw") {
    room.status = "finished";
    room.winner = result.winner;

    const winnerPlayer = room.players.find(p => p.symbol === result.winner);

    if (winnerPlayer) {
      await User.findByIdAndUpdate(winnerPlayer.userId, { $inc: { gamesWon: 1 } });
    }

  } else if (result.winner === "draw") {
    room.status = "finished";
    room.winner = "draw";
  }

  await room.save();

  const nextTurn = currentPlayer.symbol === "X" ? "O" : "X";

  broadcastToRoom(roomId, {
    type: "move_made",
    move: { row, col, player: currentPlayer.symbol },
    board,
    winner: room.winner || null,
    roomStatus: room.status,
    nextTurn: room.status === "finished" ? null : nextTurn,
  });
};

const broadcastToRoom = (roomId, message) => {
  [...activeConnections.entries()].forEach(([userId, client]) => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
};

const checkWinner = (board, row, col, player) => {
  const size = board.length;

  const winRow = board[row].every((cell) => cell === player);
  const winCol = board.every((r) => r[col] === player);
  const winDiag1 = row === col && board.every((r, i) => r[i] === player);
  const winDiag2 =
    row + col === size - 1 && board.every((r, i) => r[size - 1 - i] === player);

  if (winRow || winCol || winDiag1 || winDiag2) {
    return { winner: player };
  }

  const isDraw = board.flat().every((cell) => cell !== null);
  if (isDraw) {
    return { winner: "draw" };
  }

  return { winner: null };
};

export { activeConnections };
