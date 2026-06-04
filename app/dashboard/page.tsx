"use client"

import { useState, useEffect } from 'react'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import { supabase } from '@/lib/supabase'
import { formatCurrency, cn } from '@/lib/utils'
import Image from 'next/image'
import { Store, User, ExternalLink, Plus, X, Upload, CheckCircle2 } from 'lucide-react'

export default function Dashboard() {
  const [, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [store, setStore] = useState<any>(null)
  const [listings, setListings] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'listings' | 'orders'>('orders')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [newListing, setNewListing] = useState({
    name: '',
    price: '',
    category: 'Tops',
    size: '',
    grade: 'A',
    brand: '',
    description: '',
    imageUrls: ''
  })

  useEffect(() => {
    async function loadDashboard() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/'
        return
      }
      setUser(user)

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(profile)

      const { data: storeData } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', user.id)
        .single()
      
      setStore(storeData)

      if (storeData) {
        const [listingsRes, ordersRes] = await Promise.all([
          supabase.from('listings').select('*').eq('store_id', storeData.id).order('created_at', { ascending: false }),
          supabase.from('orders').select('*').eq('store_id', storeData.id).order('created_at', { ascending: false })
        ])
        setListings(listingsRes.data || [])
        setOrders(ordersRes.data || [])
      } else {
        const { data: buyerOrders } = await supabase
          .from('orders')
          .select('*')
          .eq('buyer_id', user.id)
          .order('created_at', { ascending: false })
        setOrders(buyerOrders || [])
      }
      setLoading(false)
    }

    loadDashboard()
  }, [])

  const updateOrderStatus = async (order: any, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', order.id)
    
    if (error) {
      alert('Error updating order')
      return
    }

    // Connect SMS Triggers
    try {
      let smsMessage = ''
      let recipientPhone = ''

      if (newStatus === 'ready') {
        smsMessage = `THRIFTR: Your order for ${order.listing_name} is ready! Packaging complete and courier is being dispatched.`
        recipientPhone = order.phone_number
      } else if (newStatus === 'delivered') {
        smsMessage = `THRIFTR: Your item ${order.listing_name} has been delivered. Please confirm receipt in your dashboard to release payment.`
        recipientPhone = order.phone_number
      } else if (newStatus === 'completed') {
        smsMessage = `THRIFTR: Payment of ${formatCurrency(order.total_amount)} for ${order.listing_name} has been released to your M-Pesa.`
        const { data: storeContact } = await supabase
          .from('stores')
          .select('phone')
          .eq('id', order.store_id)
          .single()
        recipientPhone = storeContact?.phone || ''
      }

      if (smsMessage && recipientPhone) {
        await supabase.functions.invoke('sms', {
          body: { to: recipientPhone.replace(/[^0-9]/g, ''), message: smsMessage }
        })
      }
    } catch (smsErr) {
      console.error('SMS notification failed:', smsErr)
    }

    setOrders(orders.map(o => o.id === order.id ? { ...o, status: newStatus } : o))
  }

  const handleAddListing = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!store) return
    setSubmitting(true)

    try {
      const imageUrls = newListing.imageUrls
        .split(/[\n,]+/)
        .map(url => url.trim())
        .filter(Boolean)

      const { data, error } = await supabase.from('listings').insert({
        store_id: store.id,
        store_name: store.name,
        name: newListing.name,
        price: parseFloat(newListing.price),
        category: newListing.category,
        size: newListing.size,
        grade: newListing.grade,
        brand: newListing.brand,
        description: newListing.description,
        images: imageUrls,
        status: 'available'
      }).select().single()

      if (error) throw error

      setListings([data, ...listings])
      setIsModalOpen(false)
      setNewListing({
        name: '',
        price: '',
        category: 'Tops',
        size: '',
        grade: 'A',
        brand: '',
        description: '',
        imageUrls: ''
      })
    } catch (err) {
      console.error(err)
      alert('Error adding listing')
    }
    setSubmitting(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-soft-black flex items-center justify-center">
      <div className="font-bubbly text-4xl animate-pulse text-lime">LOADING...</div>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 pt-32 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-charcoal rounded-full border border-white/10 flex items-center justify-center text-lime">
                {store ? <Store size={32} /> : <User size={32} />}
              </div>
              <div>
                <h1 className="font-fashion text-5xl md:text-7xl font-bold tracking-tighter uppercase leading-none">
                  {store ? store.name : profile?.name || 'MY ACCOUNT'}
                </h1>
                <p className="font-editorial italic text-xl text-muted-gray">
                  {store ? 'Boutique Dashboard' : 'Buyer Profile & Orders'}
                </p>
              </div>
            </div>
            
            {store && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-lime text-black font-display font-black text-xs px-10 py-5 rounded-full flex items-center gap-2 hover:scale-105 transition-all"
              >
                <Plus size={18} /> ADD LISTING
              </button>
            )}
          </div>

          {/* Stats & Tabs */}
          <div className="flex flex-wrap gap-4 mb-10 border-b border-white/5 pb-10">
             {store && (
                <button
                  onClick={() => setActiveTab('listings')}
                  className={cn(
                    "font-display font-black text-xs uppercase tracking-widest px-8 py-4 rounded-sm transition-all",
                    activeTab === 'listings' ? "bg-white text-black" : "text-white/40 hover:text-white"
                  )}
                >
                  Listings ({listings.length})
                </button>
             )}
             <button
               onClick={() => setActiveTab('orders')}
               className={cn(
                 "font-display font-black text-xs uppercase tracking-widest px-8 py-4 rounded-sm transition-all",
                 activeTab === 'orders' ? "bg-white text-black" : "text-white/40 hover:text-white"
               )}
             >
               Orders ({orders.length})
             </button>
          </div>

          {/* Listings Tab */}
          {activeTab === 'listings' && store && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-500">
               {listings.map(item => (
                 <div key={item.id} className="bg-charcoal border border-white/5 rounded-sm overflow-hidden group">
                   <div className="relative aspect-[4/5] overflow-hidden bg-soft-black">
                     <Image
                       src={item.images?.[0] || ''}
                       alt={item.name}
                       fill
                       className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                     />
                     <div className="absolute top-4 left-4 bg-lime text-black font-display font-black text-[10px] px-2 py-1 rounded-sm uppercase tracking-tighter">
                       {item.status}
                     </div>
                   </div>
                   <div className="p-6">
                      <h4 className="font-display font-bold text-sm uppercase mb-1 truncate">{item.name}</h4>
                      <p className="font-display font-black text-lime">{formatCurrency(item.price)}</p>
                   </div>
                 </div>
               ))}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-4 animate-in fade-in duration-500">
               {orders.length > 0 ? (
                 orders.map(order => (
                   <div key={order.id} className="bg-charcoal border border-white/5 rounded-sm p-8 flex flex-col md:flex-row items-center justify-between gap-10">
                      <div className="flex items-center gap-6 w-full md:w-auto">
                         <div className="relative w-16 h-20 bg-soft-black rounded-sm overflow-hidden flex-shrink-0">
                           <Image src={order.listing_image || ''} alt="" fill className="object-cover grayscale" />
                         </div>
                         <div>
                            <h4 className="font-display font-bold text-sm uppercase mb-1">{order.listing_name}</h4>
                            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">ORDER #{order.id.slice(0,8)}</p>
                         </div>
                      </div>
                      <div className="flex flex-wrap gap-12 text-center md:text-left">
                         <div>
                            <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest block mb-1">Amount</span>
                            <span className="font-display font-black text-sm">{formatCurrency(order.total_amount)}</span>
                         </div>
                         <div>
                            <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest block mb-1">Method</span>
                            <span className="font-display font-bold text-xs uppercase">{order.delivery_method}</span>
                         </div>
                         <div>
                            <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest block mb-1">Status</span>
                            <span className="bg-white/5 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter border border-white/10">{order.status}</span>
                         </div>
                      </div>
                      
                      <div className="flex gap-3">
                        {store && order.status === 'paid' && (
                          <button 
                            onClick={() => updateOrderStatus(order, 'ready')}
                            className="bg-lime text-black font-display font-black text-[10px] px-4 py-2 rounded-full uppercase"
                          >
                            Mark Ready
                          </button>
                        )}
                        {store && order.status === 'ready' && (
                          <button 
                            onClick={() => updateOrderStatus(order, 'delivered')}
                            className="bg-lime text-black font-display font-black text-[10px] px-4 py-2 rounded-full uppercase"
                          >
                            Mark Delivered
                          </button>
                        )}
                        {!store && order.status === 'delivered' && (
                          <button 
                            onClick={() => updateOrderStatus(order, 'completed')}
                            className="bg-lime text-black font-display font-black text-[10px] px-4 py-2 rounded-full uppercase flex items-center gap-2"
                          >
                            <CheckCircle2 size={12} /> Confirm Receipt
                          </button>
                        )}
                        {order.uber_tracking_url && (
                           <a
                             href={order.uber_tracking_url}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="text-white/30 hover:text-lime transition-colors"
                           >
                             <ExternalLink size={20} />
                           </a>
                        )}
                      </div>
                   </div>
                 ))
               ) : (
                 <div className="py-20 text-center border border-dashed border-white/5 rounded-sm">
                    <p className="font-editorial italic text-2xl text-muted-gray">No activity to show yet.</p>
                 </div>
               )}
            </div>
          )}
        </div>
      </main>

      {/* Add Listing Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-soft-black/90 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-charcoal border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-sm p-10">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-white/30 hover:text-white"
            >
              <X size={24} />
            </button>

            <h2 className="font-fashion text-4xl font-bold mb-10 tracking-tighter uppercase">Add New Listing</h2>

            <form onSubmit={handleAddListing} className="space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="font-display text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 block">Item Name</label>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-soft-black border border-white/10 rounded-sm px-4 py-3 font-display text-sm focus:outline-none focus:border-lime transition-all"
                      value={newListing.name}
                      onChange={e => setNewListing({...newListing, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="font-display text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 block">Price (KES)</label>
                    <input 
                      required
                      type="number" 
                      className="w-full bg-soft-black border border-white/10 rounded-sm px-4 py-3 font-display text-sm focus:outline-none focus:border-lime transition-all"
                      value={newListing.price}
                      onChange={e => setNewListing({...newListing, price: e.target.value})}
                    />
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <label className="font-display text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 block">Category</label>
                    <select 
                      className="w-full bg-soft-black border border-white/10 rounded-sm px-4 py-3 font-display text-sm focus:outline-none focus:border-lime transition-all appearance-none"
                      value={newListing.category}
                      onChange={e => setNewListing({...newListing, category: e.target.value})}
                    >
                      {['Tops', 'Bottoms', 'Dresses', 'Shoes', 'Accessories', 'Outerwear'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-display text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 block">Size</label>
                    <input 
                      required
                      placeholder="e.g. L, 32, 42"
                      type="text" 
                      className="w-full bg-soft-black border border-white/10 rounded-sm px-4 py-3 font-display text-sm focus:outline-none focus:border-lime transition-all"
                      value={newListing.size}
                      onChange={e => setNewListing({...newListing, size: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="font-display text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 block">Grade</label>
                    <select 
                      className="w-full bg-soft-black border border-white/10 rounded-sm px-4 py-3 font-display text-sm focus:outline-none focus:border-lime transition-all appearance-none"
                      value={newListing.grade}
                      onChange={e => setNewListing({...newListing, grade: e.target.value as any})}
                    >
                      {['A', 'B', 'C'].map(g => (
                        <option key={g} value={g}>Grade {g}</option>
                      ))}
                    </select>
                  </div>
               </div>

               <div>
                <label className="font-display text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 block">Description</label>
                <textarea 
                  rows={4}
                  className="w-full bg-soft-black border border-white/10 rounded-sm px-4 py-3 font-display text-sm focus:outline-none focus:border-lime transition-all resize-none"
                  value={newListing.description}
                  onChange={e => setNewListing({...newListing, description: e.target.value})}
                />
               </div>

               <div>
                <label className="font-display text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 block">Photo URLs</label>
                <div className="relative">
                  <Upload className="absolute top-4 right-4 text-white/20" size={18} />
                  <textarea
                    required
                    rows={3}
                    placeholder="Paste one image URL per line"
                    className="w-full bg-soft-black border border-white/10 rounded-sm px-4 py-3 pr-12 font-display text-sm focus:outline-none focus:border-lime transition-all resize-none"
                    value={newListing.imageUrls}
                    onChange={e => setNewListing({...newListing, imageUrls: e.target.value})}
                  />
                </div>
               </div>

               <button 
                 type="submit"
                 disabled={submitting}
                 className="w-full bg-lime text-black font-display font-black text-sm py-5 rounded-full hover:scale-[1.02] transition-all disabled:opacity-50"
               >
                 {submitting ? 'ADDING...' : 'CONFIRM LISTING'}
               </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
