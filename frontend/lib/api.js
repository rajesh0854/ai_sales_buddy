// Central API client. Base URL comes from NEXT_PUBLIC_API_URL (never hardcoded).
const BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

async function request(path, { method = "GET", body, params } = {}) {
  let url = `${BASE}${path}`;
  if (params) {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
    ).toString();
    if (qs) url += `?${qs}`;
  }
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const j = await res.json();
      detail = j.detail || detail;
    } catch {}
    throw new Error(detail);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  base: BASE,
  // auth
  login: (username, password) => request("/api/auth/login", { method: "POST", body: { username, password } }),
  status: () => request("/api/meta/status"),
  languages: () => request("/api/meta/languages"),
  // customers
  listCustomers: (params) => request("/api/customers", { params }),
  customer360: (id) => request(`/api/customers/${id}`),
  priorityQueue: (limit = 25) => request("/api/customers/priority-queue", { params: { limit } }),
  // products
  listProducts: () => request("/api/products"),
  getProduct: (id) => request(`/api/products/${id}`),
  // pitch
  generatePitch: (body) => request("/api/pitch/generate", { method: "POST", body }),
  listScripts: (customer_id) => request("/api/pitch/scripts", { params: { customer_id } }),
  getScript: (id) => request(`/api/pitch/scripts/${id}`),
  regenScenario: (scriptId, scenario_key) =>
    request(`/api/pitch/scripts/${scriptId}/scenarios/regenerate`, { method: "POST", body: { scenario_key } }),
  // eligibility
  checkEligibility: (customer_id, product_id) =>
    request("/api/eligibility/check", { method: "POST", body: { customer_id, product_id } }),
  // chatbot
  ask: (body) => request("/api/chatbot/ask", { method: "POST", body }),
  compare: (body) => request("/api/chatbot/compare", { method: "POST", body }),
  suggestedQuestions: (customer_id) => request("/api/chatbot/suggested-questions", { params: { customer_id } }),
  // notes
  createNote: (body) => request("/api/notes", { method: "POST", body }),
  listNotes: (customer_id) => request("/api/notes", { params: { customer_id } }),
  followUps: (params) => request("/api/notes/follow-ups", { params }),
  updateFollowUp: (id, status) => request(`/api/notes/follow-ups/${id}`, { method: "PATCH", body: { status } }),
  // messaging
  generateMessage: (body) => request("/api/messaging/generate", { method: "POST", body }),
  sendMessage: (body) => request("/api/messaging/send", { method: "POST", body }),
  listMessages: (customer_id) => request("/api/messaging", { params: { customer_id } }),
  // templates
  listTemplates: () => request("/api/templates"),
  getTemplate: (id) => request(`/api/templates/${id}`),
  createTemplate: (body) => request("/api/templates", { method: "POST", body }),
  updateTemplate: (id, body) => request(`/api/templates/${id}`, { method: "PUT", body }),
  deleteTemplate: (id) => request(`/api/templates/${id}`, { method: "DELETE" }),
  // feedback
  addFeedback: (body) => request("/api/feedback", { method: "POST", body }),
  listFeedback: () => request("/api/feedback"),
  generateGuide: () => request("/api/feedback/improvement-guide", { method: "POST" }),
  listGuides: () => request("/api/feedback/improvement-guides"),
  // compliance
  checkText: (content, product_id) => request("/api/compliance/check-text", { method: "POST", body: { content, product_id } }),
  // analytics
  dashboard: () => request("/api/analytics/dashboard"),
};
