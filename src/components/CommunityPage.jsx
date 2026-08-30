import Flag from './Flag.jsx';

/** Community tab — training venue placeholder (address to be added later in data.json.venue).
 *  Once venue.address + venue.mapsQuery are set (non-empty address), add a Google Maps
 *  directions button: https://www.google.com/maps/dir/?api=1&destination=<venue.mapsQuery> */
export default function CommunityPage({ venue }) {

  return (
    <div className="tab-fade">
      <div className="class-page-head mb-6 flex items-center gap-4 flex-wrap">
        <Flag />
        <div>
          <h2 className="font-[var(--font-heading)] text-2xl md:text-3xl font-extrabold" style={{ color: 'var(--accent-2)' }}>
            Where we train
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {venue?.name || 'Rueda Club NZ'}
          </p>
        </div>
      </div>

      <div className="venue-card">
        <div className="text-4xl mb-3" aria-hidden="true">📍</div>
        <span className="venue-soon mb-3">{venue?.status || 'Training spot announced soon'}</span>
        <p className="mt-3 text-sm max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
          {venue?.note || 'Our next training location is being confirmed. Follow us for the announcement.'}
        </p>
      </div>

      <p className="text-xs text-center mt-6" style={{ color: 'var(--text-muted)' }}>
        Address and Google Maps directions will appear here as soon as the venue is confirmed.
      </p>
    </div>
  );
}