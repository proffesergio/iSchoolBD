import { CLASS_LEVELS } from "@/lib/minimal/catalog";

interface HeroProps {
  activeLevel: string;
  onSelectLevel: (level: string) => void;
  resultCount: number;
}

/**
 * View A — Hero / header section. Single column, high-contrast type,
 * plus quick-access breadcrumbs for class levels.
 */
export function Hero({ activeLevel, onSelectLevel, resultCount }: HeroProps) {
  return (
    <section aria-labelledby="browse-heading" className="bg-white">
      <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-6 md:py-12">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-mutedslate">
          Student dashboard
        </p>
        <h1 id="browse-heading" className="minimal-h1 mt-2 max-w-[24ch]">
          What will you learn today?
        </h1>
        <p className="minimal-body mt-2 max-w-[60ch]">
          Structured courses by class level — pick a level, search a topic, and
          continue where you left off. {resultCount} courses available.
        </p>
        <nav aria-label="Class levels" className="mt-4">
          <ol className="flex flex-wrap gap-2">
            <li>
              <button
                type="button"
                onClick={() => onSelectLevel("All levels")}
                aria-current={activeLevel === "All levels" ? "true" : undefined}
                className={`minimal-btn ${
                  activeLevel === "All levels" ? "minimal-btn-primary" : "minimal-btn-ghost"
                }`}
              >
                All levels
              </button>
            </li>
            {CLASS_LEVELS.map((level) => (
              <li key={level}>
                <button
                  type="button"
                  onClick={() => onSelectLevel(level)}
                  aria-current={activeLevel === level ? "true" : undefined}
                  className={`minimal-crumb minimal-btn ${
                    activeLevel === level ? "minimal-btn-primary" : "minimal-btn-ghost"
                  }`}
                >
                  {level}
                </button>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </section>
  );
}
