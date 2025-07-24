export const Button = ({ children, onClick, className = "", variant = "default", ...props }) => {
  const baseClasses = "px-4 py-2 rounded font-medium transition-colors";
  const variants = {
    default: "bg-blue-500 hover:bg-blue-600 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
    destructive: "bg-red-500 hover:bg-red-600 text-white"
  };

  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

