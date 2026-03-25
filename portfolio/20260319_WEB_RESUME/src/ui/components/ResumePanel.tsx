import { useEffect, useState } from 'react';
import { EventBus } from '../../game/systems/EventBus';
import type { ResumeZone } from '../../game/data/resume-data';
import { PROFILE } from '../../game/data/resume-data';

export function ResumePanel() {
  const [activeZone, setActiveZone] = useState<ResumeZone | null>(null);

  useEffect(() => {
    const onEnter = (zone: unknown) => setActiveZone(zone as ResumeZone);
    const onExit = () => setActiveZone(null);

    EventBus.on('zone-entered', onEnter);
    EventBus.on('zone-exited', onExit);

    return () => {
      EventBus.off('zone-entered', onEnter);
      EventBus.off('zone-exited', onExit);
    };
  }, []);

  if (!activeZone) {
    return (
      <div style={styles.container}>
        <div style={styles.intro}>
          <h2 style={styles.name}>{PROFILE.name}</h2>
          <p style={styles.title}>{PROFILE.title}</p>
          <p style={styles.summary}>{PROFILE.summary}</p>
          <p style={styles.hint}>
            ← → Walk through the city to explore my resume →
          </p>
        </div>
      </div>
    );
  }

  const { content } = activeZone;

  return (
    <div style={styles.container}>
      <div style={styles.panel}>
        <h2 style={styles.heading}>
          {activeZone.icon} {content.heading}
        </h2>
        {content.subtitle && <p style={styles.subtitle}>{content.subtitle}</p>}
        <div style={styles.items}>
          {content.items.map((item, i) => (
            <div key={i} style={styles.item}>
              <div style={styles.itemHeader}>
                <h3 style={styles.itemTitle}>{item.title}</h3>
                {item.period && <span style={styles.period}>{item.period}</span>}
              </div>
              {item.subtitle && <p style={styles.itemSubtitle}>{item.subtitle}</p>}
              {item.description && <p style={styles.itemDesc}>{item.description}</p>}
              {item.tags && (
                <div style={styles.tags}>
                  {item.tags.map((tag, j) => (
                    <span key={j} style={styles.tag}>{tag}</span>
                  ))}
                </div>
              )}
              {item.bullets && (
                <ul style={styles.bullets}>
                  {item.bullets.map((b, j) => (
                    <li key={j} style={styles.bullet}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '16px',
    minHeight: '200px',
  },
  intro: {
    textAlign: 'center',
    color: '#c0c0d0',
    padding: '24px',
  },
  name: {
    fontSize: '1.5rem',
    color: '#f0f0f0',
    margin: '0 0 4px 0',
    fontFamily: 'monospace',
  },
  title: {
    fontSize: '0.85rem',
    color: '#3898d8',
    margin: '0 0 12px 0',
  },
  summary: {
    fontSize: '0.8rem',
    color: '#a0a0b0',
    lineHeight: '1.5',
    maxWidth: '600px',
    margin: '0 auto 16px auto',
  },
  hint: {
    fontSize: '0.75rem',
    color: '#606080',
    fontStyle: 'italic',
  },
  panel: {
    color: '#e0e0e0',
    animation: 'fadeIn 0.3s ease-in',
  },
  heading: {
    fontSize: '1.2rem',
    color: '#3898d8',
    margin: '0 0 4px 0',
    fontFamily: 'monospace',
  },
  subtitle: {
    fontSize: '0.8rem',
    color: '#a0a0b0',
    margin: '0 0 12px 0',
  },
  items: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  item: {
    background: '#1e1e3a',
    borderRadius: '6px',
    padding: '12px',
    borderLeft: '3px solid #3898d8',
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  itemTitle: {
    fontSize: '0.9rem',
    color: '#f0f0f0',
    margin: 0,
  },
  period: {
    fontSize: '0.7rem',
    color: '#808090',
    flexShrink: 0,
  },
  itemSubtitle: {
    fontSize: '0.75rem',
    color: '#808090',
    margin: '0 0 4px 0',
  },
  itemDesc: {
    fontSize: '0.8rem',
    color: '#b0b0c0',
    margin: '4px 0 0 0',
    lineHeight: '1.4',
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
    marginTop: '6px',
  },
  tag: {
    fontSize: '0.65rem',
    background: '#3898d830',
    color: '#3898d8',
    padding: '2px 6px',
    borderRadius: '3px',
  },
  bullets: {
    margin: '6px 0 0 16px',
    padding: 0,
    listStyleType: 'none',
  },
  bullet: {
    fontSize: '0.8rem',
    color: '#b0b0c0',
    marginBottom: '2px',
  },
};
