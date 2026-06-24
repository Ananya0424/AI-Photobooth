import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

function GalleryPage() {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchImages = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_BASE}/gallery?limit=200`);
      if (!res.ok) throw new Error('Failed to fetch gallery');
      const data = await res.json();
      setImages(data.images || []);
    } catch (err) {
      console.error('Gallery fetch error:', err);
      setError('Failed to load gallery images.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchImages(); }, [fetchImages]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/gallery/${deleteTarget._id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setImages(prev => prev.filter(img => img._id !== deleteTarget._id));
      setToast('Image deleted successfully');
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      setToast('Failed to delete image');
      setTimeout(() => setToast(''), 3000);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget]);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <>
      <style>{`
        .gal-container {
          min-height: 100vh;
          background: linear-gradient(180deg, #07040e 0%, #0f0a1a 30%, #1a0f2e 60%, #07040e 100%);
          color: white;
          font-family: 'Inter', sans-serif;
        }

        /* Header */
        .gal-header {
          position: sticky;
          top: 0;
          z-index: 30;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 18px 16px;
          background: rgba(7,4,14,0.7);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .gal-back-btn {
          position: absolute;
          left: 16px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 8px 14px;
          color: #cbd5e1;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          gap: 6px;
          min-height: 40px;
        }
        .gal-back-btn:hover { background: rgba(255,255,255,0.12); color: white; }

        .gal-title {
          font-family: 'Outfit', sans-serif;
          font-size: 20px;
          font-weight: 700;
          letter-spacing: 0.5px;
          background: linear-gradient(135deg, #a78bfa, #f472b6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Content */
        .gal-content {
          padding: 20px 12px 40px;
          max-width: 600px;
          margin: 0 auto;
        }

        .gal-count {
          text-align: center;
          color: #64748b;
          font-size: 13px;
          margin-bottom: 20px;
          font-weight: 500;
        }

        /* Grid */
        .gal-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        /* Card */
        .gal-card {
          position: relative;
          border-radius: 14px;
          overflow: hidden;
          background: linear-gradient(135deg, #0a0612 0%, #1a0f2e 100%);
          border: 1px solid rgba(255,255,255,0.08);
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .gal-card:hover {
          border-color: rgba(168,85,247,0.3);
          box-shadow: 0 8px 30px rgba(147,51,234,0.2);
          transform: translateY(-2px);
        }

        .gal-card-img {
          width: 100%;
          aspect-ratio: 3/4;
          object-fit: cover;
          display: block;
        }

        .gal-card-info {
          padding: 10px 10px 12px;
        }

        .gal-card-name {
          font-size: 12px;
          font-weight: 600;
          color: #e2e8f0;
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .gal-card-date {
          font-size: 10px;
          color: #64748b;
        }

        .gal-card-template {
          font-size: 10px;
          color: #8b5cf6;
          font-weight: 500;
          margin-top: 2px;
        }

        /* Delete button */
        .gal-delete-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.1);
          color: #ef4444;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: all 0.25s ease;
          z-index: 5;
        }
        .gal-card:hover .gal-delete-btn { opacity: 1; }
        .gal-delete-btn:hover { background: rgba(239,68,68,0.3); transform: scale(1.1); }

        /* Delete Modal */
        .gal-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(0,0,0,0.8);
          backdrop-filter: blur(8px);
          animation: galFadeIn 0.2s ease-out;
        }

        .gal-modal {
          background: linear-gradient(135deg, #1a1145 0%, #0f0a1a 100%);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          padding: 28px 24px;
          max-width: 340px;
          width: 100%;
          text-align: center;
          animation: galScaleIn 0.25s ease-out;
          box-shadow: 0 24px 60px rgba(0,0,0,0.5);
        }

        .gal-modal-icon {
          font-size: 40px;
          margin-bottom: 12px;
        }

        .gal-modal-title {
          font-family: 'Outfit', sans-serif;
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 8px;
          color: #f1f5f9;
        }

        .gal-modal-desc {
          font-size: 14px;
          color: #94a3b8;
          margin-bottom: 24px;
          line-height: 1.5;
        }

        .gal-modal-actions {
          display: flex;
          gap: 12px;
        }

        .gal-modal-btn {
          flex: 1;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          min-height: 48px;
          border: none;
          font-family: 'Inter', sans-serif;
        }

        .gal-modal-btn-cancel {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: #cbd5e1;
        }
        .gal-modal-btn-cancel:hover { background: rgba(255,255,255,0.12); }

        .gal-modal-btn-delete {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          box-shadow: 0 8px 20px rgba(239,68,68,0.3);
        }
        .gal-modal-btn-delete:hover { box-shadow: 0 12px 30px rgba(239,68,68,0.4); transform: translateY(-1px); }
        .gal-modal-btn-delete:disabled { opacity: 0.6; cursor: wait; }

        /* Toast */
        .gal-toast {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 60;
          background: rgba(16,185,129,0.15);
          border: 1px solid rgba(16,185,129,0.3);
          color: #34d399;
          padding: 10px 24px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          animation: galSlideUp 0.3s ease-out;
          backdrop-filter: blur(12px);
        }

        /* Lightbox */
        .gal-lightbox {
          position: fixed;
          inset: 0;
          z-index: 45;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: rgba(0,0,0,0.92);
          backdrop-filter: blur(12px);
          animation: galFadeIn 0.2s ease-out;
        }

        .gal-lightbox-img {
          max-width: 100%;
          max-height: 85vh;
          border-radius: 16px;
          object-fit: contain;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        }

        .gal-lightbox-close {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          color: white;
          font-size: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .gal-lightbox-info {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          text-align: center;
          color: #94a3b8;
          font-size: 13px;
        }

        /* Loading */
        .gal-loading {
          text-align: center;
          padding: 60px 20px;
          color: #64748b;
        }

        @keyframes galSpin {
          to { transform: rotate(360deg); }
        }

        .gal-spinner {
          width: 36px;
          height: 36px;
          border: 3px solid rgba(139,92,246,0.2);
          border-top-color: #8b5cf6;
          border-radius: 50%;
          animation: galSpin 0.8s linear infinite;
          margin: 0 auto 16px;
        }

        /* Empty state */
        .gal-empty {
          text-align: center;
          padding: 60px 20px;
        }

        .gal-empty-icon {
          font-size: 56px;
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .gal-empty-title {
          font-family: 'Outfit', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #94a3b8;
          margin-bottom: 8px;
        }

        .gal-empty-desc {
          color: #64748b;
          font-size: 14px;
        }

        /* Error */
        .gal-error {
          text-align: center;
          padding: 40px 20px;
          color: #f87171;
          font-size: 14px;
        }

        @keyframes galFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes galScaleIn { from { opacity: 0; transform: scale(0.93); } to { opacity: 1; transform: scale(1); } }
        @keyframes galSlideUp { from { opacity: 0; transform: translateX(-50%) translateY(20px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }

        /* Touch targets */
        @media (pointer: coarse) {
          .gal-delete-btn { opacity: 0.8; width: 36px; height: 36px; }
        }

        /* Wider screens */
        @media (min-width: 500px) {
          .gal-grid { grid-template-columns: repeat(3, 1fr); gap: 14px; }
          .gal-content { max-width: 700px; }
        }

        @media (min-width: 900px) {
          .gal-grid { grid-template-columns: repeat(4, 1fr); gap: 16px; }
          .gal-content { max-width: 960px; }
        }
      `}</style>

      <div className="gal-container">
        {/* Header */}
        <header className="gal-header">
          <button className="gal-back-btn" onClick={() => navigate('/')}>
            ← Back
          </button>
          <span className="gal-title">✨ Gallery</span>
        </header>

        {/* Content */}
        <div className="gal-content">
          {loading ? (
            <div className="gal-loading">
              <div className="gal-spinner" />
              <p>Loading gallery...</p>
            </div>
          ) : error ? (
            <div className="gal-error">
              <p>{error}</p>
              <button
                onClick={fetchImages}
                style={{
                  marginTop: '16px', padding: '10px 24px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#cbd5e1', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
                }}
              >
                Retry
              </button>
            </div>
          ) : images.length === 0 ? (
            <div className="gal-empty">
              <div className="gal-empty-icon">📸</div>
              <div className="gal-empty-title">No Photos Yet</div>
              <p className="gal-empty-desc">Generated photos will appear here automatically.</p>
            </div>
          ) : (
            <>
              <p className="gal-count">{images.length} photo{images.length !== 1 ? 's' : ''}</p>
              <div className="gal-grid">
                {images.map((img) => (
                  <div key={img._id} className="gal-card">
                    <button
                      className="gal-delete-btn"
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(img); }}
                      title="Delete"
                    >
                      🗑
                    </button>
                    <img
                      src={img.imageUrl}
                      alt={`Photo by ${img.userName}`}
                      className="gal-card-img"
                      loading="lazy"
                      onClick={() => setSelectedImage(img)}
                    />
                    <div className="gal-card-info">
                      <div className="gal-card-name">{img.userName || 'Anonymous'}</div>
                      <div className="gal-card-date">{formatDate(img.createdAt)}</div>
                      {img.templateName && (
                        <div className="gal-card-template">{img.templateName}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteTarget && (
          <div className="gal-modal-overlay" onClick={() => !deleting && setDeleteTarget(null)}>
            <div className="gal-modal" onClick={(e) => e.stopPropagation()}>
              <div className="gal-modal-icon">⚠️</div>
              <div className="gal-modal-title">Delete this image?</div>
              <p className="gal-modal-desc">
                Are you sure you want to delete this image? This action cannot be undone.
              </p>
              <div className="gal-modal-actions">
                <button
                  className="gal-modal-btn gal-modal-btn-cancel"
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  className="gal-modal-btn gal-modal-btn-delete"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lightbox */}
        {selectedImage && (
          <div className="gal-lightbox" onClick={() => setSelectedImage(null)}>
            <button className="gal-lightbox-close" onClick={() => setSelectedImage(null)}>✕</button>
            <img
              src={selectedImage.imageUrl}
              alt={`Photo by ${selectedImage.userName}`}
              className="gal-lightbox-img"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="gal-lightbox-info">
              <strong style={{ color: '#e2e8f0' }}>{selectedImage.userName}</strong>
              {selectedImage.templateName && <span> · {selectedImage.templateName}</span>}
              <br />
              <span style={{ fontSize: '12px' }}>{formatDate(selectedImage.createdAt)}</span>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && <div className="gal-toast">{toast}</div>}
      </div>
    </>
  );
}

export default GalleryPage;
