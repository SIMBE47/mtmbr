"use client"

import { useState } from 'react'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import { supabase } from '@/lib/supabase'
import { CheckCircle2, Store, MapPin, ClipboardList, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Enroll() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    store_name: '',
    description: '',
    location: '',
    phone: '',
    instagram: '',
  })
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      alert('Please login first to apply.')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('applications').insert({
      user_id: user.id,
      store_name: formData.store_name,
      description: formData.description,
      location: formData.location,
      phone: formData.phone,
      instagram: formData.instagram
    })

    if (error) {
      console.error(error)
      alert('Error submitting application.')
    } else {
      setCompleted(true)
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 pt-32 px-6 flex items-center justify-center">
        <div className="max-w-xl w-full">
          {completed ? (
            <div className="text-center animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-lime rounded-full flex items-center justify-center mx-auto mb-8 text-black">
                <CheckCircle2 size={40} />
              </div>
              <h1 className="font-fashion text-4xl font-bold mb-4 uppercase tracking-tighter">APPLICATION RECEIVED</h1>
              <p className="font-editorial italic text-xl text-muted-gray mb-10">
                Our team will review your boutique&apos;s profile and reach out within 48 hours for verification.
              </p>
              <button onClick={() => window.location.href = '/'} className="bg-white text-black font-display font-black text-xs px-10 py-5 rounded-full uppercase">Return Home</button>
            </div>
          ) : (
            <>
              <div className="text-center mb-16">
                <h1 className="font-fashion text-6xl font-bold mb-6 tracking-tighter uppercase leading-none">JOIN THE MALL</h1>
                <p className="font-editorial italic text-2xl text-muted-gray leading-tight">Scale your boutique with secure payments and professional delivery.</p>
              </div>

              <div className="bg-charcoal p-10 rounded-sm border border-white/5">
                <div className="flex justify-between mb-10">
                  {[1, 2, 3].map(i => (
                    <div key={i} className={cn(
                      "w-full h-1 rounded-full mx-1",
                      step >= i ? "bg-lime" : "bg-white/10"
                    )} />
                  ))}
                </div>

                {step === 1 && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="flex items-center gap-3 mb-8 text-lime">
                      <Store size={20} />
                      <h3 className="font-display font-bold text-xs uppercase tracking-widest">Boutique Name</h3>
                    </div>
                    <input 
                      type="text" 
                      placeholder="e.g. Think Twice Select"
                      className="w-full bg-soft-black border border-white/10 rounded-sm px-6 py-5 font-display text-lg focus:outline-none focus:border-lime transition-all mb-10"
                      value={formData.store_name}
                      onChange={e => setFormData({...formData, store_name: e.target.value})}
                    />
                    <button 
                      onClick={() => setStep(2)} 
                      disabled={!formData.store_name}
                      className="w-full bg-lime text-black font-display font-black text-sm py-5 rounded-full flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      CONTINUE <ArrowRight size={18} />
                    </button>
                  </div>
                )}

                {step === 2 && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="flex items-center gap-3 mb-8 text-lime">
                      <MapPin size={20} />
                      <h3 className="font-display font-bold text-xs uppercase tracking-widest">Physical Location</h3>
                    </div>
                    <input 
                      type="text" 
                      placeholder="e.g. Westlands, Nairobi"
                      className="w-full bg-soft-black border border-white/10 rounded-sm px-6 py-5 font-display text-lg focus:outline-none focus:border-lime transition-all mb-10"
                      value={formData.location}
                      onChange={e => setFormData({...formData, location: e.target.value})}
                    />
                    <input 
                      type="tel" 
                      placeholder="Store contact number e.g. 254712345678"
                      className="w-full bg-soft-black border border-white/10 rounded-sm px-6 py-5 font-display text-lg focus:outline-none focus:border-lime transition-all mb-10"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                    <input 
                      type="text" 
                      placeholder="Instagram handle e.g. @yourstore"
                      className="w-full bg-soft-black border border-white/10 rounded-sm px-6 py-5 font-display text-lg focus:outline-none focus:border-lime transition-all mb-10"
                      value={formData.instagram}
                      onChange={e => setFormData({...formData, instagram: e.target.value})}
                    />
                    <div className="flex gap-4">
                      <button onClick={() => setStep(1)} className="flex-1 border border-white/10 font-display font-bold text-xs py-5 rounded-full uppercase">Back</button>
                      <button 
                        onClick={() => setStep(3)} 
                        disabled={!formData.location || !formData.phone}
                        className="flex-[2] bg-lime text-black font-display font-black text-sm py-5 rounded-full flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        CONTINUE <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="flex items-center gap-3 mb-8 text-lime">
                      <ClipboardList size={20} />
                      <h3 className="font-display font-bold text-xs uppercase tracking-widest">Store Bio</h3>
                    </div>
                    <textarea 
                      rows={4}
                      placeholder="Tell us about your curated collection..."
                      className="w-full bg-soft-black border border-white/10 rounded-sm px-6 py-5 font-display text-sm focus:outline-none focus:border-lime transition-all mb-10 resize-none"
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                    <div className="flex gap-4">
                      <button onClick={() => setStep(2)} className="flex-1 border border-white/10 font-display font-bold text-xs py-5 rounded-full uppercase">Back</button>
                      <button 
                        onClick={handleSubmit} 
                        disabled={loading || !formData.description}
                        className="flex-[2] bg-lime text-black font-display font-black text-sm py-5 rounded-full flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {loading ? 'SUBMITTING...' : 'COMPLETE APPLICATION'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
