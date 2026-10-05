"use client";
import { useEffect, useState } from "react"; import { AdminHeader } from "@/components/AdminHeader";
type Purchase = {
  id: string;
  materialTitle: string;
  amount: number;
  status: string;

  customerName?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;

  createdAt: string;
  paidAt?: string | null;
  downloadedAt?: string | null;
  downloadCount: number;
};
export default function AdminPurchasesPage() {
  const [items, setItems] = useState<Purchase[]>([]);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetch("/api/admin/purchases", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (!j.ok) {
          setMessage(j.message || "구매 내역을 불러오지 못했습니다.");
          return;
        }

        setItems(j.purchases || []);
      });
  }, []);

  const filteredItems = items.filter((item) => {
    const q = query.trim().toLowerCase();

    const matchesQuery =
      !q ||
      (item.customerName || "").toLowerCase().includes(q) ||
      (item.customerPhone || "").toLowerCase().includes(q) ||
      (item.customerEmail || "").toLowerCase().includes(q) ||
      (item.materialTitle || "").toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;

    return matchesQuery && matchesStatus;
  });
  const sortedItems = [...filteredItems].sort((a, b) => {
  const aTime = new Date(a.paidAt || a.createdAt).getTime();
  const bTime = new Date(b.paidAt || b.createdAt).getTime();

  return bTime - aTime;
});
  const today = new Date();

const isSameLocalDate = (value?: string | null) => {
  if (!value) return false;

  const date = new Date(value);

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
};

const todayPaidItems = items.filter(
  (item) => item.status === "paid" && isSameLocalDate(item.paidAt)
);

const todayPaidCount = todayPaidItems.length;

const todaySales = todayPaidItems.reduce(
  (sum, item) => sum + Number(item.amount || 0),
  0
);

const todayDownloadCount = items.filter(
  (item) => isSameLocalDate(item.downloadedAt)
).length;

const pendingCount = items.filter(
  (item) => item.status === "pending"
).length;
 return (
  <>
    <AdminHeader />

    <main className="section white">
      <div className="sectionLabel">ADMIN · PURCHASES</div>

      <h1 className="pageTitle">구매 / 다운로드 내역</h1>

      <p className="subText">
        자료 1건 20,000원 결제 요청, 결제 완료, 다운로드 기록을 확인합니다.
      </p>

      {message && <p className="loginNotice">{message}</p>}
      <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 16,
    marginTop: 24,
    marginBottom: 24,
  }}
>
  <div style={summaryCard}>
    <div style={summaryLabel}>오늘 결제완료</div>
    <div style={summaryValue}>{todayPaidCount}건</div>
  </div>

  <div style={summaryCard}>
    <div style={summaryLabel}>오늘 매출</div>
    <div style={summaryValue}>
      {todaySales.toLocaleString()}원
    </div>
  </div>

  <div style={summaryCard}>
    <div style={summaryLabel}>오늘 다운로드</div>
    <div style={summaryValue}>{todayDownloadCount}건</div>
  </div>

  <div style={summaryCard}>
    <div style={summaryLabel}>결제대기</div>
    <div style={summaryValue}>{pendingCount}건</div>
  </div>
</div>
      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          marginTop: 24,
          marginBottom: 18,
        }}
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="구매자·전화번호·이메일·자료명 검색"
          style={{
            flex: "1 1 420px",
            padding: "13px 16px",
            border: "1px solid #d7e3f4",
            borderRadius: 12,
            fontSize: 15,
          }}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            minWidth: 140,
            padding: "13px 16px",
            border: "1px solid #d7e3f4",
            borderRadius: 12,
            background: "#fff",
            fontSize: 15,
          }}
        >
          <option value="all">전체 상태</option>
          <option value="paid">결제완료</option>
          <option value="pending">결제대기</option>
        </select>
      </div>

      <div
        className="formCard"
        style={{ marginTop: 28, overflowX: "auto" }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th align="left" style={{ minWidth: 90 }}>
                구매자
              </th>
              <th align="left" style={{ minWidth: 130 }}>
                휴대전화
              </th>
              <th align="left" style={{ minWidth: 210 }}>
                이메일
              </th>
              <th align="left" style={{ minWidth: 380 }}>
                자료
              </th>
              <th align="left" style={{ minWidth: 90 }}>
                금액
              </th>
              <th align="left" style={{ minWidth: 90 }}>
                상태
              </th>
              <th align="left" style={{ minWidth: 170 }}>
                생성일
              </th>
              <th align="left" style={{ minWidth: 170 }}>
                결제일
              </th>
              <th align="left" style={{ minWidth: 110 }}>
                다운로드 횟수
              </th>
              <th align="left" style={{ minWidth: 170 }}>
                다운로드 시각
              </th>
            </tr>
          </thead>

          <tbody>
            {sortedItems.map((item) => (
              <tr
                key={item.id}
                style={{ borderTop: "1px solid #e1ecff" }}
              >
                <td style={{ padding: "12px 8px", minWidth: 90 }}>
                  {item.customerName || "-"}
                </td>

                <td style={{ minWidth: 130, whiteSpace: "nowrap" }}>
                  {item.customerPhone || "-"}
                </td>

                <td style={{ minWidth: 210, whiteSpace: "nowrap" }}>
                  {item.customerEmail || "-"}
                </td>

                <td style={{ minWidth: 380 }}>
                  {item.materialTitle}
                </td>

                <td style={{ minWidth: 90, whiteSpace: "nowrap" }}>
                  {item.amount.toLocaleString()}원
                </td>

                <td style={{ minWidth: 90, whiteSpace: "nowrap" }}>
                  {item.status === "paid"
                    ? "결제완료"
                    : item.status === "pending"
                    ? "결제대기"
                    : item.status}
                </td>

                <td style={{ minWidth: 170, whiteSpace: "nowrap" }}>
                  {new Date(item.createdAt).toLocaleString()}
                </td>

                <td style={{ minWidth: 170, whiteSpace: "nowrap" }}>
                  {item.paidAt
                    ? new Date(item.paidAt).toLocaleString()
                    : "-"}
                </td>

                <td style={{ minWidth: 110, whiteSpace: "nowrap" }}>
                  {item.downloadCount}회
                </td>

                <td style={{ minWidth: 170, whiteSpace: "nowrap" }}>
                  {item.downloadedAt
                    ? new Date(item.downloadedAt).toLocaleString()
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredItems.length === 0 && (
          <p>조건에 맞는 구매 내역이 없습니다.</p>
        )}
      </div>
    </main>
  </>
);
}
const summaryCard = {
  padding: "20px 22px",
  border: "1px solid #dce8f7",
  borderRadius: 18,
  background: "#ffffff",
};

const summaryLabel = {
  fontSize: 14,
  fontWeight: 700,
  color: "#64748b",
  marginBottom: 8,
};

const summaryValue = {
  fontSize: 26,
  fontWeight: 800,
  color: "#0f172a",
};