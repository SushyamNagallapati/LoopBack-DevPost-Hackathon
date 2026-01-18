import type { LoopFormData } from "../types";

/**
 * Deterministic generation of steps based on form data.
 * Same inputs => same outputs.
 */

type StepTemplates = {
  smallest: string[];
  bolder: string[];
};

const TEMPLATES: StepTemplates[] = [
  {
    smallest: [
      "Send a brief text message acknowledging the situation",
      "Take 5 minutes to write down your thoughts",
      "Have a 15-minute conversation with someone you trust",
      "Make a small gesture that shows you care",
      "Set aside 30 minutes to think through options",
      "Send a supportive note",
      "Schedule a time to talk",
      "Do one small thing that aligns with what matters to you",
    ],
    bolder: [
      "Initiate an honest, face-to-face conversation about how you feel",
      "Take concrete action that addresses the core of what matters",
      "Make a commitment to yourself with a specific timeline",
      "Reach out to multiple people who can support you",
      "Change your immediate environment or routine to reflect your values",
      "Set a boundary or make a clear request",
      "Take a significant step toward your long-term goals",
      "Make a decision that might feel risky but aligns with what truly matters",
    ],
  },
  {
    smallest: [
      "Write one sentence about what you want to communicate",
      "Take three deep breaths and check in with yourself",
      "Send a supportive emoji or reaction",
      "Block out 10 minutes in your calendar for this",
      "Identify one person you can talk to",
      "Write down the first thing that comes to mind",
      "Take a short walk to clear your head",
      "Acknowledge the emotion without trying to fix it yet",
    ],
    bolder: [
      "Have a direct conversation about what matters most",
      "Make a decision and take action, even if it feels uncertain",
      "Communicate your needs clearly and ask for support",
      "Commit to a meaningful change in how you approach this",
      "Reach out proactively instead of waiting",
      "Take responsibility for your part and initiate resolution",
      "Prioritize your well-being in a concrete way",
      "Move forward with confidence in what you value",
    ],
  },
];

const hashString = (input: string): number => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0; // force 32-bit
  }
  return Math.abs(hash);
};

const applyContextReplacements = (text: string, ctx: "relationship" | "work" | null) => {
  if (!ctx) return text;

  const replacements =
    ctx === "relationship"
      ? [
          ["someone", "this person"],
          ["person", "them"],
        ]
      : [
          ["someone", "a colleague"],
          ["person", "colleague"],
        ];

  return replacements.reduce(
    (acc, [from, to]) => acc.replace(from, to),
    text
  );
};

const detectContext = (whatMatters: string): "relationship" | "work" | null => {
  const s = whatMatters.toLowerCase();

  if (s.includes("relationship") || s.includes("connection")) return "relationship";
  if (s.includes("work") || s.includes("career")) return "work";

  return null;
};

export const generateSteps = (
  formData: LoopFormData
): { smallestStep: string; bolderStep: string } => {
  const combined =
    (hashString(formData.situation) +
      hashString(formData.emotion) +
      hashString(formData.whatMatters)) %
    1000;

  const template = TEMPLATES[combined % TEMPLATES.length];

  const smallestStep = template.smallest[combined % template.smallest.length];
  const bolderStep = template.bolder[(combined * 3) % template.bolder.length];

  const ctx = detectContext(formData.whatMatters);

  return {
    smallestStep: applyContextReplacements(smallestStep, ctx),
    bolderStep: applyContextReplacements(bolderStep, ctx),
  };
};
