import { describe, expect, it, vi } from "vitest";

vi.mock("framer", () => ({
  addPropertyControls: () => {},
  ControlType: { String: "String", Boolean: "Boolean" },
}));

vi.mock("react", () => ({
  default: {},
  useState: () => [null, () => {}],
  useEffect: () => {},
  useMemo: (fn) => fn(),
}));

import { __testables as cosineTestables } from "./KandidattestFramerCosineSimilarity";
import { __testables as manhattanTestables } from "./KandidattestFramerManhattan";
import { __testables as weightedTestables } from "./KandidattestFramerWeightedManhattan";

describe("Kandidattest Framer scoring", () => {
  it("cosine similarity scoring returns expected percentages and order", () => {
    const questions = [{ id: "q1" }, { id: "q2" }, { id: "q3" }];
    const responses = { q1: 1, q2: 0, q3: -1 };
    const candidates = [
      { id: "a", answers: { q1: 1, q2: 0, q3: -1 } }, // cos=1 => 100
      { id: "b", answers: { q1: -1, q2: 0, q3: 1 } }, // cos=-1 => 0
      { id: "c", answers: { q1: 1, q2: -1, q3: 0 } }, // cos=0.5 => 75
    ];

    const results = cosineTestables.scoreAllCandidates(
      candidates,
      responses,
      questions,
    );

    expect(results.map((x) => x.candidate.id)).toEqual(["a", "c", "b"]);
    expect(results.map((x) => x.pct)).toEqual([100, 75, 0]);
    expect(cosineTestables.cosineSimilarity([])).toBe(0);
  });

  it("manhattan scoring returns expected percentages and tie-break order", () => {
    const questions = [{ id: "q1" }, { id: "q2" }];
    const responses = { q1: 2, q2: 0 };
    const candidates = [
      { id: "a", answers: { q1: 2, q2: 0 } }, // distance 0 => 100
      { id: "b", answers: { q1: 0, q2: 2 } }, // distance 4 => 50
      { id: "c", answers: { q1: -2, q2: -2 } }, // distance 6 => 25
    ];

    const results = manhattanTestables.scoreAllCandidates(
      candidates,
      responses,
      questions,
    );

    expect(results.map((x) => x.candidate.id)).toEqual(["a", "b", "c"]);
    expect(results.map((x) => x.pct)).toEqual([100, 50, 25]);
  });

  it("weighted manhattan scoring respects weights and clamps input", () => {
    const questions = [
      { id: "q1", defaultWeight: 1 },
      { id: "q2", defaultWeight: 1 },
    ];
    const responses = {
      q1: { value: 2, weight: 3 },
      q2: { value: 0, weight: 1 },
    };
    const candidates = [
      { id: "a", answers: { q1: 2, q2: 0 } }, // 100
      { id: "b", answers: { q1: 0, q2: 2 } }, // 50
      { id: "c", answers: { q1: -2, q2: -2 } }, // 13
    ];

    const results = weightedTestables.scoreAllCandidates(
      candidates,
      responses,
      questions,
    );

    expect(results.map((x) => x.candidate.id)).toEqual(["a", "b", "c"]);
    expect(results.map((x) => x.pct)).toEqual([100, 50, 13]);
    expect(weightedTestables.clampInt(2.9, 1, 3)).toBe(2);
    expect(weightedTestables.clampInt(99, 1, 3)).toBe(3);
    expect(weightedTestables.clampInt("x", 1, 3)).toBe(1);
  });
});
