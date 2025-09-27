"use client";

import { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";

interface PatientDataEntryProps {
  selectedBodyPart: string | null;
  patientData: { [key: string]: string };
  onDataUpdate: (bodyPart: string, description: string) => void;
}

const BODY_PARTS = [
  "head", "neck", "chest", "heart", "left-lung", "right-lung", 
  "abdomen", "stomach", "liver", "left-kidney", "right-kidney",
  "left-shoulder", "right-shoulder", "left-arm", "right-arm", 
  "left-forearm", "right-forearm", "left-thigh", "right-thigh",
  "left-shin", "right-shin", "spine", "pelvis"
];

const BODY_PART_LABELS = {
  "head": "HEAD",
  "neck": "NECK", 
  "chest": "CHEST",
  "heart": "HEART",
  "left-lung": "LEFT LUNG",
  "right-lung": "RIGHT LUNG",
  "abdomen": "ABDOMEN",
  "stomach": "STOMACH",
  "liver": "LIVER",
  "left-kidney": "LEFT KIDNEY",
  "right-kidney": "RIGHT KIDNEY",
  "left-shoulder": "LEFT SHOULDER",
  "right-shoulder": "RIGHT SHOULDER",
  "left-arm": "LEFT ARM",
  "right-arm": "RIGHT ARM",
  "left-forearm": "LEFT FOREARM",
  "right-forearm": "RIGHT FOREARM",
  "left-thigh": "LEFT THIGH",
  "right-thigh": "RIGHT THIGH",
  "left-shin": "LEFT SHIN",
  "right-shin": "RIGHT SHIN",
  "spine": "SPINE",
  "pelvis": "PELVIS",
  "other": "OTHER"
};

export function PatientDataEntry({ selectedBodyPart, patientData, onDataUpdate }: PatientDataEntryProps) {
  const [expandedBoxes, setExpandedBoxes] = useState<Set<string>>(new Set());
  const [editingText, setEditingText] = useState<{ [key: string]: string }>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bodyPartRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

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
      setEditingText(prev => ({
        ...prev,
        [bodyPart]: patientData[bodyPart] || ""
      }));
    }
    setExpandedBoxes(newExpanded);
  };

  const handleTextChange = (bodyPart: string, text: string) => {
    setEditingText(prev => ({
      ...prev,
      [bodyPart]: text
    }));
  };

  const handleSave = (bodyPart: string) => {
    const text = editingText[bodyPart] || "";
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
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }
    }
  }, [selectedBodyPart]);

  return (
    <div className="h-full bg-black relative">
      {/* Header */}
      <div className="p-4 border-b border-white">
        <h3 className="text-white font-mono text-lg">
          PATIENT ASSESSMENT
        </h3>
      </div>
      
      {/* Scrollable Content */}
      <div ref={scrollContainerRef} className="absolute top-16 bottom-0 left-0 right-0 overflow-y-auto p-4 space-y-1">
        {/* Body Parts */}
        {BODY_PARTS.map((bodyPart) => (
          <div 
            key={bodyPart} 
            className="border border-white"
            ref={(el) => bodyPartRefs.current[bodyPart] = el}
          >
            {/* Collapsed Box Header */}
            <div
              className={`bg-black text-white p-4 cursor-pointer font-mono transition-all duration-200 ${
                selectedBodyPart === bodyPart ? 'border-2 border-red-500 bg-red-900/20' : 'hover:bg-gray-900'
              }`}
              onClick={() => toggleBox(bodyPart)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-bold">
                    [{expandedBoxes.has(bodyPart) ? '-' : '+'}]
                  </span>
                  <span className="font-medium">
                    {BODY_PART_LABELS[bodyPart as keyof typeof BODY_PART_LABELS]}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {patientData[bodyPart] && (
                    <span className="text-xs">●</span>
                  )}
                  <span className="text-xs font-mono">
                    {patientData[bodyPart] ? 'DATA' : 'EMPTY'}
                  </span>
                </div>
              </div>
              
              {/* Show preview of data when collapsed */}
              {!expandedBoxes.has(bodyPart) && patientData[bodyPart] && (
                <div className="text-xs mt-2 opacity-70 truncate">
                  {patientData[bodyPart]}
                </div>
              )}
            </div>

            {/* Expanded Box Content */}
            {expandedBoxes.has(bodyPart) && (
              <div className="bg-white text-black border-t border-black">
                <div className="p-4">
                  <div className="space-y-3">
                    <div className="text-xs font-mono font-bold">
                      ASSESSMENT NOTES:
                    </div>
                    <Textarea
                      placeholder={`Enter assessment details for ${BODY_PART_LABELS[bodyPart as keyof typeof BODY_PART_LABELS].toLowerCase()}...`}
                      value={editingText[bodyPart] || ""}
                      onChange={(e) => handleTextChange(bodyPart, e.target.value)}
                      className="min-h-[120px] font-mono text-sm bg-gray-100 border-black border-2 resize-none"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSave(bodyPart)}
                        className="flex-1 bg-black text-white px-4 py-2 font-mono text-sm hover:bg-gray-800 transition-colors"
                      >
                        SAVE
                      </button>
                      <button
                        onClick={() => handleClear(bodyPart)}
                        className="px-4 py-2 border border-black text-black font-mono text-sm hover:bg-gray-100 transition-colors"
                      >
                        CLEAR
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
          className="border border-white"
          ref={(el) => bodyPartRefs.current["other"] = el}
        >
          <div
            className={`bg-black text-white p-4 cursor-pointer font-mono transition-all duration-200 ${
              selectedBodyPart === "other" ? 'border-2 border-red-500 bg-red-900/20' : 'hover:bg-gray-900'
            }`}
            onClick={() => toggleBox("other")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-bold">
                  [{expandedBoxes.has("other") ? '-' : '+'}]
                </span>
                <span className="font-medium">OTHER</span>
              </div>
              <div className="flex items-center space-x-2">
                {patientData["other"] && (
                  <span className="text-xs">●</span>
                )}
                <span className="text-xs font-mono">
                  {patientData["other"] ? 'DATA' : 'EMPTY'}
                </span>
              </div>
            </div>
            
            <div className="text-xs mt-1 opacity-70">
              Non-body-model related issues
            </div>
            
            {!expandedBoxes.has("other") && patientData["other"] && (
              <div className="text-xs mt-2 opacity-70 truncate">
                {patientData["other"]}
              </div>
            )}
          </div>

          {expandedBoxes.has("other") && (
            <div className="bg-white text-black border-t border-black">
              <div className="p-4">
                <div className="space-y-3">
                  <div className="text-xs font-mono font-bold">
                    OTHER MEDICAL NOTES:
                  </div>
                  <Textarea
                    placeholder="Enter other medical observations, medications, allergies, etc..."
                    value={editingText["other"] || ""}
                    onChange={(e) => handleTextChange("other", e.target.value)}
                    className="min-h-[120px] font-mono text-sm bg-gray-100 border-black border-2 resize-none"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSave("other")}
                      className="flex-1 bg-black text-white px-4 py-2 font-mono text-sm hover:bg-gray-800 transition-colors"
                    >
                      SAVE
                    </button>
                    <button
                      onClick={() => handleClear("other")}
                      className="px-4 py-2 border border-black text-black font-mono text-sm hover:bg-gray-100 transition-colors"
                    >
                      CLEAR
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
