/**
 * Zero-dependency validator for iSchool AI Engine responses.
 * Keeps free-tier edge functions light. Mirrors ischool.schema.json.
 */

const TIERS = new Set(["tier_1", "tier_2", "tier_3"]);
const UI_TYPES = new Set(["talking_letter", "quiz_screen", "socratic_hint", "dashboard_reward"]);
const ANIMATIONS = new Set(["success_sparkle", "shake_error", "bounce_idle", "pop_expand", "confetti_burst"]);
const QUESTION_TYPES = new Set(["multiple_choice", "word_rearrange", "phonetic_matching", "fill_in_the_blanks"]);

export function validateResponse(payload) {
  const errors = [];
  const req = (cond, msg) => { if (!cond) errors.push(msg); };

  if (!payload || typeof payload !== "object") return { valid: false, errors: ["payload must be an object"] };

  const m = payload.module_metadata;
  req(m && typeof m === "object", "module_metadata required");
  if (m) {
    req(TIERS.has(m.tier), `module_metadata.tier must be one of tier_1|tier_2|tier_3 (got ${m.tier})`);
    req(typeof m.topic === "string" && m.topic.length > 0, "module_metadata.topic required");
    req(Number.isInteger(m.progress_percentage) && m.progress_percentage >= 0 && m.progress_percentage <= 100,
      "module_metadata.progress_percentage must be 0-100 int");
  }

  const ui = payload.ui_component;
  req(ui && typeof ui === "object", "ui_component required");
  if (ui) {
    req(UI_TYPES.has(ui.type), `ui_component.type invalid (got ${ui.type})`);
    const v = ui.visual_elements;
    req(v && typeof v === "object", "ui_component.visual_elements required");
    if (v) {
      req(typeof v.character_avatar === "string" && v.character_avatar.length > 0, "visual_elements.character_avatar required");
      req(typeof v.background_theme === "string" && v.background_theme.length > 0, "visual_elements.background_theme required");
      req(ANIMATIONS.has(v.animation_trigger), `visual_elements.animation_trigger invalid (got ${v.animation_trigger})`);
    }
  }

  const c = payload.content;
  req(c && typeof c === "object", "content required");
  if (c) {
    req(typeof c.instruction_text === "string" && c.instruction_text.length > 0, "content.instruction_text required");
    if (c.instruction_text && c.instruction_text.length > 500) errors.push("content.instruction_text > 500 chars (token budget)");
    if (c.challenge) {
      const ch = c.challenge;
      req(QUESTION_TYPES.has(ch.question_type), `challenge.question_type invalid (got ${ch.question_type})`);
      req(typeof ch.question_body === "string" && ch.question_body.length > 0, "challenge.question_body required");
      req(Array.isArray(ch.options) && ch.options.length >= 2 && ch.options.length <= 6, "challenge.options must have 2-6 items");
      req(Number.isInteger(ch.correct_answer_index) && ch.correct_answer_index >= 0 && ch.correct_answer_index < (ch.options?.length ?? 0),
        "challenge.correct_answer_index out of range");
    }
  }

  const g = payload.gamification;
  req(g && typeof g === "object", "gamification required");
  if (g) {
    req(Number.isInteger(g.xp_reward) && g.xp_reward >= 0 && g.xp_reward <= 500, "gamification.xp_reward 0-500");
    req(typeof g.streak_multiplier === "number" && g.streak_multiplier >= 1.0 && g.streak_multiplier <= 5.0,
      "gamification.streak_multiplier 1.0-5.0");
    req(g.feedback_message && typeof g.feedback_message.on_success === "string", "gamification.feedback_message.on_success required");
    req(g.feedback_message && typeof g.feedback_message.on_failure === "string", "gamification.feedback_message.on_failure required");
  }

  return { valid: errors.length === 0, errors };
}

export function assertValid(payload) {
  const r = validateResponse(payload);
  if (!r.valid) throw new Error("Invalid iSchool payload: " + r.errors.join("; "));
  return payload;
}
