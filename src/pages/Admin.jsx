import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

export function Admin() {
  const [usuarios, setUsuarios] = useState([]);
  const [metricas, setMetricas] = useState({
    totalUsuarios: 0,
    usuariosTrial: 0,
    usuariosAtivos: 0,
    mrr: 0,
    conversao: "0%"
  });
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [processandoId, setProcessandoId] = useState(null);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setCarregando(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const lista = [];
      let total = 0;
      let trial = 0;
      let ativos = 0;
      let receitaMensal = 0;

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const userObj = { id: docSnap.id, ...data };
        lista.push(userObj);

        total++;
        if (data.statusAssinatura === "ativa") {
          ativos++;
          receitaMensal += data.planoAtivo === "anual" ? 99 / 12 : 11.5;
        } else {
          trial++;
        }
      });

      setUsuarios(lista);
      setMetricas({
        totalUsuarios: total,
        usuariosTrial: trial,
        usuariosAtivos: ativos,
        mrr: receitaMensal,
        conversao: total > 0 ? ((ativos / total) * 100).toFixed(1) + "%" : "0%"
      });
    } catch (error) {
      console.error("Erro ao carregar dados de admin:", error);
      alert("Erro ao carregar lista de usuários: " + error.message);
    } finally {
      setCarregando(false);
    }
  };

  const handleAlterarStatus = async (userId, novoStatus) => {
    setProcessandoId(userId);
    try {
      const docRef = doc(db, "users", userId);
      await updateDoc(docRef, {
        statusAssinatura: novoStatus,
        updatedAt: new Date().toISOString()
      });
      alert(`Status atualizado com sucesso para: ${novoStatus.toUpperCase()}`);
      await carregarDados();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      alert("Erro ao atualizar usuário: " + error.message);
    } finally {
      setProcessandoId(null);
    }
  };

  // Filtragem flexível de busca
  const usuariosFiltrados = usuarios.filter((u) => {
    if (!busca.trim()) return true;
    const termo = busca.toLowerCase().trim();
    
    const nome = (u.nome || "").toLowerCase();
    const email = (u.email || "").toLowerCase();
    const referralCode = (u.referralCode || "").toLowerCase();
    const id = (u.id || "").toLowerCase();
    const status = (u.statusAssinatura || "").toLowerCase();

    return (
      nome.includes(termo) ||
      email.includes(termo) ||
      referralCode.includes(termo) ||
      id.includes(termo) ||
      status.includes(termo)
    );
  });

  if (carregando) {
    return (
      <div style={styles.container}>
        <p>Carregando usuários da plataforma...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.headerBox}>
        <h2 style={styles.titulo}>🛡️ Painel do CEO / Admin</h2>
        <button onClick={carregarDados} style={styles.btnAtualizar}>
          🔄 Atualizar
        </button>
      </div>

      {/* Grid de Métricas Executivas */}
      <div style={styles.gridMetricas}>
        <div style={styles.cardMetrica}>
          <span style={styles.labelMetrica}>MRR (Receita Mensal)</span>
          <span style={styles.valorDestaque}>
            R$ {metricas.mrr.toFixed(2).replace(".", ",")}
          </span>
        </div>

        <div style={styles.cardMetrica}>
          <span style={styles.labelMetrica}>Conversão</span>
          <span style={{ ...styles.valorDestaque, color: "#16A34A" }}>
            {metricas.conversao}
          </span>
        </div>

        <div style={styles.cardMetrica}>
          <span style={styles.labelMetrica}>Total Cadastrados</span>
          <span style={styles.valorMetrica}>{metricas.totalUsuarios}</span>
        </div>

        <div style={styles.cardMetrica}>
          <span style={styles.labelMetrica}>Assinantes Ativos</span>
          <span style={{ ...styles.valorMetrica, color: "#25D366" }}>
            {metricas.usuariosAtivos}
          </span>
        </div>

        <div style={styles.cardMetrica}>
          <span style={styles.labelMetrica}>Em Teste (Trial)</span>
          <span style={{ ...styles.valorMetrica, color: "#D97706" }}>
            {metricas.usuariosTrial}
          </span>
        </div>
      </div>

      {/* Gestão de Usuários */}
      <div style={styles.secaoUsuarios}>
        <h3 style={styles.subtituloSecao}>
          Gestão de Usuários ({usuariosFiltrados.length} encontrados)
        </h3>

        <input
          type="text"
          placeholder="Buscar por e-mail, nome, código ou ID..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={styles.inputBusca}
        />

        {usuariosFiltrados.length === 0 ? (
          <p style={styles.textoVazio}>Nenhum usuário encontrado para essa busca.</p>
        ) : (
          <div style={styles.listaUsuarios}>
            {usuariosFiltrados.map((u) => {
              const isAtivo = u.statusAssinatura === "ativa";
              const isProcessando = processandoId === u.id;

              return (
                <div key={u.id} style={styles.cardUsuario}>
                  <div style={styles.infoUsuario}>
                    <span style={styles.nomeUsuario}>
                      {u.nome ? u.nome : (u.email ? u.email.split("@")[0] : "Usuário sem nome")}
                    </span>
                    <span style={styles.emailUsuario}>{u.email || `ID: ${u.id}`}</span>
                    <span style={styles.subInfo}>
                      Cód. Indicação: <strong>{u.referralCode || "N/A"}</strong> | Indicações: <strong>{u.referralCount || 0}</strong>
                    </span>
                  </div>

                  <div style={styles.acoesUsuario}>
                    <span
                      style={{
                        ...styles.badgeStatus,
                        backgroundColor: isAtivo ? "#DCFCE7" : "#FEF3C7",
                        color: isAtivo ? "#15803D" : "#B45309"
                      }}
                    >
                      {isAtivo ? "Assinante Ativo" : "Trial / Teste"}
                    </span>

                    <button
                      onClick={() => handleAlterarStatus(u.id, isAtivo ? "trial" : "ativa")}
                      disabled={isProcessando}
                      style={isAtivo ? styles.btnBloquear : styles.btnAprovar}
                    >
                      {isProcessando
                        ? "Salvando..."
                        : isAtivo
                        ? "Suspender"
                        : "Ativar Assinatura"}
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
  headerBox: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
  titulo: { fontSize: "18px", fontWeight: "bold", margin: 0 },
  btnAtualizar: { backgroundColor: "#F3F4F6", border: "1px solid #D1D5DB", padding: "6px 10px", borderRadius: "6px", fontSize: "12px", cursor: "pointer" },
  gridMetricas: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" },
  cardMetrica: { backgroundColor: "#FFFFFF", padding: "12px", borderRadius: "10px", border: "1px solid #E5E7EB", display: "flex", flexDirection: "column", gap: "4px" },
  labelMetrica: { fontSize: "11px", color: "#6B7280", fontWeight: "bold" },
  valorDestaque: { fontSize: "18px", fontWeight: "bold", color: "#111827" },
  valorMetrica: { fontSize: "16px", fontWeight: "bold", color: "#374151" },
  secaoUsuarios: { display: "flex", flexDirection: "column", gap: "10px" },
  subtituloSecao: { fontSize: "15px", fontWeight: "bold", margin: 0, color: "#111827" },
  inputBusca: { padding: "10px 12px", borderRadius: "8px", border: "1px solid #D1D5DB", fontSize: "13px", width: "100%", boxSizing: "border-box" },
  textoVazio: { fontSize: "13px", color: "#6B7280", textAlign: "center", padding: "16px 0" },
  listaUsuarios: { display: "flex", flexDirection: "column", gap: "10px" },
  cardUsuario: { backgroundColor: "#FFFFFF", padding: "12px", borderRadius: "10px", border: "1px solid #E5E7EB", display: "flex", flexDirection: "column", gap: "10px" },
  infoUsuario: { display: "flex", flexDirection: "column", gap: "2px" },
  nomeUsuario: { fontSize: "14px", fontWeight: "bold", color: "#111827" },
  emailUsuario: { fontSize: "12px", color: "#6B7280" },
  subInfo: { fontSize: "11px", color: "#4B5563", marginTop: "2px" },
  acoesUsuario: { display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #F3F4F6", paddingTop: "8px" },
  badgeStatus: { fontSize: "11px", fontWeight: "bold", padding: "3px 8px", borderRadius: "12px" },
  btnAprovar: { backgroundColor: "#25D366", color: "#FFFFFF", border: "none", padding: "8px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" },
  btnBloquear: { backgroundColor: "#EF4444", color: "#FFFFFF", border: "none", padding: "8px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }
};