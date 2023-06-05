import logo from "./logo.svg";
import "./App.css";
import React from "react";
import Login from "./components/login/Login";
import {useState} from "react";
import Register from "./components/register/Register";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Chats from "./components/chats/Chats";
import Chat from "./components/chat/Chat";

function App() {
  const [loading, setLoading] = useState(false);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<Login loading={loading} setLoading={setLoading} />}
        />
        <Route
          path="/login"
          element={<Login loading={loading} setLoading={setLoading} />}
        />
        <Route
          path="/register"
          element={<Register loading={loading} setLoading={setLoading} />}
        />
        <Route path="/chats" element={<Chats />} />
        <Route path="/chat/:id" element={<Chat />} />
      </Routes>
    </Router>
  );
}

export default App;
