import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Eye, Heart, X, Settings2, Check } from 'lucide-react';

const ProductGrid = ({ title, description, products, themeColor = "primary" }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [customizationMode, setCustomizationMode] = useState(false);
  const [customOptions, setCustomOptions] = useState({
    fabric: 'Velvet',
    color: 'Original',
    embroidery: 'Standard',
  });

  const accentClass = themeColor === "primary" ? "text-primary" : "text-secondary";
  const borderClass = themeColor === "primary" ? "hover:border-primary/30" : "hover:border-secondary/30";
  const shadowClass = themeColor === "primary" ? "shadow-[0_0_15px_rgba(212,175,53,0.3)]" : "shadow-[0_0_15px_rgba(0,243,255,0.3)]";
  const bgClass = themeColor === "primary" ? "bg-primary" : "bg-secondary";

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setCustomizationMode(false);
  };

  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8 bg-dark min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-16">
          <h1 className="text-5xl font-black tracking-tighter uppercase mb-4">{title.split(' ')[0]} <span className={`${accentClass} italic`}>{title.split(' ').slice(1).join(' ')}</span></h1>
          <p className="text-slate-400 max-w-2xl border-l-2 border-white/20 pl-4 italic">
            {description}
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className={`group bg-charcoal rounded-xl overflow-hidden border border-white/5 ${borderClass} transition-all cursor-pointer`}
              onClick={() => handleProductClick(product)}
            >
              <div className="aspect-[4/5] bg-dark relative overflow-hidden">
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-black">
                     <ShoppingBag size={48} className={`opacity-20 ${accentClass}`} />
                  </div>
                )}
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-dark/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <button className={`p-3 ${bgClass} text-dark rounded-full hover:scale-110 transition-all ${shadowClass}`}>
                    <Eye size={20} />
                  </button>
                  <button className="p-3 bg-white text-dark rounded-full hover:scale-110 transition-all">
                    <Heart size={20} />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="font-bold text-lg uppercase tracking-tight mb-1 truncate">{product.name}</h3>
                <p className="text-slate-500 text-xs mb-4 italic uppercase tracking-widest">{product.category}</p>
                <div className="flex justify-between items-center">
                  <p className={`${accentClass} font-black text-xl`}>${product.price.toLocaleString()}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick View & Customization Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-dark/95 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-charcoal w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            >
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-6 right-6 z-10 p-2 bg-dark/50 text-white rounded-full hover:bg-white/10 transition-all"
              >
                <X size={24} />
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Image Section */}
                <div className="aspect-square bg-dark relative">
                  <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.name} 
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark/60 to-transparent"></div>
                  <div className="absolute bottom-10 left-10">
                    <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">{selectedProduct.name}</h2>
                    <p className={`${accentClass} text-2xl font-black`}>${selectedProduct.price.toLocaleString()}</p>
                  </div>
                </div>

                {/* Details / Customization Section */}
                <div className="p-10 lg:p-14 space-y-8 overflow-y-auto max-h-[90vh]">
                  {!customizationMode ? (
                    <div className="space-y-8">
                       <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">The Details</h3>
                        <p className="text-slate-300 leading-relaxed text-lg italic">
                          This exquisite {selectedProduct.category} represents the height of Vantage craftsmanship. Each piece is hand-tailored over 200 hours to ensure perfection.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 border border-white/10 rounded-xl">
                          <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Material</p>
                          <p className="font-bold">24K Gold / Silk</p>
                        </div>
                        <div className="p-4 border border-white/10 rounded-xl">
                          <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Origin</p>
                          <p className="font-bold">Milan Atelier</p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-4 pt-4">
                        <button className={`w-full ${bgClass} text-dark font-black py-5 rounded-2xl uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] transition-all`}>
                          Add to Collection <ShoppingBag size={20} />
                        </button>
                        <button 
                          onClick={() => setCustomizationMode(true)}
                          className="w-full border border-white/20 text-white font-black py-5 rounded-2xl uppercase tracking-widest flex items-center justify-center gap-3 hover:border-primary/50 transition-all"
                        >
                          Bespoke Customization <Settings2 size={20} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-8"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <button onClick={() => setCustomizationMode(false)} className="text-slate-500 hover:text-white transition-colors">Back</button>
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary">Customization Studio</h3>
                      </div>

                      {/* Customization Options */}
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <p className="text-[10px] font-black uppercase text-slate-400">Select Fabric</p>
                          <div className="flex flex-wrap gap-2">
                            {['Velvet', 'Raw Silk', 'Brocade'].map(f => (
                              <button 
                                key={f}
                                onClick={() => setCustomOptions({...customOptions, fabric: f})}
                                className={`px-4 py-2 rounded-lg text-sm font-bold border ${customOptions.fabric === f ? 'border-primary text-primary bg-primary/10' : 'border-white/10 text-slate-400'}`}
                              >
                                {f}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <p className="text-[10px] font-black uppercase text-slate-400">Select Tone</p>
                          <div className="flex gap-4">
                            {['#121212', '#3e0a0a', '#0a1a3e'].map(c => (
                              <button 
                                key={c}
                                onClick={() => setCustomOptions({...customOptions, color: c})}
                                className={`w-10 h-10 rounded-full border-2 ${customOptions.color === c ? 'border-primary p-0.5' : 'border-transparent'}`}
                              >
                                <div className="w-full h-full rounded-full" style={{ backgroundColor: c }}></div>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <p className="text-[10px] font-black uppercase text-slate-400">Embroidery Level</p>
                          <div className="space-y-2">
                             {['Standard', 'Heavy Handwork', 'Royal Crest'].map(e => (
                              <button 
                                key={e}
                                onClick={() => setCustomOptions({...customOptions, embroidery: e})}
                                className={`w-full flex justify-between items-center px-5 py-4 rounded-xl border ${customOptions.embroidery === e ? 'border-primary bg-primary/5' : 'border-white/5'}`}
                              >
                                <span className={`font-bold ${customOptions.embroidery === e ? 'text-white' : 'text-slate-500'}`}>{e}</span>
                                {customOptions.embroidery === e && <Check size={16} className="text-primary" />}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={() => setSelectedProduct(null)}
                        className={`w-full ${bgClass} text-dark font-black py-5 rounded-2xl uppercase tracking-widest hover:scale-[1.02] transition-all mt-4`}
                      >
                        Request Custom Build
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductGrid;
