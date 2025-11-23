import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

const bucketName = import.meta.env.VITE_SUPABASE_BUCKET || "files";

export default function App() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle"); // idle | success | error
  const [filesList, setFilesList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  async function fetchFiles() {
    setLoadingList(true);
    setMessage("");
    setStatus("idle");

    const { data, error } = await supabase.storage.from(bucketName).list("", {
      limit: 100,
      offset: 0,
      sortBy: { column: "name", order: "asc" },
    });

    if (error) {
      console.error("Fetch files error:", error);
      setStatus("error");
      setMessage(
        `خطأ في جلب قائمة الملفات من Supabase: ${error.message || ""}`
      );
    } else {
      setFilesList(data || []);
    }

    setLoadingList(false);
  }

  async function handleUpload(e) {
    e.preventDefault();
    setMessage("");
    setStatus("idle");

    if (!file) {
      setStatus("error");
      setMessage("الرجاء اختيار ملف أولاً.");
      return;
    }

    try {
      setUploading(true);

      const safeName = file.name.replace(/\s+/g, "_");
      const fileName = `${Date.now()}_${safeName}`;
      const filePath = fileName;

      const { error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Upload error:", error);
        setStatus("error");
        setMessage(`حدث خطأ أثناء رفع الملف: ${error.message || ""}`);
      } else {
        setStatus("success");
        setMessage("تم رفع الملف بنجاح ✅");
        setFile(null);
        await fetchFiles();
      }
    } catch (err) {
      console.error("Unexpected upload error:", err);
      setStatus("error");
      setMessage("حدث خطأ غير متوقع أثناء رفع الملف.");
    } finally {
      setUploading(false);
    }
  }

  function getPublicUrl(path) {
    const { data } = supabase.storage.from(bucketName).getPublicUrl(path);
    return data.publicUrl;
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <div className="logo-circle">📁</div>
          <div className="header-text">
            <h1>Cloud Storage</h1>
            <span>لوحة بسيطة لرفع وإدارة الملفات السحابية</span>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="app-card">
          {/* عمود الرفع */}
          <section className="upload-column">
            <h2>رفع ملف جديد</h2>
            <p className="hint">
              اختر ملفاً من جهازك ليتم رفعه إلى مساحة التخزين.
            </p>

            <form className="upload-form" onSubmit={handleUpload}>
              <label className="file-input-label">
                <span>الملف</span>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0] || null)}
                  />
                </div>
              </label>

              <button type="submit" disabled={uploading}>
                {uploading ? "جارٍ الرفع..." : "رفع الملف"}
              </button>
            </form>

            {message && (
              <p
                className={
                  "message " +
                  (status === "error"
                    ? "message-error"
                    : status === "success"
                    ? "message-success"
                    : "")
                }
              >
                {message}
              </p>
            )}
          </section>

          {/* عمود الملفات */}
          <section className="files-column">
            <div className="files-header">
              <h2>الملفات المرفوعة</h2>
              <button
                type="button"
                className="ghost-btn"
                onClick={fetchFiles}
                disabled={loadingList}
              >
                تحديث
              </button>
            </div>

            {loadingList ? (
              <p className="hint">جاري تحميل القائمة...</p>
            ) : filesList.length === 0 ? (
              <p className="hint">لا توجد ملفات بعد.</p>
            ) : (
              <ul className="files-list">
                {filesList.map((item) => (
                  <li key={item.name} className="file-row">
                    <div className="file-main">
                      <div className="file-icon">📄</div>
                      <div className="file-info">
                        <span className="file-name">{item.name}</span>
                        {item.updated_at && (
                          <span className="file-meta">
                            آخر تعديل:{" "}
                            {new Date(item.updated_at).toLocaleString("ar-SA")}
                          </span>
                        )}
                      </div>
                    </div>
                    <a
                      className="file-link"
                      href={getPublicUrl(item.name)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      فتح / تحميل
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
