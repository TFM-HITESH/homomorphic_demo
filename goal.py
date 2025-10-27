# paillier_demo.py
# Educational Paillier homomorphic demo.
# NOT production-safe. For demos / learning only.

import secrets
import math

# -------------------------
# Helpers: Miller-Rabin primality test and prime generation
# -------------------------
def is_probable_prime(n, k=8):
    """Miller-Rabin primality test (probabilistic)."""
    if n < 2:
        return False
    small_primes = [2,3,5,7,11,13,17,19,23,29]
    for p in small_primes:
        if n % p == 0:
            return n == p
    # write n-1 as d*2^s
    s = 0
    d = n - 1
    while d % 2 == 0:
        d //= 2
        s += 1
    for _ in range(k):
        a = secrets.randbelow(n - 3) + 2  # random in [2, n-2]
        x = pow(a, d, n)
        if x == 1 or x == n - 1:
            continue
        skip_to_next = False
        for __ in range(s - 1):
            x = pow(x, 2, n)
            if x == n - 1:
                skip_to_next = True
                break
        if skip_to_next:
            continue
        return False
    return True

def generate_prime(bits):
    while True:
        candidate = secrets.randbits(bits) | (1 << (bits-1)) | 1
        if is_probable_prime(candidate):
            return candidate

# -------------------------
# Basic number theory utils
# -------------------------
def lcm(a, b):
    return a // math.gcd(a, b) * b

def invmod(a, m):
    """Modular inverse via extended Euclid."""
    g, x, y = extended_gcd(a, m)
    if g != 1:
        raise ValueError("No modular inverse")
    return x % m

def extended_gcd(a, b):
    if b == 0:
        return (a, 1, 0)
    g, x1, y1 = extended_gcd(b, a % b)
    x = y1
    y = x1 - (a // b) * y1
    return (g, x, y)

# -------------------------
# Paillier keygen / encrypt / decrypt
# -------------------------
def paillier_keygen(bits=512):
    """Generate Paillier keypair. bits ~512 is fine for demos; increase for stronger keys."""
    p = generate_prime(bits // 2)
    q = generate_prime(bits // 2)
    while q == p:
        q = generate_prime(bits // 2)
    n = p * q
    n_sq = n * n
    lam = lcm(p - 1, q - 1)
    # Choose g = n + 1 (common choice)
    g = n + 1
    # mu = (L(g^lambda mod n^2))^{-1} mod n
    def L(u): return (u - 1) // n
    x = pow(g, lam, n_sq)
    l_val = L(x)
    mu = invmod(l_val, n)
    pub = (n, g)
    priv = (lam, mu)
    return pub, priv

def paillier_encrypt(pub, m):
    """Encrypt integer m with pub=(n,g). Returns ciphertext c mod n^2."""
    n, g = pub
    n_sq = n * n
    if not (0 <= m < n):
        # For demo: we require 0 <= m < n. Use modular mapping for negatives or scaling for larger ranges.
        m = m % n
    # pick random r in [1, n-1] coprime with n
    while True:
        r = secrets.randbelow(n)
        if r > 0 and math.gcd(r, n) == 1:
            break
    c = (pow(g, m, n_sq) * pow(r, n, n_sq)) % n_sq
    return c

def paillier_decrypt(pub, priv, c):
    n, g = pub
    lam, mu = priv
    n_sq = n * n
    def L(u): return (u - 1) // n
    x = pow(c, lam, n_sq)
    l_val = L(x)
    m = (l_val * mu) % n
    # interpret m as integer in [0, n-1]; caller may map back to signed/float via scaling
    return m

# -------------------------
# Homomorphic operations (on ciphertexts)
# -------------------------
def e_add(pub, c1, c2):
    """Homomorphic addition: E(a) * E(b) = E(a+b)"""
    n_sq = pub[0] * pub[0]
    return (c1 * c2) % n_sq

def e_add_const(pub, c, k):
    """Add plaintext k to ciphertext: E(a) * g^k = E(a+k)."""
    n, g = pub
    n_sq = n * n
    return (c * pow(g, k % n, n_sq)) % n_sq

def e_mul_const(pub, c, k):
    """Multiply ciphertext by plaintext k: E(a)^k = E(k*a)"""
    n_sq = pub[0] * pub[0]
    # pow(c,k,n^2) computes encryption of k*a modulo n
    return pow(c, k, n_sq)

# -------------------------
# Utility: scaling floats to integers and back
# -------------------------
def encode_number(x, scale):
    """Encode float x as integer by scaling: round(x * scale)."""
    return int(round(x * scale))

def decode_number(m_enc, scale, n):
    """Decode integer (mod n) into signed integer then float."""
    # m_enc in [0, n-1]. Interpret as signed if above n/2.
    if m_enc > n//2:
        m = m_enc - n
    else:
        m = m_enc
    return float(m) / scale

# -------------------------
# Demo scenario functions
# -------------------------
def salary_processing_demo(salaries, bonus_pct, bits=512, scale=1):
    """
    salaries: list of integers (or floats if scale>1)
    bonus_pct: e.g., 10 means 10% bonus -> multiply by 1.10 (handled via integer scaling)
    scale: factor to convert floats to ints (1 if integers)
    """
    # Key generation (Client side)
    pub, priv = paillier_keygen(bits)
    n = pub[0]

    # Client encrypts salaries (and sends ciphertexts to Proxy)
    enc_salaries = [paillier_encrypt(pub, encode_number(s, scale)) for s in salaries]

    # Proxy: compute total payout after bonus: sum(salaries * 1.0 + bonus)
    # Implement bonus by scalar multiplication by (100 + bonus_pct)/100. Because Paillier scalar must be integer,
    # use integer scaled multiplier: m = int(round((100+bonus_pct)/100 * scale_multiplier))
    # Simpler approach: compute bonus as salary * bonus_pct/100 -> multiply ciphertext by bonus_pct and divide later via decoding.

    # For demo: compute total after  (payout = sum(salary) * (100 + bonus_pct) / 100 )
    total_cipher = None
    for c in enc_salaries:
        if total_cipher is None:
            total_cipher = c
        else:
            total_cipher = e_add(pub, total_cipher, c)

    # Multiply total by (100 + bonus_pct) -> we'll keep the denominator 100 to decode as fraction
    multiplier = 100 + int(round(bonus_pct))
    # We compute E(total * multiplier). To later divide by 100, we use scaling in decode.
    total_mult_cipher = e_mul_const(pub, total_cipher, multiplier)

    # Send to Receiver (who has priv)
    decrypted = paillier_decrypt(pub, priv, total_mult_cipher)
    # Now decode: original totals were scaled by `scale`. Also we multiplied by multiplier (and denominator 100).
    total_value = decode_number(decrypted, scale * 1, n) / 100.0

    return {
        "pub": pub, "priv": priv,
        "encrypted_salaries": enc_salaries,
        "total_after_bonus_decrypted": total_value
    }

def risk_scoring_demo(features, weights, bits=512, scale=1000):
    """
    features: list of floats (e.g., age, bmi,...)
    weights: same-length list of floats (weights sum to 1)
    scale: scales floats to integers to keep fractional precision
    Computes weighted sum homomorphically:
      score = sum_i features[i] * weights[i]
    Approach: client encrypts each feature scaled by 'scale'. Proxy multiplies each encrypted feature by integer(weight*scale2)
    We'll use two-scale approach to keep precision.
    """
    if len(features) != len(weights):
        raise ValueError("features and weights must align")

    pub, priv = paillier_keygen(bits)
    n = pub[0]

    # Choose a secondary scale for weights to convert them to integers
    wscale = 10000  # weight scaling
    # Client encodes features scaled
    enc_feats = [paillier_encrypt(pub, encode_number(f, scale)) for f in features]

    # Proxy: compute weighted sum = sum( feature * weight )
    # For each i: E(feature_scaled) ^ (int(weight * wscale)) = E(feature_scaled * w_int)
    # After summing, we'd decode dividing by (scale * wscale)
    weighted_sum_cipher = None
    for c, w in zip(enc_feats, weights):
        w_int = int(round(w * wscale))
        term = e_mul_const(pub, c, w_int)  # E(feature_scaled * w_int)
        if weighted_sum_cipher is None:
            weighted_sum_cipher = term
        else:
            weighted_sum_cipher = e_add(pub, weighted_sum_cipher, term)

    # Decrypt
    decrypted = paillier_decrypt(pub, priv, weighted_sum_cipher)
    score = decode_number(decrypted, scale * wscale, n)
    return {
        "pub": pub, "priv": priv,
        "encrypted_features": enc_feats,
        "risk_score": score
    }

def student_marks_analysis_demo(marks, bits=512, scale=1):
    """
    marks: list of integers (0..100). For variance we need sum of squares too.
    Paillier cannot multiply ciphertext by ciphertext. So client must also upload encrypted squares.
    Proxy computes mean and variance on encrypted sums.
    """
    pub, priv = paillier_keygen(bits)
    n = pub[0]

    # Client encrypts marks and marks^2
    enc_marks = [paillier_encrypt(pub, encode_number(m, scale)) for m in marks]
    enc_squares = [paillier_encrypt(pub, encode_number(m*m, scale)) for m in marks]

    # Proxy sums
    total_cipher = None
    total_sq_cipher = None
    for c in enc_marks:
        total_cipher = c if total_cipher is None else e_add(pub, total_cipher, c)
    for c in enc_squares:
        total_sq_cipher = c if total_sq_cipher is None else e_add(pub, total_sq_cipher, c)

    # Decrypt sums
    total = paillier_decrypt(pub, priv, total_cipher)
    total_sq = paillier_decrypt(pub, priv, total_sq_cipher)

    n_students = len(marks)
    mean = decode_number(total, scale, n) / n_students
    mean_sq = decode_number(total_sq, scale, n) / n_students
    variance = mean_sq - mean*mean
    return {
        "pub": pub, "priv": priv,
        "mean": mean,
        "variance": variance
    }

def power_usage_metrics_demo(usages, bits=512, scale=1):
    """
    usages: list of integers or floats (kWh). Returns total and average computed homomorphically.
    """
    pub, priv = paillier_keygen(bits)
    n = pub[0]
    enc = [paillier_encrypt(pub, encode_number(u, scale)) for u in usages]
    total_cipher = None
    for c in enc:
        total_cipher = c if total_cipher is None else e_add(pub, total_cipher, c)
    # Decrypt total
    total = paillier_decrypt(pub, priv, total_cipher)
    total_value = decode_number(total, scale, n)
    average_value = total_value / len(usages)
    return {
        "pub": pub, "priv": priv,
        "total_kwh": total_value,
        "avg_kwh": average_value
    }

# -------------------------
# Quick example runs / prints
# -------------------------
if __name__ == "__main__":
    print("=== Salary processing demo ===")
    salaries = [50000, 70000, 90000]
    res = salary_processing_demo(salaries, bonus_pct=10, bits=512, scale=1)
    print("Salaries:", salaries)
    print("Total after 10% bonus (decrypted):", res["total_after_bonus_decrypted"])

    print("\n=== Risk scoring demo ===")
    features = [45, 28.5, 180.0]   # e.g., age, BMI, cholesterol
    weights = [0.3, 0.3, 0.4]
    r = risk_scoring_demo(features, weights, bits=512, scale=100)
    print("Risk score (decrypted):", r["risk_score"])

    print("\n=== Student marks analysis demo ===")
    marks = [85, 90, 70, 95]
    s = student_marks_analysis_demo(marks, bits=512, scale=1)
    print("Mean:", s["mean"])
    print("Variance:", s["variance"])

    print("\n=== Power usage metrics demo ===")
    usages = [12.5, 9.8, 14.0, 11.6]  # kWh (floats)
    p = power_usage_metrics_demo(usages, bits=512, scale=100)  # scale to preserve decimals
    print("Total kWh:", p["total_kwh"])
    print("Average kWh:", p["avg_kwh"])
