import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig"; // Importar configuraciones de Firebase
import "../App.css"; // Archivo de estilos CSS

export default function Index() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = async () => {
    try {
      console.log("Iniciando sesión con:", email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Autenticación exitosa:", userCredential);
      const user = userCredential.user;

      // Obtener el rol del usuario desde Firestore
      const userDoc = doc(db, "users", email);
      console.log("Obteniendo documento del usuario:", email);
      const docSnap = await getDoc(userDoc);

      if (docSnap.exists()) {
        const role = docSnap.data().role;
        if (role === "admin") {
          console.log("Navegando a: /homeAdmin");
          window.location.href = "/homeAdmin";
        } else if (role === "chofer") {
          console.log("Navegando a: /homeChofer");
          window.location.href = "/homeChofer";
        } else {
          alert("Rol desconocido. El rol del usuario no está definido.");
        }
      } else {
        alert("Error: No se pudo encontrar el documento del usuario.");
      }
    } catch (error) {
      console.error("Error de inicio de sesión:", error.code, error.message);
      alert("Error de inicio de sesión: " + error.message);
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <h1 className="title">CASA DIANA</h1>
        <h2 className="subtitle">eventos</h2>
        <h3 className="form-title">Iniciar sesión</h3>
        <div className="input-container">
          <input
            type="email"
            placeholder="Usuario"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="password-container">
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="Contraseña"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              className="toggle-password"
              onClick={() => setPasswordVisible(!passwordVisible)}
            >
              {passwordVisible ? "Ocultar" : "Mostrar"}
            </button>
          </div>
          <button className="submit-button" onClick={handleSignIn}>
            Iniciar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
