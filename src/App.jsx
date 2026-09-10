import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { Cadastro } from "./pages/Cadastro";
import { Corridas } from "./pages/Corridas";
import { Gastos } from "./pages/Gastos";
import { Dashboard } from "./pages/Dashboard";
import { GanhosPessoais } from "./pages/GanhosPessoais";
import { Objetivo } from "./pages/Objetivo";
import { Calculadora } from "./pages/Calculadora";
import { Relatorio } from "./pages/Relatorio";
import { Configuracoes } from "./pages/Configuracoes";
import { Indique } from "./pages/Indique";
import { Ajuda } from "./pages/Ajuda";
import { Parceiros } from "./pages/Parceiros";
import { Planos } from "./pages/Planos";
import { Admin } from "./pages/Admin";

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [dadosPerfil, setDadosPerfil] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [menuAberto, setMenuAberto] = useState(false);
  const [diasTrial, setDiasTrial] = useState(15);
  const [paginaAtiva, setPaginaAtiva] = useState("dashboard");

  // Estado para controlar o prompt de instalação do PWA
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  const EMAIL_ADMIN = "cleyton30@gmail.com";
  const ehAdmin = usuario?.email?.toLowerCase() === EMAIL_ADMIN.toLowerCase();

  useEffect(() => {
    // Captura o evento do navegador quando o app pode ser instalado
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    let unsubscribeFirestore = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsuario(user);

        const docRef = doc(db, "users", user.uid);
        unsubscribeFirestore = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setDadosPerfil(data);

            if (data.trialEndsAt) {
              const dataFim = new Date(data.trialEndsAt);
              const hoje = new Date();
              const diffTempo = dataFim - hoje;
              const diffDias = Math.ceil(diffTempo / (1000 * 60 * 60 * 24));
              setDiasTrial(diffDias > 0 ? diffDias : 0);
            }
          }
        });
      } else {
        setUsuario(null);
        setDadosPerfil(null);
      }
      setCarregando(false);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      unsubscribeAuth();
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, []);

  const handleInstalarPWA = async () => {
    if (!deferredPrompt) {
      alert("Para instalar: no Chrome clique nos 3 pontinhos no topo e 'Adicionar à tela inicial'. No iPhone/Safari clique em 'Compartilhar' > 'Adicionar à Tela de Início'.");
      return;
    }
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  const handleSair = () => {
    signOut(auth);
  };

  const navegarPara = (pagina) => {
    setPaginaAtiva(pagina);
    setMenuAberto(false);
  };

  if (carregando) {
    return (
      <div style={styles.carregando}>
        <p>Carregando Gerencia Motoca...</p>
      </div>
    );
  }

  if (!usuario) {
    return <Cadastro />;
  }

  const nomeExibicao =
    dadosPerfil?.nome?.trim() ||
    usuario.displayName?.trim() ||
    "Cleyton Monteiro";

  return (
    <div style={styles.appContainer}>
      {/* Header Fixo */}
      <header style={styles.header}>
        <button onClick={() => setMenuAberto(!menuAberto)} style={styles.menuBtn}>
          ☰
        </button>
        <span style={styles.tituloHeader}>Gerencia Motoca</span>
        <div style={styles.headerIcons}>
          <button onClick={handleInstalarPWA} style={styles.btnInstalarHeader} title="Instalar App">
            📲 Instalar
          </button>
          <button onClick={handleSair} style={styles.iconBtn} title="Sair">
            ↪
          </button>
        </div>
      </header>

      {/* Banner de Teste Grátis (Exibido APENAS para usuários comuns) */}
      {!ehAdmin && paginaAtiva !== "admin" && (
        <div style={styles.bannerTrial}>
          <p style={styles.textTrial}>
            <strong>Teste grátis: {diasTrial} dias restantes</strong>
          </p>
          <p style={styles.subtextTrial}>
            Use o app à vontade. Depois escolha um plano para continuar registrando.
          </p>
          <button onClick={() => navegarPara("planos")} style={styles.linkPlanosBtn}>
            Ver planos →
          </button>
        </div>
      )}

      {/* Menu Lateral Dark (Gaveta) */}
      {menuAberto && (
        <div style={styles.overlay} onClick={() => setMenuAberto(false)}>
          <aside style={styles.sidebar} onClick={(e) => e.stopPropagation()}>
            <div style={styles.sidebarHeader}>
              <div style={styles.logoBox}>
                <span style={styles.logoIcon}>🏍️</span>
                <span style={styles.logoText}>GERENCIA MOTOCA</span>
              </div>
              <button onClick={() => setMenuAberto(false)} style={styles.fecharMenuBtn}>
                ✕
              </button>
            </div>

            {/* Card do Usuário Logado */}
            <div style={styles.userCard}>
              <div style={styles.userAvatar}>
                {nomeExibicao.charAt(0).toUpperCase()}
              </div>
              <div style={styles.userInfo}>
                <span style={styles.userName}>{nomeExibicao}</span>
                <span style={styles.userEmail}>{usuario.email}</span>
                {ehAdmin && (
                  <span style={styles.badgeAdmin}>👑 CEO / Admin</span>
                )}
              </div>
            </div>

            {/* Botão Destaque para Instalar no Celular */}
            <button onClick={handleInstalarPWA} style={styles.btnInstalarMenu}>
              📲 Instalar App no Celular
            </button>

            <nav style={styles.navMenu}>
              <button
                onClick={() => navegarPara("dashboard")}
                style={paginaAtiva === "dashboard" ? styles.navItemAtivo : styles.navItem}
              >
                📊 Dashboard
              </button>
              <button
                onClick={() => navegarPara("corridas")}
                style={paginaAtiva === "corridas" ? styles.navItemAtivo : styles.navItem}
              >
                🏍️ Corridas e Km
              </button>
              <button
                onClick={() => navegarPara("gastos")}
                style={paginaAtiva === "gastos" ? styles.navItemAtivo : styles.navItem}
              >
                ⇆ Gastos Gerais
              </button>
              <button
                onClick={() => navegarPara("objetivo")}
                style={paginaAtiva === "objetivo" ? styles.navItemAtivo : styles.navItem}
              >
                🎯 Objetivos e Metas
              </button>
              <button
                onClick={() => navegarPara("ganhos-pessoais")}
                style={paginaAtiva === "ganhos-pessoais" ? styles.navItemAtivo : styles.navItem}
              >
                🏠 Ganhos pessoais
              </button>
              <button
                onClick={() => navegarPara("calculadora")}
                style={paginaAtiva === "calculadora" ? styles.navItemAtivo : styles.navItem}
              >
                🧮 Calculadora de Taxas
              </button>
              <button
                onClick={() => navegarPara("relatorio")}
                style={paginaAtiva === "relatorio" ? styles.navItemAtivo : styles.navItem}
              >
                📄 Relatório Geral
              </button>

              <div style={styles.divisor}>FERRAMENTAS</div>

              <button
                onClick={() => navegarPara("planos")}
                style={paginaAtiva === "planos" ? styles.navItemAtivo : styles.navItem}
              >
                💳 Planos e Assinatura
              </button>
              <button
                onClick={() => navegarPara("fornecedores")}
                style={paginaAtiva === "fornecedores" ? styles.navItemAtivo : styles.navItem}
              >
                🔧 Fornecedores
              </button>
              <button
                onClick={() => navegarPara("parceiros")}
                style={paginaAtiva === "parceiros" ? styles.navItemAtivo : styles.navItem}
              >
                🤝 Parceiros
              </button>
              <button
                onClick={() => navegarPara("indique")}
                style={paginaAtiva === "indique" ? styles.navItemAtivo : styles.navItem}
              >
                🎁 Indique e ganhe
              </button>
              <button
                onClick={() => navegarPara("ajuda")}
                style={paginaAtiva === "ajuda" ? styles.navItemAtivo : styles.navItem}
              >
                ⚙️ Central de ajuda
              </button>
              <button
                onClick={() => navegarPara("configuracoes")}
                style={paginaAtiva === "configuracoes" ? styles.navItemAtivo : styles.navItem}
              >
                ⚙️ Configurações
              </button>

              {ehAdmin && (
                <>
                  <div style={styles.divisor}>GESTÃO</div>
                  <button
                    onClick={() => navegarPara("admin")}
                    style={paginaAtiva === "admin" ? styles.navItemAtivo : styles.navItemAdmin}
                  >
                    🛡️ Painel CEO / Admin
                  </button>
                </>
              )}
            </nav>
          </aside>
        </div>
      )}

      {/* Roteamento dinâmico das telas */}
      <main style={styles.conteudoPrincipal}>
        {paginaAtiva === "dashboard" && <Dashboard nomeUsuario={nomeExibicao} />}
        {paginaAtiva === "corridas" && <Corridas />}
        {paginaAtiva === "gastos" && <Gastos />}
        {paginaAtiva === "objetivo" && <Objetivo />}
        {paginaAtiva === "ganhos-pessoais" && <GanhosPessoais />}
        {paginaAtiva === "calculadora" && <Calculadora />}
        {paginaAtiva === "relatorio" && <Relatorio />}
        {paginaAtiva === "configuracoes" && <Configuracoes />}
        {paginaAtiva === "indique" && <Indique />}
        {paginaAtiva === "ajuda" && <Ajuda />}
        {(paginaAtiva === "parceiros" || paginaAtiva === "fornecedores") && <Parceiros />}
        {paginaAtiva === "planos" && <Planos diasTrial={diasTrial} />}
        {paginaAtiva === "admin" && (ehAdmin ? <Admin /> : <Dashboard />)}
      </main>
    </div>
  );
}

const styles = {
  carregando: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontFamily: "sans-serif" },
  appContainer: { backgroundColor: "#F8F9FA", minHeight: "100vh", fontFamily: "sans-serif", maxWidth: "480px", margin: "0 auto", position: "relative" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", backgroundColor: "#FFFFFF", borderBottom: "1px solid #EEEEEE", position: "sticky", top: 0, zIndex: 10 },
  menuBtn: { background: "none", border: "none", fontSize: "24px", cursor: "pointer" },
  tituloHeader: { fontWeight: "bold", fontSize: "16px" },
  headerIcons: { display: "flex", gap: "8px", alignItems: "center" },
  btnInstalarHeader: { backgroundColor: "#10B981", color: "#FFFFFF", border: "none", padding: "6px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" },
  iconBtn: { background: "#FFC107", border: "none", borderRadius: "50%", width: "36px", height: "36px", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "16px" },
  bannerTrial: { backgroundColor: "#FFFBEB", border: "1px solid #FDE68A", padding: "16px", margin: "12px 16px", borderRadius: "12px" },
  textTrial: { margin: "0 0 4px 0", color: "#92400E", fontSize: "14px" },
  subtextTrial: { margin: "0 0 8px 0", color: "#B45309", fontSize: "12px" },
  linkPlanosBtn: { background: "none", border: "none", color: "#B45309", fontWeight: "bold", fontSize: "12px", cursor: "pointer", padding: 0, textDecoration: "underline" },
  overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 100 },
  sidebar: { width: "280px", height: "100%", backgroundColor: "#121212", color: "#FFFFFF", padding: "20px 16px", display: "flex", flexDirection: "column", boxSizing: "border-box", overflowY: "auto" },
  sidebarHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
  logoBox: { display: "flex", alignItems: "center", gap: "8px" },
  logoIcon: { fontSize: "20px" },
  logoText: { color: "#FFC107", fontWeight: "bold", fontSize: "16px" },
  fecharMenuBtn: { background: "none", border: "none", color: "#FFFFFF", fontSize: "20px", cursor: "pointer" },
  userCard: { backgroundColor: "#1F2937", borderRadius: "10px", padding: "10px 12px", display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", border: "1px solid #374151" },
  userAvatar: { width: "38px", height: "38px", borderRadius: "50%", backgroundColor: "#FFC107", color: "#000000", fontWeight: "bold", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "18px", flexShrink: 0 },
  userInfo: { display: "flex", flexDirection: "column", overflow: "hidden" },
  userName: { fontSize: "14px", fontWeight: "bold", color: "#FFFFFF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  userEmail: { fontSize: "11px", color: "#9CA3AF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  badgeAdmin: { fontSize: "10px", color: "#FBBF24", fontWeight: "bold", marginTop: "2px" },
  btnInstalarMenu: { backgroundColor: "#25D366", color: "#FFFFFF", border: "none", padding: "10px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: "bold", cursor: "pointer", width: "100%", marginBottom: "16px", display: "flex", justifyContent: "center", alignItems: "center", gap: "6px" },
  navMenu: { display: "flex", flexDirection: "column", gap: "8px", paddingBottom: "24px" },
  navItem: { color: "#D1D5DB", background: "none", border: "none", textAlign: "left", padding: "10px 12px", borderRadius: "8px", fontSize: "14px", cursor: "pointer", width: "100%" },
  navItemAtivo: { backgroundColor: "#FFC107", color: "#000000", fontWeight: "bold", border: "none", textAlign: "left", padding: "10px 12px", borderRadius: "8px", fontSize: "14px", cursor: "pointer", width: "100%" },
  navItemAdmin: { color: "#FBBF24", backgroundColor: "#1F2937", border: "1px dashed #F59E0B", textAlign: "left", padding: "10px 12px", borderRadius: "8px", fontSize: "14px", fontWeight: "bold", cursor: "pointer", width: "100%" },
  divisor: { color: "#6B7280", fontSize: "11px", fontWeight: "bold", marginTop: "16px", marginBottom: "4px", paddingLeft: "12px" },
  conteudoPrincipal: { padding: "0 0 24px 0" }
};