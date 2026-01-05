import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const GRADIENTS = [
  'from-rose-500 to-pink-500',
  'from-orange-500 to-amber-500',
  'from-emerald-500 to-teal-500',
  'from-cyan-500 to-blue-500',
  'from-violet-500 to-purple-500',
  'from-fuchsia-500 to-pink-500',
  'from-red-500 to-orange-500',
  'from-green-500 to-emerald-500',
  'from-blue-500 to-indigo-500',
  'from-purple-500 to-violet-500',
];

function getGradientIndex(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % GRADIENTS.length;
}

interface AvatarProps {
  src?: string | null;
  firstName: string;
  lastName: string;
  seed?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-28 h-28 text-3xl',
};

export function Avatar({
  src,
  firstName,
  lastName,
  seed,
  size = 'md',
  className,
}: AvatarProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
  const gradientSeed = seed || `${firstName}${lastName}`;
  const gradient = GRADIENTS[getGradientIndex(gradientSeed)];

  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [src]);

  const showFallback = !src || imageError || !imageLoaded;

  return (
    <div className={cn('relative rounded-full overflow-hidden', sizeClasses[size], className)}>
      {showFallback && (
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-br flex items-center justify-center font-medium text-white',
            gradient
          )}
        >
          {initials}
        </div>
      )}

      {src && !imageError && (
        <img
          src={src}
          alt={`${firstName} ${lastName}`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          className={cn(
            'absolute inset-0 w-full h-full object-cover transition-opacity duration-300',
            imageLoaded ? 'opacity-100' : 'opacity-0'
          )}
        />
      )}
    </div>
  );
}

