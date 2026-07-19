#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import generate_missing_words as generator


APP_DIR = Path(__file__).resolve().parents[1]
CONTENT_DIR = APP_DIR / "content" / "curriculum"
DEFAULT_REPORT = APP_DIR / "docs" / "word-validation-report.md"


@dataclass(frozen=True)
class LangSpec:
    surface_field: str
    example_field: str
    required_fields: set[str]
    optional_fields: set[str]


LANG_SPECS: dict[str, LangSpec] = {
    "es": LangSpec(
        surface_field="spanish",
        example_field="exampleEs",
        required_fields={"rank", "spanish", "english", "partOfSpeech", "exampleEs", "exampleEn", "group", "topic"},
        optional_fields={"pronunciation", "gender"},
    ),
    "zh": LangSpec(
        surface_field="chinese",
        example_field="exampleZh",
        required_fields={"rank", "chinese", "english", "partOfSpeech", "exampleZh", "exampleEn", "group", "topic"},
        optional_fields={"characters", "pinyin", "pronunciation"},
    ),
    "de": LangSpec(
        surface_field="german",
        example_field="exampleDe",
        required_fields={"rank", "german", "english", "partOfSpeech", "exampleDe", "exampleEn", "group", "topic"},
        optional_fields={"pronunciation", "gender", "article"},
    ),
    "th": LangSpec(
        surface_field="thai",
        example_field="exampleTh",
        required_fields={"rank", "thai", "english", "exampleTh", "exampleEn", "group", "topic"},
        optional_fields={"transliteration", "pronunciation", "partOfSpeech"},
    ),
}


def normalize_surface(lang: str, surface: str) -> str:
    return surface.casefold() if lang == "de" else surface


def contains_surface(lang: str, surface: str, text: str) -> bool:
    return generator.contains_native_word(lang, surface, text)


def suspicious_english(english: str, pos: str) -> list[str]:
    issues: list[str] = []
    cleaned = english.strip()
    lowered = cleaned.lower()

    if not cleaned:
        return ["empty english gloss"]

    if pos != "verb" and lowered.startswith("to "):
        issues.append("verb-style gloss on non-verb")

    if re.search(r"\bto (a|an|the|and|or|but|because|if|than|when|where|who|what|which|this|that|these|those|my|your|his|her|their|our|no|not|just|more|less)\b", lowered):
        issues.append("overly literal english gloss")

    if lowered in {"thing", "stuff", "one", "ones"} and pos not in {"noun", "number", "pronoun"}:
        issues.append("weak catch-all english gloss")

    if pos == "verb" and lowered in {"can", "could", "may", "might", "must", "should", "will", "would"}:
        issues.append("bare modal gloss")

    return issues


def suspicious_pronunciation(lang: str, payload: dict[str, Any]) -> list[str]:
    issues: list[str] = []

    if lang == "zh":
        pinyin = str(payload.get("pinyin", "")).strip()
        pronunciation = str(payload.get("pronunciation", "")).strip()
        if not pinyin:
            issues.append("missing pinyin")
        elif re.search(r"[\u4e00-\u9fff]", pinyin):
            issues.append("pinyin contains Chinese characters")
        if not pronunciation:
            issues.append("missing pronunciation guide")
    elif lang == "th":
        transliteration = str(payload.get("transliteration", "")).strip()
        pronunciation = str(payload.get("pronunciation", "")).strip()
        if not transliteration:
            issues.append("missing transliteration")
        elif re.search(r"[ก-๙]", transliteration):
            issues.append("transliteration contains Thai script")
        if not pronunciation:
            issues.append("missing pronunciation guide")
    elif lang == "de":
        pronunciation = str(payload.get("pronunciation", "")).strip()
        if not pronunciation:
            issues.append("missing pronunciation guide")

    return issues


def suspicious_topic(payload: dict[str, Any]) -> list[str]:
    pos = str(payload.get("partOfSpeech", "noun"))
    expected = generator.guess_topic(str(payload.get("english", "")), pos)
    actual = str(payload.get("topic", ""))
    if actual != expected and actual != "basics" and expected != "basics":
        return [f"topic looks mismatched (expected {expected})"]
    return []


def contiguous_ranges(values: list[int]) -> list[str]:
    if not values:
        return []
    ranges: list[str] = []
    start = values[0]
    prev = values[0]
    for value in values[1:]:
        if value != prev + 1:
            ranges.append(f"{start}-{prev}" if start != prev else str(start))
            start = value
        prev = value
    ranges.append(f"{start}-{prev}" if start != prev else str(start))
    return ranges


def validate_language(lang: str) -> tuple[list[str], list[str]]:
    spec = LANG_SPECS[lang]
    words_dir = CONTENT_DIR / lang / "words"
    paths = sorted(words_dir.glob("word-*.json"))
    hard_errors: list[str] = []
    warnings: list[str] = []
    ranks: list[int] = []
    seen_surfaces: dict[str, Path] = {}

    for path in paths:
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
        except Exception as exc:
            hard_errors.append(f"{path}: invalid JSON ({exc})")
            continue

        keys = set(payload)
        missing_fields = sorted(spec.required_fields - keys)
        unexpected_fields = sorted(keys - spec.required_fields - spec.optional_fields)
        if missing_fields:
            hard_errors.append(f"{path}: missing required fields {missing_fields}")
        if unexpected_fields:
            hard_errors.append(f"{path}: unexpected fields {unexpected_fields}")

        rank = payload.get("rank")
        if not isinstance(rank, int):
            hard_errors.append(f"{path}: rank must be an integer")
            continue
        ranks.append(rank)

        expected_group = generator.get_group(rank)
        actual_group = payload.get("group")
        if actual_group != expected_group:
            hard_errors.append(f"{path}: group {actual_group!r} should be {expected_group!r} for rank {rank}")

        surface = str(payload.get(spec.surface_field, "")).strip()
        if not surface:
            hard_errors.append(f"{path}: missing surface field {spec.surface_field}")
            continue
        normalized_surface = normalize_surface(lang, surface)
        if normalized_surface in seen_surfaces:
            hard_errors.append(f"{path}: duplicate surface form {surface!r} already seen in {seen_surfaces[normalized_surface]}")
        else:
            seen_surfaces[normalized_surface] = path

        pos = str(payload.get("partOfSpeech", "noun"))
        if lang == "de" and pos == "noun":
            if not payload.get("gender"):
                hard_errors.append(f"{path}: German noun is missing gender")
            if not payload.get("article"):
                hard_errors.append(f"{path}: German noun is missing article")

        example_native = str(payload.get(spec.example_field, ""))
        if not contains_surface(lang, surface, example_native):
            warnings.append(f"{path}: example does not contain target word {surface!r}")

        for issue in suspicious_english(str(payload.get("english", "")), pos):
            warnings.append(f"{path}: {issue}")

        for issue in suspicious_pronunciation(lang, payload):
            warnings.append(f"{path}: {issue}")

        for issue in suspicious_topic(payload):
            warnings.append(f"{path}: {issue}")

    expected_ranks = set(range(1, 1001))
    actual_ranks = set(ranks)
    missing_ranks = sorted(expected_ranks - actual_ranks)
    extra_ranks = sorted(actual_ranks - expected_ranks)
    duplicate_ranks = [rank for rank, count in Counter(ranks).items() if count > 1]

    if len(paths) != 1000:
        hard_errors.append(f"{lang}: expected 1000 word files, found {len(paths)}")
    if missing_ranks:
        hard_errors.append(f"{lang}: missing ranks {contiguous_ranges(missing_ranks)}")
    if extra_ranks:
        hard_errors.append(f"{lang}: unexpected ranks {contiguous_ranges(extra_ranks)}")
    if duplicate_ranks:
        hard_errors.append(f"{lang}: duplicate ranks {sorted(duplicate_ranks)}")

    return hard_errors, warnings


def write_report(report_path: Path, per_language: dict[str, tuple[list[str], list[str]]], warning_limit: int) -> None:
    report_path.parent.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    lines = [
        "# Word Ladder Validation Report",
        "",
        f"Generated: {timestamp}",
        "",
        "## Summary",
        "",
        "| Language | Hard errors | Warnings |",
        "| --- | ---: | ---: |",
    ]

    for lang, (errors, warnings) in per_language.items():
        lines.append(f"| `{lang}` | {len(errors)} | {len(warnings)} |")

    for lang, (errors, warnings) in per_language.items():
        lines.extend(["", f"## `{lang}`", ""])
        if errors:
            lines.append(f"### Hard Errors ({len(errors)})")
            lines.append("")
            lines.extend([f"- {error}" for error in errors])
        else:
            lines.extend(["### Hard Errors (0)", "", "- None"])

        lines.extend(["", f"### Suspicious Entries ({len(warnings)})", ""])
        if warnings:
            for warning in warnings[:warning_limit]:
                lines.append(f"- {warning}")
            if len(warnings) > warning_limit:
                lines.append(f"- ... {len(warnings) - warning_limit} more warnings omitted")
        else:
            lines.append("- None")

    report_path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Validate the 1,000-word ladders for each academy language.")
    parser.add_argument("--lang", nargs="+", choices=sorted(LANG_SPECS), default=sorted(LANG_SPECS))
    parser.add_argument("--report", type=Path, default=DEFAULT_REPORT)
    parser.add_argument("--warning-limit", type=int, default=75)
    parser.add_argument("--fail-on-warnings", action="store_true")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    per_language: dict[str, tuple[list[str], list[str]]] = {}
    total_errors = 0
    total_warnings = 0

    for lang in args.lang:
        errors, warnings = validate_language(lang)
        per_language[lang] = (errors, warnings)
        total_errors += len(errors)
        total_warnings += len(warnings)
        print(f"{lang}: {len(errors)} hard errors, {len(warnings)} warnings")

    write_report(args.report, per_language, warning_limit=args.warning_limit)
    print(f"Report written to {args.report}")

    if total_errors or (args.fail_on_warnings and total_warnings):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
