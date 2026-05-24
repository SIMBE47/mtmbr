"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import { supabase } from '@/lib/supabase'
import { formatCurrency, cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Truck, ShoppingBag, MessageCircle } from 'lucide-react'

export default function ListingDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [listing, setListing] = useState<any>(null)
  const [store, setStore] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    async function fetchListing() {
      const { data: listingData, error: listingError } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single()

      if (listingError) {
        console.error(listingError)
        return
      }

      setListing(listingData)

      const { data: storeData } = await supabase
        .from('stores')
        .select('*')
        .eq('id', listingData.store_id)
        .single()
      
      setStore(storeData)
      setLoading(false)
    }

    if (id) fetchListing()
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-soft-black flex items-center justify-center">
      <div className="font-bubbly text-4xl animate-pulse text-lime">THRIFTR...</div>
    </div>
  )

  if (!listing) return (
    <div className="min-h-screen bg-soft-black flex flex-col items-center justify-center px-6">
      <h1 className="font-fashion text-4xl mb-6">Listing Not Found</h1>
      <Link href="/mall" className="text-lime font-display font-bold underline">Return to Mall</Link>
    </div>
  )

  const startConversation = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Please login first to message this store.')
      return
    }

    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('buyer_id', user.id)
      .eq('store_id', listing.store_id)
      .eq('listing_id', listing.id)
      .maybeSingle()

    if (existing?.id) {
      router.push(`/messages?conversation=${existing.id}`)
      return
    }

    const { data: created, error } = await supabase
      .from('conversations')
      .insert({
        buyer_id: user.id,
        store_id: listing.store_id,
        listing_id: listing.id
      })
      .select('id')
      .single()

    if (error) {
      console.error(error)
      alert('Could not start conversation. Please try again.')
      return
    }

    router.push(`/messages?conversation=${created.id}`)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 pt-32 px-6">
        <div className="max-w-7xl mx-auto">
          <button onClick={() => router.back()} className="flex items-center gap-2 font-display text-xs font-bold mb-10 hover:text-lime transition-colors">
            <ArrowLeft size={14} /> GO BACK
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-7 flex flex-col md:flex-row-reverse gap-4">
              <div className="flex-1 relative aspect-[4/5] bg-charcoal overflow-hidden rounded-sm">
                <Image 
                  src={listing.images?.[activeImage] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070&auto=format&fit=crop'} 
                  alt={listing.name} 
                  fill 
                  className="object-cover" 
                />
              </div>
              
              <div className="flex md:flex-col gap-4 overflow-x-auto no-scrollbar">
                {(listing.images || [listing.images?.[0]]).map((img: string, i: number) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveImage(i)}
                    className={cn(
                      "relative w-20 md:w-24 aspect-[4/5] bg-charcoal rounded-sm overflow-hidden flex-shrink-0 border-2 transition-all",
                      activeImage === i ? "border-lime" : "border-transparent opacity-50 hover:opacity-100"
                    )}
                  >
                    <Image src={img || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070&auto=format&fit=crop'} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="mb-10">
                <Link href={`/store/${store?.slug}`} className="font-display text-xs font-black text-lime uppercase tracking-widest mb-4 block hover:underline">
                  {store?.name || listing.store_name}
                </Link>
                <h1 className="font-fashion text-5xl font-bold mb-4 tracking-tighter uppercase leading-none">{listing.name}</h1>
                <div className="flex items-center gap-6">
                  <span className="font-display text-3xl font-black">{formatCurrency(listing.price)}</span>
                  <span className="bg-white/10 text-white/60 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter">
                    {listing.category}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-10">
                <div className="bg-charcoal p-4 rounded-sm border border-white/5">
                  <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest block mb-1">Size</span>
                  <span className="font-display font-black text-lg">{listing.size}</span>
                </div>
                <div className="bg-charcoal p-4 rounded-sm border border-white/5">
                  <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest block mb-1">Grade</span>
                  <span className="font-display font-black text-lg text-lime">{listing.grade}</span>
                </div>
                <div className="bg-charcoal p-4 rounded-sm border border-white/5">
                  <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest block mb-1">Brand</span>
                  <span className="font-display font-black text-sm truncate">{listing.brand || 'N/A'}</span>
                </div>
              </div>

              <div className="mb-12">
                <h4 className="font-display font-bold text-xs uppercase tracking-widest text-white/40 mb-4">Description</h4>
                <p className="font-editorial italic text-xl text-muted-gray leading-relaxed">
                  {listing.description || "This curated piece is part of THRIFTR's exclusive inventory. Verified for quality and authenticity by our boutique partners."}
                </p>
              </div>

              <div className="flex flex-col gap-4 mb-12">
                <Link 
                  href={`/checkout?id=${listing.id}`}
                  className="bg-lime text-black font-display font-black text-sm py-6 rounded-full text-center hover:scale-[1.02] transition-transform flex items-center justify-center gap-3"
                >
                  <ShoppingBag size={20} /> PURCHASE NOW
                </Link>
                <button
                  onClick={startConversation}
                  className="border border-white/10 text-off-white font-display font-black text-sm py-5 rounded-full text-center hover:border-lime hover:text-lime transition-all flex items-center justify-center gap-3"
                >
                  <MessageCircle size={18} /> MESSAGE STORE
                </button>
                <p className="text-center text-[10px] font-bold text-white/30 tracking-widest uppercase">
                  M-PESA ESCROW PROTECTION ENABLED
                </p>
              </div>

              <div className="space-y-6 pt-10 border-t border-white/5">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 text-lime">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h5 className="font-display font-bold text-xs uppercase tracking-widest mb-1">Escrow Guarantee</h5>
                    <p className="text-xs text-muted-gray leading-relaxed">Payment is held securely and only released to the store after you confirm delivery.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 text-lime">
                    <Truck size={20} />
                  </div>
                  <div>
                    <h5 className="font-display font-bold text-xs uppercase tracking-widest mb-1">Fast Delivery</h5>
                    <p className="text-xs text-muted-gray leading-relaxed">Available via Uber Direct for same-day delivery within Nairobi zones.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
