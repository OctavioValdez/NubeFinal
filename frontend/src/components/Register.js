import React, { useState } from "react";
import axios from "axios";

const backendURL = `${process.env.REACT_APP_BACKEND_URL}/api`;

console.log("Backend URL:", backendURL);

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
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
      .post(`${backendURL}/register`, formData)
      .then((response) => {
        alert("Registro exitoso");
        setFormData({ name: "", email: "", password: "" });
      })
      .catch((error) => {
        console.error("Error en el registro:", error);
        alert("Error al registrarse");
      });
  };

  return (
    <div className="form-page">
      <h2>Registrar Cliente</h2>
      <form onSubmit={handleFormSubmit} className="form">
        <input
          type="text"
          name="name"
          placeholder="Nombre completo"
          required
          value={formData.name}
          onChange={handleInputChange}
        />
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
        <button type="submit">Registrar</button>
      </form>
    </div>
  );
};

export default Register;
