import Image from 'next/image';
import Link from 'next/link';
import Button from 'components/ui/Button';

interface AuthHeaderProps {
  /** Which way the visitor is being pointed: to signup, or back to login. */
  cta: 'signup' | 'signin';
}

const COPY = {
  signup: { prompt: "Don't have an account?", label: 'Sign Up', href: '/signup' },
  signin: { prompt: 'Already have account?', label: 'Sign In', href: '/login' }
} as const;

export default function AuthHeader({ cta }: AuthHeaderProps) {
  const { prompt, label, href } = COPY[cta];

  return (
    <header className="relative z-10 flex items-center justify-between gap-4 px-6 py-6 sm:px-10">
      <Link href="/" aria-label="Tredella home">
        <Image
          src="/assets/images/logo.webp"
          alt="Tredella"
          width={140}
          height={45}
          priority
          className="h-9 w-auto sm:h-10"
        />
      </Link>

      <div className="flex items-center gap-3">
        {/* the prompt is a nicety — drop it before it can wrap on small screens */}
        <span className="hidden text-14 text-secondary sm:inline">{prompt}</span>
        <Button href={href} variant="primary" className="whitespace-nowrap">
          {label}
        </Button>
      </div>
    </header>
  );
}
