import React, { useEffect, useState } from "react";
import axios from "axios";

const backendURL = "http://localhost:5000/";

const FurnitureList = () => {
  const [furniture, setFurniture] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    foto: null,
  });

  useEffect(() => {
    axios
        .get(`${backendURL}/muebles`)
        .then((response) => setFurniture(response.data.data))
          .catch((error) => console.error(error));
  }, []);

  const handleInputChange = (event) => {
    const { name, value, files } = event.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    const data = new FormData();
    data.append("nombre", formData.nombre);
    data.append("descripcion", formData.descripcion);
    data.append("precio", formData.precio);
    data.append("stock", formData.stock);
    data.append("foto", formData.foto);

    axios
      .post(`${backendURL}/muebles`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        alert("Mueble creado con éxito");
        setFurniture([...furniture, response.data]);
        setShowForm(false);
      })
      .catch((error) => console.error("Error al crear el mueble:", error));
    };

  return (
    <div className="list-page">
      <h2>Lista de Muebles</h2>
      <ul className="list">
        {furniture.map((item) => (
            <li key={item.id} className="list-item">
                <strong>{item.nombre}</strong>
                <p>{item.descripcion}</p>
                <p>Precio: ${item.precio}</p>
                <p>Stock: {item.stock}</p>
                {item.image_url && <img src={item.image_url} alt={item.nombre} />}
            </li>
        ))}
      </ul>

      <div className="button-container">
        <button
          className="button"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Ocultar Formulario" : "Crear Nuevo Mueble"}
        </button>
        <a href="/" className="button">Regresar al Inicio</a>
      </div>

      {showForm && (
        <form onSubmit={handleFormSubmit} className="form">
          <input
            type="text"
            name="nombre"
            placeholder="Nombre del mueble"
            required
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="descripcion"
            placeholder="Descripción"
            required
            onChange={handleInputChange}
          />
          <input
            type="number"
            name="precio"
            placeholder="Precio"
            required
            onChange={handleInputChange}
          />
          <input
            type="number"
            name="stock"
            placeholder="Stock"
            required
            onChange={handleInputChange}
          />
          <input
            type="file"
            name="foto"
            required
            onChange={handleInputChange}
          />
          <button type="submit">Crear Mueble</button>
        </form>
      )}
    </div>
  );
};

export default FurnitureList;
