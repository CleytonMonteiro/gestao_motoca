import React, { useState } from "react";
import { auth, db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";

export function Planos({ diasTrial }) {
  const [planoSelecionado, setPlanoSelecionado] = useState("mensal");
  const [processando, setProcessando] = useState(false);

  const handleSimularAssinatura = async () => {
    setProcessando(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Usuário não autenticado");

      const docRef = doc(db, "users", user.uid);
      
      await updateDoc(docRef, {
        statusAssinatura: "ativa",
        planoAtivo: planoSelecionado,
        dataAssinatura: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      alert(`Plano ${planoSelecionado.toUpperCase()} ativado com sucesso! Seja bem-vindo ao Gerencia Motoca Pro.`);
      window.location.reload();
    } catch (error) {
      console.error("Erro ao processar assinatura:", error);
      alert("Erro ao processar assinatura: " + error.message);
    } finally {
      setProcessando(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.titulo}>Planos & Assinatura</h2>
      <p style={styles.subtitulo}>
        {diasTrial > 0
          ? `Aproveite a oferta de lançamento enquanto testar seus ${diasTrial} dia(s) grátis!`
          : "Seu teste grátis de 15 dias acabou. Assine agora com valor promocional de lançamento!"}
      </p>

      {/* Banner Promocional de Lançamento */}
      <div style={styles.bannerPromocao}>
        <span style={styles.badgeBanner}>🔥 OFERTA DE LANÇAMENTO</span>
        <p style={styles.textoBanner}>Garanta o valor promocional antes do reajuste!</p>
      </div>

      {/* Selector de Planos */}
      <div style={styles.planosGrid}>
        {/* Plano Mensal */}
        <div
          onClick={() => setPlanoSelecionado("mensal")}
          style={{
            ...styles.cardPlano,
            borderColor: planoSelecionado === "mensal" ? "#FFC107" : "#E5E7EB",
            backgroundColor: planoSelecionado === "mensal" ? "#FFFBEB" : "#FFFFFF"
          }}
        >
          <div style={styles.headerPlano}>
            <span style={styles.nomePlano}>Plano Mensal (Promo)</span>
            <input
              type="radio"
              name="plano"
              checked={planoSelecionado === "mensal"}
              onChange={() => setPlanoSelecionado("mensal")}
            />
          </div>
          <div style={styles.precoContainer}>
            <span style={styles.moeda}>R$</span>
            <span style={styles.preco}>11</span>
            <span style={styles.centavos}>,50</span>
            <span style={styles.periodo}>/mês</span>
          </div>
          <p style={styles.descPlano}>Menos de R$ 0,39 por dia. Cancele quando quiser.</p>
        </div>

        {/* Plano Anual */}
        <div
          onClick={() => setPlanoSelecionado("anual")}
          style={{
            ...styles.cardPlano,
            borderColor: planoSelecionado === "anual" ? "#FFC107" : "#E5E7EB",
            backgroundColor: planoSelecionado === "anual" ? "#FFFBEB" : "#FFFFFF"
          }}
        >
          <span style={styles.badgeEconomia}>🚀 MAIOR ECONOMIA (-28%)</span>
          <div style={styles.headerPlano}>
            <span style={styles.nomePlano}>Plano Anual</span>
            <input
              type="radio"
              name="plano"
              checked={planoSelecionado === "anual"}
              onChange={() => setPlanoSelecionado("anual")}
            />
          </div>
          <div style={styles.precoContainer}>
            <span style={styles.moeda}>R$</span>
            <span style={styles.preco}>99</span>
            <span style={styles.centavos}>,00</span>
            <span style={styles.periodo}>/ano</span>
          </div>
          <p style={styles.descPlano}>Equivalente a apenas R$ 8,25/mês. Pagamento único via PIX.</p>
        </div>
      </div>

      {/* Recursos Incluídos */}
      <div style={styles.cardRecursos}>
        <h4 style={styles.tituloRecursos}>O que você garante no Gerencia Motoca Pro:</h4>
        <ul style={styles.listaRecursos}>
          <li>✓ Lançamento e histórico ilimitado de corridas e Km</li>
          <li>✓ Controle completo de gastos (Moto vs. Pessoal)</li>
          <li>✓ Dashboard inteligente com metas automáticas</li>
          <li>✓ Relatórios consolidados por período</li>
          <li>✓ Calculadora de taxas de cartão e repasses</li>
          <li>✓ Suporte prioritário via WhatsApp</li>
        </ul>
      </div>

      {/* Botão de Pagamento */}
      <button
        onClick={handleSimularAssinatura}
        disabled={processando}
        style={styles.btnAssinar}
      >
        {processando
          ? "Processando..."
          : `Garantir Oferta (${planoSelecionado === "anual" ? "R$ 99,00/ano" : "R$ 11,50/mês"})`}
      </button>

      <p style={styles.avisoSeguranca}>
        🔒 Pagamento 100% seguro via PIX ou Cartão de Crédito.
      </p>
    </div>
  );
}

const styles = {
  container: { padding: "16px", maxWidth: "480px", margin: "0 auto" },
  titulo: { fontSize: "20px", fontWeight: "bold", margin: "0 0 4px 0" },
  subtitulo: { fontSize: "12px", color: "#666", margin: "0 0 12px 0", lineHeight: "1.4" },
  bannerPromocao: { backgroundColor: "#FEF3C7", border: "1px solid #FDE68A", padding: "10px 12px", borderRadius: "8px", marginBottom: "16px", display: "flex", flexDirection: "column", gap: "2px" },
  badgeBanner: { color: "#B45309", fontSize: "10px", fontWeight: "bold", letterSpacing: "0.5px" },
  textoBanner: { color: "#92400E", fontSize: "12px", fontWeight: "bold", margin: 0 },
  planosGrid: { display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" },
  cardPlano: { padding: "16px", borderRadius: "12px", border: "2px solid #E5E7EB", cursor: "pointer", display: "flex", flexDirection: "column", gap: "6px" },
  badgeEconomia: { backgroundColor: "#D97706", color: "#FFFFFF", fontSize: "10px", fontWeight: "bold", padding: "3px 8px", borderRadius: "12px", alignSelf: "flex-start", marginBottom: "4px" },
  headerPlano: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  nomePlano: { fontSize: "16px", fontWeight: "bold", color: "#111827" },
  precoContainer: { display: "flex", alignItems: "baseline" },
  moeda: { fontSize: "14px", fontWeight: "bold", color: "#111827", marginRight: "2px" },
  preco: { fontSize: "28px", fontWeight: "bold", color: "#111827" },
  centavos: { fontSize: "16px", fontWeight: "bold", color: "#111827" },
  periodo: { fontSize: "12px", color: "#6B7280", marginLeft: "4px" },
  descPlano: { fontSize: "11px", color: "#6B7280", margin: 0 },
  cardRecursos: { backgroundColor: "#FFFFFF", padding: "16px", borderRadius: "12px", border: "1px solid #E5E7EB", marginBottom: "16px" },
  tituloRecursos: { fontSize: "13px", fontWeight: "bold", margin: "0 0 10px 0", color: "#111827" },
  listaRecursos: { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px", color: "#374151" },
  btnAssinar: { width: "100%", padding: "14px", borderRadius: "8px", border: "none", backgroundColor: "#FFC107", color: "#000000", fontWeight: "bold", fontSize: "15px", cursor: "pointer" },
  avisoSeguranca: { fontSize: "11px", color: "#9CA3AF", textAlign: "center", marginTop: "10px" }
};