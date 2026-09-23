"use client";
import { useState, type FormEvent } from "react";
import { CATEGORIES } from "@/lib/minimal/catalog";
import { slugifyTitle } from "@/lib/minimal/admin-mutations";
import type { AdminCourseRow } from "@/lib/minimal/types";

export interface WizardValue {
  title: string;
  description: string;
  category: string;
  modules: string[];
  thumbnailHue: number;
}

interface CourseWizardProps {
  initial?: AdminCourseRow | null;
  onSubmit: (row: AdminCourseRow, description: string, modules: string[]) => void;
  onCancel: () => void;
}

/**
 * View C — Course creation / editing form wizard.
 * Standardized blocks with 24px vertical spacing (`space-y-6`),
 * title/description inputs, dynamic syllabus-module array
 * (add / remove / reorder), drag-and-drop uploader zone.
 */
export function CourseWizard({ initial, onSubmit, onCancel }: CourseWizardProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(initial?.category ?? "Mathematics");
  const [modules, setModules] = useState<string[]>(["Introduction", "Core concepts"]);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function addModule() {
    setModules((m) => [...m, `Module ${m.length + 1}`]);
  }

  function moveModule(index: number, delta: -1 | 1) {
    setModules((m) => {
      const next = [...m];
      const j = index + delta;
      if (j < 0 || j >= next.length) return m;
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  }

  function handleFiles(files: FileList | null) {
    if (files && files.length > 0) {
      setFileName(files[0].name);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please give the course a title.");
      return;
    }
    setError(null);
    const id = initial?.id ?? slugifyTitle(title);
    onSubmit(
      {
        id,
        title: title.trim(),
        category,
        students: initial?.students ?? 0,
        status: initial?.status ?? "Draft",
        thumbnailLabel: title.trim().slice(0, 12) || "Course",
        thumbnailHue: initial?.thumbnailHue ?? 230,
      },
      description.trim(),
      modules.map((m) => m.trim()).filter(Boolean)
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label={initial ? "Edit course" : "Create new course"}
      className="space-y-6 rounded-lg border border-hairline bg-white p-4 md:p-6"
    >
      <div>
        <h2 className="minimal-h3">{initial ? "Edit course" : "Create new course"}</h2>
        <p className="minimal-body mt-2">
          {fileName ? `Thumbnail staged: ${fileName}` : "Fill the blocks below — everything saves instantly to the table."}
        </p>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-[#FDECEC] p-4 text-[16px] text-[#B91C1C]">
          {error}
        </p>
      )}

      <div>
        <label htmlFor="wizard-title" className="mb-2 block text-[16px] font-semibold text-charcoal">
          Course title
        </label>
        <input
          id="wizard-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Grade 9 Algebra Foundations"
          className="minimal-input"
        />
      </div>

      <div>
        <label htmlFor="wizard-desc" className="mb-2 block text-[16px] font-semibold text-charcoal">
          Description
        </label>
        <textarea
          id="wizard-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Who is this for, and what will they be able to do?"
          className="minimal-input"
        />
      </div>

      <div>
        <label htmlFor="wizard-category" className="mb-2 block text-[16px] font-semibold text-charcoal">
          Category
        </label>
        <select
          id="wizard-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="minimal-input"
        >
          {CATEGORIES.filter((c) => c !== "All").map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className="mb-2 text-[16px] font-semibold text-charcoal">
          Syllabus modules ({modules.length})
        </legend>
        <ul className="space-y-2">
          {modules.map((m, i) => (
            <li key={`${i}-${m}`} className="flex items-center gap-2">
              <label htmlFor={`wizard-module-${i}`} className="sr-only">
                Module {i + 1} title
              </label>
              <input
                id={`wizard-module-${i}`}
                value={m}
                onChange={(e) =>
                  setModules((prev) => prev.map((x, j) => (j === i ? e.target.value : x)))
                }
                className="minimal-input"
              />
              <button
                type="button"
                onClick={() => moveModule(i, -1)}
                disabled={i === 0}
                aria-label={`Move module ${i + 1} up`}
                className="minimal-btn minimal-btn-ghost px-4"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveModule(i, 1)}
                disabled={i === modules.length - 1}
                aria-label={`Move module ${i + 1} down`}
                className="minimal-btn minimal-btn-ghost px-4"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => setModules((prev) => prev.filter((_, j) => j !== i))}
                aria-label={`Remove module ${i + 1}`}
                className="minimal-btn minimal-btn-ghost px-4"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
        <button type="button" onClick={addModule} className="minimal-btn minimal-btn-ghost mt-2">
          ＋ Add module
        </button>
      </fieldset>

      <div>
        <span id="wizard-upload-label" className="mb-2 block text-[16px] font-semibold text-charcoal">
          Course thumbnail
        </span>
        <div
          role="button"
          tabIndex={0}
          aria-labelledby="wizard-upload-label"
          aria-describedby="wizard-upload-hint"
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              document.getElementById("wizard-file")?.click();
            }
          }}
          className={`rounded-lg border-2 border-dashed p-8 text-center ${
            dragOver ? "border-indigoaccent bg-canvas" : "border-hairline bg-canvas"
          }`}
        >
          <p className="text-[16px] text-charcoal">
            Drag & drop an image here, or{" "}
            <label htmlFor="wizard-file" className="cursor-pointer font-semibold text-indigoaccent underline">
              browse files
            </label>
          </p>
          <p id="wizard-upload-hint" className="mt-2 text-[14px] text-mutedslate">
            PNG or JPG, 16:9 recommended. Simulated locally — no upload leaves your browser.
          </p>
          <input
            id="wizard-file"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => handleFiles(e.target.files)}
          />
          {fileName && (
            <p role="status" className="mt-2 text-[14px] font-semibold text-charcoal">
              📎 {fileName}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="submit" className="minimal-btn minimal-btn-primary">
          {initial ? "Save changes" : "Create course"}
        </button>
        <button type="button" onClick={onCancel} className="minimal-btn minimal-btn-ghost">
          Cancel
        </button>
      </div>
    </form>
  );
}
