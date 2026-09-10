import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export function Relatorio() {
  const [periodo, setPeriodo] = useState("mes"); // "mes" ou "total"
  const [totalCorridasGanhos, setTotalCorridasGanhos] = useState(0);
  const [totalGastosMoto, setTotalGastosMoto] = useState(0);
  const [totalGanhosPessoais, setTotalGanhosPessoais] = useState(0);
  const [totalGastosPessoais, setTotalGastosPessoais] = useState(0);
  const [qtdCorridas, setQtdCorridas] = useState(0);
  const [totalKm, setTotalKm] = useState(0);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const agora = new Date();
    const mesAtual = agora.getMonth();
    const anoAtual = agora.getFullYear();

    // 1. Escutar Corridas
    const qCorridas = query(collection(db, "corridas"), where("userId", "==", user.uid));
    const unsubCorridas = onSnapshot(qCorridas, (snapshot) => {
      let g = 0, c = 0, km = 0;
      snapshot.forEach((doc) => {
        const item = doc.data();
        const d = new Date(item.data + "T00:00:00");
        if (periodo === "total" || (d.getMonth() === mesAtual && d.getFullYear() === anoAtual)) {
          g += item.valorGanho || 0;
          c += item.quantidadeCorridas || 0;
          km += item.kmRodado || 0;
        }
      });
      setTotalCorridasGanhos(g);
      setQtdCorridas(c);
      setTotalKm(km);
    });

    // 2. Escutar Gastos
    const qGastos = query(collection(db, "gastos"), where("userId", "==", user.uid));
    const unsubGastos = onSnapshot(qGastos, (snapshot) => {
      let gMoto = 0, gPess = 0;
      snapshot.forEach((doc) => {
        const item = doc.data();
        const d = new Date(item.data + "T00:00:00");
        if (periodo === "total" || (d.getMonth() === mesAtual && d.getFullYear() === anoAtual)) {
          if (item.tipo === "moto") gMoto += item.valor || 0;
          else gPess += item.valor || 0;
        }
      });
      setTotalGastosMoto(gMoto);
      setTotalGastosPessoais(gPess);
    });

    // 3. Escutar Ganhos Pessoais
    const qGanhosP = query(collection(db, "ganhos_pessoais"), where("userId", "==", user.uid));
    const unsubGanhosP = onSnapshot(qGanhosP, (snapshot) => {
      let gp = 0;
      snapshot.forEach((doc) => {
        const item = doc.data();
        const d = new Date(item.data + "T00:00:00");
        if (periodo === "total" || (d.getMonth() === mesAtual && d.getFullYear() === anoAtual)) {
          gp += item.valor || 0;
        }
      });
      setTotalGanhosPessoais(gp);
    });

    return () => {
      unsubCorridas();
      unsubGastos();
      unsubGanhosP();
    };
  }, [periodo]);

  const lucroMoto = totalCorridasGanhos - totalGastosMoto;
  const saldoFinalTotal = (totalCorridasGanhos + totalGanhosPessoais) - (totalGastosMoto + totalGastosPessoais);

  return (
    <div style={styles.container}>
      <h2 style={styles.titulo}>Relatório Geral</h2>
      <p style={styles.subtitulo}>Resumo consolidado do seu desempenho financeiro.</p>

      <div style={styles.filtroContainer}>
        <button
          onClick={() => setPeriodo("mes")}
          style={periodo === "mes" ? styles.btnFiltroAtivo : styles.btnFiltro}
        >
          Este Mês
        </button>
        <button
          onClick={() => setPeriodo("total")}
          style={periodo === "total" ? styles.btnFiltroAtivo : styles.btnFiltro}
        >
          Todo o Período
        </button>
      </div>

      {/* Resumo da Moto */}
      <div style={styles.cardSecao}>
        <h3 style={styles.tituloCard}>🏍️ Operação da Moto</h3>
        <div style={styles.linhaResumo}>
          <span>Faturamento de Corridas:</span>
          <strong style={{ color: "#16A34A" }}>R$ {totalCorridasGanhos.toFixed(2).replace(".", ",")}</strong>
        </div>
        <div style={styles.linhaResumo}>
          <span>Despesas da Moto:</span>
          <strong style={{ color: "#DC2626" }}>- R$ {totalGastosMoto.toFixed(2).replace(".", ",")}</strong>
        </div>
        <div style={styles.divisorLine}></div>
        <div style={styles.linhaResumoDestaque}>
          <span>Lucro Líquido da Moto:</span>
          <strong style={{ color: lucroMoto >= 0 ? "#16A34A" : "#DC2626" }}>
            R$ {lucroMoto.toFixed(2).replace(".", ",")}
          </strong>
        </div>
        <div style={styles.detalhesOperacao}>
          <span>Total de Corridas: {qtdCorridas}</span>
          <span>Km Rodados: {totalKm} km</span>
        </div>
      </div>

      {/* Resumo Pessoal */}
      <div style={styles.cardSecao}>
        <h3 style={styles.tituloCard}>🏠 Finanças Pessoais</h3>
        <div style={styles.linhaResumo}>
          <span>Ganhos Pessoais / Outros:</span>
          <strong style={{ color: "#16A34A" }}>R$ {totalGanhosPessoais.toFixed(2).replace(".", ",")}</strong>
        </div>
        <div style={styles.linhaResumo}>
          <span>Gastos Pessoais / Casa:</span>
          <strong style={{ color: "#DC2626" }}>- R$ {totalGastosPessoais.toFixed(2).replace(".", ",")}</strong>
        </div>
      </div>

      {/* Saldo Final Consolidado */}
      <div style={styles.cardBalanzo}>
        <span style={styles.balanzoLabel}>BALANÇO FINAL (MOTO + PESSOAL)</span>
        <span style={{ ...styles.balanzoValor, color: saldoFinalTotal >= 0 ? "#16A34A" : "#DC2626" }}>
          R$ {saldoFinalTotal.toFixed(2).replace(".", ",")}
        </span>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "16px", maxWidth: "480px", margin: "0 auto" },
  titulo: { fontSize: "20px", fontWeight: "bold", margin: "0 0 4px 0" },
  subtitulo: { fontSize: "12px", color: "#666", margin: "0 0 16px 0" },
  filtroContainer: { display: "flex", gap: "8px", marginBottom: "16px" },
  btnFiltro: { flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF", fontSize: "13px", cursor: "pointer" },
  btnFiltroAtivo: { flex: 1, padding: "10px", borderRadius: "8px", border: "none", backgroundColor: "#121212", color: "#FFFFFF", fontWeight: "bold", fontSize: "13px", cursor: "pointer" },
  cardSecao: { backgroundColor: "#FFFFFF", padding: "16px", borderRadius: "12px", border: "1px solid #E5E7EB", marginBottom: "16px", display: "flex", flexDirection: "column", gap: "8px" },
  tituloCard: { fontSize: "15px", margin: "0 0 8px 0" },
  linhaResumo: { display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#374151" },
  divisorLine: { height: "1px", backgroundColor: "#F3F4F6", margin: "4px 0" },
  linhaResumoDestaque: { display: "flex", justifyContent: "space-between", fontSize: "15px", fontWeight: "bold" },
  detalhesOperacao: { display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#6B7280", marginTop: "8px", paddingTop: "8px", borderTop: "1px dashed #E5E7EB" },
  cardBalanzo: { backgroundColor: "#121212", color: "#FFFFFF", padding: "20px", borderRadius: "12px", textAlign: "center", display: "flex", flexDirection: "column", gap: "6px" },
  balanzoLabel: { fontSize: "11px", fontWeight: "bold", color: "#9CA3AF" },
  balanzoValor: { fontSize: "28px", fontWeight: "bold" }
};