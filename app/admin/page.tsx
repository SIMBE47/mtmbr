"use client"

import { useState, useEffect } from 'react'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { Shield, CheckCircle2, XCircle, Store, AlertCircle } from 'lucide-react'

export default function Admin() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<any[]>([])
  const [stats, setStats] = useState({ total_stores: 0, pending_apps: 0, active_disputes: 0 })

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/'
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      if (profile?.role !== 'admin') {
        window.location.href = '/'
        return
      }

      setIsAdmin(true)
      
      const [appsRes, storesRes, ordersRes] = await Promise.all([
        supabase.from('applications').select('*, profiles(name)').order('created_at', { ascending: false }),
        supabase.from('stores').select('id', { count: 'exact' }),
        supabase.from('orders').select('id', { count: 'exact' }).eq('status', 'disputed')
      ])

      setApplications(appsRes.data || [])
      setStats({
        total_stores: storesRes.count || 0,
        pending_apps: (appsRes.data || []).filter(a => a.status === 'pending').length,
        active_disputes: ordersRes.count || 0
      })
      setLoading(false)
    }

    checkAdmin()
  }, [])

  const handleAppAction = async (app: any, status: 'approved' | 'rejected') => {
    setLoading(true)
    
    const { error: appError } = await supabase.from('applications').update({ status }).eq('id', app.id)
    if (appError) {
      alert('Error updating application')
      setLoading(false)
      return
    }

    if (status === 'approved') {
      const slug = app.store_name.toLowerCase().replace(/[^a-z0-9]/g, '-')
      const { error: storeError } = await supabase.from('stores').insert({
        owner_id: app.user_id,
        name: app.store_name,
        slug: slug,
        location: app.location,
        description: app.description,
        is_verified: true,
        status: 'verified',
        phone: app.phone,
        logo_image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1974&auto=format&fit=crop'
      })

      if (storeError) {
        console.error(storeError)
        alert('Error creating store.')
      } else {
        await supabase.from('profiles').update({ role: 'owner' }).eq('id', app.user_id)
        
        if (app.phone) {
          try {
            await supabase.functions.invoke('sms', {
              body: {
                to: app.phone.replace(/[^0-9]/g, ''),
                message: `THRIFTR: Congratulations! Your boutique ${app.store_name} has been approved. Log in to your dashboard to start listing.`
              }
            })
          } catch (smsErr) {
            console.error('SMS notification failed:', smsErr)
          }
        }
      }
    }

    window.location.reload()
  }

  if (!isAdmin || loading) return (
    <div className="min-h-screen bg-soft-black flex items-center justify-center">
      <div className="font-bubbly text-4xl animate-pulse text-lime">ADMIN PANEL...</div>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 pt-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-16">
             <div className="w-12 h-12 bg-lime rounded-full flex items-center justify-center text-black">
               <Shield size={24} />
             </div>
             <div>
                <h1 className="font-fashion text-5xl md:text-7xl font-bold tracking-tighter uppercase leading-none">ADMIN PANEL</h1>
                <p className="font-editorial italic text-xl text-muted-gray">Secure marketplace governance.</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="bg-charcoal p-8 rounded-sm border border-white/5">
              <Store className="text-lime mb-4" size={24} />
              <span className="font-display font-black text-3xl block mb-1">{stats.total_stores}</span>
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Active Boutiques</span>
            </div>
            <div className="bg-charcoal p-8 rounded-sm border border-white/5">
              <CheckCircle2 className="text-lime mb-4" size={24} />
              <span className="font-display font-black text-3xl block mb-1">{stats.pending_apps}</span>
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Pending Reviews</span>
            </div>
            <div className="bg-charcoal p-8 rounded-sm border border-white/5">
              <AlertCircle className="text-burgundy mb-4" size={24} />
              <span className="font-display font-black text-3xl block mb-1">{stats.active_disputes}</span>
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Open Disputes</span>
            </div>
          </div>

          <h3 className="font-display font-bold text-xs uppercase tracking-widest text-white/40 mb-8">Boutique Applications</h3>
          
          <div className="space-y-4">
            {applications.length > 0 ? (
              applications.map(app => (
                <div key={app.id} className="bg-charcoal border border-white/5 rounded-sm p-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                         <h4 className="font-fashion text-2xl font-bold uppercase tracking-tight">{app.store_name}</h4>
                         <span className={cn(
                           "text-[9px] font-black px-2 py-1 rounded-sm uppercase tracking-tighter",
                           app.status === 'pending' ? "bg-white/10 text-white/50" : 
                           app.status === 'approved' ? "bg-lime text-black" : "bg-burgundy text-white"
                         )}>{app.status}</span>
                      </div>
                      <p className="text-xs text-muted-gray mb-4">Applied by: <span className="text-white font-bold">{app.profiles?.name || 'Anonymous'}</span> • {new Date(app.created_at).toLocaleDateString()}</p>
                      <p className="font-editorial italic text-lg text-white/70 max-w-2xl leading-relaxed">{app.description}</p>
                    </div>
                    
                    {app.status === 'pending' && (
                      <div className="flex gap-4">
                        <button 
                          onClick={() => handleAppAction(app, 'rejected')}
                          className="bg-white/5 border border-white/10 p-4 rounded-full hover:bg-burgundy/20 hover:text-burgundy transition-all"
                        >
                          <XCircle size={20} />
                        </button>
                        <button 
                          onClick={() => handleAppAction(app, 'approved')}
                          className="bg-lime text-black font-display font-black text-xs px-10 py-4 rounded-full hover:scale-105 transition-all"
                        >
                          APPROVE STORE
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center bg-charcoal border border-dashed border-white/10 rounded-sm">
                 <p className="font-editorial italic text-2xl text-muted-gray">No applications to review.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
