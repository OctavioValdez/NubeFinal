import React, { useState, useEffect } from "react";
import axios from "axios";

const backendURL = process.env.REACT_APP_BACKEND_URL;

const QuotationForm = () => {
  const [clients, setClients] = useState([]);
  const [furniture, setFurniture] = useState([]);
  const [quotationData, setQuotationData] = useState({
    clientId: "",
    furniture: [],
    deliveryDate: "",
    deliveryTime: "",
    pickupDate: "",
    pickupTime: "",
    freightCost: "",
    advance: "",
    warranty: "",
  });

  useEffect(() => {
    fetchClients();
    fetchFurniture();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await axios.get(`${backendURL}/clientes`);
      setClients(response.data.data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const fetchFurniture = async () => {
    try {
      const response = await axios.get(`${backendURL}/muebles`);
      const furnitureWithQuantity = response.data.data.map((item) => ({
        ...item,
        quantity: 1, // Por defecto, cantidad inicial es 1
      }));
      setFurniture(furnitureWithQuantity);
    } catch (error) {
      console.error("Error fetching furniture:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuotationData({ ...quotationData, [name]: value });
  };

  const handleFurnitureSelection = (e, item) => {
    const selected = e.target.checked;
    setQuotationData((prev) => {
      const updatedFurniture = selected
        ? [...prev.furniture, { ...item }]
        : prev.furniture.filter((f) => f.id !== item.id);
      return { ...prev, furniture: updatedFurniture };
    });
  };

  const handleQuantityChange = (e, item) => {
    const quantity = parseInt(e.target.value) || 1;
    setQuotationData((prev) => {
      const updatedFurniture = prev.furniture.map((f) =>
        f.id === item.id ? { ...f, quantity } : f
      );
      return { ...prev, furniture: updatedFurniture };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${backendURL}/send-quotation`, quotationData);
      if (response.data.success) {
        alert("Cotización enviada con éxito");
        setQuotationData({
          clientId: "",
          furniture: [],
          deliveryDate: "",
          deliveryTime: "",
          pickupDate: "",
          pickupTime: "",
          freightCost: "",
          advance: "",
          warranty: "",
        });
      } else {
        alert("Error al enviar la cotización");
      }
    } catch (error) {
      console.error("Error sending quotation:", error);
    }
  };

  const handleFurnitureItemClick = (e, item) => {
  // Verifica que el clic sea en el contenedor principal del item
  if (e.currentTarget !== e.target && e.target.tagName !== "DIV") return;

  setQuotationData((prev) => {
    const isSelected = prev.furniture.some((f) => f.id === item.id);
    const updatedFurniture = isSelected
      ? prev.furniture.filter((f) => f.id !== item.id) // Deseleccionar
      : [...prev.furniture, { ...item, quantity: 1 }]; // Seleccionar con cantidad por defecto
    return { ...prev, furniture: updatedFurniture };
  });
};

  

  return (
    <div className="form-page-quotation">
      <h2>Crear Cotización</h2>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Cliente:
          <select
            name="clientId"
            value={quotationData.clientId}
            onChange={handleInputChange}
            required
          >
            <option value="">Seleccione un cliente</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.nombre}
              </option>
            ))}
          </select>
        </label>

        <label>
          Muebles:
          <div className="furniture-selection">
            {furniture.map((item) => (
              <div
                key={item.id}
                className={`furniture-item ${
                  quotationData.furniture.some((f) => f.id === item.id) ? "selected" : ""
                }`}
                onClick={(e) => handleFurnitureItemClick(e, item)}
              >
                <input
                  type="checkbox" className="check"
                  id={`furniture-${item.id}`}
                  checked={quotationData.furniture.some((f) => f.id === item.id)}
                  readOnly
                />
                <label htmlFor={`furniture-${item.id}`}>
                  <span>{item.nombre} - ${item.precio}</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={
                    quotationData.furniture.find((f) => f.id === item.id)?.quantity || 1
                  }
                  onClick={(e) => e.stopPropagation()} // Prevenir propagación
                  onChange={(e) => handleQuantityChange(e, item)}
                  disabled={
                    !quotationData.furniture.some((f) => f.id === item.id)
                  }
                  className="quantity-input"
                />
              </div>
            ))}
          </div>
        </label>


        <label>
          Fecha de Entrega:
          <input
            type="date"
            name="deliveryDate"
            value={quotationData.deliveryDate}
            onChange={handleInputChange}
            required
          />
        </label>

        <label>
          Hora de Entrega:
          <input
            type="time"
            name="deliveryTime"
            value={quotationData.deliveryTime}
            onChange={handleInputChange}
            required
          />
        </label>

        <label>
          Fecha de Recolección:
          <input
            type="date"
            name="pickupDate"
            value={quotationData.pickupDate}
            onChange={handleInputChange}
          />
        </label>

        <label>
          Hora de Recolección:
          <input
            type="time"
            name="pickupTime"
            value={quotationData.pickupTime}
            onChange={handleInputChange}
          />
        </label>

        <label>
          Importe Flete:
          <input
            type="number"
            name="freightCost"
            value={quotationData.freightCost}
            onChange={handleInputChange}
            required
          />
        </label>

        <label>
          Anticipo:
          <input
            type="number"
            name="advance"
            value={quotationData.advance}
            onChange={handleInputChange}
            required
          />
        </label>

        <label>
          Garantía:
          <input
            type="number"
            name="warranty"
            value={quotationData.warranty}
            onChange={handleInputChange}
          />
        </label>

        <button type="submit" className="button">
          Enviar Cotización
        </button>
      </form>
    </div>
  );
};

export default QuotationForm;
