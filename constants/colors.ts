export const COLORS = {
    /* =====================
     * Brand / App
     * ===================== */
    primary: "#7870e6", 
    secondary: "#b06ecc",
    accent: "#ff7588",

    /* =====================
     * Text
     * ===================== */
    textPrimary: "#1f2937",
    textSecondary: "#6b7280",
    textMuted: "#9ca3af",
    textOnColor: "#ffffff",

    /* =====================
     * UI States
     * ===================== */
    success: "#10b981",
    error: "#ef4444",
    warning: "#f59e0b",
    info: "#3b82f6",

    /* =====================
     * Backgrounds & Borders
     * ===================== */
    background: "#f4f6f7",
    surface: "#ffffff",
    border: "#1953c8",

    /* =====================
     * Modules
     * ===================== */
    finance: {
        primary: "#22c55e",
        income: "#16a34a",
        expense: "#ef4444",
        background: "#d9dade",
    },

    tasks: {
        primary: "#3b82f6",
        completed: "#22c55e",
        pending: "#93c5fd",
        background: "#eff6ff",
    },

    habits: {
        primary: "#8b5cf6",
        streak: "#7c3aed",
        missed: "#f97316",
        background: "#f5f3ff",
    },

    notes: {
        primary: "#f59e0b",
        highlight: "#fde68a",
        background: "#fffbeb",
    },

    settings: {
        primary: "#6b7280",
        background: "#f3f4f6",
    },
} as const;
