import type { SVGProps } from 'react'

function FilledIcon(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props} />
}

function StrokeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    />
  )
}

export function EarBrandMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" {...props}>
      <rect x="2" y="2" width="60" height="60" rx="20" fill="url(#earside-brand-fill)" />
      <rect x="2" y="2" width="60" height="60" rx="20" stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" />
      <path
        d="M43.5 14C33.4 9.2 20.5 15.8 20.5 28.8c0 8.2 4.7 14.3 11.4 16.6v6.1c0 1.4 1.1 2.5 2.5 2.5h1.4"
        stroke="white"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M11 32h8" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M45 32h8" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
      <rect x="21" y="28" width="2.4" height="8" rx="1.2" fill="white" opacity="0.92" />
      <rect x="25" y="24" width="2.4" height="16" rx="1.2" fill="white" opacity="0.92" />
      <rect x="29" y="20" width="2.4" height="24" rx="1.2" fill="white" opacity="0.92" />
      <rect x="33" y="24" width="2.4" height="16" rx="1.2" fill="white" opacity="0.92" />
      <rect x="37" y="29" width="2.4" height="7" rx="1.2" fill="white" opacity="0.92" />
      <rect x="41" y="26" width="2.4" height="13" rx="1.2" fill="white" opacity="0.92" />
      <defs>
        <linearGradient id="earside-brand-fill" x1="8" y1="6" x2="54" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F7DDB8" />
          <stop offset="0.52" stopColor="#F0C3AE" />
          <stop offset="1" stopColor="#D9948B" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function SleepIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <FilledIcon {...props}>
      <path
        d="M14.8 3.8a7.8 7.8 0 1 0 4.7 13.8 6.3 6.3 0 0 1-7.4-9.5c.7-1.6 1.7-3 2.7-4.3Z"
        fill="currentColor"
      />
      <circle cx="8.1" cy="6.8" r="1.1" fill="currentColor" opacity="0.55" />
      <circle cx="6.3" cy="10" r="0.8" fill="currentColor" opacity="0.4" />
    </FilledIcon>
  )
}

export function EarwormIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <FilledIcon {...props}>
      <rect x="4" y="10.2" width="1.8" height="3.6" rx="0.9" fill="currentColor" opacity="0.45" />
      <rect x="7" y="7.2" width="1.8" height="9.6" rx="0.9" fill="currentColor" opacity="0.7" />
      <rect x="10" y="4.8" width="2" height="14.4" rx="1" fill="currentColor" />
      <rect x="13.2" y="7.6" width="1.8" height="8.8" rx="0.9" fill="currentColor" opacity="0.75" />
      <rect x="16.2" y="9.4" width="1.8" height="5.2" rx="0.9" fill="currentColor" opacity="0.52" />
      <path
        d="M18.8 5.4a4.3 4.3 0 0 1 0 13.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </FilledIcon>
  )
}

export function WakeUpIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <FilledIcon {...props}>
      <circle cx="12" cy="13" r="6" fill="currentColor" opacity="0.18" />
      <circle cx="12" cy="13" r="4.7" fill="currentColor" />
      <path d="M12 10.5v2.9l2.2 1.2" stroke="white" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M7.2 5.6 4.8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16.8 5.6 19.2 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </FilledIcon>
  )
}

export function StoryIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <FilledIcon {...props}>
      <path d="M5.2 5.5h10.7a2.3 2.3 0 0 1 2.3 2.3v10.7H7.6a2.4 2.4 0 0 0-2.4 2.4V7.5a2 2 0 0 1 2-2Z" fill="currentColor" />
      <path d="M8.4 8.8h6.5" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M8.4 12h6.5" stroke="white" strokeWidth="1.7" strokeLinecap="round" opacity="0.85" />
      <path d="M8.4 15.2H13" stroke="white" strokeWidth="1.7" strokeLinecap="round" opacity="0.7" />
    </FilledIcon>
  )
}

export function HomeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <FilledIcon {...props}>
      <path d="M4.4 10.4 12 4l7.6 6.4v8.1a1.5 1.5 0 0 1-1.5 1.5H14v-5.1h-4V20H5.9a1.5 1.5 0 0 1-1.5-1.5v-8.1Z" fill="currentColor" />
    </FilledIcon>
  )
}

export function GridIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <FilledIcon {...props}>
      <rect x="3.5" y="3.5" width="7.2" height="7.2" rx="2" fill="currentColor" />
      <rect x="13.3" y="3.5" width="7.2" height="7.2" rx="2" fill="currentColor" opacity="0.72" />
      <rect x="3.5" y="13.3" width="7.2" height="7.2" rx="2" fill="currentColor" opacity="0.72" />
      <rect x="13.3" y="13.3" width="7.2" height="7.2" rx="2" fill="currentColor" />
    </FilledIcon>
  )
}

export function SparkleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <FilledIcon {...props}>
      <path d="m12 3 2.1 5.5L19.6 10l-5.5 1.5L12 17l-2.1-5.5L4.4 10l5.5-1.5L12 3Z" fill="currentColor" />
      <circle cx="18.8" cy="16.1" r="1.4" fill="currentColor" opacity="0.6" />
      <circle cx="6.1" cy="16.9" r="1.1" fill="currentColor" opacity="0.42" />
    </FilledIcon>
  )
}

export function PhoneIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <FilledIcon {...props}>
      <rect x="7" y="3.8" width="10" height="16.4" rx="2.4" fill="currentColor" />
      <rect x="10" y="6.2" width="4" height="0.9" rx="0.45" fill="white" opacity="0.75" />
      <circle cx="12" cy="17.2" r="0.95" fill="white" opacity="0.85" />
    </FilledIcon>
  )
}

export function MailIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <FilledIcon {...props}>
      <rect x="3.8" y="5.6" width="16.4" height="12.8" rx="2.4" fill="currentColor" />
      <path d="m5.8 8 6.2 4.8L18.2 8" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </FilledIcon>
  )
}

export function AppleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M15.22 12.01c.02 2.14 1.88 2.86 1.9 2.87-.02.05-.3 1.03-.98 2.05-.59.88-1.2 1.76-2.16 1.78-.94.02-1.24-.56-2.32-.56-1.08 0-1.41.54-2.3.58-.92.03-1.63-.92-2.23-1.8-1.22-1.76-2.14-4.98-.9-7.13.62-1.07 1.72-1.75 2.92-1.77.91-.02 1.76.61 2.32.61.56 0 1.61-.75 2.71-.64.46.02 1.76.19 2.59 1.41-.07.04-1.55.91-1.55 2.6Zm-1.9-5.74c.49-.6.82-1.43.73-2.26-.7.03-1.55.47-2.05 1.07-.45.52-.84 1.36-.73 2.16.78.06 1.57-.4 2.05-.97Z" />
    </svg>
  )
}

export function WalletIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <FilledIcon {...props}>
      <path d="M4.5 7.5A2.5 2.5 0 0 1 7 5h9.5a2 2 0 0 1 0 4H7a1 1 0 0 0 0 2h12.5v6.2a2.3 2.3 0 0 1-2.3 2.3H7A2.5 2.5 0 0 1 4.5 17V7.5Z" fill="currentColor" />
      <circle cx="16.5" cy="13.8" r="1.2" fill="white" opacity="0.9" />
    </FilledIcon>
  )
}

export function CheckCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <FilledIcon {...props}>
      <circle cx="12" cy="12" r="9" fill="currentColor" />
      <path d="m8.4 12.2 2.2 2.3 5-5.2" stroke="white" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </FilledIcon>
  )
}

export function LockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <FilledIcon {...props}>
      <rect x="5.2" y="10.2" width="13.6" height="9" rx="2.2" fill="currentColor" />
      <path d="M8.5 10.2V8.3a3.5 3.5 0 1 1 7 0v1.9" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    </FilledIcon>
  )
}

export function InfoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <FilledIcon {...props}>
      <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.92" />
      <circle cx="12" cy="8" r="1.2" fill="white" />
      <path d="M12 11v5" stroke="white" strokeWidth="1.9" strokeLinecap="round" />
    </FilledIcon>
  )
}

export function UserIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <FilledIcon {...props}>
      <circle cx="12" cy="8.2" r="3.8" fill="currentColor" />
      <path d="M5.3 19.5a6.7 6.7 0 0 1 13.4 0" fill="currentColor" opacity="0.7" />
    </FilledIcon>
  )
}

export function ChevronRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <StrokeIcon {...props}>
      <path d="m9 6 6 6-6 6" />
    </StrokeIcon>
  )
}

export function ChevronLeftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <StrokeIcon {...props}>
      <path d="m15 6-6 6 6 6" />
    </StrokeIcon>
  )
}
