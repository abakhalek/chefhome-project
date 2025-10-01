import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Users, Clock, CheckCircle, XCircle, AlertCircle, CreditCard } from 'lucide-react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import { chefService } from '../../services/chefService';
import { bookingService, BookingQuote, BookingServiceType } from '../../services/bookingService';
import { useAuth } from '../../contexts/AuthContext';

const formatCurrency = (amount: number) => `${amount.toFixed(2)}€`;

const splitList = (value: string): string[] =>
  value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);

const BookingPaymentForm: React.FC<{
  clientSecret: string;
  bookingId: string;
  amount: number;
  onSuccess: () => void;
  onError: (message: string) => void;
}> = ({ clientSecret, bookingId, amount, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href
      },
      redirect: 'if_required'
    });

    if (result.error) {
      const message = result.error.message || "Le paiement n'a pas pu être confirmé.";
      setError(message);
      onError(message);
    } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
      try {
        await bookingService.confirmDeposit(result.paymentIntent.id, bookingId);
        onSuccess();
      } catch (confirmError: any) {
        const message = confirmError?.response?.data?.message || "Erreur lors de la confirmation côté serveur.";
        setError(message);
        onError(message);
      }
    }

    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-xl border border-gray-200 p-4">
        <PaymentElement />
      </div>
      {error && (
        <div className="flex items-center space-x-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full inline-flex items-center justify-center px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition disabled:opacity-50"
      >
        {processing ? 'Validation en cours...' : `Payer l'acompte de ${formatCurrency(amount)}`}
      </button>
    </form>
  );
};

const FindChefPage: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const [chefs, setChefs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });

  // Filter states
  const [filterServiceType, setFilterServiceType] = useState('');
  const [cuisineType, setCuisineType] = useState('');
  const [city, setCity] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');

  // Booking states
  const [selectedChef, setSelectedChef] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingServiceType, setBookingServiceType] = useState<BookingServiceType>('home-dining');
  const [selectedMenuId, setSelectedMenuId] = useState('');
  const [bookingDetails, setBookingDetails] = useState({
    date: '',
    time: '',
    duration: 3,
    guests: 2,
    eventType: 'dinner',
    address: '',
    city: '',
    zipCode: '',
    country: 'France',
    accessInstructions: '',
    specialRequests: '',
    allergies: '',
    dietaryRestrictions: ''
  });
  const [bookingStep, setBookingStep] = useState<'form' | 'quote' | 'payment' | 'success'>('form');
  const [bookingQuote, setBookingQuote] = useState<BookingQuote | null>(null);
  const [createdBooking, setCreatedBooking] = useState<any | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<{ clientSecret: string; paymentIntentId: string; amount: number; mock?: boolean } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);

  const stripePromise = useMemo(() => {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
    return publishableKey ? loadStripe(publishableKey) : null;
  }, []);

  const fetchChefs = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        serviceType: filterServiceType || undefined,
        cuisineType: cuisineType || undefined,
        city: city || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        rating: minRating || undefined
      };
      const { chefs, pagination } = await chefService.getChefs(params);
      setChefs(chefs);
      setPagination(pagination);
    } catch (error) {
      console.error('Failed to fetch chefs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchChefs(1);
    }, 300);
    return () => clearTimeout(debounce);
  }, [filterServiceType, cuisineType, city, minPrice, maxPrice, minRating]);

  const handlePageChange = (newPage: number) => {
    fetchChefs(newPage);
  };

  const resetBookingFlow = () => {
    setBookingStep('form');
    setBookingQuote(null);
    setCreatedBooking(null);
    setPaymentInfo(null);
    setFormError(null);
    setPaymentMessage(null);
    setSelectedMenuId('');
  };

  const handleBookChef = (chef: any) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (role !== 'client') {
      alert('Seuls les clients peuvent réserver un chef.');
      return;
    }
    setSelectedChef(chef);
    const defaultMenuId = chef.portfolio?.menus?.[0]?._id || chef.portfolio?.menus?.[0]?.id || '';
    setSelectedMenuId(defaultMenuId || '');
    setBookingServiceType((chef.serviceTypes && chef.serviceTypes[0]) || 'home-dining');
    setBookingDetails({
      date: '',
      time: '',
      duration: 3,
      guests: 2,
      eventType: 'dinner',
      address: '',
      city: '',
      zipCode: '',
      country: 'France',
      accessInstructions: '',
      specialRequests: '',
      allergies: '',
      dietaryRestrictions: ''
    });
    resetBookingFlow();
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChef) return;

    if (!bookingDetails.date || !bookingDetails.time || !bookingDetails.address || !bookingDetails.city || !bookingDetails.zipCode) {
      setFormError('Merci de renseigner la date, l\'heure et l\'adresse complète de la prestation.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const payload = {
        chefId: selectedChef._id || selectedChef.id,
        serviceType: bookingServiceType,
        eventDetails: {
          date: bookingDetails.date,
          startTime: bookingDetails.time,
          duration: Number(bookingDetails.duration),
          guests: Number(bookingDetails.guests),
          eventType: bookingDetails.eventType
        },
        location: {
          address: bookingDetails.address,
          city: bookingDetails.city,
          zipCode: bookingDetails.zipCode,
          country: bookingDetails.country || 'France',
          accessInstructions: bookingDetails.accessInstructions || undefined
        },
        menu: {
          selectedMenu: selectedMenuId || undefined,
          dietaryRestrictions: splitList(bookingDetails.dietaryRestrictions),
          allergies: splitList(bookingDetails.allergies)
        },
        specialRequests: bookingDetails.specialRequests || undefined
      };

      const { booking, quote } = await bookingService.createBooking(payload);
      setCreatedBooking(booking);
      setBookingQuote(quote);
      setBookingStep('quote');
    } catch (error: any) {
      console.error('Booking creation error:', error);
      const message = error?.response?.data?.message || "Impossible de créer la réservation.";
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartPayment = async () => {
    if (!createdBooking || !bookingQuote) return;
    const bookingId = createdBooking._id || createdBooking.id;
    const depositAmount = bookingQuote.depositAmount || Math.round(bookingQuote.totalAmount * 0.2);

    setIsSubmitting(true);
    setPaymentMessage(null);

    try {
      const paymentIntent = await bookingService.createDepositIntent(bookingId, depositAmount);

      if (paymentIntent.mock) {
        await bookingService.confirmDeposit(paymentIntent.paymentIntentId, bookingId);
        setPaymentMessage("Acompte validé en mode test.");
        setBookingStep('success');
      } else {
        setPaymentInfo({
          clientSecret: paymentIntent.clientSecret,
          paymentIntentId: paymentIntent.paymentIntentId,
          amount: depositAmount,
          mock: paymentIntent.mock
        });
        setBookingStep('payment');
      }
    } catch (error: any) {
      console.error('Payment intent error:', error);
      const message = error?.response?.data?.message || "Impossible de préparer le paiement. Vérifiez vos informations.";
      setPaymentMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = () => {
    setPaymentMessage("Paiement confirmé, la réservation est validée !");
    setBookingStep('success');
  };

  const handlePaymentError = (message: string) => {
    setPaymentMessage(message);
  };

  const handleCloseModal = () => {
    resetBookingFlow();
    setSelectedChef(null);
    setShowBookingModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 md:px-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center">Trouver votre Chef Idéal</h1>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Filtres Personnalisés</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <select value={filterServiceType} onChange={(e) => setFilterServiceType(e.target.value)} className="p-3 border rounded-lg">
              <option value="">Type de Prestation</option>
              <option value="home-dining">Repas à domicile</option>
              <option value="private-events">Événement privé</option>
              <option value="cooking-classes">Cours de cuisine</option>
              <option value="catering">Traiteur professionnel</option>
            </select>
            <select value={cuisineType} onChange={(e) => setCuisineType(e.target.value)} className="p-3 border rounded-lg">
              <option value="">Type de Cuisine</option>
              <option value="french">Française</option>
              <option value="italian">Italienne</option>
              <option value="asian">Asiatique</option>
            </select>
            <input type="text" placeholder="Ville" value={city} onChange={(e) => setCity(e.target.value)} className="p-3 border rounded-lg" />
            <input type="number" placeholder="Prix Min (€)" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="p-3 border rounded-lg" />
            <input type="number" placeholder="Prix Max (€)" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="p-3 border rounded-lg" />
            <select value={minRating} onChange={(e) => setMinRating(e.target.value)} className="p-3 border rounded-lg">
              <option value="">Note Min</option>
              <option value="4">4 étoiles et plus</option>
              <option value="3">3 étoiles et plus</option>
            </select>
          </div>
        </div>

        {/* Chef List */}
        {loading ? (
          <div className="text-center py-12">Chargement des chefs...</div>
        ) : chefs.length === 0 ? (
          <div className="text-center py-12">Aucun chef trouvé avec ces critères.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {chefs.map((chef) => (
              <div key={chef._id || chef.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {chef.portfolio?.images?.[0] ? (
                  <img src={chef.portfolio.images[0]} alt={chef.name} className="w-full h-48 object-cover" />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">Pas d'image</div>
                )}
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800">{chef.user?.name}</h2>
                    <span className="inline-flex items-center text-sm text-gray-500"><MapPin className="h-4 w-4 mr-1" />{chef.serviceAreas?.[0]?.city || 'Toute France'}</span>
                  </div>
                  <p className="text-orange-500 font-semibold">{chef.specialty}</p>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span>{chef.rating?.average?.toFixed(1) || 'N/A'} ({chef.rating?.count || 0} avis)</span>
                  </div>
                  <p className="text-gray-700 text-sm line-clamp-3">{chef.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-green-600">{chef.hourlyRate}€/h</span>
                    <button onClick={() => handleBookChef(chef)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                      Réserver
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center mt-8 space-x-4">
            <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1} className="px-4 py-2 border rounded-lg">Précédent</button>
            <span className="py-2">Page {pagination.page} sur {pagination.pages}</span>
            <button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === pagination.pages} className="px-4 py-2 border rounded-lg">Suivant</button>
          </div>
        )}

        {/* Booking Modal */}
        {showBookingModal && selectedChef && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full sm:max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-4 md:p-6 border-b">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">Réserver {selectedChef.user?.name}</h2>
                  <p className="text-sm text-gray-500">Sélectionnez votre prestation et confirmez votre acompte sécurisé.</p>
                </div>
                <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700"><XCircle size={24} /></button>
              </div>

              {bookingStep === 'form' && (
                <form onSubmit={handleBookingSubmit} className="p-4 md:p-6 space-y-4">
                  {formError && (
                    <div className="flex items-center space-x-2 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Type de Prestation</label>
                    <select value={bookingServiceType} onChange={(e) => setBookingServiceType(e.target.value as BookingServiceType)} className="w-full p-3 border rounded-lg">
                      <option value="home-dining">Repas quotidien</option>
                      <option value="private-events">Événement privé</option>
                      <option value="cooking-classes">Cours de cuisine</option>
                      <option value="catering">Mission professionnelle</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Date</label>
                      <input type="date" value={bookingDetails.date} onChange={(e) => setBookingDetails({ ...bookingDetails, date: e.target.value })} className="w-full p-3 border rounded-lg" required />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Heure</label>
                      <input type="time" value={bookingDetails.time} onChange={(e) => setBookingDetails({ ...bookingDetails, time: e.target.value })} className="w-full p-3 border rounded-lg" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Durée (heures)</label>
                      <input type="number" min={1} max={12} value={bookingDetails.duration} onChange={(e) => setBookingDetails({ ...bookingDetails, duration: Number(e.target.value) })} className="w-full p-3 border rounded-lg" required />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Convives</label>
                      <input type="number" min={1} value={bookingDetails.guests} onChange={(e) => setBookingDetails({ ...bookingDetails, guests: Number(e.target.value) })} className="w-full p-3 border rounded-lg" required />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Type d'évènement</label>
                      <select value={bookingDetails.eventType} onChange={(e) => setBookingDetails({ ...bookingDetails, eventType: e.target.value })} className="w-full p-3 border rounded-lg">
                        <option value="dinner">Dîner</option>
                        <option value="lunch">Déjeuner</option>
                        <option value="breakfast">Petit-déjeuner</option>
                        <option value="cocktail">Cocktail</option>
                        <option value="business">Corporate</option>
                        <option value="other">Autre</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Adresse</label>
                      <input type="text" value={bookingDetails.address} onChange={(e) => setBookingDetails({ ...bookingDetails, address: e.target.value })} className="w-full p-3 border rounded-lg" placeholder="Numéro et rue" required />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Ville</label>
                      <input type="text" value={bookingDetails.city} onChange={(e) => setBookingDetails({ ...bookingDetails, city: e.target.value })} className="w-full p-3 border rounded-lg" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Code Postal</label>
                      <input type="text" value={bookingDetails.zipCode} onChange={(e) => setBookingDetails({ ...bookingDetails, zipCode: e.target.value })} className="w-full p-3 border rounded-lg" required />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Informations d'accès</label>
                      <input type="text" value={bookingDetails.accessInstructions} onChange={(e) => setBookingDetails({ ...bookingDetails, accessInstructions: e.target.value })} className="w-full p-3 border rounded-lg" placeholder="Digicode, étage, parking..." />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Sélection du menu</label>
                    <select value={selectedMenuId} onChange={(e) => setSelectedMenuId(e.target.value)} className="w-full p-3 border rounded-lg">
                      <option value="">Menu personnalisé</option>
                      {selectedChef.portfolio?.menus?.map((menu: any) => (
                        <option key={menu._id || menu.id} value={menu._id || menu.id}>
                          {menu.name} · {formatCurrency(Number(menu.price || 0))}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Allergies</label>
                      <input type="text" value={bookingDetails.allergies} onChange={(e) => setBookingDetails({ ...bookingDetails, allergies: e.target.value })} placeholder="Ex: Gluten, Lactose" className="w-full p-3 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Régimes particuliers</label>
                      <input type="text" value={bookingDetails.dietaryRestrictions} onChange={(e) => setBookingDetails({ ...bookingDetails, dietaryRestrictions: e.target.value })} placeholder="Ex: Vegan, Halal" className="w-full p-3 border rounded-lg" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Demandes spécifiques</label>
                    <textarea value={bookingDetails.specialRequests} onChange={(e) => setBookingDetails({ ...bookingDetails, specialRequests: e.target.value })} rows={3} className="w-full p-3 border rounded-lg" placeholder="Souhaitez-vous un dressage particulier, un service en salle..."></textarea>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
                    <button type="button" onClick={handleCloseModal} className="px-6 py-2 border rounded-lg text-gray-700">Annuler</button>
                    <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-orange-500 text-white rounded-lg disabled:opacity-50">
                      {isSubmitting ? 'Création...' : 'Établir le devis'}
                    </button>
                  </div>
                </form>
              )}

              {bookingStep === 'quote' && bookingQuote && createdBooking && (
                <div className="p-6 space-y-6">
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Devis #{bookingQuote.reference}</h3>
                    <p className="text-sm text-gray-500 mb-4">Généré le {new Date(bookingQuote.generatedAt).toLocaleString('fr-FR')}</p>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center justify-between"><span>Prix de base ({bookingDetails.duration}h x {selectedChef.hourlyRate}€)</span><strong>{formatCurrency(bookingQuote.basePrice)}</strong></div>
                      <div className="flex items-center justify-between"><span>Frais de service (10%)</span><strong>{formatCurrency(bookingQuote.serviceFee)}</strong></div>
                      <div className="flex items-center justify-between text-lg font-semibold text-gray-900"><span>Total</span><span>{formatCurrency(bookingQuote.totalAmount)}</span></div>
                      <div className="flex items-center justify-between text-emerald-600 font-semibold"><span>Acompte sécurisé (20%)</span><span>{formatCurrency(bookingQuote.depositAmount)}</span></div>
                      <div className="flex items-center justify-between text-xs text-gray-500"><span>Solde à verser au chef après prestation</span><span>{formatCurrency(bookingQuote.remainingBalance)}</span></div>
                    </div>
                  </div>

                  {paymentMessage && (
                    <div className={`flex items-center space-x-2 text-sm ${paymentMessage.includes('Impossible') ? 'text-red-600' : 'text-emerald-600'}`}>
                      <AlertCircle className="h-4 w-4" />
                      <span>{paymentMessage}</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                    <button onClick={() => setBookingStep('form')} className="px-4 py-2 text-sm text-gray-600 underline">Modifier la demande</button>
                    <button onClick={handleStartPayment} disabled={isSubmitting} className="inline-flex items-center px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg disabled:opacity-50">
                      {isSubmitting ? 'Préparation du paiement...' : 'Procéder au paiement sécurisé'}
                    </button>
                  </div>
                </div>
              )}

              {bookingStep === 'payment' && paymentInfo && bookingQuote && createdBooking && (
                <div className="p-6 space-y-6">
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                      <CreditCard className="h-5 w-5 text-emerald-500" />
                      <span>Paiement sécurisé Stripe</span>
                    </h3>
                    <p className="text-sm text-gray-600">Un acompte de {formatCurrency(paymentInfo.amount)} est requis pour confirmer la réservation. Le solde restant est versé au chef après la prestation.</p>
                  </div>

                  {paymentMessage && (
                    <div className={`flex items-center space-x-2 text-sm ${paymentMessage.includes('Erreur') ? 'text-red-600' : 'text-emerald-600'}`}>
                      <AlertCircle className="h-4 w-4" />
                      <span>{paymentMessage}</span>
                    </div>
                  )}

                  {stripePromise ? (
                    <Elements stripe={stripePromise} options={{ clientSecret: paymentInfo.clientSecret }}>
                      <BookingPaymentForm
                        clientSecret={paymentInfo.clientSecret}
                        bookingId={createdBooking._id || createdBooking.id}
                        amount={paymentInfo.amount}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                      />
                    </Elements>
                  ) : (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                      Configurez la clé publique Stripe (VITE_STRIPE_PUBLISHABLE_KEY) pour activer le module de paiement sécurisé.
                    </div>
                  )}

                  <button onClick={() => setBookingStep('quote')} className="text-sm text-gray-500 underline">
                    Revenir au récapitulatif
                  </button>
                </div>
              )}

              {bookingStep === 'success' && bookingQuote && createdBooking && (
                <div className="p-6 space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-emerald-500" />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Réservation confirmée !</h3>
                      <p className="text-sm text-gray-600">Votre acompte a bien été enregistré. Le chef vous contactera rapidement pour finaliser les détails.</p>
                    </div>
                  </div>
                  {paymentMessage && <p className="text-sm text-emerald-600">{paymentMessage}</p>}
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm text-gray-600 space-y-2">
                    <p><strong>Référence :</strong> {bookingQuote.reference}</p>
                    <p><strong>Date de l'évènement :</strong> {bookingDetails.date ? new Date(bookingDetails.date).toLocaleDateString('fr-FR') : '—'} à {bookingDetails.time}</p>
                    <p><strong>Montant total :</strong> {formatCurrency(bookingQuote.totalAmount)} (Acompte payé : {formatCurrency(bookingQuote.depositAmount)})</p>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-end gap-3">
                    <button onClick={handleCloseModal} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg">Fermer</button>
                    <button onClick={() => navigate('/client/tableau-de-bord')} className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg">Voir mes réservations</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindChefPage;