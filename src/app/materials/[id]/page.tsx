"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import TossReviewProductPolicy from "@/components/TossReviewProductPolicy";

type Material = {
  id: string;
  title: string;
  fileName: string;
  mimeType: string;
  subject: string;
  unit: string;
  keywords: string[];
  fileType: string;
  price: number;
  priceLabel: string;
  description: string;
  downloadPolicy: string;
  storagePath?: string;
  sizeBytes?: number | null;
};

function formatBytes(value?: number | null) {
  if (!value) return "";
  if (value < 1024) return `${value}B`;
  if (value < 1024 * 1024) return `${Math.round(value / 1024)}KB`;
  return `${(value / 1024 / 1024).toFixed(1)}MB`;
}

function formatPrice(material?: Material | null) {
  if (!material) return "20,000원";
  if (material.priceLabel) return material.priceLabel;
  return `${Number(material.price || 20000).toLocaleString("ko-KR")}원`;
}

function isSononmun(material?: Material | null) {
  if (!material) return false;
  const text = `${material.title || ""} ${material.fileName || ""}`;
  return text.includes("소논문") || Number(material.price || 0) >= 50000;
}

function getPaymentButtonLabel(material?: Material | null) {
  const price = formatPrice(material);

  if (isSononmun(material)) {
    return `소논문 1건 ${price} 결제 요청`;
  }

  return `자료 1건 ${price} 결제 요청`;
}

export default function MaterialDetailPage() {
  const params = useParams<{ id: string }>();
  const materialId = params?.id || "";

  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [purchaseId, setPurchaseId] = useState("");
  const [purchaseToken, setPurchaseToken] = useState("");
  const [paid, setPaid] = useState(false);
  const [busy, setBusy] = useState("");

  async function loadMaterial() {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`/api/materials/${materialId}?t=${Date.now()}`, {
        cache: "no-store",
      });

      const json = await response.json();

      if (!response.ok || !json.ok) {
        throw new Error(json.message || "자료를 불러오지 못했습니다.");
      }

      setMaterial(json.material);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "자료를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function createPurchase() {
    if (!material) return;

    setBusy("create");
    setMessage("");

    try {
      const response = await fetch("/api/purchases/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          materialId: material.id,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.ok) {
        throw new Error(json.message || "결제 요청 생성에 실패했습니다.");
      }

      setPurchaseId(json.purchaseId || json.purchase?.id || "");
      setPurchaseToken(json.purchaseToken || json.token || json.purchase?.purchaseToken || "");
      setPaid(false);
      setMessage(`${formatPrice(material)} 결제 요청이 생성되었습니다. Toss 승인 전에는 테스트 결제 완료를 누르세요.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "결제 요청 생성에 실패했습니다.");
    } finally {
      setBusy("");
    }
  }

  async function completeTestPayment() {
    if (!purchaseId && !purchaseToken) {
      setMessage("먼저 결제 요청을 생성하세요.");
      return;
    }

    setBusy("pay");
    setMessage("");

    try {
      const response = await fetch("/api/purchases/test-complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          purchaseId,
          purchaseToken,
          token: purchaseToken,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.ok) {
        throw new Error(json.message || "테스트 결제 완료 처리에 실패했습니다.");
      }

      setPurchaseId(json.purchaseId || json.purchase?.id || purchaseId);
      setPurchaseToken(json.purchaseToken || json.token || json.purchase?.purchaseToken || purchaseToken);
      setPaid(true);
      setMessage("결제 완료. 이제 원문 다운로드를 누르세요.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "테스트 결제 완료 처리에 실패했습니다.");
    } finally {
      setBusy("");
    }
  }

  function downloadOriginal() {
    if (!material) return;

    if (!purchaseToken) {
      setMessage("먼저 결제 요청 후 테스트 결제 완료를 진행하세요.");
      return;
    }

    const url = `/api/materials/${material.id}/download?token=${encodeURIComponent(purchaseToken)}`;
    window.location.href = url;
  }

  useEffect(() => {
    if (materialId) loadMaterial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materialId]);

  const keywordText = useMemo(() => {
    return material?.keywords?.length ? material.keywords.join(", ") : "등록된 핵심어 없음";
  }, [material]);

  return (
    <main style={page}>
      <header style={header}>
        <strong>다르마(DHARMA) AI</strong>
        <nav style={nav}>
          <a href="/">홈</a>
          <a href="/materials">자료 목록</a>
          <a href="/pricing">요금</a>
          <a href="/admin/storage">관리자 Storage</a>
        </nav>
      </header>

      <section style={hero}>
        <div style={label}>MATERIAL DETAIL</div>
        <h1 style={title}>자료 상세</h1>
        <p style={lead}>
          Supabase Storage에 등록된 원문 파일을 결제 완료 후 다운로드합니다.
        </p>
      </section>

      {loading && <section style={box}>자료를 불러오는 중입니다.</section>}

      {!loading && message && <section style={notice}>{message}</section>}

      {!loading && !material && (
        <section style={box}>
          <h2>자료를 찾지 못했습니다.</h2>
          <p>자료 목록으로 돌아가 다시 선택하세요.</p>
          <a style={ghostLink} href="/materials">자료 목록으로</a>
        </section>
      )}

      {!loading && material && (
        <section style={detailBox}>
          <div style={fileType}>{material.fileType}</div>

          {isSononmun(material) && <div style={premiumBadge}>소논문 프리미엄 자료</div>}

          <h2 style={materialTitle}>{material.title}</h2>

          <p style={description}>{material.description}</p>

          <div style={infoGrid}>
            <div style={infoCard}>
              <strong>과목</strong>
              <p>{material.subject}</p>
            </div>
            <div style={infoCard}>
              <strong>단원</strong>
              <p>{material.unit}</p>
            </div>
            <div style={infoCard}>
              <strong>파일 형식</strong>
              <p>{material.fileType}</p>
            </div>
            <div style={infoCard}>
              <strong>파일 크기</strong>
              <p>{formatBytes(material.sizeBytes) || "확인 중"}</p>
            </div>
          </div>

          <section style={priceBox}>
            <p><strong>결제 금액:</strong> {formatPrice(material)}</p>
            <p>{material.downloadPolicy}</p>
            <p><strong>파일명:</strong> {material.fileName}</p>
          </section>

          <p style={keywords}>핵심어: {keywordText}</p>

          <div style={actions}>
            <button style={primaryButton} onClick={createPurchase} disabled={!!busy}>
              {busy === "create" ? "결제 요청 생성 중..." : getPaymentButtonLabel(material)}
            </button>

            <button style={primaryButton} onClick={completeTestPayment} disabled={!!busy || !purchaseToken}>
              {busy === "pay" ? "처리 중..." : "테스트 결제 완료"}
            </button>

            <button style={downloadButton} onClick={downloadOriginal} disabled={!purchaseToken}>
              원문 다운로드
            </button>

            <a style={ghostLink} href="/materials">자료 목록으로</a>
          </div>

          {purchaseToken && (
            <section style={tokenBox}>
              <strong>다운로드 권한 상태</strong>
              <p>{paid ? "결제 완료 상태입니다." : "결제 요청이 생성되었습니다. 테스트 결제 완료를 누르세요."}</p>
            </section>
          )}
        </section>
      )}
    
      {/* DHARMA_TOSS_REVIEW_STEP2_PRODUCT_DETAIL */}
      <TossReviewProductPolicy />
</main>
  );
}

const page = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #ffffff 0%, #f1f7ff 100%)",
  color: "#07152f",
};

const header = {
  height: 86,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 5vw",
  borderBottom: "1px solid #d9e7ff",
  background: "rgba(255,255,255,0.94)",
  position: "sticky" as const,
  top: 0,
  zIndex: 10,
};

const nav = {
  display: "flex",
  gap: 16,
  fontWeight: 800,
};

const hero = {
  padding: "70px 6vw 34px",
  maxWidth: 1500,
  margin: "0 auto",
};

const label = {
  color: "#1165e8",
  fontWeight: 950,
  letterSpacing: 4,
  marginBottom: 20,
};

const title = {
  fontSize: 60,
  margin: 0,
  letterSpacing: "-0.05em",
};

const lead = {
  fontSize: 21,
  color: "#385173",
  lineHeight: 1.7,
};

const box = {
  maxWidth: 1500,
  margin: "28px auto",
  padding: 36,
  borderRadius: 34,
  background: "white",
  border: "1px solid #d9e7ff",
};

const notice = {
  maxWidth: 1500,
  margin: "20px auto",
  padding: 24,
  borderRadius: 22,
  background: "#eaf4ff",
  color: "#183f72",
  fontWeight: 800,
};

const detailBox = {
  maxWidth: 1500,
  margin: "28px auto 100px",
  padding: 44,
  borderRadius: 36,
  background: "white",
  border: "1px solid #d9e7ff",
  boxShadow: "0 22px 60px rgba(17,101,232,.08)",
};

const fileType = {
  display: "inline-block",
  padding: "10px 16px",
  borderRadius: 14,
  background: "#eaf4ff",
  color: "#1977f3",
  fontWeight: 950,
  fontSize: 18,
};

const premiumBadge = {
  display: "inline-block",
  marginLeft: 12,
  padding: "10px 16px",
  borderRadius: 14,
  background: "#e11931",
  color: "white",
  fontWeight: 950,
  fontSize: 18,
};

const materialTitle = {
  fontSize: 42,
  lineHeight: 1.25,
  margin: "24px 0 14px",
  letterSpacing: "-0.04em",
};

const description = {
  fontSize: 19,
  lineHeight: 1.7,
  color: "#385173",
};

const infoGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(180px, 1fr))",
  gap: 18,
  marginTop: 28,
};

const infoCard = {
  padding: 24,
  borderRadius: 24,
  background: "#f8fbff",
  border: "1px solid #d9e7ff",
  fontSize: 18,
};

const priceBox = {
  marginTop: 28,
  padding: 26,
  borderRadius: 24,
  background: "#eaf4ff",
  color: "#183f72",
  fontSize: 19,
  lineHeight: 1.7,
};

const keywords = {
  marginTop: 22,
  fontSize: 18,
};

const actions = {
  display: "flex",
  gap: 14,
  flexWrap: "wrap" as const,
  marginTop: 30,
};

const primaryButton = {
  padding: "18px 24px",
  borderRadius: 18,
  border: "0",
  background: "#1977f3",
  color: "white",
  fontWeight: 950,
  fontSize: 17,
  cursor: "pointer",
};

const downloadButton = {
  padding: "18px 24px",
  borderRadius: 18,
  border: "0",
  background: "#07152f",
  color: "white",
  fontWeight: 950,
  fontSize: 17,
  cursor: "pointer",
};

const ghostLink = {
  display: "inline-flex",
  alignItems: "center",
  padding: "18px 24px",
  borderRadius: 18,
  border: "1px solid #d9e7ff",
  background: "white",
  color: "#07152f",
  textDecoration: "none",
  fontWeight: 950,
};

const tokenBox = {
  marginTop: 24,
  padding: 22,
  borderRadius: 20,
  background: "#f8fbff",
  border: "1px solid #d9e7ff",
};
