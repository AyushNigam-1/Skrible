import { Outlet, Link } from "react-router-dom";
import { Feather } from "lucide-react";

const AuthLayout = () => {
  return (
    <div className="min-h-screen w-full flex bg-gray-50 dark:bg-[#0a0a0c] font-['Inter'] selection:bg-blue-500/30">
      {/* ========================================= */}
      {/* LEFT SIDE: The Editorial Canvas (Desktop) */}
      {/* ========================================= */}
      <div className="hidden lg:flex flex-col justify-between flex-1 relative overflow-hidden bg-[#11131A] p-12 xl:p-20">
        {/* Immersive Ambient Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-amber-500/10 blur-[150px] rounded-full pointer-events-none" />

        {/* Subtle Grain/Noise Texture Overlay (Optional, adds premium feel) */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

        {/* Top: Branding */}
        <div className="relative z-10">
          <Link
            to="/"
            className="inline-block transition-transform hover:scale-105 duration-300"
          >
            {/* Fallback logo text if image is missing, otherwise use your img tag */}
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2.5 rounded-xl border border-white/20 backdrop-blur-md">
                <Feather
                  className="w-6 h-6 text-amber-100/90"
                  strokeWidth={1.5}
                />
              </div>
              <span className="text-2xl font-bold text-white font-['Playfair_Display'] tracking-wide">
                Skribe
              </span>
            </div>
          </Link>
        </div>

        {/* Bottom: Inspiration / Quote */}
        <div className="relative z-10 max-w-lg mb-10 animate-in slide-in-from-bottom-10 fade-in duration-1000 delay-300">
          <blockquote className="space-y-6">
            <p className="text-4xl xl:text-5xl font-['Playfair_Display'] text-white leading-[1.3] tracking-tight">
              "There is no greater agony than bearing an untold story inside
              you."
            </p>
            <footer className="flex items-center gap-4">
              <div className="w-10 h-[1px] bg-white/30" />
              <span className="text-gray-400 font-medium tracking-wide text-sm uppercase">
                Maya Angelou
              </span>
            </footer>
          </blockquote>
        </div>
      </div>

      {/* ========================================= */}
      {/* RIGHT SIDE: The Form Area                 */}
      {/* ========================================= */}
      <div className="w-full lg:w-[50%] xl:w-[45%] flex flex-col items-center justify-center relative overflow-y-auto px-6 py-12 sm:px-12 lg:px-16">
        {/* Mobile Branding (Hidden on Desktop) */}
        <div className="lg:hidden absolute top-8 left-8">
          <Link to="/" className="flex items-center gap-2">
            <Feather
              className="w-6 h-6 text-blue-600 dark:text-amber-100/90"
              strokeWidth={1.5}
            />
            <span className="text-xl font-bold text-gray-900 dark:text-white font-['Playfair_Display']">
              Skribe
            </span>
          </Link>
        </div>

        {/* Dotted Pattern Background for Depth */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        {/* Gradient fade to seamlessly blend the dots */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-transparent to-gray-50 dark:from-[#0a0a0c] dark:via-transparent dark:to-[#0a0a0c] pointer-events-none" />

        {/* The dynamic content (Login/Signup form) goes here */}
        <div className="w-full max-w-md relative z-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
