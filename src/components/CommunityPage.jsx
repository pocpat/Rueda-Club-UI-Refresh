import Flag from './Flag.jsx';

const MAPS_DIR = 'https://www.google.com/maps/dir/?api=1&destination=';
const MAPS_LINK = 'https://www.google.com/maps/search/?api=1&query=';

/** Community tab — training venue: banner image, address, weekly schedule,
 *  and a Google Maps directions link. Venue data comes from data.json.venue. */
export default function CommunityPage({ venue }) {
  const hasVenue = Boolean(venue?.address);
  const directionsUrl = venue?.mapsQuery ? `${MAPS_DIR}${encodeURIComponent(venue.mapsQuery)}` : null;
  const mapUrl = venue?.mapsQuery ? `${MAPS_LINK}${encodeURIComponent(venue.mapsQuery)}` : null;

  return (
    <div className="tab-fade">
      <div className="class-page-head mb-6 flex items-center gap-4 flex-wrap">
        <Flag />
        <div>
          <h2 className="font-[var(--font-heading)] text-2xl md:text-3xl font-extrabold" style={{ color: 'var(--text)' }}>
            Where we train
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Rueda Club NZ — community trainings, free to join
          </p>
        </div>
      </div>

      {hasVenue ? (
        <div className="venue-card venue-card-real">
          {/* Banner photo — so people can recognize the spot on the ground */}
          <div className="venue-banner">
            <img
              src={venue.banner || '/images/venue-ponsonby.jpg'}
              alt={`The covered stage area at ${venue.address}`}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <span className="venue-banner-badge">Training spot</span>
          </div>

          <div className="venue-info">
            <div className="venue-row">
              <span className="venue-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </span>
              <div>
                <p className="venue-address" style={{ color: 'var(--text)' }}>{venue.address}</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{venue.description}</p>
              </div>
            </div>

            {venue.schedule?.length > 0 && (
              <div className="venue-schedule">
                <span className="venue-schedule-label">Training times</span>
                {venue.schedule.map((s) => (
                  <div key={s.day} className="venue-schedule-row">
                    <span className="venue-schedule-day">{s.day}</span>
                    <span className="venue-schedule-time">{s.time}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="venue-actions">
              {directionsUrl && (
                <a
                  className="btn tile-btn-red btn-pill venue-btn"
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ minHeight: '44px' }}
                >
                  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" />
                  </svg>
                  Get directions
                </a>
              )}
              {mapUrl && (
                <a
                  className="btn btn-ghost btn-pill venue-btn"
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ minHeight: '44px' }}
                >
                  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                    <line x1="9" y1="3" x2="9" y2="18" />
                    <line x1="15" y1="6" x2="15" y2="21" />
                  </svg>
                  View on Google Maps
                </a>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="venue-card">
          <div className="text-4xl mb-3" aria-hidden="true">📍</div>
          <span className="venue-soon mb-3">{venue?.status || 'Training spot announced soon'}</span>
          <p className="mt-3 text-sm max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
            {venue?.note || 'Our next training location is being confirmed. Follow us for the announcement.'}
          </p>
        </div>
      )}
    </div>
  );
}