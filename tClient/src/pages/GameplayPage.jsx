import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUserContext } from "../contexts/UserContext";

const GameplayPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { socket, room, setRoom } = useUserContext();

  const goToDashboard = () => {
    setRoom(null);
    navigate("/dashboard");
  };


  useEffect(() => {
    if (!socket) {
      alert("WebSocket not connected. Returning to dashboard...");
      navigate("/dashboard");
      return;
    }

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("📩 WS Message:", message);

      if (message.type === "move_made") {
        setRoom((prev) => ({
          ...prev,
          board: message.board,
          status: message.roomStatus,
          winner: message.winner,
          nextTurn: message.nextTurn, 
        }));
      }
    };
  }, [socket, navigate, setRoom]);

  const handleCellClick = (rowIdx, colIdx) => {
    if (room.status === "finished") {
      alert("Game over!");
      return;
    }

    if (room.board[rowIdx][colIdx]) {
      alert("Cell already occupied!");
      return;
    }

    if (room.nextTurn !== room.symbol) {
      alert("Not your turn!");
      return;
    }

    socket.send(
      JSON.stringify({
        type: "make_move",
        roomId,
        row: rowIdx,
        col: colIdx,
      })
    );
  };

  if (!room || !room.board) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-xl">Loading room data...</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <h2 className="text-2xl mb-4">Room: {roomId}</h2>
      <h3 className="mb-2 text-lg">You are: {room.symbol}</h3>
      <h4 className="mb-4">
        {room.status === "finished" ? (
          room.winner === "draw" ? (
            "It's a Draw!"
          ) : (
            `${room.winner} Wins!`
          )
        ) : (
          <>
            <span className="font-semibold">Turn: </span>
            <span className="font-bold text-xl">
              {room.nextTurn || "Loading..."}
            </span>
          </>
        )}


      </h4>

      <div className="grid grid-cols-3 gap-2 mb-6">
        {room.board.map((row, rowIdx) =>
          row.map((cell, colIdx) => (
            <div
              key={`${rowIdx}-${colIdx}`}
              onClick={() => handleCellClick(rowIdx, colIdx)}
              className="w-20 h-20 flex items-center justify-center border border-gray-500 text-3xl font-bold cursor-pointer bg-white hover:bg-gray-200"
            >
              {cell}
            </div>
          ))
        )}
      </div>

      {room.status === "finished" && (
        <button
          onClick={goToDashboard}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go to Dashboard
        </button>
      )}
    </div>
  );
};

export default GameplayPage;
