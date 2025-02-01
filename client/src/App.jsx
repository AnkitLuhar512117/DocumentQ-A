import React from "react";
import "./App.css";
import Home from "./pages/Home";
import { Route, Routes } from "react-router-dom";
import Chat from "./pages/Chat";

const App = () => {
  return (
    <>
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route exact path="/chat" element={<Chat />} />
        <Route exact path="*" element={<Home />} />
      </Routes>
    </>
  );
};

export default App;
