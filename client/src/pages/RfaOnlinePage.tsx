import React, { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

type RfaStatus = "submitted" | "approved" | "approved_with_note" | "resubmit" | "not_approved";

type RfaAttachment = {
  name: string;
  type: string;
  size: number;
  dataUrl: string;
  uploadedAt: string;
};

type RfaRecord = {
  id: string;
  refNo: string;
  project: string;
  owner: string;
  contractor: string;
  date: string;
  pageNo: string;
  totalPage: string;
  functions: string[];
  requestTitle: string;
  subject: string;
  attached: string;
  reference: string;
  drawingNo: string;
  specificationRef: string;
  others: string;
  remark: string;
  contractorName: string;
  contractorPosition: string;
  contractorNote: string;
  contractorDate: string;
  contractorTime: string;
  contractorAttachments: RfaAttachment[];
  customerStatus: RfaStatus;
  customerName: string;
  customerPosition: string;
  customerNote: string;
  customerDate: string;
  customerTime: string;
  customerAttachments: RfaAttachment[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

const LOCAL_KEY = "__mdl_rfa_online__";

const defaultForm: RfaRecord = {
  id: "",
  refNo: "AWN / MDL / RFA(ICT) - 001 / 2026",
  project: "Minor Dairy Limited CCTV x64",
  owner: "MINOR DAIRY COMPANY LIMITED",
  contractor: "Advanced Wireless Network Co.,Ltd.",
  date: new Date().toISOString().slice(0, 10),
  pageNo: "1",
  totalPage: "1",
  functions: ["CCTV"],
  requestTitle: "",
  subject: "Re Design",
  attached: "New Design",
  reference: "",
  drawingNo: "",
  specificationRef: "",
  others: "",
  remark: "",
  contractorName: "ธัชชัย สิทธิสมบูรณ์",
  contractorPosition: "Project Manager",
  contractorNote: "",
  contractorDate: new Date().toISOString().slice(0, 10),
  contractorTime: new Date().toTimeString().slice(0, 5),
  contractorAttachments: [],
  customerStatus: "submitted",
  customerName: "",
  customerPosition: "",
  customerNote: "",
  customerDate: "",
  customerTime: "",
  customerAttachments: [],
  createdBy: "",
  createdAt: "",
  updatedAt: "",
};

const functionOptions = ["CCTV", "Rack", "Power", "UTP", "Fiber", "Other Equipment"];
const subjectOptions = ["Re Design", "Shop drawing", "Confirm Location"];
const attachedOptions = ["New Design", "Shop drawing", "Location Photo", "Specification", "Other"];

const dateDisplay = (value?: string) => {
  if (!value) return "-";
  const [y, m, d] = String(value).slice(0, 10).split("-");
  return y && m && d ? `${d}/${m}/${y}` : "-";
};

const statusLabel: Record<RfaStatus, string> = {
  submitted: "Waiting Approve",
  approved: "Approved",
  approved_with_note: "Approved as Note",
  resubmit: "Resubmit",
  not_approved: "Not Approved",
};

const statusClass: Record<RfaStatus, string> = {
  submitted: "bg-amber-100 text-amber-700 border-amber-200",
  approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  approved_with_note: "bg-blue-100 text-blue-700 border-blue-200",
  resubmit: "bg-orange-100 text-orange-700 border-orange-200",
  not_approved: "bg-red-100 text-red-700 border-red-200",
};

const safeText = (value: any) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const readFiles = async (files: FileList | null, maxFiles = 5): Promise<RfaAttachment[]> => {
  if (!files) return [];

  const selected = Array.from(files).slice(0, maxFiles);

  const attachments = await Promise.all(
    selected.map(
      (file) =>
        new Promise<RfaAttachment>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () =>
            resolve({
              name: file.name,
              type: file.type || "application/octet-stream",
              size: file.size,
              dataUrl: String(reader.result || ""),
              uploadedAt: new Date().toISOString(),
            });
          reader.readAsDataURL(file);
        })
    )
  );

  return attachments;
};

const downloadDataUrl = (attachment: RfaAttachment) => {
  const link = document.createElement("a");
  link.href = attachment.dataUrl;
  link.download = attachment.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
};

const buildRfaHtml = (rfa: RfaRecord, mode: "submitted" | "approved") => {
  const approvalText =
    mode === "approved"
      ? `Customer Result: ${statusLabel[rfa.customerStatus]}`
      : "Customer approval pending";

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${safeText(rfa.refNo)}</title>
  <style>
    body { margin: 0; padding: 28px; font-family: Arial, Tahoma, sans-serif; background:#f8fafc; color:#0f172a; }
    .page { max-width: 980px; margin:auto; background:white; border:1px solid #cbd5e1; padding:26px; }
    h1 { text-align:center; margin: 0 0 18px; font-size: 26px; letter-spacing:.08em; }
    table { width:100%; border-collapse:collapse; font-size:13px; }
    td, th { border:1px solid #94a3b8; padding:8px; vertical-align:top; }
    th { background:#e2e8f0; text-align:left; }
    .section { margin-top:14px; }
    .center { text-align:center; }
    .muted { color:#64748b; }
    .badge { display:inline-block; padding:6px 10px; border-radius:999px; background:#e0f2fe; color:#0369a1; font-weight:bold; }
    .sig { height:64px; }
    @media print { body { background:white; padding:0; } .page { border:none; } }
  </style>
</head>
<body>
  <div class="page">
    <h1>REQUEST FOR APPROVAL (R.F.A.)</h1>
    <table>
      <tr><th>PROJECT</th><td>${safeText(rfa.project)}</td><th>Ref. No.</th><td>${safeText(rfa.refNo)}</td></tr>
      <tr><th>OWNER</th><td>${safeText(rfa.owner)}</td><th>No. of Page</th><td>${safeText(rfa.pageNo)} / ${safeText(rfa.totalPage)}</td></tr>
      <tr><th>CONTRACTOR</th><td>${safeText(rfa.contractor)}</td><th>Date</th><td>${safeText(dateDisplay(rfa.date))}</td></tr>
      <tr><th>Function</th><td colspan="3">${rfa.functions.map(safeText).join(", ")}</td></tr>
    </table>

    <div class="section">
      <table>
        <tr><th colspan="4">(1) Contractor's Request</th></tr>
        <tr><th>Title</th><td colspan="3">${safeText(rfa.requestTitle || "-")}</td></tr>
        <tr><th>Subject</th><td>${safeText(rfa.subject)}</td><th>Attached</th><td>${safeText(rfa.attached)}</td></tr>
        <tr><th>Reference</th><td>${safeText(rfa.reference || "-")}</td><th>Drawing No.</th><td>${safeText(rfa.drawingNo || "-")}</td></tr>
        <tr><th>Specification Ref. No.</th><td>${safeText(rfa.specificationRef || "-")}</td><th>Others</th><td>${safeText(rfa.others || "-")}</td></tr>
        <tr><th>Remark</th><td colspan="3">${safeText(rfa.remark || "-")}</td></tr>
      </table>
    </div>

    <div class="section">
      <table>
        <tr><th colspan="2">(2) From Contractor</th><th colspan="2">Advanced Wireless Network Co.,Ltd.</th></tr>
        <tr><td colspan="2">For Approval / Acknowledge</td><td colspan="2" class="sig">Signature:</td></tr>
        <tr><th>Note</th><td colspan="3">${safeText(rfa.contractorNote || "-")}</td></tr>
        <tr><th>Name</th><td>${safeText(rfa.contractorName)}</td><th>Position</th><td>${safeText(rfa.contractorPosition)}</td></tr>
        <tr><th>Date</th><td>${safeText(dateDisplay(rfa.contractorDate))}</td><th>Time</th><td>${safeText(rfa.contractorTime || "-")}</td></tr>
      </table>
    </div>

    <div class="section">
      <table>
        <tr><th colspan="4">(3) From MINOR DAIRY COMPANY LIMITED</th></tr>
        <tr><td colspan="4"><span class="badge">${safeText(approvalText)}</span></td></tr>
        <tr><td colspan="4" class="sig">Signature:</td></tr>
        <tr><th>Note</th><td colspan="3">${safeText(rfa.customerNote || "-")}</td></tr>
        <tr><th>Name</th><td>${safeText(rfa.customerName || "-")}</td><th>Position</th><td>${safeText(rfa.customerPosition || "-")}</td></tr>
        <tr><th>Date</th><td>${safeText(dateDisplay(rfa.customerDate))}</td><th>Time</th><td>${safeText(rfa.customerTime || "-")}</td></tr>
      </table>
    </div>

    <p class="muted">Generated by MDL CCTV RFA Online · ${safeText(new Date().toLocaleString("th-TH"))}</p>
  </div>
</body>
</html>`;
};

const downloadRfaDocument = (rfa: RfaRecord, mode: "submitted" | "approved") => {
  const html = buildRfaHtml(rfa, mode);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const fileName = `${mode === "approved" ? "APPROVED" : "SUBMITTED"}-${rfa.refNo.replace(/[^\w-]+/g, "_")}.html`;

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const fromDb = (row: any): RfaRecord => ({
  ...defaultForm,
  id: row.id,
  refNo: row.ref_no || "",
  project: row.project || defaultForm.project,
  owner: row.owner || defaultForm.owner,
  contractor: row.contractor || defaultForm.contractor,
  date: row.rfa_date || "",
  pageNo: row.page_no || "1",
  totalPage: row.total_page || "1",
  functions: Array.isArray(row.functions) ? row.functions : [],
  requestTitle: row.request_title || "",
  subject: row.subject || "",
  attached: row.attached || "",
  reference: row.reference || "",
  drawingNo: row.drawing_no || "",
  specificationRef: row.specification_ref || "",
  others: row.others || "",
  remark: row.remark || "",
  contractorName: row.contractor_name || "",
  contractorPosition: row.contractor_position || "",
  contractorNote: row.contractor_note || "",
  contractorDate: row.contractor_date || "",
  contractorTime: row.contractor_time || "",
  contractorAttachments: Array.isArray(row.contractor_attachments) ? row.contractor_attachments : [],
  customerStatus: row.customer_status || "submitted",
  customerName: row.customer_name || "",
  customerPosition: row.customer_position || "",
  customerNote: row.customer_note || "",
  customerDate: row.customer_date || "",
  customerTime: row.customer_time || "",
  customerAttachments: Array.isArray(row.customer_attachments) ? row.customer_attachments : [],
  createdBy: row.created_by || "",
  createdAt: row.created_at || "",
  updatedAt: row.updated_at || "",
});

const toDb = (rfa: RfaRecord) => ({
  id: rfa.id,
  ref_no: rfa.refNo,
  project: rfa.project,
  owner: rfa.owner,
  contractor: rfa.contractor,
  rfa_date: rfa.date || null,
  page_no: rfa.pageNo,
  total_page: rfa.totalPage,
  functions: rfa.functions,
  request_title: rfa.requestTitle,
  subject: rfa.subject,
  attached: rfa.attached,
  reference: rfa.reference,
  drawing_no: rfa.drawingNo,
  specification_ref: rfa.specificationRef,
  others: rfa.others,
  remark: rfa.remark,
  contractor_name: rfa.contractorName,
  contractor_position: rfa.contractorPosition,
  contractor_note: rfa.contractorNote,
  contractor_date: rfa.contractorDate || null,
  contractor_time: rfa.contractorTime || null,
  contractor_attachments: rfa.contractorAttachments,
  customer_status: rfa.customerStatus,
  customer_name: rfa.customerName,
  customer_position: rfa.customerPosition,
  customer_note: rfa.customerNote,
  customer_date: rfa.customerDate || null,
  customer_time: rfa.customerTime || null,
  customer_attachments: rfa.customerAttachments,
  created_by: rfa.createdBy,
  updated_at: new Date().toISOString(),
});

const RfaOnlinePage: React.FC = () => {
  const { user } = useAuth();

  const savedUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("mdl_user") || "{}")
      : {};

  const userRole = String(user?.role || savedUser?.role || "customer").trim().toLowerCase();
  const userName = String(user?.username || savedUser?.username || "").trim();

  const canSubmit = userRole === "admin" || userRole === "newstaff";
  const canApprove = userRole === "customer";

  const [records, setRecords] = useState<RfaRecord[]>([]);
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);
  const [form, setForm] = useState<RfaRecord>({
    ...defaultForm,
    createdBy: userName || "System",
  });
  const [loading, setLoading] = useState(false);
  const [dbReady, setDbReady] = useState(true);
  const [message, setMessage] = useState("");

  const activeRecord = records.find((item) => item.id === activeRecordId) || null;

  const loadRecords = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("rfa_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setDbReady(false);
      const local = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
      setRecords(local);
    } else {
      setDbReady(true);
      setRecords((data || []).map(fromDb));
    }

    setLoading(false);
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const summary = useMemo(() => {
    const submitted = records.length;
    const approved = records.filter((r) => r.customerStatus === "approved" || r.customerStatus === "approved_with_note").length;
    const waiting = records.filter((r) => r.customerStatus === "submitted").length;
    const rejected = records.filter((r) => r.customerStatus === "resubmit" || r.customerStatus === "not_approved").length;

    return { submitted, approved, waiting, rejected };
  }, [records]);

  const saveLocal = (nextRecords: RfaRecord[]) => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(nextRecords));
    setRecords(nextRecords);
  };

  const saveRecord = async (record: RfaRecord) => {
    if (dbReady) {
      const { error } = await supabase.from("rfa_requests").upsert(toDb(record), { onConflict: "id" });

      if (error) {
        setDbReady(false);
        const existing = records.filter((r) => r.id !== record.id);
        saveLocal([record, ...existing]);
        setMessage(`Saved locally only: ${error.message}`);
        return;
      }

      await loadRecords();
      return;
    }

    const existing = records.filter((r) => r.id !== record.id);
    saveLocal([record, ...existing]);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    const now = new Date().toISOString();
    const next: RfaRecord = {
      ...form,
      id: form.id || crypto.randomUUID(),
      customerStatus: "submitted",
      createdBy: form.createdBy || userName || "System",
      createdAt: form.createdAt || now,
      updatedAt: now,
    };

    await saveRecord(next);
    setForm({
      ...defaultForm,
      createdBy: userName || "System",
      refNo: `AWN / MDL / RFA(ICT) - ${String(records.length + 2).padStart(3, "0")} / 2026`,
    });
    setMessage("Submit RFA สำเร็จ");
  };

  const handleApprove = async (status: RfaStatus) => {
    if (!canApprove || !activeRecord) return;

    const now = new Date();
    const next: RfaRecord = {
      ...activeRecord,
      customerStatus: status,
      customerName: form.customerName || activeRecord.customerName,
      customerPosition: form.customerPosition || activeRecord.customerPosition,
      customerNote: form.customerNote || activeRecord.customerNote,
      customerDate: form.customerDate || now.toISOString().slice(0, 10),
      customerTime: form.customerTime || now.toTimeString().slice(0, 5),
      customerAttachments: form.customerAttachments.length
        ? form.customerAttachments
        : activeRecord.customerAttachments,
      updatedAt: now.toISOString(),
    };

    await saveRecord(next);
    setActiveRecordId(null);
    setMessage("บันทึกผล Approve สำเร็จ");
  };

  const updateForm = (key: keyof RfaRecord, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleFunction = (name: string) => {
    setForm((prev) => {
      const exists = prev.functions.includes(name);
      return {
        ...prev,
        functions: exists
          ? prev.functions.filter((item) => item !== name)
          : [...prev.functions, name],
      };
    });
  };

  const openApprove = (rfa: RfaRecord) => {
    setActiveRecordId(rfa.id);
    setForm({
      ...defaultForm,
      customerName: rfa.customerName || "",
      customerPosition: rfa.customerPosition || "",
      customerNote: rfa.customerNote || "",
      customerDate: rfa.customerDate || new Date().toISOString().slice(0, 10),
      customerTime: rfa.customerTime || new Date().toTimeString().slice(0, 5),
      customerAttachments: rfa.customerAttachments || [],
    });
  };

  const waitingRecords = records.filter((item) => item.customerStatus === "submitted");
  const approvedRecords = records.filter(
    (item) => item.customerStatus === "approved" || item.customerStatus === "approved_with_note"
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-black">MDL CCTV RFA Online</h1>
            <p className="text-sm text-slate-500">
              Request for Approval workflow · Submit · Customer Approve · Approved Archive
            </p>
            {!dbReady && (
              <p className="mt-1 text-xs font-bold text-amber-600">
                Supabase table not ready. System is using local browser storage.
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-black uppercase text-slate-600">
              {userName || "Guest"} · {userRole}
            </span>

            <Link
              href="/dashboard"
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-black text-white shadow hover:bg-blue-500"
            >
              ← Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="space-y-5 p-5">
        {message && (
          <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700">
            {message}
          </div>
        )}

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-sky-50 p-5 shadow-sm">
            <div className="text-xs font-black uppercase text-blue-700">Submit RFA</div>
            <div className="mt-2 text-4xl font-black text-blue-700">{summary.submitted}</div>
            <div className="mt-1 text-sm text-slate-500">เอกสารที่ Submit แล้ว</div>
          </div>

          <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-50 p-5 shadow-sm">
            <div className="text-xs font-black uppercase text-emerald-700">Approved RFA</div>
            <div className="mt-2 text-4xl font-black text-emerald-700">{summary.approved}</div>
            <div className="mt-1 text-sm text-slate-500">เอกสารที่ Approve แล้ว</div>
          </div>

          <div className="rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50 to-yellow-50 p-5 shadow-sm">
            <div className="text-xs font-black uppercase text-amber-700">Waiting Approve</div>
            <div className="mt-2 text-4xl font-black text-amber-700">{summary.waiting}</div>
            <div className="mt-1 text-sm text-slate-500">เอกสารที่รอ Customer Approve</div>
          </div>

          <div className="rounded-3xl border border-red-100 bg-gradient-to-br from-red-50 to-rose-50 p-5 shadow-sm">
            <div className="text-xs font-black uppercase text-red-700">Need Revise</div>
            <div className="mt-2 text-4xl font-black text-red-700">{summary.rejected}</div>
            <div className="mt-1 text-sm text-slate-500">Resubmit / Not Approved</div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black">Submit RFA Online</h2>
                <p className="text-sm text-slate-500">
                  สำหรับ Admin / New Staff เพื่อกรอกและ Submit เอกสาร RFA พร้อมแนบไฟล์ได้ 5 ไฟล์
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-black ${canSubmit ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                {canSubmit ? "Can Submit" : "View Only"}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className="text-sm font-bold">
                Ref. No.
                <input value={form.refNo} disabled={!canSubmit} onChange={(e) => updateForm("refNo", e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
              </label>

              <label className="text-sm font-bold">
                Date
                <input type="date" value={form.date} disabled={!canSubmit} onChange={(e) => updateForm("date", e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
              </label>

              <label className="text-sm font-bold md:col-span-2">
                Project
                <input value={form.project} disabled={!canSubmit} onChange={(e) => updateForm("project", e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
              </label>

              <label className="text-sm font-bold">
                Owner
                <input value={form.owner} disabled={!canSubmit} onChange={(e) => updateForm("owner", e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
              </label>

              <label className="text-sm font-bold">
                Contractor
                <input value={form.contractor} disabled={!canSubmit} onChange={(e) => updateForm("contractor", e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
              </label>

              <label className="text-sm font-bold">
                Page
                <input value={form.pageNo} disabled={!canSubmit} onChange={(e) => updateForm("pageNo", e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
              </label>

              <label className="text-sm font-bold">
                Total Page
                <input value={form.totalPage} disabled={!canSubmit} onChange={(e) => updateForm("totalPage", e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
              </label>
            </div>

            <div className="mt-4">
              <div className="text-sm font-black">Function</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {functionOptions.map((item) => (
                  <label key={item} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black">
                    <input
                      type="checkbox"
                      disabled={!canSubmit}
                      checked={form.functions.includes(item)}
                      onChange={() => toggleFunction(item)}
                      className="mr-2"
                    />
                    {item}
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className="text-sm font-bold md:col-span-2">
                Contractor's Request Title
                <input value={form.requestTitle} disabled={!canSubmit} onChange={(e) => updateForm("requestTitle", e.target.value)} placeholder="เช่น Request approval for CCTV installation drawing" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
              </label>

              <label className="text-sm font-bold">
                Subject
                <select value={form.subject} disabled={!canSubmit} onChange={(e) => updateForm("subject", e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2">
                  {subjectOptions.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>

              <label className="text-sm font-bold">
                Attached
                <select value={form.attached} disabled={!canSubmit} onChange={(e) => updateForm("attached", e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2">
                  {attachedOptions.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>

              <label className="text-sm font-bold">
                Reference
                <input value={form.reference} disabled={!canSubmit} onChange={(e) => updateForm("reference", e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
              </label>

              <label className="text-sm font-bold">
                Drawing No.
                <input value={form.drawingNo} disabled={!canSubmit} onChange={(e) => updateForm("drawingNo", e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
              </label>

              <label className="text-sm font-bold">
                Specification Ref. No.
                <input value={form.specificationRef} disabled={!canSubmit} onChange={(e) => updateForm("specificationRef", e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
              </label>

              <label className="text-sm font-bold">
                Others
                <input value={form.others} disabled={!canSubmit} onChange={(e) => updateForm("others", e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
              </label>

              <label className="text-sm font-bold md:col-span-2">
                Remark
                <textarea value={form.remark} disabled={!canSubmit} onChange={(e) => updateForm("remark", e.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
              </label>

              <label className="text-sm font-bold">
                Contractor Name
                <input value={form.contractorName} disabled={!canSubmit} onChange={(e) => updateForm("contractorName", e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
              </label>

              <label className="text-sm font-bold">
                Position
                <input value={form.contractorPosition} disabled={!canSubmit} onChange={(e) => updateForm("contractorPosition", e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
              </label>

              <label className="text-sm font-bold md:col-span-2">
                Contractor Note
                <textarea value={form.contractorNote} disabled={!canSubmit} onChange={(e) => updateForm("contractorNote", e.target.value)} rows={2} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
              </label>
            </div>

            <div className="mt-4 rounded-2xl border border-dashed border-blue-200 bg-blue-50 p-4">
              <div className="font-black text-blue-700">Attach Files ({form.contractorAttachments.length}/5)</div>
              <input
                type="file"
                disabled={!canSubmit}
                multiple
                onChange={async (e) => updateForm("contractorAttachments", await readFiles(e.target.files, 5))}
                className="mt-2 block w-full text-sm"
              />
              <div className="mt-2 space-y-1">
                {form.contractorAttachments.map((file, index) => (
                  <button key={index} type="button" onClick={() => downloadDataUrl(file)} className="block text-left text-xs font-bold text-blue-700 underline">
                    {index + 1}. {file.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              disabled={!canSubmit || loading}
              onClick={handleSubmit}
              className="mt-5 w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow hover:bg-blue-500 disabled:bg-slate-300"
            >
              Submit RFA Online
            </button>
          </div>

          <div className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black">Approve RFA</h2>
                  <p className="text-sm text-slate-500">
                    สำหรับ Customer เพื่อเปิดดูเอกสาร ดาวน์โหลดไปเซ็น และ Approve พร้อมแนบไฟล์ได้ 5 ไฟล์
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-black ${canApprove ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                  {canApprove ? "Can Approve" : "View Only"}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {waitingRecords.length === 0 ? (
                  <div className="rounded-2xl bg-slate-50 p-5 text-center text-sm font-bold text-slate-500">
                    ไม่มีเอกสารรอ Approve
                  </div>
                ) : (
                  waitingRecords.map((rfa) => (
                    <div key={rfa.id} className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="font-black text-slate-900">{rfa.refNo}</div>
                          <div className="text-xs text-slate-500">
                            {rfa.requestTitle || rfa.subject} · Submit {dateDisplay(rfa.date)}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => downloadRfaDocument(rfa, "submitted")} className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-black text-white">
                            Download Submit
                          </button>
                          <button onClick={() => openApprove(rfa)} className="rounded-xl bg-amber-600 px-3 py-2 text-xs font-black text-white">
                            Open Approve
                          </button>
                        </div>
                      </div>

                      {rfa.contractorAttachments.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {rfa.contractorAttachments.map((file, index) => (
                            <button key={index} onClick={() => downloadDataUrl(file)} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-blue-700 underline">
                              {file.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {activeRecord && (
                <div className="mt-5 rounded-3xl border border-blue-100 bg-blue-50 p-4">
                  <h3 className="font-black text-blue-800">Approve: {activeRecord.refNo}</h3>

                  <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                    <label className="text-sm font-bold">
                      Customer Name
                      <input value={form.customerName} disabled={!canApprove} onChange={(e) => updateForm("customerName", e.target.value)} className="mt-1 w-full rounded-xl border border-blue-200 px-3 py-2" />
                    </label>

                    <label className="text-sm font-bold">
                      Position
                      <input value={form.customerPosition} disabled={!canApprove} onChange={(e) => updateForm("customerPosition", e.target.value)} className="mt-1 w-full rounded-xl border border-blue-200 px-3 py-2" />
                    </label>

                    <label className="text-sm font-bold">
                      Date
                      <input type="date" value={form.customerDate} disabled={!canApprove} onChange={(e) => updateForm("customerDate", e.target.value)} className="mt-1 w-full rounded-xl border border-blue-200 px-3 py-2" />
                    </label>

                    <label className="text-sm font-bold">
                      Time
                      <input type="time" value={form.customerTime} disabled={!canApprove} onChange={(e) => updateForm("customerTime", e.target.value)} className="mt-1 w-full rounded-xl border border-blue-200 px-3 py-2" />
                    </label>

                    <label className="text-sm font-bold md:col-span-2">
                      Customer Note
                      <textarea value={form.customerNote} disabled={!canApprove} onChange={(e) => updateForm("customerNote", e.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-blue-200 px-3 py-2" />
                    </label>
                  </div>

                  <div className="mt-4 rounded-2xl border border-dashed border-blue-300 bg-white p-4">
                    <div className="font-black text-blue-700">Approved Attach Files ({form.customerAttachments.length}/5)</div>
                    <input
                      type="file"
                      disabled={!canApprove}
                      multiple
                      onChange={async (e) => updateForm("customerAttachments", await readFiles(e.target.files, 5))}
                      className="mt-2 block w-full text-sm"
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
                    <button disabled={!canApprove} onClick={() => handleApprove("approved")} className="rounded-xl bg-emerald-600 px-3 py-3 text-xs font-black text-white disabled:bg-slate-300">
                      Approved
                    </button>
                    <button disabled={!canApprove} onClick={() => handleApprove("approved_with_note")} className="rounded-xl bg-blue-600 px-3 py-3 text-xs font-black text-white disabled:bg-slate-300">
                      Approved as Note
                    </button>
                    <button disabled={!canApprove} onClick={() => handleApprove("resubmit")} className="rounded-xl bg-orange-600 px-3 py-3 text-xs font-black text-white disabled:bg-slate-300">
                      Resubmit
                    </button>
                    <button disabled={!canApprove} onClick={() => handleApprove("not_approved")} className="rounded-xl bg-red-600 px-3 py-3 text-xs font-black text-white disabled:bg-slate-300">
                      Not Approved
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl">
              <h2 className="text-xl font-black">Approved Archive</h2>
              <p className="text-sm text-slate-500">
                กล่องเก็บเอกสารที่ Approve แล้ว พร้อมไฟล์แนบ และปุ่ม Download
              </p>

              <div className="mt-4 space-y-3">
                {approvedRecords.length === 0 ? (
                  <div className="rounded-2xl bg-slate-50 p-5 text-center text-sm font-bold text-slate-500">
                    ยังไม่มีเอกสารที่ Approve แล้ว
                  </div>
                ) : (
                  approvedRecords.map((rfa) => (
                    <div key={rfa.id} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="font-black">{rfa.refNo}</div>
                          <div className="text-xs text-slate-500">
                            {rfa.customerName || "Customer"} · {dateDisplay(rfa.customerDate)}
                          </div>
                          <span className={`mt-2 inline-block rounded-full border px-3 py-1 text-xs font-black ${statusClass[rfa.customerStatus]}`}>
                            {statusLabel[rfa.customerStatus]}
                          </span>
                        </div>

                        <button onClick={() => downloadRfaDocument(rfa, "approved")} className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white">
                          Download Approved
                        </button>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {[...rfa.contractorAttachments, ...rfa.customerAttachments].map((file, index) => (
                          <button key={index} onClick={() => downloadDataUrl(file)} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-blue-700 underline">
                            {file.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default RfaOnlinePage;
