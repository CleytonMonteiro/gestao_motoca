import React, { useState } from "react";

export function Calculadora() {
  const [valorDesejado, setValorDesejado] = useState("");
  const [taxaPorcentagem, setTaxaPorcentagem] = useState("4.99"); // Ex: Taxa média de crédito
  const [tipoCalculo, setTipoCalculo] = useState("cobrar"); // "cobrar" ou "desconto"

  const valNum = parseFloat(valorDesejado.replace(",", ".")) || 0;
  const taxaNum = parseFloat(taxaPorcentagem.replace(",", ".")) || 0;

  // Se o motorista quer RECEBER R$ 100 líquidos, quanto deve COBRAR do cliente?
  // Fórmula: ValorCobrar = ValorDesejado / (1 - Taxa%)
  const valorCobrar = taxaNum < 100 ? valNum / (1 - taxaNum / 100) : 0;
  const taxaCobrada = valorCobrar - valNum;

  // Se o motorista COBRA R$ 100, quanto vai RECEBER líquido?
  const valorLiquidoReceber = valNum - valNum * (taxaNum / 100);
  const descontoTaxa = valNum * (taxaNum / 100);

  return (
    <div style={styles.container}>
      <h2 style={styles.titulo}>Calculadora de Taxas</h2>
      <p style={styles.subtitulo}>
        Calcule quanto cobrar em corridas particulares ou entregas com maquininha.
      </p>

      <div style={styles.cardAviso}>
        🧮 Evite prejuízos! Calcule o valor exato a cobrar do cliente para receber seu lucro pretendido integralmente.
      </div>

      <div style={styles.toggleContainer}>
        <button
          type="button"
          onClick={() => setTipoCalculo("cobrar")}
          style={tipoCalculo === "cobrar" ? styles.btnToggleAtivo : styles.btnToggle}
        >
          Quanto cobrar?
        </button>
        <button
          type="button"
          onClick={() => setTipoCalculo("desconto")}
          style={tipoCalculo === "desconto" ? styles.btnToggleAtivo : styles.btnToggle}
        >
          Quanto recebo líquido?
        </button>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>
          {tipoCalculo === "cobrar" ? "Quanto você quer receber limpo?" : "Quanto vai cobrar no total?"}
        </label>
        <input
          type="number"
          step="0.01"
          placeholder="R$ 0,00"
          value={valorDesejado}
          onChange={(e) => setValorDesejado(e.target.value)}
          style={styles.input}
        />

        <label style={styles.label}>Taxa da Maquininha / Plataforma (%)</label>
        <input
          type="number"
          step="0.01"
          placeholder="Ex: 4.99"
          value={taxaPorcentagem}
          onChange={(e) => setTaxaPorcentagem(e.target.value)}
          style={styles.input}
        />
      </div>

      {valNum > 0 && (
        <div style={styles.resultadoCard}>
          {tipoCalculo === "cobrar" ? (
            <>
              <span style={styles.resultadoSub}>Você deve cobrar do cliente:</span>
              <span style={styles.resultadoValor}>
                R$ {valorCobrar.toFixed(2).replace(".", ",")}
              </span>
              <div style={styles.resultadoDetalhe}>
                <span>Lucro limpo: R$ {valNum.toFixed(2).replace(".", ",")}</span>
                <span>Taxa descontada: R$ {taxaCobrada.toFixed(2).replace(".", ",")}</span>
              </div>
            </>
          ) : (
            <>
              <span style={styles.resultadoSub}>Você vai receber líquido:</span>
              <span style={{ ...styles.resultadoValor, color: "#16A34A" }}>
                R$ {valorLiquidoReceber.toFixed(2).replace(".", ",")}
              </span>
              <div style={styles.resultadoDetalhe}>
                <span>Valor cobrado: R$ {valNum.toFixed(2).replace(".", ",")}</span>
                <span>Taxa descontada: R$ {descontoTaxa.toFixed(2).replace(".", ",")}</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: "16px", maxWidth: "480px", margin: "0 auto" },
  titulo: { fontSize: "20px", fontWeight: "bold", margin: "0 0 4px 0" },
  subtitulo: { fontSize: "12px", color: "#666", margin: "0 0 16px 0" },
  cardAviso: { backgroundColor: "#FEF3C7", border: "1px solid #FDE68A", padding: "12px", borderRadius: "8px", fontSize: "12px", color: "#92400E", marginBottom: "20px" },
  toggleContainer: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" },
  btnToggle: { padding: "12px", borderRadius: "8px", border: "1px solid #E5E7EB", backgroundColor: "#F3F4F6", fontSize: "13px", cursor: "pointer" },
  btnToggleAtivo: { padding: "12px", borderRadius: "8px", border: "none", backgroundColor: "#FFC107", fontWeight: "bold", fontSize: "13px", cursor: "pointer" },
  formGroup: { display: "flex", flexDirection: "column", gap: "10px" },
  label: { fontSize: "13px", fontWeight: "bold", marginTop: "6px" },
  input: { padding: "12px", borderRadius: "8px", border: "1px solid #D1D5DB", fontSize: "15px" },
  resultadoCard: { marginTop: "24px", backgroundColor: "#FFFFFF", padding: "20px", borderRadius: "12px", border: "1px solid #E5E7EB", textAlign: "center", display: "flex", flexDirection: "column", gap: "8px" },
  resultadoSub: { fontSize: "12px", color: "#6B7280", fontWeight: "bold" },
  resultadoValor: { fontSize: "28px", fontWeight: "bold", color: "#D97706" },
  resultadoDetalhe: { display: "flex", justifyContent: "space-between", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #F3F4F6", fontSize: "12px", color: "#4B5563" }
};