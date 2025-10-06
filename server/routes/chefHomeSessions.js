import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { protect, authorize } from '../middleware/auth.js';
import ChefHomeLocation from '../models/ChefHomeLocation.js';
import ChefHomeAppointment from '../models/ChefHomeAppointment.js';
import Chef from '../models/Chef.js';

const router = express.Router();

const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

const ensureChefProfile = async (userId) => {
  return Chef.findOne({ user: userId });
};

const locationValidators = [
  body('title').isString().trim().isLength({ min: 4, max: 120 }).withMessage('Un titre entre 4 et 120 caractères est requis.'),
  body('description').optional().isString().isLength({ max: 2000 }).withMessage('La description ne peut pas dépasser 2000 caractères.'),
  body('address.street').isString().trim().notEmpty().withMessage('L\'adresse est obligatoire.'),
  body('address.city').isString().trim().notEmpty().withMessage('La ville est obligatoire.'),
  body('address.zipCode').isString().trim().notEmpty().withMessage('Le code postal est obligatoire.'),
  body('address.country').optional().isString().trim(),
  body('address.accessInstructions').optional().isString(),
  body('capacity.minGuests').optional().isInt({ min: 1 }).toInt(),
  body('capacity.maxGuests').isInt({ min: 1 }).withMessage('La capacité maximale doit être supérieure à 0.').toInt(),
  body('amenities').optional().isArray().withMessage('Les équipements doivent être une liste.'),
  body('pricing.basePrice').isFloat({ min: 0 }).withMessage('Le tarif de base doit être positif.').toFloat(),
  body('pricing.pricePerGuest').optional().isFloat({ min: 0 }).toFloat(),
  body('pricing.currency').optional().isString().trim(),
  body('availability.daysOfWeek').optional().isArray(),
  body('availability.daysOfWeek.*').optional().isIn(daysOfWeek),
  body('availability.timeSlots').optional().isArray(),
  body('availability.timeSlots.*.start').optional().isString(),
  body('availability.timeSlots.*.end').optional().isString(),
  body('availability.leadTimeDays').optional().isInt({ min: 0 }).toInt(),
  body('availability.advanceBookingLimitDays').optional().isInt({ min: 0 }).toInt()
];

const appointmentValidators = [
  param('id').isMongoId().withMessage('Identifiant de lieu invalide.'),
  body('requestedDate').isISO8601().withMessage('Une date valide est requise.'),
  body('requestedTime.start').isString().trim().notEmpty().withMessage('L\'heure de début est requise.'),
  body('requestedTime.end').isString().trim().notEmpty().withMessage('L\'heure de fin est requise.'),
  body('guests').isInt({ min: 1 }).withMessage('Le nombre de convives doit être supérieur à 0.').toInt(),
  body('message').optional().isString().isLength({ max: 2000 }).withMessage('Le message ne peut pas dépasser 2000 caractères.')
];

router.get('/', async (req, res) => {
  try {
    const locations = await ChefHomeLocation.find({ isActive: true })
      .populate({
        path: 'chef',
        populate: { path: 'user', select: 'name avatar phone' }
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: locations });
  } catch (error) {
    console.error('Failed to list chef home locations:', error);
    res.status(500).json({ success: false, message: 'Impossible de récupérer les lieux pour le moment.' });
  }
});

router.get('/my/locations', protect, authorize('chef'), async (req, res) => {
  try {
    const chefProfile = await ensureChefProfile(req.user._id);
    if (!chefProfile) {
      return res.status(404).json({ success: false, message: 'Profil chef introuvable.' });
    }

    const locations = await ChefHomeLocation.find({ chef: chefProfile._id });
    res.json({ success: true, data: locations });
  } catch (error) {
    console.error('Failed to get chef home locations:', error);
    res.status(500).json({ success: false, message: 'Impossible de récupérer vos lieux pour le moment.' });
  }
});

router.get('/my/appointments', protect, authorize('chef'), async (req, res) => {
  try {
    const chefProfile = await ensureChefProfile(req.user._id);
    if (!chefProfile) {
      return res.status(404).json({ success: false, message: 'Profil chef introuvable.' });
    }

    const appointments = await ChefHomeAppointment.find({ chef: chefProfile._id })
      .populate('client', 'name phone email')
      .populate('location');

    res.json({ success: true, data: appointments });
  } catch (error) {
    console.error('Failed to load chef appointments:', error);
    res.status(500).json({ success: false, message: 'Impossible de récupérer les rendez-vous.' });
  }
});

router.get('/appointments/my', protect, authorize('client'), async (req, res) => {
  try {
    const appointments = await ChefHomeAppointment.find({ client: req.user._id })
      .populate({
        path: 'location',
        populate: { path: 'chef', populate: { path: 'user', select: 'name avatar phone' } }
      });

    res.json({ success: true, data: appointments });
  } catch (error) {
    console.error('Failed to load client appointments:', error);
    res.status(500).json({ success: false, message: 'Impossible de récupérer vos demandes.' });
  }
});

router.post('/', protect, authorize('chef'), locationValidators, handleValidation, async (req, res) => {
  try {
    const chefProfile = await ensureChefProfile(req.user._id);
    if (!chefProfile) {
      return res.status(404).json({ success: false, message: 'Profil chef introuvable.' });
    }

    const location = await ChefHomeLocation.create({
      ...req.body,
      chef: chefProfile._id
    });

    res.status(201).json({ success: true, data: location });
  } catch (error) {
    console.error('Failed to create chef home location:', error);
    res.status(500).json({ success: false, message: 'Impossible de créer le lieu pour le moment.' });
  }
});

router.put('/:id', protect, authorize('chef'), locationValidators, handleValidation, async (req, res) => {
  try {
    const chefProfile = await ensureChefProfile(req.user._id);
    if (!chefProfile) {
      return res.status(404).json({ success: false, message: 'Profil chef introuvable.' });
    }

    const location = await ChefHomeLocation.findById(req.params.id);

    if (!location) {
      return res.status(404).json({ success: false, message: 'Lieu introuvable.' });
    }

    if (location.chef.toString() !== chefProfile._id.toString()) {
      return res.status(403).json({ success: false, message: 'Vous ne pouvez modifier que vos propres lieux.' });
    }

    Object.assign(location, req.body);
    await location.save();

    res.json({ success: true, data: location });
  } catch (error) {
    console.error('Failed to update chef home location:', error);
    res.status(500).json({ success: false, message: 'Impossible de mettre à jour le lieu pour le moment.' });
  }
});

router.post('/:id/appointments', protect, authorize('client'), appointmentValidators, handleValidation, async (req, res) => {
  try {
    const location = await ChefHomeLocation.findById(req.params.id).populate('chef');

    if (!location || !location.isActive) {
      return res.status(404).json({ success: false, message: 'Le lieu demandé est introuvable.' });
    }

    const requestedDate = new Date(req.body.requestedDate);
    if (Number.isNaN(requestedDate.getTime())) {
      return res.status(400).json({ success: false, message: 'La date demandée est invalide.' });
    }

    const appointment = await ChefHomeAppointment.create({
      location: location._id,
      chef: location.chef,
      client: req.user._id,
      requestedDate,
      requestedTime: req.body.requestedTime,
      guests: req.body.guests,
      message: req.body.message || ''
    });

    const populated = await appointment.populate('location').populate('chef').populate('client', 'name email phone');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error('Failed to create chef home appointment:', error);
    res.status(500).json({ success: false, message: 'Impossible de soumettre votre demande.' });
  }
});

router.patch('/appointments/:appointmentId/status',
  protect,
  authorize('chef'),
  [
    param('appointmentId').isMongoId().withMessage('Identifiant de rendez-vous invalide.'),
    body('status').isIn(['pending', 'accepted', 'declined', 'cancelled']).withMessage('Statut invalide.')
  ],
  handleValidation,
  async (req, res) => {
    try {
      const chefProfile = await ensureChefProfile(req.user._id);
      if (!chefProfile) {
        return res.status(404).json({ success: false, message: 'Profil chef introuvable.' });
      }

      const appointment = await ChefHomeAppointment.findById(req.params.appointmentId);

      if (!appointment) {
        return res.status(404).json({ success: false, message: 'Rendez-vous introuvable.' });
      }

      if (appointment.chef.toString() !== chefProfile._id.toString()) {
        return res.status(403).json({ success: false, message: 'Accès non autorisé à ce rendez-vous.' });
      }

      appointment.status = req.body.status;
      await appointment.save();

      const populated = await appointment.populate('client', 'name email phone').populate('location');

      res.json({ success: true, data: populated });
    } catch (error) {
      console.error('Failed to update appointment status:', error);
      res.status(500).json({ success: false, message: 'Impossible de mettre à jour le statut du rendez-vous.' });
    }
  }
);

router.get('/:id', async (req, res) => {
  try {
    const location = await ChefHomeLocation.findById(req.params.id)
      .populate({
        path: 'chef',
        populate: { path: 'user', select: 'name avatar phone' }
      });

    if (!location) {
      return res.status(404).json({ success: false, message: 'Lieu introuvable.' });
    }

    res.json({ success: true, data: location });
  } catch (error) {
    console.error('Failed to get chef home location:', error);
    res.status(500).json({ success: false, message: 'Impossible de récupérer le lieu demandé.' });
  }
});

export default router;