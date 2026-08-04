/* ===== VIEW ASSEMBLY ===== */
function buildViews(){
  const root=document.getElementById('mainViews');
  root.innerHTML = V_HOME + V_WEB + V_NET + V_TLS + V_URL + V_HTTP + V_HTTPV
    + V_HTML + V_BROWSER + V_ARCH + V_API + V_STATE + V_AUTH
    + V_SOP + V_CORS + V_CSP + V_HEADERS + V_OWASP + V_CARDS;
}
function initAllLabs(){
  buildWebLab();buildNetLab();buildTlsLab();buildUrlLab();buildHttpLab();buildStatusLab();
  buildHttpvLab();buildHtmlLab();buildBrowserLab();buildArchLab();buildApiLab();
  buildCookieLab();buildSessionLab();buildAuthzLab();buildSopLab();buildCorsLab();
  buildCspLab();buildHeadersLab();buildOwaspLab();
}
