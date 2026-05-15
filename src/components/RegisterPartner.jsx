
import { useState } from 'react';
import { toast } from 'sonner';

export default function RegisterPartner({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ company_name: '', sector: 'Robotics', market: 'Europe', website: '', contact_email: '', description: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/register-partner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        toast.success("Successfully registered in the BridgeMatch Ecosystem!");
        onClose();
      }
    } catch (err) {
      toast.error("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[3rem] p-10 max-w-lg w-full shadow-2xl border border-blue-100">
        <h2 className="text-3xl font-black text-slate-800 mb-2 italic">JOIN THE ECOSYSTEM</h2>
        <p className="text-sm text-slate-500 mb-8 font-medium">Become a verified partner for Chinese startups.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <input type="text" placeholder="Company Name" required className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none font-bold" onChange={e => setData({...data, company_name: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <select className="w-full p-4 rounded-2xl bg-slate-50 font-bold outline-none" onChange={e => setData({...data, sector: e.target.value})}>
              <option>Robotics</option><option>EV & Battery</option><option>Smart Mobility</option>
            </select>
            <select className="w-full p-4 rounded-2xl bg-slate-50 font-bold outline-none" onChange={e => setData({...data, market: e.target.value})}>
              <option>Europe</option><option>North America</option>
            </select>
          </div>
          <input type="url" placeholder="Website URL" className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none font-bold" onChange={e => setData({...data, website: e.target.value})} />
          <textarea placeholder="Describe your GTM services..." className="w-full h-24 p-4 rounded-2xl bg-slate-50 border-none outline-none font-medium resize-none" onChange={e => setData({...data, description: e.target.value})} />
          
          <button disabled={loading} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-blue-200 active:scale-95">
            {loading ? 'REGISTERING...' : 'CONFIRM PARTNERSHIP'}
          </button>
          <button type="button" onClick={onClose} className="w-full text-slate-400 font-bold text-xs">CANCEL</button>
        </form>
      </div>
    </div>
  );
}