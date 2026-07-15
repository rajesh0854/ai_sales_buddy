"use client";
import { createContext, useCallback, useContext, useMemo, useRef, useState, useEffect } from "react";
import { api } from "@/lib/api";

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
  const [customerId, setCustomerId] = useState("");
  const [productId, setProductId] = useState("");
  const [activeTab, setActiveTab] = useState("pitch");
  const [language, setLanguage] = useState("English");
  const [templateId, setTemplateId] = useState("");

  const [customerDetails, setCustomerDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [languages, setLanguages] = useState(["English"]);
  const [refDataLoaded, setRefDataLoaded] = useState(false);

  const loadingRef = useRef(false);
  const loadedRef = useRef(false);

  const loadReferenceData = useCallback(async () => {
    if (loadedRef.current || loadingRef.current) return;
    loadingRef.current = true;
    try {
      const [c, p, t, l] = await Promise.all([
        api.listCustomers().catch(() => ({ customers: [] })),
        api.listProducts().catch(() => ({ products: [] })),
        api.listTemplates().catch(() => ({ templates: [] })),
        api.languages().catch(() => ({ languages: ["English"] })),
      ]);
      setCustomers(c.customers || []);
      setProducts(p.products || []);
      setTemplates(t.templates || []);
      setLanguages(l.languages || ["English"]);
      const def = (t.templates || []).find((tpl) => tpl.is_default);
      if (def) setTemplateId((cur) => cur || def.template_id);
      loadedRef.current = true;
      setRefDataLoaded(true);
    } finally {
      loadingRef.current = false;
    }
  }, []);

  const customer = useMemo(() => customers.find((c) => c.customer_id === customerId), [customers, customerId]);
  const product = useMemo(() => products.find((p) => p.product_id === productId), [products, productId]);

  useEffect(() => {
    if (!customerId) {
      setCustomerDetails(null);
      return;
    }
    setLoadingDetails(true);
    api.customer360(customerId)
      .then((data) => setCustomerDetails(data))
      .catch(() => setCustomerDetails(null))
      .finally(() => setLoadingDetails(false));
  }, [customerId]);

  const value = useMemo(
    () => ({
      customerId, setCustomerId,
      productId, setProductId,
      activeTab, setActiveTab,
      language, setLanguage,
      templateId, setTemplateId,
      customers, products, templates, languages, refDataLoaded,
      loadReferenceData,
      customer, product,
      customerDetails, setCustomerDetails,
      loadingDetails,
    }),
    [customerId, productId, activeTab, language, templateId, customers, products, templates, languages, refDataLoaded, loadReferenceData, customer, product, customerDetails, loadingDetails]
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}
