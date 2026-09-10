import React, { useState } from "react";
import { auth, db } from "../firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export function Cadastro() {
  const [modoLogin, setModoLogin] = useState(false); // false = Cadastro, true = Login
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);

    try {
      if (modoLogin) {
        // --- MODO LOGIN: Usuário já cadastrado ---
        await signInWithEmailAndPassword(auth, email, senha);
      } else {
        // --- MODO CADASTRO: Novo usuário ---
        const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
        const user = userCredential.user;

        // Calcular os 15 dias de teste grátis
        const dataTrial = new Date();
        dataTrial.setDate(dataTrial.getDate() + 15);

        // Salvar perfil inicial no Firestore
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          nome: nome,
          email: user.email,
          telefone: "",
          modeloMoto: "",
          fotoPerfilUrl: "",
          metaMensal: 2500.00,
          kmPorLitroPadrao: 42,
          lembretesAtivos: false,
          trialEndsAt: dataTrial.toISOString(),
          referralCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
          createdAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Erro na autenticação:", error);
      if (error.code === "auth/invalid-credential" || error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        alert("E-mail ou senha incorretos.");
      } else if (error.code === "auth/email-already-in-use") {
        alert("Este e-mail já está cadastrado. Clique em 'Já tenho conta' para entrar.");
      } else {
        alert("Erro: " + error.message);
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.titulo}>
        {modoLogin ? "Entrar no Gerencia Motoca" : "Criar Conta - Gerencia Motoca"}
      </h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        {!modoLogin && (
          <input
            type="text"
            placeholder="Seu nome completo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            style={styles.input}
          />
        )}

        <input
          type="email"
          placeholder="Seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Sua senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          style={styles.input}
        />

        <button type="submit" disabled={carregando} style={styles.button}>
          {carregando
            ? "Aguarde..."
            : modoLogin
            ? "Entrar no App"
            : "Cadastrar"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => setModoLogin(!modoLogin)}
        style={styles.btnTrocarModo}
      >
        {modoLogin
          ? "Ainda não tem conta? Cadastre-se"
          : "Já tem uma conta? Entrar"}
      </button>
    </div>
  );
}

const styles = {
  container: { maxWidth: "400px", margin: "40px auto", padding: "20px", textAlign: "center" },
  titulo: { marginBottom: "20px", fontSize: "20px" },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  input: { padding: "12px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "16px" },
  button: { padding: "12px", borderRadius: "8px", border: "none", backgroundColor: "#FFC107", fontWeight: "bold", fontSize: "16px", cursor: "pointer", marginTop: "8px" },
  btnTrocarModo: { marginTop: "20px", background: "none", border: "none", color: "#0066CC", fontSize: "14px", cursor: "pointer", textDecoration: "underline" }
};