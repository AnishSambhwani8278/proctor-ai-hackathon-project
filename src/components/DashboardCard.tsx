import React from 'react';
import { cn } from '../lib/utils';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  className?: string;
}

export function DashboardCard({ title, value, icon, className }: DashboardCardProps) {
  return (
    <div className={cn(
      "bg-white rounded-lg shadow-md p-6",
      "border border-gray-200",
      "transition-all duration-200 hover:shadow-lg",
      className
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className="p-2 bg-blue-50 rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  );
}