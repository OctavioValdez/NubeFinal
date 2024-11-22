import React, { useState } from "react";
import axios from "axios";

const backendURL = "http://localhost:5000/api";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    axios
      .post(`${backendURL}/login`, formData)
      .then((response) => {
        alert("Inicio de sesión exitoso");
        setFormData({ email: "", password: "" });
      })
      .catch((error) => {
        console.error("Error en el inicio de sesión:", error);
        alert("Credenciales incorrectas");
      });
  };

  return (
    <div className="form-page">
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleFormSubmit} className="form">
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          required
          value={formData.email}
          onChange={handleInputChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          required
          value={formData.password}
          onChange={handleInputChange}
        />
        <button type="submit">Iniciar Sesión</button>
      </form>
    </div>
  );
};

export default Login;
