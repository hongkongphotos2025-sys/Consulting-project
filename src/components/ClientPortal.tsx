import React, { useState, useEffect } from 'react';
import { Shield, Lock, LogOut, FileText, Download, TrendingUp, ArrowRight, Briefcase, ExternalLink } from 'lucide-react';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';

export const ClientPortal = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="py-32 px-6 flex justify-center items-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <section id="client-portal" className="py-32 px-6 bg-background relative overflow-hidden border-t border-text/5">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Shield className="w-16 h-16 text-brand mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Client Portal</h2>
          <p className="text-text/60 text-lg max-w-2xl mx-auto mb-12">
            Access exclusive research reports, predictive models, and personalized data exports.
          </p>
          <button 
            onClick={handleLogin}
            className="bg-brand text-text px-10 py-4 rounded-full font-bold hover:bg-brand/90 transition-all flex items-center justify-center gap-2 mx-auto"
          >
            <Lock className="w-5 h-5" />
            Sign in with Google
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="client-portal" className="py-32 px-6 bg-surface relative overflow-hidden border-t border-text/5">
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Welcome, {user.displayName}</h2>
            <p className="text-text/60 text-lg">Your exclusive insights and reports are ready.</p>
          </div>
          <button 
            onClick={handleLogout}
            className="border border-text/20 text-text px-6 py-2 rounded-full font-medium hover:bg-text/5 transition-all flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-background p-8 rounded-2xl border border-text/5 shadow-lg">
            <FileText className="w-10 h-10 text-brand mb-6" />
            <h3 className="text-xl font-bold mb-4">Q3 Supply Chain Report</h3>
            <p className="text-text/60 mb-6 text-sm">Deep dive into global logistics bottlenecks and mitigation strategies.</p>
            <button className="text-brand font-bold flex items-center gap-2 hover:gap-3 transition-all text-sm">
              Download PDF <Download className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-background p-8 rounded-2xl border border-text/5 shadow-lg">
            <TrendingUp className="w-10 h-10 text-brand mb-6" />
            <h3 className="text-xl font-bold mb-4">Energy Cost Forecast</h3>
            <p className="text-text/60 mb-6 text-sm">Predictive models for European energy markets through 2027.</p>
            <button className="text-brand font-bold flex items-center gap-2 hover:gap-3 transition-all text-sm">
              View Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-background p-8 rounded-2xl border border-text/5 shadow-lg">
            <Briefcase className="w-10 h-10 text-brand mb-6" />
            <h3 className="text-xl font-bold mb-4">Your Custom Models</h3>
            <p className="text-text/60 mb-6 text-sm">Access the proprietary models built specifically for your organization.</p>
            <button className="text-brand font-bold flex items-center gap-2 hover:gap-3 transition-all text-sm">
              Open Workspace <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
