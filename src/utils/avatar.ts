export function getRandomAvatar(seed: string) {
  // Use DiceBear Avatars API for a unique avatar based on the seed
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(seed)}`;
} 