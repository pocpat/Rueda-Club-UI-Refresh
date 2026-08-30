/**
 * Shared Back button — identical to the one on the Move detail page
 * (btn btn-ghost btn-pill: pill with left arrow + "Back"), shown at the
 * top left of every page except Home.
 * Same place on every page: first element inside <main>, above page content,
 * aligned with content padding.
 */
export default function BackButton({ onClick }) {
  return (
    <nav aria-label="Breadcrumb navigation" className="mb-6">
      <button
        onClick={onClick}
        aria-label="Go back"
        className="btn btn-ghost btn-pill"
        style={{ minHeight: '44px' }}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back
      </button>
    </nav>
  );
}