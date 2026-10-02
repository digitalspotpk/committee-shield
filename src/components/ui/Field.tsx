import { cn } from "@/lib/utils";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: React.ReactNode;
  hint?: string;
};

export function Field({ label, icon, hint, className, id, ...rest }: Props) {
  const inputId = id ?? rest.name;
  return (
    <label htmlFor={inputId} className="block">
      <span className="mb-1.5 block px-1 text-xs font-medium text-white/55">{label}</span>
      <span className="group relative flex items-center">
        {icon && <span className="pointer-events-none absolute left-3.5 text-white/35 group-focus-within:text-emerald-300">{icon}</span>}
        <input
          id={inputId}
          className={cn(
            "h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white placeholder:text-white/25 outline-none transition",
            "focus:border-emerald-400/60 focus:bg-white/[0.06] focus:shadow-[0_0_0_4px_rgba(16,185,129,.12)]",
            icon && "pl-10",
            className,
          )}
          {...rest}
        />
      </span>
      {hint && <span className="mt-1 block px-1 text-[11px] text-white/35">{hint}</span>}
    </label>
  );
}

export function SelectField({
  label,
  children,
  className,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block px-1 text-xs font-medium text-white/55">{label}</span>
      <select
        className={cn(
          "h-12 w-full appearance-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none focus:border-emerald-400/60",
          className,
        )}
        {...rest}
      >
        {children}
      </select>
    </label>
  );
}
