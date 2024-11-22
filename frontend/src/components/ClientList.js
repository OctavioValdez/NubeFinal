import React, { useEffect, useState } from "react";
import axios from "axios";

const backendURL = "http://localhost:5000/api";

const ClientList = () => {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    axios
      .get(`${backendURL}/clients`)
      .then((response) => setClients(response.data))
      .catch((error) => console.error(error));
  }, []);

  return (
    <div className="list-page">
      <h2>Lista de Clientes</h2>
      <ul className="list">
        {clients.map((client) => (
          <li key={client.id} className="list-item">
            <strong>{client.name}</strong>
            <p>{client.email}</p>
          </li>
        ))}
      </ul>
      <a href="/" className="button">Regresar al Inicio</a>
    </div>
  );
};

export default ClientList;
