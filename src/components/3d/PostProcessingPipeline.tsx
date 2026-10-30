import React from 'react';
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Vignette,
} from '@react-three/postprocessing';
import * as THREE from 'three';
import { useGameStore } from '../../stores/useGameStore';

export const PostProcessingPipeline: React.FC = () => {
  const phase = useGameStore((s) => s.phase);
  const settings = useGameStore((s) => s.settings);

  if (settings.quality === 'low') {
    return null; // Tắt hoàn toàn hậu kỳ ở chế độ tối ưu máy yếu
  }

  const isRewind = phase === 'FLASHBACK_REWIND';

  // Điều chỉnh mức độ lệch sắc quang học
  const aberrationOffset = isRewind
    ? new THREE.Vector2(0.002, 0.002)
    : new THREE.Vector2(0.0004, 0.0004);

  return (
    <EffectComposer enableNormalPass={false} multisampling={settings.quality === 'high' ? 4 : 0}>
      {settings.bloomEnabled && (
        <Bloom
          luminanceThreshold={0.88}
          luminanceSmoothing={0.25}
          intensity={0.45}
          mipmapBlur
        />
      )}
      {settings.chromaticAberrationEnabled && isRewind && (
        <ChromaticAberration
          offset={aberrationOffset}
          radialModulation={true}
          modulationOffset={0.5}
        />
      )}
      <Vignette eskil={false} offset={0.15} darkness={0.65} />
    </EffectComposer>
  );
};
