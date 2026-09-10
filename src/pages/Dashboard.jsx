import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export function Dashboard({ nomeUsuario }) {
  const [filtroPeriodo, setFiltroPeriodo] = useState("hoje"); // 'hoje', 'ontem', '7dias', 'mes'
  const [metricas, setMetricas] = useState({
    ganhoTotal: 0,
    gorjetasTotal: 0,
    qtdCorridas: 0,
    kmTotal: 0,
    gastosTotal: 0,
    lucroLiquido: 0,
    ganhoPorKm: "0,00",
    ganhoPorCorrida: "0,00"
  });

  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarDados();
  }, [filtroPeriodo]);

  const pertenceAoPeriodo = (itemDataIso, itemDataFormatada) => {
    let dataObj = null;

    if (itemDataIso) {
      dataObj = new Date(itemDataIso);
    } else if (itemDataFormatada && typeof itemDataFormatada === "string") {
      const partes = itemDataFormatada.split("/");
      if (partes.length === 3) {
        dataObj = new Date(partes[2], partes[1] - 1, partes[0]);
      }
    }

    if (!dataObj || isNaN(dataObj.getTime())) return false;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const dataItem = new Date(dataObj);
    dataItem.setHours(0, 0, 0, 0);

    if (filtroPeriodo === "hoje") {
      return dataItem.getTime() === hoje.getTime();
    }

    if (filtroPeriodo === "ontem") {
      const ontem = new Date(hoje);
      ontem.setDate(hoje.getDate() - 1);
      return dataItem.getTime() === ontem.getTime();
    }

    if (filtroPeriodo === "7dias") {
      const limite7Dias = new Date(hoje);
      limite7Dias.setDate(hoje.getDate() - 6);
      return dataItem >= limite7Dias && dataItem <= hoje;
    }

    if (filtroPeriodo === "mes") {
      return (
        dataItem.getMonth() === hoje.getMonth() &&
        dataItem.getFullYear() === hoje.getFullYear()
      );
    }

    return false;
  };

  const carregarDados = async () => {
    setCarregando(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      // 1. Corridas
      const qCorridas = query(
        collection(db, "corridas"),
        where("userId", "==", user.uid)
      );
      const querySnapCorridas = await getDocs(qCorridas);

      let totalGanhos = 0;
      let totalGorjetas = 0;
      let totalCorridasCount = 0;
      let totalKm = 0;

      querySnapCorridas.forEach((docSnap) => {
        const item = docSnap.data();
        if (pertenceAoPeriodo(item.data, item.dataFormatada)) {
          totalGanhos += parseFloat(item.valorGanhos) || 0;
          totalGorjetas += parseFloat(item.gorjetas) || 0;
          totalCorridasCount += parseInt(item.qtdCorridas) || 1;
          totalKm += parseFloat(item.kmPercorrido) || 0;
        }
      });

      // 2. Gastos
      const qGastos = query(
        collection(db, "gastos"),
        where("userId", "==", user.uid)
      );
      const querySnapGastos = await getDocs(qGastos);

      let totalGastos = 0;
      querySnapGastos.forEach((docSnap) => {
        const item = docSnap.data();
        if (pertenceAoPeriodo(item.data, item.dataFormatada)) {
          totalGastos += parseFloat(item.valor) || 0;
        }
      });

      const faturamentoTotal = totalGanhos + totalGorjetas;
      const lucro = faturamentoTotal - totalGastos;
      const rPorKm =
        totalKm > 0
          ? (faturamentoTotal / totalKm).toFixed(2).replace(".", ",")
          : "0,00";
      const rPorCorrida =
        totalCorridasCount > 0
          ? (faturamentoTotal / totalCorridasCount).toFixed(2).replace(".", ",")
          : "0,00";

      setMetricas({
        ganhoTotal: faturamentoTotal,
        gorjetasTotal: totalGorjetas,
        qtdCorridas: totalCorridasCount,
        kmTotal: totalKm,
        gastosTotal: totalGastos,
        lucroLiquido: lucro,
        ganhoPorKm: rPorKm,
        ganhoPorCorrida: rPorCorrida
      });
    } catch (error) {
      console.error("Erro ao carregar Dashboard:", error);
    } finally {
      setCarregando(false);
    }
  };

  const getTextoLabelPeriodo = () => {
    switch (filtroPeriodo) {
      case "hoje":
        return "HOJE";
      case "ontem":
        return "ONTEM";
      case "7dias":
        return "ÚLTIMOS 7 DIAS";
      case "mes":
        return "ESTE MÊS";
      default:
        return "PERÍODO";
    }
  };

  return (
    <div style={styles.container}>
      {/* Saudações e Título */}
      <div style={styles.headerDashboard}>
        <div>
          <h2 style={styles.boasVindas}>Olá, {nomeUsuario || "Motoca"}! 👋</h2>
          <p style={styles.subtitulo}>Acompanhe o desempenho do seu negócio</p>
        </div>
        <button onClick={carregarDados} style={styles.btnAtualizar} title="Atualizar dados">
          🔄
        </button>
      </div>

      {/* Seletor de Período (Tabs) */}
      <div style={styles.tabsPeriodo}>
        <button
          onClick={() => setFiltroPeriodo("hoje")}
          style={filtroPeriodo === "hoje" ? styles.tabAtiva : styles.tabInativa}
        >
          Hoje
        </button>
        <button
          onClick={() => setFiltroPeriodo("ontem")}
          style={filtroPeriodo === "ontem" ? styles.tabAtiva : styles.tabInativa}
        >
          Ontem
        </button>
        <button
          onClick={() => setFiltroPeriodo("7dias")}
          style={filtroPeriodo === "7dias" ? styles.tabAtiva : styles.tabInativa}
        >
          7 Dias
        </button>
        <button
          onClick={() => setFiltroPeriodo("mes")}
          style={filtroPeriodo === "mes" ? styles.tabAtiva : styles.tabInativa}
        >
          Este Mês
        </button>
      </div>

      {carregando ? (
        <p style={styles.carregandoText}>Calculando métricas...</p>
      ) : (
        <>
          {/* Card Destaque: Lucro Líquido */}
          <div style={styles.cardLucro}>
            <span style={styles.labelLucro}>LUCRO LÍQUIDO ({getTextoLabelPeriodo()})</span>
            <span
              style={{
                ...styles.valorLucro,
                color: metricas.lucroLiquido < 0 ? "#EF4444" : "#25D366"
              }}
            >
              R$ {metricas.lucroLiquido.toFixed(2).replace(".", ",")}
            </span>
            <span style={styles.subLucro}>
              Faturamento: R$ {metricas.ganhoTotal.toFixed(2).replace(".", ",")} | Gastos: R$ {metricas.gastosTotal.toFixed(2).replace(".", ",")}
            </span>
          </div>

          {/* Grid de Cards de Operação */}
          <div style={styles.grid2}>
            <div style={styles.cardMetrica}>
              <span style={styles.iconMetrica}>📦</span>
              <span style={styles.labelMetrica}>Corridas Feitas</span>
              <span style={styles.valorMetrica}>{metricas.qtdCorridas}</span>
            </div>

            <div style={styles.cardMetrica}>
              <span style={styles.iconMetrica}>📍</span>
              <span style={styles.labelMetrica}>Km Rodados</span>
              <span style={styles.valorMetrica}>{metricas.kmTotal.toFixed(1)} Km</span>
            </div>

            <div style={styles.cardMetrica}>
              <span style={styles.iconMetrica}>💰</span>
              <span style={styles.labelMetrica}>R$ por Km</span>
              <span style={styles.valorMetrica}>R$ {metricas.ganhoPorKm}</span>
            </div>

            <div style={styles.cardMetrica}>
              <span style={styles.iconMetrica}>🏷️</span>
              <span style={styles.labelMetrica}>Média / Corrida</span>
              <span style={styles.valorMetrica}>R$ {metricas.ganhoPorCorrida}</span>
            </div>
          </div>

          {/* Detalhamento de Gorjetas */}
          {metricas.gorjetasTotal > 0 && (
            <div style={styles.cardGorjeta}>
              <span>🎁 Gorjetas no período:</span>
              <strong>+ R$ {metricas.gorjetasTotal.toFixed(2).replace(".", ",")}</strong>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  container: { padding: "16px", maxWidth: "480px", margin: "0 auto" },
  headerDashboard: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" },
  boasVindas: { fontSize: "18px", fontWeight: "bold", margin: "0 0 2px 0", color: "#111827" },
  subtitulo: { fontSize: "12px", color: "#6B7280", margin: 0 },
  btnAtualizar: { backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "50%", width: "36px", height: "36px", fontSize: "16px", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center" },
  tabsPeriodo: { display: "flex", backgroundColor: "#E5E7EB", padding: "4px", borderRadius: "8px", gap: "4px", marginBottom: "16px" },
  tabAtiva: { flex: 1, padding: "8px 0", backgroundColor: "#FFFFFF", color: "#111827", fontWeight: "bold", border: "none", borderRadius: "6px", fontSize: "12px", cursor: "pointer", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" },
  tabInativa: { flex: 1, padding: "8px 0", backgroundColor: "transparent", color: "#6B7280", fontWeight: "normal", border: "none", borderRadius: "6px", fontSize: "12px", cursor: "pointer" },
  carregandoText: { fontSize: "13px", color: "#6B7280", textAlign: "center", padding: "30px 0" },
  cardLucro: { backgroundColor: "#111827", color: "#FFFFFF", padding: "16px", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "4px", marginBottom: "16px" },
  labelLucro: { fontSize: "10px", color: "#FBBF24", fontWeight: "bold", letterSpacing: "0.5px" },
  valorLucro: { fontSize: "28px", fontWeight: "bold" },
  subLucro: { fontSize: "11px", color: "#9CA3AF", marginTop: "4px" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" },
  cardMetrica: { backgroundColor: "#FFFFFF", padding: "12px", borderRadius: "10px", border: "1px solid #E5E7EB", display: "flex", flexDirection: "column", gap: "2px" },
  iconMetrica: { fontSize: "16px", marginBottom: "2px" },
  labelMetrica: { fontSize: "11px", color: "#6B7280", fontWeight: "bold" },
  valorMetrica: { fontSize: "16px", fontWeight: "bold", color: "#111827" },
  cardGorjeta: { backgroundColor: "#DCFCE7", color: "#15803D", padding: "10px 12px", borderRadius: "8px", fontSize: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }
};