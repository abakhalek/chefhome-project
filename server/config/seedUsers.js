import User from '../models/User.js';
import Chef from '../models/Chef.js';
import Booking from '../models/Booking.js'; // Import Booking model
import bcrypt from 'bcryptjs';

// Seed users for testing different interfaces
export const seedUsers = [
  {
    name: "Admin Test",
    email: "admin@chefathome.fr",
    password: "admin123",
    phone: "+33123456789",
    role: "admin",
    isVerified: true,
    isActive: true
  },
  {
    name: "Client Test",
    email: "client@chefathome.fr", 
    password: "client123",
    phone: "+33123456790",
    role: "client",
    isVerified: true,
    isActive: true,
    preferences: {
      dietary: ["vegetarian"],
      allergies: ["nuts"],
      cuisineTypes: ["french", "italian"],
      notifications: {
        email: true,
        sms: false,
        push: true
      }
    },
    address: {
      street: "123 Rue de la Paix",
      city: "Paris",
      zipCode: "75001",
      country: "France"
    }
  },
  {
    name: "Chef Test",
    email: "chef@chefathome.fr",
    password: "chef123", 
    phone: "+33123456791",
    role: "chef",
    isVerified: true,
    isActive: true,
    address: {
      street: "456 Avenue des Champs",
      city: "Paris", 
      zipCode: "75008",
      country: "France"
    }
  },
  {
    name: "Chef Pending",
    email: "chef.pending@chefathome.fr",
    password: "chef123",
    phone: "+33123456793",
    role: "chef",
    isVerified: false,
    isActive: true,
    address: {
      street: "12 Rue des Artisans",
      city: "Lyon",
      zipCode: "69002",
      country: "France"
    }
  },
  {
    name: "B2B Test Company",
    email: "b2b@chefathome.fr",
    password: "b2b123",
    phone: "+33123456792", 
    role: "b2b",
    isVerified: true,
    isActive: true,
    company: {
      name: "Restaurant Le Gourmet",
      siret: "12345678901234",
      address: "789 Boulevard Saint-Germain, 75007 Paris",
      contactPerson: "B2B Test Manager"
    },
    address: {
      street: "789 Boulevard Saint-Germain",
      city: "Paris",
      zipCode: "75007", 
      country: "France"
    }
  }
];

// Chef profile for the chef test user
export const seedChefProfile = {
  specialty: "Cuisine Française Moderne",
  experience: 10,
  hourlyRate: 75,
  description: "Chef expérimenté spécialisé dans la cuisine française moderne avec une approche créative des plats traditionnels.",
  cuisineTypes: ["french", "modern", "fusion"],
  serviceTypes: ["home-dining", "private-events", "cooking-classes"],
  serviceAreas: [{
    city: "Paris",
    zipCodes: ["75001", "75002", "75003", "75004", "75005", "75006", "75007", "75008"],
    maxDistance: 25
  }],
  availability: {
    schedule: {
      monday: { available: true, hours: [{ start: "18:00", end: "23:00" }] },
      tuesday: { available: true, hours: [{ start: "18:00", end: "23:00" }] },
      wednesday: { available: true, hours: [{ start: "18:00", end: "23:00" }] },
      thursday: { available: true, hours: [{ start: "18:00", end: "23:00" }] },
      friday: { available: true, hours: [{ start: "18:00", end: "23:00" }] },
      saturday: { available: true, hours: [{ start: "12:00", end: "23:00" }] },
      sunday: { available: true, hours: [{ start: "12:00", end: "22:00" }] }
    },
    blackoutDates: [],
    minimumBookingHours: 3,
    maximumGuests: 12
  },
  portfolio: {
    images: [
      "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400",
      "https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=400"
    ],
    videos: [],
    menus: [{
      name: "Menu Dégustation Français",
      description: "Un voyage culinaire à travers les régions de France",
      price: 85,
      courses: [
        { name: "Amuse-bouche", order: 1 },
        { name: "Entrée", order: 2 },
        { name: "Plat principal", order: 3 },
        { name: "Fromage", order: 4 },
        { name: "Dessert", order: 5 }
      ],
      dietaryOptions: ["vegetarian-option", "gluten-free-option"]
    }]
  },
  certifications: [{
    name: "CAP Cuisine",
    issuer: "Chambre des Métiers",
    dateObtained: new Date("2015-06-15"),
    expiryDate: null
  }],
  verification: {
    status: "approved",
    verifiedAt: new Date(),
    verifiedBy: null
  },
  isActive: true,
  featured: true
};

export const seedPendingChefProfile = {
  specialty: "Cuisine Européenne",
  experience: 4,
  hourlyRate: 55,
  description: "Chef passionné offrant une cuisine européenne authentique avec des ingrédients locaux.",
  cuisineTypes: ["european", "mediterranean"],
  serviceTypes: ["home-dining", "private-events"],
  serviceAreas: [{
    city: "Lyon",
    zipCodes: ["69001", "69002", "69003", "69004"],
    maxDistance: 20
  }],
  availability: {
    schedule: {
      monday: { available: true, hours: [{ start: "17:00", end: "22:00" }] },
      tuesday: { available: true, hours: [{ start: "17:00", end: "22:00" }] },
      wednesday: { available: true, hours: [{ start: "17:00", end: "22:00" }] },
      thursday: { available: true, hours: [{ start: "17:00", end: "22:00" }] },
      friday: { available: true, hours: [{ start: "17:00", end: "23:00" }] },
      saturday: { available: true, hours: [{ start: "11:00", end: "23:00" }] },
      sunday: { available: false, hours: [] }
    },
    blackoutDates: [],
    minimumBookingHours: 2,
    maximumGuests: 8
  },
  portfolio: {
    images: [
      "https://images.pexels.com/photos/5531551/pexels-photo-5531551.jpeg?auto=compress&cs=tinysrgb&w=400"
    ],
    videos: [],
    menus: [{
      name: "Menu Découverte Méditerranéen",
      description: "Saveurs du sud revisitées pour des repas conviviaux.",
      price: 65,
      courses: [
        { name: "Antipasti", order: 1 },
        { name: "Plat du jour", order: 2 },
        { name: "Dessert maison", order: 3 }
      ],
      dietaryOptions: ["vegetarian-option"]
    }]
  },
  certifications: [{
    name: "Certificat de Cuisine Méditerranéenne",
    issuer: "Institut Culinaire de Lyon",
    dateObtained: new Date("2019-04-20"),
    expiryDate: null
  }],
  verification: {
    status: "pending",
    verifiedAt: null,
    verifiedBy: null
  },
  isActive: true,
  featured: false
};

const chefProfilesByEmail = {
  'chef@chefathome.fr': seedChefProfile,
  'chef.pending@chefathome.fr': seedPendingChefProfile
};

const removeDuplicateChefProfiles = async () => {
  try {
    const duplicates = await Chef.aggregate([
      {
        $group: {
          _id: '$user',
          ids: { $push: '$_id' },
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);

    if (!duplicates.length) {
      return;
    }

    for (const entry of duplicates) {
      const chefIds = entry?.ids || [];
      if (!Array.isArray(chefIds) || chefIds.length < 2) {
        continue;
      }

      const chefs = await Chef.find({ _id: { $in: chefIds } })
        .sort({
          isActive: -1,
          'verification.status': 1,
          updatedAt: -1
        });

      if (!chefs.length) {
        continue;
      }

      const preferredChef = chefs.find((chef) => chef.isActive && chef.verification?.status === 'approved') || chefs[0];
      const idsToRemove = chefs
        .filter((chef) => !chef._id.equals(preferredChef._id))
        .map((chef) => chef._id);

      if (!idsToRemove.length) {
        continue;
      }

      await Chef.deleteMany({ _id: { $in: idsToRemove } });
      console.log(`🧹 Removed ${idsToRemove.length} duplicate chef profile(s) for user ${preferredChef.user}`);
    }
  } catch (error) {
    console.error('❌ Error while removing duplicate chef profiles:', error);
  }
};

export const seedBookingsData = [
  {
    clientEmail: "client@chefathome.fr",
    chefEmail: "chef@chefathome.fr",
    serviceType: "home-dining",
    eventDetails: {
      date: new Date(new Date().setDate(new Date().getDate() + 7)), // 7 days from now
      startTime: "19:00",
      duration: 3,
      guests: 4,
      eventType: "dinner"
    },
    location: {
      address: "123 Rue de la Paix",
      city: "Paris",
      zipCode: "75001",
      country: "France"
    },
    menu: {
      name: "Menu Dégustation Français",
      type: "forfait",
      price: 85,
      dietaryRestrictions: ["sans gluten"],
      allergies: ["fruits à coque"]
    },
    pricing: {
      basePrice: 85,
      serviceFee: 8.5,
      totalAmount: 93.5,
      depositAmount: 18.7,
      remainingBalance: 74.8
    },
    status: "pending"
  },
  {
    clientEmail: "client@chefathome.fr",
    chefEmail: "chef@chefathome.fr",
    serviceType: "private-events",
    eventDetails: {
      date: new Date(new Date().setDate(new Date().getDate() + 14)), // 14 days from now
      startTime: "12:00",
      duration: 4,
      guests: 10,
      eventType: "lunch"
    },
    location: {
      address: "456 Avenue des Champs",
      city: "Paris",
      zipCode: "75008",
      country: "France"
    },
    menu: {
      name: "Menu Dégustation Français",
      type: "forfait",
      price: 85,
      dietaryRestrictions: [],
      allergies: []
    },
    pricing: {
      basePrice: 850, // 85 * 10 guests
      serviceFee: 85,
      totalAmount: 935,
      depositAmount: 187,
      remainingBalance: 748
    },
    status: "pending"
  }
];

// Function to create seed users
export const createSeedUsers = async () => {
  try {
    console.log('🌱 Starting user seeding...');

    // Clear existing seed users
    await User.deleteMany({ 
      email: { 
        $in: seedUsers.map(user => user.email) 
      } 
    });

    // Ensure the collection does not contain duplicate chef profiles before seeding
    await removeDuplicateChefProfiles();

    // Clear existing seed bookings
    await Booking.deleteMany({ 
      'client': { $in: (await User.find({ email: { $in: seedBookingsData.map(b => b.clientEmail) } })).map(u => u._id) },
      'chef': { $in: (await Chef.find({ user: { $in: (await User.find({ email: { $in: seedBookingsData.map(b => b.chefEmail) } })).map(u => u._id) } })).map(c => c._id) }
    });

    // Create users with hashed passwords
    const createdUsers = [];
    
    for (const userData of seedUsers) {
      // The pre-save hook in the User model will hash the password
      const user = await User.create(userData);
      
      createdUsers.push(user);
      console.log(`✅ Created ${user.role} user: ${user.email}`);
    }
    
    // Create chef profile for chef user
    const chefUsers = createdUsers.filter(user => user.role === 'chef');
    for (const chefUser of chefUsers) {
      await Chef.deleteMany({ user: chefUser._id });

      const profileTemplate = chefProfilesByEmail[chefUser.email] || seedChefProfile;
      const chefProfile = await Chef.create({
        user: chefUser._id,
        ...profileTemplate
      });

      console.log(`✅ Created chef profile (${chefProfile.verification?.status || 'unknown'}) for: ${chefUser.email}`);
    }

    // Create seed bookings
    const clientUser = createdUsers.find(user => user.email === 'client@chefathome.fr');
    const chefProfile = await Chef.findOne({ user: createdUsers.find(user => user.email === 'chef@chefathome.fr')._id });

    if (clientUser && chefProfile) {
      for (const bookingData of seedBookingsData) {
        const booking = await Booking.create({
          client: clientUser._id,
          chef: chefProfile._id,
          ...bookingData
        });
        console.log(`✅ Created pending booking for client ${clientUser.email} with chef ${chefProfile.user.email}`);
      }
    }
    
    console.log('🎉 User seeding completed successfully!');
    console.log('\n📋 Test Accounts Created:');
    console.log('👤 Admin: admin@chefathome.fr / admin123');
    console.log('🛒 Client: client@chefathome.fr / client123'); 
    console.log('👨‍🍳 Chef: chef@chefathome.fr / chef123');
    console.log('🏢 B2B: b2b@chefathome.fr / b2b123');
    
    return createdUsers;
    
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
};

// Function to remove seed users (for cleanup)
export const removeSeedUsers = async () => {
  try {
    console.log('🧹 Cleaning up seed users...');
    
    const seedEmails = seedUsers.map(user => user.email);
    const users = await User.find({ email: { $in: seedEmails } });
    
    // Remove chef profiles first
    for (const user of users) {
      if (user.role === 'chef') {
        await Chef.deleteMany({ user: user._id });
      }
    }

    // Remove bookings associated with seed clients/chefs
    const clientUsers = await User.find({ email: { $in: seedBookingsData.map(b => b.clientEmail) } });
    const chefUsers = await User.find({ email: { $in: seedBookingsData.map(b => b.chefEmail) } });
    const chefProfiles = await Chef.find({ user: { $in: chefUsers.map(u => u._id) } });

    await Booking.deleteMany({
      $or: [
        { client: { $in: clientUsers.map(u => u._id) } },
        { chef: { $in: chefProfiles.map(c => c._id) } }
      ]
    });
    
    // Remove users
    await User.deleteMany({ email: { $in: seedEmails } });
    
    console.log('✅ Seed users cleaned up successfully!');
    
  } catch (error) {
    console.error('❌ Error cleaning up seed users:', error);
    throw error;
  }
};
