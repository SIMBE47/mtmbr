"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Star, Share2, Info } from 'lucide-react'

export default function StoreFront() {
  const { slug } = useParams()
  const [store, setStore] = useState<any>(null)
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStoreData() {
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .eq('slug', slug)
        .single()

      if (storeError) {
        console.error(storeError)
        return
      }

      setStore(storeData)

      const { data: listingsData } = await supabase
        .from('listings')
        .select('*')
        .eq('store_id', storeData.id)
        .eq('status', 'available')
        .order('created_at', { ascending: false })
      
      setListings(listingsData || [])
      setLoading(false)
    }

    if (slug) fetchStoreData()
  }, [slug])

  if (loading) return null

  if (!store) return <div>Store not found</div>

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1">
        <div className="relative h-[40vh] bg-charcoal overflow-hidden">
          <Image 
            src={store.banner_image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop'} 
            alt={store.name} 
            fill 
            className="object-cover opacity-40 grayscale" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-soft-black to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-10">
          <div className="flex flex-col md:flex-row gap-10 items-end justify-between">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-end text-center md:text-left">
              <div className="w-40 h-40 rounded-sm bg-charcoal border-4 border-soft-black overflow-hidden relative shadow-2xl">
                <Image src={store.logo_image || ''} alt={store.name} fill className="object-cover" />
              </div>
              <div className="pb-4">
                <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                  <h1 className="font-fashion text-5xl md:text-6xl font-bold tracking-tighter uppercase leading-none">{store.name}</h1>
                  {store.is_verified && (
                    <span className="bg-lime text-black text-[9px] font-black px-2 py-1 rounded-sm uppercase tracking-tighter self-start mt-2">Verified</span>
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                  <div className="flex items-center gap-1.5"><MapPin size={12} className="text-lime" /> {store.location}</div>
                  <div className="flex items-center gap-1.5"><Star size={12} className="text-lime" fill="currentColor" /> {store.rating} ({store.sales_count} sales)</div>
                  <div className="flex items-center gap-1.5"><Info size={12} className="text-lime" /> INFO</div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 pb-4">
              <button className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-full hover:bg-white/10 transition-all">
                <Share2 size={20} />
              </button>
              <button className="bg-white text-black font-display font-black text-xs px-8 py-4 rounded-full hover:bg-lime transition-all">
                FOLLOW BOUTIQUE
              </button>
            </div>
          </div>

          <div className="mt-20 mb-32 grid grid-cols-1 lg:grid-cols-4 gap-20">
             <div className="lg:col-span-1">
                <h4 className="font-display font-bold text-xs uppercase tracking-widest text-white/30 mb-6">About the Boutique</h4>
                <p className="font-editorial italic text-xl text-muted-gray leading-relaxed mb-10">
                  {store.description}
                </p>
                
                <div className="space-y-4">
                   <div className="bg-charcoal p-6 rounded-sm border border-white/5">
                      <span className="font-display font-black text-2xl text-lime block mb-1">{listings.length}</span>
                      <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Items Available</span>
                   </div>
                </div>
             </div>

             <div className="lg:col-span-3">
                <div className="flex items-end justify-between mb-12">
                   <h2 className="font-fashion text-4xl font-bold tracking-tight">CURATED STOCK</h2>
                   <div className="flex gap-8 font-display text-[10px] font-black text-white/40 tracking-widest uppercase">
                      <button className="text-white border-b-2 border-lime pb-2">ALL ITEMS</button>
                      <button className="hover:text-white transition-colors pb-2">NEW ARRIVALS</button>
                      <button className="hover:text-white transition-colors pb-2">ON SALE</button>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-12">
                  {listings.map((listing) => (
                    <Link key={listing.id} href={`/listing/${listing.id}`} className="group">
                      <div className="relative aspect-[4/5] overflow-hidden bg-charcoal rounded-sm mb-6">
                        <Image src={listing.images?.[0]} alt={listing.name} fill className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
                      </div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-display font-bold text-sm mb-1 group-hover:text-lime transition-colors uppercase tracking-tight">{listing.name}</h3>
                        <span className="font-display font-black text-sm">{formatCurrency(listing.price)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
             </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
