import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect, authorize, canAccessChefData } from '../middleware/auth.js';
import multer from 'multer';
import Chef from '../models/Chef.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDirectory = path.join(__dirname, '..', 'uploads');
const ALLOWED_DOCUMENT_TYPES = new Set(['cv', 'insurance', 'healthCertificate', 'businessLicense']);

const ensureUploadsDirectory = () => {
  if (!fs.existsSync(uploadsDirectory)) {
    fs.mkdirSync(uploadsDirectory, { recursive: true });
  }
};

const removeExistingDocumentFile = async (urlPath) => {
  if (!urlPath) return;

  try {
    const sanitizedRelativePath = urlPath.replace(/^\//, '');
    const absolutePath = path.join(__dirname, '..', sanitizedRelativePath);

    if (!absolutePath.startsWith(uploadsDirectory)) {
      console.warn('Skipping deletion for path outside uploads directory:', absolutePath);
      return;
    }

    await fs.promises.unlink(absolutePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Error removing existing document file:', error);
    }
  }
};


// Multer for local document storage
const docStorage = multer.diskStorage({
  destination: function (req, file, cb) {
     try {
      ensureUploadsDirectory();
      cb(null, uploadsDirectory);
    } catch (error) {
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});

const uploadDoc = multer({
  storage: docStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and images are allowed.'), false);
    }
  }
});

// Multer for local image storage
const publicChefDirectory = path.join(__dirname, '..', '..', 'public', 'chef');

const ensureDirectoryExists = (targetPath) => {
  if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath, { recursive: true });
  }
};


const getChefIdentifier = (req) => {
  const rawId = req.user?.id || req.user?._id;
  return rawId ? rawId.toString() : 'unknown-chef';
};

const sanitizeFileNameFragment = (rawValue) => {
  const value = (rawValue ?? '').toString();
  const normalised = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  const cleaned = normalised
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return cleaned || 'chef';
};

const formatTimestampForFilename = () => {
  const now = new Date();
  const pad = (value) => value.toString().padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
};

const normalizeProfileImagePath = (inputPath) => {
  if (!inputPath) {
    return null;
  }

  const withoutHost = inputPath.replace(/^https?:\/\/[^/]+/i, '');
  const trimmedPath = withoutHost.replace(/^\/+/, '');

  if (!trimmedPath.startsWith('chef-images/')) {
    return null;
  }

  return trimmedPath.replace(/^chef-images\//, '');
};

const removeExistingProfileImage = async (urlPath) => {
  if (!urlPath || urlPath.includes('default-profile')) {
    return;
  }

  try {
    const relativePath = normalizeProfileImagePath(urlPath);
    if (!relativePath) {
      return;
    }

    const absolutePath = path.resolve(publicChefDirectory, relativePath);

    if (!absolutePath.startsWith(publicChefDirectory)) {
      console.warn('Skipping deletion for profile image outside allowed directory:', absolutePath);
      return;
    }

    await fs.promises.unlink(absolutePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Error removing existing profile image:', error);
    }
  }
};

// Multer for local image storage
const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      const chefIdentifier = getChefIdentifier(req);
      const chefDirectory = path.join(publicChefDirectory, chefIdentifier);
      ensureDirectoryExists(chefDirectory);
      cb(null, chefDirectory);
    } catch (error) {
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    const safeName = sanitizeFileNameFragment(req.user?.name);
    const timestamp = formatTimestampForFilename();
    const fileExtension = path.extname(file.originalname) || '.jpg';
    cb(null, `${safeName}_profile_${timestamp}${fileExtension}`);
  }
});

const imageUpload = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'), false);
    }
  }
});

const parseNumber = (value) => {
  if (value === null || value === undefined || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const normaliseStringArray = (value) =>
  Array.isArray(value)
    ? value
        .map(item => {
          if (typeof item === 'string') return item;
          if (item && typeof item.name === 'string') return item.name;
          return null;
        })
        .filter(Boolean)
    : [];

const normaliseValueArray = (value) =>
  Array.isArray(value)
    ? value.filter(item => item !== null && item !== undefined && item !== '')
    : undefined;

const normaliseMenuPayload = (menu = {}) => {
  const courses = Array.isArray(menu?.courses)
    ? menu.courses
        .map((course, index) => ({
          name: typeof course === 'string' ? course : course?.name || '',
          order: typeof course?.order === 'number' ? course.order : index + 1
        }))
        .filter(course => course.name)
    : [];

  const minGuests = parseNumber(menu?.minGuests) ?? 1;
  const maxGuests = parseNumber(menu?.maxGuests) ?? minGuests;

  return {
    name: menu?.name,
    description: menu?.description,
    price: parseNumber(menu?.price) ?? 0,
    type: ['forfait', 'horaire'].includes(menu?.type) ? menu.type : 'forfait',
    category: menu?.category || 'Gastronomique',
    courses,
    ingredients: normaliseStringArray(menu?.ingredients),
    allergens: normaliseStringArray(menu?.allergens),
    dietaryOptions: normaliseStringArray(menu?.dietaryOptions),
    duration: menu?.duration || '',
    minGuests,
    maxGuests: maxGuests < minGuests ? minGuests : maxGuests,
    image: menu?.image || null,
    isActive: typeof menu?.isActive === 'boolean' ? menu.isActive : true
  };
};

const buildPublicChefResponse = (chef) => {
  if (!chef) {
    return null;
  }

  const plainChef = typeof chef.toJSON === 'function' ? chef.toJSON() : chef;

  const publicChef = {
    id: plainChef.id || plainChef._id?.toString() || null,
    user: plainChef.user || null,
    profilePicture: plainChef.profilePicture || '/chef-images/default-profile.png',
    specialty: plainChef.specialty || '',
    experience: plainChef.experience ?? 0,
    hourlyRate: plainChef.hourlyRate ?? 0,
    description: plainChef.description || '',
    cuisineTypes: Array.isArray(plainChef.cuisineTypes) ? plainChef.cuisineTypes : [],
    serviceTypes: Array.isArray(plainChef.serviceTypes) ? plainChef.serviceTypes : [],
    serviceAreas: Array.isArray(plainChef.serviceAreas) ? plainChef.serviceAreas : [],
    rating: plainChef.rating || { average: 0, count: 0 },
    portfolio: {
      images: plainChef.portfolio?.images || [],
      videos: plainChef.portfolio?.videos || [],
      description: plainChef.portfolio?.description || '',
      menus: Array.isArray(plainChef.portfolio?.menus)
        ? plainChef.portfolio.menus
            .filter(menu => menu && (menu.isActive ?? true))
            .map((menu) => {
              const plainMenu = typeof menu.toJSON === 'function' ? menu.toJSON() : menu;
              return {
                id: plainMenu.id || plainMenu._id?.toString() || null,
                name: plainMenu.name || '',
                description: plainMenu.description || '',
                price: plainMenu.price ?? 0,
                type: plainMenu.type || 'forfait',
                category: plainMenu.category || 'Gastronomique',
                courses: Array.isArray(plainMenu.courses) ? plainMenu.courses : [],
                ingredients: Array.isArray(plainMenu.ingredients) ? plainMenu.ingredients : [],
                allergens: Array.isArray(plainMenu.allergens) ? plainMenu.allergens : [],
                dietaryOptions: Array.isArray(plainMenu.dietaryOptions) ? plainMenu.dietaryOptions : [],
                duration: plainMenu.duration || '',
                minGuests: plainMenu.minGuests ?? 1,
                maxGuests: plainMenu.maxGuests ?? plainMenu.minGuests ?? 1,
                image: plainMenu.image || null,
                isActive: plainMenu.isActive ?? true,
                createdAt: plainMenu.createdAt || null,
                updatedAt: plainMenu.updatedAt || null
              };
            })
        : []
    }
  };

  return publicChef;
};

// @desc    Get all chefs with filtering and pagination
// @route   GET /api/chefs
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      city,
      cuisineType,
      serviceType,
      minPrice,
      maxPrice,
      rating,
      sortBy = 'rating.average',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    let query = { 'verification.status': 'approved', isActive: true };

    // Location filter
    if (city) {
      query['serviceAreas.city'] = new RegExp(city, 'i');
    }

    // Cuisine type filter
    if (cuisineType) {
      query.cuisineTypes = { $in: [cuisineType] };
    }

    // Service type filter
    if (serviceType) {
      query.serviceTypes = { $in: [serviceType] };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.hourlyRate = {};
      if (minPrice) query.hourlyRate.$gte = parseInt(minPrice);
      if (maxPrice) query.hourlyRate.$lte = parseInt(maxPrice);
    }

    // Rating filter
    if (rating) {
      query['rating.average'] = { $gte: parseFloat(rating) };
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const chefsFromDb = await Chef.find(query)
      .populate('user', 'name email avatar')
      .select('-documents -bankDetails')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    console.log('[Backend] Chefs from DB (before deduplication):', chefsFromDb);

    const seenUserIds = new Set();
    const uniqueChefs = [];

    for (const chefDoc of chefsFromDb) {
      const populatedUser = chefDoc?.user;
      const userId =
        populatedUser?._id?.toString?.() ??
        (typeof populatedUser === 'string' || typeof populatedUser === 'number'
          ? String(populatedUser)
          : populatedUser?.toString?.());

      if (!userId || seenUserIds.has(userId)) {
        if (!userId) {
          console.warn('[Backend] Chef record without resolvable user id, keeping for inspection:', chefDoc?._id);
          uniqueChefs.push(chefDoc);
        }
        continue;
      }

      seenUserIds.add(userId);
      uniqueChefs.push(chefDoc);
    }
    console.log('[Backend] Unique chefs (after deduplication):', uniqueChefs);

    const chefs = uniqueChefs.map(buildPublicChefResponse);

    const totalUniqueChefUsers = await Chef.distinct('user', query);
    const total = totalUniqueChefUsers.length;

    res.json({
      success: true,
      chefs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get chefs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching chefs'
    });
  }
});

// @desc    Get chef's own profile
// @route   GET /api/chefs/me/profile
// @access  Private (Chef)
router.get('/me/profile', protect, authorize('chef'), async (req, res) => {
  try {
    const chef = await Chef.findOne({ user: req.user.id })
      .populate('user', 'name email phone avatar')
      .populate('reviews.user', 'name avatar')
      .select('+documents');

    if (!chef) {
      return res.status(404).json({
        success: false,
        message: 'Chef profile not found'
      });
    }

    console.log('--- Chef Profile Data from DB ---');
    console.log(chef);
    console.log('Chef Profile Picture URL:', chef.profilePicture); // Added log

    // Ensure profilePicture is a local path if it's still a Cloudinary URL
    if (chef.profilePicture && chef.profilePicture.startsWith('https://res.cloudinary.com/your-cloud-name/')) {
      chef.profilePicture = '/chef-photos/default-profile.png';
    }

    res.json({
      success: true,
      chef
    });

  } catch (error) {
    console.error('Get chef profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching chef profile'
    });
  }
});

// @desc    Create/Update chef profile
// @route   PUT /api/chefs/me/profile
// @access  Private (Chef)
router.put('/me/profile', protect, authorize('chef'), [
  body('specialty').notEmpty().withMessage('Specialty is required'),
  body('experience').optional().isInt({ min: 0 }).withMessage('Experience must be a positive number'),
  body('hourlyRate').optional().isFloat({ min: 20 }).withMessage('Hourly rate must be at least 20€'),
  body('description').optional().isLength({ min: 50, max: 1000 }).withMessage('Description must be 50-1000 characters')
], async (req, res) => {
  try {
    console.log('--- Update Chef Profile Debug ---');
    console.log('Request Body:', req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation Errors:', errors.array());
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      name,
      email,
      phone,
      address,
      city,
      zipCode,
      specialty,
      experience,
      hourlyRate,
      description,
      cuisineTypes,
      serviceTypes,
      serviceAreas,
      certifications,
      portfolio
    } = req.body;

    const normalisedCuisineTypes = normaliseValueArray(cuisineTypes);
    const normalisedServiceTypes = normaliseValueArray(serviceTypes);
    const normalisedServiceAreas = Array.isArray(serviceAreas)
      ? serviceAreas.map(area => ({
          city: area?.city || '',
          zipCodes: Array.isArray(area?.zipCodes) ? area.zipCodes : [],
          maxDistance: typeof area?.maxDistance === 'number' ? area.maxDistance : 30
        }))
      : undefined;
    const normalisedCertifications = Array.isArray(certifications)
      ? certifications.map(cert => ({
          name: cert?.name || '',
          issuer: cert?.issuer || '',
          dateObtained: cert?.dateObtained || null,
          expiryDate: cert?.expiryDate || null,
          documentUrl: cert?.documentUrl || null
        }))
      : undefined;

    let chef = await Chef.findOne({ user: req.user.id });
    
    if (!chef) {
      console.log('Chef profile not found, creating new one.');
      // Create new chef profile
      chef = await Chef.create({
        user: req.user.id,
        specialty,
        experience: parseNumber(experience),
        hourlyRate: parseNumber(hourlyRate),
        description,
         cuisineTypes: normalisedCuisineTypes || [],
        serviceTypes: normalisedServiceTypes || [],
        serviceAreas: normalisedServiceAreas || [],
        certifications: normalisedCertifications || [],
        portfolio: {
          description: portfolio?.description || '',
          images: normaliseValueArray(portfolio?.images) || [],
          videos: normaliseValueArray(portfolio?.videos) || []
        }
      });
    } else {
      console.log('Updating existing chef profile.');
      // Update existing chef profile fields
      if (specialty) chef.specialty = specialty;
      const parsedExperience = parseNumber(experience);
      const parsedHourlyRate = parseNumber(hourlyRate);
      if (typeof parsedExperience !== 'undefined') chef.experience = parsedExperience;
      if (typeof parsedHourlyRate !== 'undefined') chef.hourlyRate = parsedHourlyRate;
      if (description) chef.description = description;
      if (normalisedCuisineTypes) chef.cuisineTypes = normalisedCuisineTypes;
      if (normalisedServiceTypes) chef.serviceTypes = normalisedServiceTypes;
      if (normalisedServiceAreas) chef.serviceAreas = normalisedServiceAreas;
      if (normalisedCertifications) chef.certifications = normalisedCertifications;

      if (!chef.portfolio) {
        chef.portfolio = { images: [], videos: [], description: '', menus: [] };
      }

      if (portfolio) {
        if (typeof portfolio.description === 'string') {
          chef.portfolio.description = portfolio.description;
        }
        if (Array.isArray(portfolio.images)) {
          chef.portfolio.images = portfolio.images;
        }
        if (Array.isArray(portfolio.videos)) {
          chef.portfolio.videos = portfolio.videos;
        }
      }
      await chef.save();
      console.log('Chef profile saved.');
    }

    // Update user details
    const user = await User.findById(req.user.id);
    if (user) {
      console.log('Updating user details.');
      if (name) user.name = name;
      if (email) user.email = email;
      if (phone) user.phone = phone;
      if (address || city || zipCode) {
        user.address = {
          ...user.address,
          street: address,
          city: city,
          zipCode: zipCode,
        };
      }
      await user.save();
      console.log('User details saved.');
    }

    await chef.populate('user', 'name email phone avatar');
    console.log('Chef populated with user data.');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      chef
    });

  } catch (error) {
    console.error('--- Update Chef Profile Error ---');
    console.error('Detailed Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating chef profile'
    });
  }
});

// @desc    Upload chef profile picture
// @route   POST /api/chefs/me/profile-picture
// @access  Private (Chef)
router.post('/me/profile-picture', protect, authorize('chef'), imageUpload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const chef = await Chef.findOne({ user: req.user.id });
    if (!chef) {
      return res.status(404).json({
        success: false,
        message: 'Chef profile not found'
      });
    }

    const chefIdentifier = getChefIdentifier(req);
    const imageUrl = `/chef-images/${chefIdentifier}/${req.file.filename}`.replace(/\\/g, '/');

    const previousImage = chef.profilePicture;
    if (previousImage && previousImage !== imageUrl) {
      await removeExistingProfileImage(previousImage);
    }

    chef.profilePicture = imageUrl;
    await chef.save();

    const user = await User.findById(req.user.id);
    if (user) {
      const previousAvatar = user.avatar;
      if (previousAvatar && previousAvatar !== imageUrl && previousAvatar !== previousImage) {
        await removeExistingProfileImage(previousAvatar);
      }
      user.avatar = imageUrl;
      await user.save();
    }

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      profilePicture: imageUrl
    });

  } catch (error) {
    console.error('Profile picture upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading profile picture'
    });
  }
});

// @desc    Upload chef documents
// @route   POST /api/chefs/me/documents
// @access  Private (Chef)
router.post('/me/documents', protect, authorize('chef'), uploadDoc.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      console.error('Document upload error: No file uploaded.');
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { type } = req.body;
    if (!type) {
      console.error('Document upload error: Document type is required.');
      return res.status(400).json({
        success: false,
        message: 'Document type is required'
      });
    }

     if (!ALLOWED_DOCUMENT_TYPES.has(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document type'
      });
    }

    const documentUrl = `/uploads/${req.file.filename}`;
    console.log(`Attempting to save document: type=${type}, url=${documentUrl}`);

    // Update chef profile with document URL
    const chef = await Chef.findOne({ user: req.user.id }).select('+documents');
    if (!chef) {
      console.error('Document upload error: Chef profile not found for user ID:', req.user.id);
      return res.status(404).json({
        success: false,
        message: 'Chef profile not found'
      });
    }

    // Ensure documents object exists before assigning
    if (!chef.documents) {
      chef.documents = {};
    }
    // Ensure the specific document type object exists before assigning
    if (!chef.documents[type]) {
      chef.documents[type] = {};
    }

    const existingDocumentUrl = chef.documents[type]?.url;
    if (existingDocumentUrl) {
      await removeExistingDocumentFile(existingDocumentUrl);
    }


    chef.documents[type].url = documentUrl;
    chef.documents[type].uploadedAt = new Date();
    
    console.log('Chef document object before save:', chef.documents);
    chef.markModified('documents');
    await chef.save();
    console.log('Chef document saved successfully.');

    const savedDocument = chef.documents[type];

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      document: {
        type,
        url: savedDocument?.url || null,
        uploadedAt: savedDocument?.uploadedAt
          ? new Date(savedDocument.uploadedAt).toISOString()
          : null
      }
    });

  } catch (error) {
    console.error('--- Document Upload Error ---');
    console.error('Detailed Error during document upload:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading document'
    });
  }
});

// @desc    Delete a chef document
// @route   DELETE /api/chefs/me/documents/:type
// @access  Private (Chef)
router.delete('/me/documents/:type', protect, authorize('chef'), async (req, res) => {
  try {
    const { type } = req.params;

    if (!ALLOWED_DOCUMENT_TYPES.has(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document type'
      });
    }

    const chef = await Chef.findOne({ user: req.user.id }).select('+documents');

    if (!chef) {
      return res.status(404).json({
        success: false,
        message: 'Chef profile not found'
      });
    }

    const documentEntry = chef.documents?.[type];

    if (!documentEntry || !documentEntry.url) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    await removeExistingDocumentFile(documentEntry.url);

    chef.documents[type].url = null;
    chef.documents[type].uploadedAt = null;
    chef.markModified('documents');

    await chef.save();

    res.json({
      success: true,
      message: 'Document deleted successfully',
      document: {
        type,
        url: null,
        uploadedAt: null
      }
    });
  } catch (error) {
    console.error('--- Document Delete Error ---');
    console.error('Detailed Error during document deletion:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting document'
    });
  }
});

// @desc    Get chef's menus
// @route   GET /api/chefs/me/menus
// @access  Private (Chef)
router.get('/me/menus', protect, authorize('chef'), async (req, res) => {
  try {
    const chef = await Chef.findOne({ user: req.user.id });
    if (!chef) {
      return res.status(404).json({
        success: false,
        message: 'Chef profile not found'
      });
    }

    res.json({
      success: true,
      menus: chef?.portfolio?.menus || []
    });

  } catch (error) {
    console.error('Get menus error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching menus'
    });
  }
});

// @desc    Create new menu
// @route   POST /api/chefs/me/menus
// @access  Private (Chef)
router.post('/me/menus', protect, authorize('chef'), [
  body('name').notEmpty().withMessage('Menu name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('type').isIn(['forfait', 'horaire']).withMessage('Invalid menu type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const chef = await Chef.findOne({ user: req.user.id });
    if (!chef) {
      return res.status(404).json({
        success: false,
        message: 'Chef profile not found'
      });
    }
     if (!chef.portfolio) {
      chef.portfolio = { images: [], videos: [], description: '', menus: [] };
    }

    if (!Array.isArray(chef.portfolio.menus)) {
      chef.portfolio.menus = [];
    }

    const menuData = normaliseMenuPayload(req.body);

    const newMenu = {
      ...menuData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (!chef.portfolio.menus) {
      chef.portfolio.menus = [];
    }
    
    chef.portfolio.menus.push(newMenu);
    await chef.save();
    const savedMenu = chef.portfolio.menus[chef.portfolio.menus.length - 1];

    res.status(201).json({
      success: true,
      message: 'Menu created successfully',
      menu: savedMenu
    });

  } catch (error) {
    console.error('Create menu error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating menu'
    });
  }
});

// @desc    Update menu
// @route   PUT /api/chefs/me/menus/:menuId
// @access  Private (Chef)
router.put('/me/menus/:menuId', protect, authorize('chef'), async (req, res) => {
  try {
    const chef = await Chef.findOne({ user: req.user.id });
    if (!chef) {
      return res.status(404).json({
        success: false,
        message: 'Chef profile not found'
      });
    }

     if (!chef.portfolio || !Array.isArray(chef.portfolio.menus)) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found'
      });
    }

    const menu = chef.portfolio.menus.id(req.params.menuId);
    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found'
      });
    }

    const baseMenuData = menu.toObject ? menu.toObject() : menu;
    const mergedMenu = {
      ...baseMenuData,
      ...req.body,
      price: parseNumber(req.body?.price) ?? menu.price,
      minGuests: parseNumber(req.body?.minGuests) ?? menu.minGuests,
      maxGuests: parseNumber(req.body?.maxGuests) ?? menu.maxGuests
    };

    await chef.save();

    res.json({
      success: true,
      message: 'Menu updated successfully',
      menu
    });

  } catch (error) {
    console.error('Update menu error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating menu'
    });
  }
});

// @desc    Delete menu
// @route   DELETE /api/chefs/me/menus/:menuId
// @access  Private (Chef)
router.delete('/me/menus/:menuId', protect, authorize('chef'), async (req, res) => {
  try {
    const chef = await Chef.findOne({ user: req.user.id });
    if (!chef) {
      return res.status(404).json({
        success: false,
        message: 'Chef profile not found'
      });
    }

     if (!chef.portfolio || !Array.isArray(chef.portfolio.menus)) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found'
      });
    }

    const menu = chef.portfolio.menus.id(req.params.menuId);
    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found'
      });
    }

    menu.deleteOne();
    await chef.save();

    res.json({
      success: true,
      message: 'Menu deleted successfully'
    });

  } catch (error) {
    console.error('Delete menu error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting menu'
    });
  }
});

// @desc    Upload menu image
// @route   POST /api/chefs/me/menus/:menuId/image
// @access  Private (Chef)
router.post('/me/menus/:menuId/image', protect, authorize('chef'), imageUpload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const chef = await Chef.findOne({ user: req.user.id });
    if (!chef) {
      return res.status(404).json({
        success: false,
        message: 'Chef profile not found'
      });
    }

    if (!chef.portfolio || !Array.isArray(chef.portfolio.menus)) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found'
      });
    }

    const menu = chef.portfolio.menus.id(req.params.menuId);
    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found'
      });
    }

    const chefIdentifier = getChefIdentifier(req);
    const imageUrl = `/chef-images/${chefIdentifier}/${req.file.filename}`.replace(/\\/g, '/');

    menu.image = imageUrl;
    menu.updatedAt = new Date();
    await chef.save();

    res.json({
      success: true,
      message: 'Menu image uploaded successfully',
      url: imageUrl
    });

  } catch (error) {
    console.error('Menu image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading menu image'
    });
  }
});

// @desc    Get chef's bookings/missions
// @route   GET /api/chefs/me/bookings
// @access  Private (Chef)
router.get('/:id/bookings', protect, canAccessChefData, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const chef = await Chef.findOne({ user: req.params.id });
    if (!chef) {
      return res.status(404).json({
        success: false,
        message: 'Chef profile not found'
      });
    }

    let query = { chef: chef._id };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('client', 'name email phone avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get chef bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings'
    });
  }
});

// @desc    Update chef availability
// @route   PUT /api/chefs/me/availability
// @access  Private (Chef)
router.put('/me/availability', protect, authorize('chef'), async (req, res) => {
  try {
    const chef = await Chef.findOne({ user: req.user.id });

    if (!chef) {
      return res.status(404).json({
        success: false,
        message: 'Chef profile not found'
      });
    }

    chef.availability = { ...chef.availability, ...req.body };
    await chef.save();

    res.json({
      success: true,
      message: 'Availability updated successfully',
      availability: chef.availability
    });

  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating availability'
    });
  }
});

// @desc    Get chef earnings and statistics
// @route   GET /api/chefs/me/earnings
// @access  Private (Chef)
router.get('/me/earnings', protect, authorize('chef'), async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    const chef = await Chef.findOne({ user: req.user.id });
    if (!chef) {
      return res.status(404).json({
        success: false,
        message: 'Chef profile not found'
      });
    }

    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case '7d':
        dateFilter = { $gte: new Date(now.setDate(now.getDate() - 7)) };
        break;
      case '30d':
        dateFilter = { $gte: new Date(now.setDate(now.getDate() - 30)) };
        break;
      case '90d':
        dateFilter = { $gte: new Date(now.setDate(now.getDate() - 90)) };
        break;
      case '1y':
        dateFilter = { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) };
        break;
    }

    const [earnings, totalStats, monthlyBreakdown] = await Promise.all([
      // Daily earnings
      Booking.aggregate([
        {
          $match: {
            chef: chef._id,
            status: 'completed',
            createdAt: dateFilter
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            totalEarnings: { $sum: "$pricing.basePrice" },
            commission: { $sum: "$pricing.serviceFee" },
            bookingCount: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Total stats
      Booking.aggregate([
        {
          $match: {
            chef: chef._id,
            status: 'completed',
            createdAt: dateFilter
          }
        },
        {
          $group: {
            _id: null,
            totalEarnings: { $sum: "$pricing.basePrice" },
            totalCommission: { $sum: "$pricing.serviceFee" },
            totalBookings: { $sum: 1 },
            averageRating: { $avg: "$review.clientReview.rating" }
          }
        }
      ]),

      // Monthly breakdown
      Booking.aggregate([
        {
          $match: {
            chef: chef._id,
            status: 'completed'
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            earnings: { $sum: "$pricing.basePrice" },
            missions: { $sum: 1 },
            avgRating: { $avg: "$review.clientReview.rating" }
          }
        },
        { $sort: { _id: -1 } },
        { $limit: 6 }
      ])
    ]);

    res.json({
      success: true,
      earnings: {
        daily: earnings,
        total: totalStats[0] || { totalEarnings: 0, totalCommission: 0, totalBookings: 0, averageRating: 0 },
        monthly: monthlyBreakdown
      }
    });

  } catch (error) {
    console.error('Get earnings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching earnings'
    });
  }
});

// @desc    Get public chef menus
// @route   GET /api/chefs/:chefId/menus
// @access  Public
router.get('/:chefId/menus', async (req, res) => {
  try {
    const { chefId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(chefId)) {
      return res.status(400).json({
        success: false,
        message: 'Identifiant de chef invalide.'
      });
    }

    const chef = await Chef.findOne({
      _id: chefId,
      'verification.status': 'approved',
      isActive: true
    }).populate('user', 'name email avatar');

    if (!chef) {
      return res.status(404).json({
        success: false,
        message: 'Chef introuvable ou inactif.'
      });
    }

    const publicChef = buildPublicChefResponse(chef);
    const { portfolio, ...restChef } = publicChef;
    const menus = Array.isArray(portfolio?.menus) ? portfolio.menus : [];

    res.json({
      success: true,
      chef: {
        ...restChef,
        portfolio: {
          images: portfolio?.images || [],
          videos: portfolio?.videos || [],
          description: portfolio?.description || ''
        }
      },
      menus
    });

  } catch (error) {
    console.error('Get public chef menus error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des menus du chef.'
    });
  }
});

// @desc    Get public chef profile
// @route   GET /api/chefs/:chefId
// @access  Public
router.get('/:chefId', async (req, res) => {
  try {
    const { chefId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(chefId)) {
      return res.status(400).json({
        success: false,
        message: 'Identifiant de chef invalide.'
      });
    }

    const chef = await Chef.findOne({
      _id: chefId,
      'verification.status': 'approved',
      isActive: true
    }).populate('user', 'name email avatar');

    if (!chef) {
      return res.status(404).json({
        success: false,
        message: 'Chef introuvable ou inactif.'
      });
    }

    const publicChef = buildPublicChefResponse(chef);

    res.json({
      success: true,
      chef: publicChef
    });

  } catch (error) {
    console.error('Get public chef profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil du chef.'
    });
  }
});

// @desc    Get chef statistics
// @route   GET /api/chefs/:id/dashboard/stats
// @access  Private (Chef or Admin)
router.get('/:id/dashboard/stats', protect, canAccessChefData, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    const chef = await Chef.findOne({ user: req.params.id });
    if (!chef) {
      return res.status(404).json({
        success: false,
        message: 'Chef profile not found'
      });
    }

    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case '7d':
        dateFilter = { $gte: new Date(now.setDate(now.getDate() - 7)) };
        break;
      case '30d':
        dateFilter = { $gte: new Date(now.setDate(now.getDate() - 30)) };
        break;
      case '90d':
        dateFilter = { $gte: new Date(now.setDate(now.getDate() - 90)) };
        break;
    }

    const [
      bookingStats,
      revenueByType,
      clientRetention,
      performanceMetrics
    ] = await Promise.all([
      // Booking statistics
      Booking.aggregate([
        { $match: { chef: chef._id, createdAt: dateFilter } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ]),

      // Revenue by service type
      Booking.aggregate([
        { $match: { chef: chef._id, status: 'completed', createdAt: dateFilter } },
        {
          $group: {
            _id: "$serviceType",
            revenue: { $sum: "$pricing.basePrice" },
            count: { $sum: 1 }
          }
        }
      ]),

      // Client retention
      Booking.aggregate([
        { $match: { chef: chef._id, status: 'completed' } },
        {
          $group: {
            _id: "$client",
            bookingCount: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: null,
            repeatClients: { $sum: { $cond: [{ $gt: ["$bookingCount", 1] }, 1, 0] } },
            totalClients: { $sum: 1 }
          }
        }
      ]),

      // Performance metrics
      Booking.aggregate([
        { $match: { chef: chef._id } },
        {
          $group: {
            _id: null,
            totalRequests: { $sum: 1 },
            acceptedRequests: { $sum: { $cond: [{ $ne: ["$status", "cancelled"] }, 1, 0] } },
            avgResponseTime: { $avg: { $subtract: ["$updatedAt", "$createdAt"] } }
          }
        }
      ])
    ]);

    // Update chef stats
    await chef.updateStats();
    await chef.save();

    res.json({
      success: true,
      statistics: {
        bookingStats,
        revenueByType,
        clientRetention: clientRetention[0] || { repeatClients: 0, totalClients: 0 },
        performanceMetrics: performanceMetrics[0] || { totalRequests: 0, acceptedRequests: 0, avgResponseTime: 0 },
        chefStats: chef.stats
      }
    });

  } catch (error) {
    console.error('Get chef statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching chef statistics'
    });
  }
});

// @desc    Get chef reviews
// @route   GET /api/chefs/me/reviews
// @access  Private (Chef)
router.get('/me/reviews', protect, authorize('chef'), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const chef = await Chef.findOne({ user: req.user.id });
    if (!chef) {
      return res.status(404).json({
        success: false,
        message: 'Chef profile not found'
      });
    }

    const reviews = await Booking.find({
      chef: chef._id,
      'review.clientReview.rating': { $exists: true }
    })
    .populate('client', 'name avatar')
    .select('client review eventDetails createdAt')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Booking.countDocuments({
      chef: chef._id,
      'review.clientReview.rating': { $exists: true }
    });

    res.json({
      success: true,
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get chef reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews'
    });
  }
});

export default router;
