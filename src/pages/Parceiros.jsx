import React, { useState } from "react";

export function Parceiros() {
  const [categoriaAtiva, setCategoriaAtiva] = useState("todos");

  const parceiros = [
    {
      id: 1,
      nome: "Motopeças & Oficina Rota Certa",
      categoria: "oficina",
      desconto: "10% de desconto em peças e mão de obra",
      endereco: "Av. Principal, 1020 - Centro",
      telefone: "(79) 99999-1010",
      destaque: true
    },
    {
      id: 2,
      nome: "Posto Shell - Rodagem Segura",
      categoria: "posto",
      desconto: "R$ 0,10 de desconto por litro na gasolina",
      endereco: "Rua do Comércio, 450",
      telefone: "(79) 98888-2020",
      destaque: false
    },
    {
      id: 3,
      nome: "Lava-Jato Ducha Express",
      categoria: "lavagem",
      desconto: "Lavagem completa por R$ 15,00 para cadastrados",
      endereco: "Av. Marginal, 88",
      telefone: "(79) 97777-3030",
      destaque: false
    },
    {
      id: 4,
      nome: "Pneus & Acessórios Impacto",
      categoria: "oficina",
      desconto: "Montagem grátis na troca de pneus",
      endereco: "Rua das Oficinas, 300",
      telefone: "(79) 96666-4040",
      destaque: true
    }
  ];

  const parceirosFiltrados =
    categoriaAtiva === "todos"
      ? parceiros
      : parceiros.filter((item) => item.categoria === categoriaAtiva);

  const handleContato = (telefone, nome) => {
    const numLimpo = telefone.replace(/\D/g, "");
    const msg = encodeURIComponent(`Olá! Sou usuário do Gerencia Motoca e gostaria de informações sobre os descontos no ${nome}.`);
    window.open(`https://api.whatsapp.com/send?phone=55${numLimpo}&text=${msg}`, "_blank");
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.titulo}>Fornecedores & Parceiros</h2>
      <p style={styles.subtitulo}>
        Encontre oficinas, postos e parceiros com descontos exclusivos para cadastrados.
      </p>

      {/* Filtros de Categoria */}
      <div style={styles.filtros}>
        <button
          onClick={() => setCategoriaAtiva("todos")}
          style={categoriaAtiva === "todos" ? styles.btnFiltroAtivo : styles.btnFiltro}
        >
          Todos
        </button>
        <button
          onClick={() => setCategoriaAtiva("oficina")}
          style={categoriaAtiva === "oficina" ? styles.btnFiltroAtivo : styles.btnFiltro}
        >
          🔧 Oficinas
        </button>
        <button
          onClick={() => setCategoriaAtiva("posto")}
          style={categoriaAtiva === "posto" ? styles.btnFiltroAtivo : styles.btnFiltro}
        >
          ⛽ Postos
        </button>
        <button
          onClick={() => setCategoriaAtiva("lavagem")}
          style={categoriaAtiva === "lavagem" ? styles.btnFiltroAtivo : styles.btnFiltro}
        >
          🚿 Lavagem
        </button>
      </div>

      {/* Lista de Parceiros */}
      <div style={styles.lista}>
        {parceirosFiltrados.map((item) => (
          <div key={item.id} style={styles.card}>
            {item.destaque && <span style={styles.badgeDestaque}>⭐ PARCEIRO DESTAQUE</span>}
            <h3 style={styles.nomeParceiro}>{item.nome}</h3>
            
            <div style={styles.boxDesconto}>
              <span style={styles.iconDesconto}>🎁</span>
              <span style={styles.textoDesconto}>{item.desconto}</span>
            </div>

            <p style={styles.infoTexto}>📍 {item.endereco}</p>
            <p style={styles.infoTexto}>📞 {item.telefone}</p>

            <button
              onClick={() => handleContato(item.telefone, item.nome)}
              style={styles.btnContato}
            >
              💬 Falar no WhatsApp
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "16px", maxWidth: "480px", margin: "0 auto" },
  titulo: { fontSize: "20px", fontWeight: "bold", margin: "0 0 4px 0" },
  subtitulo: { fontSize: "12px", color: "#666", margin: "0 0 16px 0" },
  filtros: { display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "8px", marginBottom: "16px" },
  btnFiltro: { padding: "8px 12px", borderRadius: "20px", border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF", fontSize: "12px", cursor: "pointer", whitespace: "nowrap" },
  btnFiltroAtivo: { padding: "8px 12px", borderRadius: "20px", border: "none", backgroundColor: "#121212", color: "#FFFFFF", fontWeight: "bold", fontSize: "12px", cursor: "pointer", whitespace: "nowrap" },
  lista: { display: "flex", flexDirection: "column", gap: "12px" },
  card: { backgroundColor: "#FFFFFF", padding: "16px", borderRadius: "12px", border: "1px solid #E5E7EB", display: "flex", flexDirection: "column", gap: "8px", position: "relative" },
  badgeDestaque: { backgroundColor: "#FEF3C7", color: "#B45309", fontSize: "10px", fontWeight: "bold", padding: "3px 8px", borderRadius: "12px", alignSelf: "flex-start" },
  nomeParceiro: { fontSize: "16px", fontWeight: "bold", margin: 0, color: "#111827" },
  boxDesconto: { backgroundColor: "#ECFDF5", border: "1px solid #A7F3D0", padding: "10px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "8px" },
  iconDesconto: { fontSize: "16px" },
  textoDesconto: { fontSize: "12px", fontWeight: "bold", color: "#065F46" },
  infoTexto: { fontSize: "12px", color: "#4B5563", margin: 0 },
  btnContato: { padding: "10px", borderRadius: "8px", border: "none", backgroundColor: "#25D366", color: "#FFFFFF", fontWeight: "bold", fontSize: "13px", cursor: "pointer", marginTop: "4px" }
};