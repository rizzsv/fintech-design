import React from 'react';
import { CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  label: string;
  supportingText?: string;
}

export function StatusBadge({ status, label, supportingText }: StatusBadgeProps) {
  const statusLower = status?.toLowerCase() || '';
  
  let icon = <ShieldCheck className="h-5 w-5" />;
  let bgColor = 'bg-slate-50';
  let textColor = 'text-slate-700';
  
  if (statusLower === 'active' || statusLower === 'verified' || statusLower === 'approved') {
    icon = <CheckCircle2 className="h-5 w-5" />;
    bgColor = 'bg-emerald-50';
    textColor = 'text-emerald-700';
  } else if (statusLower === 'pending') {
    icon = <AlertCircle className="h-5 w-5" />;
    bgColor = 'bg-amber-50';
    textColor = 'text-amber-700';
  } else if (statusLower === 'inactive' || statusLower === 'rejected' || statusLower === 'failed') {
    icon = <AlertCircle className="h-5 w-5" />;
    bgColor = 'bg-red-50';
    textColor = 'text-red-700';
  }
  
  return (
    <div className={`flex items-center justify-between rounded-2xl border border-slate-200 ${bgColor} p-4 shadow-sm`}>
      <div className="flex items-center gap-3">
        <div className={`${textColor}`}>{icon}</div>
        <div>
          <p className={`text-sm font-semibold ${textColor}`}>{label}</p>
          {supportingText && <p className="text-xs text-slate-500">{supportingText}</p>}
        </div>
      </div>
    </div>
  );
}
