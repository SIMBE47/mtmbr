export default function Ticker() {
  const items = ["CURATED COLLECTIONS", "VERIFIED BOUTIQUES", "M-PESA ESCROW", "SAME-DAY DELIVERY", "PREMIUM THRIFT"]
  
  return (
    <div className="bg-lime py-3 overflow-hidden whitespace-nowrap border-y border-black/10">
      <div className="inline-block animate-marquee">
        {[...items, ...items, ...items].map((item, i) => (
          <span key={i} className="font-display font-black text-xs text-black mx-12 tracking-widest uppercase">
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
