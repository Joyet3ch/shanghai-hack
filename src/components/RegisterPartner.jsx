import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { X, Building2, Globe2, Briefcase, CheckCircle2, Link2, Mail } from 'lucide-react';

export default function RegisterPartner({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    email: '',
    sector: 'New Energy Vehicles & Battery Tech', // Default
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
            contact_email: formData.email,       // NOME ESATTO DAL TUO SCREENSHOT
            sector: formData.sector,
            market: formData.country,            // NOME ESATTO DAL TUO SCREENSHOT
            country: formData.country,           // NOME ESATTO DAL TUO SCREENSHOT
            website: formData.website,
            description: formData.description,   // NOME ESATTO DAL TUO SCREENSHOT
            is_verified: true
          }
        ]);

      if (error) throw error;

      toast.success('Registration successful! Welcome to BridgeMatch.');
      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Database Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 text-left">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        
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
          {/* RIGA 1: Nome Azienda & Email */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Company Name</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input required value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all"
                  placeholder="e.g. Continental" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all"
                  placeholder="info@company.com" />
              </div>
            </div>
          </div>

          {/* RIGA 2: Region & Settore */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Region</label>
              <div className="relative">
                <Globe2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <select value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white outline-none focus:border-blue-500 appearance-none transition-all">
                  <option value="Europe">Europe</option>
                  <option value="North America">North America</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Specialized Sector</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <select value={formData.sector} onChange={e => setFormData({...formData, sector: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-white outline-none focus:border-blue-500 appearance-none transition-all">
                  <option>New Energy Vehicles & Battery Tech</option>
                  <option>Robotics & Embodied AI</option>
                  <option>Clean Energy & Renewables</option>
                  <option>AI & Enterprise Software</option>
                  <option>Autonomous Driving & Smart Mobility</option>
                  <option>Consumer Tech & Cross-Border DTC</option>
                </select>
              </div>
            </div>
          </div>

          {/* RIGA 3: Website */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Website (e.g. site.com)</label>
            <div className="relative">
              <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input type="text" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all"
                placeholder="continental.com" />
            </div>
          </div>

          {/* RIGA 4: Descrizione */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Partnership Value Prop</label>
            <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full h-20 bg-slate-800 border border-slate-700 rounded-2xl py-4 px-6 text-sm font-medium text-white outline-none resize-none focus:border-blue-500 transition-all"
              placeholder="What are you looking for in a tech partnership?" />
          </div>

          <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-blue-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2">
            {loading ? 'REGISTERING...' : <><CheckCircle2 size={18} /> SUBMIT APPLICATION</>}
          </button>
        </form>
      </div>
    </div>
  );
}import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { X, Building2, Globe2, Briefcase, CheckCircle2, Link2, Mail } from 'lucide-react';

export default function RegisterPartner({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    email: '',
    sector: 'New Energy Vehicles & Battery Tech', // Default
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
            contact_email: formData.email,       // NOME ESATTO DAL TUO SCREENSHOT
            sector: formData.sector,
            market: formData.country,            // NOME ESATTO DAL TUO SCREENSHOT
            country: formData.country,           // NOME ESATTO DAL TUO SCREENSHOT
            website: formData.website,
            description: formData.description,   // NOME ESATTO DAL TUO SCREENSHOT
            is_verified: true
          }
        ]);

      if (error) throw error;

      toast.success('Registration successful! Welcome to BridgeMatch.');
      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Database Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 text-left">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        
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
          {/* RIGA 1: Nome Azienda & Email */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Company Name</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input required value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all"
                  placeholder="e.g. Continental" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all"
                  placeholder="info@company.com" />
              </div>
            </div>
          </div>

          {/* RIGA 2: Region & Settore */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Region</label>
              <div className="relative">
                <Globe2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <select value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white outline-none focus:border-blue-500 appearance-none transition-all">
                  <option value="Europe">Europe</option>
                  <option value="North America">North America</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Specialized Sector</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <select value={formData.sector} onChange={e => setFormData({...formData, sector: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-white outline-none focus:border-blue-500 appearance-none transition-all">
                  <option>New Energy Vehicles & Battery Tech</option>
                  <option>Robotics & Embodied AI</option>
                  <option>Clean Energy & Renewables</option>
                  <option>AI & Enterprise Software</option>
                  <option>Autonomous Driving & Smart Mobility</option>
                  <option>Consumer Tech & Cross-Border DTC</option>
                </select>
              </div>
            </div>
          </div>

          {/* RIGA 3: Website */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Website (e.g. site.com)</label>
            <div className="relative">
              <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input type="text" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all"
                placeholder="continental.com" />
            </div>
          </div>

          {/* RIGA 4: Descrizione */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Partnership Value Prop</label>
            <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full h-20 bg-slate-800 border border-slate-700 rounded-2xl py-4 px-6 text-sm font-medium text-white outline-none resize-none focus:border-blue-500 transition-all"
              placeholder="What are you looking for in a tech partnership?" />
          </div>

          <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-blue-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2">
            {loading ? 'REGISTERING...' : <><CheckCircle2 size={18} /> SUBMIT APPLICATION</>}
          </button>
        </form>
      </div>
    </div>
  );
}import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { X, Building2, Globe2, Briefcase, CheckCircle2, Link2, Mail } from 'lucide-react';

export default function RegisterPartner({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    email: '',
    sector: 'New Energy Vehicles & Battery Tech', // Default
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
            contact_email: formData.email,       // NOME ESATTO DAL TUO SCREENSHOT
            sector: formData.sector,
            market: formData.country,            // NOME ESATTO DAL TUO SCREENSHOT
            country: formData.country,           // NOME ESATTO DAL TUO SCREENSHOT
            website: formData.website,
            description: formData.description,   // NOME ESATTO DAL TUO SCREENSHOT
            is_verified: true
          }
        ]);

      if (error) throw error;

      toast.success('Registration successful! Welcome to BridgeMatch.');
      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Database Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 text-left">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        
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
          {/* RIGA 1: Nome Azienda & Email */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Company Name</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input required value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all"
                  placeholder="e.g. Continental" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all"
                  placeholder="info@company.com" />
              </div>
            </div>
          </div>

          {/* RIGA 2: Region & Settore */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Region</label>
              <div className="relative">
                <Globe2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <select value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white outline-none focus:border-blue-500 appearance-none transition-all">
                  <option value="Europe">Europe</option>
                  <option value="North America">North America</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Specialized Sector</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <select value={formData.sector} onChange={e => setFormData({...formData, sector: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-white outline-none focus:border-blue-500 appearance-none transition-all">
                  <option>New Energy Vehicles & Battery Tech</option>
                  <option>Robotics & Embodied AI</option>
                  <option>Clean Energy & Renewables</option>
                  <option>AI & Enterprise Software</option>
                  <option>Autonomous Driving & Smart Mobility</option>
                  <option>Consumer Tech & Cross-Border DTC</option>
                </select>
              </div>
            </div>
          </div>

          {/* RIGA 3: Website */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Website (e.g. site.com)</label>
            <div className="relative">
              <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input type="text" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all"
                placeholder="continental.com" />
            </div>
          </div>

          {/* RIGA 4: Descrizione */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Partnership Value Prop</label>
            <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full h-20 bg-slate-800 border border-slate-700 rounded-2xl py-4 px-6 text-sm font-medium text-white outline-none resize-none focus:border-blue-500 transition-all"
              placeholder="What are you looking for in a tech partnership?" />
          </div>

          <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-blue-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2">
            {loading ? 'REGISTERING...' : <><CheckCircle2 size={18} /> SUBMIT APPLICATION</>}
          </button>
        </form>
      </div>
    </div>
  );
}