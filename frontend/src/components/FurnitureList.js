import React, { useEffect, useState } from "react";
import axios from "axios";

const backendURL = "http://localhost:5000";

const FurnitureList = () => {
  const [furniture, setFurniture] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editFormData, setEditFormData] = useState(null); // Formulario de edición
  const [createFormData, setCreateFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    foto: null,
  });

  useEffect(() => {
    fetchFurniture();
  }, []);

  const fetchFurniture = async () => {
    try {
      const response = await axios.get(`${backendURL}/muebles`);
      setFurniture(response.data.data);
    } catch (error) {
      console.error("Error al cargar los muebles:", error);
    }
  };

  const handleCreateInputChange = (event) => {
    const { name, value, files } = event.target;
    setCreateFormData({
      ...createFormData,
      [name]: files ? files[0] : value,
    });
  };

  const handleEditInputChange = (event) => {
    const { name, value, files } = event.target;
    setEditFormData({
      ...editFormData,
      [name]: files ? files[0] : value,
    });
  };

  const handleCreateFormSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData();
    data.append("nombre", createFormData.nombre);
    data.append("descripcion", createFormData.descripcion);
    data.append("precio", createFormData.precio);
    data.append("stock", createFormData.stock);
    if (createFormData.foto) data.append("foto", createFormData.foto);

    try {
      const response = await axios.post(`${backendURL}/muebles`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Mueble creado con éxito");
      setFurniture([...furniture, response.data]);
      setCreateFormData({
        nombre: "",
        descripcion: "",
        precio: "",
        stock: "",
        foto: null,
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error("Error al crear el mueble:", error);
    }
  };

  const handleEditFormSubmit = async (event, id) => {
    event.preventDefault();
    const data = new FormData();
    data.append("nombre", editFormData.nombre);
    data.append("descripcion", editFormData.descripcion);
    data.append("precio", editFormData.precio);
    data.append("stock", editFormData.stock);
    if (editFormData.foto) {
      data.append("foto", editFormData.foto);
    }
  
    try {
      const response = await axios.put(`${backendURL}/muebles/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.success) {
        alert("Mueble actualizado con éxito");
        fetchFurniture();
        setEditFormData(null);
      } else {
        alert(`Error al actualizar mueble: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error al actualizar el mueble:", error);
      alert("Ocurrió un error al intentar actualizar el mueble.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este mueble?")) {
      try {
        await axios.delete(`${backendURL}/muebles/${id}`);
        alert("Mueble eliminado con éxito");
        fetchFurniture();
      } catch (error) {
        console.error("Error al eliminar el mueble:", error);
      }
    }
  };

  return (
    <div className="list-page">
      <h2>Lista de Muebles</h2>
      <ul className="list">
        {furniture.map((item) => (
          <li key={item.id} className="list-item">
            {editFormData && editFormData.id === item.id && (
              <form
                onSubmit={(event) => handleEditFormSubmit(event, item.id)}
                className="form edit-form"
              >
                <input
                  type="text"
                  name="nombre"
                  placeholder="Nombre del mueble"
                  required
                  value={editFormData.nombre}
                  onChange={handleEditInputChange}
                />
                <input
                  type="text"
                  name="descripcion"
                  placeholder="Descripción"
                  required
                  value={editFormData.descripcion}
                  onChange={handleEditInputChange}
                />
                <input
                  type="number"
                  name="precio"
                  placeholder="Precio"
                  required
                  value={editFormData.precio}
                  onChange={handleEditInputChange}
                />
                <input
                  type="number"
                  name="stock"
                  placeholder="Stock"
                  required
                  value={editFormData.stock}
                  onChange={handleEditInputChange}
                />
                <input
                  type="file"
                  name="foto"
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
              <strong>{item.nombre}</strong>
              <div className="item-buttons">
                <button
                  className="button edit"
                  onClick={() =>
                    setEditFormData({
                      id: item.id,
                      nombre: item.nombre,
                      descripcion: item.descripcion,
                      precio: item.precio,
                      stock: item.stock,
                      foto: null,
                    })
                  }
                >
                  Editar
                </button>
                <button
                  className="button danger"
                  onClick={() => handleDelete(item.id)}
                >
                  Eliminar
                </button>
              </div>
              <p>{item.descripcion}</p>
              <p>Precio: ${item.precio}</p>
              <p>Stock: {item.stock}</p>
              {item.image_url && <img src={item.image_url} alt={item.nombre} />}
            </div>
          </li>
        ))}
      </ul>

      <div className="button-container">
        <button className="button create-button" onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? "Ocultar Formulario" : "Crear Nuevo Mueble"}
        </button>
        <a href="/" className="button home-button">Regresar al Inicio</a>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateFormSubmit} className="form">
          <input
            type="text"
            name="nombre"
            placeholder="Nombre del mueble"
            required
            value={createFormData.nombre}
            onChange={handleCreateInputChange}
          />
          <input
            type="text"
            name="descripcion"
            placeholder="Descripción"
            required
            value={createFormData.descripcion}
            onChange={handleCreateInputChange}
          />
          <input
            type="number"
            name="precio"
            placeholder="Precio"
            required
            value={createFormData.precio}
            onChange={handleCreateInputChange}
          />
          <input
            type="number"
            name="stock"
            placeholder="Stock"
            required
            value={createFormData.stock}
            onChange={handleCreateInputChange}
          />
          <input
            type="file"
            name="foto"
            onChange={handleCreateInputChange}
          />
          <button type="submit">Crear Mueble</button>
        </form>
      )}
    </div>
  );
};

export default FurnitureList;
