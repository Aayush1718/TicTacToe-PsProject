import React, { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState(null); 
  const [socket, setSocket] = useState(null); 
  const [room, setRoom] = useState(null); 
  const [isConnected, setIsConnected] = useState(false); 
  useEffect(() => {
    if (user && !socket) {
      const ws = new WebSocket(
        `${import.meta.env.VITE_API_URL.replace("http", "ws")}/?token=${localStorage.getItem("token")}`
      );

      ws.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log("📨 WS Message:", message);

        switch (message.type) {
          case "connection":
            console.log("Server says:", message.message);
            break;

          case "room_created":
            setRoom({
              roomId: message.room.roomId,
              symbol: message.symbol,
              board: message.room.board,
              status: message.room.status,
            });
            break;

          case "player_joined":
            setRoom((prev) => ({
              ...prev,
              players: message.room.players,
              status: message.room.status,
            }));
            break;

          case "move_made":
            setRoom((prev) => ({
              ...prev,
              board: message.board,
              status: message.roomStatus,
              winner: message.winner,
              nextTurn: message.nextTurn,
            }));
            break;

          case "error":
            console.error("Server error:", message.message);
            alert(message.message);
            break;

          default:
            console.warn("Unknown WS message:", message);
        }
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);
        setSocket(null);
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
      };

      setSocket(ws);

      return () => {
        ws.close();
        setSocket(null);
      };
    }
  }, [user]); 
  const logout = () => {
    setUser(null);
    setRoom(null);
    localStorage.removeItem("token");
    if (socket) {
      socket.close();
      setSocket(null);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        socket,
        setSocket,
        room,
        setRoom,
        isConnected,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);

