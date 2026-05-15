import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { X, Building2, Globe2, Briefcase, CheckCircle2 } from 'lucide-react';

export default function RegisterPartner({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    sector: 'Robotics',
    country: '',
    website: '',
    description: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Inserimento diretto nella tabella 'partners' di Supabase
      const { error } = await supabase
        .from('partners')
        .insert([
          {
            company_name: formData.company_name,
            sector: formData.sector,
            country: formData.country,
            website: formData.website,
            why_they_match: formData.description, // Usiamo questo campo per la descrizione
            is_verified: true // Essendo una registrazione ufficiale, lo segniamo come verificato
          }
        ]);

      if (error) throw error;

      toast.success('Registration successful! You are now a BridgeMatch partner.');
      setFormData({ company_name: '', sector: 'Robotics', country: '', website: '', description: '' });
      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to register: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        
        <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tighter italic uppercase">Join the Network</h2>
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Become a Vetted Western Partner</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Company Name</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input required value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all"
                  placeholder="e.g. ABB Robotics" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Country</label>
              <div className="relative">
                <Globe2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input required value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all"
                  placeholder="e.g. Germany" />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Specialized Sector</label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <select value={formData.sector} onChange={e => setFormData({...formData, sector: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white outline-none focus:border-blue-500 appearance-none transition-all">
                <option>Robotics</option>
                <option>EV & Battery</option>
                <option>Smart Mobility</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Website URL</label>
            <input type="url" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})}
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 px-6 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all"
              placeholder="https://www.company.com" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Partnership Value Prop</label>
            <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full h-24 bg-slate-800 border border-slate-700 rounded-2xl py-4 px-6 text-sm font-medium text-white outline-none resize-none focus:border-blue-500 transition-all"
              placeholder="What kind of startups are you looking to partner with?" />
          </div>

          <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-blue-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4">
            {loading ? 'REGISTERING...' : <><CheckCircle2 size={18} /> REGISTER AS PARTNER</>}
          </button>
        </form>
      </div>
    </div>
  );
}