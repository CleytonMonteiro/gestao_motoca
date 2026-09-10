import React, { useState } from "react";

export function Ajuda() {
  const [duvidaAberta, setDuvidaAberta] = useState(null);

  const faqs = [
    {
      id: 1,
      pergunta: "Como funciona o teste grátis de 15 dias?",
      resposta: "Assim que você cria sua conta, ganha 15 dias para usar todas as funcionalidades do Gerencia Motoca sem pagar nada e sem precisar cadastrar cartão de crédito."
    },
    {
      id: 2,
      pergunta: "Como o aplicativo calcula o meu lucro no Dashboard?",
      resposta: "O lucro é calculado subtraindo todos os seus gastos registrados na operação da moto (combustível, manutenção, alimentação na rua, etc.) do total bruto faturado nas suas corridas do dia."
    },
    {
      id: 3,
      pergunta: "Como funciona o código de indicação?",
      resposta: "Você compartilha seu código único com outros entregadores. Quando um parceiro indicado criar uma conta e assinar um plano, você ganha +15 dias estendidos de uso no seu plano!"
    },
    {
      id: 4,
      pergunta: "Posso lançar meus ganhos de fora da moto?",
      resposta: "Sim! Na aba 'Ganhos Pessoais', você pode registrar salários, bicos ou renda extra sem alterar ou misturar com as métricas financeiras da operação da moto."
    },
    {
      id: 5,
      pergunta: "Meus dados ficam salvos se eu trocar de celular?",
      resposta: "Sim. Todos os seus dados ficam salvos na nuvem no seu perfil do Firebase. Basta entrar com seu e-mail e senha no novo celular para acessar tudo."
    }
  ];

  const toggleFaq = (id) => {
    setDuvidaAberta(duvidaAberta === id ? null : id);
  };

  const handleSuporteWhatsApp = () => {
    const mensagem = encodeURIComponent("Olá! Preciso de suporte no app Gerencia Motoca.");
    window.open(`https://api.whatsapp.com/send?text=${mensagem}`, "_blank");
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.titulo}>Central de Ajuda</h2>
      <p style={styles.subtitulo}>Tire suas dúvidas ou fale diretamente com a nossa equipe.</p>

      {/* Card de Suporte Direto */}
      <div style={styles.cardSuporte}>
        <div style={styles.suporteInfo}>
          <span style={styles.iconSuporte}>💬</span>
          <div>
            <h3 style={styles.tituloSuporte}>Precisa de suporte?</h3>
            <p style={styles.descSuporte}>Fale com o suporte no WhatsApp para resolver qualquer problema.</p>
          </div>
        </div>
        <button onClick={handleSuporteWhatsApp} style={styles.btnSuporte}>
          Chamar no WhatsApp
        </button>
      </div>

      {/* Seção de FAQs */}
      <div style={styles.secaoFaq}>
        <h3 style={styles.tituloFaq}>Perguntas Frequentes</h3>

        <div style={styles.listaFaq}>
          {faqs.map((faq) => (
            <div key={faq.id} style={styles.itemFaq}>
              <button onClick={() => toggleFaq(faq.id)} style={styles.perguntaBtn}>
                <span>{faq.pergunta}</span>
                <span>{duvidaAberta === faq.id ? "▲" : "▼"}</span>
              </button>
              {duvidaAberta === faq.id && (
                <div style={styles.respostaBox}>
                  <p style={styles.respostaTexto}>{faq.resposta}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "16px", maxWidth: "480px", margin: "0 auto" },
  titulo: { fontSize: "20px", fontWeight: "bold", margin: "0 0 4px 0" },
  subtitulo: { fontSize: "12px", color: "#666", margin: "0 0 16px 0" },
  cardSuporte: { backgroundColor: "#FFFFFF", padding: "16px", borderRadius: "12px", border: "1px solid #E5E7EB", marginBottom: "20px", display: "flex", flexDirection: "column", gap: "12px" },
  suporteInfo: { display: "flex", alignItems: "center", gap: "12px" },
  iconSuporte: { fontSize: "28px" },
  tituloSuporte: { fontSize: "15px", fontWeight: "bold", margin: "0 0 2px 0", color: "#111827" },
  descSuporte: { fontSize: "12px", color: "#6B7280", margin: 0 },
  btnSuporte: { padding: "12px", borderRadius: "8px", border: "none", backgroundColor: "#25D366", color: "#FFFFFF", fontWeight: "bold", fontSize: "14px", cursor: "pointer", width: "100%" },
  secaoFaq: { display: "flex", flexDirection: "column", gap: "8px" },
  tituloFaq: { fontSize: "16px", fontWeight: "bold", margin: "0 0 8px 0", color: "#111827" },
  listaFaq: { display: "flex", flexDirection: "column", gap: "8px" },
  itemFaq: { backgroundColor: "#FFFFFF", borderRadius: "8px", border: "1px solid #E5E7EB", overflow: "hidden" },
  perguntaBtn: { width: "100%", padding: "12px 16px", background: "none", border: "none", textAlign: "left", fontSize: "13px", fontWeight: "bold", color: "#374151", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" },
  respostaBox: { padding: "0 16px 12px 16px", borderTop: "1px solid #F3F4F6", backgroundColor: "#FAFAFA" },
  respostaTexto: { fontSize: "12px", color: "#4B5563", margin: "8px 0 0 0", lineHeight: "1.4" }
};