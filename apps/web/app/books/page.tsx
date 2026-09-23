"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { OFFICIAL_BOOKS, SUBJECT_DISPLAY, resolveBooks } from "@/lib/books";
import { publicApi, type CustomBookRow } from "@/lib/admin-client";

const CLASS_BN: Record<string, string> = {
  "class-1": "১ম শ্রেণি",
  "class-2": "২য় শ্রেণি",
  "class-3": "৩য় শ্রেণি",
  "class-4": "৪র্থ শ্রেণি",
  "class-5": "৫ম শ্রেণি",
};

/** Primary-level library: official NCTB names, admin uploads merged in. */
export default function BooksPage() {
  const [custom, setCustom] = useState<CustomBookRow[]>([]);

  useEffect(() => {
    publicApi.customBooks().then(setCustom).catch(() => undefined);
  }, []);

  const merged = resolveBooks(OFFICIAL_BOOKS, custom);
  const extras = custom.filter((c) => !OFFICIAL_BOOKS.some((o) => o.id === c.id));
  const classes = ["class-1", "class-2", "class-3", "class-4", "class-5"];

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "14px 14px 110px" }}>
      <h1>📚 পাঠ্যবই</h1>
      <p style={{ opacity: 0.75 }}>আসল NCTB বই ডিভাইসে পড়ো — প্রাথমিক স্তর (১ম–৫ম শ্রেণি)। 📖</p>
      {classes.map((cls) => {
        const books = merged.filter((x) => x.classId === cls);
        if (books.length === 0) return null;
        const ready = books.filter((x) => x.driveFileId).length;
        return (
          <section key={cls}>
            <h2>{CLASS_BN[cls]} <small style={{ opacity: 0.6 }}>({ready}/{books.length} ready)</small></h2>
            <div className="grid" style={{ padding: 0 }}>
              {books.map((x) => {
                const inner = (
                  <>
                    {x.emoji}
                    <small style={{ fontSize: 18, fontWeight: 900 }}>{x.titleBn}</small>
                    <small style={{ fontSize: 12, opacity: 0.7 }}>{SUBJECT_DISPLAY[x.subject]?.en ?? x.subject}</small>
                    <small style={{ fontSize: 12, opacity: 0.7 }}>
                      {!x.driveFileId ? "📥 শীঘ্রই" : x.mapped ? "✅ মানচিত্র" : x.custom ? "✅ আপলোড" : "⏳"}
                    </small>
                  </>
                );
                return x.driveFileId ? (
                  <Link key={x.id} href={`/books/${x.id}`} className="card" style={{ textDecoration: "none", color: "inherit", fontSize: 36 }}>
                    {inner}
                  </Link>
                ) : (
                  <div key={x.id} className="card" style={{ fontSize: 36, opacity: 0.55 }}>
                    {inner}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
      {extras.length > 0 && (
        <section>
          <h2>📎 গাইড ও অতিরিক্ত</h2>
          <div className="grid" style={{ padding: 0 }}>
            {extras.map((x) => (
              <a
                key={x.id}
                href={`https://drive.google.com/file/d/${x.driveFileId}/preview`}
                target="_blank"
                rel="noreferrer"
                className="card"
                style={{ textDecoration: "none", color: "inherit", fontSize: 36 }}
              >
                📎
                <small style={{ fontSize: 18, fontWeight: 900 }}>{x.titleBn}</small>
                <small style={{ fontSize: 12, opacity: 0.7 }}>{x.titleEn}</small>
              </a>
            ))}
          </div>
        </section>
      )}
      <p style={{ opacity: 0.7 }}>🔗 PDF সরাসরি Google Drive থেকে আসে — ডেটা সেভিংসের জন্য WiFi-তে পড়ো।</p>
    </main>
  );
}
