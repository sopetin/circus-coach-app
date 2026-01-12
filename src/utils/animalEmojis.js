// Animal emojis for student profile icons
export const animalEmojis = [
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
  '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆',
  '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋',
  '🐌', '🐞', '🐜', '🦟', '🦗', '🕷️', '🦂', '🐢', '🐍', '🦎',
  '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟',
  '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧',
  '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🦃', '🦚', '🦜',
  '🦢', '🦩', '🕊️', '🐇', '🦝', '🦨', '🦡', '🦦', '🦥', '🐁',
  '🐀', '🐿️', '🦔', '🐾', '🐉', '🐲', '🌵', '🎄', '🎋', '🎍',
];

// Get a consistent animal emoji for a student based on their ID
export function getAnimalEmoji(studentId) {
  if (!studentId) return '👤';
  // Use student ID to get a consistent emoji
  const hash = studentId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return animalEmojis[hash % animalEmojis.length];
}
