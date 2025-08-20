import { StyleSheet } from "react-native";

// 🏆 PALETA PROFESIONAL PARA GESTIÓN DEPORTIVA
export const PROFESSIONAL_COLORS = {
  // Azul corporativo serio y confiable
  primary: "#1e40af", // Azul profundo
  primaryDark: "#1e3a8a", // Azul navy
  primaryLight: "#3b82f6", // Azul brillante para acentos

  // Verde para éxito/confirmaciones - más sobrio
  success: "#059669", // Verde esmeralda profesional
  successLight: "#10b981", // Verde claro para hover

  // Gris elegante para elementos secundarios
  secondary: "#374151", // Gris carbón
  secondaryLight: "#6b7280", // Gris medio

  // Rojo para alertas/partidos importantes - no agresivo
  accent: "#dc2626", // Rojo profesional
  accentLight: "#ef4444", // Rojo suave

  // Fondos neutros y elegantes
  background: "#f8fafc", // Gris muy claro
  backgroundDark: "#f1f5f9", // Gris ligeramente más oscuro
  surface: "#ffffff", // Blanco puro
  surfaceElevated: "#ffffff", // Blanco para tarjetas

  // Textos con excelente contraste
  textPrimary: "#111827", // Negro carbón
  textSecondary: "#374151", // Gris oscuro
  textMuted: "#6b7280", // Gris medio
  textLight: "#ffffff", // Blanco
  textInverse: "#f9fafb", // Casi blanco

  // Estados adicionales
  warning: "#d97706", // Naranja profesional
  info: "#0369a1", // Azul información

  // Bordes y divisores discretos
  border: "#e5e7eb", // Gris muy claro
  borderLight: "#f3f4f6", // Gris ultra claro
  borderDark: "#d1d5db", // Gris claro

  // Sombras sutiles pero elegantes
  shadowPrimary: "rgba(30, 64, 175, 0.15)", // Sombra azul
  shadowNeutral: "rgba(0, 0, 0, 0.1)", // Sombra neutra
  shadowSubtle: "rgba(0, 0, 0, 0.05)", // Sombra muy sutil
};

// 🏆 GRADIENTES PROFESIONALES POR SECCIÓN
export const PROFESSIONAL_GRADIENTS = {
  // Header principal - azul corporativo
  header: [PROFESSIONAL_COLORS.primary, PROFESSIONAL_COLORS.primaryDark],

  // Jugadores - azul confiable
  players: [PROFESSIONAL_COLORS.primary, PROFESSIONAL_COLORS.primaryLight],

  // Staff - gris elegante con toque azul
  staff: [PROFESSIONAL_COLORS.secondary, PROFESSIONAL_COLORS.primary],

  // Partidos - verde éxito
  matches: [PROFESSIONAL_COLORS.success, PROFESSIONAL_COLORS.successLight],

  // Convocatorias - azul información
  callups: [PROFESSIONAL_COLORS.info, PROFESSIONAL_COLORS.primary],

  // Próximo partido - rojo profesional (sin ser agresivo)
  nextMatch: [PROFESSIONAL_COLORS.accent, PROFESSIONAL_COLORS.accentLight],
};

// 🏆 ESTILOS PROFESIONALES PARA HOME
export const professionalHomeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PROFESSIONAL_COLORS.background,
  },

  // Header corporativo elegante
  headerGradient: {
    borderBottomLeftRadius: 20, // Menos redondeado = más profesional
    borderBottomRightRadius: 20,
    shadowColor: PROFESSIONAL_COLORS.shadowPrimary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },

  header: {
    padding: 24,
    paddingBottom: 32,
    paddingTop: 44,
  },

  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  userSection: {
    flex: 1,
  },

  greeting: {
    fontSize: 16,
    color: PROFESSIONAL_COLORS.textInverse,
    marginBottom: 4,
    fontWeight: "500",
    opacity: 0.9,
  },

  userName: {
    fontSize: 28, // Menos dramático
    fontWeight: "700", // Menos agresivo que 900
    color: PROFESSIONAL_COLORS.textLight,
    marginBottom: 16,
    letterSpacing: -0.3,
  },

  teamName: {
    fontSize: 17,
    fontWeight: "600",
    color: PROFESSIONAL_COLORS.textInverse,
    marginBottom: 4,
    opacity: 0.95,
  },

  teamField: {
    fontSize: 14,
    color: PROFESSIONAL_COLORS.textInverse,
    fontWeight: "500",
    opacity: 0.85,
  },

  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 12, // Menos redondeado
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },

  // Contenido principal
  content: {
    flex: 1,
    marginTop: -4,
  },

  // Próximo partido más sobrio
  nextMatchSection: {
    padding: 20,
  },

  nextMatchCard: {
    borderRadius: 16, // Menos redondeado
    overflow: "hidden",
    shadowColor: PROFESSIONAL_COLORS.shadowNeutral,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
    backgroundColor: PROFESSIONAL_COLORS.surface,
  },

  matchGradient: {
    padding: 24,
    minHeight: 140,
  },

  matchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  matchBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8, // Menos redondeado
  },

  matchBadgeText: {
    color: PROFESSIONAL_COLORS.textLight,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
  },

  matchDate: {
    color: PROFESSIONAL_COLORS.textLight,
    fontSize: 18,
    fontWeight: "700",
  },

  matchTitle: {
    fontSize: 24,
    fontWeight: "700", // Menos dramático
    color: PROFESSIONAL_COLORS.textLight,
    marginBottom: 12,
    letterSpacing: -0.3,
  },

  matchDetails: {
    flexDirection: "row",
    gap: 20,
  },

  matchDetail: {
    color: PROFESSIONAL_COLORS.textInverse,
    fontSize: 15,
    fontWeight: "500",
    opacity: 0.95,
  },

  // Sección principal más limpia
  mainSection: {
    padding: 20,
    paddingTop: 8,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: PROFESSIONAL_COLORS.textPrimary,
    marginBottom: 20,
    letterSpacing: -0.3,
  },

  // Tarjetas más elegantes y menos llamativas
  verticalContainer: {
    gap: 16,
  },

  verticalCard: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: PROFESSIONAL_COLORS.shadowNeutral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: PROFESSIONAL_COLORS.surface,
  },

  verticalCardGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    minHeight: 80,
  },

  verticalCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12, // Menos redondeado
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },

  verticalCardContent: {
    flex: 1,
  },

  verticalCardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: PROFESSIONAL_COLORS.textLight,
    marginBottom: 4,
    letterSpacing: -0.2,
  },

  verticalCardSubtitle: {
    fontSize: 14,
    color: PROFESSIONAL_COLORS.textInverse,
    fontWeight: "500",
    opacity: 0.9,
  },

  verticalCardArrow: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },

  bottomSpacer: {
    height: 32,
  },
});

// 🏆 ESTILOS PROFESIONALES PARA AUTH
export const professionalAuthStyles = StyleSheet.create({
  container: {
    flex: 1,
  },

  background: {
    flex: 1,
    backgroundColor: PROFESSIONAL_COLORS.background,
  },

  // Elementos decorativos más discretos
  decorativeElement1: {
    position: "absolute",
    top: -80,
    right: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(30, 64, 175, 0.04)", // Muy sutil
  },

  decorativeElement2: {
    position: "absolute",
    bottom: -100,
    left: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(5, 150, 105, 0.03)", // Muy sutil
  },

  header: {
    alignItems: "center",
    marginBottom: 32,
    paddingTop: 40,
  },

  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 20, // Menos redondeado
    backgroundColor: PROFESSIONAL_COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: PROFESSIONAL_COLORS.shadowNeutral,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: PROFESSIONAL_COLORS.borderLight,
  },

  logo: {
    width: 100,
    height: 100,
    borderRadius: 16,
  },

  welcomeText: {
    fontSize: 28,
    fontWeight: "700",
    color: PROFESSIONAL_COLORS.textPrimary,
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: -0.3,
  },

  subtitle: {
    fontSize: 16,
    color: PROFESSIONAL_COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 280,
  },

  // Formulario más elegante
  formCard: {
    backgroundColor: PROFESSIONAL_COLORS.surface,
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    shadowColor: PROFESSIONAL_COLORS.shadowNeutral,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: PROFESSIONAL_COLORS.borderLight,
  },

  // Inputs profesionales
  inputContainer: {
    marginBottom: 18,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: PROFESSIONAL_COLORS.textPrimary,
    marginBottom: 6,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PROFESSIONAL_COLORS.backgroundDark,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: PROFESSIONAL_COLORS.border,
    minHeight: 52,
  },

  inputWrapperFocused: {
    borderColor: PROFESSIONAL_COLORS.primary,
    backgroundColor: PROFESSIONAL_COLORS.surface,
    shadowColor: PROFESSIONAL_COLORS.shadowPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: PROFESSIONAL_COLORS.textPrimary,
  },

  inputError: {
    borderColor: PROFESSIONAL_COLORS.accent,
    backgroundColor: "rgba(220, 38, 38, 0.03)",
  },

  errorText: {
    fontSize: 12,
    color: PROFESSIONAL_COLORS.accent,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: "500",
  },

  // Botones profesionales
  primaryButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 8,
    shadowColor: PROFESSIONAL_COLORS.shadowPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  buttonGradient: {
    padding: 16,
    alignItems: "center",
    minHeight: 52,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: PROFESSIONAL_COLORS.textLight,
    letterSpacing: 0.2,
  },

  // Elementos adicionales
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: PROFESSIONAL_COLORS.border,
  },

  dividerText: {
    marginHorizontal: 16,
    color: PROFESSIONAL_COLORS.textMuted,
    fontSize: 14,
    fontWeight: "500",
  },

  footer: {
    marginTop: 24,
    alignItems: "center",
  },

  footerText: {
    fontSize: 12,
    color: PROFESSIONAL_COLORS.textMuted,
    textAlign: "center",
    lineHeight: 18,
  },
});
