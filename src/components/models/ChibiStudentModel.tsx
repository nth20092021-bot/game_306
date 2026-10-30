// src/components/models/ChibiStudentModel.tsx
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

export type HairStyle =
  | 'female_long'
  | 'female_ponytail'
  | 'female_bob'
  | 'female_twintails'
  | 'male_short'
  | 'male_curtain';

export type AvatarModelType = 'adventurer' | 'lorelei' | 'vietnamese_chibi';

export interface StudentData {
  id: number;
  name: string;
  gender?: 'male' | 'female';
  hairColor?: string;
  hairStyle?: HairStyle;
  glasses?: boolean;
  avatarType?: AvatarModelType;
  customAvatarUrl?: string;
}

export interface ChibiStudentModelProps {
  student: StudentData;
  isCelebrating?: boolean;
  scale?: number;
  show3DNameplate?: boolean;
}

/**
 * Tự động nhận diện học sinh nữ qua họ tên tiếng Việt
 */
export function isFemaleStudentName(fullName = ''): boolean {
  const normalized = fullName.toLowerCase();
  const femaleKeywords = [
    'thị', 'hương', 'lan', 'mai', 'linh', 'trang', 'ngọc', 'thảo', 'hà',
    'vy', 'nhi', 'châu', 'quỳnh', 'phương', 'yến', 'tuyết', 'trúc', 'đào',
    'hoa', 'hồng', 'nhung', 'thư', 'ân', 'my', 'trâm', 'ngân', 'huyền', 'diệp'
  ];
  return femaleKeywords.some((kw) => normalized.includes(kw));
}

export const ChibiStudentModel: React.FC<ChibiStudentModelProps> = ({
  student,
  isCelebrating = true,
  scale = 1,
}) => {
  const characterRef = useRef<THREE.Group>(null);
  const headGroupRef = useRef<THREE.Group>(null);
  const rightShoulderPivotRef = useRef<THREE.Group>(null);
  const leftShoulderPivotRef = useRef<THREE.Group>(null);
  const podiumRingRef = useRef<THREE.Mesh>(null);
  const pulseHalo1Ref = useRef<THREE.Mesh>(null);
  const pulseHalo2Ref = useRef<THREE.Mesh>(null);
  const sparklesRef = useRef<THREE.InstancedMesh>(null);
  const godRayRef = useRef<THREE.Mesh>(null);
  const ponytailTailRef = useRef<THREE.Group>(null);
  const twintailLeftRef = useRef<THREE.Group>(null);
  const twintailRightRef = useRef<THREE.Group>(null);

  const isFemale = useMemo(() => {
    if (student.gender) return student.gender === 'female';
    return isFemaleStudentName(student.name);
  }, [student]);

  const activeHairStyle: HairStyle = useMemo(() => {
    if (student.hairStyle) return student.hairStyle;
    return isFemale ? 'female_ponytail' : 'male_short';
  }, [student.hairStyle, isFemale]);

  // Bộ vật liệu PBR dịu mịn, bắt sáng Spotlight ấm áp
  const materials = useMemo(() => {
    return {
      skin: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#ffdfd0'),
        roughness: 0.65,
        metalness: 0.02,
      }),
      blush: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#ff7b8b'),
        roughness: 0.8,
        transparent: true,
        opacity: 0.65,
      }),
      hair: new THREE.MeshStandardMaterial({
        color: new THREE.Color(student.hairColor || '#2c221a'),
        roughness: 0.65,
        metalness: 0.04,
      }),
      redRibbon: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#ef4444'),
        roughness: 0.45,
        metalness: 0.1,
      }),
      glassesMat: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#d4af37'),
        roughness: 0.25,
        metalness: 0.8,
      }),
      eyeDark: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#141622'),
        roughness: 0.15,
      }),
      eyeHighlight: new THREE.MeshBasicMaterial({
        color: new THREE.Color('#ffffff'),
      }),
      whiteShirt: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#f8fafc'),
        roughness: 0.75,
        metalness: 0.0,
      }),
      redScarf: new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xd63027),
        roughness: 0.55,
        metalness: 0.05,
      }),
      navyUniform: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#1e293b'),
        roughness: 0.7,
      }),
      backpack: new THREE.MeshStandardMaterial({
        color: new THREE.Color(isFemale ? '#f43f5e' : '#2563eb'),
        roughness: 0.6,
      }),
      goldBadgeRim: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#fbbf24'),
        metalness: 0.85,
        roughness: 0.2,
        emissive: new THREE.Color('#f59e0b'),
        emissiveIntensity: 0.45,
      }),
      redBadgeCenter: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#e11d48'),
        metalness: 0.2,
        roughness: 0.4,
      }),
      hologramCyan: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#38bdf8'),
        emissive: new THREE.Color('#0ea5e9'),
        emissiveIntensity: 0.85,
        roughness: 0.3,
      }),
      celebrationGoldRing: new THREE.MeshBasicMaterial({
        color: new THREE.Color('#fde047'),
        transparent: true,
        opacity: 0.5,
      }),
      godRayBeam: new THREE.MeshBasicMaterial({
        color: new THREE.Color('#fef08a'),
        transparent: true,
        opacity: 0.08,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
      sparkleMat: new THREE.MeshBasicMaterial({
        color: new THREE.Color('#fde68a'),
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      }),
    };
  }, [student, isFemale]);

  // 48 Hạt sao vàng ăn mừng
  const sparkleData = useMemo(() => {
    return Array.from({ length: 48 }, (_, i) => ({
      angle: (i / 48) * Math.PI * 2 + Math.random() * 0.3,
      radius: 0.65 + Math.random() * 0.85,
      yOffset: Math.random() * 2.5,
      speed: 0.55 + Math.random() * 0.65,
      scale: 0.022 + Math.random() * 0.032,
    }));
  }, []);

  const dummyObject = useMemo(() => new THREE.Object3D(), []);

  // Frame Loop với bảo vệ Delta Time không bao giờ vượt quá 0.05s
  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const t = state.clock.elapsedTime;

    if (characterRef.current) {
      if (isCelebrating) {
        // Nhún nhảy ăn mừng vui tươi
        const bounce = Math.sin(t * 7.5) * 0.045;
        const tilt = Math.sin(t * 3.8) * 0.038;
        characterRef.current.position.y = 0.08 + Math.max(0, bounce);
        characterRef.current.rotation.z = tilt;
      } else {
        characterRef.current.position.y = THREE.MathUtils.lerp(
          characterRef.current.position.y,
          0.08,
          delta * 4
        );
        characterRef.current.rotation.z = THREE.MathUtils.lerp(
          characterRef.current.rotation.z,
          0,
          delta * 4
        );
      }
    }

    if (headGroupRef.current) {
      headGroupRef.current.rotation.y = Math.sin(t * 2.2) * 0.09;
      headGroupRef.current.rotation.x = -0.04 + Math.sin(t * 4.0) * 0.04;
    }

    // Tay phải vẫy chào mừng
    if (rightShoulderPivotRef.current) {
      if (isCelebrating) {
        const wave = Math.sin(t * 8.5) * 0.35 + 0.15;
        rightShoulderPivotRef.current.rotation.z = 2.4 + wave;
        rightShoulderPivotRef.current.rotation.x = Math.sin(t * 4.5) * 0.18;
      } else {
        rightShoulderPivotRef.current.rotation.z = THREE.MathUtils.lerp(
          rightShoulderPivotRef.current.rotation.z,
          0.2,
          delta * 4
        );
      }
    }

    // Tay trái vung nhẹ theo nhịp
    if (leftShoulderPivotRef.current) {
      if (isCelebrating) {
        const lift = Math.cos(t * 7.5) * 0.18;
        leftShoulderPivotRef.current.rotation.z = -0.35 - lift;
      } else {
        leftShoulderPivotRef.current.rotation.z = THREE.MathUtils.lerp(
          leftShoulderPivotRef.current.rotation.z,
          -0.2,
          delta * 4
        );
      }
    }

    // Đuôi tóc đung đưa nhịp nhàng theo chuyển động nhún nhảy
    if (isCelebrating) {
      if (ponytailTailRef.current) {
        ponytailTailRef.current.rotation.x = -0.3 + Math.sin(t * 7.5) * 0.16;
        ponytailTailRef.current.rotation.z = Math.sin(t * 3.8) * 0.12;
      }
      if (twintailLeftRef.current) {
        twintailLeftRef.current.rotation.z = -0.15 + Math.sin(t * 7.5) * 0.15;
        twintailLeftRef.current.rotation.x = Math.sin(t * 4.0) * 0.1;
      }
      if (twintailRightRef.current) {
        twintailRightRef.current.rotation.z = 0.15 - Math.sin(t * 7.5) * 0.15;
        twintailRightRef.current.rotation.x = Math.sin(t * 4.0) * 0.1;
      }
    }

    if (podiumRingRef.current) {
      podiumRingRef.current.rotation.z += delta * 0.65;
    }

    if (pulseHalo1Ref.current) {
      const p1 = (t * 0.65) % 1;
      pulseHalo1Ref.current.scale.setScalar(1.0 + p1 * 0.85);
      (pulseHalo1Ref.current.material as THREE.MeshBasicMaterial).opacity = (1 - p1) * 0.55;
    }

    if (pulseHalo2Ref.current) {
      const p2 = (t * 0.65 + 0.5) % 1;
      pulseHalo2Ref.current.scale.setScalar(1.0 + p2 * 0.85);
      (pulseHalo2Ref.current.material as THREE.MeshBasicMaterial).opacity = (1 - p2) * 0.55;
    }

    if (godRayRef.current) {
      const mat = godRayRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.08 + Math.sin(t * 3.0) * 0.03;
    }

    // 48 Hạt sao vàng ăn mừng
    if (sparklesRef.current) {
      sparkleData.forEach((sp, idx) => {
        const curY = ((sp.yOffset + t * sp.speed + 1.0) % 3.0) - 0.9;
        const curAngle = sp.angle + t * 0.6;
        const pulse = sp.scale * (0.65 + 0.35 * Math.sin(t * 6 + idx));

        dummyObject.position.set(
          Math.cos(curAngle) * sp.radius,
          curY,
          Math.sin(curAngle) * sp.radius
        );
        dummyObject.rotation.set(t * 2, t * 3, 0);
        dummyObject.scale.setScalar(pulse);
        dummyObject.updateMatrix();

        sparklesRef.current!.setMatrixAt(idx, dummyObject.matrix);
      });
      sparklesRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group scale={scale}>
      {/* --- HỆ THỐNG ÁNH SÁNG SPOTLIGHT VÀNG ẤM BẢN GỐC --- */}
      <pointLight position={[1.2, 2.2, 2.4]} intensity={1.35} distance={7} color="#fff7ed" />
      <pointLight position={[-1.4, 2.0, -1.8]} intensity={1.6} distance={6} color="#fbbf24" />
      <pointLight position={[0, -0.5, 1.5]} intensity={0.65} distance={4} color="#38bdf8" />

      {/* Cột sáng vinh danh (Volumetric God-Ray) */}
      <mesh ref={godRayRef} position={[0, 0.85, -0.15]} material={materials.godRayBeam}>
        <cylinderGeometry args={[0.65, 1.55, 3.8, 32, 1, true]} />
      </mesh>

      {/* 48 Hạt Sao Vàng Ăn Mừng */}
      <instancedMesh ref={sparklesRef} args={[undefined, undefined, 48]} material={materials.sparkleMat}>
        <octahedronGeometry args={[1, 0]} />
      </instancedMesh>

      {/* --- BỤC ĐỨNG VINH DANH & SÓNG HÀO QUANG --- */}
      <group position={[0, -0.95, 0]}>
        <mesh material={materials.navyUniform} position={[0, -0.08, 0]}>
          <cylinderGeometry args={[1.1, 1.28, 0.18, 48]} />
        </mesh>
        <mesh material={materials.goldBadgeRim} position={[0, 0.01, 0]}>
          <cylinderGeometry args={[1.04, 1.04, 0.02, 48]} />
        </mesh>

        <mesh
          ref={podiumRingRef}
          rotation={[Math.PI / 2, 0, 0]}
          position={[0, 0.02, 0]}
          material={materials.hologramCyan}
        >
          <torusGeometry args={[1.02, 0.035, 16, 64]} />
        </mesh>

        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.025, 0]} material={materials.goldBadgeRim}>
          <ringGeometry args={[0.72, 0.77, 48]} />
        </mesh>

        <mesh
          ref={pulseHalo1Ref}
          rotation={[Math.PI / 2, 0, 0]}
          position={[0, 0.01, 0]}
          material={materials.celebrationGoldRing}
        >
          <ringGeometry args={[0.95, 1.03, 64]} />
        </mesh>

        <mesh
          ref={pulseHalo2Ref}
          rotation={[Math.PI / 2, 0, 0]}
          position={[0, 0.01, 0]}
          material={materials.celebrationGoldRing}
        >
          <ringGeometry args={[0.95, 1.03, 64]} />
        </mesh>
      </group>

      {/* --- NHÂN VẬT HỌC SINH CHIBI --- */}
      <group ref={characterRef} position={[0, 0.08, 0]}>
        {/* PHẦN ĐẦU CHIBI */}
        <group ref={headGroupRef} position={[0, 0.76, 0]}>
          {/* Khuôn mặt bầu bĩnh, làn da sáng ấm */}
          <mesh material={materials.skin} scale={[1.06, 0.96, 0.96]}>
            <sphereGeometry args={[0.54, 48, 48]} />
          </mesh>

          {/* Đôi tai */}
          <mesh position={[-0.55, -0.04, 0.02]} material={materials.skin}>
            <sphereGeometry args={[0.09, 24, 24]} />
          </mesh>
          <mesh position={[0.55, -0.04, 0.02]} material={materials.skin}>
            <sphereGeometry args={[0.09, 24, 24]} />
          </mesh>

          {/* Lông mày nằm ngang tự nhiên, thân thiện */}
          {[-0.2, 0.2].map((xPos, idx) => (
            <mesh
              key={`brow-${idx}`}
              position={[xPos, 0.15, 0.49]}
              rotation={[0, 0, Math.PI / 2 + (idx === 0 ? -0.1 : 0.1)]}
              material={materials.hair}
            >
              <capsuleGeometry args={[0.015, 0.085, 8, 8]} />
            </mesh>
          ))}

          {/* Đôi mắt Chibi to tròn long lanh với 2 điểm bắt sáng Catchlight */}
          {[-0.2, 0.2].map((xPos, idx) => (
            <group key={`eye-${idx}`} position={[xPos, -0.02, 0.48]}>
              {/* Lòng đen */}
              <mesh material={materials.eyeDark} scale={[1, 1.2, 0.3]}>
                <sphereGeometry args={[0.095, 32, 32]} />
              </mesh>
              {/* Điểm sáng lớn góc trên */}
              <mesh position={[0.032, 0.04, 0.034]} material={materials.eyeHighlight}>
                <sphereGeometry args={[0.028, 16, 16]} />
              </mesh>
              {/* Điểm sáng nhỏ góc dưới */}
              <mesh position={[-0.025, -0.032, 0.034]} material={materials.eyeHighlight}>
                <sphereGeometry args={[0.014, 16, 16]} />
              </mesh>
            </group>
          ))}

          {/* Hai má hồng cam đào dễ thương */}
          <mesh position={[-0.32, -0.13, 0.43]} scale={[1.25, 0.7, 0.25]} material={materials.blush}>
            <sphereGeometry args={[0.07, 24, 24]} />
          </mesh>
          <mesh position={[0.32, -0.13, 0.43]} scale={[1.25, 0.7, 0.25]} material={materials.blush}>
            <sphereGeometry args={[0.07, 24, 24]} />
          </mesh>

          {/* Miệng cười tươi rạng rỡ (Luôn nhìn thấy rõ, không bị tóc che!) */}
          <mesh position={[0, -0.18, 0.51]} rotation={[Math.PI, 0, 0]} material={materials.redScarf}>
            <torusGeometry args={[0.055, 0.014, 16, 32, Math.PI]} />
          </mesh>

          {/* Kính Cận Tinh Tế (Nếu học sinh đeo kính) */}
          {student.glasses && (
            <group position={[0, -0.015, 0.51]}>
              {[-0.2, 0.2].map((xG, idx) => (
                <mesh key={`glasses-rim-${idx}`} position={[xG, 0, 0]} material={materials.glassesMat}>
                  <torusGeometry args={[0.092, 0.01, 16, 32]} />
                </mesh>
              ))}
              <mesh position={[0, 0.015, 0.005]} rotation={[0, 0, Math.PI / 2]} material={materials.glassesMat}>
                <cylinderGeometry args={[0.008, 0.008, 0.12, 12]} />
              </mesh>
            </group>
          )}

          {/* --- HỆ THỐNG MÁI TÓC TINH TẾ (TUYỆT ĐỐI KHÔNG CHE MẶT HOẶC MIỆNG) --- */}
          {/* 1. Vòm tóc chính ôm mượt sọ đầu từ sau gáy lên đỉnh */}
          <mesh
            position={[0, 0.07, -0.06]}
            rotation={[-0.2, 0, 0]}
            scale={[1.05, 1.02, 1.05]}
            material={materials.hair}
          >
            <sphereGeometry args={[0.545, 48, 48, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
          </mesh>

          {/* 2. Tóc mai ôm gọn sát hai bên thái dương (trước tai) */}
          {[-1, 1].map((side) => (
            <mesh
              key={`sideburn-${side}`}
              position={[side * 0.53, 0.02, 0.1]}
              rotation={[0, 0, side * -0.08]}
              scale={[0.06, 0.24, 0.08]}
              material={materials.hair}
            >
              <sphereGeometry args={[1, 16, 16]} />
            </mesh>
          ))}

          {/* 3. TỪNG KIỂU TÓC RIÊNG BIỆT (KHÔNG BAO GIỜ CHE MẶT) */}
          {/* KIỂU 1: TÓC ĐUÔI NGỰA NỮ (FEMALE PONYTAIL) */}
          {activeHairStyle === 'female_ponytail' && (
            <group>
              {/* Mái vòm tròn cao trên trán */}
              <mesh position={[0, 0.27, 0.44]} rotation={[0.1, 0, 0]} scale={[0.22, 0.09, 0.035]} material={materials.hair}>
                <sphereGeometry args={[1, 24, 16]} />
              </mesh>
              <mesh position={[-0.19, 0.24, 0.41]} rotation={[0.12, -0.15, 0.22]} scale={[0.18, 0.08, 0.035]} material={materials.hair}>
                <sphereGeometry args={[1, 20, 16]} />
              </mesh>
              <mesh position={[0.19, 0.24, 0.41]} rotation={[0.12, 0.15, -0.22]} scale={[0.18, 0.08, 0.035]} material={materials.hair}>
                <sphereGeometry args={[1, 20, 16]} />
              </mesh>

              {/* Chùm tóc gom cao phía sau gáy */}
              <mesh position={[0, 0.22, -0.44]} scale={[1.15, 0.95, 0.85]} material={materials.hair}>
                <sphereGeometry args={[0.22, 24, 20]} />
              </mesh>

              {/* Nơ buộc tóc đỏ nổi bật */}
              <mesh position={[0, 0.24, -0.48]} rotation={[Math.PI / 2, 0, 0]} material={materials.redRibbon}>
                <torusGeometry args={[0.08, 0.028, 16, 24]} />
              </mesh>

              {/* Đuôi ngựa đung đưa sinh động khi nhún nhảy */}
              <group ref={ponytailTailRef} position={[0, 0.24, -0.48]}>
                <mesh position={[0, 0, -0.06]} scale={[0.15, 0.16, 0.15]} material={materials.hair}>
                  <sphereGeometry args={[1, 20, 16]} />
                </mesh>
                <mesh position={[0, -0.15, -0.1]} rotation={[-0.32, 0, 0]} scale={[0.13, 0.28, 0.13]} material={materials.hair}>
                  <capsuleGeometry args={[1, 1, 12, 16]} />
                </mesh>
                <mesh position={[0, -0.34, -0.06]} rotation={[0.22, 0, 0]} scale={[0.1, 0.22, 0.09]} material={materials.hair}>
                  <capsuleGeometry args={[1, 1, 12, 16]} />
                </mesh>
              </group>

              {/* Hai lọn tóc mai buông lơi thanh thoát hai bên vai */}
              {[-1, 1].map((side) => (
                <mesh
                  key={`pt-shoulder-lock-${side}`}
                  position={[side * 0.36, -0.12, 0.2]}
                  rotation={[0.08, 0, side * 0.06]}
                  scale={[0.045, 0.26, 0.045]}
                  material={materials.hair}
                >
                  <capsuleGeometry args={[1, 1, 12, 16]} />
                </mesh>
              ))}
            </group>
          )}

          {/* KIỂU 2: TÓC DÀI NỮ BUÔNG LƯNG (FEMALE LONG) */}
          {activeHairStyle === 'female_long' && (
            <group>
              {/* Mái vòm tròn */}
              <mesh position={[0, 0.27, 0.44]} rotation={[0.1, 0, 0]} scale={[0.22, 0.09, 0.035]} material={materials.hair}>
                <sphereGeometry args={[1, 24, 16]} />
              </mesh>
              <mesh position={[-0.19, 0.24, 0.41]} rotation={[0.12, -0.15, 0.22]} scale={[0.18, 0.08, 0.035]} material={materials.hair}>
                <sphereGeometry args={[1, 20, 16]} />
              </mesh>
              <mesh position={[0.19, 0.24, 0.41]} rotation={[0.12, 0.15, -0.22]} scale={[0.18, 0.08, 0.035]} material={materials.hair}>
                <sphereGeometry args={[1, 20, 16]} />
              </mesh>

              {/* Vạt tóc dài buông sau lưng */}
              <group position={[0, -0.22, -0.24]}>
                <mesh position={[0, 0.05, 0]} scale={[1.08, 1.25, 0.45]} material={materials.hair}>
                  <sphereGeometry args={[0.48, 32, 24]} />
                </mesh>
                <mesh position={[0, -0.22, 0.03]} rotation={[0.12, 0, 0]} scale={[1.12, 1.15, 0.42]} material={materials.hair}>
                  <sphereGeometry args={[0.42, 32, 24]} />
                </mesh>
              </group>

              {/* Lọn tóc buông trước hai bên vai */}
              {[-1, 1].map((side) => (
                <mesh
                  key={`long-shoulder-lock-${side}`}
                  position={[side * 0.36, -0.16, 0.16]}
                  rotation={[0.08, 0, side * 0.06]}
                  scale={[0.065, 0.32, 0.065]}
                  material={materials.hair}
                >
                  <capsuleGeometry args={[1, 1, 12, 16]} />
                </mesh>
              ))}
            </group>
          )}

          {/* KIỂU 3: TÓC BOB NGẮN CÚP NĂNG ĐỘNG (FEMALE BOB) */}
          {activeHairStyle === 'female_bob' && (
            <group>
              <mesh position={[0, 0.27, 0.44]} rotation={[0.1, 0, 0]} scale={[0.22, 0.09, 0.035]} material={materials.hair}>
                <sphereGeometry args={[1, 24, 16]} />
              </mesh>
              <mesh position={[-0.19, 0.24, 0.41]} rotation={[0.12, -0.15, 0.22]} scale={[0.18, 0.08, 0.035]} material={materials.hair}>
                <sphereGeometry args={[1, 20, 16]} />
              </mesh>
              <mesh position={[0.19, 0.24, 0.41]} rotation={[0.12, 0.15, -0.22]} scale={[0.18, 0.08, 0.035]} material={materials.hair}>
                <sphereGeometry args={[1, 20, 16]} />
              </mesh>

              {/* Hai bên bob phồng cúp nhẹ về phía cằm */}
              {[-1, 1].map((side) => (
                <mesh
                  key={`bob-curl-${side}`}
                  position={[side * 0.48, -0.06, 0.02]}
                  rotation={[0.1, 0, side * 0.15]}
                  scale={[0.14, 0.32, 0.22]}
                  material={materials.hair}
                >
                  <capsuleGeometry args={[1, 1, 12, 16]} />
                </mesh>
              ))}
              {/* Vòm tóc bob sau gáy */}
              <mesh position={[0, -0.12, -0.2]} scale={[1.04, 0.95, 0.58]} material={materials.hair}>
                <sphereGeometry args={[0.46, 28, 20]} />
              </mesh>
            </group>
          )}

          {/* KIỂU 4: TÓC HAI BÍM BUỘC HAI BÊN (FEMALE TWINTAILS) */}
          {activeHairStyle === 'female_twintails' && (
            <group>
              <mesh position={[0, 0.27, 0.44]} rotation={[0.1, 0, 0]} scale={[0.22, 0.09, 0.035]} material={materials.hair}>
                <sphereGeometry args={[1, 24, 16]} />
              </mesh>
              <mesh position={[-0.19, 0.24, 0.41]} rotation={[0.12, -0.15, 0.22]} scale={[0.18, 0.08, 0.035]} material={materials.hair}>
                <sphereGeometry args={[1, 20, 16]} />
              </mesh>
              <mesh position={[0.19, 0.24, 0.41]} rotation={[0.12, 0.15, -0.22]} scale={[0.18, 0.08, 0.035]} material={materials.hair}>
                <sphereGeometry args={[1, 20, 16]} />
              </mesh>

              {/* Bím trái */}
              <group position={[-0.44, 0.16, -0.18]}>
                <mesh rotation={[0, 0, Math.PI / 4]} material={materials.redRibbon}>
                  <torusGeometry args={[0.065, 0.024, 12, 20]} />
                </mesh>
                <group ref={twintailLeftRef}>
                  <mesh position={[-0.05, -0.14, 0]} rotation={[0, 0, 0.2]} scale={[0.09, 0.28, 0.09]} material={materials.hair}>
                    <capsuleGeometry args={[1, 1, 12, 16]} />
                  </mesh>
                </group>
              </group>

              {/* Bím phải */}
              <group position={[0.44, 0.16, -0.18]}>
                <mesh rotation={[0, 0, -Math.PI / 4]} material={materials.redRibbon}>
                  <torusGeometry args={[0.065, 0.024, 12, 20]} />
                </mesh>
                <group ref={twintailRightRef}>
                  <mesh position={[0.05, -0.14, 0]} rotation={[0, 0, -0.2]} scale={[0.09, 0.28, 0.09]} material={materials.hair}>
                    <capsuleGeometry args={[1, 1, 12, 16]} />
                  </mesh>
                </group>
              </group>

              {/* Vòm sau gáy */}
              <mesh position={[0, -0.1, -0.2]} scale={[1.0, 0.9, 0.55]} material={materials.hair}>
                <sphereGeometry args={[0.45, 24, 20]} />
              </mesh>
            </group>
          )}

          {/* KIỂU 5: TÓC NAM NGẮN GỌN GÀNG (MALE SHORT) */}
          {activeHairStyle === 'male_short' && (
            <group>
              {/* Lọn tóc mái ngắn vuốt nhẹ trên trán */}
              <mesh position={[0, 0.28, 0.42]} scale={[0.24, 0.08, 0.04]} material={materials.hair}>
                <sphereGeometry args={[1, 20, 14]} />
              </mesh>
              <mesh position={[-0.16, 0.26, 0.4]} scale={[0.16, 0.07, 0.035]} material={materials.hair}>
                <sphereGeometry args={[1, 16, 14]} />
              </mesh>
              <mesh position={[0.16, 0.26, 0.4]} scale={[0.16, 0.07, 0.035]} material={materials.hair}>
                <sphereGeometry args={[1, 16, 14]} />
              </mesh>
              {/* Khối tóc đỉnh đầu */}
              <mesh position={[0, 0.36, 0.04]} scale={[0.88, 0.2, 0.82]} material={materials.hair}>
                <sphereGeometry args={[0.5, 24, 20]} />
              </mesh>
              {/* Chân tóc sau gáy cắt gọn gàng */}
              <mesh position={[0, -0.06, -0.18]} rotation={[0.15, 0, 0]} scale={[0.96, 0.85, 0.82]} material={materials.hair}>
                <sphereGeometry args={[0.45, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
              </mesh>
            </group>
          )}

          {/* KIỂU 6: TÓC NAM RẼ NGÔI 2 MÁI HÀN QUỐC (MALE CURTAIN) */}
          {activeHairStyle === 'male_curtain' && (
            <group>
              {/* Mái rẽ ngôi 2 bên, lộ phần giữa trán sáng sủa */}
              <mesh position={[-0.17, 0.27, 0.43]} rotation={[0.12, -0.2, 0.22]} scale={[0.17, 0.09, 0.04]} material={materials.hair}>
                <sphereGeometry args={[1, 20, 14]} />
              </mesh>
              <mesh position={[0.17, 0.27, 0.43]} rotation={[0.12, 0.2, -0.22]} scale={[0.17, 0.09, 0.04]} material={materials.hair}>
                <sphereGeometry args={[1, 20, 14]} />
              </mesh>
              {/* Khối tóc đỉnh bồng bềnh */}
              <mesh position={[0, 0.37, 0.02]} scale={[0.92, 0.22, 0.84]} material={materials.hair}>
                <sphereGeometry args={[0.5, 24, 20]} />
              </mesh>
              {/* Sau gáy lãng tử */}
              <mesh position={[0, -0.08, -0.19]} rotation={[0.15, 0, 0]} scale={[0.98, 0.9, 0.85]} material={materials.hair}>
                <sphereGeometry args={[0.46, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
              </mesh>
            </group>
          )}
        </group>

        {/* --- PHẦN THÂN & ĐỒNG PHỤC HỌC SINH --- */}
        <group position={[0, -0.04, 0]}>
          {/* Thân áo sơ mi trắng gọn gàng */}
          <mesh material={materials.whiteShirt}>
            <cylinderGeometry args={[0.26, 0.33, 0.6, 32]} />
          </mesh>

          {/* CỤM KHĂN QUÀNG ĐỎ TINH TẾ (ÔM SÁT CỔ ÁO, KHÔNG TRÙM LÊN CẰM) */}
          <group position={[0, 0.22, 0]}>
            {/* 1. Vòng khăn quàng đỏ ôm quanh cổ áo */}
            <mesh
              rotation={[Math.PI / 2 + 0.14, 0, 0]}
              position={[0, 0.02, 0.02]}
              material={materials.redScarf}
            >
              <torusGeometry args={[0.26, 0.042, 16, 36]} />
            </mesh>

            {/* 2. Hai lá cổ áo sơ mi trắng bẻ nhẹ bên trên vòng khăn */}
            {[-1, 1].map((side) => (
              <mesh
                key={`collar-${side}`}
                position={[side * 0.1, 0.045, 0.2]}
                rotation={[0.2, side * -0.3, side * -0.16]}
                scale={[1.1, 0.22, 0.65]}
                material={materials.whiteShirt}
              >
                <sphereGeometry args={[0.075, 16, 12]} />
              </mesh>
            ))}

            {/* 3. Nút thắt khăn quàng đỏ bo tròn ở ngực */}
            <mesh
              position={[0, -0.035, 0.27]}
              scale={[1.1, 0.85, 0.8]}
              material={materials.redScarf}
            >
              <sphereGeometry args={[0.052, 16, 16]} />
            </mesh>

            {/* 4. Hai tà khăn quàng đỏ vát nhọn duyên dáng */}
            {/* Tà trái */}
            <mesh
              position={[-0.04, -0.14, 0.27]}
              rotation={[0.12, 0, 0.1]}
              scale={[0.058, 0.26, 0.02]}
              material={materials.redScarf}
            >
              <coneGeometry args={[1, 1, 4]} />
            </mesh>
            {/* Tà phải hơi xếp chéo */}
            <mesh
              position={[0.038, -0.12, 0.26]}
              rotation={[0.12, 0, -0.12]}
              scale={[0.052, 0.22, 0.02]}
              material={materials.redScarf}
            >
              <coneGeometry args={[1, 1, 4]} />
            </mesh>
          </group>

          {/* Huy hiệu ngực trái: Viền mạ vàng + Tâm đỏ rực */}
          <group position={[0.14, 0.11, 0.27]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh material={materials.goldBadgeRim}>
              <cylinderGeometry args={[0.045, 0.045, 0.016, 24]} />
            </mesh>
            <mesh position={[0, 0.01, 0]} material={materials.redBadgeCenter}>
              <cylinderGeometry args={[0.032, 0.032, 0.012, 24]} />
            </mesh>
          </group>

          {/* Balo đi học phía sau lưng */}
          <RoundedBox
            args={[0.42, 0.44, 0.22]}
            radius={0.08}
            smoothness={4}
            position={[0, 0.02, -0.28]}
            material={materials.backpack}
          />

          {/* Chân váy mềm mại cho nữ (dáng A-line loe nhẹ) / Quần âu cho nam */}
          {isFemale ? (
            <mesh position={[0, -0.33, 0]} material={materials.navyUniform}>
              <cylinderGeometry args={[0.3, 0.44, 0.26, 32]} />
            </mesh>
          ) : (
            <mesh position={[0, -0.31, 0]} material={materials.navyUniform}>
              <cylinderGeometry args={[0.31, 0.32, 0.22, 32]} />
            </mesh>
          )}

          {/* Tay Trái */}
          <group ref={leftShoulderPivotRef} position={[-0.34, 0.22, 0.04]}>
            <mesh position={[0, -0.16, 0]} material={materials.whiteShirt}>
              <capsuleGeometry args={[0.075, 0.24, 16, 16]} />
            </mesh>
            {/* Viền cổ tay áo */}
            <mesh position={[0, -0.27, 0]} material={materials.whiteShirt}>
              <torusGeometry args={[0.078, 0.012, 12, 24]} />
            </mesh>
            <mesh position={[0, -0.33, 0]} material={materials.skin}>
              <sphereGeometry args={[0.082, 24, 24]} />
            </mesh>
          </group>

          {/* Tay Phải (Vẫy chào mừng nhiệt tình) */}
          <group ref={rightShoulderPivotRef} position={[0.34, 0.22, 0.06]}>
            <mesh position={[0, -0.16, 0]} material={materials.whiteShirt}>
              <capsuleGeometry args={[0.075, 0.24, 16, 16]} />
            </mesh>
            {/* Viền cổ tay áo */}
            <mesh position={[0, -0.27, 0]} material={materials.whiteShirt}>
              <torusGeometry args={[0.078, 0.012, 12, 24]} />
            </mesh>
            <mesh position={[0, -0.33, 0]} material={materials.skin}>
              <sphereGeometry args={[0.082, 24, 24]} />
            </mesh>
          </group>

          {/* Đôi chân & Giày học sinh */}
          {[-0.14, 0.14].map((xLeg, idx) => (
            <group key={`leg-${idx}`} position={[xLeg, -0.56, 0]}>
              {/* Nữ: chân trần + tất trắng; Nam: quần âu navy lịch lãm */}
              {isFemale ? (
                <>
                  <mesh material={materials.skin}>
                    <capsuleGeometry args={[0.08, 0.26, 16, 16]} />
                  </mesh>
                  <mesh position={[0, -0.11, 0]} material={materials.whiteShirt}>
                    <cylinderGeometry args={[0.085, 0.085, 0.12, 24]} />
                  </mesh>
                </>
              ) : (
                <mesh position={[0, -0.04, 0]} material={materials.navyUniform}>
                  <cylinderGeometry args={[0.105, 0.115, 0.32, 20]} />
                </mesh>
              )}
              <RoundedBox
                args={[0.18, 0.11, 0.25]}
                radius={0.05}
                smoothness={4}
                position={[0, -0.21, 0.04]}
                material={materials.navyUniform}
              />
            </group>
          ))}
        </group>
      </group>
    </group>
  );
};
