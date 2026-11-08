import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';
import {
  ArrowIcon,
  CalendarIcon,
  CompassIcon,
  MapIcon,
  PinIcon,
  SparkIcon,
} from '../components/Icons';

const phases = [
  { weeks: 'Weeks 1–2', title: 'Foundation & accounts', detail: 'Mobile, web and NestJS apps, PostGIS, design system, JWT auth with refresh rotation.' },
  { weeks: 'Weeks 3–7', title: 'Discovery & engagement', detail: 'Destinations, photography, search, favorites and reviews backed by a content API.' },
  { weeks: 'Weeks 8–9', title: 'Navigation & planning', detail: 'Google Maps routing, GPS guidance, itineraries and a trip budget manager.' },
  { weeks: 'Weeks 10–11', title: 'Augmented reality', detail: 'Native ARCore module, compass overlay and geospatial anchors with map fallback.' },
  { weeks: 'Weeks 12–13', title: 'Administration', detail: 'Role-based admin dashboard, destination CMS and review moderation.' },
  { weeks: 'Weeks 14–16', title: 'Release', detail: 'Security review, device testing, Play Console preparation and submission.' },
];

const features = [
  {
    icon: <CompassIcon size={22} />,
    title: 'Curated discovery',
    body: 'Editor-picked islands, mountains and heritage towns with photography, fees and opening hours.',
  },
  {
    icon: <MapIcon size={22} />,
    title: 'Navigate with confidence',
    body: 'Turn-by-turn routes, walking and driving directions, plus an AR overlay for the final stretch.',
  },
  {
    icon: <CalendarIcon size={22} />,
    title: 'Plan the whole trip',
    body: 'Build day-by-day itineraries, reorder stops and track every peso in a shared budget.',
  },
];

export function Landing() {
  return (
    <div className="landing">
      <header className="landing__nav">
        <Link to="/" className="landing__brand" aria-label="Travelie home">
          <Logo light />
        </Link>
        <nav className="landing__links" aria-label="Product">
          <a href="#discover">Discover</a>
          <a href="#navigate">Navigate</a>
          <a href="#roadmap">Roadmap</a>
        </nav>
        <Link to="/login" className="btn btn--ghost-light btn--sm">
          Admin dashboard <ArrowIcon size={15} />
        </Link>
      </header>

      <section className="hero">
        <div className="hero__media" aria-hidden="true">
          <img src="/welcome.jpg" alt="" />
          <div className="hero__scrim" />
        </div>

        <div className="hero__inner">
          <div className="hero__copy">
            <span className="pill pill--gold">
              <SparkIcon size={13} /> Philippines · MVP + AR
            </span>
            <h1>
              Discover.
              <br />
              Navigate.
              <br />
              <em>Experience.</em>
            </h1>
            <p className="hero__lede">
              Travelie turns the best of the Philippines into a guided journey — curated places,
              real GPS routing and an AR companion that points the way.
            </p>
            <div className="hero__actions">
              <Link to="/login" className="btn btn--coral">
                Open the dashboard <ArrowIcon size={16} />
              </Link>
              <a href="#roadmap" className="btn btn--outline-light">
                See the 16-week roadmap
              </a>
            </div>
            <div className="hero__meta">
              <span>9 seeded destinations</span>
              <span className="dot" />
              <span>7 categories</span>
              <span className="dot" />
              <span>AR-ready architecture</span>
            </div>
          </div>

          <div className="phone" aria-hidden="true">
            <div className="phone__frame">
              <div className="phone__notch" />
              <div className="phone__screen">
                <img src="/welcome.jpg" alt="" className="phone__hero" />
                <div className="phone__scrim" />
                <div className="phone__brand">
                  <span className="phone__mark">T</span> Travelie
                </div>
                <div className="phone__content">
                  <span className="phone__eyebrow">Curated journeys</span>
                  <strong>White Beach, Boracay</strong>
                  <span className="phone__sub">Malay, Aklan · Free entry</span>
                  <div className="phone__chips">
                    <span>Beach</span>
                    <span>Island</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="float-card float-card--one">
              <span className="float-card__icon">
                <PinIcon size={16} />
              </span>
              <div>
                <strong>Cloud 9, Siargao</strong>
                <span>4.2 km · 12 min drive</span>
              </div>
            </div>
            <div className="float-card float-card--two">
              <span className="float-card__pulse" />
              <div>
                <strong>AR guide active</strong>
                <span>Compass locked · 98% accuracy</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="discover" className="features">
        <div className="section-heading">
          <span className="eyebrow">Why Travelie</span>
          <h2>One app from inspiration to arrival.</h2>
          <p>
            A premium travel companion built solo, milestone by milestone — no clutter, no
            dead ends, every feature shipped with a working fallback.
          </p>
        </div>
        <div className="feature-grid">
          {features.map((feature) => (
            <article key={feature.title} className="feature-card">
              <span className="feature-card__icon">{feature.icon}</span>
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="band">
        <div className="band__inner">
          <div>
            <strong>3</strong>
            <span>apps in one repo</span>
          </div>
          <div>
            <strong>16</strong>
            <span>planned weeks</span>
          </div>
          <div>
            <strong>36</strong>
            <span>master checklist items</span>
          </div>
          <div>
            <strong>1</strong>
            <span>PostGIS-powered API</span>
          </div>
        </div>
      </section>

      <section id="roadmap" className="roadmap">
        <div className="section-heading section-heading--left">
          <span className="eyebrow">Build sequence</span>
          <h2>From foundation to Google Play.</h2>
          <p>The starter in this repository covers Weeks 1–2 and the discovery foundation that follows.</p>
        </div>
        <ol className="timeline">
          {phases.map((phase, index) => (
            <li key={phase.weeks} className={`timeline__item ${index < 2 ? 'timeline__item--done' : ''}`}>
              <span className="timeline__marker">{index < 2 ? '✓' : String(index + 1)}</span>
              <div className="timeline__body">
                <span className="timeline__weeks">{phase.weeks}</span>
                <h3>{phase.title}</h3>
                <p>{phase.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section id="navigate" className="cta">
        <div className="cta__inner">
          <div>
            <span className="eyebrow eyebrow--light">Ready when you are</span>
            <h2>Step into the Travelie console.</h2>
            <p>Manage destinations, watch traveler activity and steer the next milestone.</p>
          </div>
          <Link to="/login" className="btn btn--coral">
            Sign in to admin <ArrowIcon size={16} />
          </Link>
        </div>
      </section>

      <footer className="landing__footer">
        <div className="landing__footer-inner">
          <Logo light />
          <span>Discover. Navigate. Experience.</span>
          <div className="landing__footer-links">
            <Link to="/login">Admin</Link>
            <a href="#roadmap">Roadmap</a>
            <span>© {new Date().getFullYear()} Travelie</span>
          </div>
        </div>
      </footer>
    </div>
  );
}