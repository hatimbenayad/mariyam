/**
 * MilestoneCard.jsx
 * ────────────────────────────────────────────────────────────
 * Reusable card component for the card stack transition.
 * Renders the styling and layout (photo left or right), but 
 * animation and absolute positioning is handled by the parent stack.
 */
import './MilestoneCard.css';

export default function MilestoneCard({
  heading,
  description,
  year,
  photoSrc = null,
  photoAlt = 'Brand photo',
  imagePosition = 'right', // 'left' or 'right'
}) {
  const isLeft = imagePosition === 'left';

  return (
    <div
      className={`milestone-card ${isLeft ? 'milestone-card--img-left' : 'milestone-card--img-right'}`}
    >
      {/* Text half */}
      <div className="milestone-card__text">
        <h2 className="milestone-card__heading">{heading}</h2>
        <p className="milestone-card__desc">{description}</p>
        <span className="milestone-card__year" aria-hidden="true">{year}</span>
      </div>

      {/* Photo half */}
      <div className="milestone-card__photo">
        {photoSrc ? (
          <img src={photoSrc} alt={photoAlt} className="milestone-card__img" draggable="false" />
        ) : (
          <div className="milestone-card__photo-placeholder">
            <span className="milestone-card__photo-icon" aria-hidden="true">🍮</span>
            <span className="milestone-card__photo-label">Photo coming soon</span>
          </div>
        )}
      </div>
      
      {/* Screen reader only copy */}
      <div className="sr-only">
        <h2>{heading}</h2>
        <p>{description}</p>
        <p>Est. {year}</p>
      </div>
    </div>
  );
}
