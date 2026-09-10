import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export function Configuracoes() {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [motoModelo, setMotoModelo] = useState("");
  const [motoPlaca, setMotoPlaca] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarPerfil();
  }, []);

  const carregarPerfil = async () => {
    setCarregando(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setNome(data.nome || user.displayName || "");
        setTelefone(data.telefone || "");
        setMotoModelo(data.motoModelo || "");
        setMotoPlaca(data.motoPlaca || "");
      } else {
        // Se o documento não existir, sugere o displayName caso exista
        setNome(user.displayName || "");
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
    } finally {
      setCarregando(false);
    }
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    setSalvando(true);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Usuário não autenticado.");

      const userRef = doc(db, "users", user.uid);

      // Usando setDoc com { merge: true } para criar o documento se não existir
      await setDoc(
        userRef,
        {
          nome: nome.trim(),
          email: user.email,
          telefone: telefone.trim(),
          motoModelo: motoModelo.trim(),
          motoPlaca: motoPlaca.trim().toUpperCase(),
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );

      alert("Configurações do perfil salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      alert("Erro ao salvar: " + error.message);
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <div style={styles.container}>
        <p style={styles.carregandoText}>Carregando configurações...</p>
      </div>
    );
  }

  const user = auth.currentUser;

  return (
    <div style={styles.container}>
      <h2 style={styles.titulo}>⚙️ Configurações do Perfil</h2>
      <p style={styles.subtitulo}>
        Mantenha seus dados pessoais e informações da moto atualizados.
      </p>

      <form onSubmit={handleSalvar} style={styles.formCard}>
        {/* E-mail (Apenas Leitura) */}
        <div style={styles.campoGroup}>
          <label style={styles.label}>E-mail da Conta:</label>
          <input
            type="email"
            value={user?.email || ""}
            disabled
            style={styles.inputDisabled}
          />
          <span style={styles.hint}>O e-mail não pode ser alterado por aqui.</span>
        </div>

        {/* Nome do Usuário */}
        <div style={styles.campoGroup}>
          <label style={styles.label}>Seu Nome Completo / Como quer ser chamado:</label>
          <input
            type="text"
            placeholder="Ex: Cleyton Monteiro"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            style={styles.input}
            required
          />
        </div>

        {/* Telefone / WhatsApp */}
        <div style={styles.campoGroup}>
          <label style={styles.label}>Telefone / WhatsApp:</label>
          <input
            type="tel"
            placeholder="(79) 99999-9999"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            style={styles.input}
          />
        </div>

        {/* Informações do Veículo */}
        <div style={styles.divisor}>INFORMAÇÕES DA MOTO</div>

        <div style={styles.grid2}>
          <div style={styles.campoGroup}>
            <label style={styles.label}>Modelo da Moto:</label>
            <input
              type="text"
              placeholder="Ex: Honda CG 160 Fan"
              value={motoModelo}
              onChange={(e) => setMotoModelo(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.campoGroup}>
            <label style={styles.label}>Placa da Moto:</label>
            <input
              type="text"
              placeholder="Ex: ABC1D23"
              value={motoPlaca}
              onChange={(e) => setMotoPlaca(e.target.value)}
              style={styles.input}
            />
          </div>
        </div>

        <button type="submit" disabled={salvando} style={styles.btnSalvar}>
          {salvando ? "Salvando..." : "💾 Salvar Configurações"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: { padding: "16px", maxWidth: "480px", margin: "0 auto" },
  titulo: { fontSize: "20px", fontWeight: "bold", margin: "0 0 4px 0" },
  subtitulo: { fontSize: "12px", color: "#666", margin: "0 0 16px 0", lineHeight: "1.4" },
  carregandoText: { fontSize: "13px", color: "#6B7280", textAlign: "center", padding: "30px 0" },
  formCard: { backgroundColor: "#FFFFFF", padding: "16px", borderRadius: "12px", border: "1px solid #E5E7EB", display: "flex", flexDirection: "column", gap: "12px" },
  campoGroup: { display: "flex", flexDirection: "column", gap: "4px" },
  label: { fontSize: "12px", fontWeight: "bold", color: "#374151" },
  input: { padding: "10px", borderRadius: "8px", border: "1px solid #D1D5DB", fontSize: "13px", width: "100%", boxSizing: "border-box" },
  inputDisabled: { padding: "10px", borderRadius: "8px", border: "1px solid #E5E7EB", backgroundColor: "#F3F4F6", color: "#6B7280", fontSize: "13px", width: "100%", boxSizing: "border-box", cursor: "not-allowed" },
  hint: { fontSize: "10px", color: "#9CA3AF" },
  divisor: { fontSize: "11px", fontWeight: "bold", color: "#6B7280", borderTop: "1px solid #E5E7EB", paddingTop: "12px", marginTop: "4px" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },
  btnSalvar: { backgroundColor: "#FFC107", color: "#000000", fontWeight: "bold", padding: "12px", borderRadius: "8px", border: "none", fontSize: "14px", cursor: "pointer", marginTop: "8px" }
};