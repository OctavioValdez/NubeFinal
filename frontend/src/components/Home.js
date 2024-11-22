import React from "react";

const Home = () => (
  <div className="home">
    <h1>Bienvenido a Casa Diana</h1>
    <p>Explora nuestra colección de muebles y conoce a nuestros clientes.</p>
    <div className="home-buttons">
      <a href="/furniture" className="button">Ver Muebles</a>
      <a href="/clients" className="button">Ver Clientes</a>
    </div>
  </div>
);

export default Home;
