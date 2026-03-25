import { GameCanvas } from './components/GameCanvas';
import { ResumePanel } from './components/ResumePanel';

export function App() {
  return (
    <div style={{ minHeight: '100vh', padding: '20px 0', background: '#1a1a2e' }}>
      <h1
        style={{
          textAlign: 'center',
          color: '#e0e0e0',
          fontFamily: 'monospace',
          fontSize: '1.2rem',
          marginBottom: '16px',
          letterSpacing: '2px',
        }}
      >
        PIXEL RESUME
      </h1>
      <GameCanvas />
      <ResumePanel />
    </div>
  );
}
