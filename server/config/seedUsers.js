import User from '../models/User.js';
import Chef from '../models/Chef.js';
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
      courses: ["Amuse-bouche", "Entrée", "Plat principal", "Fromage", "Dessert"],
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
    
    // Create users with hashed passwords
    const createdUsers = [];
    
    for (const userData of seedUsers) {
      // The pre-save hook in the User model will hash the password
      const user = await User.create(userData);
      
      createdUsers.push(user);
      console.log(`✅ Created ${user.role} user: ${user.email}`);
    }
    
    // Create chef profile for chef user
    const chefUser = createdUsers.find(user => user.role === 'chef');
    if (chefUser) {
      // Remove existing chef profile if exists
      await Chef.deleteOne({ user: chefUser._id });
      
      // Create new chef profile
      const chefProfile = await Chef.create({
        user: chefUser._id,
        ...seedChefProfile
      });
      
      console.log(`✅ Created chef profile for: ${chefUser.email}`);
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
        await Chef.deleteOne({ user: user._id });
      }
    }
    
    // Remove users
    await User.deleteMany({ email: { $in: seedEmails } });
    
    console.log('✅ Seed users cleaned up successfully!');
    
  } catch (error) {
    console.error('❌ Error cleaning up seed users:', error);
    throw error;
  }
};