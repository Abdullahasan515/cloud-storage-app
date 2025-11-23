import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

const bucketName = import.meta.env.VITE_SUPABASE_BUCKET || "files";

export default function App() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [filesList, setFilesList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  async function fetchFiles() {
    setLoadingList(true);
    setMessage("");
    const { data, error } = await supabase.storage.from(bucketName).list("", {
      limit: 100,
      offset: 0,
      sortBy: { column: "name", order: "asc" },
    });

    if (error) {
      console.error(error);
      setMessage("خطأ في جلب قائمة الملفات.");
    } else {
      setFilesList(data || []);
    }
    setLoadingList(false);
  }

  async function handleUpload(e) {
    e.preventDefault();
    setMessage("");

    if (!file) {
      setMessage("الرجاء اختيار ملف أولاً.");
      return;
    }

    try {
      setUploading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (error) {
        console.error(error);
        setMessage("حدث خطأ أثناء رفع الملف.");
      } else {
        setMessage("تم رفع الملف بنجاح ✅");
        setFile(null);
        await fetchFiles();
      }
    } catch (err) {
      console.error(err);
      setMessage("حدث خطأ غير متوقع.");
    } finally {
      setUploading(false);
    }
  }

  function getPublicUrl(path) {
    const { data } = supabase.storage.from(bucketName).getPublicUrl(path);
    return data.publicUrl;
  }

  return (
    <div className="app">
      <h1>Cloud Storage App</h1>
      <p className="subtitle">
        مثال بسيط لرفع الملفات إلى Supabase Storage وعرضها.
      </p>

      <form className="upload-form" onSubmit={handleUpload}>
        <label className="file-input-label">
          اختر ملفاً للرفع:
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0] || null)}
          />
        </label>

        <button type="submit" disabled={uploading}>
          {uploading ? "جاري الرفع..." : "رفع الملف"}
        </button>
      </form>

      {message && <p className="message">{message}</p>}

      <section className="files-section">
        <h2>الملفات المرفوعة</h2>
        {loadingList ? (
          <p>جاري تحميل القائمة...</p>
        ) : filesList.length === 0 ? (
          <p>لا توجد ملفات بعد.</p>
        ) : (
          <ul className="files-list">
            {filesList.map((item) => (
              <li key={item.name}>
                <span>{item.name}</span>
                <a href={getPublicUrl(item.name)} target="_blank" rel="noreferrer">
                  فتح / تحميل
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
