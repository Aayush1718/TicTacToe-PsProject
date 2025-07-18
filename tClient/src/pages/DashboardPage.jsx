import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../contexts/UserContext";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { socket, isConnected, setRoom } = useUserContext();

  const [roomCode, setRoomCode] = useState("");
  const [waitingRoomId, setWaitingRoomId] = useState(null);

  const createRoom = () => {
    if (!isConnected) {
      alert("WebSocket not connected!");
      return;
    }

    socket.send(
      JSON.stringify({
        type: "create_room",
      })
    );

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "room_created") {
        console.log("✅ Room Created:", message.room.roomId);

        // Save room to context
        setRoom({
          roomId: message.room.roomId,
          symbol: message.symbol, // X for creator
          board: message.room.board || [
            [null, null, null],
            [null, null, null],
            [null, null, null],
          ],
          status: message.room.status,
          nextTurn: message.nextTurn, // 🆕 Fix
        });

        // Show popup
        setWaitingRoomId(message.room.roomId);
      }

      if (message.type === "player_joined") {
        console.log("✅ Player joined:", message.room);

        setRoom((prev) => ({
          ...prev,
          players: message.room.players,
          status: message.room.status,
          nextTurn: message.nextTurn, // 🆕 Fix
        }));

        navigate(`/game/${message.room.roomId}`);
      }

      if (message.type === "error") {
        alert(`Error: ${message.message}`);
      }
    };
  };

  const joinRoom = () => {
    if (!isConnected) {
      alert("WebSocket not connected!");
      return;
    }
    if (!roomCode.trim()) {
      alert("Enter a room code to join!");
      return;
    }

    socket.send(
      JSON.stringify({
        type: "join_room",
        roomId: roomCode.trim(),
      })
    );

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "player_joined") {
        console.log("✅ Joined Room:", message.room.roomId);

        setRoom({
          roomId: message.room.roomId,
          symbol: message.room.players.find(
            (p) => p.symbol === "O"
          ).symbol, // O for joiner
          board: message.room.board || [
            [null, null, null],
            [null, null, null],
            [null, null, null],
          ],
          status: message.room.status,
          nextTurn: message.nextTurn, // 🆕 Fix
        });

        navigate(`/game/${message.room.roomId}`);
      }

      if (message.type === "error") {
        alert(`Error: ${message.message}`);
      }
    };
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <h1 className="text-4xl font-bold mb-6">🎮 Tic Tac Toe Dashboard</h1>

      <button
        onClick={createRoom}
        className="px-6 py-3 bg-green-600 text-white rounded-lg mb-4 hover:bg-green-700"
      >
        Create Room
      </button>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter Room Code"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-400"
        />
        <button
          onClick={joinRoom}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Join Room
        </button>
      </div>

      {waitingRoomId && (
        <div className="mt-6 p-4 border rounded-lg bg-yellow-100 text-yellow-800">
          <p className="font-bold text-lg">Room Created!</p>
          <p>
            Room ID:{" "}
            <span className="font-mono text-lg">{waitingRoomId}</span>
          </p>
          <p className="mt-2">Waiting for opponent to join...</p>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;



