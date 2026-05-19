import providersData from '../../data/providers.json';

// Helper to format service type back to display labels
const formatServiceLabel = (service_type) => {
  if (service_type === 'AC technician') return 'AC Repair';
  return service_type.charAt(0).toUpperCase() + service_type.slice(1);
};

// Map the providers.json schema to the app's KARIGAR schema dynamically
export const KARIGARS = providersData.map((provider, index) => {
  // Generate initials
  const initials = provider.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  
  // Predict an avatar color based on index
  const colors = ['#028090', '#02C39A', '#1E3A5F', '#FF6B6B', '#FFD166', '#06D6A0', '#118AB2', '#8338EC', '#F15BB5'];
  const avatarColor = colors[index % colors.length];

  return {
    id: provider.id,
    name: provider.name,
    initials: initials,
    service: formatServiceLabel(provider.service_type),
    rating: provider.rating,
    jobs: provider.review_count,
    experience: `${provider.experience_years} saal`,
    price: provider.price_per_hour,
    distance: 2.5, // Will be dynamically calculated later
    onTime: provider.on_time_score,
    cancelRate: provider.cancellation_rate,
    location: provider.location,
    lat: provider.lat,
    lng: provider.lng,
    available: provider.availability.length > 0,
    bio: `Professional ${formatServiceLabel(provider.service_type)} with ${provider.experience_years} years of experience in ${provider.area}.`,
    skills: [provider.specialization, 'Quality Work', 'Professional Tools'],
    reviews: [
      { name: 'Satisfied Customer', stars: Math.floor(provider.rating), text: 'Bohat acha kaam kiya, highly recommended!' }
    ],
    avatarColor: avatarColor,
  };
});

export const SERVICES = [
  { id: 's1', emoji: '❄️', label: 'AC Repair',    query: 'AC theek karna hai' },
  { id: 's2', emoji: '⚡', label: 'Electrician',  query: 'bijli ka kaam hai' },
  { id: 's3', emoji: '🔧', label: 'Plumber',      query: 'pani ki pipe theek karni hai' },
  { id: 's4', emoji: '🪚', label: 'Carpenter',    query: 'furniture theek karna hai' },
  { id: 's5', emoji: '🎨', label: 'Painter',      query: 'ghar mein paint karwana hai' },
  { id: 's6', emoji: '📚', label: 'Tutor',        query: 'bachon ka tutor chahiye' },
];

export const CHAT_HISTORY = [
  {
    id: 'c1', date: 'Kal',
    preview: 'AC repair ke liye Ali Hassan book kiya',
    service: 'AC Repair', status: 'completed',
  },
  {
    id: 'c2', date: '3 din pehle',
    preview: 'Bijli ka kaam karwana tha F-11 mein',
    service: 'Electrician', status: 'completed',
  },
];

export const TIME_SLOTS = [
  { id: 't1', label: 'Subah 8–10',    available: true  },
  { id: 't2', label: 'Subah 10–12',   available: true  },
  { id: 't3', label: 'Dopahar 12–2',  available: false },
  { id: 't4', label: 'Dopahar 2–4',   available: true  },
  { id: 't5', label: 'Shaam 4–6',     available: true  },
  { id: 't6', label: 'Shaam 6–8',     available: true  },
];
