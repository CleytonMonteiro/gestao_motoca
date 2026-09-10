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

export function Gastos() {
  const [tipoGasto, setTipoGasto] = useState("combustivel");
  const [categoria, setCategoria] = useState("Moto / Trabalho");
  const [valor, setValor] = useState("");
  // Data em formato AAAA-MM-DD para o input HTML (padrão hoje)
  const [dataGasto, setDataGasto] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [observacao, setObservacao] = useState("");

  const [editandoId, setEditandoId] = useState(null);

  const [historico, setHistorico] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarGastos();
  }, []);

  const carregarGastos = async () => {
    setCarregando(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, "gastos"),
        where("userId", "==", user.uid)
      );

      const querySnapshot = await getDocs(q);
      const lista = [];
      querySnapshot.forEach((docSnap) => {
        lista.push({ id: docSnap.id, ...docSnap.data() });
      });

      // Ordenar pelas datas mais recentes do gasto
      lista.sort((a, b) => new Date(b.data || 0) - new Date(a.data || 0));
      setHistorico(lista);
    } catch (error) {
      console.error("Erro ao carregar gastos:", error);
    } finally {
      setCarregando(false);
    }
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    if (!valor) {
      alert("Por favor, preencha o valor do gasto.");
      return;
    }

    setSalvando(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Usuário não logado");

      // Monta objeto de data
      const [ano, mes, dia] = dataGasto.split("-");
      const dataObjeto = new Date(ano, mes - 1, dia, 12, 0, 0);

      const dadosGasto = {
        userId: user.uid,
        tipoGasto: tipoGasto,
        categoria: categoria,
        valor: parseFloat(valor) || 0,
        data: dataObjeto.toISOString(),
        dataFormatada: `${dia.padStart(2, "0")}/${mes.padStart(2, "0")}/${ano}`,
        observacao: observacao
      };

      if (editandoId) {
        const docRef = doc(db, "gastos", editandoId);
        await updateDoc(docRef, {
          ...dadosGasto,
          updatedAt: new Date().toISOString()
        });
        alert("Gasto atualizado com sucesso!");
      } else {
        await addDoc(collection(db, "gastos"), {
          ...dadosGasto,
          createdAt: new Date().toISOString()
        });
        alert("Gasto registrado com sucesso!");
      }

      limparFormulario();
      carregarGastos();
    } catch (error) {
      alert("Erro ao salvar: " + error.message);
    } finally {
      setSalvando(false);
    }
  };

  const handleEditar = (item) => {
    setEditandoId(item.id);
    setTipoGasto(item.tipoGasto || "combustivel");
    setCategoria(item.categoria || "Moto / Trabalho");
    setValor(item.valor || "");
    setObservacao(item.observacao || "");

    if (item.data) {
      const d = new Date(item.data);
      if (!isNaN(d.getTime())) {
        const ano = d.getFullYear();
        const mes = String(d.getMonth() + 1).padStart(2, "0");
        const dia = String(d.getDate()).padStart(2, "0");
        setDataGasto(`${ano}-${mes}-${dia}`);
      }
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const limparFormulario = () => {
    setEditandoId(null);
    setTipoGasto("combustivel");
    setCategoria("Moto / Trabalho");
    setValor("");
    setDataGasto(new Date().toISOString().split("T")[0]);
    setObservacao("");
  };

  const handleExcluir = async (id) => {
    if (window.confirm("Deseja realmente excluir este gasto?")) {
      try {
        await deleteDoc(doc(db, "gastos", id));
        if (editandoId === id) {
          limparFormulario();
        }
        carregarGastos();
      } catch (error) {
        alert("Erro ao excluir: " + error.message);
      }
    }
  };

  const formatarNomeTipo = (tipo) => {
    const mapa = {
      combustivel: "⛽ Combustível / Gasolina",
      manutencao: "🔧 Manutenção / Peças",
      alimentacao: "🍔 Alimentação na Rua",
      equipamentos: "🪖 Equipamento / Capa / Bag",
      impostos: "📄 IPVA / Licenciamento / Seguro",
      outros: "📦 Outros Gastos"
    };
    return mapa[tipo] || tipo;
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.titulo}>
        {editandoId ? "✏️ Editar Gasto" : "⇆ Gastos Gerais"}
      </h2>
      <p style={styles.subtitulo}>
        Registre seus custos operacionais da moto e despesas do dia a dia.
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

        {/* Tipo de Gasto e Data */}
        <div style={styles.grid2}>
          <div style={styles.campoGroup}>
            <label style={styles.label}>Data da Despesa:</label>
            <input
              type="date"
              value={dataGasto}
              onChange={(e) => setDataGasto(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.campoGroup}>
            <label style={styles.label}>Classificação:</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              style={styles.input}
            >
              <option value="Moto / Trabalho">🏍️ Moto / Trabalho</option>
              <option value="Pessoal">🏠 Pessoal / Casa</option>
            </select>
          </div>
        </div>

        <div style={styles.campoGroup}>
          <label style={styles.label}>Tipo de Despesa:</label>
          <select
            value={tipoGasto}
            onChange={(e) => setTipoGasto(e.target.value)}
            style={styles.input}
          >
            <option value="combustivel">⛽ Combustível / Gasolina</option>
            <option value="manutencao">🔧 Manutenção / Peças / Óleo</option>
            <option value="alimentacao">🍔 Alimentação na Rua</option>
            <option value="equipamentos">🪖 Equipamento / Capa / Bag</option>
            <option value="impostos">📄 IPVA / Licenciamento / Seguro</option>
            <option value="outros">📦 Outros Gastos</option>
          </select>
        </div>

        <div style={styles.campoGroup}>
          <label style={styles.label}>Valor (R$):</label>
          <input
            type="number"
            step="0.01"
            placeholder="35,00"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            style={styles.input}
            required
          />
        </div>

        {/* Observação */}
        <div style={styles.campoGroup}>
          <label style={styles.label}>Anotação/Obs:</label>
          <input
            type="text"
            placeholder="Ex: Troca de óleo 1000km, Almoço na rua"
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            style={styles.input}
          />
        </div>

        <button type="submit" disabled={salvando} style={styles.btnSalvar}>
          {salvando
            ? "Salvando..."
            : editandoId
            ? "💾 Salvar Alterações"
            : "💾 Salvar Gasto"}
        </button>
      </form>

      {/* Histórico dos Gastos */}
      <div style={styles.secaoHistorico}>
        <h3 style={styles.subtituloHistorico}>Histórico de Despesas</h3>
        {carregando ? (
          <p style={styles.carregandoText}>Buscando despesas...</p>
        ) : historico.length === 0 ? (
          <p style={styles.vazioText}>Nenhum gasto cadastrado ainda.</p>
        ) : (
          <div style={styles.listaHistorico}>
            {historico.map((item) => {
              const valorSeguro = Number(item.valor || 0);

              return (
                <div key={item.id} style={styles.cardItem}>
                  <div style={styles.headerCardItem}>
                    <span style={styles.badgeTipo}>
                      {formatarNomeTipo(item.tipoGasto)}
                    </span>
                    <span style={styles.dataCardItem}>
                      📅 {item.dataFormatada || "-"}
                    </span>
                  </div>

                  <div style={styles.bodyCardItem}>
                    <span style={styles.valorCardItem}>
                      R$ {valorSeguro.toFixed(2).replace(".", ",")}
                    </span>
                    <span style={styles.badgeCategoria}>
                      {item.categoria || "Moto / Trabalho"}
                    </span>
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
  input: { padding: "10px", borderRadius: "8px", border: "1px solid #D1D5DB", fontSize: "13px", width: "100%", boxSizing: "border-box" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },
  btnSalvar: { backgroundColor: "#FFC107", color: "#000000", fontWeight: "bold", padding: "12px", borderRadius: "8px", border: "none", fontSize: "14px", cursor: "pointer", marginTop: "4px" },
  secaoHistorico: { display: "flex", flexDirection: "column", gap: "10px" },
  subtituloHistorico: { fontSize: "16px", fontWeight: "bold", margin: 0, color: "#111827" },
  carregandoText: { fontSize: "12px", color: "#6B7280" },
  vazioText: { fontSize: "12px", color: "#6B7280", textAlign: "center", padding: "16px 0" },
  listaHistorico: { display: "flex", flexDirection: "column", gap: "10px" },
  cardItem: { backgroundColor: "#FFFFFF", padding: "12px", borderRadius: "10px", border: "1px solid #E5E7EB", display: "flex", flexDirection: "column", gap: "8px" },
  headerCardItem: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  badgeTipo: { backgroundColor: "#F3F4F6", color: "#374151", fontSize: "11px", fontWeight: "bold", padding: "3px 8px", borderRadius: "12px" },
  dataCardItem: { fontSize: "11px", color: "#6B7280", fontWeight: "bold" },
  bodyCardItem: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  valorCardItem: { fontSize: "16px", fontWeight: "bold", color: "#DC2626" },
  badgeCategoria: { fontSize: "11px", color: "#6B7280", backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB", padding: "2px 6px", borderRadius: "4px" },
  obsCardItem: { fontSize: "11px", color: "#6B7280", margin: 0, fontStyle: "italic" },
  acoesCardItem: { display: "flex", justifyContent: "flex-end", gap: "8px", borderTop: "1px solid #F3F4F6", paddingTop: "8px" },
  btnEditar: { backgroundColor: "#E0F2FE", color: "#0369A1", border: "none", padding: "4px 10px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" },
  btnExcluir: { backgroundColor: "#FEE2E2", color: "#DC2626", border: "none", padding: "4px 10px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }
};