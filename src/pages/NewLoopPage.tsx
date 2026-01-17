import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { CheckIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import { generateSteps } from "../lib/generate";
import { saveLoop } from "../lib/storage";
import type { LoopFormData, Loop } from "../types";

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
];

const STEPS = [
  { id: 1, label: "Situation" },
  { id: 2, label: "Emotion" },
  { id: 3, label: "What Matters" },
  { id: 4, label: "Summary" },
];

export default function NewLoopPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<LoopFormData>({
    situation: "",
    emotion: "",
    whatMatters: "",
  });
  const [customEmotion, setCustomEmotion] = useState("");
  const [selectedOther, setSelectedOther] = useState(false);
  const [messageDraft, setMessageDraft] = useState(false);
  const [messageFor, setMessageFor] = useState("");
  const [generatedSteps, setGeneratedSteps] = useState<{
    smallestStep: string;
    bolderStep: string;
  } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleNext = () => {
    if (currentStep === 1) {
      if (formData.situation.trim().length < 20) return;
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!formData.emotion.trim()) return;
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (formData.whatMatters.trim().length < 10) return;
      const steps = generateSteps(formData);
      setGeneratedSteps(steps);
      setCurrentStep(4);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const handleEmotionSelect = (emotion: string) => {
    if (emotion === "Other") {
      setFormData({ ...formData, emotion: "" });
      setCustomEmotion("");
      setSelectedOther(true);
    } else {
      setFormData({ ...formData, emotion });
      setCustomEmotion("");
      setSelectedOther(false);
    }
  };

  const handleCustomEmotionChange = (value: string) => {
    setCustomEmotion(value);
    setFormData({ ...formData, emotion: value });
    if (value && !selectedOther) setSelectedOther(true);
  };

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const copyAll = async () => {
    if (!generatedSteps) return;

    const allText = [
      `Situation: ${formData.situation}`,
      `Emotion: ${formData.emotion}`,
      `What Matters: ${formData.whatMatters}`,
      "",
      `Smallest Step: ${generatedSteps.smallestStep}`,
      `Bolder Step: ${generatedSteps.bolderStep}`,
    ];

    if (messageDraft && messageFor.trim()) {
      const message = `Hi ${messageFor}, ${generatedSteps.smallestStep}. I'm feeling ${formData.emotion.toLowerCase()} about ${formData.situation.toLowerCase()}, and what matters to me is ${formData.whatMatters.toLowerCase()}.`;
      allText.push("", `Message Draft: ${message}`);
    }

    await copyToClipboard(allText.join("\n"), "all");
  };

  const handleSave = () => {
    if (!generatedSteps) return;

    const now = new Date().toISOString();
    const trimmedSituation = formData.situation.trim();

    const loop: Loop = {
      id: uuidv4(),
      title:
        trimmedSituation.slice(0, 50) +
        (trimmedSituation.length > 50 ? "..." : ""),
      situation: formData.situation,
      emotion: formData.emotion,
      whatMatters: formData.whatMatters,
      smallestStep: generatedSteps.smallestStep,
      bolderStep: generatedSteps.bolderStep,
      messageDraft:
        messageDraft && messageFor.trim()
          ? `Hi ${messageFor}, ${generatedSteps.smallestStep}. I'm feeling ${formData.emotion.toLowerCase()} about ${formData.situation.toLowerCase()}, and what matters to me is ${formData.whatMatters.toLowerCase()}.`
          : undefined,
      messageFor: messageDraft && messageFor.trim() ? messageFor : undefined,
      createdAt: now,
      updatedAt: now,
    };

    saveLoop(loop);
    navigate(`/loop/${loop.id}`);
  };

  const isStepValid = () => {
    if (currentStep === 1) return formData.situation.trim().length >= 20;
    if (currentStep === 2) return formData.emotion.trim().length > 0;
    if (currentStep === 3) return formData.whatMatters.trim().length >= 10;
    return true;
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
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={[
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                      currentStep > step.id
                        ? "bg-blue-600 text-white"
                        : currentStep === step.id
                          ? "bg-blue-600 text-white ring-2 ring-blue-600/30"
                          : "bg-gray-800/50 text-gray-500",
                    ].join(" ")}
                  >
                    {currentStep > step.id ? (
                      <CheckIcon className="w-4 h-4" />
                    ) : (
                      step.id
                    )}
                  </div>

                  <span
                    className={[
                      "mt-2.5 text-xs font-normal",
                      currentStep >= step.id
                        ? "text-gray-300"
                        : "text-gray-600",
                    ].join(" ")}
                  >
                    {step.label}
                  </span>
                </div>

                {index < STEPS.length - 1 && (
                  <div
                    className={[
                      "h-px flex-1 mx-4",
                      currentStep > step.id
                        ? "bg-blue-600/50"
                        : "bg-gray-800/50",
                    ].join(" ")}
                  />
                )}
              </div>
            ))}
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
                What's happening? What's the context? (Minimum 20 characters)
              </p>
              <textarea
                id="situation"
                value={formData.situation}
                onChange={(e) =>
                  setFormData({ ...formData, situation: e.target.value })
                }
                rows={6}
                className="w-full px-3.5 py-2.5 text-sm bg-gray-800/50 border border-gray-800 rounded-md text-white placeholder-gray-500 leading-relaxed focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500/50 transition-colors resize-none"
                placeholder="Enter the situation..."
              />
              <p className="mt-2.5 text-xs text-gray-500">
                {formData.situation.length} / 20 characters
              </p>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                How are you feeling?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-5">
                {EMOTIONS.map((emotion) => (
                  <button
                    key={emotion}
                    type="button"
                    onClick={() => handleEmotionSelect(emotion)}
                    className={[
                      "px-3 py-2 text-sm rounded-md font-normal transition-colors",
                      formData.emotion === emotion ||
                      (emotion === "Other" &&
                        (selectedOther ||
                          (!EMOTIONS.includes(formData.emotion) &&
                            formData.emotion !== "")))
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800/50 border border-gray-800 text-gray-300 hover:bg-gray-800 hover:border-gray-700",
                    ].join(" ")}
                  >
                    {emotion}
                  </button>
                ))}
              </div>

              {(selectedOther ||
                (!EMOTIONS.includes(formData.emotion) &&
                  formData.emotion !== "")) && (
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
                (Minimum 10 characters)
              </p>
              <textarea
                id="whatMatters"
                value={formData.whatMatters}
                onChange={(e) =>
                  setFormData({ ...formData, whatMatters: e.target.value })
                }
                rows={6}
                className="w-full px-3.5 py-2.5 text-sm bg-gray-800/50 border border-gray-800 rounded-md text-white placeholder-gray-500 leading-relaxed focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500/50 transition-colors resize-none"
                placeholder="What matters to you..."
              />
              <p className="mt-2.5 text-xs text-gray-500">
                {formData.whatMatters.length} / 10 characters
              </p>
            </div>
          )}

          {currentStep === 4 && generatedSteps && (
            <div className="space-y-8">
              <div>
                <h3 className="text-base font-medium text-white mb-5">
                  Your Steps Forward
                </h3>

                <div className="space-y-3">
                  <div className="bg-gray-800/50 border border-gray-800 rounded-md p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-sm font-medium text-blue-400">
                        Smallest Step
                      </h4>
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(
                            generatedSteps.smallestStep,
                            "smallest",
                          )
                        }
                        className="text-gray-500 hover:text-gray-300 transition-colors p-1 -mr-1"
                        aria-label="Copy smallest step"
                      >
                        {copiedField === "smallest" ? (
                          <CheckIcon className="w-4 h-4 text-green-400" />
                        ) : (
                          <ClipboardDocumentIcon className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {generatedSteps.smallestStep}
                    </p>
                  </div>

                  <div className="bg-gray-800/50 border border-gray-800 rounded-md p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-sm font-medium text-blue-400">
                        Bolder Step
                      </h4>
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(generatedSteps.bolderStep, "bolder")
                        }
                        className="text-gray-500 hover:text-gray-300 transition-colors p-1 -mr-1"
                        aria-label="Copy bolder step"
                      >
                        {copiedField === "bolder" ? (
                          <CheckIcon className="w-4 h-4 text-green-400" />
                        ) : (
                          <ClipboardDocumentIcon className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {generatedSteps.bolderStep}
                    </p>
                  </div>
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
                    checked={messageDraft}
                    onChange={(e) => setMessageDraft(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-800/50 border-gray-800 rounded focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="ml-2.5 text-sm text-gray-400">
                    Generate message draft
                  </span>
                </label>

                {messageDraft && (
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
