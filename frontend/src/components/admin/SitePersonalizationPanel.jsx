// ============================================================
// SitePersonalizationPanel.jsx
// Panel de personalización del sitio:
//   - Paleta de colores (fondo, texto, header, primario, secundario)
//   - Logos y banner (universidad, evento, banner principal)
//   - Temas predefinidos (site_custom_themes)
//   - Capacidades de auditorios (site_location_capacities)
//   Sincroniza con localStorage["site_config"] y dispara
//   window.dispatchEvent(new Event("site-config-updated"))
// ============================================================

import { useState, useEffect, useRef } from "react";
import styles from "../../styles/components/SitePersonalizationPanel.module.css";

const DEFAULTS = {
    custom_bg_color: "#0d2033",
    custom_text_color: "#e2e8f0",
    custom_header_bg: "#1f2a44",
    custom_primary_color: "#2563EB",
    custom_secondary_color: "#1E293B",
    site_logo_uni: "/ucatolica-logo.png",
    site_logo_evento: "/logo-coniiti.png",
    site_banner: "/banner-header.png",
    site_custom_themes: [],
    site_location_capacities: {
        Auditorio_Principal: 300,
        Sala_A: 80,
        Sala_B: 60,
        Sala_Virtual: 500,
    },
};

function loadConfig() {
    try {
        const raw = localStorage.getItem("site_config");
        if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
    } catch {
        // Si el almacenamiento está dañado o bloqueado, se usan los valores predeterminados.
    }
    return { ...DEFAULTS };
}

function saveConfig(config) {
    try {
        localStorage.setItem("site_config", JSON.stringify(config));
        window.dispatchEvent(new Event("site-config-updated"));
    } catch {
        // La personalización sigue siendo utilizable aunque localStorage no esté disponible.
    }
}

export default function SitePersonalizationPanel() {
    const [config, setConfig] = useState(loadConfig);
    const [newThemeName, setNewThemeName] = useState("");
    const [newVenueName, setNewVenueName] = useState("");
    const [newVenueCapacity, setNewVenueCapacity] = useState(100);
    const [saved, setSaved] = useState(false);
    const saveTimer = useRef(null);

    useEffect(() => {
        const handler = () => setConfig(loadConfig());
        window.addEventListener("site-config-updated", handler);
        return () => window.removeEventListener("site-config-updated", handler);
    }, []);

    function patch(key, value) {
        setConfig((prev) => ({ ...prev, [key]: value }));
    }

    function handleSave() {
        saveConfig(config);
        setSaved(true);
        clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => setSaved(false), 2500);
    }

    function handleReset() {
        if (!window.confirm("Restaurar todos los valores de personalización por defecto?")) return;
        const reset = { ...DEFAULTS };
        setConfig(reset);
        saveConfig(reset);
    }

    function handleFileAsUrl(key, file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => patch(key, e.target.result);
        reader.readAsDataURL(file);
    }

    function addTheme() {
        const name = newThemeName.trim();
        if (!name) return;
        const theme = {
            id: `theme_${Date.now()}`,
            name,
            bg: config.custom_bg_color,
            text: config.custom_text_color,
            header: config.custom_header_bg,
            primary: config.custom_primary_color,
            secondary: config.custom_secondary_color,
        };
        patch("site_custom_themes", [...(config.site_custom_themes ?? []), theme]);
        setNewThemeName("");
    }

    function applyTheme(theme) {
        setConfig((prev) => ({
            ...prev,
            custom_bg_color: theme.bg,
            custom_text_color: theme.text,
            custom_header_bg: theme.header,
            custom_primary_color: theme.primary,
            custom_secondary_color: theme.secondary,
        }));
    }

    function removeTheme(id) {
        patch("site_custom_themes", (config.site_custom_themes ?? []).filter((t) => t.id !== id));
    }

    function updateCapacity(venue, value) {
        patch("site_location_capacities", {
            ...config.site_location_capacities,
            [venue]: Number(value),
        });
    }

    function addVenue() {
        const name = newVenueName.trim().replace(/\s+/g, "_");
        if (!name) return;
        updateCapacity(name, newVenueCapacity);
        setNewVenueName("");
        setNewVenueCapacity(100);
    }

    function removeVenue(key) {
        const updated = { ...config.site_location_capacities };
        delete updated[key];
        patch("site_location_capacities", updated);
    }

    const COLOR_FIELDS = [
        { key: "custom_bg_color", label: "Fondo principal" },
        { key: "custom_text_color", label: "Texto principal" },
        { key: "custom_header_bg", label: "Header / Navbar" },
        { key: "custom_primary_color", label: "Color primario" },
        { key: "custom_secondary_color", label: "Color secundario" },
    ];

    const ASSET_FIELDS = [
        { key: "site_logo_uni", label: "Logo universidad" },
        { key: "site_logo_evento", label: "Logo del evento" },
        { key: "site_banner", label: "Banner principal" },
    ];

    return (
        <div className={styles.panel}>
            <div className={styles.header}>
                <h2>Personalización del sitio</h2>
                <p>Adapta colores, logos, temas y capacidades al estilo de tu evento.</p>
            </div>

            <section className={styles.section}>
                <h3>Paleta de colores</h3>
                <div className={styles.colorGrid}>
                    {COLOR_FIELDS.map(({ key, label }) => (
                        <label key={key} className={styles.colorField}>
                            <span>{label}</span>
                            <div className={styles.colorRow}>
                                <input type="color" value={config[key]} onChange={(e) => patch(key, e.target.value)} className={styles.colorSwatch} />
                                <input type="text" value={config[key]} onChange={(e) => /^#[0-9a-fA-F]{0,6}$/.test(e.target.value) && patch(key, e.target.value)} className={styles.hexInput} maxLength={7} />
                            </div>
                        </label>
                    ))}
                </div>
            </section>

            <section className={styles.section}>
                <h3>Vista previa de colores</h3>
                <div className={styles.preview} style={{ backgroundColor: config.custom_bg_color, color: config.custom_text_color, borderColor: config.custom_primary_color }}>
                    <div className={styles.previewHeader} style={{ backgroundColor: config.custom_header_bg, color: config.custom_text_color }}>Header / Navbar de ejemplo</div>
                    <div className={styles.previewBody}>
                        <p>Texto de ejemplo en el cuerpo del sitio.</p>
                        <button className={styles.previewPrimary} style={{ backgroundColor: config.custom_primary_color }}>Boton primario</button>
                        <button className={styles.previewSecondary} style={{ backgroundColor: config.custom_secondary_color }}>Boton secundario</button>
                    </div>
                </div>
            </section>

            <section className={styles.section}>
                <h3>Temas guardados</h3>
                <div className={styles.themeGrid}>
                    {(config.site_custom_themes ?? []).map((theme) => (
                        <div key={theme.id} className={styles.themeCard}>
                            <div className={styles.themeSwatches}>
                                {[theme.bg, theme.header, theme.primary, theme.secondary, theme.text].map((c, i) => (
                                    <span key={i} className={styles.miniSwatch} style={{ background: c }} title={c} />
                                ))}
                            </div>
                            <span className={styles.themeName}>{theme.name}</span>
                            <div className={styles.themeActions}>
                                <button type="button" onClick={() => applyTheme(theme)}>Aplicar</button>
                                <button type="button" className={styles.danger} onClick={() => removeTheme(theme.id)}>x</button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className={styles.addThemeRow}>
                    <input type="text" placeholder="Nombre del tema actual" value={newThemeName} onChange={(e) => setNewThemeName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTheme()} />
                    <button type="button" onClick={addTheme}>+ Guardar tema</button>
                </div>
            </section>

            <section className={styles.section}>
                <h3>Logos y banner</h3>
                <div className={styles.assetGrid}>
                    {ASSET_FIELDS.map(({ key, label }) => (
                        <div key={key} className={styles.assetCard}>
                            <span className={styles.assetLabel}>{label}</span>
                            {config[key] && <img src={config[key]} alt={label} className={styles.assetPreview} />}
                            <label className={styles.uploadBtn}>
                                Subir imagen
                                <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleFileAsUrl(key, e.target.files?.[0])} />
                            </label>
                            <input type="text" placeholder="O pega una URL..." value={config[key]} onChange={(e) => patch(key, e.target.value)} className={styles.urlInput} />
                        </div>
                    ))}
                </div>
            </section>

            <section className={styles.section}>
                <h3>Capacidades de espacios</h3>
                <div className={styles.venueList}>
                    {Object.entries(config.site_location_capacities ?? {}).map(([venue, cap]) => (
                        <div key={venue} className={styles.venueRow}>
                            <span className={styles.venueName}>{venue.replace(/_/g, " ")}</span>
                            <input type="number" min={1} max={10000} value={cap} onChange={(e) => updateCapacity(venue, e.target.value)} className={styles.capacityInput} />
                            <span className={styles.capacityUnit}>personas</span>
                            <button type="button" className={styles.danger} onClick={() => removeVenue(venue)}>x</button>
                        </div>
                    ))}
                </div>
                <div className={styles.addVenueRow}>
                    <input type="text" placeholder="Nombre del espacio" value={newVenueName} onChange={(e) => setNewVenueName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addVenue()} />
                    <input type="number" min={1} value={newVenueCapacity} onChange={(e) => setNewVenueCapacity(Number(e.target.value))} className={styles.capacityInput} />
                    <button type="button" onClick={addVenue}>+ Agregar</button>
                </div>
            </section>

            <div className={styles.actions}>
                <button type="button" className={styles.resetBtn} onClick={handleReset}>Restaurar valores</button>
                <button type="button" className={styles.saveBtn} onClick={handleSave}>{saved ? "Guardado" : "Aplicar personalizacion"}</button>
            </div>
        </div>
    );
}
