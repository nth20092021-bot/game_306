import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import * as THREE from 'three';
import { useGameStore } from '../../stores/useGameStore';
import { soundEngine } from '../../utils/soundEngine';

export const CinematicCameraRig: React.FC = () => {
  const { camera } = useThree();
  const phase = useGameStore((s) => s.phase);
  const settings = useGameStore((s) => s.settings);
  const setPhase = useGameStore((s) => s.setPhase);
  const setClockProperties = useGameStore((s) => s.setClockProperties);
  const revealStudent = useGameStore((s) => s.revealStudent);

  // Tham chiếu trạng thái góc máy
  const lookAtTarget = useRef(new THREE.Vector3(0, 0, 0));
  const currentTimeline = useRef<gsap.core.Timeline | null>(null);

  // Quản lý chuỗi điện ảnh bằng GSAP Timeline khi chuyển pha
  useEffect(() => {
    if (currentTimeline.current) {
      currentTimeline.current.kill();
    }

    const diveDuration = 2.4;

    if (phase === 'CAMERA_DIVE') {
      const tl = gsap.timeline();
      currentTimeline.current = tl;

      soundEngine.playIgnition(diveDuration);

      // 1. Lùi nhẹ lấy đà
      tl.to(camera.position, {
        z: 8.4,
        duration: 0.4,
        ease: 'power1.inOut',
      });

      // 2. Lao vào hướng tâm đồng hồ nhưng dừng ở cự ly an toàn (z = 2.8) để ánh sáng phủ trắng màn hình, chống chớp đen
      tl.to(
        camera.position,
        {
          x: 0,
          y: 0,
          z: 2.8,
          duration: diveDuration - 0.4,
          ease: 'power2.in',
          onUpdate: () => {
            const p = tl.progress();
            setClockProperties(2 + p * 16, 1.2 + p * 3.2);
          },
        },
        '+=0'
      );

      // Chuyển sang pha 3: FLASHBACK ngay khi ánh sáng đã phủ trắng toàn màn hình
      tl.call(() => {
        setPhase('FLASHBACK_REWIND');
      });
    } else if (phase === 'FLASHBACK_REWIND') {
      const tl = gsap.timeline();
      currentTimeline.current = tl;

      // Camera căn chỉnh vị trí ngắm trọn vẹn từng bức ảnh ký ức 16:9 ở trung tâm
      tl.to(camera.position, {
        x: 0,
        y: 0,
        z: 3.4,
        duration: 0.8,
        ease: 'power2.out',
      });

      tl.to(
        lookAtTarget.current,
        {
          x: 0,
          y: 0,
          z: 0,
          duration: 0.8,
          ease: 'power2.out',
        },
        '<0'
      );
    } else if (phase === 'CLIMAX_BURST') {
      const tl = gsap.timeline();
      currentTimeline.current = tl;

      // Khựng lại đột ngột (Time Freeze)
      setClockProperties(0, 2.5);
      soundEngine.playSingularityBurst();

      // Camera lùi giật nhẹ tạo lực đẩy của sóng xung kích
      tl.to(camera.position, {
        x: 0,
        y: 0,
        z: 2.8,
        duration: 0.2,
        ease: 'expo.out',
      });

      tl.to(camera.position, {
        z: 3.5,
        duration: 1.0,
        ease: 'power2.out',
      });

      // Chuyển sang pha 5: REVEAL
      tl.call(() => {
        revealStudent();
      });
    } else if (phase === 'STUDENT_REVEAL') {
      const tl = gsap.timeline();
      currentTimeline.current = tl;

      // Trượt mượt mà đến góc chụp cận cảnh học sinh Chibi toàn thân cân đối
      tl.to(camera.position, {
        x: 0,
        y: 0.25,
        z: 4.6,
        duration: 1.6,
        ease: 'power3.out',
      });

      tl.to(
        lookAtTarget.current,
        {
          x: 0,
          y: 0.08,
          z: 0,
          duration: 1.6,
          ease: 'power3.out',
        },
        '<0'
      );
    } else if (phase === 'IDLE') {
      const tl = gsap.timeline();
      currentTimeline.current = tl;

      // Trở về vị trí ngắm đồng hồ ban đầu
      tl.to(camera.position, {
        x: 0,
        y: 0,
        z: 7.8,
        duration: 1.4,
        ease: 'power2.inOut',
      });

      tl.to(
        lookAtTarget.current,
        {
          x: 0,
          y: 0,
          z: 0,
          duration: 1.4,
          ease: 'power2.inOut',
        },
        '<0'
      );
    }

    return () => {
      if (currentTimeline.current) {
        currentTimeline.current.kill();
      }
    };
  }, [phase, settings.flashbackDuration]);

  // Breathing camera
  useFrame((state) => {
    if (phase === 'IDLE') {
      const t = state.clock.elapsedTime;
      camera.position.x = Math.sin(t * 0.4) * 0.3;
      camera.position.y = Math.cos(t * 0.5) * 0.2;
    } else if (phase === 'STUDENT_REVEAL') {
      const t = state.clock.elapsedTime;
      camera.position.x = Math.sin(t * 0.8) * 0.08;
    }

    camera.lookAt(lookAtTarget.current);
  });

  return null;
};
