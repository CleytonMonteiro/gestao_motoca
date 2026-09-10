import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  updateDoc,
  doc
} from "firebase/firestore";

export function Corridas() {
  const [plataforma, setPlataforma] = useState("Uber");
  const [outraPlataforma, setOutraPlataforma] = useState("");
  const [valorGanhos, setValorGanhos] = useState("");
  const [qtdCorridas, setQtdCorridas] = useState("");
  const [kmInicial, setKmInicial] = useState("");
  const [kmFinal, setKmFinal] = useState("");
  const [gorjetas, setGorjetas] = useState("");
  const [observacao, setObservacao] = useState("");

  // Estado para controlar edição
  const [editandoId, setEditandoId] = useState(null);

  const [historico, setHistorico] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarCorridas();
  }, []);

  const carregarCorridas = async () => {
    setCarregando(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, "corridas"),
        where("userId", "==", user.uid)
      );

      const querySnapshot = await getDocs(q);
      const lista = [];
      querySnapshot.forEach((docSnap) => {
        lista.push({ id: docSnap.id, ...docSnap.data() });
      });

      // Ordena pelas datas mais recentes
      lista.sort((a, b) => new Date(b.data || 0) - new Date(a.data || 0));
      setHistorico(lista);
    } catch (error) {
      console.error("Erro ao carregar corridas:", error);
    } finally {
      setCarregando(false);
    }
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    if (!valorGanhos) {
      alert("Por favor, preencha o valor dos ganhos.");
      return;
    }

    setSalvando(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Usuário não logado");

      const kInicial = parseFloat(kmInicial) || 0;
      const kFinal = parseFloat(kmFinal) || 0;
      const kmPercorrido = kFinal > kInicial ? kFinal - kInicial : 0;

      const dadosCorrida = {
        userId: user.uid,
        plataforma: plataforma === "Outro" ? outraPlataforma || "Outro" : plataforma,
        valorGanhos: parseFloat(valorGanhos) || 0,
        qtdCorridas: parseInt(qtdCorridas) || 1,
        kmInicial: kInicial,
        kmFinal: kFinal,
        kmPercorrido: kmPercorrido,
        gorjetas: parseFloat(gorjetas) || 0,
        observacao: observacao
      };

      if (editandoId) {
        // Atualiza o documento existente
        const docRef = doc(db, "corridas", editandoId);
        await updateDoc(docRef, {
          ...dadosCorrida,
          updatedAt: new Date().toISOString()
        });
        alert("Lançamento atualizado com sucesso!");
      } else {
        // Cria um novo lançamento
        await addDoc(collection(db, "corridas"), {
          ...dadosCorrida,
          data: new Date().toISOString(),
          dataFormatada: new Date().toLocaleDateString("pt-BR")
        });
        alert("Lançamento de corrida registrado com sucesso!");
      }

      limparFormulario();
      carregarCorridas();
    } catch (error) {
      alert("Erro ao salvar: " + error.message);
    } finally {
      setSalvando(false);
    }
  };

  const handleEditar = (item) => {
    setEditandoId(item.id);

    const opcoesPadrao = ["Uber", "Bee", "iFood", "99Moto", "Rappi", "Lalamove", "Particular"];
    if (opcoesPadrao.includes(item.plataforma)) {
      setPlataforma(item.plataforma);
      setOutraPlataforma("");
    } else {
      setPlataforma("Outro");
      setOutraPlataforma(item.plataforma || "");
    }

    setValorGanhos(item.valorGanhos || "");
    setQtdCorridas(item.qtdCorridas || "");
    setKmInicial(item.kmInicial || "");
    setKmFinal(item.kmFinal || "");
    setGorjetas(item.gorjetas || "");
    setObservacao(item.observacao || "");

    // Rola a tela até o formulário no topo
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const limparFormulario = () => {
    setEditandoId(null);
    setPlataforma("Uber");
    setOutraPlataforma("");
    setValorGanhos("");
    setQtdCorridas("");
    setKmInicial("");
    setKmFinal("");
    setGorjetas("");
    setObservacao("");
  };

  const handleExcluir = async (id) => {
    if (window.confirm("Deseja realmente excluir este lançamento?")) {
      try {
        await deleteDoc(doc(db, "corridas", id));
        if (editandoId === id) {
          limparFormulario();
        }
        carregarCorridas();
      } catch (error) {
        alert("Erro ao excluir: " + error.message);
      }
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.titulo}>
        {editandoId ? "✏️ Editar Lançamento" : "🏍️ Registrar Corridas e Km"}
      </h2>
      <p style={styles.subtitulo}>
        Lance seus ganhos e o hodômetro da moto para acompanhar o rendimento por app.
      </p>

      <form onSubmit={handleSalvar} style={styles.formCard}>
        {editandoId && (
          <div style={styles.bannerEditando}>
            <span>Modo de edição ativo. Altere os campos e salve.</span>
            <button type="button" onClick={limparFormulario} style={styles.btnCancelarEdit}>
              Cancelar
            </button>
          </div>
        )}

        {/* Escolha do Aplicativo */}
        <div style={styles.campoGroup}>
          <label style={styles.label}>Plataforma / Aplicativo:</label>
          <select
            value={plataforma}
            onChange={(e) => setPlataforma(e.target.value)}
            style={styles.input}
          >
            <option value="Uber">Uber Moto / Flash</option>
            <option value="Bee">Bee Delivery</option>
            <option value="iFood">iFood</option>
            <option value="99Moto">99 Moto</option>
            <option value="Rappi">Rappi</option>
            <option value="Lalamove">Lalamove</option>
            <option value="Particular">Cliente Particular</option>
            <option value="Outro">Outra Plataforma...</option>
          </select>
        </div>

        {plataforma === "Outro" && (
          <div style={styles.campoGroup}>
            <label style={styles.label}>Nome do App/Empresa:</label>
            <input
              type="text"
              placeholder="Ex: Loggi, Entrega Direta"
              value={outraPlataforma}
              onChange={(e) => setOutraPlataforma(e.target.value)}
              style={styles.input}
            />
          </div>
        )}

        {/* Valor Faturado e Nº de Corridas */}
        <div style={styles.grid2}>
          <div style={styles.campoGroup}>
            <label style={styles.label}>Ganhos no App (R$):</label>
            <input
              type="number"
              step="0.01"
              placeholder="150,00"
              value={valorGanhos}
              onChange={(e) => setValorGanhos(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.campoGroup}>
            <label style={styles.label}>Nº de Corridas:</label>
            <input
              type="number"
              placeholder="Ex: 8"
              value={qtdCorridas}
              onChange={(e) => setQtdCorridas(e.target.value)}
              style={styles.input}
            />
          </div>
        </div>

        {/* Medição do Km da Moto */}
        <div style={styles.boxKm}>
          <span style={styles.tituloBoxKm}>📍 Hodômetro da Moto (Km do Turno):</span>
          <div style={styles.grid2}>
            <div style={styles.campoGroup}>
              <label style={styles.labelSub}>Km Inicial:</label>
              <input
                type="number"
                placeholder="Ex: 45200"
                value={kmInicial}
                onChange={(e) => setKmInicial(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.campoGroup}>
              <label style={styles.labelSub}>Km Final:</label>
              <input
                type="number"
                placeholder="Ex: 45310"
                value={kmFinal}
                onChange={(e) => setKmFinal(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>
          {kmInicial && kmFinal && parseFloat(kmFinal) > parseFloat(kmInicial) && (
            <p style={styles.resumoKm}>
              ⚡ Total rodado no turno: <strong>{(parseFloat(kmFinal) - parseFloat(kmInicial)).toFixed(1)} Km</strong>
            </p>
          )}
        </div>

        {/* Gorjetas e Observação */}
        <div style={styles.grid2}>
          <div style={styles.campoGroup}>
            <label style={styles.label}>Gorjetas (R$):</label>
            <input
              type="number"
              step="0.01"
              placeholder="10,00"
              value={gorjetas}
              onChange={(e) => setGorjetas(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.campoGroup}>
            <label style={styles.label}>Anotação/Obs:</label>
            <input
              type="text"
              placeholder="Ex: Chuva, turno noite"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              style={styles.input}
            />
          </div>
        </div>

        <button type="submit" disabled={salvando} style={styles.btnSalvar}>
          {salvando
            ? "Salvando..."
            : editandoId
            ? "💾 Salvar Alterações"
            : "💾 Salvar Lançamento"}
        </button>
      </form>

      {/* Histórico dos Lançamentos */}
      <div style={styles.secaoHistorico}>
        <h3 style={styles.subtituloHistorico}>Histórico de Corridas</h3>
        {carregando ? (
          <p style={styles.carregandoText}>Buscando lançamentos...</p>
        ) : historico.length === 0 ? (
          <p style={styles.vazioText}>Nenhuma corrida cadastrada ainda.</p>
        ) : (
          <div style={styles.listaHistorico}>
            {historico.map((item) => {
              const valorGanhosSeguro = Number(item.valorGanhos || 0);
              const gorjetasSeguro = Number(item.gorjetas || 0);

              return (
                <div key={item.id} style={styles.cardItem}>
                  <div style={styles.headerCardItem}>
                    <span style={styles.badgePlataforma}>{item.plataforma || "Outro"}</span>
                    <span style={styles.dataCardItem}>{item.dataFormatada || "-"}</span>
                  </div>

                  <div style={styles.bodyCardItem}>
                    <div>
                      <span style={styles.valorCardItem}>
                        R$ {valorGanhosSeguro.toFixed(2).replace(".", ",")}
                      </span>
                      {gorjetasSeguro > 0 && (
                        <span style={styles.gorjetaCardItem}>
                          {" "}(+ R$ {gorjetasSeguro.toFixed(2).replace(".", ",")} gorjeta)
                        </span>
                      )}
                    </div>

                    <div style={styles.detalhesCardItem}>
                      <span>📦 <strong>{item.qtdCorridas || 1}</strong> corridas</span>
                      {item.kmPercorrido > 0 && (
                        <span>📍 <strong>{item.kmPercorrido}</strong> Km rodados</span>
                      )}
                    </div>
                  </div>

                  {item.observacao && (
                    <p style={styles.obsCardItem}>📝 {item.observacao}</p>
                  )}

                  <div style={styles.acoesCardItem}>
                    <button
                      onClick={() => handleEditar(item)}
                      style={styles.btnEditar}
                    >
                      ✏️ Editar
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
  bannerEditando: { backgroundColor: "#FEF3C7", color: "#92400E", padding: "8px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: "bold", display: "flex", justifyContent: "space-between", alignItems: "center" },
  btnCancelarEdit: { backgroundColor: "#F3F4F6", border: "1px solid #D1D5DB", padding: "4px 8px", borderRadius: "4px", fontSize: "10px", cursor: "pointer" },
  campoGroup: { display: "flex", flexDirection: "column", gap: "4px" },
  label: { fontSize: "12px", fontWeight: "bold", color: "#374151" },
  labelSub: { fontSize: "11px", fontWeight: "bold", color: "#6B7280" },
  input: { padding: "10px", borderRadius: "8px", border: "1px solid #D1D5DB", fontSize: "13px", width: "100%", boxSizing: "border-box" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },
  boxKm: { backgroundColor: "#F9FAFB", padding: "12px", borderRadius: "8px", border: "1px dashed #D1D5DB", display: "flex", flexDirection: "column", gap: "8px" },
  tituloBoxKm: { fontSize: "12px", fontWeight: "bold", color: "#111827" },
  resumoKm: { fontSize: "12px", color: "#15803D", margin: "4px 0 0 0", textAlign: "right" },
  btnSalvar: { backgroundColor: "#FFC107", color: "#000000", fontWeight: "bold", padding: "12px", borderRadius: "8px", border: "none", fontSize: "14px", cursor: "pointer", marginTop: "4px" },
  secaoHistorico: { display: "flex", flexDirection: "column", gap: "10px" },
  subtituloHistorico: { fontSize: "16px", fontWeight: "bold", margin: 0, color: "#111827" },
  carregandoText: { fontSize: "12px", color: "#6B7280" },
  vazioText: { fontSize: "12px", color: "#6B7280", textAlign: "center", padding: "16px 0" },
  listaHistorico: { display: "flex", flexDirection: "column", gap: "10px" },
  cardItem: { backgroundColor: "#FFFFFF", padding: "12px", borderRadius: "10px", border: "1px solid #E5E7EB", display: "flex", flexDirection: "column", gap: "8px" },
  headerCardItem: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  badgePlataforma: { backgroundColor: "#FEF3C7", color: "#B45309", fontSize: "11px", fontWeight: "bold", padding: "3px 8px", borderRadius: "12px" },
  dataCardItem: { fontSize: "11px", color: "#9CA3AF" },
  bodyCardItem: { display: "flex", justifyContent: "space-between", alignItems: "baseline" },
  valorCardItem: { fontSize: "16px", fontWeight: "bold", color: "#111827" },
  gorjetaCardItem: { fontSize: "11px", color: "#16A34A", fontWeight: "bold" },
  detalhesCardItem: { display: "flex", flexDirection: "column", alignItems: "flex-end", fontSize: "11px", color: "#4B5563", gap: "2px" },
  obsCardItem: { fontSize: "11px", color: "#6B7280", margin: 0, fontStyle: "italic" },
  acoesCardItem: { display: "flex", justifyContent: "flex-end", gap: "8px", borderTop: "1px solid #F3F4F6", paddingTop: "8px" },
  btnEditar: { backgroundColor: "#E0F2FE", color: "#0369A1", border: "none", padding: "4px 10px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" },
  btnExcluir: { backgroundColor: "#FEE2E2", color: "#DC2626", border: "none", padding: "4px 10px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }
};