import { Link } from "react-router-dom";
import logo from "@/assets/logovic.png";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="mt-6 px-4 md:px-8 pb-6">
      <div className="mx-auto max-w-7xl bg-white/80 backdrop-blur-md border border-gray-100 dark:border-gray-800 dark:bg-black/80 rounded-2xl shadow-sm transition-all duration-300">
        <div className="px-4 md:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2" aria-label="Home">
            <img src={logo} alt="Victohs Logo" className="h-8 w-auto object-contain" />
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            <Button asChild variant="ghost" className="text-purple-700 dark:text-purple-300">
              <Link to="/">Home</Link>
            </Button>
            <Button asChild variant="ghost" className="text-purple-700 dark:text-purple-300">
              <Link to="/faq">FAQ</Link>
            </Button>
            <Button asChild variant="ghost" className="text-purple-700 dark:text-purple-300">
              <Link to="/rules">Rules</Link>
            </Button>
          </nav>
        </div>

        <div className="px-4 md:px-6 py-3 border-t border-gray-100 dark:border-gray-800 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            © 2026 Victohs. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
