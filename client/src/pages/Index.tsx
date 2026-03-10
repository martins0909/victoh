import Navbar from "@/components/Navbar";
import CategoryBanners from "@/components/CategoryBanners";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import heroBg from "@/assets/pink3.jfif";

const ROTATING_STORE_WORDS = ["Facebook", "Twitter", "VPN", "Instagram", "Tiktok", "Truck update"];

function useTypewriterWords(words: string[]) {
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex] ?? "";

    const isWordComplete = !isDeleting && charIndex >= currentWord.length;
    const isWordEmpty = isDeleting && charIndex <= 0;

    let delay = isDeleting ? 45 : 70;
    if (isWordComplete) delay = 900;
    if (isWordEmpty) delay = 250;

    const timer = window.setTimeout(() => {
      if (isWordComplete) {
        setIsDeleting(true);
        return;
      }

      if (isWordEmpty) {
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % words.length);
        return;
      }

      setCharIndex((prev) => prev + (isDeleting ? -1 : 1));
    }, delay);

    return () => window.clearTimeout(timer);
  }, [charIndex, isDeleting, wordIndex, words]);

  const current = words[wordIndex] ?? "";
  return current.slice(0, charIndex);
}

const AnimatedCounter = ({ end, suffix = "", duration = 2000 }: { end: number, suffix?: string, duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      setCount(Math.floor(easeOutQuart * end));
      
      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      }
    };
    
    animationFrameId = window.requestAnimationFrame(step);
    
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [end, duration]);

  return <span>{count}{suffix}</span>;
};

import facebookImg from "@/assets/facebook (2).jpg";
import instagramImg from "@/assets/Instargram.jpg";
import numberImg from "@/assets/number.jpg";
import telegramImg from "@/assets/telegram.jpg";
import tiktokImg from "@/assets/tiktok.jpg";
import whatsappImg from "@/assets/whatsapp.jpg";
import xImg from "@/assets/x.jpg";
import { ShoppingBag, Zap, ArrowRight, Wallet, Shield, Globe2, History, Settings } from "lucide-react";
import { memo } from "react";

/**
 * Index Page – Victohs Landing Page
 * Modern, semantic, and accessible version without altering the UI.
 */
const Index = () => {
  const navigate = useNavigate();
  const typedStoreWord = useTypewriterWords(ROTATING_STORE_WORDS);

  return (
  <main className="min-h-screen flex flex-col bg-gray-50 dark:bg-black relative overflow-hidden transition-colors duration-300">
      {/*  Navbar */}
      <Navbar />

      {/* ≡ƒÅá Beautiful Modern Hero Section */}
      <section
        id="home"
        className="relative min-h-[90vh] flex items-center pt-28 pb-16 px-4 md:px-8 overflow-hidden transition-colors duration-300"
        aria-label="Online Log Store"
      >
        {/* Cinematic 2026 Background Image Layer */}
        <div className="absolute inset-0 z-0 overflow-hidden bg-purple-950">
          {/* Deep elegant overlay to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-950/90 via-purple-900/60 to-gray-900/95 dark:to-black/95 z-10"></div>
          {/* Subtle noise texture or radial vignette for modern feel */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-purple-950/50 to-black/90 z-10 mix-blend-multiply"></div>
          {/* The main background image with a subtle continuous soft-zoom effect */}
          <img 
            src={heroBg} 
            alt="Hero Background" 
            className="w-full h-full object-cover object-center opacity-70 transform scale-105 animate-[pulse_10s_ease-in-out_infinite] transition-transform duration-[20s] hover:scale-110" 
          />
        </div>

        {/* Modern Ambient Mesh Gradients (Overlaying the bg image) */}
        <div className="absolute top-0 right-0 z-10 w-[600px] h-[600px] bg-gradient-to-br from-purple-600/40 to-indigo-500/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 animate-pulse pointer-events-none mix-blend-screen transition-colors duration-500"></div>
        <div className="absolute bottom-0 left-0 z-10 w-[500px] h-[500px] bg-gradient-to-tr from-purple-800/40 to-fuchsia-600/30 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/3 animate-pulse pointer-events-none mix-blend-screen transition-colors duration-500" style={{ animationDelay: '2s' }}></div>

        <div className="container mx-auto relative z-20 max-w-7xl">
          <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto">
            
            {/* ≡ƒô¥ Hero Text & Content */}
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 w-full mx-auto text-center">
              
              {/* Pill Marquee Badge */}
              <div className="inline-flex items-center gap-3 p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 shadow-sm mx-auto overflow-hidden w-full sm:w-auto relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="text-xs font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400 pl-3 shrink-0 relative z-10">
                  Trusted By
                </span>
                <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 shrink-0 relative z-10"></div>
                
                <div className="marquee w-48 sm:w-72 relative z-10">
                  <div className="marquee-track flex items-center gap-5">
                    {[
                      { img: facebookImg, label: "Facebook" },
                      { img: instagramImg, label: "Instagram" },
                      { img: tiktokImg, label: "Tiktok" },
                      { img: xImg, label: "X" },
                      { img: whatsappImg, label: "WhatsApp" },
                      { img: telegramImg, label: "Telegram" },
                      { img: numberImg, label: "VPN" },
                    ].map((p, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 shrink-0 opacity-90 hover:opacity-100 transition-opacity">
                        <img src={p.img} alt={p.label} className="w-5 h-5 rounded-full object-cover ring-2 ring-white/50 dark:ring-gray-800/50 shadow-sm" />
                        <span className="text-xs font-semibold text-gray-200">{p.label}</span>
                      </div>
                    ))}
                    {[
                      { img: facebookImg, label: "Facebook" },
                      { img: instagramImg, label: "Instagram" },
                      { img: tiktokImg, label: "Tiktok" },
                      { img: xImg, label: "X" },
                      { img: whatsappImg, label: "WhatsApp" },
                      { img: telegramImg, label: "Telegram" },
                      { img: numberImg, label: "VPN" },
                    ].map((p, idx) => (
                      <div key={`d-${idx}`} className="flex items-center gap-1.5 shrink-0 opacity-90">
                        <img src={p.img} alt={p.label} className="w-5 h-5 rounded-full object-cover ring-2 ring-white/50 dark:ring-gray-800/50 shadow-sm" />
                        <span className="text-xs font-semibold text-gray-200">{p.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Headlines */}
              <div className="space-y-6">
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] drop-shadow-sm">
                  Online Log <br />
                  <span className="text-white">Store for </span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-rose-500 to-fuchsia-500 animate-pulse" style={{ animationDuration: '4s' }}>
                    {typedStoreWord}
                  </span>
                </h1>
                <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 leading-relaxed text-shadow-sm font-light mt-4">
                  A premium, trusted platform delivering <strong className="font-semibold text-white drop-shadow-md">genuine social media accounts</strong> & secure digital services that stand the test of time.
                </p>
              </div>

              {/* Call to Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2 justify-center w-full">
                <Button
                  size="lg"
                  onClick={() => navigate("/auth")}
                  className="h-14 px-8 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white font-bold shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 transform hover:-translate-y-1 rounded-2xl w-full sm:w-auto overflow-hidden relative group border-0 text-lg"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-in-out"></div>
                  <span className="flex items-center gap-2 justify-center relative z-10 text-white dark:text-white">
                    Explore Store
                    <ShoppingBag className="w-5 h-5 ml-1 animate-bounce" style={{ animationDuration: '2s' }} />
                  </span>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
                  className="h-14 px-8 text-lg font-semibold border-2 border-transparent hover:border-purple-400 bg-white hover:bg-white/90 text-gray-900 hover:text-gray-900 dark:text-gray-900 dark:bg-white dark:hover:bg-white/90 backdrop-blur-sm transition-all duration-300 rounded-2xl w-full sm:w-auto shadow-sm"
                >
                  Learn More
                </Button>
              </div>
              
              {/* Trust Indicators */}
              <div className="pt-8 flex items-center justify-center gap-8 lg:gap-12 border-t border-white/20">
                  <div className="text-center transition-transform hover:-translate-y-1 duration-300 cursor-default">
                    <p className="text-3xl md:text-4xl font-black text-white drop-shadow-md"><AnimatedCounter end={10} suffix="K+" duration={2500} /></p>
                    <p className="text-xs md:text-sm font-bold text-gray-200 dark:text-gray-300 uppercase tracking-widest mt-1 drop-shadow-sm">Accounts Sold</p>
                  </div>
                  <div className="w-px h-12 bg-gradient-to-b from-transparent via-white/50 to-transparent"></div>
                  <div className="text-center transition-transform hover:-translate-y-1 duration-300 cursor-default">
                    <p className="text-3xl md:text-4xl font-black text-white drop-shadow-md"><AnimatedCounter end={100} suffix="%" duration={2000} /></p>
                    <p className="text-xs md:text-sm font-bold text-gray-200 dark:text-gray-300 uppercase tracking-widest mt-1 drop-shadow-sm">Satisfaction</p>
                  </div>
                  <div className="w-px h-12 bg-gradient-to-b from-transparent via-white/50 to-transparent hidden sm:block"></div>
                  <div className="text-center transition-transform hover:-translate-y-1 duration-300 cursor-default hidden sm:block">
                    <p className="text-3xl md:text-4xl font-black text-white drop-shadow-md"><AnimatedCounter end={24} suffix="/7" duration={1500} /></p>
                    <p className="text-xs md:text-sm font-bold text-gray-200 dark:text-gray-300 uppercase tracking-widest mt-1 drop-shadow-sm">Support</p>
                  </div>
              </div>
            </div>

            {/* ≡ƒû╝ Hero Image & Showcase */}
            

          </div>
        </div>
      </section>





      
      {/* Split Hero Banner Section */}
      <section className="py-12 md:py-16 px-4 md:px-8 relative bg-gray-50 dark:bg-black border-t border-b border-gray-200 dark:border-white/10">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Real-time account delivery",
                desc: "Receive logs details inside your dashboard with fast refresh.",
                icon: <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              },
              {
                title: "Wallet-powered checkout",
                desc: "Add funds to your wallet and complete checkout securely with one click.",
                icon: <Wallet className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              },
              {
                title: "Secure sessions",
                desc: "Every checkout session is strongly encrypted to keep your info safe.",
                icon: <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              },
              {
                title: "Country + service selection",
                desc: "Search across different global parameters instantly.",
                icon: <Globe2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              },
              {
                title: "Clean order history",
                desc: "Always revisit previous orders with perfectly sorted invoice logs.",
                icon: <History className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              },
              {
                title: "Total control",
                desc: "Manage your profile, wallet, and settings without hitting technical roadblocks.",
                icon: <Settings className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              }
            ].map((feature, i) => (
              <div key={i} className="rounded-xl bg-white dark:bg-[#09090b]/60 border border-gray-200 dark:border-gray-700/50 p-4 md:p-5 flex flex-col justify-between relative overflow-hidden group transition-all duration-300 hover:-translate-y-1">
                <div className="space-y-3 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/40 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-sm md:text-base font-medium text-gray-900 dark:text-white leading-tight">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-[11px] md:text-xs font-normal leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700/50 relative z-10 w-full">
                  <button 
                    onClick={() => navigate("/auth")}
                    className="flex justify-between items-center w-full text-[11px] md:text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors group-hover:pr-2 duration-300"
                  >
                    Learn more <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Products and Categories */}
      <div className="px-6 md:px-8">
        <div className="max-w-7xl mx-auto">
          <Button
            type="button"
            onClick={() => navigate("/?focusSearch=1")}
            variant="outline"
            className="w-full md:max-w-xl mx-auto flex justify-start rounded-full h-11 text-gray-500 dark:text-gray-300"
          >
            Search for products ...
          </Button>
        </div>
      </div>

      <CategoryBanners />

      {/* Floating Social Support Icons */}
      <div className="fixed bottom-8 left-6 z-50">
        <a
          href="https://chat.whatsapp.com/HCE6nkuaxXm4j2ugwW5exb"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl hover:scale-110 transition-all duration-300"
          aria-label="Contact us on WhatsApp"
        >
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>
      </div>

      <div className="fixed bottom-8 right-6 z-50">
        <a
          href="https://t.me/+0v09JFhl1sZjYTlk"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 group"
          aria-label="Contact us on Telegram"
        >
          <div className="flex items-center justify-center w-14 h-14 bg-purple-500 hover:bg-purple-600 text-white rounded-full shadow-2xl group-hover:scale-110 transition-all duration-300">
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
          </div>
          <span className="text-xs font-medium text-gray-700 bg-white/80 backdrop-blur px-2 py-1 rounded-full shadow">online agent</span>
        </a>
      </div>
    </main>
  );
};

export default memo(Index);