import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export function Indique() {
  const [referralCode, setReferralCode] = useState("");
  const [indicacoesRealizadas, setIndicacoesRealizadas] = useState(0);
  const [isAssinante, setIsAssinante] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [copiado, setCopiado] = useState(false);

  // Limite de indicações bonificadas durante o teste grátis
  const LIMITE_TRIAL = 3;

  useEffect(() => {
    const carregarDados = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setReferralCode(data.referralCode || "GERENCIA10");
          setIndicacoesRealizadas(data.referralCount || 0);
          setIsAssinante(data.statusAssinatura === "ativa");
        }
      } catch (error) {
        console.error("Erro ao carregar dados de indicação:", error);
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, []);

  const textoCompartilhamento = `Fala rodante! 🏍️ Tô usando o app Gerencia Motoca pra controlar minhas corridas, gastos e ver se tô batendo a meta do dia. Usa meu código de indicação ${referralCode} pra testar grátis!`;

  const handleCopiarCodigo = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  };

  const handleCompartilharWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(textoCompartilhamento)}`;
    window.open(url, "_blank");
  };

  if (carregando) {
    return (
      <div style={styles.container}>
        <p>Carregando seu código...</p>
      </div>
    );
  }

  const atingiuLimiteTrial = !isAssinante && indicacoesRealizadas >= LIMITE_TRIAL;

  return (
    <div style={styles.container}>
      <h2 style={styles.titulo}>Indique e Ganhe</h2>
      <p style={styles.subtitulo}>
        Ajude o Gerencia Motoca a crescer na rodagem e ganhe dias extras de uso.
      </p>

      {/* Card de Progresso de Indicações */}
      <div style={styles.cardProgresso}>
        <div style={styles.progressoTopo}>
          <span style={styles.labelProgresso}>SUAS INDICAÇÕES CONVERTIDAS</span>
          <span style={styles.badgeStatus}>
            {isAssinante ? "Ilimitadas (Assinante 🚀)" : `Teste Grátis (${indicacoesRealizadas}/${LIMITE_TRIAL})`}
          </span>
        </div>

        <div style={styles.barraProgressoBg}>
          <div
            style={{
              ...styles.barraProgressoFill,
              width: isAssinante ? "100%" : `${Math.min(100, (indicacoesRealizadas / LIMITE_TRIAL) * 100)}%`
            }}
          ></div>
        </div>

        {!isAssinante && (
          <p style={styles.textoAjudaProgresso}>
            {atingiuLimiteTrial
              ? "Você atingiu o limite de bônus no teste grátis! Assine um plano para liberar indicações ilimitadas."
              : `Você ainda pode ganhar bônus em mais ${LIMITE_TRIAL - indicacoesRealizadas} indicação(ões) no teste grátis.`}
          </p>
        )}
      </div>

      {/* Card Principal */}
      <div style={styles.cardDestaque}>
        <div style={styles.badgeRegra}>🎁 BÔNUS DE INDICAÇÃO</div>
        <h3 style={styles.tituloCard}>Ganhe +15 dias a cada amigo</h3>
        <p style={styles.descricaoCard}>
          Para cada motoboy que criar conta com seu código e assinar um plano, você ganha 15 dias adicionais no seu tempo de uso!
        </p>

        <div style={styles.codigoContainer}>
          <span style={styles.labelCodigo}>SEU CÓDIGO ÚNICO:</span>
          <div style={styles.codigoBox}>
            <span style={styles.codigoTexto}>{referralCode}</span>
          </div>
        </div>

        <div style={styles.botoesAcao}>
          <button onClick={handleCopiarCodigo} style={styles.btnCopiar}>
            {copiado ? "✓ Código Copiado!" : "📋 Copiar Código"}
          </button>

          <button onClick={handleCompartilharWhatsApp} style={styles.btnWhatsApp}>
            💬 Compartilhar no WhatsApp
          </button>
        </div>
      </div>

      {/* Passos de Como Funciona */}
      <div style={styles.cardPassos}>
        <h4 style={styles.subtituloPassos}>Como funciona a viralização?</h4>
        <div style={styles.itemPasso}>
          <span style={styles.numeroPasso}>1</span>
          <span>Compartilhe o código nos grupos de WhatsApp de entregadores.</span>
        </div>
        <div style={styles.itemPasso}>
          <span style={styles.numeroPasso}>2</span>
          <span>Seu parceiro usa o código na criação da conta dele.</span>
        </div>
        <div style={styles.itemPasso}>
          <span style={styles.numeroPasso}>3</span>
          <span>Você ganha +15 dias estendidos na sua conta (somente após a assinatura do indicado)!</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "16px", maxWidth: "480px", margin: "0 auto" },
  titulo: { fontSize: "20px", fontWeight: "bold", margin: "0 0 4px 0" },
  subtitulo: { fontSize: "12px", color: "#666", margin: "0 0 16px 0" },
  cardProgresso: { backgroundColor: "#121212", color: "#FFFFFF", padding: "16px", borderRadius: "12px", marginBottom: "16px" },
  progressoTopo: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" },
  labelProgresso: { fontSize: "11px", fontWeight: "bold", color: "#9CA3AF" },
  badgeStatus: { backgroundColor: "#FFC107", color: "#000000", fontWeight: "bold", fontSize: "11px", padding: "3px 8px", borderRadius: "12px" },
  barraProgressoBg: { width: "100%", height: "8px", backgroundColor: "#374151", borderRadius: "4px", overflow: "hidden" },
  barraProgressoFill: { height: "100%", backgroundColor: "#25D366", transition: "width 0.3s ease" },
  textoAjudaProgresso: { margin: "10px 0 0 0", fontSize: "11px", color: "#D1D5DB" },
  cardDestaque: { backgroundColor: "#FFFFFF", padding: "20px", borderRadius: "12px", border: "1px solid #E5E7EB", textAlign: "center", display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" },
  badgeRegra: { backgroundColor: "#FEF3C7", color: "#B45309", fontWeight: "bold", fontSize: "11px", padding: "4px 8px", borderRadius: "20px", alignSelf: "center" },
  tituloCard: { fontSize: "18px", fontWeight: "bold", margin: 0, color: "#111827" },
  descricaoCard: { fontSize: "13px", color: "#4B5563", margin: 0, lineHeight: "1.4" },
  codigoContainer: { display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px" },
  labelCodigo: { fontSize: "11px", fontWeight: "bold", color: "#6B7280", letterSpacing: "1px" },
  codigoBox: { backgroundColor: "#F3F4F6", padding: "14px", borderRadius: "8px", border: "2px dashed #FFC107" },
  codigoTexto: { fontSize: "22px", fontWeight: "bold", color: "#111827", letterSpacing: "3px" },
  botoesAcao: { display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" },
  btnCopiar: { padding: "12px", borderRadius: "8px", border: "1px solid #D1D5DB", backgroundColor: "#FFFFFF", fontWeight: "bold", fontSize: "14px", cursor: "pointer" },
  btnWhatsApp: { padding: "12px", borderRadius: "8px", border: "none", backgroundColor: "#25D366", color: "#FFFFFF", fontWeight: "bold", fontSize: "14px", cursor: "pointer" },
  cardPassos: { backgroundColor: "#FFFFFF", padding: "16px", borderRadius: "12px", border: "1px solid #E5E7EB", display: "flex", flexDirection: "column", gap: "10px" },
  subtituloPassos: { fontSize: "14px", margin: "0 0 4px 0", color: "#111827" },
  itemPasso: { display: "flex", alignItems: "center", gap: "12px", fontSize: "13px", color: "#374151" },
  numeroPasso: { backgroundColor: "#FFC107", color: "#000000", fontWeight: "bold", width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", flexShrink: 0 }
};