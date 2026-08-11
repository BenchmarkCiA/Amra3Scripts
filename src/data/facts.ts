export interface FactSubject {
  id: string;
  label: string;
  emoji: string;
  facts: string[];
}

// Medium-length facts (2-4 sentences) — long enough to teach something real,
// short enough for a daily 30-second moment. A parent sees whichever one the
// child got (stored on the completion note) so they can ask about it later.
export const factSubjects: FactSubject[] = [
  {
    id: 'space',
    label: 'Space',
    emoji: '🚀',
    facts: [
      'Black holes are regions of space where gravity is so strong that not even light can escape. Scientists can\'t see them directly, but they can detect black holes by watching how nearby stars and gas swirl around an invisible point.',
      'A day on Venus is longer than its year. Venus spins so slowly that it takes about 243 Earth days to rotate once, but only 225 Earth days to orbit the Sun.',
      'Saturn is not the only planet with rings — Jupiter, Uranus, and Neptune have them too, but Saturn\'s are the biggest and brightest, made of billions of chunks of ice and rock.',
      'If you could drive a car straight up into space at highway speed, you\'d reach the edge of space in about an hour. That\'s how close space actually is!',
    ],
  },
  {
    id: 'sports',
    label: 'Sports',
    emoji: '⚽',
    facts: [
      'The fastest recorded serve in tennis history flew at over 260 km/h (163 mph) — faster than cars are allowed to drive on most highways.',
      'A marathon is 42.195 kilometers long because of the 1908 London Olympics: the race started at Windsor Castle and finished in front of the royal box, and that exact distance just stuck.',
      'In basketball, the hoop has been exactly 10 feet (3.05 meters) high since the game was invented in 1891 — the inventor just happened to nail the peach baskets to a 10-foot railing.',
      'Table tennis balls can leave the paddle at speeds over 110 km/h during a fast rally, even though the ball itself weighs less than a ping-pong-sized cotton ball.',
    ],
  },
  {
    id: 'science',
    label: 'Science',
    emoji: '🔬',
    facts: [
      'Water is one of the only substances on Earth that gets less dense when it freezes, which is why ice floats instead of sinking — and why lakes freeze from the top down, letting fish survive underneath.',
      'Your body makes about 25 million new cells every second, replacing old or damaged ones. Most of the cells in your body today weren\'t there a few years ago.',
      'Lightning is about five times hotter than the surface of the Sun for a tiny fraction of a second, which is why it instantly heats the air around it and creates the sound we hear as thunder.',
      'Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are thousands of years old and still perfectly safe to eat.',
    ],
  },
  {
    id: 'animals',
    label: 'Animals',
    emoji: '🐾',
    facts: [
      'Octopuses have three hearts and blue blood. Two hearts pump blood to the gills, and the third pumps it to the rest of the body — and that third heart actually stops beating when the octopus swims.',
      'A group of flamingos is called a "flamboyance," and the pink color of their feathers actually comes from the shrimp and algae they eat, not from their own bodies.',
      'Elephants can recognize themselves in a mirror, remember other elephants for decades, and have even been seen appearing to mourn members of their herd who have died.',
      'A shrimp can snap its claw so fast that it creates a bubble hot enough to briefly glow, almost as hot as the surface of the Sun, all to stun its prey.',
    ],
  },
  {
    id: 'nature',
    label: 'Nature',
    emoji: '🌿',
    facts: [
      'The tallest trees on Earth, coast redwoods, can grow over 100 meters tall — taller than a 30-story building — and some living redwoods are more than 2,000 years old.',
      'Bananas are naturally slightly radioactive because they contain potassium, and a small amount of that potassium is a radioactive form. It\'s completely harmless — you\'d need to eat millions of bananas at once for it to matter.',
      'A single bolt of lightning during a storm can help fertilize plants: it turns nitrogen in the air into a form that rain washes into the soil, feeding trees and grass.',
      'Some mushrooms are actually part of enormous underground organisms. One honey fungus in Oregon covers nearly 10 square kilometers underground, making it one of the largest living things on Earth.',
    ],
  },
  {
    id: 'history',
    label: 'History',
    emoji: '🏛️',
    facts: [
      'The Great Pyramid of Giza was the tallest human-made structure in the world for almost 3,800 years, until England\'s Lincoln Cathedral was finished in 1311.',
      'Ancient Romans used urine to clean and whiten their clothes because the ammonia in it acted like a natural bleach and stain remover.',
      'The first working telephone call and the invention of email happened only about 100 years apart — technology that felt "ancient" to your grandparents is often newer than you\'d guess.',
      'Cleopatra lived closer in time to the invention of the iPhone than to the building of the Great Pyramid of Giza — that\'s how far back Egyptian history really goes.',
    ],
  },
];

export function randomFact(subjectId: string): { subjectLabel: string; fact: string } {
  const subject = factSubjects.find((s) => s.id === subjectId) ?? factSubjects[0];
  const fact = subject.facts[Math.floor(Math.random() * subject.facts.length)];
  return { subjectLabel: subject.label, fact };
}
