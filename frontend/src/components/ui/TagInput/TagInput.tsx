"use client";
import { useId, useState } from "react";
import scss from "./TagInput.module.scss";

type TagInputProps = {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions: string[];
  max?: number;
  placeholder?: string;
  label?: string; // для счётчика и aria: "skills", "roles"
};

// Выбранные значения в виде тегов с × + поле ввода с подсказками; можно ввести и своё
const TagInput = ({
  value,
  onChange,
  suggestions,
  max = 15,
  placeholder = "Type to search...",
  label = "items",
}: TagInputProps) => {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const listId = useId();

  const q = query.trim().toLowerCase();
  // Все подходящие варианты — список прокручивается (стили .suggestions)
  const matches = suggestions.filter((s) => !value.includes(s) && (!q || s.toLowerCase().includes(q)));

  const add = (skill: string) => {
    const clean = skill.trim();
    if (!clean || value.includes(clean) || value.length >= max) return;
    onChange([...value, clean]);
    setQuery("");
  };

  const remove = (skill: string) => onChange(value.filter((s) => s !== skill));

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // Enter добавляет первую подсказку или то, что введено
      add(matches[0] ?? query);
    }
    if (e.key === "Backspace" && !query && value.length) remove(value[value.length - 1]);
  };

  return (
    <div>
      <div className={scss.anchor}>
        <div className={scss.box}>
          {value.map((skill) => (
            <span key={skill} className={scss.tag}>
              {skill}
              <button type="button" onClick={() => remove(skill)} aria-label={`Remove ${skill}`}>
                ×
              </button>
            </span>
          ))}
          {value.length < max && (
            <input
              className={scss.input}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={value.length ? "Add more..." : placeholder}
              aria-controls={listId}
              aria-label={`Add ${label}`}
            />
          )}
        </div>

        {focused && matches.length > 0 && (
          <ul className={scss.suggestions} id={listId} role="listbox">
            {matches.map((s) => (
              <li key={s}>
                {/* onMouseDown, чтобы клик сработал раньше, чем blur у поля */}
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    add(s);
                  }}
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className={scss.counter}>
        {value.length}/{max} {label} · Press Enter to add
      </p>
    </div>
  );
};

export default TagInput;
