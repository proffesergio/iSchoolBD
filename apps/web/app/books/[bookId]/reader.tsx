"use client";
import { useEffect, useState } from "react";
import { getTrack } from "@/lib/tracks";
import { NCTB_CLASS1_BN, NCTB_PATHS } from "@/lib/nctb-class1-bn";
import { bookPreviewUrl, getBook, resolveBooks, type BookDef } from "@/lib/books";
import { publicApi } from "@/lib/admin-client";
import { TrackSheet } from "@/components/features/TrackSheet";

/**
 * Generic book reader: Drive PDF stage + (where mapped) পাঠ index + practice.
 * Admin uploads merge over official slots, so class 4–5 books light up
 * the moment their PDFs land — no code changes.
 */
export function BookReader({ bookId }: { bookId: string }) {
  const [practice, setPractice] = useState(false);
  const [book, setBook] = useState<(BookDef & { custom: boolean }) | null>(() => {
    const o = getBook(bookId);
    return o ? { ...o, custom: false } : null;
  });

  useEffect(() => {
    publicApi
      .customBooks()
      .then((custom) => {
        const hit = resolveBooks().find((x) => x.id === bookId);
        const over = custom.find((c) => c.id === bookId);
        if (hit && over) {
          setBook({
            ...hit,
            titleBn: over.titleBn || hit.titleBn,
            titleEn: over.titleEn || hit.titleEn,
            driveFileId: over.driveFileId || hit.driveFileId,
            custom: true,
          });
        }
      })
      .catch(() => undefined);
  }, [bookId]);

  if (!book) return <p>বই পাওয়া যায়নি।</p>;
  const track = bookId === "nctb-1-bn" ? getTrack("nctb-1-bn-path") : undefined;
  const done = NCTB_PATHS.filter((x) => x.v === 2).length;

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "14px 14px 110px" }}>
      <h1>{book.emoji} {book.titleBn}</h1>
      <p style={{ opacity: 0.75 }}>
        {book.titleEn}
        {bookId === "nctb-1-bn" && <> · {NCTB_PATHS.length} পাঠ · {done} পাঠ যাচাইকৃত ✅</>}
      </p>
      {!book.driveFileId ? (
        <div className="sheet" style={{ textAlign: "left" }}>
          <h3>📥 PDF আসছে</h3>
          <p style={{ opacity: 0.75 }}>এই বইয়ের PDF এখনো যোগ হয়নি — অ্যাডমিন প্যানেল → Books থেকে লিংক দিলেই এখানে খুলবে।</p>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {track && (
              <button className="btn primary" onClick={() => setPractice(true)}>🎮 অনুশীলন করি</button>
            )}
            <a className="btn ghost" style={{ textDecoration: "none" }} href={bookPreviewUrl(book.driveFileId)} target="_blank" rel="noreferrer">
              ⛶ ফুলস্ক্রিন বই
            </a>
          </div>
          <div className="bookreader">
            {bookId === "nctb-1-bn" ? (
              <ol className="playlist" aria-label="পাঠ index">
                {NCTB_PATHS.map((x) => (
                  <li key={x.no}>
                    <div className="lecture" style={{ cursor: "default" }}>
                      <span className="lecture-dur">পাঠ {x.no}</span>
                      <span className="lecture-title">
                        {x.title}
                        <small style={{ display: "block", opacity: 0.65 }}>
                          {x.page ? `পৃষ্ঠা ${x.page}` : "পৃষ্ঠা যাচাই চলছে"}
                          {x.v === 2 ? " · ✅" : " · ⏳"}
                        </small>
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="sheet" style={{ textAlign: "left" }}>
                <h3>⏳ সূচি যাচাই চলছে</h3>
                <p style={{ opacity: 0.75 }}>
                  এই বইয়ের পাঠ-তালিকা ও কুইজ পরের ব্যাচে আসছে। আপাতত ওপরে PDF পড়ো —
                  {NCTB_CLASS1_BN.titleBn}-এর মতো মানচিত্র + অনুশীলন পাবে।
                </p>
              </div>
            )}
            <div className="bookstage">
              <iframe
                src={bookPreviewUrl(book.driveFileId)}
                title={`${book.titleBn} PDF`}
                allowFullScreen
              />
              <p style={{ opacity: 0.7, fontSize: 13 }}>
                💡 পড়ার সময় ডেটা বাঁচাতে WiFi-তে আগে লোড করে রাখো। পাতা উল্টাতে বইয়ের ভেতরে স্ক্রল করো।
              </p>
            </div>
          </div>
        </>
      )}
      {practice && track && (
        <div className="fullscreen" role="dialog" aria-modal="true">
          <div style={{ width: "min(640px, 100%)" }} onClick={(e) => e.stopPropagation()}>
            <TrackSheet track={track} onClose={() => setPractice(false)} />
          </div>
        </div>
      )}
    </main>
  );
}
