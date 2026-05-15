import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { X, Building2, Globe2, Briefcase, CheckCircle2, Link2, AlignLeft } from 'lucide-react';

export default function RegisterPartner({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    sector: 'Robotics',
    country: 'Europe',
    website: '',
    description: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('partners')
        .insert([
          {
            company_name: formData.company_name,
            sector: formData.sector,
            country: formData.country, // Colonna nuova
            market: formData.country,  // Colonna vecchia (per sicurezza)
            website: formData.website,
            why_they_match: formData.description, // Colonna nuova
            description: formData.description,     // Colonna vecchia (per sicurezza)
            is_verified: true
          }
        ]);

      if (error) throw error;

      toast.success('Partner registrato con successo!');
      onClose();
    } catch (error) {
      console.error('Errore invio:', error);
      toast.error('Errore di salvataggio: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 text-left">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
          <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Become a Partner</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Company Name</label>
              <input required value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 px-6 text-sm font-bold text-white outline-none focus:border-blue-500" placeholder="e.g. Continental" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Region</label>
              <select value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 px-6 text-sm font-bold text-white outline-none focus:border-blue-500 appearance-none">
                <option value="Europe">Europe</option>
                <option value="North America">North America</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Specialized Sector</label>
            <select value={formData.sector} onChange={e => setFormData({...formData, sector: e.target.value})}
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 px-6 text-sm font-bold text-white outline-none focus:border-blue-500 appearance-none">
              <option>Robotics</option>
              <option>EV & Battery</option>
              <option>Smart Mobility</option>
              <option>AI & Enterprise Software</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Website (e.g. site.com)</label>
            <input value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})}
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 px-6 text-sm font-bold text-white outline-none focus:border-blue-500" placeholder="continental.com" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Company Description</label>
            <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full h-24 bg-slate-800 border border-slate-700 rounded-2xl py-4 px-6 text-sm font-medium text-white outline-none resize-none focus:border-blue-500"
              placeholder="Describe your ADAS sensor suites, Robotics platform, etc." />
          </div>

          <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-[1.5rem] shadow-xl disabled:opacity-50 mt-4 transition-all">
            {loading ? 'SAVING...' : 'REGISTER AS PARTNER'}
          </button>
        </form>
      </div>
    </div>
  );
}