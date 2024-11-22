import React, { useEffect, useState } from "react";
import axios from "axios";

const backendURL = "http://localhost:5000";

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [createFormData, setCreateFormData] = useState({
    nombre: "",
    direccion: "",
    email: "",
    telefono1: "",
    telefono2: "",
    notas: "",
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await axios.get(`${backendURL}/clientes`);
      setClients(response.data.data);
    } catch (error) {
      console.error("Error al cargar los clientes:", error);
    }
  };

  const handleCreateInputChange = (event) => {
    const { name, value } = event.target;
    setCreateFormData({
      ...createFormData,
      [name]: value,
    });
  };

  const handleEditInputChange = (event) => {
    const { name, value } = event.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  const handleCreateFormSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post(`${backendURL}/clientes`, createFormData);
      alert("Cliente creado con éxito");
      setClients([...clients, response.data]);
      setCreateFormData({
        nombre: "",
        direccion: "",
        email: "",
        telefono1: "",
        telefono2: "",
        notas: "",
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error("Error al crear el cliente:", error);
    }
  };

  const handleEditFormSubmit = async (event, id) => {
    event.preventDefault();

    try {
      await axios.put(`${backendURL}/clientes/${id}`, editFormData);
      alert("Cliente actualizado con éxito");
      fetchClients();
      setEditFormData(null);
    } catch (error) {
      console.error("Error al actualizar el cliente:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este cliente?")) {
      try {
        await axios.delete(`${backendURL}/clientes/${id}`);
        alert("Cliente eliminado con éxito");
        fetchClients();
      } catch (error) {
        console.error("Error al eliminar el cliente:", error);
      }
    }
  };

  return (
    <div className="list-page">
      <h2>Lista de Clientes</h2>
      <ul className="list">
        {clients.map((client) => (
          <li key={client.id_cliente} className="list-item">
            {editFormData && editFormData.id_cliente === client.id_cliente && (
              <form
                onSubmit={(event) => handleEditFormSubmit(event, client.id_cliente)}
                className="form edit-form"
              >
                <input
                  type="text"
                  name="nombre"
                  placeholder="Nombre"
                  required
                  value={editFormData.nombre}
                  onChange={handleEditInputChange}
                />
                <input
                  type="text"
                  name="direccion"
                  placeholder="Dirección"
                  required
                  value={editFormData.direccion}
                  onChange={handleEditInputChange}
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  required
                  value={editFormData.email}
                  onChange={handleEditInputChange}
                />
                <input
                  type="text"
                  name="telefono1"
                  placeholder="Teléfono 1"
                  required
                  value={editFormData.telefono1}
                  onChange={handleEditInputChange}
                />
                <input
                  type="text"
                  name="telefono2"
                  placeholder="Teléfono 2"
                  value={editFormData.telefono2}
                  onChange={handleEditInputChange}
                />
                <textarea
                  name="notas"
                  placeholder="Notas"
                  value={editFormData.notas}
                  onChange={handleEditInputChange}
                />
                <button type="submit">Guardar Cambios</button>
                <button
                  type="button"
                  onClick={() => setEditFormData(null)}
                  className="button danger"
                >
                  Cancelar
                </button>
              </form>
            )}
            <div className="item-details">
              <strong>{client.nombre}</strong>
              <div className="item-buttons">
                <button
                  className="button edit"
                  onClick={() =>
                    setEditFormData({
                      id_cliente: client.id_cliente,
                      nombre: client.nombre,
                      direccion: client.direccion,
                      email: client.email,
                      telefono1: client.telefono1,
                      telefono2: client.telefono2,
                      notas: client.notas,
                    })
                  }
                >
                  Editar
                </button>
                <button
                  className="button danger"
                  onClick={() => handleDelete(client.id_cliente)}
                >
                  Eliminar
                </button>
              </div>
            </div>
            <p>Dirección: {client.direccion}</p>
            <p>Email: {client.email}</p>
            <p>Teléfono 1: {client.telefono1}</p>
            <p>Teléfono 2: {client.telefono2}</p>
            <p>Notas: {client.notas}</p>
          </li>
        ))}
      </ul>

      <div className="button-container">
        <button
          className="button create-button"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? "Ocultar Formulario" : "Crear Nuevo Cliente"}
        </button>
        <a href="/" className="button home-button">Regresar al Inicio</a>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateFormSubmit} className="form">
          <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            required
            value={createFormData.nombre}
            onChange={handleCreateInputChange}
          />
          <input
            type="text"
            name="direccion"
            placeholder="Dirección"
            required
            value={createFormData.direccion}
            onChange={handleCreateInputChange}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            value={createFormData.email}
            onChange={handleCreateInputChange}
          />
          <input
            type="text"
            name="telefono1"
            placeholder="Teléfono 1"
            required
            value={createFormData.telefono1}
            onChange={handleCreateInputChange}
          />
          <input
            type="text"
            name="telefono2"
            placeholder="Teléfono 2"
            value={createFormData.telefono2}
            onChange={handleCreateInputChange}
          />
          <textarea
            name="notas"
            placeholder="Notas"
            value={createFormData.notas}
            onChange={handleCreateInputChange}
          />
          <button type="submit">Crear Cliente</button>
        </form>
      )}
    </div>
  );
};

export default ClientList;
