import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

export const ContactForm = () => {
  const [formData, setFormData] = useState({ name: '', email: '', company: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      await addDoc(collection(db, 'leads'), {
        ...formData,
        createdAt: new Date().toISOString(),
      });
      setStatus('success');
      setFormData({ name: '', email: '', company: '', message: '' });
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      console.error("Error submitting form:", error);
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="py-32 px-6 bg-surface relative overflow-hidden border-t border-text/5">
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Request a Consultation</h2>
          <p className="text-text/60 text-lg max-w-2xl mx-auto">
            Partner with Survvi Opulence Insights to navigate industrial complexities and secure your market position.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6 bg-background p-8 md:p-12 rounded-2xl border border-text/5 shadow-2xl">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text/80 uppercase tracking-wider">Full Name</label>
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-surface border border-text/10 rounded-lg px-4 py-3 text-text focus:outline-none focus:border-brand transition-colors"
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text/80 uppercase tracking-wider">Work Email</label>
              <input 
                required
                type="email" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full bg-surface border border-text/10 rounded-lg px-4 py-3 text-text focus:outline-none focus:border-brand transition-colors"
                placeholder="john@company.com"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text/80 uppercase tracking-wider">Company</label>
            <input 
              required
              type="text" 
              value={formData.company}
              onChange={e => setFormData({...formData, company: e.target.value})}
              className="w-full bg-surface border border-text/10 rounded-lg px-4 py-3 text-text focus:outline-none focus:border-brand transition-colors"
              placeholder="Organization Name"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text/80 uppercase tracking-wider">How can we help?</label>
            <textarea 
              required
              rows={4}
              value={formData.message}
              onChange={e => setFormData({...formData, message: e.target.value})}
              className="w-full bg-surface border border-text/10 rounded-lg px-4 py-3 text-text focus:outline-none focus:border-brand transition-colors resize-none"
              placeholder="Describe your strategic challenges..."
            />
          </div>
          
          <button 
            type="submit" 
            disabled={status === 'submitting'}
            className="w-full bg-brand text-text py-4 rounded-lg font-bold hover:bg-brand/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {status === 'submitting' ? 'Submitting...' : status === 'success' ? 'Message Sent!' : 'Submit Request'}
            {status === 'idle' && <Send className="w-4 h-4" />}
          </button>
          
          {status === 'error' && (
            <p className="text-red-500 text-sm text-center mt-2">There was an error submitting your request. Please try again.</p>
          )}
        </form>
      </div>
    </section>
  );
};
