'use client';

import { Check, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardCustomizeBarProps {
  editing: boolean;
  onToggleEditing: () => void;
  onReset: () => void;
}

const BUTTON_BASE =
  'flex h-9 items-center gap-2 rounded-xl px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2';

export function DashboardCustomizeBar({
  editing,
  onToggleEditing,
  onReset,
}: DashboardCustomizeBarProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
      {editing ? (
        <p className="mr-auto text-[11px] text-[#6B7280]">
          Drag a card to rearrange it, or use its size buttons.
        </p>
      ) : null}

      {editing ? (
        <motion.button
          type="button"
          onClick={onReset}
          whileTap={{ scale: 0.98 }}
          className={`${BUTTON_BASE} border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F5F5F5] hover:text-[#111827]`}
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Reset layout</span>
        </motion.button>
      ) : null}

      <motion.button
        type="button"
        onClick={onToggleEditing}
        aria-pressed={editing}
        whileTap={{ scale: 0.98 }}
        className={`${BUTTON_BASE} ${
          editing
            ? 'bg-black text-white hover:bg-slate-800'
            : 'border border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F5F5F5]'
        }`}
      >
        {editing ? (
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
        ) : (
          <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
        )}
        <span>{editing ? 'Done' : 'Customize'}</span>
      </motion.button>
    </div>
  );
}
