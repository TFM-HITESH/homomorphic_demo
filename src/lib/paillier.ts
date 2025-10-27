// src/lib/paillier.ts

import { randomBytes } from "crypto";

// Helper functions for Paillier key generation

export function pow(base: bigint, exp: bigint, mod: bigint): bigint {
  let res = 1n;
  base %= mod;
  while (exp > 0n) {
    if (exp % 2n === 1n) res = (res * base) % mod;
    base = (base * base) % mod;
    exp /= 2n;
  }
  return res;
}

export function isProbablePrime(n: bigint, k = 8): boolean {
  if (n < 2n) return false;
  const smallPrimes = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n];
  for (const p of smallPrimes) {
    if (n % p === 0n) return n === p;
  }

  let s = 0n;
  let d = n - 1n;
  while (d % 2n === 0n) {
    d /= 2n;
    s++;
  }

  for (let i = 0; i < k; i++) {
    let a: bigint;
    do {
      const len = Math.ceil(n.toString(2).length / 8);
      const buf = randomBytes(len);
      a = BigInt("0x" + buf.toString("hex"));
    } while (a < 2n || a >= n - 2n);

    let x = pow(a, d, n);
    if (x === 1n || x === n - 1n) continue;

    let skipToNext = false;
    for (let j = 0n; j < s - 1n; j++) {
      x = pow(x, 2n, n);
      if (x === n - 1n) {
        skipToNext = true;
        break;
      }
    }
    if (skipToNext) continue;

    return false;
  }
  return true;
}

export function generatePrime(bits: number): bigint {
  while (true) {
    const buf = randomBytes(bits / 8);
    const candidate =
      BigInt("0x" + buf.toString("hex")) | (1n << (BigInt(bits) - 1n)) | 1n;
    if (isProbablePrime(candidate)) {
      return candidate;
    }
  }
}

export function gcd(a: bigint, b: bigint): bigint {
  return b === 0n ? a : gcd(b, a % b);
}

export function lcm(a: bigint, b: bigint): bigint {
  if (a === 0n || b === 0n) return 0n;
  return (a * b) / gcd(a, b);
}

export function extended_gcd(a: bigint, b: bigint): [bigint, bigint, bigint] {
  if (b === 0n) {
    return [a, 1n, 0n];
  }
  const [g, x1, y1] = extended_gcd(b, a % b);
  const x = y1;
  const y = x1 - (a / b) * y1;
  return [g, x, y];
}

export function invmod(a: bigint, m: bigint): bigint {
  const [g, x] = extended_gcd(a, m);
  if (g !== 1n) {
    throw new Error("No modular inverse");
  }
  return ((x % m) + m) % m;
}

export interface PublicKey {
  n: bigint;
  g: bigint;
}

export interface PrivateKey {
  lam: bigint;
  mu: bigint;
}

export function paillierKeygen(bits = 512): {
  pub: PublicKey;
  priv: PrivateKey;
} {
  const p = generatePrime(bits / 2);
  let q = generatePrime(bits / 2);
  while (q === p) {
    q = generatePrime(bits / 2);
  }

  const n = p * q;
  const n_sq = n * n;
  const lam = lcm(p - 1n, q - 1n);
  const g = n + 1n;

  const L = (u: bigint) => (u - 1n) / n;

  const x = pow(g, lam, n_sq);
  const l_val = L(x);
  const mu = invmod(l_val, n);

  return { pub: { n, g }, priv: { lam, mu } };
}

export function paillierEncrypt(pub: PublicKey, m: number): bigint {
  const n_sq = pub.n * pub.n;

  // Ensure m is within the valid range [0, n-1]
  let plaintext = BigInt(m);
  if (plaintext < 0n || plaintext >= pub.n) {
    plaintext = plaintext % pub.n;
    if (plaintext < 0n) plaintext += pub.n; // Ensure positive result for modulo
  }

  let r: bigint;
  do {
    const len = Math.ceil(pub.n.toString(2).length / 8);
    const buf = randomBytes(len);
    r = BigInt("0x" + buf.toString("hex"));
  } while (r <= 0n || r >= pub.n || gcd(r, pub.n) !== 1n);

  return (pow(pub.g, plaintext, n_sq) * pow(r, pub.n, n_sq)) % n_sq;
}

export function eAdd(pub: PublicKey, c1: bigint, c2: bigint): bigint {
  const n_sq = pub.n * pub.n;
  return (c1 * c2) % n_sq;
}

export function eMulConst(pub: PublicKey, c: bigint, k: number): bigint {
  const n_sq = pub.n * pub.n;
  return pow(c, BigInt(k), n_sq);
}

export function paillierDecrypt(
  pub: PublicKey,
  priv: PrivateKey,
  c: bigint
): bigint {
  const n_sq = pub.n * pub.n;
  const L = (u: bigint) => (u - 1n) / pub.n;

  const x = pow(c, priv.lam, n_sq);
  const l_val = L(x);
  const m = (l_val * priv.mu) % pub.n;

  return m;
}
