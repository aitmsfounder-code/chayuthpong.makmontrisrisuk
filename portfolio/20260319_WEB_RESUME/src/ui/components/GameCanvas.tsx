import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { gameConfig } from '../../game/config';

export function GameCanvas() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && !gameRef.current) {
      gameRef.current = new Phaser.Game({
        ...gameConfig,
        parent: containerRef.current,
      });
      // Expose for debugging
      (window as unknown as Record<string, unknown>).__PHASER_GAME__ = gameRef.current;
    }

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto',
        aspectRatio: '800 / 480',
      }}
    />
  );
}
