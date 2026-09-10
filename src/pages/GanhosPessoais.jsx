import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  orderBy 
} from "firebase/firestore";

export function GanhosPessoais() {
  const [origem, setOrigem] = useState("Salário / Renda extra");
  const [categoria, setCategoria] = useState("");
  const [valor, setValor] = useState("");
  const [observacao, setObservacao] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [ganhosRecentes, setGanhosRecentes] = useState([]);

  const hojeStr = new Date().toISOString().split("T")[0];
  const [data, setData] = useState(hojeStr);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "ganhos_pessoais"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = [];
      snapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() });
      });
      setGanhosRecentes(lista);
    });

    return () => unsubscribe();
  }, []);

  const handleSalvar = async (e) => {
    e.preventDefault();
    if (!valor || parseFloat(valor) <= 0) {
      alert("Por favor, informe o valor.");
      return;
    }

    setCarregando(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Usuário não autenticado");

      await addDoc(collection(db, "ganhos_pessoais"), {
        userId: user.uid,
        origem,
        categoria: categoria || "Geral",
        valor: parseFloat(valor.replace(",", ".")),
        observacao,
        data,
        createdAt: new Date().toISOString()
      });

      alert("Ganho pessoal registrado!");
      setValor("");
      setCategoria("");
      setObservacao("");
    } catch (error) {
      console.error("Erro ao salvar ganho pessoal:", error);
      alert("Erro ao salvar: " + error.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.titulo}>Ganhos pessoais</h2>
      <p style={styles.subtitulo}>Salário, renda extra e tudo que entrou fora da moto — não entra no dashboard da moto.</p>

      <div style={styles.cardAviso}>
        🏠 Use esta aba para dinheiro pessoal. Corridas e gorjetas ficam em <strong>Corridas e Km</strong>.
      </div>

      <form onSubmit={handleSalvar} style={styles.form}>
        <label style={styles.label}>De onde veio esse dinheiro?</label>
        <div style={styles.gridOrigem}>
          {["Salário / Renda extra", "Outro"].map((o) => (
            <button
              type="button"
              key={o}
              onClick={() => setOrigem(o)}
              style={origem === o ? styles.btnOrigemAtivo : styles.btnOrigem}
            >
              {o}
            </button>
          ))}
        </div>

        <label style={styles.label}>Qual categoria pessoal?</label>
        <input
          type="text"
          placeholder="Ex: Freelance, Pensão..."
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          style={styles.input}
        />

        <label style={styles.label}>Valor</label>
        <input
          type="number"
          step="0.01"
          placeholder="R$ 0,00"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          required
          style={styles.input}
        />

        <label style={styles.label}>Data</label>
        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          style={styles.input}
        />

        <label style={styles.label}>Observação (opcional)</label>
        <input
          type="text"
          placeholder="Ex: salário do mês, freelance..."
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          style={styles.input}
        />

        <button type="submit" disabled={carregando} style={styles.btnSalvar}>
          {carregando ? "Registrando..." : "Registrar ganho pessoal"}
        </button>
      </form>

      <div style={styles.secaoRegistros}>
        <h3 style={styles.tituloSecao}>Ganhos pessoais recentes</h3>
        <div style={styles.listaRegistros}>
          {ganhosRecentes.length === 0 ? (
            <div style={styles.cardVazio}>Nenhum ganho pessoal registrado ainda.</div>
          ) : (
            ganhosRecentes.map((item) => (
              <div key={item.id} style={styles.cardRegistro}>
                <div style={styles.registroTopo}>
                  <span style={styles.tagCategoria}>{item.categoria}</span>
                  <span style={styles.valorGanho}>+ R$ {item.valor.toFixed(2).replace(".", ",")}</span>
                </div>
                <div style={styles.registroDetalhes}>
                  <span>{item.origem} {item.observacao ? `• ${item.observacao}` : ""}</span>
                  <span>{item.data}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "16px", maxWidth: "480px", margin: "0 auto" },
  titulo: { fontSize: "20px", fontWeight: "bold", margin: "0 0 4px 0" },
  subtitulo: { fontSize: "12px", color: "#666", margin: "0 0 16px 0" },
  cardAviso: { backgroundColor: "#F0F9FF", border: "1px solid #BAE6FD", padding: "12px", borderRadius: "8px", fontSize: "12px", color: "#0369A1", marginBottom: "20px" },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  label: { fontSize: "14px", fontWeight: "bold", marginTop: "8px" },
  gridOrigem: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" },
  btnOrigem: { padding: "12px", borderRadius: "8px", border: "1px solid #E5E7EB", backgroundColor: "#F9FAFB", fontSize: "13px", cursor: "pointer" },
  btnOrigemAtivo: { padding: "12px", borderRadius: "8px", border: "1px solid #0284C7", backgroundColor: "#E0F2FE", color: "#0369A1", fontWeight: "bold", fontSize: "13px", cursor: "pointer" },
  input: { padding: "12px", borderRadius: "8px", border: "1px solid #D1D5DB", fontSize: "15px" },
  btnSalvar: { padding: "14px", borderRadius: "8px", border: "none", backgroundColor: "#16A34A", color: "#FFFFFF", fontSize: "16px", fontWeight: "bold", cursor: "pointer", marginTop: "12px" },
  secaoRegistros: { marginTop: "32px" },
  tituloSecao: { fontSize: "14px", fontWeight: "bold", marginBottom: "12px" },
  cardVazio: { backgroundColor: "#FFFFFF", padding: "16px", borderRadius: "8px", textAlign: "center", color: "#6B7280", fontSize: "13px", border: "1px solid #E5E7EB" },
  listaRegistros: { display: "flex", flexDirection: "column", gap: "8px" },
  cardRegistro: { backgroundColor: "#FFFFFF", padding: "12px 16px", borderRadius: "8px", border: "1px solid #E5E7EB", display: "flex", flexDirection: "column", gap: "4px" },
  registroTopo: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  tagCategoria: { fontWeight: "bold", fontSize: "14px" },
  valorGanho: { color: "#16A34A", fontWeight: "bold", fontSize: "15px" },
  registroDetalhes: { display: "flex", justifyContent: "space-between", color: "#6B7280", fontSize: "12px" }
};