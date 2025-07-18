import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import LoginPage from "./pages/LoginPage.jsx"
import GameplayPage from "./pages/GameplayPage.jsx"
import HistoryPage from "./pages/HistoryPage.jsx"
import DashboardPage from "./pages/DashboardPage.jsx"
import { UserContextProvider } from './contexts/UserContext.jsx';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage/>,
  },
  {
    path: "/game/:roomId",
    element: <GameplayPage />
  },
  {
    path: "/history",
    element: <HistoryPage />
  },
  {
    path: "/dashboard",
    element: <DashboardPage />
  },
]);


ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <UserContextProvider>
      <RouterProvider router={router} />
    </UserContextProvider>
  </StrictMode>
)
