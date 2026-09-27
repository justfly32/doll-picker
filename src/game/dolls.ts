import { DollTemplate } from '../types/game';

export const DOLL_TEMPLATES: Record<string, DollTemplate> = {
  mochi_cat: {
    id: 'mochi_cat',
    name: '말랑 모찌냥',
    category: '고양이',
    rarity: 'COMMON',
    description: '매끄러운 나일론 재질의 찹쌀떡 고양이. 둥글고 미끄러워 삼발이가 헛돌기 쉽습니다.',
    color: '#FFF1F2',
    secondaryColor: '#FECDD3',
    earColor: '#FB7185',
    accentColor: '#1E293B',
    width: 58,
    height: 52,
    mass: 1.05,
    friction: 0.32, // Slippery
    gripDifficulty: 3,
    centerOffset: { x: 0, y: 3 },
    catchQuote: '야옹~ 말랑말랑 모찌냥 구출 성공!'
  },
  chubby_bear: {
    id: 'chubby_bear',
    name: '포동이 곰돌이',
    category: '곰인형',
    rarity: 'COMMON',
    description: '전통의 인기 인형. 머리가 크고 몸통이 묵직해 목덜미를 정확히 잡지 않으면 굴러 떨어집니다.',
    color: '#BA7A46',
    secondaryColor: '#E4BF98',
    earColor: '#8C5228',
    accentColor: '#EF4444',
    width: 62,
    height: 66,
    mass: 1.35, // Heavier
    friction: 0.44,
    gripDifficulty: 4,
    centerOffset: { x: 0, y: -6 },
    catchQuote: '포근포근 곰돌이가 품안으로 쏙!'
  },
  fluffy_bunny: {
    id: 'fluffy_bunny',
    name: '쫄깃 토끼',
    category: '토끼',
    rarity: 'UNCOMMON',
    description: '길쭉한 귀가 매력적이지만, 귀만 잡히면 진자 운동으로 튕겨져 나가는 함정 인형입니다.',
    color: '#FDF2F8',
    secondaryColor: '#F472B6',
    earColor: '#FBCFE8',
    accentColor: '#9D174D',
    width: 54,
    height: 72,
    mass: 1.15,
    friction: 0.38,
    gripDifficulty: 4,
    centerOffset: { x: 0, y: 8 },
    catchQuote: '깡총! 아슬아슬하게 토끼 획득!'
  },
  giant_octopus: {
    id: 'giant_octopus',
    name: '대왕 문어',
    category: '해양',
    rarity: 'UNCOMMON',
    description: '다리가 넓게 퍼져 있어 걸치기는 쉽지만, 다른 인형들에 걸려 올라오다 떨어지기 일쑤입니다.',
    color: '#A855F7',
    secondaryColor: '#C084FC',
    earColor: '#E9D5FF',
    accentColor: '#581C87',
    width: 68,
    height: 60,
    mass: 1.25,
    friction: 0.42,
    gripDifficulty: 3,
    centerOffset: { x: 0, y: 0 },
    catchQuote: '빨판 파워! 대왕 문어 포획!'
  },
  round_chick: {
    id: 'round_chick',
    name: '삐약 병아리',
    category: '조류',
    rarity: 'COMMON',
    description: '완벽한 원형에 가까운 노랑 병아리. 조금만 빗맞아도 발톱이 미끄러져 튕겨납니다.',
    color: '#FDE047',
    secondaryColor: '#F59E0B',
    earColor: '#FB923C',
    accentColor: '#B45309',
    width: 50,
    height: 48,
    mass: 0.85, // Light, but slips easily
    friction: 0.29,
    gripDifficulty: 4,
    centerOffset: { x: 0, y: 1 },
    catchQuote: '삐약! 작은 고추가 맵다! 병아리 획득!'
  },
  baby_dino: {
    id: 'baby_dino',
    name: '우주 아기공룡',
    category: '공룡',
    rarity: 'RARE',
    description: '꼬리와 등 뿔 때문에 무게 중심이 한쪽으로 쏠려 있어, 집게가 들썩거리다 공중에서 뚝 떨어집니다.',
    color: '#34D399',
    secondaryColor: '#10B981',
    earColor: '#059669',
    accentColor: '#064E3B',
    width: 64,
    height: 62,
    mass: 1.28,
    friction: 0.40,
    gripDifficulty: 5,
    centerOffset: { x: 5, y: -4 },
    catchQuote: '크와앙! 전설의 아기공룡 겟!'
  },
  golden_piggy: {
    id: 'golden_piggy',
    name: '황금 피기',
    category: '복돈',
    rarity: 'LEGENDARY',
    description: '오락실 대박 경품! 묵직한 무게와 매끄러운 금빛 나일론 코팅으로 뽑기가 극도로 어렵습니다.',
    color: '#FBBF24',
    secondaryColor: '#F59E0B',
    earColor: '#D97706',
    accentColor: '#78350F',
    width: 66,
    height: 56,
    mass: 1.65, // Heaviest
    friction: 0.26, // Most slippery
    gripDifficulty: 5,
    centerOffset: { x: 0, y: 0 },
    catchQuote: '대박 사건! 황금 피기를 뽑았습니다!!'
  },
  star_unicorn: {
    id: 'star_unicorn',
    name: '별나라 유니콘',
    category: '환상',
    rarity: 'RARE',
    description: '빛나는 뿔과 풍성한 갈기. 형태가 울퉁불퉁하여 3발 집게의 균형을 쉽게 무너뜨립니다.',
    color: '#E0E7FF',
    secondaryColor: '#818CF8',
    earColor: '#F43F5E',
    accentColor: '#4338CA',
    width: 62,
    height: 68,
    mass: 1.2,
    friction: 0.36,
    gripDifficulty: 4,
    centerOffset: { x: 4, y: 6 },
    catchQuote: '신비로운 별나라 유니콘과 친구가 되었어요!'
  }
};

/**
 * Procedural Canvas drawing functions for plushies with high visual polish,
 * soft squish effects, shadows, stitches, eyes, cheeks, and tags.
 */
export function drawPlushOnCanvas(
  ctx: CanvasRenderingContext2D,
  template: DollTemplate,
  x: number,
  y: number,
  angle: number,
  squishX = 1.0,
  squishY = 1.0,
  scale = 1.0
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(squishX * scale, squishY * scale);

  const w = template.width;
  const h = template.height;

  // Soft contact drop shadow underneath
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
  ctx.beginPath();
  ctx.ellipse(0, h * 0.42, w * 0.44, h * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  switch (template.id) {
    case 'mochi_cat':
      drawMochiCat(ctx, template, w, h);
      break;
    case 'chubby_bear':
      drawChubbyBear(ctx, template, w, h);
      break;
    case 'fluffy_bunny':
      drawFluffyBunny(ctx, template, w, h);
      break;
    case 'giant_octopus':
      drawGiantOctopus(ctx, template, w, h);
      break;
    case 'round_chick':
      drawRoundChick(ctx, template, w, h);
      break;
    case 'baby_dino':
      drawBabyDino(ctx, template, w, h);
      break;
    case 'golden_piggy':
      drawGoldenPiggy(ctx, template, w, h);
      break;
    case 'star_unicorn':
    default:
      drawStarUnicorn(ctx, template, w, h);
      break;
  }

  // Draw authentic fabric cloth tag on bottom edge
  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.rect(w * 0.22, h * 0.25, 11, 7);
  ctx.fill();
  ctx.stroke();
  // Mini heart or barcode mark
  ctx.fillStyle = '#EF4444';
  ctx.fillRect(w * 0.24, h * 0.27, 4, 3);
  ctx.restore();

  ctx.restore();
}

/* Specific Plush Artists */

function drawMochiCat(ctx: CanvasRenderingContext2D, t: DollTemplate, w: number, h: number) {
  // Ears
  ctx.fillStyle = t.color;
  ctx.strokeStyle = t.secondaryColor;
  ctx.lineWidth = 2.5;

  // Left ear
  ctx.beginPath();
  ctx.moveTo(-w * 0.35, -h * 0.2);
  ctx.lineTo(-w * 0.4, -h * 0.48);
  ctx.lineTo(-w * 0.15, -h * 0.35);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Left ear inner
  ctx.fillStyle = t.earColor!;
  ctx.beginPath();
  ctx.moveTo(-w * 0.33, -h * 0.24);
  ctx.lineTo(-w * 0.37, -h * 0.42);
  ctx.lineTo(-w * 0.2, -h * 0.34);
  ctx.closePath();
  ctx.fill();

  // Right ear
  ctx.fillStyle = t.color;
  ctx.beginPath();
  ctx.moveTo(w * 0.35, -h * 0.2);
  ctx.lineTo(w * 0.4, -h * 0.48);
  ctx.lineTo(w * 0.15, -h * 0.35);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Right ear inner
  ctx.fillStyle = t.earColor!;
  ctx.beginPath();
  ctx.moveTo(w * 0.33, -h * 0.24);
  ctx.lineTo(w * 0.37, -h * 0.42);
  ctx.lineTo(w * 0.2, -h * 0.34);
  ctx.closePath();
  ctx.fill();

  // Main mochi body
  const grad = ctx.createRadialGradient(-w * 0.1, -h * 0.1, 4, 0, 0, w * 0.55);
  grad.addColorStop(0, '#FFFFFF');
  grad.addColorStop(0.7, t.color);
  grad.addColorStop(1, t.secondaryColor);

  ctx.fillStyle = grad;
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, w * 0.48, h * 0.44, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Rosy cheeks
  ctx.fillStyle = 'rgba(251, 113, 133, 0.4)';
  ctx.beginPath();
  ctx.ellipse(-w * 0.25, h * 0.05, 6, 4, 0, 0, Math.PI * 2);
  ctx.ellipse(w * 0.25, h * 0.05, 6, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cute closed curved eyes: ^ ^
  ctx.strokeStyle = t.accentColor;
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  // Left eye
  ctx.beginPath();
  ctx.arc(-w * 0.18, -h * 0.02, 5, Math.PI, 0);
  ctx.stroke();
  // Right eye
  ctx.beginPath();
  ctx.arc(w * 0.18, -h * 0.02, 5, Math.PI, 0);
  ctx.stroke();

  // Nose and mouth: :3
  ctx.fillStyle = '#FB7185';
  ctx.beginPath();
  ctx.ellipse(0, h * 0.03, 3, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(-2.5, h * 0.09, 3, 0, Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(2.5, h * 0.09, 3, 0, Math.PI);
  ctx.stroke();

  // Cute whiskers
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = '#94A3B8';
  ctx.beginPath();
  ctx.moveTo(-w * 0.26, h * 0.02);
  ctx.lineTo(-w * 0.42, 0);
  ctx.moveTo(-w * 0.26, h * 0.08);
  ctx.lineTo(-w * 0.40, h * 0.14);
  ctx.moveTo(w * 0.26, h * 0.02);
  ctx.lineTo(w * 0.42, 0);
  ctx.moveTo(w * 0.26, h * 0.08);
  ctx.lineTo(w * 0.40, h * 0.14);
  ctx.stroke();
}

function drawChubbyBear(ctx: CanvasRenderingContext2D, t: DollTemplate, w: number, h: number) {
  // Round ears
  ctx.fillStyle = t.color;
  ctx.strokeStyle = t.earColor!;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(-w * 0.32, -h * 0.35, 12, 0, Math.PI * 2);
  ctx.arc(w * 0.32, -h * 0.35, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = t.secondaryColor;
  ctx.beginPath();
  ctx.arc(-w * 0.32, -h * 0.35, 6, 0, Math.PI * 2);
  ctx.arc(w * 0.32, -h * 0.35, 6, 0, Math.PI * 2);
  ctx.fill();

  // Chubby body & head composite
  const bodyGrad = ctx.createRadialGradient(0, -h * 0.1, 6, 0, 0, w * 0.5);
  bodyGrad.addColorStop(0, '#D99B6A');
  bodyGrad.addColorStop(0.8, t.color);
  bodyGrad.addColorStop(1, '#8C5228');

  ctx.fillStyle = bodyGrad;
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, w * 0.46, h * 0.44, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Snout
  ctx.fillStyle = t.secondaryColor;
  ctx.beginPath();
  ctx.ellipse(0, h * 0.06, 14, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Nose
  ctx.fillStyle = '#291B12';
  ctx.beginPath();
  ctx.ellipse(0, h * 0.02, 6, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Mouth
  ctx.strokeStyle = '#291B12';
  ctx.lineWidth = 1.8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.05);
  ctx.lineTo(0, h * 0.09);
  ctx.stroke();

  // Bead button eyes with glint
  ctx.fillStyle = '#18181B';
  ctx.beginPath();
  ctx.arc(-w * 0.18, -h * 0.06, 4.5, 0, Math.PI * 2);
  ctx.arc(w * 0.18, -h * 0.06, 4.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-w * 0.19, -h * 0.08, 1.6, 0, Math.PI * 2);
  ctx.arc(w * 0.17, -h * 0.08, 1.6, 0, Math.PI * 2);
  ctx.fill();

  // Red bowtie
  ctx.fillStyle = t.accentColor;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.28);
  ctx.lineTo(-12, h * 0.22);
  ctx.lineTo(-12, h * 0.34);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(0, h * 0.28);
  ctx.lineTo(12, h * 0.22);
  ctx.lineTo(12, h * 0.34);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.arc(0, h * 0.28, 3.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawFluffyBunny(ctx: CanvasRenderingContext2D, t: DollTemplate, w: number, h: number) {
  // Long floppy ears
  ctx.fillStyle = t.color;
  ctx.strokeStyle = t.secondaryColor;
  ctx.lineWidth = 2;

  // Left ear
  ctx.save();
  ctx.translate(-w * 0.22, -h * 0.32);
  ctx.rotate(-0.15);
  ctx.beginPath();
  ctx.ellipse(0, -h * 0.22, 9, h * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = t.earColor!;
  ctx.beginPath();
  ctx.ellipse(0, -h * 0.22, 5, h * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Right ear (slightly tilted)
  ctx.save();
  ctx.translate(w * 0.22, -h * 0.32);
  ctx.rotate(0.22);
  ctx.fillStyle = t.color;
  ctx.beginPath();
  ctx.ellipse(0, -h * 0.22, 9, h * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = t.earColor!;
  ctx.beginPath();
  ctx.ellipse(0, -h * 0.22, 5, h * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Body
  ctx.fillStyle = t.color;
  ctx.strokeStyle = '#FBCFE8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, h * 0.08, w * 0.44, h * 0.38, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Cheeks
  ctx.fillStyle = 'rgba(244, 114, 182, 0.35)';
  ctx.beginPath();
  ctx.arc(-w * 0.22, h * 0.12, 6, 0, Math.PI * 2);
  ctx.arc(w * 0.22, h * 0.12, 6, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#374151';
  ctx.beginPath();
  ctx.arc(-w * 0.15, h * 0.04, 3.8, 0, Math.PI * 2);
  ctx.arc(w * 0.15, h * 0.04, 3.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-w * 0.16, h * 0.02, 1.4, 0, Math.PI * 2);
  ctx.arc(w * 0.14, h * 0.02, 1.4, 0, Math.PI * 2);
  ctx.fill();

  // Y-shaped bunny mouth
  ctx.strokeStyle = '#F472B6';
  ctx.lineWidth = 1.8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.08);
  ctx.lineTo(0, h * 0.12);
  ctx.moveTo(-4, h * 0.16);
  ctx.lineTo(0, h * 0.12);
  ctx.lineTo(4, h * 0.16);
  ctx.stroke();
}

function drawGiantOctopus(ctx: CanvasRenderingContext2D, t: DollTemplate, w: number, h: number) {
  // Tentacles curling at the bottom
  ctx.fillStyle = t.secondaryColor;
  ctx.strokeStyle = t.accentColor;
  ctx.lineWidth = 1.8;
  for (let i = -3; i <= 3; i++) {
    const tx = i * 9;
    const ty = h * 0.24 + Math.abs(i) * 2;
    ctx.beginPath();
    ctx.arc(tx, ty, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Giant round bulb head
  const grad = ctx.createRadialGradient(-w * 0.1, -h * 0.1, 4, 0, 0, w * 0.5);
  grad.addColorStop(0, '#D8B4FE');
  grad.addColorStop(0.7, t.color);
  grad.addColorStop(1, '#7E22CE');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(0, -h * 0.06, w * 0.44, h * 0.38, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Big cartoon eyes
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(-w * 0.18, -h * 0.08, 9, 11, 0, 0, Math.PI * 2);
  ctx.ellipse(w * 0.18, -h * 0.08, 9, 11, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#3B0764';
  ctx.beginPath();
  ctx.arc(-w * 0.16, -h * 0.07, 5.5, 0, Math.PI * 2);
  ctx.arc(w * 0.16, -h * 0.07, 5.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-w * 0.18, -h * 0.1, 2.5, 0, Math.PI * 2);
  ctx.arc(w * 0.14, -h * 0.1, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // O-shaped mouth
  ctx.fillStyle = '#581C87';
  ctx.beginPath();
  ctx.arc(0, h * 0.08, 4.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawRoundChick(ctx: CanvasRenderingContext2D, t: DollTemplate, w: number, h: number) {
  // Sprout feather on head
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, -h * 0.42);
  ctx.quadraticCurveTo(-6, -h * 0.55, -2, -h * 0.6);
  ctx.moveTo(0, -h * 0.42);
  ctx.quadraticCurveTo(6, -h * 0.55, 3, -h * 0.58);
  ctx.stroke();

  // Spherical body
  const grad = ctx.createRadialGradient(-w * 0.1, -h * 0.1, 3, 0, 0, w * 0.48);
  grad.addColorStop(0, '#FEF08A');
  grad.addColorStop(0.7, t.color);
  grad.addColorStop(1, t.secondaryColor);

  ctx.fillStyle = grad;
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, w * 0.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Tiny stubby wings
  ctx.fillStyle = '#FBBF24';
  ctx.beginPath();
  ctx.ellipse(-w * 0.38, h * 0.05, 5, 9, -0.3, 0, Math.PI * 2);
  ctx.ellipse(w * 0.38, h * 0.05, 5, 9, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Beak
  ctx.fillStyle = '#F97316';
  ctx.beginPath();
  ctx.moveTo(0, -h * 0.03);
  ctx.lineTo(8, h * 0.04);
  ctx.lineTo(-8, h * 0.04);
  ctx.closePath();
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#1C1917';
  ctx.beginPath();
  ctx.arc(-w * 0.18, -h * 0.08, 3.5, 0, Math.PI * 2);
  ctx.arc(w * 0.18, -h * 0.08, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-w * 0.19, -h * 0.1, 1.2, 0, Math.PI * 2);
  ctx.arc(w * 0.17, -h * 0.1, 1.2, 0, Math.PI * 2);
  ctx.fill();
}

function drawBabyDino(ctx: CanvasRenderingContext2D, t: DollTemplate, w: number, h: number) {
  // Back plates / ridges
  ctx.fillStyle = t.earColor!;
  for (let i = 0; i < 4; i++) {
    const px = -w * 0.28 + i * 14;
    const py = -h * 0.32 + (i % 2) * 2;
    ctx.beginPath();
    ctx.moveTo(px - 5, py);
    ctx.lineTo(px, py - 9);
    ctx.lineTo(px + 5, py);
    ctx.closePath();
    ctx.fill();
  }

  // Asymmetric Dino body (with tail to right)
  ctx.fillStyle = t.color;
  ctx.strokeStyle = t.accentColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(-w * 0.05, 0, w * 0.42, h * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Tail protruding
  ctx.beginPath();
  ctx.moveTo(w * 0.28, h * 0.1);
  ctx.quadraticCurveTo(w * 0.52, h * 0.05, w * 0.56, -h * 0.1);
  ctx.quadraticCurveTo(w * 0.48, h * 0.26, w * 0.22, h * 0.28);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Belly patch
  ctx.fillStyle = '#A7F3D0';
  ctx.beginPath();
  ctx.ellipse(-w * 0.08, h * 0.1, w * 0.24, h * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cute dino eye
  ctx.fillStyle = '#064E3B';
  ctx.beginPath();
  ctx.arc(-w * 0.22, -h * 0.08, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-w * 0.23, -h * 0.1, 1.4, 0, Math.PI * 2);
  ctx.fill();

  // Tiny tooth
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(-w * 0.28, h * 0.06);
  ctx.lineTo(-w * 0.24, h * 0.14);
  ctx.lineTo(-w * 0.20, h * 0.06);
  ctx.closePath();
  ctx.fill();
}

function drawGoldenPiggy(ctx: CanvasRenderingContext2D, t: DollTemplate, w: number, h: number) {
  // Golden shimmer glow effect
  const goldGrad = ctx.createRadialGradient(-w * 0.15, -h * 0.15, 6, 0, 0, w * 0.55);
  goldGrad.addColorStop(0, '#FEF08A');
  goldGrad.addColorStop(0.3, t.color);
  goldGrad.addColorStop(0.8, t.secondaryColor);
  goldGrad.addColorStop(1, '#B45309');

  // Ears
  ctx.fillStyle = t.earColor!;
  ctx.beginPath();
  ctx.moveTo(-w * 0.28, -h * 0.3);
  ctx.lineTo(-w * 0.35, -h * 0.46);
  ctx.lineTo(-w * 0.12, -h * 0.36);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(w * 0.28, -h * 0.3);
  ctx.lineTo(w * 0.35, -h * 0.46);
  ctx.lineTo(w * 0.12, -h * 0.36);
  ctx.closePath();
  ctx.fill();

  // Round plump body
  ctx.fillStyle = goldGrad;
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, w * 0.48, h * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Pig snout
  ctx.fillStyle = '#F59E0B';
  ctx.strokeStyle = '#B45309';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(0, h * 0.04, 14, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Nostrils
  ctx.fillStyle = '#78350F';
  ctx.beginPath();
  ctx.ellipse(-5, h * 0.04, 2.5, 3.5, 0, 0, Math.PI * 2);
  ctx.ellipse(5, h * 0.04, 2.5, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#451A03';
  ctx.beginPath();
  ctx.arc(-w * 0.22, -h * 0.08, 3.5, 0, Math.PI * 2);
  ctx.arc(w * 0.22, -h * 0.08, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Coin slot on top
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-10, -h * 0.34);
  ctx.lineTo(10, -h * 0.34);
  ctx.stroke();

  // Shiny sparkle on gold
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-w * 0.25, -h * 0.22, 3, 0, Math.PI * 2);
  ctx.arc(-w * 0.2, -h * 0.26, 1.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawStarUnicorn(ctx: CanvasRenderingContext2D, t: DollTemplate, w: number, h: number) {
  // Golden horn
  ctx.fillStyle = '#FBBF24';
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, -h * 0.3);
  ctx.lineTo(-4, -h * 0.58);
  ctx.lineTo(4, -h * 0.58);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Pastel mane curls
  ctx.fillStyle = '#F43F5E';
  ctx.beginPath();
  ctx.arc(-w * 0.22, -h * 0.25, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#818CF8';
  ctx.beginPath();
  ctx.arc(-w * 0.3, -h * 0.12, 8, 0, Math.PI * 2);
  ctx.fill();

  // Body
  ctx.fillStyle = t.color;
  ctx.strokeStyle = t.secondaryColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, w * 0.44, h * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Eyelash eyes
  ctx.strokeStyle = t.accentColor;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(w * 0.12, -h * 0.05, 5, Math.PI * 0.1, Math.PI * 0.9);
  ctx.stroke();

  // Star cheek stamp
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.arc(w * 0.22, h * 0.08, 3.5, 0, Math.PI * 2);
  ctx.fill();
}
