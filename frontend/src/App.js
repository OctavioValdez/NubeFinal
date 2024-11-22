import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Home from "./components/Home";
import FurnitureList from "./components/FurnitureList";
import ClientList from "./components/ClientList";
import Register from "./components/Register";
import Login from "./components/Login";
import "./styles.css";

function App() {
  return (
    <Router>
      <div>
        <header className="header">
          <nav className="nav-container">
            <div className="nav-links">
              <Link to="/" className="nav-link">Inicio</Link>
              <Link to="/furniture" className="nav-link">Muebles</Link>
              <Link to="/clients" className="nav-link">Clientes</Link>
            </div>
            <div className="auth-links">
              <Link to="/login" className="nav-link">Iniciar Sesión</Link>
              <Link to="/register" className="nav-link">Registrar</Link>
            </div>
          </nav>
        </header>
        <main className="main-container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/furniture" element={<FurnitureList />} />
            <Route path="/clients" element={<ClientList />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
