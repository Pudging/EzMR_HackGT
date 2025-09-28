"use client";

import { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";

interface PatientDataEntryProps {
  selectedBodyPart: string | null;
  patientData: Record<string, string | undefined>;
  onDataUpdate: (bodyPart: string, description: string) => void;
  savingStatus?: Record<string, 'idle' | 'pending' | 'saving' | 'saved'>;
}

const BODY_PARTS = [
  "head",
  "neck",
  "chest",
  "heart",
  "left-lung",
  "right-lung",
  "abdomen",
  "stomach",
  "liver",
  "left-kidney",
  "right-kidney",
  "left-shoulder",
  "right-shoulder",
  "left-arm",
  "right-arm",
  "left-forearm",
  "right-forearm",
  "left-wrist",
  "right-wrist",
  "left-thigh",
  "right-thigh",
  "left-shin",
  "right-shin",
  "left-foot",
  "right-foot",
  "spine",
  "pelvis",
];

const BODY_PART_LABELS = {
  head: "Head",
  neck: "Neck",
  chest: "Chest",
  heart: "Heart",
  "left-lung": "Left Lung",
  "right-lung": "Right Lung",
  abdomen: "Abdomen",
  stomach: "Stomach",
  liver: "Liver",
  "left-kidney": "Left Kidney",
  "right-kidney": "Right Kidney",
  "left-shoulder": "Left Shoulder",
  "right-shoulder": "Right Shoulder",
  "left-arm": "Left Arm",
  "right-arm": "Right Arm",
  "left-forearm": "Left Forearm",
  "right-forearm": "Right Forearm",
  "left-wrist": "Left Wrist",
  "right-wrist": "Right Wrist",
  "left-thigh": "Left Thigh",
  "right-thigh": "Right Thigh",
  "left-shin": "Left Shin",
  "right-shin": "Right Shin",
  "left-foot": "Left Foot",
  "right-foot": "Right Foot",
  spine: "Spine",
  pelvis: "Pelvis",
  other: "Other",
};

export function PatientDataEntry({
  selectedBodyPart,
  patientData,
  onDataUpdate,
  savingStatus = {},
}: PatientDataEntryProps) {
  const [expandedBoxes, setExpandedBoxes] = useState<Set<string>>(new Set());
  const [editingText, setEditingText] = useState<
    Record<string, string | undefined>
  >({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bodyPartRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const toggleBox = (bodyPart: string) => {
    const newExpanded = new Set(expandedBoxes);
    if (newExpanded.has(bodyPart)) {
      newExpanded.delete(bodyPart);
      // Save any pending text when collapsing
      if (editingText[bodyPart] !== undefined) {
        if (editingText[bodyPart].trim()) {
          onDataUpdate(bodyPart, editingText[bodyPart]);
        }
        const newEditingText = { ...editingText };
        delete newEditingText[bodyPart];
        setEditingText(newEditingText);
      }
    } else {
      newExpanded.add(bodyPart);
      setEditingText((prev) => ({
        ...prev,
        [bodyPart]: patientData[bodyPart] ?? "",
      }));
    }
    setExpandedBoxes(newExpanded);
  };

  const handleTextChange = (bodyPart: string, text: string) => {
    setEditingText((prev) => ({
      ...prev,
      [bodyPart]: text,
    }));
  };

  const handleSave = (bodyPart: string) => {
    const text = editingText[bodyPart] ?? "";
    if (text.trim()) {
      onDataUpdate(bodyPart, text);
    } else {
      onDataUpdate(bodyPart, "");
    }

    // Remove from expanded and editing
    const newExpanded = new Set(expandedBoxes);
    newExpanded.delete(bodyPart);
    setExpandedBoxes(newExpanded);

    const newEditingText = { ...editingText };
    delete newEditingText[bodyPart];
    setEditingText(newEditingText);
  };

  const handleClear = (bodyPart: string) => {
    onDataUpdate(bodyPart, "");
    const newEditingText = { ...editingText };
    delete newEditingText[bodyPart];
    setEditingText(newEditingText);
  };

  // Auto-scroll to selected body part
  useEffect(() => {
    if (selectedBodyPart && bodyPartRefs.current[selectedBodyPart]) {
      const element = bodyPartRefs.current[selectedBodyPart];
      if (element && scrollContainerRef.current) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
      }
    }
  }, [selectedBodyPart]);

  return (
    <div className="bg-card relative h-full rounded-xl">
      {/* Header */}
      <div className="border-border border-b p-4">
        <h3 className="text-card-foreground font-mono text-lg">
          Patient Assessment
        </h3>
      </div>

      {/* Scrollable Content */}
      <div
        ref={scrollContainerRef}
        className="absolute top-16 right-0 bottom-0 left-0 space-y-1 overflow-y-auto p-4"
      >
        {/* Body Parts */}
        {BODY_PARTS.map((bodyPart) => (
          <div
            key={bodyPart}
            className="border-border border"
            ref={(el) => {
              bodyPartRefs.current[bodyPart] = el;
            }}
          >
            {/* Collapsed Box Header */}
            <div
              className={`bg-card text-card-foreground cursor-pointer p-3 transition-all duration-200 ${
                selectedBodyPart === bodyPart
                  ? "border-destructive bg-destructive/20 border-2"
                  : "hover:bg-muted"
              }`}
              onClick={() => toggleBox(bodyPart)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-base font-bold">
                    [{expandedBoxes.has(bodyPart) ? "-" : "+"}]
                  </span>
                  <span className="font-medium text-sm">
                    {
                      BODY_PART_LABELS[
                        bodyPart as keyof typeof BODY_PART_LABELS
                      ]
                    }
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {patientData[bodyPart] && <span className="text-sm">●</span>}
                  <span className="text-sm">
                    {patientData[bodyPart] ? "Data" : "Empty"}
                  </span>
                </div>
              </div>

              {/* Show preview of data when collapsed */}
              {!expandedBoxes.has(bodyPart) && patientData[bodyPart] && (
                <div className="mt-2 text-sm opacity-70 line-clamp-2">
                  {patientData[bodyPart]}
                </div>
              )}
            </div>

            {/* Expanded Box Content */}
            {expandedBoxes.has(bodyPart) && (
              <div className="border-border bg-background text-foreground border-t">
                <div className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-bold">
                        Assessment Notes:
                      </div>
                      {savingStatus[bodyPart] && savingStatus[bodyPart] !== 'idle' && (
                        <div className="flex items-center space-x-1">
                          {savingStatus[bodyPart] === 'pending' && (
                            <span className="text-yellow-600 text-sm">●</span>
                          )}
                          {savingStatus[bodyPart] === 'saving' && (
                            <span className="text-blue-600 text-sm animate-pulse">●</span>
                          )}
                          {savingStatus[bodyPart] === 'saved' && (
                            <span className="text-green-600 text-sm">✓</span>
                          )}
                          <span className="text-sm text-muted-foreground">
                            {savingStatus[bodyPart] === 'pending' && 'Pending'}
                            {savingStatus[bodyPart] === 'saving' && 'Saving...'}
                            {savingStatus[bodyPart] === 'saved' && 'Saved'}
                          </span>
                        </div>
                      )}
                    </div>
                    <Textarea
                      placeholder={`Enter assessment details for ${BODY_PART_LABELS[bodyPart as keyof typeof BODY_PART_LABELS].toLowerCase()}...`}
                      value={editingText[bodyPart] ?? ""}
                      onChange={(e) =>
                        handleTextChange(bodyPart, e.target.value)
                      }
                      className="border-border bg-input min-h-[100px] resize-none border-2 text-base"
                    />
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleSave(bodyPart)}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1 px-4 py-2 text-sm font-medium transition-colors rounded"
                      >
                        Save Notes
                      </button>
                      <button
                        onClick={() => handleClear(bodyPart)}
                        className="border-border text-foreground hover:bg-muted border px-4 py-2 text-sm font-medium transition-colors rounded"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Other Category */}
        <div
          className="border-border border"
          ref={(el) => {
            bodyPartRefs.current.other = el;
          }}
        >
          <div
            className={`bg-card text-card-foreground cursor-pointer p-4 font-mono transition-all duration-200 ${
              selectedBodyPart === "other"
                ? "border-destructive bg-destructive/20 border-2"
                : "hover:bg-muted"
            }`}
            onClick={() => toggleBox("other")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-bold">
                  [{expandedBoxes.has("other") ? "-" : "+"}]
                </span>
                <span className="font-medium">Other</span>
              </div>
              <div className="flex items-center space-x-2">
                {patientData.other && <span className="text-xs">●</span>}
                <span className="font-mono text-xs">
                  {patientData.other ? "Data" : "Empty"}
                </span>
              </div>
            </div>

            <div className="mt-1 text-xs opacity-70">
              Non-body-model related issues
            </div>

            {!expandedBoxes.has("other") && patientData.other && (
              <div className="mt-2 truncate text-xs opacity-70">
                {patientData.other}
              </div>
            )}
          </div>

          {expandedBoxes.has("other") && (
            <div className="border-border bg-background text-foreground border-t">
              <div className="p-4">
                <div className="space-y-3">
                  <div className="font-mono text-xs font-bold">
                    Other Medical Notes:
                  </div>
                  <Textarea
                    placeholder="Enter other medical observations, medications, allergies, etc..."
                    value={editingText.other ?? ""}
                    onChange={(e) => handleTextChange("other", e.target.value)}
                    className="border-border bg-input min-h-[120px] resize-none border-2 font-mono text-sm"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSave("other")}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1 px-4 py-2 font-mono text-sm transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => handleClear("other")}
                      className="border-border text-foreground hover:bg-muted border px-4 py-2 font-mono text-sm transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
