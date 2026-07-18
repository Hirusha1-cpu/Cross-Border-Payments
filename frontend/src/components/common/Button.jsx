import Spinner from './Spinner';

const VARIANTS = {
  primary: 'bg-gold-500 text-ink-950 hover:bg-gold-400 disabled:bg-ink-700 disabled:text-paper/40',
  secondary: 'bg-ink-800 text-paper border border-ink-600 hover:border-gold-500/60 disabled:opacity-40',
  ghost: 'bg-transparent text-paper hover:text-gold-400 disabled:opacity-40',
};

export default function Button({
  children,
  variant = 'primary',
  loading = false,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  ...rest
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-5 py-2.5 font-display font-medium text-sm tracking-wide transition-colors duration-150 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {loading && <Spinner size={16} />}
      {children}
    </button>
  );
}
