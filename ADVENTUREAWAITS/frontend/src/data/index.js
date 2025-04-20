import { keralaData } from './keralaData';
import { jammuKashmirData } from './jammuKashmirData';
import { himachalPradeshData } from './himachalPradeshData';
import { gujaratData } from './gujaratData';
import { uttarPradeshData } from './uttarPradeshData';
import { odishaData } from './odishaData';

export const states = [
  {
    id: 'kerala',
    name: 'Kerala',
    data: keralaData,
    description: 'Discover Kerala, known as "God\'s Own Country", famous for its backwaters, tea plantations, and Ayurvedic traditions.'
  },
  {
    id: 'jammuKashmir',
    name: 'Jammu & Kashmir',
    data: jammuKashmirData,
    description: 'Explore the paradise on earth with breathtaking landscapes, from the Dal Lake to the snow-capped Himalayan peaks.'
  },
  {
    id: 'himachalPradesh',
    name: 'Himachal Pradesh',
    data: himachalPradeshData,
    description: 'Experience the beauty of the Himalayas, from charming hill stations to adventure destinations and spiritual retreats.'
  },
  {
    id: 'gujarat',
    name: 'Gujarat',
    data: gujaratData,
    description: 'Visit vibrant Gujarat, land of the Rann of Kutch, ancient temples, wildlife sanctuaries, and rich cultural heritage.'
  },
  {
    id: 'uttarPradesh',
    name: 'Uttar Pradesh',
    data: uttarPradeshData,
    description: 'Discover Uttar Pradesh, home to the iconic Taj Mahal, ancient spiritual centers, and rich historical monuments.'
  },
  {
    id: 'odisha',
    name: 'Odisha',
    data: odishaData,
    description: 'Explore Odisha, renowned for its ancient temples, vibrant classical dance traditions, pristine beaches, and rich tribal heritage.'
  }
];

export const getStateData = (stateId) => {
  const state = states.find(state => state.id === stateId);
  return state ? state.data : states[0].data;
};
