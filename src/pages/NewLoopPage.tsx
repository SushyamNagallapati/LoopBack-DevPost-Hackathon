import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { CheckIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import { generateSteps } from "../lib/generate";
import { saveLoop } from "../lib/storage";
import type { Loop, LoopFormData } from "../types";

const EMOTIONS = [
  "Anxious",
  "Frustrated",
  "Sad",
  "Angry",
  "Confused",
  "Disappointed",
  "Overwhelmed",
  "Lonely",
  "Excited",
  "Grateful",
  "Hopeful",
  "Other",
] as const;

const STEPS = [
  { id: 1, label: "Situation" },
  { id: 2, label: "Emotion" },
  { id: 3, label: "What Matters" },
  { id: 4, label: "Summary" },
] as const;

const STEP_MIN = {
  situation: 20,
  whatMatters: 10,
} as const;

const COPY_TIMEOUT_MS = 2000;

type Generated = { smallestStep: string; bolderStep: string };

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export default function NewLoopPage() {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] =
    useState<(typeof STEPS)[number]["id"]>(1);
  const [formData, setFormData] = useState<LoopFormData>({
    situation: "",
    emotion: "",
    whatMatters: "",
  });

  const [customEmotion, setCustomEmotion] = useState("");
  const [messageDraftEnabled, setMessageDraftEnabled] = useState(false);
  const [messageFor, setMessageFor] = useState("");
  const [generated, setGenerated] = useState<Generated | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const trimmed = useMemo(
    () => ({
      situation: formData.situation.trim(),
      emotion: formData.emotion.trim(),
      whatMatters: formData.whatMatters.trim(),
      messageFor: messageFor.trim(),
    }),
    [formData, messageFor],
  );

  const isOtherSelected =
    customEmotion.length > 0 ||
    (trimmed.emotion.length > 0 && !EMOTIONS.includes(trimmed.emotion as any));

  const buildMessageDraft = (steps: Generated) => {
    if (!messageDraftEnabled || !trimmed.messageFor) return undefined;

    const emotion = trimmed.emotion.toLowerCase();
    const situation = trimmed.situation.toLowerCase();
    const whatMatters = trimmed.whatMatters.toLowerCase();

    return `Hi ${trimmed.messageFor}, ${steps.smallestStep}. I'm feeling ${emotion} about ${situation}, and what matters to me is ${whatMatters}.`;
  };

  const copyToClipboard = async (text: string, fieldName: string) => {
    const markCopied = () => {
      setCopiedField(fieldName);
      window.setTimeout(() => setCopiedField(null), COPY_TIMEOUT_MS);
    };

    try {
      await navigator.clipboard.writeText(text);
      markCopied();
      return;
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      markCopied();
    }
  };

  const copyAll = async () => {
    if (!generated) return;

    const lines = [
      `Situation: ${formData.situation}`,
      `Emotion: ${formData.emotion}`,
      `What Matters: ${formData.whatMatters}`,
      "",
      `Smallest Step: ${generated.smallestStep}`,
      `Bolder Step: ${generated.bolderStep}`,
    ];

    const draft = buildMessageDraft(generated);
    if (draft) lines.push("", `Message Draft: ${draft}`);

    await copyToClipboard(lines.join("\n"), "all");
  };

  const isStepValid = (stepId = currentStep) => {
    if (stepId === 1) return trimmed.situation.length >= STEP_MIN.situation;
    if (stepId === 2) return trimmed.emotion.length > 0;
    if (stepId === 3) return trimmed.whatMatters.length >= STEP_MIN.whatMatters;
    return true;
  };

  const handleNext = () => {
    switch (currentStep) {
      case 1:
        if (!isStepValid(1)) return;
        setCurrentStep(2);
        return;

      case 2:
        if (!isStepValid(2)) return;
        setCurrentStep(3);
        return;

      case 3:
        if (!isStepValid(3)) return;
        setGenerated(generateSteps(formData));
        setCurrentStep(4);
        return;

      default:
        return;
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((s) => (s - 1) as any);
  };

  const handleEmotionSelect = (emotion: (typeof EMOTIONS)[number]) => {
    if (emotion === "Other") {
      setCustomEmotion("");
      setFormData((prev) => ({ ...prev, emotion: "" }));
      return;
    }

    setCustomEmotion("");
    setFormData((prev) => ({ ...prev, emotion }));
  };

  const handleCustomEmotionChange = (value: string) => {
    setCustomEmotion(value);
    setFormData((prev) => ({ ...prev, emotion: value }));
  };

  const handleSave = () => {
    if (!generated) return;

    const now = new Date().toISOString();
    const title =
      trimmed.situation.slice(0, 50) +
      (trimmed.situation.length > 50 ? "..." : "");

    const loop: Loop = {
      id: uuidv4(),
      title,
      situation: formData.situation,
      emotion: formData.emotion,
      whatMatters: formData.whatMatters,
      smallestStep: generated.smallestStep,
      bolderStep: generated.bolderStep,
      messageDraft: buildMessageDraft(generated),
      messageFor:
        messageDraftEnabled && trimmed.messageFor ? messageFor : undefined,
      createdAt: now,
      updatedAt: now,
    };

    saveLoop(loop);
    navigate(`/loop/${loop.id}`);
  };

  return (
    <div className="text-gray-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-medium text-white mb-10 tracking-tight">
          Create a New Loop
        </h1>

        {/* Step Indicator */}
        <div className="mb-10">
          <div className="flex items-center">
            {STEPS.map((step, index) => {
              const isComplete = currentStep > step.id;
              const isCurrent = currentStep === step.id;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={cx(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                        isComplete && "bg-blue-600 text-white",
                        isCurrent &&
                          "bg-blue-600 text-white ring-2 ring-blue-600/30",
                        !isComplete &&
                          !isCurrent &&
                          "bg-gray-800/50 text-gray-500",
                      )}
                    >
                      {isComplete ? <CheckIcon className="w-4 h-4" /> : step.id}
                    </div>

                    <span
                      className={cx(
                        "mt-2.5 text-xs font-normal",
                        currentStep >= step.id
                          ? "text-gray-300"
                          : "text-gray-600",
                      )}
                    >
                      {step.label}
                    </span>
                  </div>

                  {index < STEPS.length - 1 && (
                    <div
                      className={cx(
                        "h-px flex-1 mx-4",
                        isComplete ? "bg-blue-600/50" : "bg-gray-800/50",
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-gray-900/40 border border-gray-800/60 rounded-lg p-6 mb-8">
          {currentStep === 1 && (
            <div>
              <label
                htmlFor="situation"
                className="block text-xs font-medium text-gray-400 mb-1.5"
              >
                Describe the situation
              </label>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                What's happening? What's the context? (Minimum{" "}
                {STEP_MIN.situation} characters)
              </p>

              <textarea
                id="situation"
                value={formData.situation}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    situation: e.target.value,
                  }))
                }
                rows={6}
                className="w-full px-3.5 py-2.5 text-sm bg-gray-800/50 border border-gray-800 rounded-md text-white placeholder-gray-500 leading-relaxed focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500/50 transition-colors resize-none"
                placeholder="Enter the situation..."
              />

              <p className="mt-2.5 text-xs text-gray-500">
                {formData.situation.length} / {STEP_MIN.situation} characters
              </p>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                How are you feeling?
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-5">
                {EMOTIONS.map((emotion) => {
                  const active =
                    formData.emotion === emotion ||
                    (emotion === "Other" && isOtherSelected);

                  return (
                    <button
                      key={emotion}
                      type="button"
                      onClick={() => handleEmotionSelect(emotion)}
                      className={cx(
                        "px-3 py-2 text-sm rounded-md font-normal transition-colors",
                        active
                          ? "bg-blue-600 text-white"
                          : "bg-gray-800/50 border border-gray-800 text-gray-300 hover:bg-gray-800 hover:border-gray-700",
                      )}
                    >
                      {emotion}
                    </button>
                  );
                })}
              </div>

              {isOtherSelected && (
                <div>
                  <label
                    htmlFor="custom-emotion"
                    className="block text-xs font-medium text-gray-400 mb-1.5"
                  >
                    Other (specify)
                  </label>

                  <input
                    id="custom-emotion"
                    type="text"
                    value={customEmotion}
                    onChange={(e) => handleCustomEmotionChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-800/50 border border-gray-800 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500/50 transition-colors"
                    placeholder="Enter your emotion..."
                  />
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <label
                htmlFor="whatMatters"
                className="block text-xs font-medium text-gray-400 mb-1.5"
              >
                What matters to you in this situation?
              </label>

              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                What values, goals, or relationships are important here?
                (Minimum {STEP_MIN.whatMatters} characters)
              </p>

              <textarea
                id="whatMatters"
                value={formData.whatMatters}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    whatMatters: e.target.value,
                  }))
                }
                rows={6}
                className="w-full px-3.5 py-2.5 text-sm bg-gray-800/50 border border-gray-800 rounded-md text-white placeholder-gray-500 leading-relaxed focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500/50 transition-colors resize-none"
                placeholder="What matters to you..."
              />

              <p className="mt-2.5 text-xs text-gray-500">
                {formData.whatMatters.length} / {STEP_MIN.whatMatters}{" "}
                characters
              </p>
            </div>
          )}

          {currentStep === 4 && generated && (
            <div className="space-y-8">
              <div>
                <h3 className="text-base font-medium text-white mb-5">
                  Your Steps Forward
                </h3>

                <div className="space-y-3">
                  {(
                    [
                      {
                        key: "smallest",
                        title: "Smallest Step",
                        value: generated.smallestStep,
                      },
                      {
                        key: "bolder",
                        title: "Bolder Step",
                        value: generated.bolderStep,
                      },
                    ] as const
                  ).map((block) => (
                    <div
                      key={block.key}
                      className="bg-gray-800/50 border border-gray-800 rounded-md p-5"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-sm font-medium text-blue-400">
                          {block.title}
                        </h4>
                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard(block.value, block.key)
                          }
                          className="text-gray-500 hover:text-gray-300 transition-colors p-1 -mr-1"
                          aria-label={`Copy ${block.title.toLowerCase()}`}
                        >
                          {copiedField === block.key ? (
                            <CheckIcon className="w-4 h-4 text-green-400" />
                          ) : (
                            <ClipboardDocumentIcon className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      <p className="text-sm text-gray-300 leading-relaxed">
                        {block.value}
                      </p>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={copyAll}
                  className="mt-5 w-full px-5 py-2.5 text-sm font-medium bg-gray-800/50 border border-gray-800 hover:bg-gray-800 hover:border-gray-700 text-gray-300 rounded-md transition-colors flex items-center justify-center"
                >
                  {copiedField === "all" ? (
                    <>
                      <CheckIcon className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <ClipboardDocumentIcon className="w-4 h-4 mr-2" />
                      Copy All
                    </>
                  )}
                </button>
              </div>

              <div className="border-t border-gray-800/50 pt-6">
                <label className="flex items-center mb-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={messageDraftEnabled}
                    onChange={(e) => setMessageDraftEnabled(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-800/50 border-gray-800 rounded focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="ml-2.5 text-sm text-gray-400">
                    Generate message draft
                  </span>
                </label>

                {messageDraftEnabled && (
                  <div>
                    <label
                      htmlFor="messageFor"
                      className="block text-xs font-medium text-gray-400 mb-1.5"
                    >
                      Message for
                    </label>

                    <input
                      id="messageFor"
                      type="text"
                      value={messageFor}
                      onChange={(e) => setMessageFor(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-gray-800/50 border border-gray-800 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500/50 transition-colors"
                      placeholder="Person's name..."
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-3">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="min-w-[110px] px-5 py-2.5 text-sm font-medium bg-gray-800/50 border border-gray-800 text-gray-300 rounded-md hover:bg-gray-800 hover:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-800/50 disabled:hover:border-gray-800 transition-colors"
          >
            Back
          </button>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!isStepValid()}
              className="min-w-[110px] px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-600/90 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-blue-600 transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              className="min-w-[110px] px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-600/90 transition-colors"
            >
              Save Loop
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
