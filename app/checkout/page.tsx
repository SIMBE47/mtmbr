"use client"

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import { supabase } from '@/lib/supabase'
import { formatCurrency, cn } from '@/lib/utils'
import Image from 'next/image'
import { ArrowLeft, CreditCard, Truck, ShieldCheck, CheckCircle2, ShoppingBag, AlertTriangle } from 'lucide-react'

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const id = searchParams.get('id')
  
  const [listing, setListing] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deliveryMethod, setDeliveryMethod] = useState<'uber' | 'pickup'>('uber')
  const [phone, setPhone] = useState('')
  const [processing, setProcessing] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [completedMessage, setCompletedMessage] = useState('')

  const deliveryFee = deliveryMethod === 'uber' ? 350 : 0
  const isHighValue = listing?.price > 5000

  useEffect(() => {
    async function fetchListing() {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error(error)
      } else {
        setListing(data)
      }
      setLoading(false)
    }

    if (id) fetchListing()
  }, [id])

  const handlePayment = async () => {
    if (!phone) return
    if (deliveryMethod === 'uber' && isHighValue) {
      alert('Items over KES 5,000 cannot be delivered via Uber Direct for insurance reasons. Please choose Self-Pickup.')
      return
    }

    setProcessing(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        alert('Please login first to place an order.')
        setProcessing(false)
        return
      }
      
      const { data: order, error: orderError } = await supabase.from('orders').insert({
        listing_id: listing.id,
        listing_name: listing.name,
        listing_image: listing.images?.[0],
        buyer_id: user.id,
        store_id: listing.store_id,
        store_name: listing.store_name,
        total_amount: listing.price + deliveryFee,
        delivery_method: deliveryMethod,
        phone_number: phone,
        status: 'pending'
      }).select().single()

      if (orderError) throw orderError

      const { data, error } = await supabase.functions.invoke('mpesa', {
        body: { 
          action: 'stkpush', 
          phoneNumber: phone.replace(/[^0-9]/g, ''), 
          orderId: order.id 
        }
      })

      if (error || data?.error || data?.ResponseCode !== '0' || !data?.MerchantRequestID) {
        console.error('M-Pesa Function error:', error || data)
        await supabase.from('orders').update({ status: 'cancelled' }).eq('id', order.id)
        alert(data?.errorMessage || data?.error || 'M-Pesa payment could not be started. Please try again.')
        setProcessing(false)
        return
      }

      setProcessing(false)
      setCompletedMessage('M-Pesa request sent. Once Safaricom confirms payment, your order will move into escrow and the store will prepare the item.')
      setCompleted(true)
    } catch (err) {
      console.error(err)
      setProcessing(false)
      alert('Checkout failed.')
    }
  }

  if (loading) return null

  if (completed) return (
    <div className="max-w-xl mx-auto text-center py-20 animate-in zoom-in-95 duration-500">
      <div className="w-24 h-24 bg-lime rounded-full flex items-center justify-center mx-auto mb-10 text-black">
        <CheckCircle2 size={48} />
      </div>
      <h1 className="font-fashion text-5xl font-bold mb-6 uppercase tracking-tighter">ORDER PLACED</h1>
      <p className="font-editorial italic text-2xl text-muted-gray mb-12">
        {completedMessage || 'Your order has been created.'}
      </p>
      <div className="flex flex-col gap-4">
        <button onClick={() => router.push('/dashboard')} className="bg-white text-black font-display font-black text-sm py-5 rounded-full uppercase">View Order Status</button>
        <button onClick={() => router.push('/mall')} className="font-display font-bold text-xs text-muted-gray hover:text-lime uppercase tracking-widest">Back to Mall</button>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-20">
      <div className="lg:col-span-7">
        <button onClick={() => router.back()} className="flex items-center gap-2 font-display text-xs font-bold mb-12 hover:text-lime transition-colors">
          <ArrowLeft size={14} /> CANCEL CHECKOUT
        </button>

        <h1 className="font-fashion text-6xl font-bold mb-16 tracking-tighter uppercase">CHECKOUT</h1>

        <div className="mb-16">
          <h3 className="font-display font-bold text-xs uppercase tracking-widest text-white/40 mb-8 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center text-[10px]">1</span>
            DELIVERY METHOD
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={() => setDeliveryMethod('uber')}
              className={cn(
                "p-8 rounded-sm border-2 text-left transition-all relative overflow-hidden",
                deliveryMethod === 'uber' ? "border-lime bg-lime/5" : "border-white/5 bg-charcoal hover:border-white/10"
              )}
            >
              <div className="flex justify-between items-start mb-4">
                <Truck className={deliveryMethod === 'uber' ? "text-lime" : "text-white/20"} />
                <span className="font-display font-black text-sm">KES 350</span>
              </div>
              <h4 className="font-display font-bold text-sm mb-1">Uber Direct</h4>
              <p className="text-xs text-muted-gray">Same-day delivery within Nairobi.</p>
              {isHighValue && (
                <div className="mt-4 flex items-center gap-2 text-burgundy font-bold text-[10px] uppercase">
                  <AlertTriangle size={12} /> High Value Restriction
                </div>
              )}
            </button>
            <button 
              onClick={() => setDeliveryMethod('pickup')}
              className={cn(
                "p-8 rounded-sm border-2 text-left transition-all",
                deliveryMethod === 'pickup' ? "border-lime bg-lime/5" : "border-white/5 bg-charcoal hover:border-white/10"
              )}
            >
              <div className="flex justify-between items-start mb-4">
                <ShoppingBag className={deliveryMethod === 'pickup' ? "text-lime" : "text-white/20"} />
                <span className="font-display font-black text-sm">FREE</span>
              </div>
              <h4 className="font-display font-bold text-sm mb-1">Self-Pickup</h4>
              <p className="text-xs text-muted-gray">Collect directly from the boutique.</p>
            </button>
          </div>
        </div>

        <div className="mb-16">
          <h3 className="font-display font-bold text-xs uppercase tracking-widest text-white/40 mb-8 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center text-[10px]">2</span>
            PAYMENT METHOD
          </h3>
          <div className="bg-charcoal p-10 rounded-sm border border-white/5">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-lime rounded-sm flex items-center justify-center text-black font-black italic">M</div>
                <div>
                  <h4 className="font-display font-bold text-sm">M-Pesa STK Push</h4>
                  <p className="text-xs text-muted-gray italic">Safely held in Escrow.</p>
                </div>
              </div>
              <CreditCard className="text-white/10" />
            </div>
            
            <div>
              <label className="font-display text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 block">M-Pesa Phone Number</label>
              <input 
                type="text" 
                placeholder="2547..." 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-soft-black border border-white/10 rounded-sm px-6 py-4 font-display text-lg focus:outline-none focus:border-lime transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-5">
        <div className="bg-charcoal p-10 rounded-sm border border-white/5 sticky top-32">
          <h3 className="font-display font-bold text-xs uppercase tracking-widest text-white/40 mb-10">ORDER SUMMARY</h3>
          
          <div className="flex gap-6 mb-10 pb-10 border-b border-white/5">
             <div className="relative w-24 aspect-[4/5] bg-soft-black rounded-sm overflow-hidden flex-shrink-0">
               <Image src={listing?.images?.[0] || ''} alt="" fill className="object-cover grayscale" />
             </div>
             <div>
               <h4 className="font-display font-bold text-sm uppercase mb-1">{listing?.name}</h4>
               <p className="font-display text-[10px] text-muted-gray uppercase tracking-widest">{listing?.store_name}</p>
             </div>
          </div>

          <div className="space-y-4 mb-10 font-display text-sm">
            <div className="flex justify-between">
              <span className="text-muted-gray">Subtotal</span>
              <span className="font-bold">{formatCurrency(listing?.price || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-gray">Delivery ({deliveryMethod.toUpperCase()})</span>
              <span className="font-bold">{formatCurrency(deliveryFee)}</span>
            </div>
            <div className="flex justify-between pt-4 border-t border-white/5">
              <span className="font-black uppercase tracking-widest text-xs">Total</span>
              <span className="font-black text-xl text-lime">{formatCurrency((listing?.price || 0) + deliveryFee)}</span>
            </div>
          </div>

          <button 
            onClick={handlePayment}
            disabled={!phone || processing || (deliveryMethod === 'uber' && isHighValue)}
            className="w-full bg-lime text-black font-display font-black text-sm py-6 rounded-full mb-8 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
          >
            {processing ? "PROCESSING..." : `PAY ${formatCurrency((listing?.price || 0) + deliveryFee)}`}
          </button>

          <div className="flex items-start gap-4 p-4 bg-white/5 rounded-sm">
            <ShieldCheck size={18} className="text-lime flex-shrink-0" />
            <p className="text-[10px] text-muted-gray leading-relaxed font-bold uppercase tracking-tighter">
              Your payment will be held by THRIFTR Escrow and only released to the store after you confirm receipt of your item.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Checkout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-32 px-6">
        <Suspense fallback={<div>Loading...</div>}>
          <CheckoutContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
