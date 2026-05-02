import { Link } from "react-router-dom";
import { MessageSquare, Users, BookOpen, Calendar, ArrowRight, ShieldCheck, Zap, Sun, Moon } from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";

function LandingPage() {
  const { themeMode, toggleThemeMode } = useThemeStore();

  const isDark = themeMode === "dark";

  return (
    <div className={`min-h-screen ${isDark ? "bg-[#050b14] text-white" : "bg-[#f4f7fb] text-slate-900"} font-sans selection:bg-blue-500/30 overflow-hidden relative`}>
      
      {/* Abstract Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute top-[40%] left-[60%] w-[30vw] h-[30vw] rounded-full bg-purple-500/10 blur-[100px]" />
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 border-b ${isDark ? "bg-[#050b14]/70 border-white/5" : "bg-white/60 border-slate-200/50"} backdrop-blur-xl`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
              C
            </div>
            <span className="font-bold text-lg tracking-tight">CampusConnect</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleThemeMode}
              className={`p-2 rounded-full transition-colors ${isDark ? "text-slate-300 hover:bg-white/10" : "text-slate-600 hover:bg-slate-200/50"}`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link to="/login" className={`text-sm font-semibold transition-colors ${isDark ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900"}`}>
              Log in
            </Link>
            <Link to="/signup" className="text-sm font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-5 py-2 rounded-full transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 z-10">
        <div className="max-w-7xl mx-auto px-6 relative text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase mb-8 border backdrop-blur-md ${isDark ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-blue-50 text-blue-600 border-blue-200"}`}>
            <Zap className="w-3.5 h-3.5" />
            The Ultimate Campus App
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
            Connect. Collaborate. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">
              Conquer College.
            </span>
          </h1>
          <p className={`max-w-2xl mx-auto text-lg lg:text-xl mb-12 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Experience a WhatsApp-style real-time messaging platform built specifically for students, professors, and campus groups. Share resources, manage tasks, and never miss an update.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-base font-semibold px-8 py-4 rounded-full transition-all shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5">
              Start Chatting Now
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 text-base font-semibold px-8 py-4 rounded-full transition-all border backdrop-blur-md ${isDark ? "border-white/10 bg-white/5 hover:bg-white/10 text-white" : "border-slate-300/50 bg-white/50 hover:bg-white/80 text-slate-900"}`}>
              I already have an account
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Everything you need in one place</h2>
            <p className={`text-lg ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Say goodbye to fragmented communication. We've combined the best parts of modern chat apps with powerful class management tools.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Glassmorphic Feature Cards */}
            <FeatureCard 
              icon={<MessageSquare className="w-6 h-6" />} 
              title="Real-Time Messaging" 
              desc="Lightning-fast group and 1-on-1 chats. Share images, voice notes, and get read receipts instantly." 
              color="blue" 
              isDark={isDark} 
            />
            <FeatureCard 
              icon={<Users className="w-6 h-6" />} 
              title="Class Groups" 
              desc="Dedicated spaces for every class. Manage rosters, search for peers, and collaborate effortlessly." 
              color="indigo" 
              isDark={isDark} 
            />
            <FeatureCard 
              icon={<BookOpen className="w-6 h-6" />} 
              title="Resource Sharing" 
              desc="Organize PDFs, links, and study materials in one centralized class hub. No more lost links." 
              color="purple" 
              isDark={isDark} 
            />
            <FeatureCard 
              icon={<Calendar className="w-6 h-6" />} 
              title="Tasks & Events" 
              desc="Keep track of assignments, exams, and project deadlines directly within your class groups." 
              color="pink" 
              isDark={isDark} 
            />
            <FeatureCard 
              icon={<MessageSquare className="w-6 h-6" />} 
              title="Doubt Resolution" 
              desc="Ask questions and get answers from peers or teachers. Best answers get highlighted for everyone." 
              color="sky" 
              isDark={isDark} 
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-6 h-6" />} 
              title="Teacher Roles" 
              desc="Special permissions for instructors to manage groups, upload official resources, and moderate chats." 
              color="violet" 
              isDark={isDark} 
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className={`relative rounded-3xl overflow-hidden border backdrop-blur-xl p-12 text-center ${isDark ? "bg-blue-900/10 border-blue-500/20" : "bg-white/60 border-white/80 shadow-2xl shadow-blue-500/10"}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 pointer-events-none" />
            <h2 className="text-3xl lg:text-5xl font-bold mb-6 relative z-10">Ready to upgrade your campus life?</h2>
            <p className={`text-lg mb-10 relative z-10 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              Join thousands of students and educators already using CampusConnect.
            </p>
            <Link to="/signup" className="relative z-10 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-lg font-semibold px-10 py-4 rounded-full transition-all shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5">
              Create Free Account
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className={`relative z-10 py-8 border-t backdrop-blur-md ${isDark ? "bg-[#050b14]/50 border-white/5" : "bg-white/50 border-slate-200/50"}`}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
              C
            </div>
            <span className="font-semibold text-sm">CampusConnect</span>
          </div>
          <p className={`text-sm ${isDark ? "text-slate-500" : "text-slate-500"}`}>
            © {new Date().getFullYear()} CampusConnect. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc, color, isDark }) {
  // Mapping tailwind color strings dynamically is tricky, so we use a base approach:
  const iconColors = {
    blue: "text-blue-500 bg-blue-500/10",
    indigo: "text-indigo-500 bg-indigo-500/10",
    purple: "text-purple-500 bg-purple-500/10",
    pink: "text-pink-500 bg-pink-500/10",
    sky: "text-sky-500 bg-sky-500/10",
    violet: "text-violet-500 bg-violet-500/10",
  };

  return (
    <div className={`p-8 rounded-3xl border backdrop-blur-xl transition-all hover:-translate-y-1 ${
      isDark 
        ? "bg-white/[0.02] border-white/[0.05] hover:border-white/[0.1] hover:bg-white/[0.04]" 
        : "bg-white/60 border-white/80 shadow-xl shadow-slate-200/30 hover:shadow-2xl hover:shadow-blue-500/10"
    }`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${iconColors[color]}`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className={isDark ? "text-slate-400" : "text-slate-600"}>
        {desc}
      </p>
    </div>
  );
}

export default LandingPage;
