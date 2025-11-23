import { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';

export default function Footer() {
  const { colors } = useContext(ThemeContext);

  return (
    <footer style={{
      background: colors.surface,
      borderTop: `1px solid ${colors.borders}`,
      padding: '2.5rem 2rem 1.5rem 2rem',
      textAlign: 'center',
      color: colors.textSecondary,
      fontSize: '1rem',
    }}>
      <div style={{ marginBottom: '0.8rem' }}>
        <a
          href="/terms"
          style={{
            textDecoration: 'none',
            color: colors.textSecondary,
            fontWeight: 500,
            borderRadius: '6px',
            padding: '0.25rem 0.6rem',
            transition: 'background 0.18s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = colors.elevatedSurface)}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          Terms & Conditions
        </a>
        {' '}·{' '}
        <a
          href="/privacy"
          style={{
            textDecoration: 'none',
            color: colors.textSecondary,
            fontWeight: 500,
            borderRadius: '6px',
            padding: '0.25rem 0.6rem',
            transition: 'background 0.18s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = colors.elevatedSurface)}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          Privacy Policy
        </a>
      </div>
      <div style={{
        fontSize: '0.93rem',
        color: colors.textSecondary,
        opacity: 0.85,
      }}>
        Designed by Retriv Team &middot; {new Date().getFullYear()}
      </div>
    </footer>
  );
}
