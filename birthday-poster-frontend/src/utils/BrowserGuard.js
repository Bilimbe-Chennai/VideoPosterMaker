import React, { useEffect, useState, useMemo, useCallback } from "react";

const BrowserGuard = ({ children }) => {
    const [isBlocked, setIsBlocked] = useState(false);
    const ua = useMemo(() => navigator.userAgent || "", []);
    const url = useMemo(() => window.location.href, []);

    // 🕵️ EXTRA-SENSITIVE DETECTION
    const isInApp = useMemo(() => {
        return /Instagram|WhatsApp|Messenger|FBAN|FBAV|Line|Snapchat|MicroMessenger|Pinterest|Twitter|Zalo|FB_IAB|FB4A|FB_AK|WebView|(; wv\))|Android.*wv|Version\/[0-9\.]+/i.test(ua);
    }, [ua]);

    const isAndroid = useMemo(() => /Android/i.test(ua), [ua]);
    const isIOS = useMemo(() => /iPhone|iPad|iPod/i.test(ua), [ua]);

    // 🚀 REDIRECTION LOGIC
    const forceChromeLaunch = useCallback(() => {
        if (!isAndroid) return;

        const rawUrl = url.replace(/^https?:\/\//, "");
        const intent = `intent://${rawUrl}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(url)};end;`;

        console.log("🚀 REDIRECTING...");

        // Method 1: replace
        window.location.replace(intent);

        // Method 2: direct href
        window.location.href = intent;

        // Method 3: simulated click
        const a = document.createElement("a");
        a.href = intent;
        a.click();
    }, [isAndroid, url]);

    useEffect(() => {
        if (isInApp) {
            setIsBlocked(true);
            if (isAndroid) {
                // Automatic attempts
                forceChromeLaunch();
                const t1 = setTimeout(forceChromeLaunch, 500);
                const t2 = setTimeout(forceChromeLaunch, 1500);
                return () => {
                    clearTimeout(t1);
                    clearTimeout(t2);
                };
            }
        }
    }, [isInApp, isAndroid, forceChromeLaunch]);

    const handleManualOpen = () => {
        if (isAndroid) {
            forceChromeLaunch();
        } else {
            navigator.clipboard.writeText(url);
            alert("Link copied! Now open Safari.");
        }
    };

    // 3. UI RENDERING
    if (!isInApp) return children;

    return (
        <div style={styles.container}>
            <style>{animations}</style>

            <div style={styles.card}>
                <div style={styles.iconWrapper}>
                    <div style={styles.pulse}></div>
                    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#A3102F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                </div>

                <h2 style={styles.title}>Switching Browser...</h2>
                <p style={styles.description}>
                    {isAndroid
                        ? "We are automatically redirecting you to Chrome for the best experience."
                        : "Please open this link in your Safari browser for high-quality photos."}
                </p>

                <div style={styles.buttonWrapper}>
                    <button style={styles.primaryButton} onClick={handleManualOpen}>
                        {isAndroid ? "🚀 Launch Chrome Now" : "📋 Copy Link for Safari"}
                    </button>
                </div>

                <div style={styles.infoBox}>
                    <p style={styles.infoText}>
                        <b>WhatsApp/FB browsers are restricted.</b>
                        <br />
                        Switching to a dedicated browser ensures your media is processed at full quality.
                    </p>
                </div>
            </div>
        </div>
    );
};

const animations = `
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulse { 0% { transform: scale(0.95); opacity: 0.5; } 50% { transform: scale(1.1); opacity: 0.2; } 100% { transform: scale(0.95); opacity: 0.5; } }
`;

const styles = {
    container: { height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#f8fafc", padding: "24px", fontFamily: "'Outfit', sans-serif" },
    card: { background: "white", padding: "40px 24px", borderRadius: "32px", boxShadow: "0 25px 60px rgba(0, 0, 0, 0.05)", width: "100%", maxWidth: "420px", textAlign: "center", animation: "fadeIn 0.6s ease-out", border: "1px solid #f1f5f9" },
    iconWrapper: { position: "relative", width: "100px", height: "100px", background: "#fef2f2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 32px" },
    pulse: { position: "absolute", width: "100%", height: "100%", background: "#fef2f2", borderRadius: "50%", animation: "pulse 2s infinite" },
    title: { fontSize: "28px", fontWeight: "800", color: "#1e293b", margin: "0 0 16px 0", letterSpacing: "-1px" },
    description: { fontSize: "15px", color: "#64748b", lineHeight: "1.6", margin: "0 0 32px 0" },
    buttonWrapper: { position: "relative", zIndex: 10 },
    primaryButton: { background: "#A3102F", color: "white", border: "none", width: "100%", padding: "20px", borderRadius: "20px", fontSize: "17px", fontWeight: "700", cursor: "pointer", boxShadow: "0 12px 24px rgba(163, 16, 47, 0.25)", transition: "all 0.2s" },
    infoBox: { marginTop: "40px", padding: "20px", background: "#f8fafc", borderRadius: "24px", border: "1px solid #f1f5f9", textAlign: "left" },
    infoText: { fontSize: "13px", color: "#64748b", margin: 0, lineHeight: "1.7" }
};

export default BrowserGuard;
