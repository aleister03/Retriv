import { useContext, useState } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import TermsModal from './TermsModal';

export default function Footer() {
  const { colors } = useContext(ThemeContext);
  const [termsOpened, setTermsOpened] = useState(false);

  return (
    <>
      <footer
        style={{
          padding: '2rem 1rem',
          background: colors.surface,
          borderTop: `1px solid ${colors.borders}`,
          marginTop: 'auto',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <p style={{ margin: 0, color: colors.textSecondary, fontSize: '0.9rem' }}>
            © {new Date().getFullYear()} Designed by Retriv Team. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <a
              onClick={() => setTermsOpened(true)}
              style={{
                color: colors.textSecondary,
                textDecoration: 'none',
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.target.style.color = colors.primaryAccent)}
              onMouseLeave={(e) => (e.target.style.color = colors.textSecondary)}
            >
              Terms & Conditions
            </a>
          </div>
        </div>
      </footer>
      
      <TermsModal opened={termsOpened} onClose={() => setTermsOpened(false)} />
    </>
  );
}