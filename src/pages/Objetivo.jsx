import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";

export function Objetivo() {
  const [nome, setNome] = useState("");
  const [valorTotal, setValorTotal] = useState("");
  const [dataVencimento, setDataVencimento] = useState("");
  const [diasParaJuntar, setDiasParaJuntar] = useState("");
  const [observacao, setObservacao] = useState("");

  const [objetivos, setObjetivos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarObjetivos();
  }, []);

  const carregarObjetivos = async () => {
    setCarregando(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, "objetivos"),
        where("userId", "==", user.uid)
      );

      const querySnapshot = await getDocs(q);
      const lista = [];
      querySnapshot.forEach((docSnap) => {
        lista.push({ id: docSnap.id, ...docSnap.data() });
      });

      // Ordenar pelas datas de vencimento mais próximas
      lista.sort((a, b) => new Date(a.dataVencimento) - new Date(b.dataVencimento));
      setObjetivos(lista);
    } catch (error) {
      console.error("Erro ao carregar objetivos:", error);
    } finally {
      setCarregando(false);
    }
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    if (!nome || !valorTotal || !diasParaJuntar) {
      alert("Preencha o nome da conta, o valor e a quantidade de dias!");
      return;
    }

    setSalvando(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Usuário não logado");

      const vTotal = parseFloat(valorTotal) || 0;
      const qDias = parseInt(diasParaJuntar) || 1;
      const metaDiariaCalculada = vTotal / qDias;

      const novoObjetivo = {
        userId: user.uid,
        nome: nome,
        valorTotal: vTotal,
        dataVencimento: dataVencimento,
        diasParaJuntar: qDias,
        metaDiaria: metaDiariaCalculada,
        valorGuardado: 0,
        status: "em_andamento", // 'em_andamento', 'pago'
        observacao: observacao,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, "objetivos"), novoObjetivo);

      alert("Objetivo cadastrado com sucesso!");
      setNome("");
      setValorTotal("");
      setDataVencimento("");
      setDiasParaJuntar("");
      setObservacao("");

      carregarObjetivos();
    } catch (error) {
      alert("Erro ao salvar objetivo: " + error.message);
    } finally {
      setSalvando(false);
    }
  };

  const handleMarcarComoPago = async (id, statusAtual) => {
    try {
      const novoStatus = statusAtual === "pago" ? "em_andamento" : "pago";
      const docRef = doc(db, "objetivos", id);
      await updateDoc(docRef, { status: novoStatus });
      carregarObjetivos();
    } catch (error) {
      alert("Erro ao atualizar status: " + error.message);
    }
  };

  const handleExcluir = async (id) => {
    if (window.confirm("Deseja realmente excluir este objetivo?")) {
      try {
        await deleteDoc(doc(db, "objetivos", id));
        carregarObjetivos();
      } catch (error) {
        alert("Erro ao excluir: " + error.message);
      }
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.titulo}>🎯 Objetivos e Contas a Pagar</h2>
      <p style={styles.subtitulo}>
        Defina metas para juntar dinheiro e pagar suas contas sem sufoco.
      </p>

      {/* Formulário */}
      <form onSubmit={handleSalvar} style={styles.formCard}>
        <div style={styles.campoGroup}>
          <label style={styles.label}>Nome da Conta / Objetivo:</label>
          <input
            type="text"
            placeholder="Ex: Conta de Energia, IPVA, Troca de Óleo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            style={styles.input}
            required
          />
        </div>

        <div style={styles.grid2}>
          <div style={styles.campoGroup}>
            <label style={styles.label}>Valor Total (R$):</label>
            <input
              type="number"
              step="0.01"
              placeholder="Ex: 180,00"
              value={valorTotal}
              onChange={(e) => setValorTotal(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.campoGroup}>
            <label style={styles.label}>Data de Vencimento:</label>
            <input
              type="date"
              value={dataVencimento}
              onChange={(e) => setDataVencimento(e.target.value)}
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.campoGroup}>
          <label style={styles.label}>Em quantos dias quer juntar esse valor?</label>
          <input
            type="number"
            placeholder="Ex: 10"
            value={diasParaJuntar}
            onChange={(e) => setDiasParaJuntar(e.target.value)}
            style={styles.input}
            required
          />
        </div>

        {/* Simulação em tempo real */}
        {valorTotal && diasParaJuntar && parseInt(diasParaJuntar) > 0 && (
          <div style={styles.boxCalculoSimulado}>
            <span>⚡ Meta Diária Necessária:</span>
            <strong>
              R$ {(parseFloat(valorTotal) / parseInt(diasParaJuntar)).toFixed(2).replace(".", ",")} / dia
            </strong>
          </div>
        )}

        <div style={styles.campoGroup}>
          <label style={styles.label}>Anotação / Obs:</label>
          <input
            type="text"
            placeholder="Ex: Pagar pelo Pix do banco X"
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            style={styles.input}
          />
        </div>

        <button type="submit" disabled={salvando} style={styles.btnSalvar}>
          {salvando ? "Salvando..." : "🎯 Criar Novo Objetivo"}
        </button>
      </form>

      {/* Lista de Objetivos */}
      <div style={styles.secaoLista}>
        <h3 style={styles.subtituloLista}>Meus Objetivos Cadastrados</h3>

        {carregando ? (
          <p style={styles.carregandoText}>Buscando objetivos...</p>
        ) : objetivos.length === 0 ? (
          <p style={styles.vazioText}>Nenhum objetivo cadastrado ainda.</p>
        ) : (
          <div style={styles.listaCards}>
            {objetivos.map((item) => {
              const ehPago = item.status === "pago";
              const metaDiaria = Number(item.metaDiaria || 0);
              const total = Number(item.valorTotal || 0);

              return (
                <div
                  key={item.id}
                  style={{
                    ...styles.cardItem,
                    borderColor: ehPago ? "#86EFAC" : "#E5E7EB",
                    backgroundColor: ehPago ? "#F0FDF4" : "#FFFFFF"
                  }}
                >
                  <div style={styles.headerCard}>
                    <span style={styles.nomeCard}>{item.nome}</span>
                    <span
                      style={{
                        ...styles.badgeStatus,
                        backgroundColor: ehPago ? "#DCFCE7" : "#FEF3C7",
                        color: ehPago ? "#166534" : "#92400E"
                      }}
                    >
                      {ehPago ? "✅ Pago" : "⏳ Em Andamento"}
                    </span>
                  </div>

                  <div style={styles.bodyCard}>
                    <div style={styles.infoCol}>
                      <span style={styles.labelCol}>VALOR TOTAL</span>
                      <span style={styles.valorCol}>
                        R$ {total.toFixed(2).replace(".", ",")}
                      </span>
                    </div>

                    <div style={styles.infoColHighlight}>
                      <span style={styles.labelColHighlight}>META DIÁRIA ({item.diasParaJuntar} dias)</span>
                      <span style={styles.valorColHighlight}>
                        R$ {metaDiaria.toFixed(2).replace(".", ",")} / dia
                      </span>
                    </div>
                  </div>

                  {item.dataVencimento && (
                    <span style={styles.vencimentoText}>
                      📅 Vencimento: {new Date(item.dataVencimento + "T00:00:00").toLocaleDateString("pt-BR")}
                    </span>
                  )}

                  {item.observacao && (
                    <p style={styles.obsText}>📝 {item.observacao}</p>
                  )}

                  <div style={styles.acoesCard}>
                    <button
                      onClick={() => handleMarcarComoPago(item.id, item.status)}
                      style={{
                        ...styles.btnPago,
                        backgroundColor: ehPago ? "#E5E7EB" : "#25D366",
                        color: ehPago ? "#374151" : "#FFFFFF"
                      }}
                    >
                      {ehPago ? "Desmarcar Pago" : "✅ Marcar como Pago"}
                    </button>

                    <button
                      onClick={() => handleExcluir(item.id)}
                      style={styles.btnExcluir}
                    >
                      🗑️ Excluir
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "16px", maxWidth: "480px", margin: "0 auto" },
  titulo: { fontSize: "20px", fontWeight: "bold", margin: "0 0 4px 0" },
  subtitulo: { fontSize: "12px", color: "#666", margin: "0 0 16px 0", lineHeight: "1.4" },
  formCard: { backgroundColor: "#FFFFFF", padding: "16px", borderRadius: "12px", border: "1px solid #E5E7EB", display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" },
  campoGroup: { display: "flex", flexDirection: "column", gap: "4px" },
  label: { fontSize: "12px", fontWeight: "bold", color: "#374151" },
  input: { padding: "10px", borderRadius: "8px", border: "1px solid #D1D5DB", fontSize: "13px", width: "100%", boxSizing: "border-box" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },
  boxCalculoSimulado: { backgroundColor: "#FEF3C7", color: "#92400E", padding: "10px 12px", borderRadius: "8px", fontSize: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  btnSalvar: { backgroundColor: "#FFC107", color: "#000000", fontWeight: "bold", padding: "12px", borderRadius: "8px", border: "none", fontSize: "14px", cursor: "pointer", marginTop: "4px" },
  secaoLista: { display: "flex", flexDirection: "column", gap: "10px" },
  subtituloLista: { fontSize: "16px", fontWeight: "bold", margin: 0, color: "#111827" },
  carregandoText: { fontSize: "12px", color: "#6B7280" },
  vazioText: { fontSize: "12px", color: "#6B7280", textAlign: "center", padding: "16px 0" },
  listaCards: { display: "flex", flexDirection: "column", gap: "12px" },
  cardItem: { padding: "14px", borderRadius: "10px", border: "1px solid", display: "flex", flexDirection: "column", gap: "10px" },
  headerCard: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  nomeCard: { fontSize: "15px", fontWeight: "bold", color: "#111827" },
  badgeStatus: { fontSize: "11px", fontWeight: "bold", padding: "3px 8px", borderRadius: "12px" },
  bodyCard: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", backgroundColor: "#F9FAFB", padding: "10px", borderRadius: "8px" },
  infoCol: { display: "flex", flexDirection: "column" },
  labelCol: { fontSize: "10px", color: "#6B7280", fontWeight: "bold" },
  valorCol: { fontSize: "15px", fontWeight: "bold", color: "#111827" },
  infoColHighlight: { display: "flex", flexDirection: "column" },
  labelColHighlight: { fontSize: "10px", color: "#B45309", fontWeight: "bold" },
  valorColHighlight: { fontSize: "15px", fontWeight: "bold", color: "#D97706" },
  vencimentoText: { fontSize: "11px", color: "#4B5563", fontWeight: "bold" },
  obsText: { fontSize: "11px", color: "#6B7280", margin: 0, fontStyle: "italic" },
  acoesCard: { display: "flex", justifyContent: "space-between", gap: "8px", borderTop: "1px solid #F3F4F6", paddingTop: "10px" },
  btnPago: { border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: "bold", cursor: "pointer", flex: 1 },
  btnExcluir: { backgroundColor: "#FEE2E2", color: "#DC2626", border: "none", padding: "6px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }
};