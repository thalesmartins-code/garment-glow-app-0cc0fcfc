import { useState, useCallback, useRef, useEffect } from "react";
import { Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface EditableQuantityCellProps {
  value: number;
  onSave: (newValue: number) => void;
  isEditable?: boolean;
  className?: string;
}

export function EditableQuantityCell({ 
  value, 
  onSave, 
  isEditable = true,
  className 
}: EditableQuantityCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  // Update local state when value prop changes
  useEffect(() => {
    if (!isEditing) {
      setEditValue(String(value));
    }
  }, [value, isEditing]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = useCallback(() => {
    const parsed = parseInt(editValue.replace(/\D/g, ''), 10);
    if (!isNaN(parsed) && parsed >= 0) {
      onSave(parsed);
    } else {
      setEditValue(String(value));
    }
    setIsEditing(false);
  }, [editValue, onSave, value]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setEditValue(String(value));
      setIsEditing(false);
    }
  }, [handleSave, value]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("pt-BR").format(num);
  };

  if (!isEditable) {
    return (
      <span className={cn("font-medium", className)}>
        {formatNumber(value)}
      </span>
    );
  }

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="w-24 h-8 text-right text-sm"
        inputMode="numeric"
      />
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className={cn(
        "group flex items-center justify-end gap-1.5 font-medium hover:text-primary transition-colors cursor-pointer",
        value === 0 && "text-muted-foreground",
        className
      )}
    >
      <span>{formatNumber(value)}</span>
      <Pencil className="w-3.5 h-3.5 opacity-0 group-hover:opacity-70 transition-opacity" />
    </button>
  );
}
