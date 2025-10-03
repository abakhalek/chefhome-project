import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, CheckCircle, XCircle, AlertCircle, CreditCard } from 'lucide-react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import { chefService } from '../../services/chefService';
import { bookingService, BookingQuote, BookingServiceType } from '../../services/bookingService';
import { Chef, Menu, Booking } from '../../types';
import { useAuth } from '../../hooks/useAuth';

const formatCurrency = (amount: number) => `${amount.toFixed(2)}€`;

const splitList = (value: string): string[] =>
  value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);

const getMenuIdentifier = (menu: Menu): string => {
  if (!menu) {
    return '';
  }
  const candidate = menu as unknown as { id?: string; _id?: string };
  return candidate.id || candidate._id || '';
};

const getChefIdentifier = (chef: Chef | null | undefined): string => {
  if (!chef) {
    return '';
  }

  const candidate = chef as unknown as {
    id?: string;
    _id?: string;
    user?: string | { id?: string; _id?: string; email?: string };
  };

  if (typeof candidate.id === 'string' && candidate.id.trim()) {
    return candidate.id.trim();
  }

  if (typeof candidate._id === 'string' && candidate._id.trim()) {
    return candidate._id.trim();
  }

  const user = candidate.user;

  if (typeof user === 'string' && user.trim()) {
    return user.trim();
  }

  if (user && typeof user === 'object') {
    const typedUser = user as { id?: string; _id?: string; email?: string };
    if (typeof typedUser.id === 'string' && typedUser.id.trim()) {
      return typedUser.id.trim();
    }
    if (typeof typedUser._id === 'string' && typedUser._id.trim()) {
      return typedUser._id.trim();
    }
    if (typeof typedUser.email === 'string' && typedUser.email.trim()) {
      return typedUser.email.trim();
    }
  }

  return '';
};

const getChefDisplayName = (chef: Chef | null | undefined): string => {
  if (!chef) {
    return 'Chef Anonyme';
  }

  const candidate = chef as unknown as {
    user?: unknown;
    name?: unknown;
    specialty?: unknown;
  };

  const user = candidate.user;

  if (user && typeof user === 'object') {
    const typedUser = user as { name?: unknown; email?: unknown };
    if (typeof typedUser.name === 'string' && typedUser.name.trim()) {
      return typedUser.name.trim();
    }
    if (typeof typedUser.email === 'string' && typedUser.email.trim()) {
      const email = typedUser.email.trim();
      const [localPart] = email.split('@');
      return localPart || email;
    }
  }

  if (typeof candidate.name === 'string' && candidate.name.trim()) {
    return candidate.name.trim();
  }

  if (typeof candidate.specialty === 'string' && candidate.specialty.trim()) {
    return `Chef ${candidate.specialty.trim()}`;
  }

  return 'Chef Anonyme';
};

const isChefPubliclyActive = (chef: Chef | null | undefined): boolean => {
  if (!chef) {
    return false;
  }

  const candidate = chef as unknown as { isActive?: boolean; status?: string; verification?: { status?: string } };
  const activeFlag = candidate.isActive !== false;
  const status = candidate.verification?.status ?? candidate.status;

  if (!status) {
    return activeFlag;
  }

  return activeFlag && ['approved', 'active', 'verified'].includes(status);
};

const getChefProfileImage = (chef: Chef | null | undefined): string => {
  if (!chef) {
    return '/chef-images/default-profile.png';
  }

  const candidate = chef as unknown as { profilePicture?: unknown; user?: unknown };

  if (typeof candidate.profilePicture === 'string' && candidate.profilePicture.trim()) {
    return candidate.profilePicture;
  }

  const user = candidate.user;
  if (user && typeof user === 'object') {
    const avatar = (user as { avatar?: unknown }).avatar;
    if (typeof avatar === 'string' && avatar.trim()) {
      return avatar;
    }
  }

  return '/chef-images/default-profile.png';
};

const BookingPaymentForm: React.FC<{
  clientSecret: string;
  bookingId: string;
  amount: number;
  onSuccess: () => void;
  onError: (message: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
}> = ({ bookingId, amount, onSuccess, onError, clientSecret }) => {
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
      } catch (confirmError: unknown) {
        const message = (confirmError as { response?: { data?: { message?: string } } })?.response?.data?.message || "Erreur lors de la confirmation côté serveur.";
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

const formatChefName = (name: string | undefined) => {
  if (!name) return 'Chef Anonyme';
  const parts = name.split(' ');
  const firstName = parts[0];
  const lastName = parts.slice(1).join(' ');
  return `${firstName} ${lastName}`;
};

const FindChefPage: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const [chefs, setChefs] = useState<Chef[]>([]);
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
  const [selectedChef, setSelectedChef] = useState<Chef | null>(null);
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
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<{ clientSecret: string; paymentIntentId: string; amount: number; mock?: boolean } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);


  const selectedMenuDetails = useMemo(() => {
    const details = (() => {
      if (!selectedChef || !selectedMenuId) {
        return null;
      }

      const menus = Array.isArray(selectedChef.portfolio?.menus)
        ? selectedChef.portfolio.menus
        : [];

      return menus.find((menu: Menu) => getMenuIdentifier(menu) === selectedMenuId) || null;
    })();
    console.log('[FindChefPage] Selected menu details:', details);
    return details;
  }, [selectedChef, selectedMenuId]);

  const stripePromise = useMemo(() => {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
    return publishableKey ? loadStripe(publishableKey) : null;
  }, []);

  const fetchChefs = useCallback(async (page = 1) => {
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
      const { chefs: fetchedChefs, pagination } = await chefService.getChefs(params);
      const source: Chef[] = Array.isArray(fetchedChefs) ? (fetchedChefs as Chef[]) : [];
      console.log('[FindChefPage] Fetched chefs:', source);

      const uniqueChefs = source.filter((chef, index, self) => {
        const identifier = getChefIdentifier(chef);
        if (!identifier) {
          return false;
        }
        return index === self.findIndex((other) => getChefIdentifier(other) === identifier);
      });

      console.log('[FindChefPage] Unique chefs after identifier deduplication:', uniqueChefs);

      const visibleChefs = uniqueChefs.filter((chef) => isChefPubliclyActive(chef));

      console.log('[FindChefPage] Visible chefs after activity check:', visibleChefs);

      setChefs(visibleChefs);
      setPagination(pagination);
    } catch (error) {
      console.error('Failed to fetch chefs:', error);
    } finally {
      setLoading(false);
    }
  }, [filterServiceType, cuisineType, city, minPrice, maxPrice, minRating]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchChefs(1);
    }, 300);
    return () => clearTimeout(debounce);
  }, [filterServiceType, cuisineType, city, minPrice, maxPrice, minRating, fetchChefs]);

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





  const handleBookChef = (chef: Chef, preferredMenuId?: string) => {
    console.log('[FindChefPage] handleBookChef called with chef:', chef, 'and preferredMenuId:', preferredMenuId);
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/chefs' } });
      return;
    }
    if (role !== 'client') {
      alert('Seuls les clients peuvent réserver un chef.');
      return;
    }

    resetBookingFlow();
    setSelectedChef(chef);

    const availableMenus: Menu[] = Array.isArray(chef.portfolio?.menus)
      ? chef.portfolio.menus
      : [];

    const resolvedMenu: Menu | undefined = preferredMenuId
      ? availableMenus.find((menu: Menu) => getMenuIdentifier(menu) === preferredMenuId)
      : availableMenus.find((menu: Menu) => menu?.isActive !== false) || (availableMenus.length > 0 ? availableMenus[0] : undefined);

    const resolvedMenuId = resolvedMenu ? getMenuIdentifier(resolvedMenu) : '';
    setSelectedMenuId(resolvedMenuId);

    const chefServiceTypes = Array.isArray(chef.serviceTypes) ? chef.serviceTypes : [];
    setBookingServiceType((chefServiceTypes[0] as BookingServiceType) || 'home-dining');
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

    setShowBookingModal(true);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChef) return;

    if (!bookingDetails.date || !bookingDetails.time || !bookingDetails.address || !bookingDetails.city || !bookingDetails.zipCode) {
      setFormError('Merci de renseigner la date, l\'heure et l\'adresse complète de la prestation.');
      return;
    }

    const guests = Number(bookingDetails.guests);
    if (selectedMenuDetails) {
      const minGuests = Number(selectedMenuDetails.minGuests) || 0;
      const maxGuests = Number(selectedMenuDetails.maxGuests) || 0;

      if (minGuests && guests < minGuests) {
        setFormError(`Ce menu nécessite au moins ${minGuests} convives.`);
        return;
      }

      if (maxGuests && guests > maxGuests) {
        setFormError(`Ce menu accepte au maximum ${maxGuests} convives.`);
        return;
      }
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const normalizedSelectedMenuId = selectedMenuId?.trim() || undefined;
      const chefIdentifier = getChefIdentifier(selectedChef) || selectedChef._id || selectedChef.id;

      const payload = {
        chefId: chefIdentifier,
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
          selectedMenu: normalizedSelectedMenuId,
          dietaryRestrictions: splitList(bookingDetails.dietaryRestrictions),
          allergies: splitList(bookingDetails.allergies)
        },
        specialRequests: bookingDetails.specialRequests || undefined
      };

      const { booking, quote } = await bookingService.createBooking(payload);

      if (!booking) {
        throw new Error('Réservation non créée sur le serveur. Merci de réessayer.');
      }

      const typedBooking: Booking = booking;

      const fallbackQuote: BookingQuote = (() => {
        const toCurrency = (value: number | string | undefined | null) => {
          const numericValue = Number(value) || 0;
          return Math.round(numericValue * 100) / 100;
        };

        const durationValue = Number(bookingDetails.duration) || 0;
        const guestsValue = Number(bookingDetails.guests) || 0;
        const hourlyRateValue = Number(selectedChef.hourlyRate ?? 0);

        const menuInfo = selectedMenuDetails
          ? (() => {
              const menu = selectedMenuDetails as Menu;
              const unitPrice = toCurrency(menu.price);
              return {
                id: String(menu._id || menu.id || 'menu'),
                name: menu.name || 'Menu sélectionné',
                type: menu.type === 'horaire' ? 'horaire' : 'forfait',
                unitPrice
              };
            })()
          : null;

        const derivedBase = menuInfo
          ? (menuInfo.type === 'horaire'
              ? toCurrency(menuInfo.unitPrice * durationValue)
              : menuInfo.unitPrice)
          : toCurrency(hourlyRateValue * durationValue);

        const basePriceValue = toCurrency(typedBooking?.pricing?.basePrice ?? quote?.basePrice ?? derivedBase);
        const serviceFeeValue = toCurrency(typedBooking?.pricing?.serviceFee ?? quote?.serviceFee ?? basePriceValue * 0.1);
        const totalAmountValue = toCurrency(typedBooking?.pricing?.totalAmount ?? quote?.totalAmount ?? (basePriceValue + serviceFeeValue));
        const depositValue = toCurrency(
          quote?.depositAmount ??
          typedBooking?.pricing?.depositAmount ??
          typedBooking?.payment?.depositAmount ??
          totalAmountValue * 0.2
        );

        return {
          reference: `Q-${(typedBooking?._id || typedBooking?.id || Math.random().toString(36).slice(-6)).toString().slice(-6).toUpperCase()}`,
          generatedAt: new Date().toISOString(),
          basePrice: basePriceValue,
          serviceFee: serviceFeeValue,
          totalAmount: totalAmountValue,
          depositAmount: depositValue,
          remainingBalance: toCurrency(Math.max(totalAmountValue - depositValue, 0)),
          menu: menuInfo,
          calculation: menuInfo
            ? {
                method: 'menu' as const,
                menu: {
                  ...menuInfo,
                  durationHours: durationValue,
                  guests: guestsValue
                }
              }
            : {
                method: 'hourly' as const,
                hourlyRate: toCurrency(hourlyRateValue),
                durationHours: durationValue,
                guests: guestsValue
              }
        };
      })();

      setCreatedBooking(typedBooking);
      setBookingQuote(quote || fallbackQuote);
      setBookingStep('quote');
    } catch (error: unknown) {
      console.error('Booking creation error:', error);
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Impossible de créer la réservation.";
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
    } catch (error: unknown) {
      console.error('Payment intent error:', error);
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Impossible de préparer le paiement. Vérifiez vos informations.";
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
              <option value="private-events">Cuisinier hôte (lieu + repas)</option>
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
            {chefs.map((chef, index) => {
              const chefId = getChefIdentifier(chef) || `${index}`;
              const chefName = getChefDisplayName(chef) || 'Chef Anonyme';
              const profileImage = getChefProfileImage(chef);
              const cuisineList = Array.isArray(chef.cuisineTypes) ? chef.cuisineTypes : [];
              const serviceList = Array.isArray(chef.serviceTypes) ? chef.serviceTypes : [];
              const primaryCity = (() => {
                const areas = Array.isArray(chef.serviceAreas) ? chef.serviceAreas : [];
                const cityName = areas.length > 0 && typeof areas[0]?.city === 'string' ? areas[0].city : undefined;
                return cityName && cityName.trim() ? cityName : 'Toute France';
              })();
              const menus = Array.isArray(chef.portfolio?.menus) ? chef.portfolio.menus : [];
              const experienceValue = typeof chef.experience === 'number' ? chef.experience : Number(chef.experience ?? 0) || 0;
              const hourlyRateValue = typeof chef.hourlyRate === 'number' ? chef.hourlyRate : Number(chef.hourlyRate ?? 0) || 0;
              const ratingAverage = typeof chef.rating?.average === 'number' ? chef.rating.average : 0;
              const ratingCount = typeof chef.rating?.count === 'number' ? chef.rating.count : 0;
              const ratingLabel = ratingCount > 0 ? ratingAverage.toFixed(1) : 'N/A';

              return (
                <div key={chefId} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <img
                    src={profileImage}
                    alt={chefName}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <h2 className="text-2xl font-bold text-gray-800">{formatChefName(chefName)}</h2>
                        {chef.isActive !== false && <span className="ml-2 w-3 h-3 bg-green-500 rounded-full"></span>}
                      </div>
                      <span className="inline-flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-1" />
                        {primaryCity}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-2">
                      <p><span className="font-semibold">Spécialité:</span> {chef.specialty || 'Non renseignée'}</p>
                      <p><span className="font-semibold">Expérience:</span> {experienceValue ? `${experienceValue} ans` : 'Non renseignée'}</p>
                      <p><span className="font-semibold">Taux horaire:</span> {hourlyRateValue ? formatCurrency(hourlyRateValue) : 'Non renseigné'}</p>
                      <p><span className="font-semibold">Cuisines:</span> {cuisineList.length ? cuisineList.join(', ') : 'Non renseignées'}</p>
                      <p><span className="font-semibold">Services:</span> {serviceList.length ? serviceList.join(', ') : 'Non renseignés'}</p>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Star className="h-5 w-5 text-yellow-400 fill-current" />
                      <span>{ratingLabel} ({ratingCount} avis)</span>
                    </div>
                    <p className="text-gray-700 text-sm line-clamp-3">{chef.description || 'Pas encore de description.'}</p>
                    <div className="pt-4 border-t border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Offres du Chef</h3>
                      {menus.length > 0 ? (
                        <div className="space-y-4">
                          {menus.slice(0, 2).map((menu) => {
                            const menuId = getMenuIdentifier(menu);
                            const menuPriceValue = typeof menu.price === 'number' ? menu.price : Number(menu.price ?? 0);
                            return (
                              <div key={menuId || menu.name} className="p-3 bg-gray-50 rounded-lg">
                                <h4 className="font-semibold">{menu.name}</h4>
                                <p className="text-sm text-gray-600">{menu.description}</p>
                                <div className="flex justify-between items-center mt-2">
                                  <span className="font-bold text-lg text-emerald-600">{formatCurrency(menuPriceValue > 0 ? menuPriceValue : 0)}</span>
                                  <button
                                    onClick={() => handleBookChef(chef, menuId)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded-lg text-sm transition duration-300"
                                  >
                                    Réserver ce menu
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                          {menus.length > 2 && (
                            <button
                              onClick={() => navigate(`/chefs/${chefId}/menus`)}
                              className="text-sm font-semibold text-green-600 hover:text-green-700 transition-colors w-full text-center mt-2"
                            >
                              Voir plus d'offres
                            </button>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Aucune offre disponible pour le moment.</p>
                      )}
                    </div>
                    <div className="flex justify-end items-center pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleBookChef(chef)}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                      >
                        Réserver ce chef
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
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
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">Réserver {formatChefName(getChefDisplayName(selectedChef))}</h2>
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
                      <option value="private-events">Cuisinier hôte (lieu + repas)</option>
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
                      {selectedChef.portfolio?.menus?.map((menu: Menu) => {
                        const menuId = getMenuIdentifier(menu);
                        return (
                          <option key={menuId} value={menuId}>
                            {menu.name} · {formatCurrency(Number(menu.price || 0))}
                          </option>
                        );
                      })}
                    </select>
                    {selectedMenuDetails ? (
                      <div className="mt-2 text-xs text-gray-500 space-y-1">
                        <p>
                          Tarif {selectedMenuDetails.type === 'horaire' ? 'horaire' : 'forfaitaire'} : {formatCurrency(Number(selectedMenuDetails.price || 0))}
                          {selectedMenuDetails.type === 'horaire' ? ' / heure' : ''}
                        </p>
                        {(selectedMenuDetails.minGuests || selectedMenuDetails.maxGuests) && (
                          <p>
                            Convives acceptés : {selectedMenuDetails.minGuests || 1}
                            {selectedMenuDetails.maxGuests ? ` à ${selectedMenuDetails.maxGuests}` : '+'}
                          </p>
                        )}
                        {selectedMenuDetails.duration && (
                          <p>Durée indicative : {selectedMenuDetails.duration}</p>
                        )}
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-gray-500">Pas de menu prédéfini, le tarif est basé sur le taux horaire du chef.</p>
                    )}
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
                    <div className="space-y-3 text-sm text-gray-600">
                      {bookingQuote.menu ? (
                        <>
                          <div className="flex items-center justify-between">
                            <span>Menu sélectionné</span>
                            <strong>{bookingQuote.menu.name}</strong>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>
                              {bookingQuote.menu.type === 'horaire'
                                ? `Tarif horaire (${formatCurrency(bookingQuote.menu.unitPrice)} / h × ${(bookingQuote.calculation?.menu?.durationHours ?? Number(bookingDetails.duration))}h)`
                                : 'Forfait chef'}
                            </span>
                            <strong>{formatCurrency(bookingQuote.basePrice)}</strong>
                          </div>
                          {bookingQuote.calculation?.menu?.guests ? (
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>Convives</span>
                              <span>{bookingQuote.calculation.menu.guests}</span>
                            </div>
                          ) : null}
                        </>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span>
                            Tarif horaire ({formatCurrency(bookingQuote.calculation?.hourlyRate ?? Number(selectedChef.hourlyRate || 0))} × {(bookingQuote.calculation?.durationHours ?? Number(bookingDetails.duration))}h)
                          </span>
                          <strong>{formatCurrency(bookingQuote.basePrice)}</strong>
                        </div>
                      )}
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
                    {bookingQuote.menu && (
                      <p><strong>Menu :</strong> {bookingQuote.menu.name}</p>
                    )}
                    <p><strong>Date de l'évènement :</strong> {bookingDetails.date ? new Date(bookingDetails.date).toLocaleDateString('fr-FR') : '—'} à {bookingDetails.time}</p>
                    {bookingQuote.calculation?.method === 'menu' && bookingQuote.calculation.menu ? (
                      <p><strong>Participants :</strong> {bookingQuote.calculation.menu.guests}</p>
                    ) : null}
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
