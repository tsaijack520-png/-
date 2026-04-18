import { Link } from 'react-router-dom'

import {
  ChevronRightIcon,
  EarwormIcon,
  SleepIcon,
  StoryIcon,
  WakeUpIcon,
} from './Icons'
import type { FeatureIconKey, SurfaceTone } from '../types/app'

interface ToneCardProps {
  tone: SurfaceTone
  className?: string
  children: React.ReactNode
}

export function ToneCard({ tone, className, children }: ToneCardProps) {
  const classes = ['tone-card', `tone-card--${tone}`]

  if (className) {
    classes.push(className)
  }

  return <div className={classes.join(' ')}>{children}</div>
}

interface FeatureTileProps {
  title: string
  subtitle: string
  tone: SurfaceTone
  iconKey: FeatureIconKey
  to?: string
}

const featureIcons = {
  sleep: SleepIcon,
  earworm: EarwormIcon,
  'wake-up': WakeUpIcon,
  story: StoryIcon,
} satisfies Record<FeatureIconKey, typeof SleepIcon>

export function FeatureTile({ title, subtitle, tone, iconKey, to }: FeatureTileProps) {
  const Icon = featureIcons[iconKey]

  const content = (
    <>
      <div className="feature-tile__glyph" aria-hidden="true">
        <Icon className="feature-tile__glyph-icon" />
      </div>
      <div>
        <div className="feature-tile__title">{title}</div>
        <div className="feature-tile__subtitle">{subtitle}</div>
      </div>
    </>
  )

  return to ? (
    <Link to={to} className="feature-tile-link">
      <ToneCard tone={tone} className="feature-tile">
        {content}
      </ToneCard>
    </Link>
  ) : (
    <ToneCard tone={tone} className="feature-tile">
      {content}
    </ToneCard>
  )
}

interface PosterCardProps {
  title: string
  meta: string
  badge?: string
  badgeTone?: 'default' | 'vip'
  tone: SurfaceTone
  to?: string
  coverImageUrl?: string
}

function buildCoverStyle(coverImageUrl?: string) {
  if (!coverImageUrl) {
    return undefined
  }
  return {
    backgroundImage: `url(${coverImageUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  } as const
}

export function PosterCard({
  title,
  meta,
  badge,
  badgeTone = 'default',
  tone,
  to,
  coverImageUrl,
}: PosterCardProps) {
  const content = (
    <>
      <div className="poster-card__cover" style={buildCoverStyle(coverImageUrl)} />
      <div className="poster-card__title">{title}</div>
      <div className="poster-card__meta">{meta}</div>
      {badge ? (
        <span className={`badge badge--${badgeTone}`}>{badge}</span>
      ) : null}
    </>
  )

  return to ? (
    <Link to={to} className="poster-card-link">
      <ToneCard tone={tone} className="poster-card">
        {content}
      </ToneCard>
    </Link>
  ) : (
    <ToneCard tone={tone} className="poster-card">
      {content}
    </ToneCard>
  )
}

interface SeriesCardProps {
  title: string
  meta: string
  tone: SurfaceTone
  to?: string
  coverImageUrl?: string
}

export function SeriesCard({ title, meta, tone, to, coverImageUrl }: SeriesCardProps) {
  const content = (
    <>
      <div className="series-card__cover" style={buildCoverStyle(coverImageUrl)} />
      <div className="series-card__body">
        <div className="series-card__title">{title}</div>
        <div className="series-card__meta">{meta}</div>
      </div>
      <ChevronRightIcon className="series-card__arrow" />
    </>
  )

  return to ? (
    <Link to={to} className="series-card-link">
      <ToneCard tone={tone} className="series-card">
        {content}
      </ToneCard>
    </Link>
  ) : (
    <ToneCard tone={tone} className="series-card">
      {content}
    </ToneCard>
  )
}

interface FilterChipProps {
  label: string
  active?: boolean
  onClick?: () => void
}

export function FilterChip({ label, active = false, onClick }: FilterChipProps) {
  return (
    <button
      type="button"
      className={active ? 'filter-chip filter-chip--active' : 'filter-chip'}
      onClick={onClick}
    >
      {label}
    </button>
  )
}

interface ListCardProps {
  title: string
  meta: string
  badge: string
  badgeTone?: 'default' | 'vip'
  tone: SurfaceTone
  to?: string
  coverImageUrl?: string
}

export function ListCard({
  title,
  meta,
  badge,
  badgeTone = 'default',
  tone,
  to,
  coverImageUrl,
}: ListCardProps) {
  const content = (
    <>
      <div className="list-card__cover" style={buildCoverStyle(coverImageUrl)} />
      <div className="list-card__body">
        <div className="list-card__title">{title}</div>
        <div className="list-card__meta">{meta}</div>
      </div>
      <div className="list-card__side">
        <span className={`badge badge--${badgeTone}`}>{badge}</span>
        <ChevronRightIcon className="list-card__arrow" />
      </div>
    </>
  )

  return to ? (
    <Link to={to} className="list-card-link">
      <ToneCard tone={tone} className="list-card">
        {content}
      </ToneCard>
    </Link>
  ) : (
    <ToneCard tone={tone} className="list-card">
      {content}
    </ToneCard>
  )
}

interface MenuCardProps {
  label: string
  value: string
  tone?: 'default' | 'gold' | 'accent'
  to?: string
}

export function MenuCard({ label, value, tone = 'default', to }: MenuCardProps) {
  const content = (
    <>
      <span className="menu-card__label">{label}</span>
      <span className={`menu-card__value menu-card__value--${tone}`}>
        {value}
        <ChevronRightIcon className="menu-card__arrow" />
      </span>
    </>
  )

  return to ? (
    <Link to={to} className="menu-card menu-card-link">
      {content}
    </Link>
  ) : (
    <button type="button" className="menu-card">
      {content}
    </button>
  )
}
