import React, { useEffect, useState } from "react";
import axios from "axios";

const backendURL = process.env.BACKENDURL;

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
  
      if (response.data.success) {
        alert("Cliente creado con éxito");
        // Agregar el nuevo cliente al estado existente
        setClients((prevClients) => [...prevClients, response.data.data]);
        setCreateFormData({
          nombre: "",
          direccion: "",
          email: "",
          telefono1: "",
          telefono2: "",
          notas: "",
        });
        setShowCreateForm(false);
      } else {
        alert(`Error al crear cliente: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error al crear el cliente:", error);
      alert("Ocurrió un error al intentar crear el cliente.");
    }
  };

  const handleEditFormSubmit = async (event, id) => {
    event.preventDefault();
  
    try {
      const response = await axios.put(`${backendURL}/clientes/${id}`, editFormData, {
        headers: { "Content-Type": "application/json" },
      });
      if (response.data.success) {
        alert("Cliente actualizado con éxito");
        fetchClients();
        setEditFormData(null);
      } else {
        alert(`Error al actualizar cliente: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error al actualizar el cliente:", error);
      alert("Ocurrió un error al intentar actualizar el cliente.");
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
          <li key={client.id} className="list-item">
            {editFormData && editFormData.id === client.id ? (
              <form
                onSubmit={(event) => handleEditFormSubmit(event, client.id)}
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
                ></textarea>
                <button type="submit">Guardar Cambios</button>
                <button
                  type="button"
                  onClick={() => setEditFormData(null)}
                  className="button danger"
                >
                  Cancelar
                </button>
              </form>
            ) : (
              <div className="item-details">
                <strong>{client.nombre}</strong>
                <p>Dirección: {client.direccion}</p>
                <p>Email: {client.email}</p>
                <p>Teléfono 1: {client.telefono1}</p>
                <p>Teléfono 2: {client.telefono2}</p>
                <p>Notas: {client.notas}</p>
                <div className="item-buttons">
                  <button
                    className="button edit"
                    onClick={() => setEditFormData(client)}
                  >
                    Editar
                  </button>
                  <button
                    className="button danger"
                    onClick={() => handleDelete(client.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            )}
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
        <a href="/" className="button home-button">
          Regresar al Inicio
        </a>
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
          ></textarea>
          <button type="submit">Crear Cliente</button>
        </form>
      )}
    </div>
  );
};

export default ClientList;
