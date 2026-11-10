import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';
import {
  ArrowIcon,
  CalendarIcon,
  CompassIcon,
  HeartIcon,
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
  { weeks: 'Weeks 14–16', title: 'Release', detail: 'Security review, device testing, and sharing the Android app as a direct APK download.' },
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

const travelSteps = [
  {
    number: '01',
    title: 'Find inspiration',
    body: 'Browse places across the Philippines and see what makes each destination special.',
  },
  {
    number: '02',
    title: 'Choose your stops',
    body: 'Check location details and reviews, then save places you want to remember.',
  },
  {
    number: '03',
    title: 'Plan your trip',
    body: 'Arrange your stops into an itinerary and keep an eye on your travel budget.',
  },
  {
    number: '04',
    title: 'Head out exploring',
    body: 'Use maps, routes and nearby-place guidance to help you find your way.',
  },
];

const currentYear = new Date().getFullYear();
const androidApkUrl = import.meta.env.VITE_ANDROID_APK_URL?.trim();
const hasAndroidApkUrl = Boolean(androidApkUrl && /^https:\/\//i.test(androidApkUrl));

export function Landing() {
  return (
    <div className="landing">
      <header className="landing__nav">
        <Link to="/" className="landing__brand" aria-label="Travelie home">
          <Logo light showAdminTag={false} />
        </Link>
        <nav className="landing__links" aria-label="Product">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="mailto:gabionzalawrencejay@gmail.com">Contact</a>
          <a href="#demo">Demo Video</a>
          <a href="#about-app">About the App</a>
          <a href="#developers">Developers</a>
        </nav>
        <a href="#install" className="btn btn--ghost-light btn--sm landing__install-link">
          Install Mobile App <ArrowIcon size={15} />
        </a>
      </header>

      <section id="home" className="hero">
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
              <a href="#about-app" className="btn btn--coral">
                Explore the app <ArrowIcon size={16} />
              </a>
              <a href="#demo" className="btn btn--outline-light">
                See the demo
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

      <section id="about" className="features">
        <div className="section-heading">
          <span className="eyebrow">Why Travelie</span>
          <h2>One app from inspiration to arrival.</h2>
          <p>
            Travelie is a travel companion for exploring the Philippines. Discover
            destinations, find places nearby, and read traveler reviews before you go.
            Save your favorites, plan trip stops and expenses, then use maps and
            navigation to help guide your journey.
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
        <div className="travel-steps">
          <div className="travel-steps__heading">
            <span className="eyebrow">How it works</span>
            <h3>From “where should we go?” to “we made it.”</h3>
            <p>
              Travelie helps bring the pieces of a trip together, so you can spend
              less time switching between tools and more time enjoying the journey.
            </p>
          </div>
          <ol className="travel-steps__list">
            {travelSteps.map((step) => (
              <li key={step.number} className="travel-steps__item">
                <span className="travel-steps__number">{step.number}</span>
                <h4>{step.title}</h4>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
        <div id="developers" className="builder-section">
          <div className="builder-section__heading">
            <span className="eyebrow">Meet the builder</span>
            <h3>Why I’m building Travelie.</h3>
            <p>
              I’m building Travelie to make exploring the Philippines feel easier
              and more connected—from the first spark of inspiration to finding
              your way at the destination.
            </p>
          </div>
          <article className="builder-card">
            <span className="builder-card__avatar" aria-hidden="true">LJ</span>
            <div className="builder-card__details">
              <h4>Lawrence Jay Gabionza</h4>
              <p>Creator &amp; Developer</p>
            </div>
            <CompassIcon size={22} />
          </article>
          <div className="builder-story">
            <article className="builder-story__item">
              <span className="builder-story__number">01</span>
              <h4>Why a mobile app?</h4>
              <p>
                Travel happens on the move. The app brings destination discovery,
                nearby places, saved favorites, trip plans, budgets, and
                navigation along for the journey.
              </p>
            </article>
            <article className="builder-story__item">
              <span className="builder-story__number">02</span>
              <h4>Why a website?</h4>
              <p>
                A trip often starts with a question. The website helps travelers
                understand what Travelie offers, explore its features, and find
                the app when they are ready.
              </p>
            </article>
            <article className="builder-story__item builder-story__item--vision">
              <span className="builder-story__number">03</span>
              <h4>One connected experience</h4>
              <p>
                Together, the website and app make it easier to go from “I want
                to explore” to planning a trip and setting out with confidence.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section id="about-app" className="app-overview">
        <div className="app-overview__copy">
          <span className="eyebrow">About the app</span>
          <h2>One thoughtful companion for the whole trip.</h2>
          <p>
            Travelie helps you explore destinations across the Philippines, get
            ready for the journey, and keep your plans close while you travel.
            Start by finding a place that interests you, then build a trip around
            the experiences you want to have.
          </p>
          <p>
            Save places for later, check what other travelers think, organize
            stops and expenses, and use maps and guidance when it is time to head
            out. Your profile keeps your travel activity together in one place.
          </p>
        </div>
        <div className="app-overview__highlights">
          <article>
            <CompassIcon size={20} />
            <div>
              <h3>Explore destinations</h3>
              <p>
                Browse Philippine destinations, photos, details, entrance fees,
                and opening information to find a place that fits your trip.
              </p>
            </div>
          </article>
          <article>
            <PinIcon size={20} />
            <div>
              <h3>Find places nearby</h3>
              <p>
                Use your location to discover destinations around you while you
                are exploring.
              </p>
            </div>
          </article>
          <article>
            <HeartIcon size={20} />
            <div>
              <h3>Save favorites and share reviews</h3>
              <p>
                Keep interesting places in your saved list and read or leave
                reviews to help travelers choose.
              </p>
            </div>
          </article>
          <article>
            <MapIcon size={20} />
            <div>
              <h3>Navigate with confidence</h3>
              <p>
                View destinations on a map, calculate a route, and follow
                navigation steps as you make your way there.
              </p>
            </div>
          </article>
          <article>
            <CalendarIcon size={20} />
            <div>
              <h3>Plan trips and expenses</h3>
              <p>
                Arrange trip stops into an itinerary and track your travel
                expenses and budget.
              </p>
            </div>
          </article>
          <article>
            <CompassIcon size={20} />
            <div>
              <h3>Try camera-and-compass guidance</h3>
              <p>
                Open the AR guidance preview for a camera and compass view to
                help orient you near a destination.
              </p>
            </div>
          </article>
        </div>
      </section>

      <section id="demo" className="demo">
        <div className="demo__content">
          <span className="eyebrow eyebrow--light">A first look at Travelie</span>
          <h2>See where your next journey could take you.</h2>
          <p>
            We’re preparing a video walkthrough of the app. In the meantime, explore
            what Travelie brings to every trip.
          </p>
          <a href="#about-app" className="btn btn--outline-light">
            About the app <ArrowIcon size={16} />
          </a>
        </div>
        <div className="demo__placeholder" role="status">
          <span className="demo__placeholder-mark">
            <CompassIcon size={26} />
          </span>
          <strong>Travelie app walkthrough</strong>
          <span>Demo video coming soon</span>
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
          <h2>From foundation to a ready-to-install app.</h2>
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

      <section id="install" className="app-install">
        <div className="app-install__inner">
          <span className="eyebrow">Take Travelie with you</span>
          <h2>Your next journey starts here.</h2>
          {hasAndroidApkUrl ? (
            <>
              <p>Download Travelie for Android and take your trip plans with you.</p>
              <a
                href={androidApkUrl}
                className="btn btn--coral"
                target="_blank"
                rel="noreferrer"
              >
                Download Android app <ArrowIcon size={16} />
              </a>
            </>
          ) : (
            <>
              <p>
                Travelie for Android is ready to share. The APK download link will
                appear here once it is configured.
              </p>
              <span className="app-install__status">Android download link coming soon</span>
            </>
          )}
        </div>
      </section>

      <footer className="landing__footer">
        <div className="landing__footer-inner">
          <Logo light showAdminTag={false} />
          <span>Discover. Navigate. Experience.</span>
          <div className="landing__footer-links">
            <a href="#home">Home</a>
            <a href="mailto:gabionzalawrencejay@gmail.com">Contact</a>
            <span>© {currentYear} Travelie</span>
          </div>
        </div>
      </footer>
    </div>
  );
}