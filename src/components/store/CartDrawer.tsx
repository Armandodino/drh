'use client';

import { useState } from 'react';
import { Minus, Plus, Trash2, ShoppingBag, MessageCircle, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCartStore } from '@/store/cartStore';
import { Separator } from '@/components/ui/separator';

export default function CartDrawer() {
  const { items, updateQuantity, removeItem, clearCart, getTotal } = useCartStore();
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: '',
  });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const total = getTotal();
  const deliveryFee = total >= 50000 ? 0 : 2500;
  const grandTotal = total + deliveryFee;

  const handleWhatsAppOrder = async () => {
    if (!customerInfo.name.trim()) {
      alert('Veuillez entrer votre nom');
      return;
    }
    if (!customerInfo.phone.trim()) {
      alert('Veuillez entrer votre numéro de téléphone');
      return;
    }

    setLoading(true);

    try {
      // Create order in database
      const orderData = {
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        customerAddress: customerInfo.address,
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        total: grandTotal,
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) throw new Error('Erreur lors de la création de la commande');

      // Get settings for WhatsApp number
      const settingsRes = await fetch('/api/settings');
      const { settings } = await settingsRes.json();
      const whatsappNumber = settings.whatsappNumber?.replace(/\D/g, '') || '2250707155414';

      // Build WhatsApp message
      let message = `🛒 *NOUVELLE COMMANDE*\n`;
      message += `━━━━━━━━━━━━━━━━\n\n`;
      message += `👤 *Client:* ${customerInfo.name}\n`;
      message += `📞 *Téléphone:* ${customerInfo.phone}\n`;
      if (customerInfo.address) {
        message += `📍 *Adresse:* ${customerInfo.address}\n`;
      }
      message += `\n📦 *Articles commandés:*\n`;
      message += `━━━━━━━━━━━━━━━━\n`;
      
      items.forEach((item, index) => {
        message += `\n${index + 1}. *${item.name}*\n`;
        message += `   ${item.quantity} x ${item.price.toLocaleString()} FCFA\n`;
        message += `   = ${(item.price * item.quantity).toLocaleString()} FCFA\n`;
      });

      message += `\n━━━━━━━━━━━━━━━━\n`;
      message += `💰 *Sous-total:* ${total.toLocaleString()} FCFA\n`;
      message += `🚚 *Livraison:* ${deliveryFee === 0 ? 'GRATUITE ✅' : deliveryFee.toLocaleString() + ' FCFA'}\n`;
      message += `\n✨ *TOTAL À PAYER:* ${grandTotal.toLocaleString()} FCFA\n`;

      // Open WhatsApp
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');

      // Clear cart and form
      clearCart();
      setCustomerInfo({ name: '', phone: '', address: '' });
      setShowForm(false);
    } catch (error) {
      console.error('Order error:', error);
      alert('Erreur lors de la commande. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 px-6">
        <div className="w-28 h-28 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center mb-8">
          <ShoppingBag className="h-12 w-12 text-orange-500" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Panier vide</h3>
        <p className="text-gray-500 text-center max-w-xs text-base">
          Ajoutez des produits à votre panier pour commencer vos achats
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Mon Panier</h2>
        <p className="text-base text-gray-500 mt-1">{items.length} article{items.length > 1 ? 's' : ''}</p>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto space-y-4 px-6" style={{ maxHeight: '35vh' }}>
        {items.map((item) => (
          <div key={item.id} className="flex gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 group">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <ShoppingBag className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-base font-semibold text-gray-900 truncate">{item.name}</h4>
              <p className="text-base font-bold text-orange-600 mt-1">{item.price.toLocaleString()} FCFA</p>
              <div className="flex items-center gap-3 mt-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-orange-50 hover:border-orange-400"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-base font-bold w-8 text-center text-gray-700">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-orange-50 hover:border-orange-400"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={item.quantity >= item.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 ml-auto text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-t border-gray-100 px-6 pt-6 mt-6 space-y-3">
        <div className="flex justify-between text-base">
          <span className="text-gray-500">Sous-total</span>
          <span className="font-semibold text-gray-700">{total.toLocaleString()} FCFA</span>
        </div>
        <div className="flex justify-between text-base">
          <span className="text-gray-500">Livraison</span>
          <span className={`font-semibold ${deliveryFee === 0 ? 'text-green-600' : 'text-gray-700'}`}>
            {deliveryFee === 0 ? '🚚 GRATUITE' : `${deliveryFee.toLocaleString()} FCFA`}
          </span>
        </div>
        {total < 50000 && (
          <div className="bg-orange-50 text-orange-700 text-sm p-4 rounded-xl flex items-start gap-3">
            <span className="text-lg">💡</span>
            <span>Ajoutez <strong>{(50000 - total).toLocaleString()} FCFA</strong> pour bénéficier de la livraison gratuite</span>
          </div>
        )}
        <Separator className="my-3" />
        <div className="flex justify-between text-xl font-bold">
          <span className="text-gray-900">Total</span>
          <span className="text-orange-600">{grandTotal.toLocaleString()} FCFA</span>
        </div>
      </div>

      {/* Customer Form or Button */}
      {!showForm ? (
        <div className="mt-6 space-y-4 px-6 pb-6">
          <Button 
            className="w-full h-14 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-base font-semibold shadow-lg shadow-green-500/25 text-white"
            onClick={() => setShowForm(true)}
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            Commander sur WhatsApp
          </Button>
          <Button 
            variant="ghost" 
            className="w-full text-gray-500 hover:text-red-500 text-base"
            onClick={clearCart}
          >
            <Trash2 className="h-5 w-5 mr-2" />
            Vider le panier
          </Button>
        </div>
      ) : (
        <div className="mt-6 space-y-4 px-6 pb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-500 mb-2"
            onClick={() => setShowForm(false)}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour au panier
          </Button>
          <div>
            <Label htmlFor="name" className="text-base font-medium text-gray-700">Nom complet *</Label>
            <Input
              id="name"
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
              placeholder="Votre nom"
              className="mt-2 h-12"
            />
          </div>
          <div>
            <Label htmlFor="phone" className="text-base font-medium text-gray-700">Téléphone *</Label>
            <Input
              id="phone"
              type="tel"
              value={customerInfo.phone}
              onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
              placeholder="+225 07 XX XX XX XX"
              className="mt-2 h-12"
            />
          </div>
          <div>
            <Label htmlFor="address" className="text-base font-medium text-gray-700">Adresse de livraison</Label>
            <Textarea
              id="address"
              value={customerInfo.address}
              onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
              placeholder="Votre adresse (optionnel)"
              className="mt-2"
              rows={2}
            />
          </div>
          <Button 
            className="w-full h-14 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 font-semibold shadow-lg shadow-green-500/25 text-white"
            onClick={handleWhatsAppOrder}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Envoi en cours...
              </>
            ) : (
              <>
                <MessageCircle className="h-5 w-5 mr-2" />
                Envoyer sur WhatsApp
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
